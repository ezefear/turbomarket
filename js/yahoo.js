window.TurboYahoo = (() => {
  const ENDPOINT = "https://turbomarket.ezefear.workers.dev";

  async function getBars(symbol, interval = "1d") {
    const url = new URL(`${ENDPOINT}/chart`);

    url.searchParams.set("symbol", symbol);
    url.searchParams.set("interval", interval);

    const response = await fetch(url.toString());

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("El Worker devolvió una respuesta inválida");
    }

    if (!response.ok) {
      throw new Error(data.error || `Yahoo API HTTP ${response.status}`);
    }

    if (!Array.isArray(data.bars) || data.bars.length === 0) {
      throw new Error(`Yahoo no devolvió datos para ${symbol}`);
    }

    return data;
  }

  return {
    getBars
  };
})();