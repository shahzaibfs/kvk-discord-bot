require("dotenv").config();
const fs = require("fs");
const DiscordBot = require("./client/DiscordBot");
const redis = require("./redis");

fs.writeFileSync("./terminal.log", "", "utf-8");
const client = new DiscordBot();

module.exports = client;

redis.connect();
client.connect();

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);
