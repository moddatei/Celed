import { Token, TokenType } from "./token";

export class Lexer {
    private input: string;
    private position: number = 0;
    private readPosition: number = 0;
    private ch: string = "";

    constructor(input: string) {
        this.input = input;
        this.readChar();
    }

    private readChar(): void {
        if (this.readPosition >= this.input.length) {
            this.ch = "";
        } else {
            this.ch = this.input[this.readPosition];
        }
        this.position = this.readPosition;
        this.readPosition += 1;
    }

    private peekChar(): string {
        if (this.readPosition >= this.input.length) {
            return "";
        }
        return this.input[this.readPosition];
    }

    public nextToken(): Token {
        this.skipWhitespace();
        let tok: Token;

        switch (this.ch) {
            case ":":
                if (this.peekChar() === "=") {
                    const char = this.ch;
                    this.readChar();
                    tok = { type: TokenType.ASSIGN, literal: char + this.ch };
                } else {
                    tok = { type: TokenType.COLON, literal: this.ch };
                }
                break;
            case "=":
                if (this.peekChar() === ">") {
                    const char = this.ch;
                    this.readChar();
                    tok = { type: TokenType.ARROW, literal: char + this.ch };
                } else if (this.peekChar() === "=") {
                    const char = this.ch;
                    this.readChar();
                    tok = { type: TokenType.EQUALS, literal: char + this.ch };
                } else {
                    tok = { type: TokenType.ILLEGAL, literal: this.ch };
                }
                break;
            case "|":
                if (this.peekChar() === ">") {
                    const char = this.ch;
                    this.readChar();
                    tok = { type: TokenType.PIPE, literal: char + this.ch };
                } else if (this.peekChar() === "|") {
                    const char = this.ch;
                    this.readChar();
                    tok = { type: TokenType.OR, literal: char + this.ch };
                } else {
                    tok = { type: TokenType.ILLEGAL, literal: this.ch };
                }
                break;
            case "&":
                if (this.peekChar() === "&") {
                    const char = this.ch;
                    this.readChar();
                    tok = { type: TokenType.AND, literal: char + this.ch };
                } else {
                    tok = { type: TokenType.ILLEGAL, literal: this.ch };
                }
                break;
            case "!":
                if (this.peekChar() === "=") {
                    const char = this.ch;
                    this.readChar();
                    tok = { type: TokenType.NOT_EQ, literal: char + this.ch };
                } else {
                    tok = { type: TokenType.ILLEGAL, literal: this.ch };
                }
                break;
            case "[": tok = { type: TokenType.LBRACKET, literal: this.ch }; break;
            case "]": tok = { type: TokenType.RBRACKET, literal: this.ch }; break;
            case "+": tok = { type: TokenType.PLUS, literal: this.ch }; break;
            case "-": tok = { type: TokenType.MINUS, literal: this.ch }; break;
            case "*": tok = { type: TokenType.STAR, literal: this.ch }; break;
            case "/": tok = { type: TokenType.SLASH, literal: this.ch }; break;
            case "%": tok = { type: TokenType.MOD, literal: this.ch }; break;
            case ".": tok = { type: TokenType.DOT, literal: this.ch }; break;
            case "<":
                if (this.peekChar() === "=") {
                    const char = this.ch;
                    this.readChar();
                    tok = { type: TokenType.LTE, literal: char + this.ch };
                } else {
                    tok = { type: TokenType.LT, literal: this.ch };
                }
                break;
            case ">":
                if (this.peekChar() === "=") {
                    const char = this.ch;
                    this.readChar();
                    tok = { type: TokenType.GTE, literal: char + this.ch };
                } else {
                    tok = { type: TokenType.GT, literal: this.ch };
                }
                break;
            case "{": tok = { type: TokenType.LBRACE, literal: this.ch }; break;
            case "}": tok = { type: TokenType.RBRACE, literal: this.ch }; break;
            case "(": tok = { type: TokenType.LPAREN, literal: this.ch }; break;
            case ")": tok = { type: TokenType.RPAREN, literal: this.ch }; break;
            case ",": tok = { type: TokenType.COMMA, literal: this.ch }; break;
            case "\"":
                tok = { type: TokenType.STRING, literal: this.readString() };
                break;
            case "":
                tok = { type: TokenType.EOF, literal: "" };
                break;
            default:
                if (this.isLetter(this.ch)) {
                    const literal = this.readIdentifier();
                    tok = { type: this.lookupIdent(literal), literal };
                    return tok;
                } else if (this.isDigit(this.ch)) {
                    tok = { type: TokenType.NUMBER, literal: this.readNumber() };
                    return tok;
                } else {
                    tok = { type: TokenType.ILLEGAL, literal: this.ch };
                }
        }

        this.readChar();
        return tok;
    }

    private readString(): string {
        const position = this.position + 1;
        while (true) {
            this.readChar();
            if (this.ch === "\"" || this.ch === "") {
                break;
            }
        }
        return this.input.substring(position, this.position);
    }

    private readIdentifier(): string {
        const position = this.position;
        while (this.isLetter(this.ch) || this.isDigit(this.ch)) {
            this.readChar();
        }
        return this.input.substring(position, this.position);
    }

    private readNumber(): string {
        const position = this.position;
        while (this.isDigit(this.ch)) {
            this.readChar();
        }
        return this.input.substring(position, this.position);
    }

    private isLetter(ch: string): boolean {
        return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || ch === "_";
    }

    private isDigit(ch: string): boolean {
        return ch >= "0" && ch <= "9";
    }

    private skipWhitespace(): void {
        while (this.ch === " " || this.ch === "\t" || this.ch === "\n" || this.ch === "\r") {
            this.readChar();
        }
    }

    private lookupIdent(ident: string): TokenType {
        switch (ident) {
            case "if": return TokenType.IF;
            case "else": return TokenType.ELSE;
            case "while": return TokenType.WHILE;
            case "return": return TokenType.RETURN;
            default: return TokenType.IDENTIFIER;
        }
    }
}
