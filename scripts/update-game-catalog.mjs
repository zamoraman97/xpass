import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSET_DIR = path.join(ROOT, 'assets', 'games');
const OUTPUT = path.join(ROOT, 'games.js');
const TARGET_COUNT = Number(process.env.XPASS_GAME_TARGET || 1100);
const SEARCH_PAGE_SIZE = 100;
const SEARCH_URL = 'https://store.steampowered.com/search/results/';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'XPassCatalogUpdater/1.0' }
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(attempt * 800);
    }
  }
  throw lastError;
}

function decodeHtml(value) {
  const named = {
    amp: '&', apos: "'", gt: '>', lt: '<', quot: '"',
    nbsp: ' ', reg: '®', trade: '™', copy: '©'
  };
  return String(value || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&#(x?[0-9a-f]+);/gi, (_, code) => {
      const radix = code[0].toLowerCase() === 'x' ? 16 : 10;
      const value = parseInt(radix === 16 ? code.slice(1) : code, radix);
      return Number.isFinite(value) ? String.fromCodePoint(value) : '';
    })
    .replace(/&([a-z]+);/gi, (_, name) => named[name.toLowerCase()] || `&${name};`)
    .trim();
}

async function readExistingProducts() {
  try {
    const source = await fs.readFile(OUTPUT, 'utf8');
    const match = source.match(/const games = (\[[\s\S]*?\]);\n  window\.XPASS_GAMES/);
    return match ? JSON.parse(match[1]) : [];
  } catch {
    return [];
  }
}

function parseSearchRows(html) {
  const rows = String(html || '').match(/<a\b[^>]*class="[^"]*search_result_row[^"]*"[\s\S]*?<\/a>/gi) || [];
  return rows.map(row => {
    const appid = Number(row.match(/data-ds-appid="(\d+)"/i)?.[1]);
    const name = decodeHtml(row.match(/<span class="title">([\s\S]*?)<\/span>/i)?.[1]);
    const sourcePriceCents = Number(row.match(/data-price-final="(\d+)"/i)?.[1]);
    const searchImage = decodeHtml(row.match(/<img[^>]+src="([^"]+)"/i)?.[1]);
    const windows = /platform_img win/i.test(row);
    if (!Number.isInteger(appid) || !name || !windows || sourcePriceCents <= 0 || !searchImage) return null;
    return {
      appid,
      name,
      sourcePriceCents,
      price: Math.max(1, Math.floor((sourcePriceCents * 0.8) / 100)),
      searchImage,
      genres: ['Videojuego para PC'],
      description: ''
    };
  }).filter(Boolean);
}

async function collectSearchCandidates(existingIds, requiredCount) {
  const candidates = [];
  const seen = new Set(existingIds);
  let start = 0;

  while (candidates.length < requiredCount + 250) {
    const params = new URLSearchParams({
      query: '',
      start: String(start),
      count: String(SEARCH_PAGE_SIZE),
      dynamic_data: '',
      filter: 'topsellers',
      category1: '998',
      supportedlang: 'spanish',
      cc: 'MX',
      infinite: '1'
    });
    const response = await fetchWithRetry(`${SEARCH_URL}?${params}`);
    const payload = await response.json();
    const products = parseSearchRows(payload.results_html);
    if (!products.length) break;

    for (const product of products) {
      if (seen.has(product.appid)) continue;
      seen.add(product.appid);
      candidates.push(product);
    }
    process.stdout.write(`\rCandidatos nuevos: ${candidates.length}/${requiredCount}`);
    start += SEARCH_PAGE_SIZE;
    await sleep(180);
  }

  console.log('');
  if (candidates.length < requiredCount) {
    throw new Error(`Sólo se encontraron ${candidates.length} candidatos nuevos.`);
  }
  return candidates;
}

async function downloadImage(product) {
  const urls = [
    `https://cdn.akamai.steamstatic.com/steam/apps/${product.appid}/header.jpg`,
    product.searchImage
  ].filter(Boolean);
  let bytes;
  let lastError;
  for (const url of urls) {
    try {
      const response = await fetchWithRetry(url, 2);
      const type = response.headers.get('content-type') || '';
      if (!type.startsWith('image/')) throw new Error('El contenido no es una imagen');
      const candidate = Buffer.from(await response.arrayBuffer());
      if (candidate.length < 1000) throw new Error('La imagen es demasiado pequeña');
      bytes = candidate;
      break;
    } catch (error) {
      lastError = error;
    }
  }
  if (!bytes) throw lastError || new Error(`Sin imagen para ${product.appid}`);
  const filename = `${product.appid}.jpg`;
  await fs.writeFile(path.join(ASSET_DIR, filename), bytes);
  return { ...product, image: `/assets/games/${filename}` };
}

