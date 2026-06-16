# 🚀 Celed Language

**Celed** is a fast, powerful, and aggressively modular programming language. Built from scratch with a custom lexer, parser, and abstract syntax tree (AST), Celed offers a brilliant blend of tree-walking interpretation for rapid development and native JavaScript compilation for blazing-fast production execution.

---

## 🌟 Key Features (v3.5 Ecosystem Upgrade)

- **AST-to-JS Compiler:** Compile your Celed code directly to native JavaScript binaries for V8-level performance using `celed build`.
- **Native Discord Engine:** Built-in `discord` objects utilizing the underlying discord.js engine. Write Discord bots natively in Celed.
- **File System I/O:** Built-in standard library functions (`file_read`, `file_write`) to easily interact with your operating system.
- **Advanced Logic & Math:** Full support for `&&`, `||`, `%`, `>=`, `<=`, and `!=`.
- **Package & Plugin System:** Expand Celed's capabilities using the built-in package manager framework and plugin APIs.
- **Dot-Notation:** Intuitive object/method execution using dot-notation (e.g. `bot.connect()`).
- **No-Comment Philosophy:** Designed with a zero-comment strict syntax philosophy to enforce hyper-clean codebase design.

---

## 💻 Installation

Celed comes with native install scripts that globally link the CLI directly to your system.

**Mac / Linux:**
```bash
./install.sh
```

**Windows:**
```powershell
./install.ps1
```

---

## 🛠️ Command Line Interface

The Celed CLI is a highly advanced modular command router.

- `celed run <file>`: Interprets the Celed script live.
- `celed build <file>`: Compiles the script into a high-performance native JS binary executable.
- `celed install <pkg>`: Downloads community-made packages to your `.celed` library.
- `celed update`: Connects to GitHub, pulls the latest engine commits, rebuilds the compiler, and links the newest version to your OS seamlessly.

---

## 📖 Code Examples

### 1. The Celed Discord Bot
```celed
bot := discord("YOUR_TOKEN_HERE")

bot.onMessage(msg => {
    print("Received a new message from Discord:", msg)
})

bot.connect()
```

### 2. Standard Library APIs
```celed
file_write("hello.txt", "Celed is taking over!")
content := file_read("hello.txt")
print(content)
```

### 3. While Loops & Advanced Logic
```celed
counter := 0
limit := 10

while (counter < limit) && (limit != 5) {
    print("Counter is at:", counter)
    counter := counter + 1
}
```

---

## 🏗️ Architecture

The Celed Engine is divided into logical, enterprise-grade layers:
- `src/lexer/`: High-performance tokenization and Lexical Analysis.
- `src/parser/`: A recursive descent Pratt-parser for constructing the AST.
- `src/ast/`: The Abstract Syntax Tree models.
- `src/interpreter/`: The asynchronous evaluation engine and object system.
- `src/compiler/`: The native JS binary compilation engine.
- `src/cli/`: The modular command-line router.
- `src/discord/`, `src/plugins/`, `src/packages/`: The ecosystem toolchains.
