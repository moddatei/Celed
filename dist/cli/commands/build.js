"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeBuild = executeBuild;
const fs = __importStar(require("fs"));
const lexer_1 = require("../../lexer/lexer");
const parser_1 = require("../../parser/parser");
const compiler_1 = require("../../compiler/compiler");
function executeBuild(filename) {
    console.log(`Compiling ${filename} to native JavaScript...`);
    if (!fs.existsSync(filename)) {
        console.error(`File not found: ${filename}`);
        process.exit(1);
    }
    const code = fs.readFileSync(filename, 'utf-8');
    const lexer = new lexer_1.Lexer(code);
    const parser = new parser_1.Parser(lexer);
    const program = parser.parseProgram();
    const errors = parser.getErrors();
    if (errors.length > 0) {
        console.error("Syntax Errors:");
        for (const msg of errors) {
            console.error(`- ${msg}`);
        }
        process.exit(1);
    }
    const compiler = new compiler_1.Compiler();
    const jsCode = compiler.compile(program);
    const outPath = filename.replace('.ce', '.js');
    fs.writeFileSync(outPath, jsCode);
    console.log(`Success! Binary created at: ${outPath}`);
    console.log(`You can now run it with: node ${outPath}`);
}
