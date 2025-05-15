const express = require("express");
const { exec } = require("child_process");
const { loadConfig, getConfig } = require("./config");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 80;
const BIND_ADDRESS = process.env.BIND_ADDRESS || '0.0.0.0';

const SECRET_FILE = path.join(__dirname, "../secret.key");
let SECRET_KEY = "";

try {
  SECRET_KEY = fs.readFileSync(SECRET_FILE, "utf8").trim();
  if (SECRET_KEY) {
    console.log("🔐 Secret key:", SECRET_KEY);
  } else {
    console.log("⚠️ Secret key file is empty. Authentication will be disabled.");
  }
} catch (err) {
  console.log("⚠️ Secret key file not found. Authentication will be disabled.");
}

app.post("*name", (req, res, next) => {
  if (!SECRET_KEY) return next();

  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).send("Forbidden: Missing or invalid Authorization header");
  }

  const token = authHeader.split(" ")[1];

  if (token !== SECRET_KEY) {
    return res.status(403).send("Forbidden: Invalid token");
  }

  next();
});


let webhookRoutes = [];

function removeRoutes() {
  webhookRoutes.forEach(route => {
    app._router.stack = app._router.stack.filter(r => !(r.route && r.route.path === route));
  });
  webhookRoutes = [];
}

function registerRoutes() {
  const config = getConfig();
  if (!config || !config.webhooks) return;

  removeRoutes();

  config.webhooks.forEach(({ path, run }) => {
    webhookRoutes.push(path);
    app.post(path, (req, res) => {
      console.log(`Received webhook: ${path}`);
      run.forEach(cmd => {
        console.log(`Running: ${cmd}`);
        exec(cmd, (err, stdout, stderr) => {
          if (err) console.error(`❌ ${cmd}:`, err.message);
          if (stdout) console.log(`✅ ${cmd}:\n${stdout}`);
          if (stderr) console.error(`⚠️ ${cmd} stderr:\n${stderr}`);
        });
      });
      res.send(`Running scripts for ${path}`);
    });
  });

  console.log("✅ Routes registered.");
}

function initApp() {
  loadConfig();
  registerRoutes();
}

initApp();

app.listen(PORT, BIND_ADDRESS, () => {
  console.log(`Listening on ${BIND_ADDRESS}:${PORT}`);
});
