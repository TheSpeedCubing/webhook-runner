const fs = require("fs");
const yaml = require("js-yaml");

let config = null;

function loadConfig() {
  try {
    config = yaml.load(fs.readFileSync("/app/config.yml", "utf8"));
    console.log("✅ Config loaded.");
  } catch (e) {
    console.error("❌ Failed to load config:", e.message);
    config = null;
  }
}

function getConfig() {
  return config;
}

module.exports = {
  loadConfig,
  getConfig
};
