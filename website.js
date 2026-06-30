const express = require("express");
const session = require("express-session");
const path = require("path");

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
        res.redirect("/login");
    }

    app.get("/admin", requireAdmin, (req, res) => {
        res.sendFile(path.join(__dirname, "public", "admin.html"));
    });

    app.get("/admin.html", requireAdmin, (req, res) => {
        res.sendFile(path.join(__dirname, "public", "admin.html"));
    });

    app.get("/login", (req, res) => {
        res.sendFile(path.join(__dirname, "public", "login.html"));
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

    app.get("/overlay", (req, res) => {
        res.redirect("/overlay.html");
    });

    app.get("/dashboard", (req, res) => {
        res.redirect("/dashboard.html");
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

    app.use(express.static("public"));

    app.listen(3000, () => {
        console.log("🎒 Webseite läuft auf http://localhost:3000");
        console.log("🔒 Login: http://localhost:3000/login");
        console.log("👑 Admin: http://localhost:3000/admin");
        console.log("📺 Overlay: http://localhost:3000/overlay");
    });
}

module.exports = {
    startWebsite
};