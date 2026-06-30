async function loadSettings() {
    const response = await fetch("/api/settings");
    const data = await response.json();

    document.getElementById("twitchName").value = data.twitchName;
    document.getElementById("oauthToken").value = data.oauthToken;
    document.getElementById("adminToken").value = data.adminToken;
    document.getElementById("port").value = data.port;
}

async function saveSettings() {
    const payload = {
        twitchName: document.getElementById("twitchName").value,
        oauthToken: document.getElementById("oauthToken").value,
        adminToken: document.getElementById("adminToken").value,
        port: document.getElementById("port").value
    };

    const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const result = await response.json();
    showToast(result.message || "Gespeichert.");
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

loadSettings();