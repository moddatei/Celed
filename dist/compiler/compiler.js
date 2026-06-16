"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compiler = void 0;
const ast_1 = require("../ast/ast");
class Compiler {
    compile(program) {
        let jsCode = "async function main() {\n";
        jsCode += this.compileNode(program);
        jsCode += "\n}\nmain();";
        return jsCode;
    }
    compileNode(node) {
        if (node instanceof ast_1.Program)
            return node.statements.map(s => this.compileNode(s)).join(";\n");
        if (node instanceof ast_1.ExpressionStatement)
            return this.compileNode(node.expression);
        if (node instanceof ast_1.AssignStatement)
            return `var ${node.name.value} = ${this.compileNode(node.value)}`;
        if (node instanceof ast_1.Identifier)
            return node.value;
        if (node instanceof ast_1.IntegerLiteral)
            return node.value.toString();
        if (node instanceof ast_1.StringLiteral)
            return `"${node.value}"`;
        if (node instanceof ast_1.ArrayLiteral)
            return `[${node.elements.map(e => this.compileNode(e)).join(", ")}]`;
        if (node instanceof ast_1.IndexExpression)
            return `${this.compileNode(node.left)}[${this.compileNode(node.index)}]`;
        if (node instanceof ast_1.InfixExpression) {
            let op = node.operator;
            if (op === "==")
                op = "===";
            if (op === "!=")
                op = "!==";
            return `(${this.compileNode(node.left)} ${op} ${this.compileNode(node.right)})`;
        }
        if (node instanceof ast_1.BlockStatement)
            return node.statements.map(s => this.compileNode(s)).join(";\n");
        if (node instanceof ast_1.IfExpression) {
            let out = `if (${this.compileNode(node.condition)}) { ${this.compileNode(node.consequence)} }`;
            if (node.alternative)
                out += ` else { ${this.compileNode(node.alternative)} }`;
            return out;
        }
        if (node instanceof ast_1.WhileExpression)
            return `while (${this.compileNode(node.condition)}) { ${this.compileNode(node.body)} }`;
        if (node instanceof ast_1.FunctionLiteral)
            return `(async function(${node.parameters.map(p => p.value).join(", ")}) { ${this.compileNode(node.body)} })`;
        if (node instanceof ast_1.CallExpression) {
            const fn = this.compileNode(node.function);
            const args = node.args.map(a => this.compileNode(a)).join(", ");
            if (fn === "print")
                return `console.log(${args})`;
            if (fn === "fetch")
                return `(await (await fetch(${args})).text())`;
            if (fn === "json_parse")
                return `JSON.parse(${args})`;
            if (fn === "file_read")
                return `require('fs').readFileSync(${args}, 'utf-8')`;
            if (fn === "file_write")
                return `require('fs').writeFileSync(${args.split(', ')[0]}, ${args.split(', ')[1]}, 'utf-8')`;
            return `(await ${fn}(${args}))`;
        }
        if (node instanceof ast_1.PipelineExpression) {
            const left = this.compileNode(node.left);
            if (node.right instanceof ast_1.CallExpression) {
                const fn = this.compileNode(node.right.function);
                let args = node.right.args.map((a) => this.compileNode(a));
                args.unshift(left);
                if (fn === "print")
                    return `console.log(${args.join(", ")})`;
                if (fn === "map")
                    return `(await Promise.all(${args[0]}.map(${args[1]})))`;
                if (fn === "filter")
                    return `(${args[0]}.filter(${args[1]}))`;
                return `(await ${fn}(${args.join(", ")}))`;
            }
        }
        return "";
    }
}
exports.Compiler = Compiler;
