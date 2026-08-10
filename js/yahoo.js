window.TurboYahoo = (() => {
  const endpoint = "https://turbomarket.ezefear.workers.dev";

  async function getBars(symbol, interval = "1d") {
    const url =
      `${endpoint}/chart` +
      `?symbol=${encodeURIComponent(symbol)}` +
      `&interval=${encodeURIComponent(interval)}`;

    const response = await fetch(url);

    const body = await response.json();

    if (!response.ok) {
      throw new Error(body.error || `API HTTP ${response.status}`);
    }

    if (!Array.isArray(body.bars) || body.bars.length === 0) {
      throw new Error("Yahoo Finance no devolvió velas");
    }

    return body;
  }

  return {
    getBars
  };
})();