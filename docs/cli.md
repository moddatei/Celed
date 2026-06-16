# Celed Command Line Interface (CLI)

The Celed CLI is a modular router located in `src/cli/index.ts` and routes traffic to isolated command handlers in the `src/cli/commands/` directory.

## Commands

### `celed run <file>`
Interprets a Celed script live using the AST evaluator.
- Handler: `commands/run.ts`
- Usage: `celed run script.ce`

### `celed build <file>`
Compiles a Celed script to a high-performance native JavaScript binary executable using the Celed Compiler.
- Handler: `commands/build.ts`
- Usage: `celed build script.ce`

### `celed install <pkg>`
Interfaces with the Package Manager to download community packages into your `.celed` library.
- Handler: `commands/install.ts`

### `celed update`
Automatically connects to GitHub, pulls the latest commits on the `main` branch, recompiles the engine using `tsc`, and natively links the binaries to your operating system via `npm link`.
- Handler: `commands/update.ts`
