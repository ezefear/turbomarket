# TurboMarket — Yahoo Finance + Lightweight Charts

## GitHub Pages

Sube al repositorio:
- index.html
- style.css
- js/app.js
- js/chart.js
- js/datafeed.js
- js/yahoo.js
- js/binance.js
- js/storage.js

## Cloudflare Worker

El contenido de `worker/` se despliega como un Worker separado.

Después de desplegarlo, abre la consola del navegador y ejecuta:

localStorage.setItem("turbo_yahoo_api", "https://TU-WORKER.workers.dev");

Después recarga TurboMarket.

## Importante

No pongas claves privadas en el frontend.

Esta versión es la base de datos + gráfico. Los dibujos e indicadores se añadirán después, una vez comprobado que Yahoo funciona correctamente.
