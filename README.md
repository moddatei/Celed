# 🚀 Celed Programming Language

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Celed is a blazingly fast, cross-platform programming language designed for modern web apps, scripts, and general-purpose programming. It combines the dynamic flexibility of Python with the functional power of JavaScript, all wrapped in a minimalist, pipeline-oriented syntax.

## ✨ "Ohh that's Celed" Syntax

Celed removes clunky keywords like `let`, `var`, `function`, and `return`. Instead, it uses clean, mathematical operators to make reading and writing code feel effortless.

```celed
// Clean variable assignments
greeting := "Welcome to Celed!"
multiplier := 5

// Keyword-less functions with implicit returns
calculate := (op, x, y) => {
    if op == "+" {
        x + y
    } else if op == "*" {
        x * y
    }
}

// The Pipeline Operator (|>)
// Data flows cleanly from left to right without nested functions
calculate("*", 10, 5) |> print()
```

## ⚡ Features
- **Cross-Platform**: Runs natively on Windows, macOS, and Linux.
- **Blazing Fast**: Compiles down to highly optimized JavaScript (V8 Engine) making it faster than standard Python for raw calculations.
- **Functional-First**: Built-in support for pipelines, pattern matching, and high-level array manipulation.
- **Comment-Free Compiler Engine**: The entire internal engine is written cleanly, relying on strict naming conventions rather than cluttered inline comments.

## 📁 Documentation
Every core component of the Celed compiler is thoroughly documented. Check the `/docs` folder to learn how the engine works:
- [Lexer Documentation](docs/lexer.md)
- [Parser Documentation](docs/parser.md)
- *More coming soon...*

## 🛠️ Usage
*(Command line instructions coming soon as the engine is currently in active development!)*

---
*Celed - Engineered for speed. Designed for elegance.*
