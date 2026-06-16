import * as fs from 'fs';
import { Lexer } from '../../lexer/lexer';
import { Parser } from '../../parser/parser';
import { evaluate } from '../../interpreter/evaluator';
import { Environment } from '../../interpreter/environment';
import { ErrorObj } from '../../interpreter/object';

export async function executeRun(filename: string): Promise<void> {
    if (!fs.existsSync(filename)) {
        console.error(`File not found: ${filename}`);
        process.exit(1);
    }
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
