const DEFAULT_SYMBOL = "AAPL";
const DEFAULT_INTERVAL = "1d";

let currentSymbol = DEFAULT_SYMBOL;
let currentInterval = DEFAULT_INTERVAL;

let favorites = JSON.parse(
  localStorage.getItem("turbo_favorites") || "null"
);

if (!Array.isArray(favorites)) {
  favorites = [
    {
      symbol: "AAPL",
      name: "Apple",
      icon: "🍎"
    },
    {
      symbol: "NVDA",
      name: "NVIDIA",
      icon: "🟢"
    },
    {
      symbol: "TSLA",
      name: "Tesla",
      icon: "🚗"
    },
    {
      symbol: "BTC-USD",
      name: "Bitcoin",
      icon: "₿"
    },
    {
      symbol: "ETH-USD",
      name: "Ethereum",
      icon: "Ξ"
    }
  ];
}

function saveFavorites() {
  localStorage.setItem(
    "turbo_favorites",
    JSON.stringify(favorites)
  );
}

function setStatus(message, error = false) {
  const element = document.getElementById("status");

  if (!element) {
    return;
  }

  element.textContent = message;
  element.classList.toggle("error", error);
}

function renderFavorites() {
  const container =
    document.getElementById("favorites");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  favorites.forEach((favorite, index) => {
    const item = document.createElement("li");

    item.className = "favorite";

    item.innerHTML = `
      <span>${favorite.icon || "📈"}</span>

      <span class="fav-text">
        <b class="fav-name">
          ${favorite.name || favorite.symbol}
        </b>

        <span class="fav-symbol">
          ${favorite.symbol}
        </span>

        <span
          class="fav-price"
          id="favorite-price-${index}"
        >
          ...
        </span>
      </span>

      <button
        class="delete"
        type="button"
        title="Eliminar"
      >
        ×
      </button>
    `;

    item.querySelector(".delete").addEventListener(
      "click",
      event => {
        event.stopPropagation();

        favorites.splice(index, 1);

        saveFavorites();
        renderFavorites();
      }
    );

    item.addEventListener(
      "click",
      () => {
        loadSymbol(favorite.symbol);
      }
    );

    container.appendChild(item);

    loadFavoritePrice(
      favorite.symbol,
      index
    );
  });
}

async function loadFavoritePrice(
  symbol,
  index
) {
  try {
    const data =
      await TurboDatafeed.getBars(
        symbol,
        "1d"
      );

    const last =
      data.bars[data.bars.length - 1];

    const element =
      document.getElementById(
        `favorite-price-${index}`
      );

    if (!element || !last) {
      return;
    }

    element.textContent =
      Number(last.close).toLocaleString(
        "en-US",
        {
          maximumFractionDigits: 4
        }
      );

  } catch (error) {
    console.warn(
      `No se pudo cargar ${symbol}`,
      error
    );
  }
}

async function loadSymbol(symbol) {
  const normalized =
    String(symbol)
      .trim()
      .toUpperCase();

  if (!normalized) {
    setStatus(
      "Introduce un símbolo",
      true
    );

    return;
  }

  currentSymbol = normalized;

  const input =
    document.getElementById(
      "symbolInput"
    );

  if (input) {
    input.value = currentSymbol;
  }

  setStatus(
    `Cargando ${currentSymbol}...`
  );

  try {
    const data =
      await TurboDatafeed.getBars(
        currentSymbol,
        currentInterval
      );

    if (
      !data ||
      !Array.isArray(data.bars) ||
      data.bars.length === 0
    ) {
      throw new Error(
        `No hay velas para ${currentSymbol}`
      );
    }

    TurboChart.setData(
      data.bars
    );

    const title =
      document.getElementById(
        "currentSymbol"
      );

    if (title) {
      title.textContent =
        data.symbol || currentSymbol;
    }

    const provider =
      document.getElementById(
        "provider"
      );

    if (provider) {
      provider.textContent =
        data.provider || "Yahoo Finance";
    }

    setStatus(
      `${data.bars.length.toLocaleString(
        "es-ES"
      )} velas · ${
        data.provider || "Yahoo Finance"
      }`
    );

  } catch (error) {

    console.error(
      "TurboMarket data error:",
      error
    );

    setStatus(
      `Error: ${error.message}`,
      true
    );
  }
}

