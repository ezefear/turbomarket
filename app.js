// Variable con tu API Key de Finnhub
const FINNHUB_API_KEY = "d9skqf9r01qopv47v4egd9skqf9r01qopv47v4f0";

// Lista por defecto
const defaultFavorites = [
  { symbol: "NASDAQ:AAPL", name: "Apple", icon: "🍎" },
  { symbol: "NASDAQ:NVDA", name: "NVIDIA", icon: "🟢" },
  { symbol: "NASDAQ:TSLA", name: "Tesla", icon: "🚗" },
  { symbol: "BINANCE:BTCUSDT", name: "Bitcoin", icon: "₿" },
  { symbol: "BINANCE:ETHUSDT", name: "Ethereum", icon: "Ξ" }
];

let favorites = JSON.parse(localStorage.getItem("turbo_favorites")) || defaultFavorites;
let currentSymbol = "NASDAQ:AAPL";
let tvWidget = null;

// --- GESTIÓN DE PRECIOS EN TIEMPO REAL ---

async function fetchPrice(symbol) {
  try {
    // 1. Criptomonedas vía Binance API
    if (symbol.includes("BINANCE:")) {
      const pair = symbol.split(":")[1];
      const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      return parseFloat(data.price).toLocaleString("en-US", { style: "currency", currency: "USD" });
    }

    // 2. Acciones vía Finnhub API
    const cleanSymbol = symbol.includes(":") ? symbol.split(":")[1] : symbol;
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${cleanSymbol}&token=${FINNHUB_API_KEY}`);
    if (!res.ok) throw new Error();
    const data = await res.json();

    return (data && data.c && data.c !== 0) ? `$${data.c.toFixed(2)}` : "---";
  } catch (e) {
    return "---";
  }
}

// --- GESTIÓN DE FAVORITOS ---

function saveFavorites() {
  localStorage.setItem("turbo_favorites", JSON.stringify(favorites));
}

function renderFavorites() {
  const listContainer = document.getElementById("favoritesList");
  if (!listContainer) return;
  listContainer.innerHTML = "";

  favorites.forEach((item, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="stock-item-info" title="${item.name}">
        <span class="icon">${item.icon || "📈"}</span>
        <div class="stock-details">
          <span class="nav-text stock-name">${item.name}</span>
          <span class="stock-price" id="price-${index}">Cargando...</span>
        </div>
      </div>
      <button class="delete-btn" title="Eliminar de favoritos">✕</button>
    `;

    // Asignación directa de eventos para cargar el gráfico al hacer clic
    const infoContainer = li.querySelector(".stock-item-info");
    infoContainer.addEventListener("click", () => {
      loadSymbol(item.symbol);
    });

    const deleteBtn = li.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeFavorite(index);
    });

    listContainer.appendChild(li);

    // Cargar precio en tiempo real mediante Finnhub / Binance
    fetchPrice(item.symbol).then(price => {
      const priceEl = document.getElementById(`price-${index}`);
      if (priceEl) priceEl.textContent = price;
    });
  });
}

function addCurrentToFavorites() {
  const input = document.getElementById("symbolInput");
  const inputVal = input ? input.value.trim().toUpperCase() : "";
  
  // Usa lo escrito en el input o el símbolo activo actual
  const symbolToAdd = inputVal || currentSymbol;

  const exists = favorites.some(fav => fav.symbol === symbolToAdd);
  if (!exists) {
    // Si contiene dos puntos (ej. BINANCE:BTCUSDT), extrae solo el nombre corto para la etiqueta
    const tickerName = symbolToAdd.includes(":") ? symbolToAdd.split(":")[1] : symbolToAdd;
    favorites.push({ symbol: symbolToAdd, name: tickerName, icon: "⭐" });
    saveFavorites();
    renderFavorites();
  }
}

function removeFavorite(index) {
  favorites.splice(index, 1);
  saveFavorites();
  renderFavorites();
}

// --- RENDERIZADO DEL GRÁFICO (TRADINGVIEW) ---

function renderChart(symbol) {
  currentSymbol = symbol;
  const container = document.getElementById("tradingview_chart");
  if (container) container.innerHTML = "";

  const isLightMode = document.body.classList.contains("light");
  const tvTheme = isLightMode ? "light" : "dark";

  if (typeof TradingView !== 'undefined') {
    tvWidget = new TradingView.widget({
      "autosize": true,
      "symbol": symbol,
      "interval": "H",
      "timezone": "Etc/UTC",
      "theme": tvTheme,
      "style": "1", // Velas
      "locale": "es",
      "toolbar_bg": isLightMode ? "#f1f3f6" : "#1b2130",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "container_id": "tradingview_chart",
      "hide_side_toolbar": false // Herramientas de dibujo activas
      
    });
  }
}

function loadSymbol(symbol) {
  renderChart(symbol);
}

function updateChart() {
  const input = document.getElementById("symbolInput");
  if (!input) return;
  const inputVal = input.value.trim().toUpperCase();
  
  if (inputVal) {
    // Carga directamente lo que escriba el usuario (sin forzar NASDAQ:)
    loadSymbol(inputVal);
  }
}

// --- CONFIGURACIÓN DE TEMA ---

function changeTheme(theme) {
  const body = document.body;
  const themeSelect = document.getElementById("themeSelect");

  if (theme === "light") {
    body.classList.add("light");
    body.classList.remove("dark");
  } else {
    body.classList.add("dark");
    body.classList.remove("light");
  }

  if (themeSelect) themeSelect.value = theme;
  localStorage.setItem("turbo_theme", theme);
  renderChart(currentSymbol);
}

function initTheme() {
  const savedTheme = localStorage.getItem("turbo_theme") || "dark";
  changeTheme(savedTheme);
}

// --- INICIALIZADORES DE EVENTOS E INTERFAZ ---

function initEvents() {
  // Buscador
  const searchForm = document.getElementById("searchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      updateChart();
    });
  }

  // Guardar Favorito
  const addFavBtn = document.getElementById("addFavoriteBtn");
  if (addFavBtn) {
    addFavBtn.addEventListener("click", addCurrentToFavorites);
  }

  // Cambiar Tema
  const themeSelect = document.getElementById("themeSelect");
  if (themeSelect) {
    themeSelect.addEventListener("change", (e) => changeTheme(e.target.value));
  }

  // Colapsar Sidebar
  const toggleBtn = document.getElementById("toggleSidebar");
  const sidebar = document.getElementById("sidebar");
  const dragbar = document.getElementById("dragbar");

  if (toggleBtn && sidebar && dragbar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      dragbar.style.pointerEvents = sidebar.classList.contains("collapsed") ? "none" : "auto";
    });
  }

  // Resizer de la barra lateral
  if (dragbar && sidebar) {
    let isDragging = false;

    dragbar.addEventListener("mousedown", () => {
      if (sidebar.classList.contains("collapsed")) return;
      isDragging = true;
      dragbar.classList.add("dragging");
      document.body.style.cursor = "col-resize";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const newWidth = e.clientX;
      if (newWidth >= 180 && newWidth <= 500) {
        sidebar.style.width = `${newWidth}px`;
      }
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        dragbar.classList.remove("dragging");
        document.body.style.cursor = "default";
      }
    });
  }
}

// Arranque de la app al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  initEvents();
  initTheme();
  renderFavorites();
});

