const fs = require("fs");

const SAVE_FILE = "rucksack.json";

const wind = [];
const eis = [];
const used = new Set();

function loadData() {
    if (!fs.existsSync(SAVE_FILE)) {
        saveData();
        return;
    }

    const data = JSON.parse(fs.readFileSync(SAVE_FILE, "utf8"));

    wind.push(...(data.wind || []));
    eis.push(...(data.eis || []));
    (data.used || []).forEach(user => used.add(user));
}

function saveData() {
    const data = {
        wind,
        eis,
        used: Array.from(used)
    };

    fs.writeFileSync(SAVE_FILE, JSON.stringify(data, null, 2));
}

function getType(type) {
    if (type === "wind") {
        return {
            key: "wind",
            name: "WIND",
            icon: "🟩",
            list: wind
        };
    }

    if (type === "eis") {
        return {
            key: "eis",
            name: "EIS",
            icon: "🟦",
            list: eis
        };
    }

    return null;
}

function join(username, typeName) {
    const type = getType(typeName);

    if (!type) {
        return { ok: false, message: "Unbekannter Typ." };
    }

    if (used.has(username)) {
        return { ok: false, message: `@${username}, du bist bereits im Rucksack.` };
    }

    type.list.push(username);
    used.add(username);
    saveData();

    return {
        ok: true,
        message: `${type.icon} @${username} ist bei ${type.name} angemeldet! Platz #${type.list.length}`
    };
}

function getPlace(username) {
    const windIndex = wind.indexOf(username);
    if (windIndex !== -1) {
        return {
            type: "wind",
            name: "WIND",
            icon: "🟩",
            position: windIndex + 1
        };
    }

    const eisIndex = eis.indexOf(username);
    if (eisIndex !== -1) {
        return {
            type: "eis",
            name: "EIS",
            icon: "🟦",
            position: eisIndex + 1
        };
    }

    return null;
}

function next(typeName) {
    const type = getType(typeName);

    if (!type) {
        return { ok: false, message: "Nutzung: !next wind oder !next eis" };
    }

    if (type.list.length === 0) {
        return { ok: false, message: `${type.icon} ${type.name} ist leer.` };
    }

    const user = type.list.shift();
    saveData();

    return {
        ok: true,
        message: `${type.icon} ${user} wurde aus ${type.name} entfernt.`
    };
}

function removeName(typeName, username) {
    const type = getType(typeName);

    if (!type) {
        return { ok: false, message: "Nutzung: !done wind NAME oder !done eis NAME" };
    }

    const index = type.list.indexOf(username);

    if (index === -1) {
        return { ok: false, message: `${username} ist nicht bei ${type.name}.` };
    }

    type.list.splice(index, 1);
    saveData();

    return {
        ok: true,
        message: `${type.icon} ${username} wurde aus ${type.name} entfernt.`
    };
}

function move(typeName, username, newPosition) {
    const type = getType(typeName);

    if (!type) {
        return { ok: false, message: "Nutzung: !move wind NAME PLATZ oder !move eis NAME PLATZ" };
    }

    const index = type.list.indexOf(username);

    if (index === -1) {
        return { ok: false, message: `${username} ist nicht bei ${type.name}.` };
    }

    if (newPosition < 1 || newPosition > type.list.length) {
        return { ok: false, message: "Ungültige Position." };
    }

    type.list.splice(index, 1);
    type.list.splice(newPosition - 1, 0, username);
    saveData();

    return {
        ok: true,
        message: `${type.icon} ${username} wurde bei ${type.name} auf Platz ${newPosition} verschoben.`
    };
}

function removePositions(typeName, positionsText) {
    const type = getType(typeName);

    if (!type) {
        return { ok: false, message: "Nutzung: !remove wind 1,3 oder !remove eis 1,3" };
    }

    const positions = positionsText
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

    if (removed.length === 0) {
        return { ok: false, message: "Keine gültigen Plätze gefunden." };
    }

    return {
        ok: true,
        message: `${type.icon} Entfernt: ${removed.join(", ")}`
    };
}

function clearAll() {
    wind.length = 0;
    eis.length = 0;
    used.clear();
    saveData();

    return {
        ok: true,
        message: "🎒 Rucksack wurde komplett geleert."
    };
}

function getState() {
    return {
        wind,
        eis,
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
    removePositions,
    clearAll,
    getState
};