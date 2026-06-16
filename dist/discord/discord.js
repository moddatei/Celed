"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CeledDiscordBot = void 0;
const discord_js_1 = require("discord.js");
class CeledDiscordBot {
    constructor(token) {
        this.messageCallback = null;
        this.token = token;
        this.client = new discord_js_1.Client({
            intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMessages, discord_js_1.GatewayIntentBits.MessageContent]
        });
        this.client.on('messageCreate', (message) => {
            if (message.author.bot)
                return;
            if (this.messageCallback) {
                this.messageCallback(message.content);
            }
        });
        this.client.on('ready', () => {
            var _a;
            console.log(`Celed Discord Bot is online as ${(_a = this.client.user) === null || _a === void 0 ? void 0 : _a.tag}!`);
        });
    }
    connect() {
        console.log(`Connecting to Discord...`);
        this.client.login(this.token).catch(err => {
            console.error(`Discord login failed: ${err.message}`);
        });
    }
    onMessage(callback) {
        this.messageCallback = callback;
        console.log(`Registered message listener for Discord`);
    }
}
exports.CeledDiscordBot = CeledDiscordBot;
