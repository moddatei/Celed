import { Node, Program, ExpressionStatement, IntegerLiteral, InfixExpression, IfExpression, BlockStatement, AssignStatement, Identifier, FunctionLiteral, CallExpression, PipelineExpression, StringLiteral, Expression, ArrayLiteral, IndexExpression, HashLiteral } from "./ast";
import { Obj, Integer, BooleanObj, Null, ReturnValue, ErrorObj, FunctionObj, Builtin, StringObj, ArrayObj, HashObj, HashPair } from "./object";
import { Environment } from "./environment";

const NULL = new Null();
const TRUE = new BooleanObj(true);
const FALSE = new BooleanObj(false);

function jsToCeledObj(jsObj: any): Obj {
    if (jsObj === null) return NULL;
    if (typeof jsObj === "boolean") return jsObj ? TRUE : FALSE;
    if (typeof jsObj === "number") return new Integer(jsObj);
    if (typeof jsObj === "string") return new StringObj(jsObj);
    if (Array.isArray(jsObj)) {
        return new ArrayObj(jsObj.map(jsToCeledObj));
    }
    if (typeof jsObj === "object") {
        const pairs = new Map<string, HashPair>();
        for (const [k, v] of Object.entries(jsObj)) {
            const keyObj = new StringObj(k);
            const valObj = jsToCeledObj(v);
            pairs.set(k, new HashPair(keyObj, valObj));
        }
        return new HashObj(pairs);
    }
    return NULL;
}

const builtins: Record<string, Builtin> = {
    "print": new Builtin(async (...args: Obj[]) => {
        const out = args.map(a => a.inspect()).join(" ");
        console.log(out);
        return NULL;
    }),
    "fetch": new Builtin(async (...args: Obj[]) => {
        if (args.length !== 1 || !(args[0] instanceof StringObj)) {
            return new ErrorObj("fetch expected 1 string argument");
        }
        try {
            const res = await fetch(args[0].value);
            const text = await res.text();
            return new StringObj(text);
        } catch (e: any) {
            return new ErrorObj(`fetch failed: ${e.message}`);
        }
    }),
    "map": new Builtin(async (...args: Obj[]) => {
        if (args.length !== 2 || !(args[0] instanceof ArrayObj) || !(args[1] instanceof FunctionObj)) {
            return new ErrorObj("map expected array and function");
        }
        const arr = args[0] as ArrayObj;
        const fn = args[1] as FunctionObj;
        const result: Obj[] = [];
        for (const el of arr.elements) {
            const res = await applyFunction(fn, [el]);
            if (isError(res)) return res;
            result.push(res);
        }
        return new ArrayObj(result);
    }),
    "filter": new Builtin(async (...args: Obj[]) => {
        if (args.length !== 2 || !(args[0] instanceof ArrayObj) || !(args[1] instanceof FunctionObj)) {
            return new ErrorObj("filter expected array and function");
        }
        const arr = args[0] as ArrayObj;
        const fn = args[1] as FunctionObj;
        const result: Obj[] = [];
        for (const el of arr.elements) {
            const res = await applyFunction(fn, [el]);
            if (isError(res)) return res;
            if (isTruthy(res)) {
                result.push(el);
            }
        }
        return new ArrayObj(result);
    }),
    "json_parse": new Builtin(async (...args: Obj[]) => {
        if (args.length !== 1 || !(args[0] instanceof StringObj)) return new ErrorObj("json_parse expected 1 string argument");
        try {
            const parsed = JSON.parse(args[0].value);
            return jsToCeledObj(parsed);
        } catch (e: any) {
            return new ErrorObj(`json_parse failed: ${e.message}`);
        }
    })
};

export async function evaluate(node: Node | null, env: Environment): Promise<Obj> {
    if (!node) return NULL;

    if (node instanceof Program) return await evalProgram(node, env);
    if (node instanceof ExpressionStatement) return await evaluate(node.expression, env);
    if (node instanceof IntegerLiteral) return new Integer(node.value);
    if (node instanceof StringLiteral) return new StringObj(node.value);
    if (node instanceof ArrayLiteral) {
        const elements = await evalExpressions(node.elements, env);
        if (elements.length === 1 && isError(elements[0])) return elements[0];
        return new ArrayObj(elements);
    }
    if (node instanceof IndexExpression) {
        const left = await evaluate(node.left, env);
        if (isError(left)) return left;
        const index = await evaluate(node.index, env);
        if (isError(index)) return index;
        return evalIndexExpression(left, index);
    }
    if (node instanceof HashLiteral) {
        return await evalHashLiteral(node, env);
    }
    if (node instanceof BlockStatement) return await evalBlockStatement(node, env);
    if (node instanceof IfExpression) return await evalIfExpression(node, env);
    if (node instanceof InfixExpression) {
        const left = await evaluate(node.left, env);
        if (isError(left)) return left;
        const right = await evaluate(node.right, env);
        if (isError(right)) return right;
        return evalInfixExpression(node.operator, left, right);
    }
    if (node instanceof AssignStatement) {
        const val = await evaluate(node.value, env);
        if (isError(val)) return val;
        env.set(node.name.value, val);
        return val;
    }
    if (node instanceof Identifier) return evalIdentifier(node, env);
    if (node instanceof FunctionLiteral) {
        return new FunctionObj(node.parameters, node.body!, env);
    }
    if (node instanceof CallExpression) {
        const fn = await evaluate(node.function, env);
        if (isError(fn)) return fn;
        const args = await evalExpressions(node.args, env);
        if (args.length === 1 && isError(args[0])) return args[0];
        return await applyFunction(fn, args);
    }
    if (node instanceof PipelineExpression) {
        const left = await evaluate(node.left, env);
        if (isError(left)) return left;
        const fn = await evaluate(node.right, env);
        if (isError(fn)) return fn;
        return await applyFunction(fn, [left]);
    }
    return NULL;
}

