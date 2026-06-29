const tmi = require("tmi.js");
const express = require("express");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

const SAVE_FILE = "rucksack.json";

const wind = [];
const eis = [];
const used = new Set();

let entriesOpen = true;
let publicListVisible = false;

const TWITCH_NAME = config.twitchName;
const OAUTH_TOKEN = config.oauthToken;

function loadData() {
    if (!fs.existsSync(SAVE_FILE)) return;

    const data = JSON.parse(fs.readFileSync(SAVE_FILE, "utf8"));

    wind.push(...(data.wind || []));
    eis.push(...(data.eis || []));
    (data.used || []).forEach(u => used.add(u));
}

function saveData() {
    fs.writeFileSync(SAVE_FILE, JSON.stringify({
        wind,
        eis,
        used: Array.from(used)
    }, null, 2));
}

loadData();

const client = new tmi.Client({
    identity: {
        username: TWITCH_NAME,
        password: OAUTH_TOKEN
    },
    channels: [TWITCH_NAME]
});

client.connect().catch(console.error);

client.on("connected", () => {
    console.log("🎒 RucksackBot verbunden.");
    console.log("Webseite: http://localhost:3000");
});

client.on("message", (channel, tags, message, self) => {
    if (self) return;

    const username = tags.username.toLowerCase();
    const msg = message.trim().toLowerCase();
    const isMod = tags.mod || tags.badges?.broadcaster === "1";

    if (msg === "!wind") join(channel, username, "wind");
    if (msg === "!eis") join(channel, username, "eis");

    if (msg === "!platz") {
        const place = getPlace(username);
        if (!place) return client.say(channel, `@${username}, du bist nicht im Rucksack.`);
        client.say(channel, `${place.icon} @${username}, du bist bei ${place.name} auf Platz #${place.position}.`);
    }

    if (msg === "!queue") {
        if (!publicListVisible) return client.say(channel, "🎒 Die öffentliche Liste ist deaktiviert.");
        sendList(channel);
    }

    if (msg === "!rucksack") {
        if (!isMod) return;
        sendList(channel);
    }

    if (msg === "!open") {
        if (!isMod) return;
        entriesOpen = true;
        client.say(channel, "🎒 Rucksack ist geöffnet.");
    }

    if (msg === "!close") {
        if (!isMod) return;
        entriesOpen = false;
        client.say(channel, "🎒 Rucksack ist geschlossen.");
    }

    if (msg === "!showlist") {
        if (!isMod) return;
        publicListVisible = true;
        client.say(channel, "🎒 Öffentliche Liste ist aktiviert.");
    }

    if (msg === "!hidelist") {
        if (!isMod) return;
        publicListVisible = false;
        client.say(channel, "🎒 Öffentliche Liste ist deaktiviert.");
    }

    if (msg.startsWith("!next ")) {
        if (!isMod) return;

        const type = getType(msg.split(" ")[1]);
        if (!type) return client.say(channel, "Nutzung: !next wind oder !next eis");

        if (type.list.length === 0) {
            return client.say(channel, `${type.icon} ${type.name} ist leer.`);
        }

        const user = type.list.shift();
        saveData();

        client.say(channel, `${type.icon} ${user} wurde aus ${type.name} entfernt.`);
    }

    if (msg.startsWith("!done ")) {
        if (!isMod) return;

        const parts = msg.split(" ");
        const type = getType(parts[1]);
        const name = parts[2]?.replace("@", "").toLowerCase();

        if (!type || !name) {
            return client.say(channel, "Nutzung: !done wind NAME oder !done eis NAME");
        }

        removeName(channel, type, name);
    }

    if (msg.startsWith("!move ")) {
        if (!isMod) return;

        const parts = msg.split(" ");
        const type = getType(parts[1]);
        const name = parts[2]?.replace("@", "").toLowerCase();
        const newPos = parseInt(parts[3]);

        if (!type || !name || isNaN(newPos)) {
            return client.say(channel, "Nutzung: !move wind NAME PLATZ");
        }

        const oldIndex = type.list.indexOf(name);

        if (oldIndex === -1) return client.say(channel, `${name} ist nicht bei ${type.name}.`);
        if (newPos < 1 || newPos > type.list.length) return client.say(channel, "Ungültige Position.");

        type.list.splice(oldIndex, 1);
        type.list.splice(newPos - 1, 0, name);
        saveData();

        client.say(channel, `${type.icon} ${name} wurde bei ${type.name} auf Platz ${newPos} verschoben.`);
    }

    if (msg.startsWith("!remove ")) {
        if (!isMod) return;

        const parts = msg.split(" ");
        const type = getType(parts[1]);
        const posText = parts[2];

        if (!type || !posText) {
            return client.say(channel, "Nutzung: !remove wind 1,3");
        }

        const positions = posText
            .split(",")
            .map(x => parseInt(x.trim()))
            .filter(x => !isNaN(x))
            .sort((a, b) => b - a);

        const removed = [];

        positions.forEach(pos => {
            if (pos >= 1 && pos <= type.list.length) {
                removed.push(type.list.splice(pos - 1, 1)[0]);
            }
        });

        saveData();

        client.say(channel, removed.length
            ? `${type.icon} Entfernt: ${removed.join(", ")}`
            : "Keine gültigen Plätze gefunden."
        );
    }

    if (msg === "!clearrucksack") {
        if (!isMod) return;

        wind.length = 0;
        eis.length = 0;
        used.clear();
        saveData();

        client.say(channel, "🎒 Rucksack wurde komplett geleert.");
    }
});

