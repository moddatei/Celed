"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const token_1 = require("./token");
const ast_1 = require("./ast");
var Precedence;
(function (Precedence) {
    Precedence[Precedence["LOWEST"] = 1] = "LOWEST";
    Precedence[Precedence["ARROW"] = 2] = "ARROW";
    Precedence[Precedence["PIPE"] = 3] = "PIPE";
    Precedence[Precedence["EQUALS"] = 4] = "EQUALS";
    Precedence[Precedence["SUM"] = 5] = "SUM";
    Precedence[Precedence["PRODUCT"] = 6] = "PRODUCT";
    Precedence[Precedence["CALL"] = 7] = "CALL";
    Precedence[Precedence["INDEX"] = 8] = "INDEX";
})(Precedence || (Precedence = {}));
const precedences = {
    [token_1.TokenType.ARROW]: Precedence.ARROW,
    [token_1.TokenType.PIPE]: Precedence.PIPE,
    [token_1.TokenType.EQUALS]: Precedence.EQUALS,
    [token_1.TokenType.PLUS]: Precedence.SUM,
    [token_1.TokenType.MINUS]: Precedence.SUM,
    [token_1.TokenType.SLASH]: Precedence.PRODUCT,
    [token_1.TokenType.STAR]: Precedence.PRODUCT,
    [token_1.TokenType.LPAREN]: Precedence.CALL,
    [token_1.TokenType.LBRACKET]: Precedence.INDEX,
};
class Parser {
    constructor(lexer) {
        this.errors = [];
        this.lexer = lexer;
        this.prefixParseFns = new Map();
        this.infixParseFns = new Map();
        this.registerPrefix(token_1.TokenType.IDENTIFIER, this.parseIdentifier.bind(this));
        this.registerPrefix(token_1.TokenType.NUMBER, this.parseIntegerLiteral.bind(this));
        this.registerPrefix(token_1.TokenType.STRING, this.parseStringLiteral.bind(this));
        this.registerPrefix(token_1.TokenType.LPAREN, this.parseGroupedExpression.bind(this));
        this.registerPrefix(token_1.TokenType.LBRACKET, this.parseArrayLiteral.bind(this));
        this.registerPrefix(token_1.TokenType.LBRACE, this.parseHashLiteral.bind(this));
        this.registerPrefix(token_1.TokenType.IF, this.parseIfExpression.bind(this));
        this.registerInfix(token_1.TokenType.PLUS, this.parseInfixExpression.bind(this));
        this.registerInfix(token_1.TokenType.MINUS, this.parseInfixExpression.bind(this));
        this.registerInfix(token_1.TokenType.SLASH, this.parseInfixExpression.bind(this));
        this.registerInfix(token_1.TokenType.STAR, this.parseInfixExpression.bind(this));
        this.registerInfix(token_1.TokenType.EQUALS, this.parseInfixExpression.bind(this));
        this.registerInfix(token_1.TokenType.LPAREN, this.parseCallExpression.bind(this));
        this.registerInfix(token_1.TokenType.LBRACKET, this.parseIndexExpression.bind(this));
        this.registerInfix(token_1.TokenType.ARROW, this.parseFunctionLiteral.bind(this));
        this.registerInfix(token_1.TokenType.PIPE, this.parsePipelineExpression.bind(this));
        this.nextToken();
        this.nextToken();
    }
    getErrors() {
        return this.errors;
    }
    nextToken() {
        this.curToken = this.peekToken;
        this.peekToken = this.lexer.nextToken();
    }
    parseProgram() {
        const program = new ast_1.Program();
        while (this.curToken.type !== token_1.TokenType.EOF) {
            const stmt = this.parseStatement();
            if (stmt !== null) {
                program.statements.push(stmt);
            }
            this.nextToken();
        }
        return program;
    }
    parseStatement() {
        if (this.curToken.type === token_1.TokenType.IDENTIFIER && this.peekToken.type === token_1.TokenType.ASSIGN) {
            return this.parseAssignStatement();
        }
        return this.parseExpressionStatement();
    }
    parseAssignStatement() {
        const nameToken = this.curToken;
        const name = new ast_1.Identifier(nameToken, nameToken.literal);
        const stmt = new ast_1.AssignStatement(this.peekToken, name);
        this.nextToken();
        this.nextToken();
        stmt.value = this.parseExpression(Precedence.LOWEST);
        return stmt;
    }
    parseExpressionStatement() {
        const stmt = new ast_1.ExpressionStatement(this.curToken);
        stmt.expression = this.parseExpression(Precedence.LOWEST);
        return stmt;
    }
    parseExpression(precedence) {
        const prefix = this.prefixParseFns.get(this.curToken.type);
        if (!prefix) {
            return null;
        }
        let leftExp = prefix();
        while (this.peekToken.type !== token_1.TokenType.EOF && precedence < this.peekPrecedence()) {
            const infix = this.infixParseFns.get(this.peekToken.type);
            if (!infix) {
                return leftExp;
            }
            this.nextToken();
            leftExp = infix(leftExp);
        }
        return leftExp;
    }
    parseIdentifier() {
        return new ast_1.Identifier(this.curToken, this.curToken.literal);
    }
    parseIntegerLiteral() {
        return new ast_1.IntegerLiteral(this.curToken, parseInt(this.curToken.literal, 10));
    }
    parseStringLiteral() {
        return new ast_1.StringLiteral(this.curToken, this.curToken.literal);
    }
    parseGroupedExpression() {
        const token = this.curToken;
        const list = this.parseExpressionList(token_1.TokenType.RPAREN);
        if (list.length === 1) {
            return list[0];
        }
        return new ast_1.TupleExpression(token, list);
    }
    parseIfExpression() {
        const expression = new ast_1.IfExpression(this.curToken);
        this.nextToken();
        expression.condition = this.parseExpression(Precedence.LOWEST);
        if (!this.expectPeek(token_1.TokenType.LBRACE)) {
            return null;
        }
        expression.consequence = this.parseBlockStatement();
        if (this.peekToken.type === token_1.TokenType.ELSE) {
            this.nextToken();
            if (this.peekToken.type === token_1.TokenType.IF) {
                this.nextToken();
                expression.alternative = this.parseIfExpression();
            }
            else {
                if (!this.expectPeek(token_1.TokenType.LBRACE)) {
                    return null;
                }
                expression.alternative = this.parseBlockStatement();
            }
        }
        return expression;
    }
    parseBlockStatement() {
        const block = new ast_1.BlockStatement(this.curToken);
        this.nextToken();
        while (this.curToken.type !== token_1.TokenType.RBRACE && this.curToken.type !== token_1.TokenType.EOF) {
            const stmt = this.parseStatement();
            if (stmt !== null) {
                block.statements.push(stmt);
            }
            this.nextToken();
        }
        return block;
    }
    parseInfixExpression(left) {
        const expression = new ast_1.InfixExpression(this.curToken, left, this.curToken.literal);
        const precedence = this.curPrecedence();
        this.nextToken();
        expression.right = this.parseExpression(precedence);
        return expression;
    }
    parseFunctionLiteral(left) {
        const fn = new ast_1.FunctionLiteral(this.curToken);
        if (left instanceof ast_1.Identifier) {
            fn.parameters.push(left);
        }
        else if (left instanceof ast_1.CallExpression && left.function instanceof ast_1.Identifier) {
            fn.parameters = [left.function, ...left.args];
        }
        else if (left instanceof ast_1.TupleExpression) {
            fn.parameters = left.elements;
        }
        this.nextToken();
        fn.body = this.parseBlockStatement();
        return fn;
    }
    parseCallExpression(functionNode) {
        const exp = new ast_1.CallExpression(this.curToken, functionNode);
        exp.args = this.parseExpressionList(token_1.TokenType.RPAREN);
        return exp;
    }
    parsePipelineExpression(left) {
        const exp = new ast_1.PipelineExpression(this.curToken, left);
        const precedence = this.curPrecedence();
        this.nextToken();
        exp.right = this.parseExpression(precedence);
        return exp;
    }
    parseExpressionList(end) {
        const list = [];
        if (this.peekToken.type === end) {
            this.nextToken();
            return list;
        }
        this.nextToken();
        list.push(this.parseExpression(Precedence.LOWEST));
        while (this.peekToken.type === token_1.TokenType.COMMA) {
            this.nextToken();
            this.nextToken();
            list.push(this.parseExpression(Precedence.LOWEST));
        }
        if (!this.expectPeek(end)) {
            return [];
        }
        return list;
    }
    expectPeek(t) {
        if (this.peekToken.type === t) {
            this.nextToken();
            return true;
        }
        else {
            this.peekError(t);
            return false;
        }
    }
    peekError(t) {
        this.errors.push(`expected ${t}, got ${this.peekToken.type}`);
    }
    peekPrecedence() {
        return precedences[this.peekToken.type] || Precedence.LOWEST;
    }
    curPrecedence() {
        return precedences[this.curToken.type] || Precedence.LOWEST;
    }
    registerPrefix(tokenType, fn) {
        this.prefixParseFns.set(tokenType, fn);
    }
    registerInfix(tokenType, fn) {
        this.infixParseFns.set(tokenType, fn);
    }
    parseArrayLiteral() {
        const array = new ast_1.ArrayLiteral(this.curToken);
        array.elements = this.parseExpressionList(token_1.TokenType.RBRACKET);
        return array;
    }
    parseIndexExpression(left) {
        const exp = new ast_1.IndexExpression(this.curToken, left);
        this.nextToken();
        exp.index = this.parseExpression(Precedence.LOWEST);
        if (!this.expectPeek(token_1.TokenType.RBRACKET)) {
            return null;
        }
        return exp;
    }
    parseHashLiteral() {
        const hash = new ast_1.HashLiteral(this.curToken);
        while (this.peekToken.type !== token_1.TokenType.RBRACE) {
            this.nextToken();
            const key = this.parseExpression(Precedence.LOWEST);
            if (!this.expectPeek(token_1.TokenType.COLON)) {
                return null;
            }
            this.nextToken();
            const value = this.parseExpression(Precedence.LOWEST);
            if (key && value) {
                hash.pairs.set(key, value);
            }
            if (this.peekToken.type !== token_1.TokenType.RBRACE && !this.expectPeek(token_1.TokenType.COMMA)) {
                return null;
            }
        }
        if (!this.expectPeek(token_1.TokenType.RBRACE)) {
            return null;
        }
        return hash;
    }
}
exports.Parser = Parser;
