# Celed CLI Documentation

The CLI (Command Line Interface) is the entry point for the Celed programming language.

## Purpose
It connects the Lexer, Parser, and Interpreter together. When a user runs `celed run file.ce`, the CLI:
1. Reads the file from the disk.
2. Passes the raw text to the Lexer to get Tokens.
3. Passes the Tokens to the Parser to build the AST.
4. Passes the AST to the Interpreter to execute the code.

## Usage
The primary command is:
`celed run <filename.ce>`

If there are any syntax errors (e.g., forgetting a curly brace), the CLI stops execution and prints the errors cleanly. If execution succeeds, it silently finishes (unless the script uses `print`).

As per the strict design rules, `src/index.ts` contains zero comments.