function join(channel, username, kind) {
    if (!entriesOpen) {
        client.say(channel, `@${username}, der Rucksack ist geschlossen.`);
        return;
    }

    if (used.has(username)) {
        client.say(channel, `@${username}, du bist bereits im Rucksack.`);
        return;
    }

    const type = getType(kind);

    type.list.push(username);
    used.add(username);
    saveData();

    client.say(channel, `${type.icon} @${username} ist bei ${type.name} angemeldet! Platz #${type.list.length}`);
}

function getType(kind) {
    if (kind === "wind") return { name: "WIND", icon: "🟩", list: wind };
    if (kind === "eis") return { name: "EIS", icon: "🟦", list: eis };
    return null;
}

function getPlace(username) {
    const w = wind.indexOf(username);
    if (w !== -1) return { name: "WIND", icon: "🟩", position: w + 1 };

    const e = eis.indexOf(username);
    if (e !== -1) return { name: "EIS", icon: "🟦", position: e + 1 };

    return null;
}

function removeName(channel, type, name) {
    const index = type.list.indexOf(name);

    if (index === -1) {
        client.say(channel, `${name} ist nicht bei ${type.name}.`);
        return;
    }

    type.list.splice(index, 1);
    saveData();

    client.say(channel, `${type.icon} ${name} wurde aus ${type.name} entfernt.`);
}

function sendList(channel) {
    const windText = wind.length ? wind.map((u, i) => `${i + 1}. ${u}`).join(" | ") : "leer";
    const eisText = eis.length ? eis.map((u, i) => `${i + 1}. ${u}`).join(" | ") : "leer";

    client.say(channel, `🎒 Rucksack | 🟩 WIND: ${windText} || 🟦 EIS: ${eisText}`);
}

const app = express();

app.get("/", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="2">
<title>Rucksack</title>
<style>
body {
    font-family: Arial, sans-serif;
    background: #111;
    color: white;
    padding: 30px;
}
h1 {
    text-align: center;
    font-size: 48px;
}
.status {
    text-align: center;
    margin-bottom: 25px;
    font-size: 22px;
}
.stats {
    text-align: center;
    margin-bottom: 25px;
    font-size: 20px;
}
.columns {
    display: flex;
    gap: 25px;
}
.column {
    flex: 1;
    background: #1c1c1c;
    padding: 20px;
    border-radius: 14px;
}
.wind {
    border: 4px solid #00c853;
}
.eis {
    border: 4px solid #2196f3;
}
.column h2 {
    text-align: center;
    font-size: 34px;
}
.ticket {
    background: #2b2b2b;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 8px;
    font-size: 24px;
    display: flex;
    gap: 15px;
}
.empty {
    text-align: center;
    color: #aaa;
    font-size: 22px;
}
</style>
</head>
<body>

<h1>🎒 Rucksack 🎒</h1>

<div class="status">
Status: ${entriesOpen ? "🟢 OFFEN" : "🔴 GESCHLOSSEN"}<br>
Öffentliche Liste: ${publicListVisible ? "🟢 AKTIV" : "🔴 AUS"}
</div>

<div class="stats">
🟩 Wind: ${wind.length} | 🟦 Eis: ${eis.length} | Gesamt: ${wind.length + eis.length}
</div>

<div class="columns">
    <div class="column wind">
        <h2>🟩 Wind</h2>
        ${renderList(wind)}
    </div>

    <div class="column eis">
        <h2>🟦 Eis</h2>
        ${renderList(eis)}
    </div>
</div>

</body>
</html>
    `);
});

function renderList(list) {
    if (list.length === 0) return `<p class="empty">Leer</p>`;

    return list.map((user, index) => `
        <div class="ticket">
            <span>#${index + 1}</span>
            <strong>${user}</strong>
        </div>
    `).join("");
}

app.listen(3000, () => {
    console.log("🎒 Rucksack-Webseite läuft auf http://localhost:3000");
});