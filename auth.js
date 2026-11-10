const API_URL = "http://127.0.0.1:8000/api";

function clearTokens() {
  sessionStorage.removeItem("access");
  sessionStorage.removeItem("refresh");
}

async function getCurrentUser() {
  let access = sessionStorage.getItem("access");
  const refresh = sessionStorage.getItem("refresh");

  if (!access && !refresh) {
    return null;
  }

  let response = await fetch(API_URL + "/auth/me", {
    headers: {Authorization: "Bearer " + access}
  });

  if (response.status === 401 && refresh) {
    const refreshResponse = await fetch(API_URL + "/auth/refresh", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({refresh: refresh})
    });

    if (refreshResponse.status === 400 || refreshResponse.status === 401) {
      clearTokens();
      return null;
    }
    if (!refreshResponse.ok) {
      throw new Error("Не вдалося оновити токен. Спробуйте пізніше.");
    }

    const tokens = await refreshResponse.json();
    access = tokens.access;
    sessionStorage.setItem("access", access);
    response = await fetch(API_URL + "/auth/me", {
      headers: {Authorization: "Bearer " + access}
    });
  }

  if (response.status === 401) {
    clearTokens();
    return null;
  }
  if (!response.ok) {
    throw new Error("Не вдалося отримати дані користувача.");
  }
  return response.json();
}

function showMenu(user) {
  if (user) {
    document.getElementById("login-link").hidden = true;
    document.getElementById("register-link").hidden = true;
    document.getElementById("logout-button").hidden = false;
    document.getElementById("user-name").textContent = user.first_name || user.username;
  } else {
    document.getElementById("login-link").hidden = false;
    document.getElementById("register-link").hidden = false;
    document.getElementById("logout-button").hidden = true;
    document.getElementById("user-name").textContent = "";
  }
}

function getNextPage() {
  const next = new URLSearchParams(location.search).get("next");
  if (next === "profile.html") {
    return "profile.html";
  }
  return "index.html";
}

function showFormErrors(data) {
  const box = document.getElementById("form-errors");
  const labels = {
    username: "Логін",
    first_name: "Ім’я",
    last_name: "Прізвище",
    email: "Електронна пошта",
    password: "Пароль",
    password_confirmation: "Повтор пароля"
  };

  box.textContent = data.error.message;
  const details = data.error.details;
  if (details) {
    for (const field in details) {
      const line = document.createElement("p");
      line.textContent = (labels[field] || field) + ": " + details[field].join(" ");
      box.append(line);
    }
  }
}

function showConnectionError(elementId) {
  document.getElementById(elementId).textContent = "Не вдалося виконати запит. Перевір з’єднання та спробуй ще раз.";
}

document.getElementById("logout-button").addEventListener("click", function () {
  clearTokens();
  location.replace("index.html");
});
