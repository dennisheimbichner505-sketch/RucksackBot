const fs = require("fs");

const CONFIG_FILE = "config.json";

const defaultConfig = {
    twitchName: "",
    oauthToken: "",
    adminToken: "admin",
    port: 3000
};

function loadConfig() {
    if (!fs.existsSync(CONFIG_FILE)) {
        saveConfig(defaultConfig);
        return { ...defaultConfig };
    }

    const data = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));

    return {
        ...defaultConfig,
        ...data
    };
}

function saveConfig(newConfig) {
    const current = fs.existsSync(CONFIG_FILE)
        ? JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"))
        : {};

    const merged = {
        ...defaultConfig,
        ...current,
        ...newConfig
    };

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2));

    return merged;
}

module.exports = {
    loadConfig,
    saveConfig
};