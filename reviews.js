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

  const comments = [
    'Excelente servicio, el código me llegó en menos de 5 minutos. Súper recomendado.',
    'Compré el de 12 meses y todo funcionó perfecto. Mucho más barato que en la tienda oficial.',
    'Rápido y confiable. Pagué por SPEI y enseguida me mandaron mi código por WhatsApp.',
    'La verdad tenía miedo de que fuera estafa pero todo legítimo. Ya voy por mi segunda compra.',
    'Muy buena atención, me resolvieron una duda al instante. El código activó sin problemas.',
    'Precios increíbles y entrega inmediata. Es mi tienda de confianza para Game Pass.',
    'Todo perfecto, activé mi Ultimate en la consola y ya estoy jugando. Gracias!',
    'Súper recomendado, el proceso fue facilísimo y el ahorro vale muchísimo la pena.',
    'Me atendieron rapidísimo por WhatsApp. Código válido y entrega al momento.',
    'Llevo varias compras aquí y nunca me han fallado. 100% confiable.',
    'El de un mes me salió mucho más barato. Llegó al instante, sin vueltas.',
    'Buena experiencia, aunque tardó unos 10 minutos en llegar el correo. Todo bien al final.',
    'Increíble el precio del plan anual. Activé sin problemas en PC y consola.',
    'Atención de 10, me guiaron en todo el proceso de pago. Volveré a comprar.',
    'Funcionó perfecto, código original y entrega inmediata como prometen.',
    'Compré de madrugada y aún así me respondieron rápido. Excelente.',
    'La mejor opción para comprar Game Pass en México. Barato y seguro.',
    'Todo salió bien, solo tarde un poco en entender el pago por SPEI pero me ayudaron.',
    'Recomendadísimo, mi código llegó en segundos y se activó sin problema.',
    'Muy contento con la compra, el precio no lo encuentras en ningún otro lado.',
    'Servicio impecable. Pagué con tarjeta y al instante tenía mi suscripción.',
    'Ya renové mi Ultimate aquí por segunda vez. Siempre cumplen.',
    'Confiable y rápido. El código funcionó a la primera en mi Xbox Series S.',
    'Buen precio y buena atención. Un poquito de espera pero valió la pena.',
    'Me encantó lo fácil que fue todo. De verdad entrega inmediata.',
    'Excelente, justo lo que buscaba. Game Pass barato y sin complicaciones.',
    'Todo legítimo, ya lo probé y mi suscripción quedó activa por los 12 meses.',
    'Atención super amable y el código llegó volando. Cinco estrellas.',
    'Compra segura, me dieron factura del pago y todo. Muy profesionales.',
    'Llegó rápido y el ahorro es enorme comparado con la Microsoft Store.',
    'Genial, activé el código y de inmediato tenía acceso a todos los juegos.',
    'Primera vez que compro y quedé muy satisfecho. Repetiré sin dudarlo.',
    'Todo correcto, el soporte por WhatsApp es muy atento y rápido.',
    'Buenísimo, mi hijo feliz con su Game Pass. Entrega al momento.',
    'El proceso fue claro y rápido. Recomiendo pagar por SPEI, llega enseguida.'
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
      const rating = (i % 25 === 0) ? 4 : 5;       // ~4 de 4★, resto 5★  → promedio ~4.96
      const comment = comments[(i * 7 + (isM ? 0 : 3)) % comments.length];
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
