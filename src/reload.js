const expressApp = require("./index");
const { loadConfig, getConfig } = require("./config");

function reload() {
  loadConfig();
  const registerRoutes = require("./index").registerRoutes;
  registerRoutes(expressApp);
}

reload();
