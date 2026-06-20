import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await fs.readFile(path.join(ROOT, 'games.js'), 'utf8');
const match = source.match(/const games = (\[[\s\S]*?\]);\n  window\.XPASS_GAMES/);
if (!match) throw new Error('No se pudo leer el catálogo de games.js');

const games = JSON.parse(match[1]);
if (!Array.isArray(games) || games.length < 36) throw new Error('El catálogo no contiene suficientes juegos');
const featured = games.slice(0, 36);

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function money(value) {
  return new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(value);
}

const cards = featured.map((game, index) => `
        <article class="seo-game-card">
          <a href="/?q=${encodeURIComponent(game.name)}#planes" aria-label="Ver ${esc(game.name)} en el catálogo">
            <img src="${esc(game.image)}" width="460" height="215" loading="${index < 4 ? 'eager' : 'lazy'}" decoding="async" alt="Comprar ${esc(game.name)} barato para PC en México" />
          </a>
          <div class="seo-game-body">
            <span class="seo-platform">Steam · PC</span>
            <h3>${esc(game.name)}</h3>
            <div class="seo-game-bottom">
              <strong>$${money(game.price)} <small>MXN</small></strong>
              <a href="/?q=${encodeURIComponent(game.name)}#planes">Ver juego</a>
            </div>
          </div>
        </article>`).join('');

const itemList = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Videojuegos baratos para PC en México',
  numberOfItems: featured.length,
  itemListElement: featured.map((game, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'Product',
      name: game.name,
      image: `https://xpass.digital${game.image}`,
      category: 'Videojuego para PC',
      offers: {
        '@type': 'Offer',
        price: String(game.price),
        priceCurrency: 'MXN',
        availability: 'https://schema.org/InStock',
        url: `https://xpass.digital/?q=${encodeURIComponent(game.name)}#planes`
      }
    }
  }))
};

const faq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Dónde comprar videojuegos baratos para PC en México?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En XPass puedes consultar un catálogo de más de 1,100 videojuegos digitales para PC con precios en pesos mexicanos y pago por SPEI, Visa o Mastercard.'
      }
    },
    {
      '@type': 'Question',
      name: '¿Cómo recibo mi videojuego digital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Después de confirmar el pago, recibes por correo las instrucciones y el código digital correspondiente a tu compra.'
      }
    },
    {
      '@type': 'Question',
      name: '¿Los precios están en pesos mexicanos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Los precios del catálogo de XPass se muestran en pesos mexicanos (MXN).'
      }
    }
  ]
};