async function evalProgram(program: Program, env: Environment): Promise<Obj> {
    let result: Obj = NULL;
    for (const statement of program.statements) {
        result = await evaluate(statement, env);
        if (result instanceof ReturnValue) return result.value;
        if (result instanceof ErrorObj) return result;
    }
    return result;
}

async function evalBlockStatement(block: BlockStatement, env: Environment): Promise<Obj> {
    let result: Obj = NULL;
    for (const statement of block.statements) {
        result = await evaluate(statement, env);
        if (result && (result.type() === "RETURN_VALUE" || result.type() === "ERROR")) {
            return result;
        }
    }
    return result;
}

async function evalHashLiteral(node: HashLiteral, env: Environment): Promise<Obj> {
    const pairs = new Map<string, HashPair>();
    for (const [keyNode, valueNode] of node.pairs.entries()) {
        const key = await evaluate(keyNode, env);
        if (isError(key)) return key;
        let hashKey = "";
        if (key instanceof StringObj) hashKey = key.value;
        else if (key instanceof Integer) hashKey = key.value.toString();
        else return new ErrorObj(`unusable as hash key: ${key.type()}`);

        const value = await evaluate(valueNode, env);
        if (isError(value)) return value;
        pairs.set(hashKey, new HashPair(key, value));
    }
    return new HashObj(pairs);
}

function evalIndexExpression(left: Obj, index: Obj): Obj {
    if (left instanceof ArrayObj && index instanceof Integer) {
        const idx = index.value;
        if (idx < 0 || idx >= left.elements.length) return NULL;
        return left.elements[idx];
    }
    if (left instanceof HashObj) {
        let hashKey = "";
        if (index instanceof StringObj) hashKey = index.value;
        else if (index instanceof Integer) hashKey = index.value.toString();
        else return new ErrorObj(`unusable as hash key: ${index.type()}`);
        
        const pair = left.pairs.get(hashKey);
        if (!pair) return NULL;
        return pair.value;
    }
    return new ErrorObj(`index operator not supported: ${left.type()}`);
}

async function evalIfExpression(ie: IfExpression, env: Environment): Promise<Obj> {
    const condition = await evaluate(ie.condition, env);
    if (isError(condition)) return condition;
    if (isTruthy(condition)) return await evaluate(ie.consequence, env);
    else if (ie.alternative) return await evaluate(ie.alternative, env);
    return NULL;
}

function isTruthy(obj: Obj): boolean {
    if (obj === NULL) return false;
    if (obj === TRUE) return true;
    if (obj === FALSE) return false;
    if (obj instanceof Integer) return obj.value !== 0;
    return true;
}

function evalInfixExpression(operator: string, left: Obj, right: Obj): Obj {
    if (left instanceof Integer && right instanceof Integer) {
        return evalIntegerInfixExpression(operator, left, right);
    }
    if (left instanceof StringObj && right instanceof StringObj) {
        if (operator === "+") return new StringObj(left.value + right.value);
        if (operator === "==") return nativeBoolToBooleanObject(left.value === right.value);
    }
    if (left.type() !== right.type()) return new ErrorObj(`type mismatch: ${left.type()} ${operator} ${right.type()}`);
    return new ErrorObj(`unknown operator: ${left.type()} ${operator} ${right.type()}`);
}

function evalIntegerInfixExpression(operator: string, left: Integer, right: Integer): Obj {
    switch (operator) {
        case "+": return new Integer(left.value + right.value);
        case "-": return new Integer(left.value - right.value);
        case "*": return new Integer(left.value * right.value);
        case "/": return new Integer(left.value / right.value);
        case "==": return nativeBoolToBooleanObject(left.value === right.value);
        default: return new ErrorObj(`unknown operator: INTEGER ${operator} INTEGER`);
    }
}

function nativeBoolToBooleanObject(input: boolean): BooleanObj { return input ? TRUE : FALSE; }

function evalIdentifier(node: Identifier, env: Environment): Obj {
    const val = env.get(node.value);
    if (val) return val;
    const builtin = builtins[node.value];
    if (builtin) return builtin;
    return new ErrorObj(`identifier not found: ${node.value}`);
}

async function evalExpressions(exps: Expression[], env: Environment): Promise<Obj[]> {
    const result: Obj[] = [];
    for (const e of exps) {
        const evaluated = await evaluate(e, env);
        if (isError(evaluated)) return [evaluated];
        result.push(evaluated);
    }
    return result;
}

async function applyFunction(fn: Obj, args: Obj[]): Promise<Obj> {
    if (fn instanceof FunctionObj) {
        const extendedEnv = extendFunctionEnv(fn, args);
        const evaluated = await evaluate(fn.body, extendedEnv);
        return unwrapReturnValue(evaluated);
    }
    if (fn instanceof Builtin) {
        return await fn.fn(...args);
    }
    return new ErrorObj(`not a function: ${fn.type()}`);
}

function extendFunctionEnv(fn: FunctionObj, args: Obj[]): Environment {
    const env = new Environment(fn.env);
    fn.parameters.forEach((param, idx) => { env.set(param.value, args[idx]); });
    return env;
}

function unwrapReturnValue(obj: Obj): Obj {
    if (obj instanceof ReturnValue) return obj.value;
    return obj;
}

function isError(obj: Obj): boolean { return obj ? obj.type() === "ERROR" : false; }
