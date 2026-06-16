import { Client, GatewayIntentBits } from 'discord.js';

export class CeledDiscordBot {
    private client: Client;
    private token: string;
    private messageCallback: ((msg: string) => void) | null = null;
    
    constructor(token: string) {
        this.token = token;
        this.client = new Client({ 
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
        });
        
        this.client.on('messageCreate', (message) => {
            if (message.author.bot) return;
            if (this.messageCallback) {
                this.messageCallback(message.content);
            }
        });
        
        this.client.on('ready', () => {
            console.log(`Celed Discord Bot is online as ${this.client.user?.tag}!`);
        });
    }
    
    public connect(): void {
        console.log(`Connecting to Discord...`);
        this.client.login(this.token).catch(err => {
            console.error(`Discord login failed: ${err.message}`);
        });
    }
    
    public onMessage(callback: (msg: string) => void): void {
        this.messageCallback = callback;
        console.log(`Registered message listener for Discord`);
    }
}