function addFavorite() {
  const input =
    document.getElementById(
      "symbolInput"
    );

  const symbol =
    input?.value
      ?.trim()
      ?.toUpperCase();

  if (!symbol) {
    return;
  }

  const exists =
    favorites.some(
      favorite =>
        favorite.symbol === symbol
    );

  if (!exists) {
    favorites.push({
      symbol,
      name: symbol,
      icon: "⭐"
    });

    saveFavorites();
    renderFavorites();
  }

  loadSymbol(symbol);
}

function setTheme(theme) {
  document.body.classList.toggle(
    "light",
    theme === "light"
  );

  localStorage.setItem(
    "turbo_theme",
    theme
  );

  if (window.TurboChart) {
    TurboChart.theme(theme);
  }
}

function setupSidebarResize() {
  const sidebar =
    document.getElementById(
      "sidebar"
    );

  const resizer =
    document.getElementById(
      "resizer"
    );

  if (!sidebar || !resizer) {
    return;
  }

  let dragging = false;

  resizer.addEventListener(
    "mousedown",
    () => {
      dragging = true;
      document.body.style.userSelect =
        "none";
    }
  );

  document.addEventListener(
    "mousemove",
    event => {
      if (!dragging) {
        return;
      }

      const width = Math.min(
        500,
        Math.max(
          180,
          event.clientX
        )
      );

      sidebar.style.width =
        `${width}px`;
    }
  );

  document.addEventListener(
    "mouseup",
    () => {
      dragging = false;

      document.body.style.userSelect =
        "";
    }
  );
}

function setupIntervals() {
  document
    .querySelectorAll(
      "#intervals button"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          currentInterval =
            button.dataset.interval;

          document
            .querySelectorAll(
              "#intervals button"
            )
            .forEach(
              item =>
                item.classList.remove(
                  "active"
                )
            );

          button.classList.add(
            "active"
          );

          loadSymbol(
            currentSymbol
          );
        }
      );
    });
}

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const theme =
      localStorage.getItem(
        "turbo_theme"
      ) || "dark";

    const themeSelect =
      document.getElementById(
        "themeSelect"
      );

    if (themeSelect) {
      themeSelect.value =
        theme;

      themeSelect.addEventListener(
        "change",
        event => {
          setTheme(
            event.target.value
          );
        }
      );
    }

    setTheme(theme);

    const chartContainer =
      document.getElementById(
        "chart"
      );

    if (!chartContainer) {
      console.error(
        "No existe #chart"
      );

      return;
    }

    TurboChart.create(
      chartContainer,
      theme
    );

    renderFavorites();

    const searchForm =
      document.getElementById(
        "searchForm"
      );

    searchForm?.addEventListener(
      "submit",
      event => {
        event.preventDefault();

        const value =
          document.getElementById(
            "symbolInput"
          )?.value;

        loadSymbol(value);
      }
    );

    document
      .getElementById(
        "favoriteBtn"
      )
      ?.addEventListener(
        "click",
        addFavorite
      );

    document
      .getElementById(
        "fitBtn"
      )
      ?.addEventListener(
        "click",
        () => {
          TurboChart.fit();
        }
      );

    document
      .getElementById(
        "collapseBtn"
      )
      ?.addEventListener(
        "click",
        () => {

          document
            .getElementById(
              "sidebar"
            )
            ?.classList.toggle(
              "collapsed"
            );
        }
      );

    setupIntervals();
    setupSidebarResize();

    loadSymbol(
      DEFAULT_SYMBOL
    );
  }
);