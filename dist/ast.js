"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashLiteral = exports.IndexExpression = exports.ArrayLiteral = exports.TupleExpression = exports.PipelineExpression = exports.CallExpression = exports.FunctionLiteral = exports.IfExpression = exports.BlockStatement = exports.InfixExpression = exports.StringLiteral = exports.IntegerLiteral = exports.AssignStatement = exports.Identifier = exports.ExpressionStatement = exports.Program = void 0;
class Program {
    constructor() {
        this.statements = [];
    }
    tokenLiteral() {
        if (this.statements.length > 0) {
            return this.statements[0].tokenLiteral();
        }
        else {
            return "";
        }
    }
}
exports.Program = Program;
class ExpressionStatement {
    constructor(token, expression = null) {
        this.token = token;
        this.expression = expression;
    }
    statementNode() { }
    tokenLiteral() { return this.token.literal; }
}
exports.ExpressionStatement = ExpressionStatement;
class Identifier {
    constructor(token, value) {
        this.token = token;
        this.value = value;
    }
    expressionNode() { }
    tokenLiteral() { return this.token.literal; }
}
exports.Identifier = Identifier;
class AssignStatement {
    constructor(token, name, value = null) {
        this.token = token;
        this.name = name;
        this.value = value;
    }
    statementNode() { }
    tokenLiteral() { return this.token.literal; }
}
exports.AssignStatement = AssignStatement;
class IntegerLiteral {
    constructor(token, value) {
        this.token = token;
        this.value = value;
    }
    expressionNode() { }
    tokenLiteral() { return this.token.literal; }
}
exports.IntegerLiteral = IntegerLiteral;
class StringLiteral {
    constructor(token, value) {
        this.token = token;
        this.value = value;
    }
    expressionNode() { }
    tokenLiteral() { return this.token.literal; }
}
exports.StringLiteral = StringLiteral;
class InfixExpression {
    constructor(token, left, operator, right = null) {
        this.token = token;
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    expressionNode() { }
    tokenLiteral() { return this.token.literal; }
}
exports.InfixExpression = InfixExpression;
class BlockStatement {
    constructor(token) {
        this.statements = [];
        this.token = token;
    }
    statementNode() { }
    tokenLiteral() { return this.token.literal; }
}
exports.BlockStatement = BlockStatement;
class IfExpression {
    constructor(token, condition = null, consequence = null, alternative = null) {
        this.token = token;
        this.condition = condition;
        this.consequence = consequence;
        this.alternative = alternative;
    }
    expressionNode() { }
    tokenLiteral() { return this.token.literal; }
}
exports.IfExpression = IfExpression;
class FunctionLiteral {
    constructor(token, body = null) {
        this.parameters = [];
        this.token = token;
        this.body = body;
    }
    expressionNode() { }
    tokenLiteral() { return this.token.literal; }
}
exports.FunctionLiteral = FunctionLiteral;
class CallExpression {
    constructor(token, fn) {
        this.args = [];
        this.token = token;
        this.function = fn;
    }
    expressionNode() { }
    tokenLiteral() { return this.token.literal; }
}
exports.CallExpression = CallExpression;
class PipelineExpression {
    constructor(token, left, right = null) {
        this.token = token;
        this.left = left;
        this.right = right;
    }
    expressionNode() { }
    tokenLiteral() { return this.token.literal; }
}
exports.PipelineExpression = PipelineExpression;
class TupleExpression {
    constructor(token, elements = []) {
        this.elements = [];
        this.token = token;
        this.elements = elements;
    }
    expressionNode() { }
    tokenLiteral() { return this.token.literal; }
}
exports.TupleExpression = TupleExpression;
class ArrayLiteral {
    constructor(token, elements = []) {
        this.elements = [];
        this.token = token;
        this.elements = elements;
    }
    expressionNode() { }
    tokenLiteral() { return this.token.literal; }
}
exports.ArrayLiteral = ArrayLiteral;
class IndexExpression {
    constructor(token, left, index = null) {
        this.token = token;
        this.left = left;
        this.index = index;
    }
    expressionNode() { }
    tokenLiteral() { return this.token.literal; }
}
exports.IndexExpression = IndexExpression;
class HashLiteral {
    constructor(token) {
        this.token = token;
        this.pairs = new Map();
    }
    expressionNode() { }
    tokenLiteral() { return this.token.literal; }
}
exports.HashLiteral = HashLiteral;
