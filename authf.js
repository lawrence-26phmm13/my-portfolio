const authForm = document.getElementById("authForm");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const nameField = document.getElementById("nameField");
const authMessage = document.getElementById("authMessage");
let mode = "login";

async function checkExistingLogin() {
  try {
    const response = await fetch("/api/auth/me");
    if (response.ok) window.location.href = "/portfolio.html";
  } catch (error) {
    console.log("Not logged in yet.");
  }
}
checkExistingLogin();

function setMode(nextMode) {
  mode = nextMode;
  const registering = mode === "register";
  loginTab.classList.toggle("active", !registering);
  registerTab.classList.toggle("active", registering);
  nameField.hidden = !registering;
  document.getElementById("name").required = registering;
  document.getElementById("formTitle").textContent = registering ? "Create your account" : "Welcome back!";
  document.getElementById("formSubtitle").textContent = registering
    ? "Start building a portfolio that feels like you."
    : "Sign in to continue to your portfolio.";
  document.getElementById("submitButton").innerHTML = registering
    ? 'Create my account <span>→</span>'
    : 'Login to portfolio <span>→</span>';
  document.getElementById("password").autocomplete = registering ? "new-password" : "current-password";
  authMessage.textContent = "";
}

loginTab.addEventListener("click", () => setMode("login"));
registerTab.addEventListener("click", () => setMode("register"));

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  authMessage.textContent = "Please wait...";
  authMessage.className = "message";
  const body = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  };

  try {
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Something went wrong.");
    window.location.href = "/portfolio.html";
  } catch (error) {
    authMessage.textContent = error.message;
    authMessage.classList.add("error");
  }
});
