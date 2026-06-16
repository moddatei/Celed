import { Token, TokenType } from "./token";
import { Lexer } from "./lexer";
import {
    Program, Statement, ExpressionStatement, AssignStatement,
    Expression, Identifier, IntegerLiteral, StringLiteral,
    InfixExpression, BlockStatement, IfExpression, FunctionLiteral,
    CallExpression, PipelineExpression
} from "./ast";

enum Precedence {
    LOWEST = 1,
    PIPE,
    EQUALS,
    SUM,
    PRODUCT,
    CALL
}

const precedences: Record<TokenType, Precedence> = {
    [TokenType.PIPE]: Precedence.PIPE,
    [TokenType.EQUALS]: Precedence.EQUALS,
    [TokenType.PLUS]: Precedence.SUM,
    [TokenType.MINUS]: Precedence.SUM,
    [TokenType.SLASH]: Precedence.PRODUCT,
    [TokenType.STAR]: Precedence.PRODUCT,
    [TokenType.LPAREN]: Precedence.CALL,
} as any;

type PrefixParseFn = () => Expression | null;
type InfixParseFn = (left: Expression) => Expression | null;

export class Parser {
    private lexer: Lexer;
    private curToken!: Token;
    private peekToken!: Token;
    private errors: string[] = [];

    private prefixParseFns: Map<TokenType, PrefixParseFn>;
    private infixParseFns: Map<TokenType, InfixParseFn>;

    constructor(lexer: Lexer) {
        this.lexer = lexer;
        this.prefixParseFns = new Map();
        this.infixParseFns = new Map();

        this.registerPrefix(TokenType.IDENTIFIER, this.parseIdentifier.bind(this));
        this.registerPrefix(TokenType.NUMBER, this.parseIntegerLiteral.bind(this));
        this.registerPrefix(TokenType.STRING, this.parseStringLiteral.bind(this));
        this.registerPrefix(TokenType.LPAREN, this.parseGroupedExpression.bind(this));
        this.registerPrefix(TokenType.IF, this.parseIfExpression.bind(this));

        this.registerInfix(TokenType.PLUS, this.parseInfixExpression.bind(this));
        this.registerInfix(TokenType.MINUS, this.parseInfixExpression.bind(this));
        this.registerInfix(TokenType.SLASH, this.parseInfixExpression.bind(this));
        this.registerInfix(TokenType.STAR, this.parseInfixExpression.bind(this));
        this.registerInfix(TokenType.EQUALS, this.parseInfixExpression.bind(this));
        this.registerInfix(TokenType.LPAREN, this.parseCallExpression.bind(this));
        this.registerInfix(TokenType.ARROW, this.parseFunctionLiteral.bind(this));
        this.registerInfix(TokenType.PIPE, this.parsePipelineExpression.bind(this));

        this.nextToken();
        this.nextToken();
    }

    public getErrors(): string[] {
        return this.errors;
    }

    private nextToken(): void {
        this.curToken = this.peekToken;
        this.peekToken = this.lexer.nextToken();
    }

    public parseProgram(): Program {
        const program = new Program();
        while (this.curToken.type !== TokenType.EOF) {
            const stmt = this.parseStatement();
            if (stmt !== null) {
                program.statements.push(stmt);
            }
            this.nextToken();
        }
        return program;
    }

    private parseStatement(): Statement | null {
        if (this.curToken.type === TokenType.IDENTIFIER && this.peekToken.type === TokenType.ASSIGN) {
            return this.parseAssignStatement();
        }
        return this.parseExpressionStatement();
    }

    private parseAssignStatement(): AssignStatement | null {
        const nameToken = this.curToken;
        const name = new Identifier(nameToken, nameToken.literal);
        const stmt = new AssignStatement(this.peekToken, name);
        this.nextToken(); 
        this.nextToken(); 
        stmt.value = this.parseExpression(Precedence.LOWEST);
        return stmt;
    }

    private parseExpressionStatement(): ExpressionStatement | null {
        const stmt = new ExpressionStatement(this.curToken);
        stmt.expression = this.parseExpression(Precedence.LOWEST);
        return stmt;
    }

    private parseExpression(precedence: Precedence): Expression | null {
        const prefix = this.prefixParseFns.get(this.curToken.type);
        if (!prefix) {
            return null;
        }
        let leftExp = prefix();

        while (this.peekToken.type !== TokenType.EOF && precedence < this.peekPrecedence()) {
            const infix = this.infixParseFns.get(this.peekToken.type);
            if (!infix) {
                return leftExp;
            }
            this.nextToken();
            leftExp = infix(leftExp!);
        }
        return leftExp;
    }

