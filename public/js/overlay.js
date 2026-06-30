async function loadOverlay() {
    const response = await fetch("/api/state");
    const data = await response.json();

    renderList("overlayWind", data.wind);
    renderList("overlayEis", data.eis);
}

function renderList(id, list) {
    const element = document.getElementById(id);

    if (!list.length) {
        element.innerHTML = `<div class="overlay-empty">Leer</div>`;
        return;
    }

    element.innerHTML = list.map((user, index) => `
        <div class="overlay-ticket">
            <span class="overlay-position">#${index + 1}</span>
            <span class="overlay-user">${user}</span>
        </div>
    `).join("");
}

loadOverlay();
setInterval(loadOverlay, 1000);