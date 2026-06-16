"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashObj = exports.HashPair = exports.ArrayObj = exports.Builtin = exports.FunctionObj = exports.ErrorObj = exports.ReturnValue = exports.Null = exports.BooleanObj = exports.StringObj = exports.Integer = exports.ObjectType = void 0;
var ObjectType;
(function (ObjectType) {
    ObjectType["INTEGER_OBJ"] = "INTEGER";
    ObjectType["STRING_OBJ"] = "STRING";
    ObjectType["BOOLEAN_OBJ"] = "BOOLEAN";
    ObjectType["NULL_OBJ"] = "NULL";
    ObjectType["RETURN_VALUE_OBJ"] = "RETURN_VALUE";
    ObjectType["ERROR_OBJ"] = "ERROR";
    ObjectType["FUNCTION_OBJ"] = "FUNCTION";
    ObjectType["BUILTIN_OBJ"] = "BUILTIN";
    ObjectType["ARRAY_OBJ"] = "ARRAY";
    ObjectType["HASH_OBJ"] = "HASH";
})(ObjectType || (exports.ObjectType = ObjectType = {}));
class Integer {
    constructor(value) { this.value = value; }
    type() { return ObjectType.INTEGER_OBJ; }
    inspect() { return this.value.toString(); }
}
exports.Integer = Integer;
class StringObj {
    constructor(value) { this.value = value; }
    type() { return ObjectType.STRING_OBJ; }
    inspect() { return this.value; }
}
exports.StringObj = StringObj;
class BooleanObj {
    constructor(value) { this.value = value; }
    type() { return ObjectType.BOOLEAN_OBJ; }
    inspect() { return this.value.toString(); }
}
exports.BooleanObj = BooleanObj;
class Null {
    type() { return ObjectType.NULL_OBJ; }
    inspect() { return "null"; }
}
exports.Null = Null;
class ReturnValue {
    constructor(value) { this.value = value; }
    type() { return ObjectType.RETURN_VALUE_OBJ; }
    inspect() { return this.value.inspect(); }
}
exports.ReturnValue = ReturnValue;
class ErrorObj {
    constructor(message) { this.message = message; }
    type() { return ObjectType.ERROR_OBJ; }
    inspect() { return "ERROR: " + this.message; }
}
exports.ErrorObj = ErrorObj;
class FunctionObj {
    constructor(parameters, body, env) {
        this.parameters = parameters;
        this.body = body;
        this.env = env;
    }
    type() { return ObjectType.FUNCTION_OBJ; }
    inspect() {
        const params = this.parameters.map(p => p.tokenLiteral()).join(", ");
        return `(${params}) => { ... }`;
    }
}
exports.FunctionObj = FunctionObj;
class Builtin {
    constructor(fn) { this.fn = fn; }
    type() { return ObjectType.BUILTIN_OBJ; }
    inspect() { return "builtin function"; }
}
exports.Builtin = Builtin;
class ArrayObj {
    constructor(elements) { this.elements = elements; }
    type() { return ObjectType.ARRAY_OBJ; }
    inspect() { return `[${this.elements.map(e => e.inspect()).join(", ")}]`; }
}
exports.ArrayObj = ArrayObj;
class HashPair {
    constructor(key, value) { this.key = key; this.value = value; }
}
exports.HashPair = HashPair;
class HashObj {
    constructor(pairs) { this.pairs = pairs; }
    type() { return ObjectType.HASH_OBJ; }
    inspect() {
        const out = [];
        this.pairs.forEach(p => out.push(`${p.key.inspect()}: ${p.value.inspect()}`));
        return `{${out.join(", ")}}`;
    }
}
exports.HashObj = HashObj;
