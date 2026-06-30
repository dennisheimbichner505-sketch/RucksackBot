const tmi = require("tmi.js");
const fs = require("fs");

const queue = require("./queue");
const { setupCommands } = require("./commands");
const { startWebsite } = require("./website");

if (!fs.existsSync("config.json")) {
    fs.writeFileSync("config.json", JSON.stringify({
        twitchName: "",
        oauthToken: ""
    }, null, 2));

    console.log("❌ config.json wurde erstellt.");
    console.log("Bitte twitchName und oauthToken eintragen.");
    process.exit();
}

const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

if (!config.twitchName || !config.oauthToken) {
    console.log("❌ Bitte config.json ausfüllen.");
    console.log("Beispiel:");
    console.log('{ "twitchName": "deinname", "oauthToken": "oauth:deintoken" }');
    process.exit();
}

if (!config.oauthToken.startsWith("oauth:")) {
    console.log("❌ OAuth Token muss mit oauth: anfangen.");
    process.exit();
}

const settings = {
    entriesOpen: true,
    publicListVisible: false,
    adminToken: config.adminToken || "admin"
};

queue.loadData();

const client = new tmi.Client({
    identity: {
        username: config.twitchName,
        password: config.oauthToken
    },
    channels: [config.twitchName]
});

client.connect().catch((err) => {
    console.log("❌ Twitch-Verbindung fehlgeschlagen:");
    console.log(err);
});

client.on("connected", () => {
    console.log("🎒 RucksackBot verbunden.");
});

setupCommands(client, queue, settings);
startWebsite(queue, settings);