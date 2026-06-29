function setupCommands(client, queue, settings) {
    client.on("message", (channel, tags, message, self) => {
        if (self) return;

        const username = tags.username.toLowerCase();
        const msg = message.trim().toLowerCase();
        const isMod = tags.mod || tags.badges?.broadcaster === "1";

        if (msg === "!wind") {
            if (!settings.entriesOpen) return client.say(channel, "🎒 Rucksack ist geschlossen.");
            return client.say(channel, queue.join(username, "wind").message);
        }

        if (msg === "!eis") {
            if (!settings.entriesOpen) return client.say(channel, "🎒 Rucksack ist geschlossen.");
            return client.say(channel, queue.join(username, "eis").message);
        }

        if (msg === "!platz") {
            const place = queue.getPlace(username);
            if (!place) return client.say(channel, `@${username}, du bist nicht im Rucksack.`);
            return client.say(channel, `${place.icon} @${username}, du bist bei ${place.name} auf Platz #${place.position}.`);
        }

        if (msg === "!queue") {
            if (!settings.publicListVisible) return client.say(channel, "🎒 Öffentliche Liste ist deaktiviert.");
            return sendList(client, channel, queue);
        }

        if (msg === "!rucksack") {
            if (!isMod) return;
            return sendList(client, channel, queue);
        }

        if (msg === "!open" && isMod) {
            settings.entriesOpen = true;
            return client.say(channel, "🎒 Rucksack ist geöffnet.");
        }

        if (msg === "!close" && isMod) {
            settings.entriesOpen = false;
            return client.say(channel, "🎒 Rucksack ist geschlossen.");
        }

        if (msg === "!showlist" && isMod) {
            settings.publicListVisible = true;
            return client.say(channel, "🎒 Öffentliche Liste ist aktiviert.");
        }

        if (msg === "!hidelist" && isMod) {
            settings.publicListVisible = false;
            return client.say(channel, "🎒 Öffentliche Liste ist deaktiviert.");
        }

        if (msg.startsWith("!next ") && isMod) {
            const type = msg.split(" ")[1];
            return client.say(channel, queue.next(type).message);
        }

        if (msg.startsWith("!done ") && isMod) {
            const parts = msg.split(" ");
            return client.say(channel, queue.removeName(parts[1], parts[2]?.replace("@", "")).message);
        }

        if (msg.startsWith("!move ") && isMod) {
            const parts = msg.split(" ");
            return client.say(channel, queue.move(parts[1], parts[2]?.replace("@", ""), parseInt(parts[3])).message);
        }

        if (msg.startsWith("!remove ") && isMod) {
            const parts = msg.split(" ");
            return client.say(channel, queue.removePositions(parts[1], parts[2]).message);
        }

        if (msg === "!clearrucksack" && isMod) {
            return client.say(channel, queue.clearAll().message);
        }
    });
}

function sendList(client, channel, queue) {
    const state = queue.getState();

    const windText = state.wind.length
        ? state.wind.map((u, i) => `${i + 1}. ${u}`).join(" | ")
        : "leer";

    const eisText = state.eis.length
        ? state.eis.map((u, i) => `${i + 1}. ${u}`).join(" | ")
        : "leer";

    client.say(channel, `🎒 Rucksack | 🟩 WIND: ${windText} || 🟦 EIS: ${eisText}`);
}

module.exports = {
    setupCommands
};