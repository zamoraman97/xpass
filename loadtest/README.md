# Stress test — xpass.digital

Encuentra el **punto de quiebre** del sitio (latencia/errores) subiendo la carga por escalones hasta 2000 usuarios virtuales.

## 1. Instalar k6 (una sola vez)

**Windows (PowerShell, con winget):**
```powershell
winget install k6 --source winget
```
O con Chocolatey:
```powershell
choco install k6
```
Descarga manual: https://github.com/grafana/k6/releases

## 2. Ejecutar

Desde la carpeta del proyecto (`xpass`):
```powershell
k6 run loadtest/stress.js
```

Probar otra URL (ej. una página interna):
```powershell
$env:TARGET="https://xpass.digital/como-funciona"; k6 run loadtest/stress.js
```

## 3. Mientras corre

- Abre el **panel de Railway → Metrics** y vigila **CPU y RAM** del servicio en tiempo real.
- Abre **Railway → Logs** para ver las peticiones llegar y detectar 5xx.

## 4. Interpretar

El test **se detiene solo** cuando cruza un umbral (ya tienes el límite):
- `p95 > 3000 ms` → el sitio se volvió lento bajo esa carga.
- `>5%` de peticiones fallidas → saturación / caída.

Si llega al final de los ~9 min **sin abortar**, tu sitio aguantó 2000 VUs sin problema.

Resultado completo en `loadtest/resultado.json`.

## Nota importante

- Córrelo desde una **máquina/red potente**: un portátil con wifi limitado se queda sin
  capacidad antes que el servidor (verás errores `000`/timeout que son del **cliente**, no del servidor).
- Para más realismo, usa **k6 Cloud** (carga distribuida desde varias regiones):
  https://grafana.com/products/cloud/k6/
