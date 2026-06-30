const fs = require("fs");

const SAVE_FILE = "data/rucksack.json";

const wind = [];
const eis = [];
const used = new Set();
const removed = [];
const history = [];

function loadData() {
    if (!fs.existsSync("data")) fs.mkdirSync("data");

    if (!fs.existsSync(SAVE_FILE)) {
        saveData();
        return;
    }

    const data = JSON.parse(fs.readFileSync(SAVE_FILE, "utf8"));

    wind.push(...(data.wind || []));
    eis.push(...(data.eis || []));
    removed.push(...(data.removed || []));
    history.push(...(data.history || []));
    (data.used || []).forEach(user => used.add(user));
}

function saveData() {
    fs.writeFileSync(SAVE_FILE, JSON.stringify({
        wind,
        eis,
        used: Array.from(used),
        removed,
        history
    }, null, 2));
}

function addHistory(text) {
    const time = new Date().toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit"
    });

    history.unshift(`${time} - ${text}`);
    if (history.length > 50) history.pop();
}

function getType(type) {
    if (type === "wind") return { key: "wind", name: "WIND", icon: "🟩", list: wind };
    if (type === "eis") return { key: "eis", name: "EIS", icon: "🟦", list: eis };
    return null;
}

function addRemoved(username) {
    if (!removed.includes(username)) removed.unshift(username);
}

function join(username, typeName) {
    const type = getType(typeName);
    if (!type) return { ok: false, message: "Unbekannter Typ." };

    if (used.has(username)) {
        return { ok: false, message: `@${username}, du bist bereits im Rucksack.` };
    }

    type.list.push(username);
    used.add(username);

    const rIndex = removed.indexOf(username);
    if (rIndex !== -1) removed.splice(rIndex, 1);

    addHistory(`${username} → ${type.name}`);
    saveData();

    return { ok: true, message: `${type.icon} @${username} ist bei ${type.name} angemeldet! Platz #${type.list.length}` };
}

function getPlace(username) {
    const w = wind.indexOf(username);
    if (w !== -1) return { type: "wind", name: "WIND", icon: "🟩", position: w + 1 };

    const e = eis.indexOf(username);
    if (e !== -1) return { type: "eis", name: "EIS", icon: "🟦", position: e + 1 };

    return null;
}

function next(typeName) {
    const type = getType(typeName);
    if (!type) return { ok: false, message: "Nutzung: !next wind oder !next eis" };
    if (type.list.length === 0) return { ok: false, message: `${type.icon} ${type.name} ist leer.` };

    const user = type.list.shift();
    addRemoved(user);
    addHistory(`${user} aus ${type.name} entfernt`);
    saveData();

    return { ok: true, message: `${type.icon} ${user} wurde aus ${type.name} entfernt.` };
}

function removeName(typeName, username) {
    const type = getType(typeName);
    if (!type) return { ok: false, message: "Nutzung: !done wind NAME oder !done eis NAME" };

    username = username.toLowerCase();
    const index = type.list.indexOf(username);

    if (index === -1) return { ok: false, message: `${username} ist nicht bei ${type.name}.` };

    type.list.splice(index, 1);
    addRemoved(username);
    addHistory(`${username} aus ${type.name} entfernt`);
    saveData();

    return { ok: true, message: `${type.icon} ${username} wurde aus ${type.name} entfernt.` };
}

function move(typeName, username, newPosition) {
    const type = getType(typeName);
    if (!type) return { ok: false, message: "Nutzung: !move wind NAME PLATZ oder !move eis NAME PLATZ" };

    username = username.toLowerCase();
    const index = type.list.indexOf(username);

    if (index === -1) return { ok: false, message: `${username} ist nicht bei ${type.name}.` };
    if (newPosition < 1 || newPosition > type.list.length) return { ok: false, message: "Ungültige Position." };

    type.list.splice(index, 1);
    type.list.splice(newPosition - 1, 0, username);
    addHistory(`${username} bei ${type.name} auf Platz ${newPosition}`);
    saveData();

    return { ok: true, message: `${type.icon} ${username} wurde bei ${type.name} auf Platz ${newPosition} verschoben.` };
}

