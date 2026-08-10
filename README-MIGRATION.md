# TurboMarket - primera migración a Lightweight Charts

Esta versión elimina el widget `tv.js` y utiliza Lightweight Charts 5.0.0.

Fuente principal:
- Yahoo Finance Chart API

Fuente alternativa:
- Binance para símbolos con prefijo `BINANCE:`

Incluye:
- Velas OHLCV
- Volumen
- Cambio de símbolo
- Timeframes
- Zoom/pan/crosshair de Lightweight Charts
- Favoritos con localStorage
- Tema oscuro/claro
- Sidebar redimensionable
- Sin API key de Finnhub

Nota:
Yahoo Finance no es una API oficial documentada para este uso desde una SPA. Esta primera versión usa el endpoint de Chart directamente para validar la arquitectura. Si el navegador/proxy bloquea CORS o Yahoo cambia sus restricciones, el siguiente paso es poner `yahoo.js` detrás de una función serverless/proxy propio.

Los indicadores y dibujos todavía no están implementados en esta primera etapa.
