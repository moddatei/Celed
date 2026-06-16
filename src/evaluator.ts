import { Node, Program, ExpressionStatement, IntegerLiteral, InfixExpression, IfExpression, BlockStatement, AssignStatement, Identifier, FunctionLiteral, CallExpression, PipelineExpression, StringLiteral } from "./ast";
import { Obj, Integer, BooleanObj, Null, ReturnValue, ErrorObj, FunctionObj, Builtin, StringObj } from "./object";
import { Environment } from "./environment";

const NULL = new Null();
const TRUE = new BooleanObj(true);
const FALSE = new BooleanObj(false);

const builtins: Record<string, Builtin> = {
    "print": new Builtin((...args: Obj[]) => {
        const out = args.map(a => a.inspect()).join(" ");
        console.log(out);
        return NULL;
    })
};

export function evaluate(node: Node | null, env: Environment): Obj {
    if (!node) return NULL;

    if (node instanceof Program) {
        return evalProgram(node, env);
    }
    if (node instanceof ExpressionStatement) {
        return evaluate(node.expression, env);
    }
    if (node instanceof IntegerLiteral) {
        return new Integer(node.value);
    }
    if (node instanceof StringLiteral) {
        return new StringObj(node.value);
    }
    if (node instanceof BlockStatement) {
        return evalBlockStatement(node, env);
    }
    if (node instanceof IfExpression) {
        return evalIfExpression(node, env);
    }
    if (node instanceof InfixExpression) {
        const left = evaluate(node.left, env);
        if (isError(left)) return left;
        const right = evaluate(node.right, env);
        if (isError(right)) return right;
        return evalInfixExpression(node.operator, left, right);
    }
    if (node instanceof AssignStatement) {
        const val = evaluate(node.value, env);
        if (isError(val)) return val;
        env.set(node.name.value, val);
        return val;
    }
    if (node instanceof Identifier) {
        return evalIdentifier(node, env);
    }
    if (node instanceof FunctionLiteral) {
        const params = node.parameters;
        const body = node.body;
        return new FunctionObj(params, body!, env);
    }
    if (node instanceof CallExpression) {
        const fn = evaluate(node.function, env);
        if (isError(fn)) return fn;
        const args = evalExpressions(node.args, env);
        if (args.length === 1 && isError(args[0])) return args[0];
        return applyFunction(fn, args);
    }
    if (node instanceof PipelineExpression) {
        const left = evaluate(node.left, env);
        if (isError(left)) return left;
        const fn = evaluate(node.right, env);
        if (isError(fn)) return fn;
        return applyFunction(fn, [left]);
    }

    return NULL;
}

function evalProgram(program: Program, env: Environment): Obj {
    let result: Obj = NULL;
    for (const statement of program.statements) {
        result = evaluate(statement, env);
        if (result instanceof ReturnValue) {
            return result.value;
        }
        if (result instanceof ErrorObj) {
            return result;
        }
    }
    return result;
}

function evalBlockStatement(block: BlockStatement, env: Environment): Obj {
    let result: Obj = NULL;
    for (const statement of block.statements) {
        result = evaluate(statement, env);
        if (result && (result.type() === "RETURN_VALUE" || result.type() === "ERROR")) {
            return result;
        }
    }
    return result;
}

function evalIfExpression(ie: IfExpression, env: Environment): Obj {
    const condition = evaluate(ie.condition, env);
    if (isError(condition)) return condition;

    if (isTruthy(condition)) {
        return evaluate(ie.consequence, env);
    } else if (ie.alternative) {
        return evaluate(ie.alternative, env);
    } else {
        return NULL;
    }
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
    if (left instanceof StringObj && right instanceof StringObj && operator === "+") {
        return new StringObj(left.value + right.value);
    }
    if (left.type() !== right.type()) {
        return new ErrorObj(`type mismatch: ${left.type()} ${operator} ${right.type()}`);
    }
    return new ErrorObj(`unknown operator: ${left.type()} ${operator} ${right.type()}`);
}

function evalIntegerInfixExpression(operator: string, left: Integer, right: Integer): Obj {
    const leftVal = left.value;
    const rightVal = right.value;

    switch (operator) {
        case "+": return new Integer(leftVal + rightVal);
        case "-": return new Integer(leftVal - rightVal);
        case "*": return new Integer(leftVal * rightVal);
        case "/": return new Integer(leftVal / rightVal);
        case "==": return nativeBoolToBooleanObject(leftVal === rightVal);
        default: return new ErrorObj(`unknown operator: INTEGER ${operator} INTEGER`);
    }
}

function nativeBoolToBooleanObject(input: boolean): BooleanObj {
    return input ? TRUE : FALSE;
}

function evalIdentifier(node: Identifier, env: Environment): Obj {
    const val = env.get(node.value);
    if (val) {
        return val;
    }
    const builtin = builtins[node.value];
    if (builtin) {
        return builtin;
    }
    return new ErrorObj(`identifier not found: ${node.value}`);
}

function evalExpressions(exps: Expression[], env: Environment): Obj[] {
    const result: Obj[] = [];
    for (const e of exps) {
        const evaluated = evaluate(e, env);
        if (isError(evaluated)) {
            return [evaluated];
        }
        result.push(evaluated);
    }
    return result;
}

function applyFunction(fn: Obj, args: Obj[]): Obj {
    if (fn instanceof FunctionObj) {
        const extendedEnv = extendFunctionEnv(fn, args);
        const evaluated = evaluate(fn.body, extendedEnv);
        return unwrapReturnValue(evaluated);
    }
    if (fn instanceof Builtin) {
        return fn.fn(...args);
    }
    return new ErrorObj(`not a function: ${fn.type()}`);
}

function extendFunctionEnv(fn: FunctionObj, args: Obj[]): Environment {
    const env = new Environment(fn.env);
    fn.parameters.forEach((param, idx) => {
        env.set(param.value, args[idx]);
    });
    return env;
}

function unwrapReturnValue(obj: Obj): Obj {
    if (obj instanceof ReturnValue) {
        return obj.value;
    }
    return obj;
}

function isError(obj: Obj): boolean {
    if (obj) {
        return obj.type() === "ERROR";
    }
    return false;
}