    private parseIdentifier(): Expression {
        return new Identifier(this.curToken, this.curToken.literal);
    }

    private parseIntegerLiteral(): Expression {
        return new IntegerLiteral(this.curToken, parseInt(this.curToken.literal, 10));
    }

    private parseStringLiteral(): Expression {
        return new StringLiteral(this.curToken, this.curToken.literal);
    }

    private parseGroupedExpression(): Expression | null {
        this.nextToken();
        const exp = this.parseExpression(Precedence.LOWEST);
        if (!this.expectPeek(TokenType.RPAREN)) {
            return null;
        }
        return exp;
    }

    private parseIfExpression(): Expression | null {
        const expression = new IfExpression(this.curToken);
        this.nextToken();
        expression.condition = this.parseExpression(Precedence.LOWEST);
        if (!this.expectPeek(TokenType.LBRACE)) {
            return null;
        }
        expression.consequence = this.parseBlockStatement();

        if (this.peekToken.type === TokenType.ELSE) {
            this.nextToken();
            if (this.peekToken.type === TokenType.IF) {
                this.nextToken();
                expression.alternative = this.parseIfExpression();
            } else {
                if (!this.expectPeek(TokenType.LBRACE)) {
                    return null;
                }
                expression.alternative = this.parseBlockStatement();
            }
        }
        return expression;
    }

    private parseBlockStatement(): BlockStatement {
        const block = new BlockStatement(this.curToken);
        this.nextToken();
        while (this.curToken.type !== TokenType.RBRACE && this.curToken.type !== TokenType.EOF) {
            const stmt = this.parseStatement();
            if (stmt !== null) {
                block.statements.push(stmt);
            }
            this.nextToken();
        }
        return block;
    }

    private parseInfixExpression(left: Expression): Expression {
        const expression = new InfixExpression(this.curToken, left, this.curToken.literal);
        const precedence = this.curPrecedence();
        this.nextToken();
        expression.right = this.parseExpression(precedence);
        return expression;
    }

    private parseFunctionLiteral(left: Expression): Expression | null {
        const fn = new FunctionLiteral(this.curToken);
        if (left instanceof Identifier) {
            fn.parameters.push(left);
        } else if (left instanceof CallExpression && left.function instanceof Identifier) {
            fn.parameters = [left.function as Identifier, ...(left.args as Identifier[])];
        }
        this.nextToken();
        fn.body = this.parseBlockStatement();
        return fn;
    }

    private parseCallExpression(functionNode: Expression): Expression {
        const exp = new CallExpression(this.curToken, functionNode);
        exp.args = this.parseExpressionList(TokenType.RPAREN);
        return exp;
    }

    private parsePipelineExpression(left: Expression): Expression {
        const exp = new PipelineExpression(this.curToken, left);
        const precedence = this.curPrecedence();
        this.nextToken();
        exp.right = this.parseExpression(precedence);
        return exp;
    }

    private parseExpressionList(end: TokenType): Expression[] {
        const list: Expression[] = [];
        if (this.peekToken.type === end) {
            this.nextToken();
            return list;
        }
        this.nextToken();
        list.push(this.parseExpression(Precedence.LOWEST)!);

        while (this.peekToken.type === TokenType.COMMA) {
            this.nextToken();
            this.nextToken();
            list.push(this.parseExpression(Precedence.LOWEST)!);
        }

        if (!this.expectPeek(end)) {
            return [];
        }

        return list;
    }

    private expectPeek(t: TokenType): boolean {
        if (this.peekToken.type === t) {
            this.nextToken();
            return true;
        } else {
            this.peekError(t);
            return false;
        }
    }

    private peekError(t: TokenType): void {
        this.errors.push(`expected ${t}, got ${this.peekToken.type}`);
    }

    private peekPrecedence(): Precedence {
        return precedences[this.peekToken.type] || Precedence.LOWEST;
    }

    private curPrecedence(): Precedence {
        return precedences[this.curToken.type] || Precedence.LOWEST;
    }

    private registerPrefix(tokenType: TokenType, fn: PrefixParseFn): void {
        this.prefixParseFns.set(tokenType, fn);
    }

    private registerInfix(tokenType: TokenType, fn: InfixParseFn): void {
        this.infixParseFns.set(tokenType, fn);
    }
}
