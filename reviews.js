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

  // 100 comentarios únicos (sin repetir). Los índices múltiplos de 10 llevan 4★.
  const comments = [
    'Buen servicio en general. Tardó unos minutos más de lo que esperaba, pero el código llegó bien y funcionó.',
    'Excelente, el código me llegó en menos de 5 minutos. Súper recomendado.',
    'Compré el plan de 12 meses y todo perfecto. Mucho más barato que en la tienda oficial.',
    'Rápido y confiable, pagué por SPEI y enseguida me mandaron el código por WhatsApp.',
    'Tenía miedo de que fuera estafa pero todo legítimo. Ya voy por mi segunda compra.',
    'Me resolvieron una duda al instante y el código activó sin ningún problema.',
    'Precios increíbles y entrega inmediata. Ya es mi tienda de confianza para Game Pass.',
    'Activé mi Ultimate en la consola y me puse a jugar de inmediato. ¡Gracias!',
    'El proceso fue facilísimo y el ahorro vale muchísimo la pena.',
    'Me atendieron rapidísimo por WhatsApp, código válido y al momento.',
    'Todo correcto, aunque me costó un poco entender el pago por SPEI. Al final salió bien.',
    'Llevo tres compras aquí y nunca me han fallado. Cien por ciento confiables.',
    'El de un mes me salió muchísimo más barato. Llegó al instante.',
    'Increíble el precio del plan anual. Activé sin problemas en PC y consola.',
    'Atención de diez, me guiaron en todo el pago. Volveré a comprar seguro.',
    'Código original y entrega inmediata tal como prometen. Sin trucos.',
    'Compré de madrugada y aún así me contestaron rápido. Excelente servicio.',
    'La mejor opción para comprar Game Pass en México: barato y seguro.',
    'Mi código llegó en segundos y se activó a la primera. Muy recomendable.',
    'Estoy feliz con la compra, ese precio no lo encuentras en ningún otro lado.',
    'Buena experiencia. El correo tardó como 15 minutos, pero el soporte estuvo al pendiente.',
    'Pagué con tarjeta y al instante ya tenía mi suscripción activa.',
    'Renové mi Ultimate por segunda vez aquí. Siempre cumplen.',
    'El código funcionó a la primera en mi Xbox Series S. Todo impecable.',
    'Me encantó lo fácil que fue todo. De verdad es entrega inmediata.',
    'Justo lo que buscaba: Game Pass barato y sin complicaciones.',
    'Todo legítimo, mi suscripción quedó activa los 12 meses completos.',
    'Atención súper amable y el código llegó volando. Cinco estrellas.',
    'Compra segura, hasta me pasaron el comprobante del pago. Muy profesionales.',
    'El ahorro es enorme comparado con la Microsoft Store. Repetiré.',
    'Cumplieron con lo prometido. Solo sugiero que acepten más métodos de pago.',
    'Activé el código y de inmediato tenía acceso a todos los juegos.',
    'Primera compra y quedé muy satisfecho. Sin dudarlo repetiré.',
    'El soporte por WhatsApp es muy atento y resuelve al momento.',
    'Mi hijo feliz con su Game Pass. Entrega al instante, todo bien.',
    'Proceso claro y rápido. Recomiendo pagar por SPEI, llega enseguida.',
    'Me daba desconfianza comprar en línea, pero superaron mis expectativas.',
    'Buenísimo, el código sirvió sin problema y el trato fue excelente.',
    'Llevaba meses buscando un lugar confiable y por fin lo encontré.',
    'Compré el plan anual y ahorré un montón. Activación instantánea.',
    'Todo en orden. La única observación es que la página podría tener más info de los planes.',
    'Me respondieron a media noche y resolvieron todo. Increíble atención.',
    'Código entregado al instante y funcionando. Cero quejas.',
    'Excelente trato, me explicaron paso a paso cómo canjear el código.',
    'Llegó rapidísimo a mi correo. Game Pass al mejor precio del mercado.',
    'Servicio rápido, seguro y barato. ¿Qué más se puede pedir?',
    'Ya lo recomendé a todos mis amigos gamers. No fallan.',
    'Activé en minutos y llevo semanas disfrutando del catálogo. Genial.',
    'Pago sencillo y entrega inmediata. Volveré por el próximo año.',
    'Muy buena tienda, el código llegó sin demoras y todo legal.',
    'Buen precio y buena atención. Hubo una pequeña espera pero valió la pena.',
    'Compré para regalo y quedó perfecto. Me mandaron hasta instrucciones.',
    'La atención por WhatsApp es inmediata. Resolvieron mi compra en minutos.',
    'Game Pass Ultimate a un precio que no creía posible. Súper.',
    'Todo salió tal cual lo prometen. Confianza total.',
    'Mi código funcionó perfecto en PC. Excelente experiencia de compra.',
    'Rápidos, claros y honestos. Ya soy cliente fiel.',
    'Increíble, en lo que preparaba el café ya tenía mi código. Jaja.',
    'Servicio impecable de principio a fin. Lo recomiendo al cien por ciento.',
    'El mejor precio que encontré en todo México. Y entrega al instante.',
    'Buena compra. Me hubiera gustado recibir una factura formal, pero todo funcionó.',
    'Sin trabas, sin demoras. Pagué y a los minutos estaba jugando.',
    'Excelente, ya es la tercera vez que renuevo aquí. Nunca fallan.',
    'Trato muy amable y profesional. El código llegó al instante.',
    'Compré el de un mes para probar y quedé encantado. Voy por el anual.',
    'Muy confiable, me dieron seguimiento hasta que activé mi suscripción.',
    'El ahorro frente a la tienda oficial es brutal. Totalmente recomendado.',
    'Llegó al toque y sin problemas. Atención de primera por WhatsApp.',
    'Quedé sorprendido por lo rápido. En serio, entrega inmediata.',
    'Compra segura y precio inmejorable. Repetiré sin pensarlo.',
    'Todo bien. Quizá agregar pago con OXXO ayudaría, pero el SPEI funcionó perfecto.',
    'El código activó sin problema en mi cuenta. Servicio excelente.',
    'Me encantó la rapidez y la honestidad. Cliente nuevo y fiel.',
    'Precio justo, entrega inmediata y soporte en español. Diez de diez.',
    'Compré tarde y aún así me atendieron al instante. Increíble.',
    'Funcionó perfecto en mi Xbox y en la app de PC. Sin detalles.',
    'La experiencia más fácil que he tenido comprando un código.',
    'Súper recomendados. Ahorré bastante y todo fue legítimo.',
    'Atención inmediata y código entregado al momento. Excelente.',
    'Ya renové dos años seguidos con ellos. Confianza absoluta.',
    'Buen servicio. El único detalle fue que tuve que escribir para confirmar, pero respondieron rápido.',
    'Increíble precio y cero complicaciones. Mi nueva tienda de cabecera.',
    'Pagué por SPEI y en cinco minutos tenía mi Game Pass. Brutal.',
    'Todo legítimo y rapidísimo. Lo recomiendo con los ojos cerrados.',
    'Excelente atención, me ayudaron a canjear el código paso a paso.',
    'Compra fácil, segura y barata. Volveré el próximo año seguro.',
    'El código llegó al instante a mi WhatsApp. Servicio impecable.',
    'Mejor precio imposible. Activación inmediata y sin riesgos.',
    'Muy profesionales, resolvieron todas mis dudas antes de pagar.',
    'Llevo varias compras y siempre la misma calidad. Excelentes.',
    'Buena tienda. La entrega no fue tan instantánea como pensé, pero llegó el mismo día sin problema.',
    'Activé mi Ultimate en segundos. El mejor lugar para comprarlo.',
    'Trato excelente y precio inigualable. Totalmente confiable.',
    'Rápido, seguro y económico. Ya lo recomendé a mi familia.',
    'Compré el plan anual y fue la mejor decisión. Ahorro enorme.',
    'Me sorprendió la rapidez del servicio. Código válido al instante.',
    'Sin duda volveré. Atención de lujo y entrega inmediata.',
    'Todo perfecto, desde el pago hasta la activación. Cinco estrellas.',
    'El soporte es increíble, siempre disponibles por WhatsApp.',
    'La mejor compra de Game Pass que he hecho. Barato y al instante.'
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
