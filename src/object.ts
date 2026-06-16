import { BlockStatement, Identifier } from "./ast";
import { Environment } from "./environment";

export enum ObjectType {
    INTEGER_OBJ = "INTEGER",
    STRING_OBJ = "STRING",
    BOOLEAN_OBJ = "BOOLEAN",
    NULL_OBJ = "NULL",
    RETURN_VALUE_OBJ = "RETURN_VALUE",
    ERROR_OBJ = "ERROR",
    FUNCTION_OBJ = "FUNCTION",
    BUILTIN_OBJ = "BUILTIN",
    ARRAY_OBJ = "ARRAY",
    HASH_OBJ = "HASH"
}

export interface Obj {
    type(): ObjectType;
    inspect(): string;
}

export class Integer implements Obj {
    value: number;
    constructor(value: number) { this.value = value; }
    type(): ObjectType { return ObjectType.INTEGER_OBJ; }
    inspect(): string { return this.value.toString(); }
}

export class StringObj implements Obj {
    value: string;
    constructor(value: string) { this.value = value; }
    type(): ObjectType { return ObjectType.STRING_OBJ; }
    inspect(): string { return this.value; }
}

export class BooleanObj implements Obj {
    value: boolean;
    constructor(value: boolean) { this.value = value; }
    type(): ObjectType { return ObjectType.BOOLEAN_OBJ; }
    inspect(): string { return this.value.toString(); }
}

export class Null implements Obj {
    type(): ObjectType { return ObjectType.NULL_OBJ; }
    inspect(): string { return "null"; }
}

export class ReturnValue implements Obj {
    value: Obj;
    constructor(value: Obj) { this.value = value; }
    type(): ObjectType { return ObjectType.RETURN_VALUE_OBJ; }
    inspect(): string { return this.value.inspect(); }
}

export class ErrorObj implements Obj {
    message: string;
    constructor(message: string) { this.message = message; }
    type(): ObjectType { return ObjectType.ERROR_OBJ; }
    inspect(): string { return "ERROR: " + this.message; }
}

export class FunctionObj implements Obj {
    parameters: Identifier[];
    body: BlockStatement;
    env: Environment;

    constructor(parameters: Identifier[], body: BlockStatement, env: Environment) {
        this.parameters = parameters;
        this.body = body;
        this.env = env;
    }

    type(): ObjectType { return ObjectType.FUNCTION_OBJ; }
    inspect(): string {
        const params = this.parameters.map(p => p.tokenLiteral()).join(", ");
        return `(${params}) => { ... }`;
    }
}

export type BuiltinFunction = (...args: Obj[]) => Promise<Obj>;

export class Builtin implements Obj {
    fn: BuiltinFunction;
    constructor(fn: BuiltinFunction) { this.fn = fn; }
    type(): ObjectType { return ObjectType.BUILTIN_OBJ; }
    inspect(): string { return "builtin function"; }
}

export class ArrayObj implements Obj {
    elements: Obj[];
    constructor(elements: Obj[]) { this.elements = elements; }
    type(): ObjectType { return ObjectType.ARRAY_OBJ; }
    inspect(): string { return `[${this.elements.map(e => e.inspect()).join(", ")}]`; }
}

export class HashPair {
    key: Obj;
    value: Obj;
    constructor(key: Obj, value: Obj) { this.key = key; this.value = value; }
}

export class HashObj implements Obj {
    pairs: Map<string, HashPair>;
    constructor(pairs: Map<string, HashPair>) { this.pairs = pairs; }
    type(): ObjectType { return ObjectType.HASH_OBJ; }
    inspect(): string {
        const out: string[] = [];
        this.pairs.forEach(p => out.push(`${p.key.inspect()}: ${p.value.inspect()}`));
        return `{${out.join(", ")}}`;
    }
}
