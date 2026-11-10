const loginForm = document.getElementById("login-form");
document.getElementById("signup-link").href = "register.html?next=" + getNextPage();

async function openLogin() {
  try {
    const user = await getCurrentUser();
    if (user) {
      location.replace("../index.html");
      return;
    }
    showMenu(null);
    document.getElementById("auth-content").hidden = false;
  } catch (error) {
    showConnectionError("nav-status");
  }
}

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  const button = loginForm.querySelector("button");
  button.disabled = true;
  document.getElementById("form-errors").textContent = "";

  try {
    const response = await fetch(API_URL + "/auth/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        username: loginForm.elements.username.value,
        password: loginForm.elements.password.value
      })
    });
    const data = await response.json();
    if (!response.ok) {
      showFormErrors(data);
      return;
    }
    sessionStorage.setItem("access", data.access);
    sessionStorage.setItem("refresh", data.refresh);
    location.replace(getNextPage());
  } catch (error) {
    showConnectionError("form-errors");
  } finally {
    button.disabled = false;
  }
});

openLogin();