function moveUp(typeName, username) {
    const type = getType(typeName);
    if (!type) return { ok: false, message: "Unbekannter Typ." };

    username = username.toLowerCase();
    const index = type.list.indexOf(username);

    if (index <= 0) return { ok: false, message: "Kann nicht weiter nach oben." };

    [type.list[index - 1], type.list[index]] = [type.list[index], type.list[index - 1]];
    addHistory(`${username} nach oben verschoben`);
    saveData();

    return { ok: true, message: `${username} wurde nach oben verschoben.` };
}

function moveDown(typeName, username) {
    const type = getType(typeName);
    if (!type) return { ok: false, message: "Unbekannter Typ." };

    username = username.toLowerCase();
    const index = type.list.indexOf(username);

    if (index === -1 || index >= type.list.length - 1) {
        return { ok: false, message: "Kann nicht weiter nach unten." };
    }

    [type.list[index + 1], type.list[index]] = [type.list[index], type.list[index + 1]];
    addHistory(`${username} nach unten verschoben`);
    saveData();

    return { ok: true, message: `${username} wurde nach unten verschoben.` };
}

function reorder(typeName, newOrder) {
    const type = getType(typeName);
    if (!type) return { ok: false, message: "Unbekannter Typ." };

    if (!Array.isArray(newOrder)) {
        return { ok: false, message: "Ungültige Reihenfolge." };
    }

    const current = [...type.list].sort();
    const incoming = [...newOrder].map(u => u.toLowerCase()).sort();

    if (JSON.stringify(current) !== JSON.stringify(incoming)) {
        return { ok: false, message: "Reihenfolge passt nicht zur aktuellen Liste." };
    }

    const cleanOrder = newOrder.map(u => u.toLowerCase());

if (JSON.stringify(type.list) === JSON.stringify(cleanOrder)) {
    return { ok: true, message: "Reihenfolge unverändert." };
}

type.list.length = 0;
type.list.push(...cleanOrder);

addHistory(`${type.name} per Drag & Drop sortiert`);
saveData();

    return { ok: true, message: `${type.name} wurde neu sortiert.` };
}

function removePositions(typeName, positionsText) {
    const type = getType(typeName);
    if (!type) return { ok: false, message: "Nutzung: !remove wind 1,3 oder !remove eis 1,3" };

    const positions = positionsText
        .split(",")
        .map(x => parseInt(x.trim()))
        .filter(x => !isNaN(x))
        .sort((a, b) => b - a);

    const removedUsers = [];

    positions.forEach(pos => {
        if (pos >= 1 && pos <= type.list.length) {
            const user = type.list.splice(pos - 1, 1)[0];
            addRemoved(user);
            removedUsers.push(user);
            addHistory(`${user} aus ${type.name} entfernt`);
        }
    });

    saveData();

    if (removedUsers.length === 0) return { ok: false, message: "Keine gültigen Plätze gefunden." };

    return { ok: true, message: `${type.icon} Entfernt: ${removedUsers.join(", ")}` };
}

function allowAgain(username) {
    if (!username) return { ok: false, message: "Kein Name angegeben." };

    username = username.toLowerCase();

    used.delete(username);

    const index = removed.indexOf(username);
    if (index !== -1) removed.splice(index, 1);

    addHistory(`${username} wieder freigegeben`);
    saveData();

    return { ok: true, message: `${username} darf sich wieder anmelden.` };
}

function clearAll() {
    wind.length = 0;
    eis.length = 0;
    removed.length = 0;
    history.length = 0;
    used.clear();
    saveData();

    return { ok: true, message: "🎒 Rucksack wurde komplett geleert." };
}

function getState() {
    return {
        wind,
        eis,
        removed,
        history,
        total: wind.length + eis.length
    };
}

module.exports = {
    loadData,
    saveData,
    getType,
    join,
    getPlace,
    next,
    removeName,
    move,
    moveUp,
    moveDown,
    reorder,
    removePositions,
    allowAgain,
    clearAll,
    getState
};