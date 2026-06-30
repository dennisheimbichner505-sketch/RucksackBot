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

    window.location.href = "/admin";
}

function togglePassword() {
    const input = document.getElementById("tokenInput");
    const eye = document.getElementById("eyeButton");

    if (input.type === "password") {
        input.type = "text";
        eye.innerText = "🙈";
    } else {
        input.type = "password";
        eye.innerText = "👁️";
    }
}