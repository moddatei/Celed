#!/usr/bin/env node
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const lexer_1 = require("./lexer");
const parser_1 = require("./parser");
const evaluator_1 = require("./evaluator");
const environment_1 = require("./environment");
const object_1 = require("./object");
function runFile(filename) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const env = new environment_1.Environment();
        const result = yield (0, evaluator_1.evaluate)(program, env);
        if (result instanceof object_1.ErrorObj) {
            console.error(result.inspect());
            process.exit(1);
        }
    });
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
}
else {
    console.log("Usage: celed run <filename.ce>");
    process.exit(1);
}
