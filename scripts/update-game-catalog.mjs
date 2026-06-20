import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSET_DIR = path.join(ROOT, 'assets', 'games');
const OUTPUT = path.join(ROOT, 'games.js');
const TARGET_COUNT = 100;

const SOURCES = [
  'https://api.steampowered.com/ISteamChartsService/GetMostPlayedGames/v1/',
  'https://steamspy.com/api.php?request=top100in2weeks',
  'https://steamspy.com/api.php?request=top100forever'
];

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

async function getCandidateIds() {
  const [chartsResponse, recentResponse, foreverResponse] = await Promise.all(
    SOURCES.map(url => fetchWithRetry(url).then(response => response.json()))
  );

  const charts = chartsResponse?.response?.ranks || [];
  const recent = Object.values(recentResponse || {});
  const forever = Object.values(foreverResponse || {});

  const ranked = [
    ...charts.map(item => Number(item.appid)),
    ...recent.map(item => Number(item.appid)),
    ...forever.map(item => Number(item.appid))
  ];

  return [...new Set(ranked.filter(Number.isInteger))];
}

async function getSteamProduct(appid) {
  const url = `https://store.steampowered.com/api/appdetails?appids=${appid}&cc=mx&l=spanish`;
  try {
    const response = await fetchWithRetry(url, 3);
    const payload = await response.json();
    const data = payload?.[appid]?.data;
    const price = data?.price_overview?.final;

    if (!payload?.[appid]?.success || data?.type !== 'game') return null;
    if (!data?.platforms?.windows || !Number.isInteger(price) || price <= 0) return null;
    if (!data?.header_image) return null;

    return {
      appid,
      name: data.name,
      sourcePriceCents: price,
      price: Math.max(1, Math.floor((price * 0.8) / 100)),
      imageUrl: data.header_image,
      genres: (data.genres || []).slice(0, 2).map(item => item.description),
      description: data.short_description || ''
    };
  } catch (error) {
    console.warn(`No se pudo consultar ${appid}: ${error.message}`);
    return null;
  }
}

async function collectProducts(candidateIds) {
  const products = [];
  const batchSize = 6;

  for (let offset = 0; offset < candidateIds.length && products.length < TARGET_COUNT; offset += batchSize) {
    const batch = candidateIds.slice(offset, offset + batchSize);
    const results = await Promise.all(batch.map(getSteamProduct));
    products.push(...results.filter(Boolean));
    process.stdout.write(`\rProductos válidos: ${products.length}/${TARGET_COUNT}`);
    await sleep(180);
  }

  console.log('');
  if (products.length < TARGET_COUNT) {
    throw new Error(`Sólo se encontraron ${products.length} juegos de pago válidos.`);
  }
  return products.slice(0, TARGET_COUNT);
}

async function downloadImage(product) {
  const response = await fetchWithRetry(product.imageUrl, 3);
  const type = response.headers.get('content-type') || '';
  if (!type.startsWith('image/')) throw new Error(`Contenido no válido para ${product.appid}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 1000) throw new Error(`Imagen demasiado pequeña para ${product.appid}`);
  const filename = `${product.appid}.jpg`;
  await fs.writeFile(path.join(ASSET_DIR, filename), bytes);
  return { ...product, image: `/assets/games/${filename}` };
}

async function downloadImages(products) {
  await fs.mkdir(ASSET_DIR, { recursive: true });
  const completed = [];
  const batchSize = 8;

  for (let offset = 0; offset < products.length; offset += batchSize) {
    const batch = products.slice(offset, offset + batchSize);
    completed.push(...await Promise.all(batch.map(downloadImage)));
    process.stdout.write(`\rImágenes descargadas: ${completed.length}/${products.length}`);
  }
  console.log('');
  return completed;
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
  const candidateIds = await getCandidateIds();
  console.log(`Candidatos únicos: ${candidateIds.length}`);
  const products = await collectProducts(candidateIds);
  const downloaded = await downloadImages(products);
  await fs.writeFile(OUTPUT, buildBrowserScript(downloaded), 'utf8');
  console.log(`Catálogo actualizado: ${OUTPUT}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
