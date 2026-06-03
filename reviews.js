/* ── RESEÑAS XPass ──
   100 reseñas base (4-5 estrellas) generadas de forma determinista
   + reseñas de usuarios registrados (se agregan al final). */
(function () {
  const namesM = ['Carlos','José','Luis','Juan','Miguel','Ángel','Francisco','Jesús','Alejandro','Ricardo',
    'Fernando','Eduardo','Roberto','Daniel','Jorge','Sergio','Manuel','Raúl','Héctor','Arturo',
    'Emiliano','Santiago','Diego','Mateo','Iker','Leonardo','Bruno','Gael','Rodrigo','Andrés'];
  const namesF = ['María','Guadalupe','Fernanda','Alejandra','Daniela','Valeria','Andrea','Ximena','Sofía','Regina',
    'Karla','Paola','Mariana','Gabriela','Lucía','Renata','Camila','Brenda','Itzel','Montserrat',
    'Adriana','Verónica','Diana','Jimena','Citlali','Mónica','Rosa','Patricia','Wendy','Frida'];
  const surnames = ['Hernández','García','Martínez','López','González','Pérez','Rodríguez','Sánchez','Ramírez','Cruz',
    'Flores','Gómez','Morales','Vázquez','Reyes','Jiménez','Torres','Díaz','Gutiérrez','Mendoza',
    'Ruiz','Aguilar','Ortiz','Castillo','Romero','Álvarez','Mendez','Chávez','Rivera','Domínguez',
    'Guerrero','Vargas','Salazar','Luna','Cervantes','Ríos','Cabrera','Espinoza','Núñez','Rojas'];

  // 100 comentarios únicos (sin repetir), tono casual real. Los índices múltiplos de 10 llevan 4★.
  const comments = [
    'todo bien pero tardo un poco mas de lo que esperaba, igual llego el codigo y funciono',
    'rapidisimo, en 5 min ya tenia mi codigo. recomendado',
    'compre el de 12 meses y salio mucho mas barato que en la store oficial',
    'pague por spei y al toque me mandaron el codigo por wpp, todo bien',
    'la neta tenia miedo de que fuera fake pero todo real, ya voy en mi segunda compra',
    'me resolvieron una duda al instante y el codigo jalo sin bronca',
    'precios bien baratos y entrega rapida, ya es mi tienda de confianza',
    'active mi ultimate en la consola y a jugar, gracias!',
    'super facil todo y el ahorro vale la pena',
    'me atendieron rapidisimo por wpp, codigo valido y al momento',
    'todo correcto solo que me batalle tantito con el pago spei, ya luego me ayudaron',
    'van 3 compras y nunca me han fallado, 100% confiables',
    'el de un mes me salio mucho mas barato, llego al instante',
    'increible el precio del anual, active sin problemas en pc y consola',
    'atencion de 10, me guiaron en todo el pago',
    'codigo original y entrega inmediata como dicen, sin trucos',
    'compre de madrugada y aun asi me contestaron rapido',
    'la mejor opcion pa comprar game pass en mexico, barato y seguro',
    'mi codigo llego en segundos y jalo a la primera',
    'feliz con la compra, ese precio no lo encuentras en otro lado',
    'buena experiencia, el correo tardo como 15 min pero el soporte estuvo al pendiente',
    'pague con tarjeta y al instante ya tenia mi suscripcion',
    'renove mi ultimate otra vez aqui, siempre cumplen',
    'el codigo jalo a la primera en mi series s, todo perfecto',
    'me encanto lo facil que fue, de verdad entrega inmediata',
    'justo lo que buscaba, game pass barato y sin rollos',
    'todo legit, mi suscripcion quedo activa los 12 meses',
    'atencion super amable y el codigo llego volando',
    'compra segura, hasta me pasaron el comprobante, bien profesionales',
    'el ahorro comparado con la store es enorme, repito',
    'cumplieron con lo prometido, ojala acepten mas metodos de pago mas adelante',
    'active el codigo y de volada tenia todos los juegos',
    'primera compra y quede satisfecho, repito sin duda',
    'el soporte por wpp es bien atento, resuelven al momento',
    'mi hijo feliz con su game pass, entrega al instante',
    'todo claro y rapido, recomiendo pagar por spei llega enseguida',
    'me daba cosa comprar en linea pero superaron mis expectativas',
    'buenisimo, el codigo sirvio sin problema y buen trato',
    'llevaba meses buscando un lugar confiable y por fin lo encontre',
    'compre el anual y ahorre un buen, activacion al instante',
    'todo en orden, nomas que la pagina podria tener mas info de los planes',
    'me respondieron a medianoche y resolvieron todo, increible',
    'codigo entregado al instante y funcionando, cero quejas',
    'excelente trato, me explicaron paso a paso como canjear',
    'llego rapidisimo a mi correo, game pass al mejor precio',
    'rapido seguro y barato, que mas se puede pedir',
    'ya lo recomende a todos mis compas gamers, no fallan',
    'active en minutos y llevo semanas disfrutando el catalogo',
    'pago sencillo y entrega inmediata, vuelvo el proximo año',
    'muy buena tienda, el codigo llego sin demoras y todo legal',
    'buen precio y buena atencion, hubo una pequeña espera pero valio la pena',
    'compre pa regalo y quedo perfecto, hasta me mandaron instrucciones',
    'la atencion por wpp es inmediata, resolvieron mi compra en minutos',
    'game pass ultimate a un precio que no creia posible, super',
    'todo salio tal cual lo prometen, confianza total',
    'mi codigo jalo perfecto en pc, excelente experiencia',
    'rapidos claros y honestos, ya soy cliente fiel',
    'increible, en lo que hacia el cafe ya tenia mi codigo jaja',
    'servicio impecable de principio a fin, lo recomiendo al 100',
    'el mejor precio que encontre en todo mexico y entrega al instante',
    'buena compra, me hubiera gustado factura formal pero todo funciono bien',
    'sin trabas sin demoras, pague y a los minutos ya estaba jugando',
    'ya es la tercera vez que renuevo aqui, nunca fallan',
    'trato bien amable y profesional, el codigo llego al instante',
    'compre el de un mes pa probar y quede encantado, voy por el anual',
    'muy confiable, me dieron seguimiento hasta que active',
    'el ahorro frente a la tienda oficial es brutal, recomendado',
    'llego al toque y sin broncas, atencion de primera por wpp',
    'quede sorprendido por lo rapido, en serio entrega inmediata',
    'compra segura y precio inmejorable, repito sin pensarlo',
    'todo bien, quiza pago con oxxo ayudaria pero el spei funciono perfecto',
    'el codigo activo sin problema en mi cuenta, servicio excelente',
    'me encanto la rapidez y la honestidad, cliente nuevo y fiel',
    'precio justo, entrega inmediata y soporte en español, 10/10',
    'compre tarde y aun asi me atendieron al instante, increible',
    'jalo perfecto en mi xbox y en la app de pc, sin detalles',
    'la experiencia mas facil que he tenido comprando un codigo',
    'super recomendados, ahorre bastante y todo fue real',
    'atencion inmediata y codigo al momento, excelente',
    'ya renove dos años seguidos con ellos, confianza absoluta',
    'buen servicio, el unico detalle fue que tuve que escribir pa confirmar pero respondieron rapido',
    'increible precio y cero complicaciones, mi nueva tienda de cabecera',
    'pague por spei y en 5 min tenia mi game pass, brutal',
    'todo legit y rapidisimo, lo recomiendo con los ojos cerrados',
    'excelente atencion, me ayudaron a canjear paso a paso',
    'compra facil segura y barata, vuelvo el proximo año seguro',
    'el codigo llego al instante a mi wpp, servicio impecable',
    'mejor precio imposible, activacion inmediata y sin riesgos',
    'muy profesionales, resolvieron todas mis dudas antes de pagar',
    'llevo varias compras y siempre la misma calidad, excelentes',
    'buena tienda, la entrega no fue tan instantanea como pense pero llego el mismo dia',
    'active mi ultimate en segundos, el mejor lugar pa comprarlo',
    'trato excelente y precio inigualable, totalmente confiable',
    'rapido seguro y economico, ya lo recomende a mi familia',
    'compre el anual y fue la mejor decision, ahorro enorme',
    'me sorprendio la rapidez del servicio, codigo valido al instante',
    'sin duda vuelvo, atencion de lujo y entrega inmediata',
    'todo perfecto desde el pago hasta la activacion',
    'el soporte es increible, siempre disponibles por wpp',
    'la mejor compra de game pass que he hecho, barato y al instante'
  ];

  function buildSeed() {
    const out = [];
    for (let i = 0; i < 100; i++) {
      const isM = (i % 2 === 0);
      const first = isM ? namesM[(i * 3) % namesM.length] : namesF[(i * 5 + 1) % namesF.length];
      const s1 = surnames[(i * 7) % surnames.length];
      const s2 = surnames[(i * 11 + 3) % surnames.length];
      const fmt = i % 3;
      let name;
      if (fmt === 0) name = first;                 // solo nombre
      else if (fmt === 1) name = first + ' ' + s1; // un apellido
      else name = first + ' ' + s1 + ' ' + s2;     // dos apellidos
      const rating = (i % 10 === 0) ? 4 : 5;       // 10 de 4★, 90 de 5★  → promedio 4.9
      const comment = comments[i];                 // un comentario único por reseña
      const daysAgo = 2 + (i * 5) % 365;
      out.push({
        name,
        rating,
        comment,
        date: new Date(Date.now() - daysAgo * 86400000).toISOString()
      });
    }
    return out;
  }

  const SEED = buildSeed();
  let allReviews = SEED.slice();   // seed + usuario
  let shown = 0;
  const PAGE = 9;
  let me = { loggedIn: false };

  // ── helpers ──
  function starsHTML(n, size) {
    size = size || 15;
    let h = '';
    for (let s = 1; s <= 5; s++) {
      const fill = s <= n ? '#fbbf24' : 'rgba(255,255,255,.18)';
      h += '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="' + fill +
        '"><path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21l1.18-6.86-5-4.87 7.1-1.01L12 2z"/></svg>';
    }
    return h;
  }
  function initials(name) {
    const p = name.trim().split(' ');
    return ((p[0][0] || '') + (p[1] ? p[1][0] : '')).toUpperCase();
  }
  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' });
    } catch (_) { return ''; }
  }
  function reviewCard(r) {
    const el = document.createElement('div');
    el.className = 'review-card';
    el.innerHTML =
      '<div class="review-head">' +
        '<div class="review-avatar">' + initials(r.name) + '</div>' +
        '<div class="review-meta">' +
          '<div class="review-name">' + escapeHtml(r.name) + '</div>' +
          '<div class="review-stars">' + starsHTML(r.rating) + '</div>' +
        '</div>' +
        '<div class="review-date">' + fmtDate(r.date) + '</div>' +
      '</div>' +
      '<p class="review-text">' + escapeHtml(r.comment) + '</p>';
    return el;
  }
  function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function renderSummary() {
    const total = allReviews.length;
    const sum = allReviews.reduce(function (a, r) { return a + r.rating; }, 0);
    const avg = total ? (sum / total) : 5;
    const avgEl = document.getElementById('revAvg');
    const starsEl = document.getElementById('revAvgStars');
    const countEl = document.getElementById('revCount');
    if (avgEl) avgEl.textContent = avg.toFixed(1);
    if (starsEl) starsEl.innerHTML = starsHTML(Math.round(avg), 20);
    if (countEl) countEl.textContent = 'Basado en ' + total + ' reseñas';
  }

  function renderMore() {
    const grid = document.getElementById('reviewsGrid');
    const btn = document.getElementById('reviewsMoreBtn');
    if (!grid) return;
    const next = Math.min(shown + PAGE, allReviews.length);
    for (let i = shown; i < next; i++) grid.appendChild(reviewCard(allReviews[i]));
    shown = next;
    if (btn) {
      const left = allReviews.length - shown;
      if (left <= 0) { btn.style.display = 'none'; }
      else { btn.style.display = ''; btn.textContent = 'Ver más reseñas (' + left + ')'; }
    }
  }

  function renderAll() {
    const grid = document.getElementById('reviewsGrid');
    if (grid) grid.innerHTML = '';
    shown = 0;
    renderSummary();
    renderMore();
  }

  // ── formulario ──
  function renderForm() {
    const body = document.getElementById('reviewFormBody');
    if (!body) return;
    if (!me.loggedIn) {
      body.innerHTML =
        '<p class="review-login-msg">Inicia sesión para dejar tu reseña.</p>' +
        '<a href="/cuenta" class="review-login-btn">Iniciar sesión / Registrarme</a>';
      return;
    }
    body.innerHTML =
      '<div class="review-star-picker" id="starPicker">' +
        [1, 2, 3, 4, 5].map(function (n) {
          return '<button type="button" class="rsp-star" data-val="' + n + '" aria-label="' + n + ' estrellas">' +
            '<svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21l1.18-6.86-5-4.87 7.1-1.01L12 2z"/></svg>' +
          '</button>';
        }).join('') +
      '</div>' +
      '<textarea id="reviewComment" class="review-textarea" maxlength="500" placeholder="Cuéntanos tu experiencia con XPass..."></textarea>' +
      '<button type="button" class="review-submit-btn" id="reviewSubmit">Publicar reseña</button>';

    let picked = 5;
    const picker = document.getElementById('starPicker');
    const starsBtns = picker.querySelectorAll('.rsp-star');
    function paint(v) { starsBtns.forEach(function (b) { b.classList.toggle('on', +b.dataset.val <= v); }); }
    paint(picked);
    starsBtns.forEach(function (b) {
      b.addEventListener('mouseenter', function () { paint(+b.dataset.val); });
      b.addEventListener('mouseleave', function () { paint(picked); });
      b.addEventListener('click', function () { picked = +b.dataset.val; paint(picked); });
    });

    document.getElementById('reviewSubmit').addEventListener('click', function () {
      const btn = this;
      const comment = document.getElementById('reviewComment').value.trim();
      if (comment.length < 3) { toastMsg('Escribe un comentario'); return; }
      btn.disabled = true; btn.textContent = 'Publicando...';
      fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: picked, comment: comment })
      })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          btn.disabled = false; btn.textContent = 'Publicar reseña';
          if (!res.ok) { toastMsg(res.d.error || 'No se pudo publicar'); return; }
          // recargar reseñas de usuario y mostrar la nueva al final
          loadUserReviews(function () {
            // mostrar todas para que se vea hasta abajo
            const grid = document.getElementById('reviewsGrid');
            shown = 0; if (grid) grid.innerHTML = '';
            renderSummary();
            while (shown < allReviews.length) renderMore();
            const cards = grid ? grid.querySelectorAll('.review-card') : [];
            if (cards.length) cards[cards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
            toastMsg('¡Gracias por tu reseña!');
            document.getElementById('reviewComment').value = '';
          });
        })
        .catch(function () { btn.disabled = false; btn.textContent = 'Publicar reseña'; toastMsg('Error de conexión'); });
    });
  }

  function toastMsg(msg) {
    const t = document.getElementById('toast');
    if (!t) { return; }
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  function loadUserReviews(cb) {
    fetch('/api/reviews')
      .then(function (r) { return r.json(); })
      .then(function (list) {
        allReviews = SEED.concat(Array.isArray(list) ? list : []);
        if (cb) cb(); else renderAll();
      })
      .catch(function () { allReviews = SEED.slice(); if (cb) cb(); else renderAll(); });
  }

  function init() {
    const btn = document.getElementById('reviewsMoreBtn');
    if (btn) btn.addEventListener('click', renderMore);
    renderAll();
    loadUserReviews();
    fetch('/api/auth/me')
      .then(function (r) { return r.json(); })
      .then(function (d) { me = d || { loggedIn: false }; renderForm(); })
      .catch(function () { me = { loggedIn: false }; renderForm(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
