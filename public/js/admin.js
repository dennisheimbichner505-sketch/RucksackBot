async function loadAdmin() {
    const response = await fetch("/api/state");
    const data = await response.json();

    renderAdmin("windAdmin", "wind", data.wind);
    renderAdmin("eisAdmin", "eis", data.eis);
    renderRemoved(data.removed || []);
    renderHistory(data.history || []);
}

function renderAdmin(elementId, type, list) {
    const element = document.getElementById(elementId);

    if (!list.length) {
        element.innerHTML = `<p class="empty">Leer</p>`;
        return;
    }

    element.innerHTML = list.map((user, index) => `
        <div class="ticket draggable" draggable="true" data-user="${user}" data-type="${type}">
            <span>#${index + 1}</span>
            <strong>${user}</strong>
            <button class="danger" onclick="adminAction('remove', '${type}', '${user}')">❌</button>
        </div>
    `).join("");

    enableDragAndDrop(element, type);
}

function enableDragAndDrop(container, type) {
    const items = container.querySelectorAll(".draggable");

    items.forEach(item => {
        item.addEventListener("dragstart", () => {
            item.classList.add("dragging");
        });

        item.addEventListener("dragend", () => {
            item.classList.remove("dragging");
            saveNewOrder(container, type);
        });

        item.addEventListener("dragover", event => {
            event.preventDefault();

            const dragging = container.querySelector(".dragging");
            const afterElement = getDragAfterElement(container, event.clientY);

            if (!dragging) return;

            if (afterElement == null) {
                container.appendChild(dragging);
            } else {
                container.insertBefore(dragging, afterElement);
            }
        });
    });
}

function getDragAfterElement(container, y) {
    const elements = [...container.querySelectorAll(".draggable:not(.dragging)")];

    return elements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        }

        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

async function saveNewOrder(container, type) {
    const order = [...container.querySelectorAll(".draggable")]
        .map(item => item.dataset.user);

    await adminAction("reorder", type, null, order, false);
}

function renderRemoved(list) {
    const element = document.getElementById("removedList");

    if (!list.length) {
        element.innerHTML = `<p class="empty">Keine entfernten Spieler.</p>`;
        return;
    }

    element.innerHTML = list.map(user => `
        <div class="ticket">
            <strong>${user}</strong>
            <button onclick="adminAction('allow', null, '${user}')">🔓 Freigeben</button>
        </div>
    `).join("");
}

function renderHistory(list) {
    const element = document.getElementById("historyList");

    if (!list.length) {
        element.innerHTML = `<p class="empty">Noch kein Verlauf.</p>`;
        return;
    }

    element.innerHTML = list.map(entry => `
        <div class="ticket history-entry">${entry}</div>
    `).join("");
}

async function adminAction(action, type = null, user = null, order = null, showMessage = true) {
    const response = await fetch("/api/admin/action", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
         
        },
        body: JSON.stringify({ action, type, user, order })
    });

    const result = await response.json();

    if (showMessage) {
        showToast(result.message || "Aktion ausgeführt.");
    }

    loadAdmin();
}

function clearAll() {
    if (!confirm("Wirklich ALLES leeren?")) return;
    adminAction("clear");
}

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.innerText = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

loadAdmin();
setInterval(loadAdmin, 2000);