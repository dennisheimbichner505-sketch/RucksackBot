const express = require("express");

function startWebsite(queue, settings) {
    const app = express();

    app.get("/", (req, res) => {
        const state = queue.getState();

        res.send(`
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="2">
<title>Rucksack</title>
<style>
body { font-family: Arial, sans-serif; background:#111; color:white; padding:30px; }
h1 { text-align:center; font-size:48px; }
.status,.stats { text-align:center; margin-bottom:20px; font-size:22px; }
.columns { display:flex; gap:25px; }
.column { flex:1; background:#1c1c1c; padding:20px; border-radius:14px; }
.wind { border:4px solid #00c853; }
.eis { border:4px solid #2196f3; }
.column h2 { text-align:center; font-size:34px; }
.ticket { background:#2b2b2b; padding:15px; margin-bottom:10px; border-radius:8px; font-size:24px; display:flex; gap:15px; }
.empty { text-align:center; color:#aaa; font-size:22px; }
</style>
</head>
<body>
<h1>🎒 Rucksack 🎒</h1>

<div class="status">
Status: ${settings.entriesOpen ? "🟢 OFFEN" : "🔴 GESCHLOSSEN"}<br>
Öffentliche Liste: ${settings.publicListVisible ? "🟢 AKTIV" : "🔴 AUS"}
</div>

<div class="stats">
🟩 Wind: ${state.wind.length} | 🟦 Eis: ${state.eis.length} | Gesamt: ${state.total}
</div>

<div class="columns">
    <div class="column wind">
        <h2>🟩 Wind</h2>
        ${renderList(state.wind)}
    </div>

    <div class="column eis">
        <h2>🟦 Eis</h2>
        ${renderList(state.eis)}
    </div>
</div>
</body>
</html>
        `);
    });

    app.listen(3000, () => {
        console.log("🎒 Webseite läuft auf http://localhost:3000");
    });
}

function renderList(list) {
    if (!list.length) return `<p class="empty">Leer</p>`;

    return list.map((user, index) => `
        <div class="ticket">
            <span>#${index + 1}</span>
            <strong>${user}</strong>
        </div>
    `).join("");
}

module.exports = {
    startWebsite
};