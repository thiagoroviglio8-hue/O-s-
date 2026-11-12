const fs = require("node:fs");
const path = require("node:path");

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "config.json");

function read() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify({}, null, 2));
  try { return JSON.parse(fs.readFileSync(FILE, "utf8")); }
  catch { return {}; }
}
function write(data) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}
function getGuild(guildId) {
  return read()[guildId] || {};
}
function setGuild(guildId, patch) {
  const all = read();
  all[guildId] = { ...(all[guildId] || {}), ...patch };
  write(all);
}
module.exports = { getGuild, setGuild };