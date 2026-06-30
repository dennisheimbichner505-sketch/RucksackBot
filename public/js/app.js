async function loadState() {
    const response = await fetch("/api/state");
    const data = await response.json();

    const stats = document.getElementById("stats");
    if (stats) {
        stats.innerText =
            `🟩 Wind: ${data.wind.length} | 🟦 Eis: ${data.eis.length} | Gesamt: ${data.total}`;
    }

    renderList("windList", data.wind);
    renderList("eisList", data.eis);
}

function renderList(elementId, list) {
    const element = document.getElementById(elementId);

    if (!element) return;

    if (!list || !list.length) {
        element.innerHTML = `<p class="empty">Leer</p>`;
        return;
    }

    element.innerHTML = list.map((user, index) => `
        <div class="ticket">
            <span>#${index + 1}</span>
            <strong>${user}</strong>
        </div>
    `).join("");
}

loadState();
setInterval(loadState, 2000);