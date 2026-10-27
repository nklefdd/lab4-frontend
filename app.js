const API_URL = "http://127.0.0.1:8000/api";

const filtersEl = document.getElementById("filters");
const statusEl = document.getElementById("status");
const gridEl = document.getElementById("products");

let categories = [];
let products = [];
let activeCategoryId = null;

async function getJSON(path) {
  const response = await fetch(API_URL + path);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data && data.error ? data.error.message : "Помилка сервера (" + response.status + ").";
    throw new Error(message);
  }
  return data;
}

function formatPrice(value) {
  return Number(value).toLocaleString("uk-UA", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " ₴";
}

function metalType(metal) {
  const name = metal.toLowerCase();
  if (name.includes("злот") || name.includes("gold")) return "gold";
  if (name.includes("срібл") || name.includes("silver")) return "silver";
  return "other";
}

function createElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function renderFilters() {
  filtersEl.replaceChildren();

  const items = [{ id: null, name: "Усі" }, ...categories];
  for (const category of items) {
    const button = createElement("button", "chip", category.name);
    button.type = "button";
    button.setAttribute("aria-pressed", String(category.id === activeCategoryId));
    button.addEventListener("click", () => {
      activeCategoryId = category.id;
      renderFilters();
      renderProducts();
    });
    filtersEl.append(button);
  }
}

function renderProducts() {
  gridEl.replaceChildren();
  statusEl.className = "status";

  const visible = activeCategoryId === null
    ? products
    : products.filter((p) => p.category === activeCategoryId);

  if (visible.length === 0) {
    statusEl.textContent = products.length === 0
      ? "У каталозі ще немає прикрас. Додайте їх через API."
      : "У цій категорії поки немає прикрас.";
    return;
  }
  statusEl.textContent = "";

  for (const product of visible) {
    const card = createElement("article", "card");
    card.append(
      createElement("p", "card-category", product.category_name),
      createElement("h2", "card-name", product.name),
      createElement("p", "card-description", product.description || "Опису поки немає."),
    );

    const bottom = createElement("div", "card-bottom");
    bottom.append(createElement("span", "price", formatPrice(product.price)));

    const meta = createElement("span", "meta");
    const dot = createElement("span", "dot");
    dot.dataset.metal = metalType(product.metal);
    meta.append(dot, product.metal);

    const stock = createElement("span", product.stock > 0 ? "" : "stock-out",
      product.stock > 0 ? " · в наявності: " + product.stock : " · немає в наявності");
    meta.append(stock);

    bottom.append(meta);
    card.append(bottom);
    gridEl.append(card);
  }
}

function showError(message) {
  filtersEl.replaceChildren();
  gridEl.replaceChildren();
  statusEl.className = "status error";
  statusEl.textContent = message;

  const retry = createElement("button", "retry", "Спробувати ще раз");
  retry.type = "button";
  retry.addEventListener("click", load);
  statusEl.append(retry);
}

async function load() {
  statusEl.className = "status";
  statusEl.textContent = "Завантаження…";

  try {
    [categories, products] = await Promise.all([getJSON("/categories"), getJSON("/products")]);
    renderFilters();
    renderProducts();
  } catch (error) {
    if (error instanceof TypeError) {
      // fetch кидає TypeError, коли немає зв'язку або CORS не дозволяє запит
      showError("Не вдалося підключитися до сервера " + API_URL + ". Перевірте, що бекенд запущено і що фронтенд відкрито на порту 5500.");
    } else {
      showError(error.message);
    }
  }
}

load();
