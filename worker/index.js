const RANGES = {
  "1d": "5y",
  "1wk": "10y",
  "1mo": "max",
  "1m": "7d",
  "5m": "1mo",
  "15m": "1mo",
  "30m": "1mo",
  "60m": "6mo"
};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders()
      });
    }

    if (url.pathname !== "/chart") {
      return json({
        error: "Use /chart?symbol=AAPL&interval=1d"
      }, 404);
    }

    const symbol = (url.searchParams.get("symbol") || "").toUpperCase();
    const interval = url.searchParams.get("interval") || "1d";

    if (!symbol) {
      return json({
        error: "Falta el parámetro symbol"
      }, 400);
    }

    const range = RANGES[interval] || "5y";

    const yahooUrl =
      `https://query1.finance.yahoo.com/v8/finance/chart/` +
      `${encodeURIComponent(symbol)}` +
      `?range=${encodeURIComponent(range)}` +
      `&interval=${encodeURIComponent(interval)}` +
      `&events=history` +
      `&includeAdjustedClose=true`;

    try {
      const response = await fetch(yahooUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      const body = await response.json();

      if (!response.ok || body.chart?.error) {
        return json({
          error:
            body.chart?.error?.description ||
            `Yahoo HTTP ${response.status}`
        }, 502);
      }

      const result = body.chart?.result?.[0];

      if (!result) {
        return json({
          error: "Yahoo no devolvió ningún resultado"
        }, 404);
      }

      const quote = result.indicators?.quote?.[0] || {};

      const bars = (result.timestamp || [])
        .map((time, i) => ({
          time,
          open: quote.open?.[i],
          high: quote.high?.[i],
          low: quote.low?.[i],
          close: quote.close?.[i],
          volume: quote.volume?.[i] || 0
        }))
        .filter(bar =>
          Number.isFinite(bar.open) &&
          Number.isFinite(bar.high) &&
          Number.isFinite(bar.low) &&
          Number.isFinite(bar.close)
        );

      return json({
        provider: "Yahoo Finance",
        symbol: result.meta?.symbol || symbol,
        currency: result.meta?.currency || "USD",
        bars
      });

    } catch (error) {
      return json({
        error: error.message
      }, 502);
    }
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function json(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders()
      }
    }
  );
}