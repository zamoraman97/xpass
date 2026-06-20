// stress.js — Test de capacidad / punto de quiebre para xpass.digital
// Ejecuta: k6 run loadtest/stress.js
// Objetivo: subir la carga por escalones hasta encontrar el punto donde el
// sitio empieza a degradarse (latencia alta o errores 5xx). El test ABORTA
// solo cuando cruza los umbrales, dejándote el dato exacto del límite.
//
// IMPORTANTE: córrelo desde una máquina/red con buen ancho de banda y CPU.
// Mientras corre, mira en paralelo las métricas de CPU/RAM en Railway.

import http from 'k6/http';
import { check } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Trend('errores_5xx_pct'); // visibilidad extra
const fail = new Rate('peticiones_fallidas');

// Modo SMOKE: validacion rapida y suave (20s, pocos VUs). Activar con:
//   $env:SMOKE="1"; k6 run loadtest/stress.js
const SMOKE = __ENV.SMOKE === '1';

const fullStages = [
  { duration: '30s', target: 50 },    // calentamiento
  { duration: '1m',  target: 200 },
  { duration: '1m',  target: 500 },
  { duration: '1m',  target: 1000 },
  { duration: '2m',  target: 1500 },
  { duration: '2m',  target: 2000 },   // carga alta sostenida
  { duration: '30s', target: 0 },      // enfriamiento
];

const smokeStages = [
  { duration: '5s',  target: 5 },
  { duration: '10s', target: 10 },
  { duration: '5s',  target: 0 },
];

export const options = {
  // Escalones de Usuarios Virtuales (VUs). Cada uno mantiene peticiones
  // de forma continua. Sube hasta 2000 VUs en ~9 min (o smoke = ~20s).
  scenarios: {
    ramp: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: SMOKE ? smokeStages : fullStages,
      gracefulRampDown: '10s',
    },
  },

  // Umbrales = definición de "punto de quiebre". Si se cruzan, el test
  // se ABORTA automáticamente: ya encontraste el límite, no hace falta más.
  thresholds: {
    // p95 de latencia por encima de 3s = el sitio ya está sufriendo.
    http_req_duration: [{ threshold: 'p(95)<3000', abortOnFail: true, delayAbortEval: '10s' }],
    // Más del 5% de peticiones fallidas = saturación / caída.
    http_req_failed:   [{ threshold: 'rate<0.05',  abortOnFail: true, delayAbortEval: '10s' }],
  },

  // Resumen con percentiles útiles.
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
};

const URL = __ENV.TARGET || 'https://xpass.digital/';

export default function () {
  const res = http.get(URL, { tags: { name: 'home' } });

  const ok = check(res, {
    'status 2xx/3xx': (r) => r.status >= 200 && r.status < 400,
    'no 5xx (servidor vivo)': (r) => r.status < 500,
    'no 429 (sin rate-limit)': (r) => r.status !== 429,
  });

  fail.add(!ok);
  errorRate.add(res.status >= 500 ? 100 : 0);
}

export function handleSummary(data) {
  const m = data.metrics;
  const get = (name, stat) => (m[name] && m[name].values && m[name].values[stat] != null)
    ? m[name].values[stat] : 'n/a';

  const lines = [];
  lines.push('');
  lines.push('================ RESUMEN STRESS TEST — xpass.digital ================');
  lines.push(`Peticiones totales : ${get('http_reqs', 'count')}`);
  lines.push(`Throughput (req/s) : ${(get('http_reqs', 'rate') || 0).toFixed ? get('http_reqs','rate').toFixed(1) : get('http_reqs','rate')}`);
  lines.push(`% fallidas         : ${((get('http_req_failed','rate')||0)*100).toFixed(2)}%`);
  lines.push('--- Latencia (ms) ---');
  lines.push(`  promedio : ${(+get('http_req_duration','avg')).toFixed(0)}`);
  lines.push(`  p95      : ${(+get('http_req_duration','p(95)')).toFixed(0)}`);
  lines.push(`  p99      : ${(+get('http_req_duration','p(99)')).toFixed(0)}`);
  lines.push(`  max      : ${(+get('http_req_duration','max')).toFixed(0)}`);
  lines.push('');
  lines.push('Interpretacion:');
  lines.push('  - Si el test ABORTO antes de los ~9 min => encontraste el punto de quiebre.');
  lines.push('  - 5xx o 429 en los checks => el servidor/edge llego a su limite.');
  lines.push('  - Cruza estos numeros con CPU/RAM en el panel de Railway.');
  lines.push('====================================================================');

  return {
    stdout: lines.join('\n') + '\n',
    'loadtest/resultado.json': JSON.stringify(data, null, 2),
  };
}
