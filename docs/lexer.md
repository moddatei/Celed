# Celed Lexer Documentation

The Lexer is the first stage of the Celed compiler/interpreter pipeline. 

## Purpose
It reads raw `.ce` source code files character-by-character and groups them into meaningful symbols called **Tokens**. This makes it infinitely easier for the Parser to understand the structure of the code, rather than dealing with a giant string of characters.

## Defined Tokens
The lexer handles all the unique symbols we defined for Celed:
- `:=` is translated into the `ASSIGN` token.
- `=>` is translated into the `ARROW` token.
- `|>` is translated into the `PIPE` token.
- Strings, numbers, and basic math operators (`+`, `-`, `*`, `/`) are tokenized safely.

## No Comments Rule
In adherence to the design rules, `src/lexer.ts` and `src/token.ts` have been written completely devoid of code comments. The code is structured cleanly and self-documents through variable names like `readChar`, `peekChar`, and `skipWhitespace`.
