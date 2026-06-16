"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginManager = void 0;
class PluginManager {
    constructor() {
        this.plugins = [];
    }
    loadPlugin(plugin) {
        this.plugins.push(plugin);
        plugin.initialize();
        console.log(`Plugin loaded: ${plugin.name} v${plugin.version}`);
    }
}
exports.PluginManager = PluginManager;
