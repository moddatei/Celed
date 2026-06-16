import * as fs from 'fs';
import * as path from 'path';
import { Lexer } from '../../lexer/lexer';
import { Parser } from '../../parser/parser';
import { Compiler } from '../../compiler/compiler';

export function executeBuild(filename: string): void {
    console.log(`Compiling ${filename} to native JavaScript...`);
    
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

    const compiler = new Compiler();
    const jsCode = compiler.compile(program);
    
    const outPath = filename.replace('.ce', '.js');
    fs.writeFileSync(outPath, jsCode);

    console.log(`Success! Binary created at: ${outPath}`);
    console.log(`You can now run it with: node ${outPath}`);
}
