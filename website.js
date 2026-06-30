const express = require("express");
const session = require("express-session");
const path = require("path");
const { loadConfig, saveConfig } = require("./configManager");

function startWebsite(queue, settings) {
    const app = express();

    app.use(express.json());

    app.use(session({
        secret: settings.adminToken || "rucksackbot-secret",
        resave: false,
        saveUninitialized: false
    }));

    function requireAdmin(req, res, next) {
        if (req.session && req.session.isAdmin) return next();
        return res.redirect("/login");
    }

    app.get("/admin", requireAdmin, (req, res) => {
        res.sendFile(path.join(__dirname, "public", "admin.html"));
    });

    app.get("/settings", requireAdmin, (req, res) => {
        res.sendFile(path.join(__dirname, "public", "settings.html"));
    });

    app.get("/login", (req, res) => {
        res.sendFile(path.join(__dirname, "public", "login.html"));
    });

    app.get("/overlay", (req, res) => {
        res.sendFile(path.join(__dirname, "public", "overlay.html"));
    });

    app.post("/api/login", (req, res) => {
        const { token } = req.body;

        if (token === settings.adminToken) {
            req.session.isAdmin = true;
            return res.json({ ok: true });
        }

        res.json({ ok: false, message: "Falsches Passwort." });
    });

    app.post("/api/logout", (req, res) => {
        req.session.destroy(() => {
            res.json({ ok: true });
        });
    });

    app.get("/api/settings", requireAdmin, (req, res) => {
        const config = loadConfig();

        res.json({
            twitchName: config.twitchName || "",
            oauthToken: config.oauthToken || "",
            adminToken: config.adminToken || "admin",
            port: config.port || 3000
        });
    });

    app.post("/api/settings", requireAdmin, (req, res) => {
        const { twitchName, oauthToken, adminToken, port } = req.body;

        const updated = saveConfig({
            twitchName,
            oauthToken,
            adminToken,
            port: Number(port) || 3000
        });

        settings.adminToken = updated.adminToken || "admin";

        res.json({
            ok: true,
            message: "Einstellungen gespeichert. Bot bitte neu starten."
        });
    });

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

    app.post("/api/admin/action", requireAdmin, (req, res) => {
        const { action, type, user, order } = req.body;

        let result;

        if (action === "next") result = queue.next(type);
        if (action === "remove") result = queue.removeName(type, user);
        if (action === "up") result = queue.moveUp(type, user);
        if (action === "down") result = queue.moveDown(type, user);
        if (action === "allow") result = queue.allowAgain(user);
        if (action === "clear") result = queue.clearAll();
        if (action === "reorder") result = queue.reorder(type, order);

        if (!result) {
            return res.json({ ok: false, message: "Unbekannte Aktion." });
        }

        res.json(result);
    });

    app.use(express.static("public"));

    const port = settings.port || 3000;

    app.listen(port, () => {
        console.log(`🎒 Webseite läuft auf http://localhost:${port}`);
        console.log(`🔒 Login: http://localhost:${port}/login`);
        console.log(`👑 Admin: http://localhost:${port}/admin`);
        console.log(`⚙️ Einstellungen: http://localhost:${port}/settings`);
        console.log(`📺 Overlay: http://localhost:${port}/overlay`);
    });
}

module.exports = {
    startWebsite
};