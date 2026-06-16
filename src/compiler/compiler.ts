import { Node, Program, ExpressionStatement, IntegerLiteral, InfixExpression, IfExpression, WhileExpression, BlockStatement, AssignStatement, Identifier, FunctionLiteral, CallExpression, PipelineExpression, StringLiteral, ArrayLiteral, HashLiteral, IndexExpression } from "../ast/ast";

export class Compiler {
    public compile(program: Program): string {
        let jsCode = "async function main() {\n";
        jsCode += this.compileNode(program);
        jsCode += "\n}\nmain();";
        return jsCode;
    }

    private compileNode(node: Node): string {
        if (node instanceof Program) return node.statements.map(s => this.compileNode(s)).join(";\n");
        if (node instanceof ExpressionStatement) return this.compileNode(node.expression!);
        if (node instanceof AssignStatement) return `var ${node.name.value} = ${this.compileNode(node.value!)}`;
        if (node instanceof Identifier) return node.value;
        if (node instanceof IntegerLiteral) return node.value.toString();
        if (node instanceof StringLiteral) return `"${node.value}"`;
        if (node instanceof ArrayLiteral) return `[${node.elements.map(e => this.compileNode(e)).join(", ")}]`;
        if (node instanceof IndexExpression) return `${this.compileNode(node.left!)}[${this.compileNode(node.index!)}]`;
        if (node instanceof InfixExpression) {
            let op = node.operator;
            if (op === "==") op = "===";
            if (op === "!=") op = "!==";
            return `(${this.compileNode(node.left!)} ${op} ${this.compileNode(node.right!)})`;
        }
        if (node instanceof BlockStatement) return node.statements.map(s => this.compileNode(s)).join(";\n");
        if (node instanceof IfExpression) {
            let out = `if (${this.compileNode(node.condition!)}) { ${this.compileNode(node.consequence!)} }`;
            if (node.alternative) out += ` else { ${this.compileNode(node.alternative!)} }`;
            return out;
        }
        if (node instanceof WhileExpression) return `while (${this.compileNode(node.condition!)}) { ${this.compileNode(node.body!)} }`;
        if (node instanceof FunctionLiteral) return `(async function(${node.parameters.map(p => p.value).join(", ")}) { ${this.compileNode(node.body!)} })`;
        
        if (node instanceof CallExpression) {
            const fn = this.compileNode(node.function!);
            const args = node.args.map(a => this.compileNode(a)).join(", ");
            if (fn === "print") return `console.log(${args})`;
            if (fn === "fetch") return `(await (await fetch(${args})).text())`;
            if (fn === "json_parse") return `JSON.parse(${args})`;
            if (fn === "file_read") return `require('fs').readFileSync(${args}, 'utf-8')`;
            if (fn === "file_write") return `require('fs').writeFileSync(${args.split(', ')[0]}, ${args.split(', ')[1]}, 'utf-8')`;
            return `(await ${fn}(${args}))`;
        }

        if (node instanceof PipelineExpression) {
            const left = this.compileNode(node.left!);
            if (node.right instanceof CallExpression) {
                const fn = this.compileNode(node.right.function!);
                let args = node.right.args.map((a: any) => this.compileNode(a));
                args.unshift(left);
                if (fn === "print") return `console.log(${args.join(", ")})`;
                if (fn === "map") return `(await Promise.all(${args[0]}.map(${args[1]})))`;
                if (fn === "filter") return `(${args[0]}.filter(${args[1]}))`;
                return `(await ${fn}(${args.join(", ")}))`;
            }
        }
        return "";
    }
}
