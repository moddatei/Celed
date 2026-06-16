import { Token } from "./token";

export interface Node {
    tokenLiteral(): string;
}

export interface Statement extends Node {
    statementNode(): void;
}

export interface Expression extends Node {
    expressionNode(): void;
}

export class Program implements Node {
    statements: Statement[] = [];

    tokenLiteral(): string {
        if (this.statements.length > 0) {
            return this.statements[0].tokenLiteral();
        } else {
            return "";
        }
    }
}

export class ExpressionStatement implements Statement {
    token: Token;
    expression: Expression | null;

    constructor(token: Token, expression: Expression | null = null) {
        this.token = token;
        this.expression = expression;
    }

    statementNode(): void {}
    tokenLiteral(): string { return this.token.literal; }
}

export class Identifier implements Expression {
    token: Token;
    value: string;

    constructor(token: Token, value: string) {
        this.token = token;
        this.value = value;
    }

    expressionNode(): void {}
    tokenLiteral(): string { return this.token.literal; }
}

export class AssignStatement implements Statement {
    token: Token;
    name: Identifier;
    value: Expression | null;

    constructor(token: Token, name: Identifier, value: Expression | null = null) {
        this.token = token;
        this.name = name;
        this.value = value;
    }

    statementNode(): void {}
    tokenLiteral(): string { return this.token.literal; }
}

export class IntegerLiteral implements Expression {
    token: Token;
    value: number;

    constructor(token: Token, value: number) {
        this.token = token;
        this.value = value;
    }

    expressionNode(): void {}
    tokenLiteral(): string { return this.token.literal; }
}

export class StringLiteral implements Expression {
    token: Token;
    value: string;

    constructor(token: Token, value: string) {
        this.token = token;
        this.value = value;
    }

    expressionNode(): void {}
    tokenLiteral(): string { return this.token.literal; }
}

export class InfixExpression implements Expression {
    token: Token;
    left: Expression;
    operator: string;
    right: Expression | null;

    constructor(token: Token, left: Expression, operator: string, right: Expression | null = null) {
        this.token = token;
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    expressionNode(): void {}
    tokenLiteral(): string { return this.token.literal; }
}

export class BlockStatement implements Statement {
    token: Token;
    statements: Statement[] = [];

    constructor(token: Token) {
        this.token = token;
    }

    statementNode(): void {}
    tokenLiteral(): string { return this.token.literal; }
}

export class IfExpression implements Expression {
    token: Token;
    condition: Expression | null;
    consequence: BlockStatement | null;
    alternative: BlockStatement | IfExpression | null;

    constructor(token: Token, condition: Expression | null = null, consequence: BlockStatement | null = null, alternative: BlockStatement | IfExpression | null = null) {
        this.token = token;
        this.condition = condition;
        this.consequence = consequence;
        this.alternative = alternative;
    }

    expressionNode(): void {}
    tokenLiteral(): string { return this.token.literal; }
}

export class FunctionLiteral implements Expression {
    token: Token;
    parameters: Identifier[] = [];
    body: BlockStatement | null;

    constructor(token: Token, body: BlockStatement | null = null) {
        this.token = token;
        this.body = body;
    }

    expressionNode(): void {}
    tokenLiteral(): string { return this.token.literal; }
}

export class CallExpression implements Expression {
    token: Token;
    function: Expression;
    args: Expression[] = [];

    constructor(token: Token, fn: Expression) {
        this.token = token;
        this.function = fn;
    }

    expressionNode(): void {}
    tokenLiteral(): string { return this.token.literal; }
}

export class PipelineExpression implements Expression {
    token: Token;
    left: Expression;
    right: Expression | null;

    constructor(token: Token, left: Expression, right: Expression | null = null) {
        this.token = token;
        this.left = left;
        this.right = right;
    }

    expressionNode(): void {}
    tokenLiteral(): string { return this.token.literal; }
}
