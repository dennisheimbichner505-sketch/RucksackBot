# 🎒 RucksackBot

Ein moderner Twitch-Rucksack-Bot mit Live-Weboberfläche, Admin-Dashboard und OBS-Unterstützung.

Entwickelt von **Dennis Heimbichner**

---

# ✨ Funktionen

## 🎮 Twitch

- !wind
- !eis
- !platz

## 👑 Moderation

- Nächster Spieler
- Spieler entfernen
- Spieler wieder freigeben
- Drag & Drop Sortierung
- Verlauf
- Warteschlange komplett leeren

## 🌐 Webseite

- Live-Rucksack
- Wind & Eis getrennt
- Automatische Aktualisierung
- Modernes Design

## 🔒 Adminbereich

- Passwortgeschützt
- Drag & Drop
- Verlauf
- Freigeben
- Entfernen

---

# 📦 Installation

## Voraussetzungen

- Git
- Node.js (LTS)

Git:

https://git-scm.com/downloads

Node.js:

https://nodejs.org/

---

## Repository herunterladen

```bash
git clone https://github.com/dennisheimbichner505-sketch/RucksackBot.git
```

Danach:

```bash
cd RucksackBot
```

---

## Pakete installieren

```bash
npm install
```

---

## config.json erstellen

Die Datei

```
config.example.json
```

kopieren und umbenennen in

```
config.json
```

Danach folgende Werte eintragen:

```json
{
    "twitchName": "DEIN_TWITCHNAME",
    "oauthToken": "oauth:DEIN_OAUTH_TOKEN",
    "adminToken": "DEIN_PASSWORT"
}
```

---

# 🚀 Starten

```bash
start.bat
```

oder

```bash
node bot.js
```

---

# 🌐 Webseiten

## Zuschauer

```
http://localhost:3000
```

---

## Login

```
http://localhost:3000/login
```

---

## Admin

```
http://localhost:3000/admin
```

---

# 🎥 OBS

Demnächst verfügbar:

```
http://localhost:3000/overlay
```

Einfach als Browserquelle in OBS hinzufügen.

---

# 🔄 Updates

Neue Version installieren:

```bash
git pull
npm install
```

Danach Bot neu starten.

---

# 🎮 Twitch-Befehle

## Spieler

```
!wind
!eis
!platz
```

---

## Moderatoren

```
!next wind
!next eis

!done wind NAME
!done eis NAME

!move wind NAME PLATZ
!move eis NAME PLATZ
```

---

# 📁 Projektstruktur

```
RucksackBot
│
├── data
├── public
│   ├── css
│   ├── js
│   ├── admin.html
│   ├── index.html
│   └── login.html
│
├── bot.js
├── commands.js
├── queue.js
├── website.js
├── start.bat
├── package.json
└── config.example.json
```

---

# 🛣️ Roadmap

## Version 1.5

- OBS Overlay
- Bessere Animationen
- Live-Ansicht

## Version 1.6

- Login mit Sessions
- Rollen (Admin / Moderator)

## Version 2.0

- Plugin-System
- Dashboard
- Auto-Updater
- Mehrere Warteschlangen
- Erweiterte OBS-Unterstützung

---

# ❤️ Mitwirken

Verbesserungsvorschläge und Pull Requests sind jederzeit willkommen.

---

# 📜 Lizenz

MIT License

---

# 👨‍💻 Entwickler

**Dennis Heimbichner**

GitHub:

https://github.com/dennisheimbichner505-sketch
