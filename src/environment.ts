import { Obj } from "./object";

export class Environment {
    private store: Map<string, Obj>;
    private outer: Environment | null;

    constructor(outer: Environment | null = null) {
        this.store = new Map();
        this.outer = outer;
    }

    public get(name: string): Obj | undefined {
        let obj = this.store.get(name);
        if (!obj && this.outer !== null) {
            obj = this.outer.get(name);
        }
        return obj;
    }

    public set(name: string, val: Obj): Obj {
        this.store.set(name, val);
        return val;
    }
}