async function downloadImages(products, requiredCount) {
  await fs.mkdir(ASSET_DIR, { recursive: true });
  const completed = [];
  const batchSize = 8;
  let cursor = 0;

  while (cursor < products.length && completed.length < requiredCount) {
    const remaining = requiredCount - completed.length;
    const batch = products.slice(cursor, cursor + Math.min(batchSize, remaining));
    cursor += batch.length;
    const settled = await Promise.allSettled(batch.map(downloadImage));
    for (const result of settled) {
      if (result.status === 'fulfilled') completed.push(result.value);
      else console.warn(`\nImagen omitida: ${result.reason?.message || result.reason}`);
    }
    process.stdout.write(`\rImágenes descargadas: ${completed.length}/${requiredCount}`);
  }
  console.log('');
  if (completed.length < requiredCount) {
    throw new Error(`Sólo se descargaron ${completed.length} de ${requiredCount} imágenes nuevas.`);
  }
  return completed.slice(0, requiredCount);
}

function buildBrowserScript(products) {
  const publicProducts = products.map(({ appid, name, price, image, genres, description }) => ({
    appid, name, price, image, genres, description
  }));
  const json = JSON.stringify(publicProducts, null, 2);

  return `/* Catálogo generado automáticamente. Precios base: Steam México. */
(function () {
  'use strict';
  const games = ${json};
  window.XPASS_GAMES = games;

  function esc(value) {
    return String(value || '').replace(/[&<>\"']/g, function (char) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#39;' })[char];
    });
  }

  function money(value) {
    return new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(value);
  }

  const mount = document.getElementById('gameCatalogMount');
  if (mount) {
    const cards = games.map(function (game, index) {
      const genre = game.genres && game.genres.length ? game.genres.join(' · ') : 'Videojuego para PC';
      return '<article class="ebn-card" data-category="games">' +
        (index < 3 ? '<div class="ebn-hot-ribbon">★ POPULAR</div>' : '') +
        '<div class="ebn-card-img">' +
          '<img src="' + esc(game.image) + '" width="320" height="195" loading="lazy" decoding="async" alt="' + esc(game.name) + ' para PC" />' +
          '<span class="ebn-platform">STEAM · PC</span><span class="ebn-dur">JUEGO</span>' +
        '</div>' +
        '<div class="ebn-card-body">' +
          '<h3>' + esc(game.name) + '</h3>' +
          '<ul class="ebn-feat"><li>✔ Código digital para PC</li><li>✔ ' + esc(genre) + '</li><li>✔ Activación en Steam</li></ul>' +
          '<div class="ebn-price-row"><span class="ebn-price">$' + money(game.price) + '<small>MXN</small></span></div>' +
          '<button class="plan-add-btn" data-sku="game-' + game.appid + '" data-product="' + esc(game.name) + ' para PC" data-price="' + game.price + '" data-badge="Steam · PC" data-thumb="' + esc(game.image) + '">Añadir al carrito</button>' +
        '</div>' +
      '</article>';
    }).join('');
    mount.insertAdjacentHTML('beforebegin', cards);
    mount.remove();
  }

  const schema = document.createElement('script');
  schema.type = 'application/ld+json';
  schema.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Videojuegos populares para PC en XPass',
    numberOfItems: games.length,
    itemListElement: games.map(function (game, index) {
      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: game.name,
          image: 'https://xpass.digital' + game.image,
          category: 'Juego para PC',
          offers: {
            '@type': 'Offer',
            price: String(game.price),
            priceCurrency: 'MXN',
            availability: 'https://schema.org/InStock',
            url: 'https://xpass.digital/#planes'
          }
        }
      };
    })
  });
  document.head.appendChild(schema);
})();
`;
}

async function main() {
  const existing = await readExistingProducts();
  const retained = existing.slice(0, TARGET_COUNT);
  const requiredCount = TARGET_COUNT - retained.length;
  console.log(`Catálogo actual: ${retained.length}; objetivo: ${TARGET_COUNT}; nuevos: ${requiredCount}`);
  if (requiredCount <= 0) {
    console.log('El catálogo ya alcanzó el objetivo.');
    return;
  }
  const existingIds = retained.map(product => Number(product.appid));
  const candidates = await collectSearchCandidates(existingIds, requiredCount);
  const downloaded = await downloadImages(candidates, requiredCount);
  const completeCatalog = [...retained, ...downloaded];
  await fs.writeFile(OUTPUT, buildBrowserScript(completeCatalog), 'utf8');
  console.log(`Catálogo actualizado: ${completeCatalog.length} juegos en ${OUTPUT}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