const html = `<!DOCTYPE html>
<html lang="es-MX">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Videojuegos Baratos para PC en México | XPass</title>
  <meta name="description" content="Compra videojuegos baratos para PC en México. Explora más de 1,100 juegos digitales con precios en MXN, pago seguro y entrega por correo." />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="author" content="XPass" />
  <link rel="canonical" href="https://xpass.digital/videojuegos-baratos" />
  <link rel="alternate" hreflang="es-mx" href="https://xpass.digital/videojuegos-baratos" />
  <link rel="alternate" hreflang="x-default" href="https://xpass.digital/videojuegos-baratos" />
  <link rel="icon" type="image/svg+xml" href="/logo.svg" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="es_MX" />
  <meta property="og:site_name" content="XPass" />
  <meta property="og:url" content="https://xpass.digital/videojuegos-baratos" />
  <meta property="og:title" content="Videojuegos Baratos para PC en México | XPass" />
  <meta property="og:description" content="Más de 1,100 videojuegos digitales para PC con precios en pesos mexicanos." />
  <meta property="og:image" content="https://xpass.digital${featured[0].image}" />
  <meta property="og:image:alt" content="Videojuegos baratos para PC en XPass" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Videojuegos Baratos para PC en México | XPass" />
  <meta name="twitter:description" content="Explora más de 1,100 videojuegos digitales para PC en MXN." />
  <meta name="twitter:image" content="https://xpass.digital${featured[0].image}" />
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://xpass.digital/' },
      { '@type': 'ListItem', position: 2, name: 'Videojuegos baratos', item: 'https://xpass.digital/videojuegos-baratos' }
    ]
  })}</script>
  <script type="application/ld+json">${JSON.stringify(itemList)}</script>
  <script type="application/ld+json">${JSON.stringify(faq)}</script>
  <link rel="stylesheet" href="/styles.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    body{background:#090615;color:#f8fafc;font-family:Inter,sans-serif;margin:0}.seo-wrap{width:min(1180px,calc(100% - 32px));margin:auto}.seo-nav{border-bottom:1px solid rgba(255,255,255,.09);background:rgba(9,6,21,.96)}.seo-nav .seo-wrap{height:72px;display:flex;align-items:center;justify-content:space-between;gap:24px}.seo-nav img{height:38px}.seo-nav-links{display:flex;gap:20px}.seo-nav a{color:#ddd6fe;text-decoration:none;font-weight:700}.seo-hero{padding:76px 0 56px;background:radial-gradient(circle at 20% 10%,rgba(124,58,237,.34),transparent 38%),linear-gradient(180deg,#10082b,#090615)}.seo-hero h1{font-size:clamp(36px,6vw,68px);line-height:1.02;max-width:900px;margin:0 0 22px}.seo-hero h1 em{font-style:normal;color:#a78bfa}.seo-hero p{font-size:18px;line-height:1.7;color:#cbd5e1;max-width:760px}.seo-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}.seo-btn{display:inline-flex;padding:14px 20px;border-radius:10px;text-decoration:none;font-weight:800;background:#7c3aed;color:white}.seo-btn.secondary{background:transparent;border:1px solid #7c3aed;color:#ddd6fe}.seo-benefits{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:38px}.seo-benefits div{padding:18px;border:1px solid rgba(255,255,255,.1);border-radius:12px;background:rgba(255,255,255,.04)}.seo-benefits b{display:block;margin-bottom:6px}.seo-benefits span{color:#94a3b8;font-size:14px}.seo-section{padding:64px 0}.seo-section h2{font-size:clamp(28px,4vw,42px);margin:0 0 12px}.seo-lead{color:#94a3b8;line-height:1.7;max-width:800px;margin:0 0 30px}.seo-game-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}.seo-game-card{background:#151024;border:1px solid rgba(255,255,255,.09);border-radius:14px;overflow:hidden}.seo-game-card img{width:100%;height:auto;aspect-ratio:460/215;object-fit:cover;display:block}.seo-game-body{padding:15px}.seo-platform{color:#a78bfa;font-size:11px;font-weight:800;text-transform:uppercase}.seo-game-card h3{font-size:15px;line-height:1.4;min-height:42px;margin:8px 0 15px}.seo-game-bottom{display:flex;align-items:center;justify-content:space-between;gap:10px}.seo-game-bottom strong{font-size:19px}.seo-game-bottom small{font-size:10px;color:#94a3b8}.seo-game-bottom a{color:#c4b5fd;font-size:13px;font-weight:800}.seo-copy{background:#100b1d;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08)}.seo-copy-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px}.seo-copy p,.seo-copy li{color:#b8b5c5;line-height:1.75}.seo-faq details{border-bottom:1px solid rgba(255,255,255,.1);padding:18px 0}.seo-faq summary{font-weight:800;cursor:pointer}.seo-faq p{color:#a8a3b5;line-height:1.7}.seo-footer{padding:34px 0;color:#8b8799;border-top:1px solid rgba(255,255,255,.08)}.seo-footer a{color:#c4b5fd}@media(max-width:900px){.seo-game-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.seo-copy-grid{grid-template-columns:1fr}.seo-benefits{grid-template-columns:1fr}}@media(max-width:520px){.seo-game-grid{grid-template-columns:1fr}.seo-nav-links{display:none}}
  </style>
</head>
<body>
  <nav class="seo-nav" aria-label="Navegación principal"><div class="seo-wrap"><a href="/"><img src="/logo.svg" alt="XPass" /></a><div class="seo-nav-links"><a href="/">Inicio</a><a href="/#planes">Catálogo</a><a href="/como-funciona">Cómo funciona</a><a href="/contacto">Contacto</a></div></div></nav>
  <main>
    <header class="seo-hero"><div class="seo-wrap">
      <h1>Videojuegos baratos para PC <em>en México</em></h1>
      <p>Explora más de 1,100 videojuegos digitales para PC con precios en pesos mexicanos. Encuentra títulos populares, paga con métodos nacionales y recibe tu compra por correo.</p>
      <div class="seo-actions"><a class="seo-btn" href="/#cat=games">Ver los 1,100 juegos</a><a class="seo-btn secondary" href="/como-funciona">Cómo comprar</a></div>
      <div class="seo-benefits"><div><b>Precios en MXN</b><span>Sin conversiones inesperadas</span></div><div><b>Entrega digital</b><span>Recibe la información por correo</span></div><div><b>Pago seguro</b><span>SPEI, Visa y Mastercard</span></div></div>
    </div></header>
    <section class="seo-section"><div class="seo-wrap">
      <h2>Juegos baratos y populares para PC</h2>
      <p class="seo-lead">Consulta una selección del catálogo de XPass. Usa el buscador principal para encontrar un título específico entre más de 1,100 opciones disponibles.</p>
      <div class="seo-game-grid">${cards}
      </div>
      <div class="seo-actions" style="justify-content:center;margin-top:34px"><a class="seo-btn" href="/#cat=games">Explorar el catálogo completo</a></div>
    </div></section>
    <section class="seo-section seo-copy"><div class="seo-wrap seo-copy-grid">
      <div><h2>Compra videojuegos digitales en México</h2><p>XPass reúne videojuegos para PC, recargas, gift cards y suscripciones en una tienda orientada a compradores de México. Los precios se muestran directamente en MXN para que conozcas el importe antes de pagar.</p><p>Puedes buscar por nombre, comparar opciones y añadir el juego al carrito desde el <a href="/#cat=games" style="color:#c4b5fd">catálogo de videojuegos</a>.</p></div>
      <div><h2>¿Qué encontrarás?</h2><ul><li>Videojuegos de acción, aventura, estrategia, simulación y multijugador.</li><li>Títulos populares para computadoras con Windows.</li><li>Precios visibles en pesos mexicanos.</li><li>Compra digital y atención en español.</li></ul></div>
    </div></section>
    <section class="seo-section seo-faq"><div class="seo-wrap"><h2>Preguntas frecuentes</h2>
      <details><summary>¿Dónde comprar videojuegos baratos para PC en México?</summary><p>En XPass puedes consultar más de 1,100 videojuegos digitales para PC con precios en pesos mexicanos.</p></details>
      <details><summary>¿Cómo recibo mi videojuego digital?</summary><p>Después de confirmar el pago, recibes por correo las instrucciones y el código digital correspondiente a tu compra.</p></details>
      <details><summary>¿Los precios están en pesos mexicanos?</summary><p>Sí. Todos los precios visibles en XPass se muestran en MXN.</p></details>
    </div></section>
  </main>
  <footer class="seo-footer"><div class="seo-wrap">© XPass · <a href="/terminos">Términos</a> · <a href="/privacidad">Privacidad</a> · <a href="/reembolsos">Reembolsos</a> · <a href="/contacto">Contacto</a></div></footer>
</body>
</html>
`;

await fs.writeFile(path.join(ROOT, 'videojuegos-baratos.html'), html, 'utf8');
console.log(`Página SEO generada con ${featured.length} productos estáticos.`);
