const express = require("express");

function startWebsite(queue, settings) {
    const app = express();

    app.use(express.json());
    app.use(express.static("public"));

    app.get("/api/state", (req, res) => {
        const state = queue.getState();

        res.json({
            wind: state.wind,
            eis: state.eis,
            removed: state.removed,
            history: state.history,
            total: state.total,
            entriesOpen: settings.entriesOpen,
            publicListVisible: settings.publicListVisible
        });
    });

    app.get("/admin", (req, res) => {
        res.redirect("/admin.html");
    });

    app.get("/login", (req, res) => {
        res.redirect("/login.html");
    });

    app.post("/api/login", (req, res) => {
        const { token } = req.body;

        if (token === settings.adminToken) {
            return res.json({ ok: true });
        }

        res.json({ ok: false, message: "Falsches Passwort." });
    });

    app.post("/api/admin/action", (req, res) => {
        const auth = req.headers["x-admin-token"];

        if (auth !== settings.adminToken) {
            return res.status(403).json({
                ok: false,
                message: "Kein Admin-Zugriff."
            });
        }

        const { action, type, user } = req.body;

        let result;

        if (action === "next") result = queue.next(type);
        if (action === "remove") result = queue.removeName(type, user);
        if (action === "up") result = queue.moveUp(type, user);
        if (action === "down") result = queue.moveDown(type, user);
        if (action === "allow") result = queue.allowAgain(user);
        if (action === "clear") result = queue.clearAll();
        if (action === "reorder") result = queue.reorder(type, req.body.order);

        if (!result) {
            return res.json({ ok: false, message: "Unbekannte Aktion." });
        }

        res.json(result);
    });

    app.listen(3000, () => {
        console.log("🎒 Webseite läuft auf http://localhost:3000");
        console.log("🔒 Login: http://localhost:3000/login");
        console.log("👑 Admin: http://localhost:3000/admin");
    });
}

module.exports = {
    startWebsite
};