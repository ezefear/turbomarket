window.TurboDatafeed = (() => {

  function isBinanceSymbol(symbol) {
    const s = String(symbol)
      .trim()
      .toUpperCase();

    return (
      s.startsWith("BINANCE:") ||
      /^(BTC|ETH|SOL|BNB|XRP|ADA|DOGE)(USDT|USD)$/.test(s)
    );
  }

  async function getBars(symbol, interval = "1d") {
    const normalized = String(symbol)
      .trim()
      .toUpperCase();

    if (!normalized) {
      throw new Error("Símbolo vacío");
    }

    if (isBinanceSymbol(normalized)) {
      return TurboBinance.getBars(
        normalized,
        interval
      );
    }

    return TurboYahoo.getBars(
      normalized,
      interval
    );
  }

  return {
    getBars
  };

})();