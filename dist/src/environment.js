"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environment = void 0;
class Environment {
    constructor(outer = null) {
        this.store = new Map();
        this.outer = outer;
    }
    get(name) {
        let obj = this.store.get(name);
        if (!obj && this.outer !== null) {
            obj = this.outer.get(name);
        }
        return obj;
    }
    set(name, val) {
        this.store.set(name, val);
        return val;
    }
}
exports.Environment = Environment;
