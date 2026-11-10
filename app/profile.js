async function openProfile() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      location.replace("login.html?next=profile.html");
      return;
    }

    showMenu(user);
    document.getElementById("profile-username").textContent = user.username;
    document.getElementById("profile-first-name").textContent = user.first_name || "Не вказано";
    document.getElementById("profile-last-name").textContent = user.last_name || "Не вказано";
    document.getElementById("profile-email").textContent = user.email;

    if (user.is_staff) {
      document.getElementById("profile-role").textContent = "Адміністратор";
    } else {
      document.getElementById("profile-role").textContent = "Користувач";
    }
    document.getElementById("auth-content").hidden = false;
  } catch (error) {
    showConnectionError("nav-status");
  }
}

openProfile();
