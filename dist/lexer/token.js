"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keywords = exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    TokenType["IDENTIFIER"] = "IDENTIFIER";
    TokenType["NUMBER"] = "NUMBER";
    TokenType["STRING"] = "STRING";
    TokenType["ASSIGN"] = "ASSIGN";
    TokenType["ARROW"] = "ARROW";
    TokenType["PIPE"] = "PIPE";
    TokenType["LBRACE"] = "LBRACE";
    TokenType["RBRACE"] = "RBRACE";
    TokenType["LBRACKET"] = "LBRACKET";
    TokenType["RBRACKET"] = "RBRACKET";
    TokenType["LPAREN"] = "LPAREN";
    TokenType["RPAREN"] = "RPAREN";
    TokenType["COLON"] = "COLON";
    TokenType["PLUS"] = "PLUS";
    TokenType["MINUS"] = "MINUS";
    TokenType["STAR"] = "STAR";
    TokenType["SLASH"] = "SLASH";
    TokenType["LT"] = "LT";
    TokenType["GT"] = "GT";
    TokenType["LTE"] = "LTE";
    TokenType["GTE"] = "GTE";
    TokenType["EQUALS"] = "EQUALS";
    TokenType["NOT_EQ"] = "NOT_EQ";
    TokenType["MOD"] = "MOD";
    TokenType["AND"] = "AND";
    TokenType["OR"] = "OR";
    TokenType["DOT"] = "DOT";
    TokenType["IF"] = "IF";
    TokenType["ELSE"] = "ELSE";
    TokenType["WHILE"] = "WHILE";
    TokenType["RETURN"] = "RETURN";
    TokenType["EOF"] = "EOF";
    TokenType["ILLEGAL"] = "ILLEGAL";
    TokenType["COMMA"] = "COMMA";
})(TokenType || (exports.TokenType = TokenType = {}));
exports.keywords = {
    "if": TokenType.IF,
    "else": TokenType.ELSE,
    "while": TokenType.WHILE
};
