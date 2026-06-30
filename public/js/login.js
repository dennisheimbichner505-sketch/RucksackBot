async function login() {
    const token = document.getElementById("tokenInput").value;

    const response = await fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ token })
    });

    const data = await response.json();

    if (!data.ok) {
        document.getElementById("message").innerText = "❌ Falsches Passwort.";
        return;
    }

    localStorage.setItem("adminToken", token);
    window.location.href = "/admin";
}