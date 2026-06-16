export interface Plugin {
    name: string;
    version: string;
    initialize(): void;
}

export class PluginManager {
    private plugins: Plugin[] = [];

    public loadPlugin(plugin: Plugin): void {
        this.plugins.push(plugin);
        plugin.initialize();
        console.log(`Plugin loaded: ${plugin.name} v${plugin.version}`);
    }
}
