require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
  throw new Error("Configura DISCORD_TOKEN y CLIENT_ID en el archivo .env");
}
const commands = [];
const dir = path.join(__dirname, "commands");
for (const file of fs.readdirSync(dir).filter(f => f.endsWith(".js"))) {
  const command = require(path.join(dir, file));
  for (const item of (Array.isArray(command.data) ? command.data : [command.data])) commands.push(item.toJSON());
}
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
(async () => {
  const route = process.env.GUILD_ID
    ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
    : Routes.applicationCommands(process.env.CLIENT_ID);
  await rest.put(route, { body: commands });
  console.log(`Comandos registrados: ${commands.length} (${process.env.GUILD_ID ? "servidor de pruebas" : "globales"})`);
})().catch(console.error);