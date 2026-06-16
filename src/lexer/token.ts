export enum TokenType {
    IDENTIFIER = "IDENTIFIER",
    NUMBER = "NUMBER",
    STRING = "STRING",
    ASSIGN = "ASSIGN",
    ARROW = "ARROW",
    PIPE = "PIPE",
    LBRACE = "LBRACE",
    RBRACE = "RBRACE",
    LBRACKET = "LBRACKET",
    RBRACKET = "RBRACKET",
    LPAREN = "LPAREN",
    RPAREN = "RPAREN",
    COLON = "COLON",
    PLUS = "PLUS",
    MINUS = "MINUS",
    STAR = "STAR",
    SLASH = "SLASH",
    LT = "LT",
    GT = "GT",
    LTE = "LTE",
    GTE = "GTE",
    EQUALS = "EQUALS",
    NOT_EQ = "NOT_EQ",
    MOD = "MOD",
    AND = "AND",
    OR = "OR",
    DOT = "DOT",
    IF = "IF",
    ELSE = "ELSE",
    WHILE = "WHILE",
    RETURN = "RETURN",
    EOF = "EOF",
    ILLEGAL = "ILLEGAL",
    COMMA = "COMMA"
}

export interface Token {
    type: TokenType;
    literal: string;
}

export const keywords: Record<string, TokenType> = {
    "if": TokenType.IF,
    "else": TokenType.ELSE,
    "while": TokenType.WHILE
};
