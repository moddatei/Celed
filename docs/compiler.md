# The Celed Compiler

Located in `src/compiler/compiler.ts`, the Celed Compiler translates Celed Abstract Syntax Trees (AST) directly into native JavaScript binaries.

## How it works
Rather than walking the tree to evaluate the code on the fly (like `evaluator.ts`), the `Compiler` recursively traverses the AST and generates a raw JavaScript string.

When `celed build <file>.ce` is executed:
1. The lexer and parser construct the AST.
2. The `Compiler` converts the AST into an async JavaScript main routine.
3. The resulting `.js` code is written directly to the file system as an executable binary.
4. Because it generates native JS, Celed scripts compiled this way run on the NodeJS V8 engine with immense speed and efficiency.

## Features
The compiler natively maps Celed constructs to their JS equivalents:
- **Hashmaps & Arrays:** Translates natively to JS Objects and Arrays.
- **Functions:** Translates natively to `async function()` definitions.
- **Logical Operations:** Celed's `==` and `!=` compile directly to JavaScript's strict `===` and `!==`.
- **Builtins:** Complex builtins like `file_read` and `discord` are compiled into `require('fs')` calls and Discord.js wrapper executions automatically.
