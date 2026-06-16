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
    BUILTIN_OBJ = "BUILTIN"
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

export type BuiltinFunction = (...args: Obj[]) => Obj;

export class Builtin implements Obj {
    fn: BuiltinFunction;
    constructor(fn: BuiltinFunction) { this.fn = fn; }
    type(): ObjectType { return ObjectType.BUILTIN_OBJ; }
    inspect(): string { return "builtin function"; }
}
