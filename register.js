const registerForm = document.getElementById("register-form");

async function openRegistration() {
  try {
    const user = await getCurrentUser();
    if (user) {
      location.replace("index.html");
      return;
    }
    showMenu(null);
    document.getElementById("auth-content").hidden = false;
  } catch (error) {
    showConnectionError("nav-status");
  }
}

registerForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  const button = registerForm.querySelector("button");
  button.disabled = true;
  document.getElementById("form-errors").textContent = "";

  try {
    const response = await fetch(API_URL + "/auth/register", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        username: registerForm.elements.username.value,
        first_name: registerForm.elements.first_name.value,
        last_name: registerForm.elements.last_name.value,
        email: registerForm.elements.email.value,
        password: registerForm.elements.password.value,
        password_confirmation: registerForm.elements.password_confirmation.value
      })
    });
    const data = await response.json();
    if (!response.ok) {
      showFormErrors(data);
      return;
    }
    location.replace("login.html?next=" + getNextPage());
  } catch (error) {
    showConnectionError("form-errors");
  } finally {
    button.disabled = false;
  }
});

openRegistration();
