import * as fs from 'fs';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { evaluate } from './evaluator';
import { Environment } from './environment';
import { ErrorObj } from './object';

async function runFile(filename: string): Promise<void> {
    const code = fs.readFileSync(filename, 'utf-8');
    const lexer = new Lexer(code);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();

    const errors = parser.getErrors();
    if (errors.length > 0) {
        console.error("Syntax Errors:");
        for (const msg of errors) {
            console.error(`- ${msg}`);
        }
        process.exit(1);
    }

    const env = new Environment();
    const result = await evaluate(program, env);

    if (result instanceof ErrorObj) {
        console.error(result.inspect());
        process.exit(1);
    }
}

const args = process.argv.slice(2);
if (args.length === 0) {
    console.log("Usage: celed run <filename.ce>");
    process.exit(1);
}

if (args[0] === "run" && args[1]) {
    runFile(args[1]).catch(e => {
        console.error(e);
        process.exit(1);
    });
} else {
    console.log("Usage: celed run <filename.ce>");
    process.exit(1);
}
