const filtersEl = document.getElementById("filters");
const statusEl = document.getElementById("status");
const productsEl = document.getElementById("products");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
let categories = [];
let products = [];
let activeCategoryId = null;

async function getJSON(path) {
  const response = await fetch(API_URL + path);
  if (!response.ok) {
    throw new Error("Не вдалося завантажити каталог.");
  }
  return response.json();
}

function formatPrice(value) {
  return Number(value).toLocaleString("uk-UA", {maximumFractionDigits: 2}) + " ₴";
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

function renderFilters() {
  filtersEl.replaceChildren();
  const allCategories = [{id: null, name: "Усі прикраси"}].concat(categories);
  for (const category of allCategories) {
    const button = element("button", "chip", category.name);
    button.type = "button";
    button.setAttribute("aria-pressed", String(category.id === activeCategoryId));
    button.addEventListener("click", function () {
      activeCategoryId = category.id;
      renderFilters();
      renderProducts();
    });
    filtersEl.append(button);
  }
}

function openProduct(product) {
  document.getElementById("product-dialog-category").textContent = product.category_name;
  document.getElementById("product-dialog-title").textContent = product.name;
  document.getElementById("product-dialog-description").textContent = product.description || "Опис цієї прикраси ще готується.";
  document.getElementById("product-dialog-price").textContent = formatPrice(product.price);
  document.getElementById("product-dialog-metal").textContent = product.metal;
  document.getElementById("product-dialog-stock").textContent = product.stock > 0 ? "У наявності: " + product.stock : "Немає в наявності";
  document.getElementById("product-dialog").showModal();
}

function renderProducts() {
  productsEl.replaceChildren();
  statusEl.className = "status";
  statusEl.textContent = "";
  const query = searchInput.value.trim().toLowerCase();
  const visible = products.filter(function (product) {
    const text = (product.name + " " + product.description + " " + product.category_name + " " + product.metal).toLowerCase();
    return (activeCategoryId === null || product.category === activeCategoryId) && text.includes(query);
  });
  if (sortSelect.value === "price-asc") visible.sort((a, b) => Number(a.price) - Number(b.price));
  if (sortSelect.value === "price-desc") visible.sort((a, b) => Number(b.price) - Number(a.price));
  if (sortSelect.value === "name") visible.sort((a, b) => a.name.localeCompare(b.name, "uk"));
  document.getElementById("catalog-count").textContent = String(visible.length).padStart(2, "0") + " / " + String(products.length).padStart(2, "0");

  if (visible.length === 0) {
    statusEl.textContent = products.length === 0 ? "Колекція ще попереду. Повернися трохи згодом." : "Нічого не знайшлося. Спробуй іншу назву або категорію.";
    return;
  }
  let number = 1;
  for (const product of visible) {
    const row = element("article", "product-row", "");
    row.append(element("span", "product-number", String(number).padStart(2, "0")));
    const main = element("div", "product-main", "");
    main.append(element("p", "card-category", product.category_name));
    main.append(element("h3", "card-name", product.name));
    main.append(element("p", "card-description", product.description || ""));
    const material = element("div", "product-material", product.metal);
    material.append(element("small", "", product.stock > 0 ? "У наявності: " + product.stock : "Немає в наявності"));
    const button = element("button", "product-open", "");
    button.type = "button";
    button.setAttribute("aria-label", "Деталі: " + product.name + ", " + formatPrice(product.price));
    button.append(element("span", "", formatPrice(product.price)));
    const arrow = element("span", "", "↗");
    arrow.setAttribute("aria-hidden", "true");
    button.append(arrow);
    button.addEventListener("click", function () { openProduct(product); });
    row.append(main, material, button);
    productsEl.append(row);
    number += 1;
  }
}

async function load() {
  statusEl.className = "status";
  statusEl.textContent = "Завантажуємо прикраси…";
  searchInput.disabled = true;
  sortSelect.disabled = true;
  try {
    categories = await getJSON("/categories");
    products = await getJSON("/products");
    renderFilters();
    renderProducts();
    searchInput.disabled = false;
    sortSelect.disabled = false;
  } catch (error) {
    statusEl.className = "status error";
    statusEl.textContent = "Каталог зараз недоступний. Перевір з’єднання та спробуй ще раз.";
    const retry = element("button", "retry", "Спробувати ще раз ↗");
    retry.type = "button";
    retry.addEventListener("click", load);
    statusEl.append(retry);
  }
}

async function loadMenu() {
  try {
    const user = await getCurrentUser();
    showMenu(user);
  } catch (error) {
    showConnectionError("nav-status");
  }
}

searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);
load();
loadMenu();
