import { Token, TokenType } from "../lexer/token";
import { Lexer } from "../lexer/lexer";
import {
    Program, Statement, ExpressionStatement, AssignStatement,
    Expression, Identifier, IntegerLiteral, StringLiteral,
    InfixExpression, BlockStatement, IfExpression, FunctionLiteral,
    CallExpression, PipelineExpression, TupleExpression, ArrayLiteral, HashLiteral, IndexExpression, WhileExpression
} from "../ast/ast";

enum Precedence {
    LOWEST = 1,
    LOGICAL_OR,
    LOGICAL_AND,
    ARROW,
    PIPE,
    EQUALS,
    LESSGREATER,
    SUM,
    PRODUCT,
    CALL,
    INDEX
}

const precedences: Record<TokenType, Precedence> = {
    [TokenType.OR]: Precedence.LOGICAL_OR,
    [TokenType.AND]: Precedence.LOGICAL_AND,
    [TokenType.ARROW]: Precedence.ARROW,
    [TokenType.PIPE]: Precedence.PIPE,
    [TokenType.EQUALS]: Precedence.EQUALS,
    [TokenType.NOT_EQ]: Precedence.EQUALS,
    [TokenType.LT]: Precedence.LESSGREATER,
    [TokenType.GT]: Precedence.LESSGREATER,
    [TokenType.LTE]: Precedence.LESSGREATER,
    [TokenType.GTE]: Precedence.LESSGREATER,
    [TokenType.PLUS]: Precedence.SUM,
    [TokenType.MINUS]: Precedence.SUM,
    [TokenType.SLASH]: Precedence.PRODUCT,
    [TokenType.STAR]: Precedence.PRODUCT,
    [TokenType.MOD]: Precedence.PRODUCT,
    [TokenType.LPAREN]: Precedence.CALL,
    [TokenType.LBRACKET]: Precedence.INDEX,
    [TokenType.DOT]: Precedence.INDEX,
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
        this.registerPrefix(TokenType.LBRACKET, this.parseArrayLiteral.bind(this));
        this.registerPrefix(TokenType.LBRACE, this.parseHashLiteral.bind(this));
        this.registerPrefix(TokenType.IF, this.parseIfExpression.bind(this));
        this.registerPrefix(TokenType.WHILE, this.parseWhileExpression.bind(this));

        this.registerInfix(TokenType.PLUS, this.parseInfixExpression.bind(this));
        this.registerInfix(TokenType.PLUS, this.parseInfixExpression.bind(this));
        this.registerInfix(TokenType.MINUS, this.parseInfixExpression.bind(this));
        this.registerInfix(TokenType.STAR, this.parseInfixExpression.bind(this));
        this.registerInfix(TokenType.SLASH, this.parseInfixExpression.bind(this));
        this.registerInfix(TokenType.MOD, this.parseInfixExpression.bind(this));
        this.registerInfix(TokenType.EQUALS, this.parseInfixExpression.bind(this));
        this.registerInfix(TokenType.NOT_EQ, this.parseInfixExpression.bind(this));
        this.registerInfix(TokenType.LT, this.parseInfixExpression.bind(this));
        this.registerInfix(TokenType.GT, this.parseInfixExpression.bind(this));
        this.registerInfix(TokenType.LTE, this.parseInfixExpression.bind(this));
        this.registerInfix(TokenType.GTE, this.parseInfixExpression.bind(this));
        this.registerInfix(TokenType.AND, this.parseInfixExpression.bind(this));
        this.registerInfix(TokenType.OR, this.parseInfixExpression.bind(this));
        this.registerInfix(TokenType.LPAREN, this.parseCallExpression.bind(this));
        this.registerInfix(TokenType.LBRACKET, this.parseIndexExpression.bind(this));
        this.registerInfix(TokenType.DOT, this.parseDotExpression.bind(this));
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
        const token = this.curToken;
        const list = this.parseExpressionList(TokenType.RPAREN);
        if (list.length === 1) {
            return list[0];
        }
        return new TupleExpression(token, list);
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
            if ((this.peekToken.type as TokenType) === TokenType.IF) {
                this.nextToken();
                expression.alternative = this.parseIfExpression() as IfExpression | null;
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
        } else if (left instanceof TupleExpression) {
            fn.parameters = left.elements as Identifier[];
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

    private parseWhileExpression(): Expression | null {
        const token = this.curToken;
        this.nextToken();
        const condition = this.parseExpression(Precedence.LOWEST);
        if (!condition) return null;
        if (!this.expectPeek(TokenType.LBRACE)) return null;
        const body = this.parseBlockStatement();
        return new WhileExpression(token, condition, body);
    }

    private parseArrayLiteral(): Expression {
        const array = new ArrayLiteral(this.curToken);
        array.elements = this.parseExpressionList(TokenType.RBRACKET);
        return array;
    }

    private parseIndexExpression(left: Expression): Expression | null {
        const token = this.curToken;
        this.nextToken();
        const index = this.parseExpression(Precedence.LOWEST);
        if (!index) return null;

        if (!this.expectPeek(TokenType.RBRACKET)) {
            return null;
        }

        return new IndexExpression(token, left, index);
    }

    private parseDotExpression(left: Expression): Expression | null {
        const token = this.curToken;
        this.nextToken(); // consume DOT

        if (this.curToken.type !== TokenType.IDENTIFIER) {
            this.errors.push(`expected IDENTIFIER after DOT, got ${this.curToken.type}`);
            return null;
        }

        const rightToken = { ...this.curToken, type: TokenType.STRING };
        const right = new StringLiteral(rightToken, rightToken.literal);

        return new IndexExpression(token, left, right);
    }

    private parseHashLiteral(): Expression | null {
        const hash = new HashLiteral(this.curToken);
        while ((this.peekToken.type as TokenType) !== TokenType.RBRACE) {
            this.nextToken();
            const key = this.parseExpression(Precedence.LOWEST);
            if (!this.expectPeek(TokenType.COLON)) {
                return null;
            }
            this.nextToken();
            const value = this.parseExpression(Precedence.LOWEST);
            if (key && value) {
                hash.pairs.set(key, value);
            }
            if ((this.peekToken.type as TokenType) !== TokenType.RBRACE && !this.expectPeek(TokenType.COMMA)) {
                return null;
            }
        }
        if (!this.expectPeek(TokenType.RBRACE)) {
            return null;
        }
        return hash;
    }
}
