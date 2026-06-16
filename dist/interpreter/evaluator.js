"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluate = evaluate;
const ast_1 = require("../ast/ast");
const object_1 = require("./object");
const environment_1 = require("./environment");
const fs = __importStar(require("fs"));
const discord_1 = require("../discord/discord");
const NULL = new object_1.Null();
const TRUE = new object_1.BooleanObj(true);
const FALSE = new object_1.BooleanObj(false);
function jsToCeledObj(jsObj) {
    if (jsObj === null)
        return NULL;
    if (typeof jsObj === "boolean")
        return jsObj ? TRUE : FALSE;
    if (typeof jsObj === "number")
        return new object_1.Integer(jsObj);
    if (typeof jsObj === "string")
        return new object_1.StringObj(jsObj);
    if (Array.isArray(jsObj)) {
        return new object_1.ArrayObj(jsObj.map(jsToCeledObj));
    }
    if (typeof jsObj === "object") {
        const pairs = new Map();
        for (const [k, v] of Object.entries(jsObj)) {
            const keyObj = new object_1.StringObj(k);
            const valObj = jsToCeledObj(v);
            pairs.set(k, new object_1.HashPair(keyObj, valObj));
        }
        return new object_1.HashObj(pairs);
    }
    return NULL;
}
const builtins = {
    "print": new object_1.Builtin((...args) => __awaiter(void 0, void 0, void 0, function* () {
        const out = args.map(a => a.inspect()).join(" ");
        console.log(out);
        return NULL;
    })),
    "fetch": new object_1.Builtin((...args) => __awaiter(void 0, void 0, void 0, function* () {
        if (args.length !== 1 || !(args[0] instanceof object_1.StringObj)) {
            return new object_1.ErrorObj("fetch expected 1 string argument");
        }
        try {
            const res = yield fetch(args[0].value);
            const text = yield res.text();
            return new object_1.StringObj(text);
        }
        catch (e) {
            return new object_1.ErrorObj(`fetch failed: ${e.message}`);
        }
    })),
    "map": new object_1.Builtin((...args) => __awaiter(void 0, void 0, void 0, function* () {
        if (args.length !== 2 || !(args[0] instanceof object_1.ArrayObj) || !(args[1] instanceof object_1.FunctionObj)) {
            return new object_1.ErrorObj("map expected array and function");
        }
        const arr = args[0];
        const fn = args[1];
        const result = [];
        for (const el of arr.elements) {
            const res = yield applyFunction(fn, [el]);
            if (isError(res))
                return res;
            result.push(res);
        }
        return new object_1.ArrayObj(result);
    })),
    "filter": new object_1.Builtin((...args) => __awaiter(void 0, void 0, void 0, function* () {
        if (args.length !== 2 || !(args[0] instanceof object_1.ArrayObj) || !(args[1] instanceof object_1.FunctionObj)) {
            return new object_1.ErrorObj("filter expected array and function");
        }
        const arr = args[0];
        const fn = args[1];
        const result = [];
        for (const el of arr.elements) {
            const res = yield applyFunction(fn, [el]);
            if (isError(res))
                return res;
            if (isTruthy(res)) {
                result.push(el);
            }
        }
        return new object_1.ArrayObj(result);
    })),
    "json_parse": new object_1.Builtin((...args) => __awaiter(void 0, void 0, void 0, function* () {
        if (args.length !== 1 || !(args[0] instanceof object_1.StringObj))
            return new object_1.ErrorObj("json_parse expected 1 string argument");
        try {
            const parsed = JSON.parse(args[0].value);
            return jsToCeledObj(parsed);
        }
        catch (e) {
            return new object_1.ErrorObj(`json_parse failed: ${e.message}`);
        }
    })),
    "file_read": new object_1.Builtin((...args) => __awaiter(void 0, void 0, void 0, function* () {
        if (args.length !== 1)
            return new object_1.ErrorObj(`wrong number of arguments. got=${args.length}, want=1`);
        if (!(args[0] instanceof object_1.StringObj))
            return new object_1.ErrorObj(`argument to \`file_read\` must be STRING, got ${args[0].type()}`);
        try {
            const data = fs.readFileSync(args[0].value, 'utf-8');
            return new object_1.StringObj(data);
        }
        catch (e) {
            return new object_1.ErrorObj(`file_read error: ${e.message}`);
        }
    })),
    "file_write": new object_1.Builtin((...args) => __awaiter(void 0, void 0, void 0, function* () {
        if (args.length !== 2)
            return new object_1.ErrorObj(`wrong number of arguments. got=${args.length}, want=2`);
        if (!(args[0] instanceof object_1.StringObj))
            return new object_1.ErrorObj(`first argument to \`file_write\` must be STRING, got ${args[0].type()}`);
        if (!(args[1] instanceof object_1.StringObj))
            return new object_1.ErrorObj(`second argument to \`file_write\` must be STRING, got ${args[1].type()}`);
        try {
            fs.writeFileSync(args[0].value, args[1].value, 'utf-8');
            return nativeBoolToBooleanObject(true);
        }
        catch (e) {
            return new object_1.ErrorObj(`file_write error: ${e.message}`);
        }
    })),
    "discord": new object_1.Builtin((...args) => __awaiter(void 0, void 0, void 0, function* () {
        if (args.length !== 1 || !(args[0] instanceof object_1.StringObj))
            return new object_1.ErrorObj(`discord requires 1 STRING argument (token)`);
        const token = args[0].value;
        const bot = new discord_1.CeledDiscordBot(token);
        const pairs = new Map();
        const connectFn = new object_1.Builtin((...cargs) => __awaiter(void 0, void 0, void 0, function* () {
            bot.connect();
            return NULL;
        }));
        pairs.set("connect", new object_1.HashPair(new object_1.StringObj("connect"), connectFn));
        const onMessageFn = new object_1.Builtin((...margs) => __awaiter(void 0, void 0, void 0, function* () {
            if (margs.length !== 1 || !(margs[0] instanceof object_1.FunctionObj))
                return new object_1.ErrorObj(`onMessage requires 1 FUNCTION argument`);
            const fnObj = margs[0];
            bot.onMessage((msgContent) => {
                const extendedEnv = new environment_1.Environment(fnObj.env);
                if (fnObj.parameters.length > 0) {
                    extendedEnv.set(fnObj.parameters[0].value, new object_1.StringObj(msgContent));
                }
                evaluate(fnObj.body, extendedEnv).catch(console.error);
            });
            return NULL;
        }));
        pairs.set("onMessage", new object_1.HashPair(new object_1.StringObj("onMessage"), onMessageFn));
        return new object_1.HashObj(pairs);
    }))
};
function evaluate(node, env) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!node)
            return NULL;
        if (node instanceof ast_1.Program)
            return yield evalProgram(node, env);
        if (node instanceof ast_1.ExpressionStatement)
            return yield evaluate(node.expression, env);
        if (node instanceof ast_1.IntegerLiteral)
            return new object_1.Integer(node.value);
        if (node instanceof ast_1.StringLiteral)
            return new object_1.StringObj(node.value);
        if (node instanceof ast_1.ArrayLiteral) {
            const elements = yield evalExpressions(node.elements, env);
            if (elements.length === 1 && isError(elements[0]))
                return elements[0];
            return new object_1.ArrayObj(elements);
        }
        if (node instanceof ast_1.IndexExpression) {
            const left = yield evaluate(node.left, env);
            if (isError(left))
                return left;
            const index = yield evaluate(node.index, env);
            if (isError(index))
                return index;
            return evalIndexExpression(left, index);
        }
        if (node instanceof ast_1.HashLiteral) {
            return yield evalHashLiteral(node, env);
        }
        if (node instanceof ast_1.WhileExpression)
            return yield evalWhileExpression(node, env);
        if (node instanceof ast_1.BlockStatement)
            return yield evalBlockStatement(node, env);
        if (node instanceof ast_1.IfExpression)
            return yield evalIfExpression(node, env);
        if (node instanceof ast_1.InfixExpression) {
            const left = yield evaluate(node.left, env);
            if (isError(left))
                return left;
            const right = yield evaluate(node.right, env);
            if (isError(right))
                return right;
            return yield evalInfixExpression(node.operator, left, right);
        }
        if (node instanceof ast_1.AssignStatement) {
            const val = yield evaluate(node.value, env);
            if (isError(val))
                return val;
            env.set(node.name.value, val);
            return val;
        }
        if (node instanceof ast_1.Identifier)
            return evalIdentifier(node, env);
        if (node instanceof ast_1.FunctionLiteral) {
            return new object_1.FunctionObj(node.parameters, node.body, env);
        }
        if (node instanceof ast_1.CallExpression) {
            const fn = yield evaluate(node.function, env);
            if (isError(fn))
                return fn;
            const args = yield evalExpressions(node.args, env);
            if (args.length === 1 && isError(args[0]))
                return args[0];
            return yield applyFunction(fn, args);
        }
        if (node instanceof ast_1.PipelineExpression) {
            const left = yield evaluate(node.left, env);
            if (isError(left))
                return left;
            const fn = yield evaluate(node.right, env);
            if (isError(fn))
                return fn;
            return yield applyFunction(fn, [left]);
        }
        return NULL;
    });
}
function evalProgram(program, env) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = NULL;
        for (const statement of program.statements) {
            result = yield evaluate(statement, env);
            if (result instanceof object_1.ReturnValue)
                return result.value;
            if (result instanceof object_1.ErrorObj)
                return result;
        }
        return result;
    });
}
function evalBlockStatement(block, env) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = NULL;
        for (const statement of block.statements) {
            result = yield evaluate(statement, env);
            if (result && (result.type() === "RETURN_VALUE" || result.type() === "ERROR")) {
                return result;
            }
        }
        return result;
    });
}
function evalHashLiteral(node, env) {
    return __awaiter(this, void 0, void 0, function* () {
        const pairs = new Map();
        for (const [keyNode, valueNode] of node.pairs.entries()) {
            const key = yield evaluate(keyNode, env);
            if (isError(key))
                return key;
            let hashKey = "";
            if (key instanceof object_1.StringObj)
                hashKey = key.value;
            else if (key instanceof object_1.Integer)
                hashKey = key.value.toString();
            else
                return new object_1.ErrorObj(`unusable as hash key: ${key.type()}`);
            const value = yield evaluate(valueNode, env);
            if (isError(value))
                return value;
            pairs.set(hashKey, new object_1.HashPair(key, value));
        }
        return new object_1.HashObj(pairs);
    });
}
function evalIndexExpression(left, index) {
    if (left instanceof object_1.ArrayObj && index instanceof object_1.Integer) {
        const idx = index.value;
        if (idx < 0 || idx >= left.elements.length)
            return NULL;
        return left.elements[idx];
    }
    if (left instanceof object_1.HashObj) {
        let hashKey = "";
        if (index instanceof object_1.StringObj)
            hashKey = index.value;
        else if (index instanceof object_1.Integer)
            hashKey = index.value.toString();
        else
            return new object_1.ErrorObj(`unusable as hash key: ${index.type()}`);
        const pair = left.pairs.get(hashKey);
        if (!pair)
            return NULL;
        return pair.value;
    }
    return new object_1.ErrorObj(`index operator not supported: ${left.type()}`);
}
function evalIfExpression(ie, env) {
    return __awaiter(this, void 0, void 0, function* () {
        const condition = yield evaluate(ie.condition, env);
        if (isError(condition))
            return condition;
        if (isTruthy(condition))
            return yield evaluate(ie.consequence, env);
        else if (ie.alternative)
            return yield evaluate(ie.alternative, env);
        return NULL;
    });
}
function isTruthy(obj) {
    if (obj === NULL)
        return false;
    if (obj === TRUE)
        return true;
    if (obj === FALSE)
        return false;
    if (obj instanceof object_1.Integer)
        return obj.value !== 0;
    return true;
}
function evalInfixExpression(operator, left, right) {
    return __awaiter(this, void 0, void 0, function* () {
        if (operator === "&&")
            return nativeBoolToBooleanObject(isTruthy(left) && isTruthy(right));
        if (operator === "||")
            return nativeBoolToBooleanObject(isTruthy(left) || isTruthy(right));
        if (left.type() === "INTEGER" && right.type() === "INTEGER") {
            return evalIntegerInfixExpression(operator, left, right);
        }
        if (operator === "==") {
            return nativeBoolToBooleanObject(left === right);
        }
        if (operator === "!=") {
            return nativeBoolToBooleanObject(left !== right);
        }
        if (left.type() !== right.type()) {
            return new object_1.ErrorObj(`type mismatch: ${left.type()} ${operator} ${right.type()}`);
        }
        return new object_1.ErrorObj(`unknown operator: ${left.type()} ${operator} ${right.type()}`);
    });
}
function evalIntegerInfixExpression(operator, left, right) {
    switch (operator) {
        case "+": return new object_1.Integer(left.value + right.value);
        case "-": return new object_1.Integer(left.value - right.value);
        case "*": return new object_1.Integer(left.value * right.value);
        case "/": return new object_1.Integer(left.value / right.value);
        case "%": return new object_1.Integer(left.value % right.value);
        case "<": return nativeBoolToBooleanObject(left.value < right.value);
        case ">": return nativeBoolToBooleanObject(left.value > right.value);
        case "<=": return nativeBoolToBooleanObject(left.value <= right.value);
        case ">=": return nativeBoolToBooleanObject(left.value >= right.value);
        case "==": return nativeBoolToBooleanObject(left.value === right.value);
        case "!=": return nativeBoolToBooleanObject(left.value !== right.value);
        default: return new object_1.ErrorObj(`unknown operator: INTEGER ${operator} INTEGER`);
    }
}
function nativeBoolToBooleanObject(input) { return input ? TRUE : FALSE; }
function evalIdentifier(node, env) {
    const val = env.get(node.value);
    if (val)
        return val;
    const builtin = builtins[node.value];
    if (builtin)
        return builtin;
    return new object_1.ErrorObj(`identifier not found: ${node.value}`);
}
function evalExpressions(exps, env) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = [];
        for (const e of exps) {
            const evaluated = yield evaluate(e, env);
            if (isError(evaluated))
                return [evaluated];
            result.push(evaluated);
        }
        return result;
    });
}
function applyFunction(fn, args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (fn instanceof object_1.FunctionObj) {
            const extendedEnv = extendFunctionEnv(fn, args);
            const evaluated = yield evaluate(fn.body, extendedEnv);
            return unwrapReturnValue(evaluated);
        }
        if (fn instanceof object_1.Builtin) {
            return yield fn.fn(...args);
        }
        return new object_1.ErrorObj(`not a function: ${fn.type()}`);
    });
}
function extendFunctionEnv(fn, args) {
    const env = new environment_1.Environment(fn.env);
    fn.parameters.forEach((param, idx) => { env.set(param.value, args[idx]); });
    return env;
}
function unwrapReturnValue(obj) {
    if (obj instanceof object_1.ReturnValue)
        return obj.value;
    return obj;
}
function isError(obj) { return obj ? obj.type() === "ERROR" : false; }
function evalWhileExpression(we, env) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = NULL;
        while (true) {
            const condition = yield evaluate(we.condition, env);
            if (isError(condition))
                return condition;
            if (!isTruthy(condition))
                break;
            result = yield evaluate(we.body, env);
            if (result && (result.type() === "RETURN_VALUE" || result.type() === "ERROR")) {
                return result;
            }
        }
        return result;
    });
}
