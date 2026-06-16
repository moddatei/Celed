# Standard Library APIs

Celed features powerful built-in standard libraries that map to underlying Javascript ecosystem capabilities natively.

## 1. File System
Celed provides synchronous file I/O capabilities directly to the language context without requiring imports.

- **`file_write(path: string, content: string)`**: Writes content to the local filesystem.
- **`file_read(path: string)`**: Reads a file as a UTF-8 string.

## 2. Discord Engine
Celed ships with a native Discord wrapper built on top of `discord.js` located in `src/discord/`.

To build a Discord bot natively:
```celed
bot := discord("DISCORD_BOT_TOKEN")

bot.onMessage(msg => {
    print("Received a new message from Discord:", msg)
})

bot.connect()
```
The Discord bridge automatically handles Websocket intents and event-loop delegation, mapping Discord events back into the Celed AST Evaluator to trigger your Celed callbacks dynamically.
