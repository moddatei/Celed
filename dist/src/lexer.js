"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = void 0;
const token_1 = require("./token");
class Lexer {
    constructor(input) {
        this.position = 0;
        this.readPosition = 0;
        this.ch = "";
        this.input = input;
        this.readChar();
    }
    readChar() {
        if (this.readPosition >= this.input.length) {
            this.ch = "";
        }
        else {
            this.ch = this.input[this.readPosition];
        }
        this.position = this.readPosition;
        this.readPosition += 1;
    }
    peekChar() {
        if (this.readPosition >= this.input.length) {
            return "";
        }
        return this.input[this.readPosition];
    }
    nextToken() {
        this.skipWhitespace();
        let tok;
        switch (this.ch) {
            case ":":
                if (this.peekChar() === "=") {
                    const char = this.ch;
                    this.readChar();
                    tok = { type: token_1.TokenType.ASSIGN, literal: char + this.ch };
                }
                else {
                    tok = { type: token_1.TokenType.COLON, literal: this.ch };
                }
                break;
            case "=":
                if (this.peekChar() === ">") {
                    const char = this.ch;
                    this.readChar();
                    tok = { type: token_1.TokenType.ARROW, literal: char + this.ch };
                }
                else if (this.peekChar() === "=") {
                    const char = this.ch;
                    this.readChar();
                    tok = { type: token_1.TokenType.EQUALS, literal: char + this.ch };
                }
                else {
                    tok = { type: token_1.TokenType.ILLEGAL, literal: this.ch };
                }
                break;
            case "|":
                if (this.peekChar() === ">") {
                    const char = this.ch;
                    this.readChar();
                    tok = { type: token_1.TokenType.PIPE, literal: char + this.ch };
                }
                else {
                    tok = { type: token_1.TokenType.ILLEGAL, literal: this.ch };
                }
                break;
            case "[":
                tok = { type: token_1.TokenType.LBRACKET, literal: this.ch };
                break;
            case "]":
                tok = { type: token_1.TokenType.RBRACKET, literal: this.ch };
                break;
            case "+":
                tok = { type: token_1.TokenType.PLUS, literal: this.ch };
                break;
            case "-":
                tok = { type: token_1.TokenType.MINUS, literal: this.ch };
                break;
            case "*":
                tok = { type: token_1.TokenType.STAR, literal: this.ch };
                break;
            case "/":
                tok = { type: token_1.TokenType.SLASH, literal: this.ch };
                break;
            case "{":
                tok = { type: token_1.TokenType.LBRACE, literal: this.ch };
                break;
            case "}":
                tok = { type: token_1.TokenType.RBRACE, literal: this.ch };
                break;
            case "(":
                tok = { type: token_1.TokenType.LPAREN, literal: this.ch };
                break;
            case ")":
                tok = { type: token_1.TokenType.RPAREN, literal: this.ch };
                break;
            case ",":
                tok = { type: token_1.TokenType.COMMA, literal: this.ch };
                break;
            case "\"":
                tok = { type: token_1.TokenType.STRING, literal: this.readString() };
                break;
            case "":
                tok = { type: token_1.TokenType.EOF, literal: "" };
                break;
            default:
                if (this.isLetter(this.ch)) {
                    const literal = this.readIdentifier();
                    tok = { type: this.lookupIdent(literal), literal };
                    return tok;
                }
                else if (this.isDigit(this.ch)) {
                    tok = { type: token_1.TokenType.NUMBER, literal: this.readNumber() };
                    return tok;
                }
                else {
                    tok = { type: token_1.TokenType.ILLEGAL, literal: this.ch };
                }
        }
        this.readChar();
        return tok;
    }
    readString() {
        const position = this.position + 1;
        while (true) {
            this.readChar();
            if (this.ch === "\"" || this.ch === "") {
                break;
            }
        }
        return this.input.substring(position, this.position);
    }
    readIdentifier() {
        const position = this.position;
        while (this.isLetter(this.ch) || this.isDigit(this.ch)) {
            this.readChar();
        }
        return this.input.substring(position, this.position);
    }
    readNumber() {
        const position = this.position;
        while (this.isDigit(this.ch)) {
            this.readChar();
        }
        return this.input.substring(position, this.position);
    }
    isLetter(ch) {
        return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || ch === "_";
    }
    isDigit(ch) {
        return ch >= "0" && ch <= "9";
    }
    skipWhitespace() {
        while (this.ch === " " || this.ch === "\t" || this.ch === "\n" || this.ch === "\r") {
            this.readChar();
        }
    }
    lookupIdent(ident) {
        switch (ident) {
            case "if": return token_1.TokenType.IF;
            case "else": return token_1.TokenType.ELSE;
            case "return": return token_1.TokenType.RETURN;
            default: return token_1.TokenType.IDENTIFIER;
        }
    }
}
exports.Lexer = Lexer;
