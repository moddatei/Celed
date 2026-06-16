export enum TokenType {
    IDENTIFIER = "IDENTIFIER",
    NUMBER = "NUMBER",
    STRING = "STRING",
    ASSIGN = "ASSIGN",
    ARROW = "ARROW",
    PIPE = "PIPE",
    LBRACE = "LBRACE",
    RBRACE = "RBRACE",
    LPAREN = "LPAREN",
    RPAREN = "RPAREN",
    PLUS = "PLUS",
    MINUS = "MINUS",
    STAR = "STAR",
    SLASH = "SLASH",
    EQUALS = "EQUALS",
    IF = "IF",
    ELSE = "ELSE",
    RETURN = "RETURN",
    EOF = "EOF",
    ILLEGAL = "ILLEGAL",
    COMMA = "COMMA"
}

export interface Token {
    type: TokenType;
    literal: string;
}
