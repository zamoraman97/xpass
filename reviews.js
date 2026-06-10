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
    'la mejor compra de game pass que he hecho, barato y al instante',
    'buen servicio, nomas tarde un rato en recibir el correo pero al final llego todo bien',
    'compre y en lo que parpadee ya tenia el codigo, de pelos',
    'me dio confianza desde que me contestaron por wpp, todo claro',
    'el anual esta carisimo en otros lados, aqui me salio re barato',
    'lo active en mi xbox one sin bronca, sigo jugando',
    'atencion rapida y amable, me sente a esperar y ya estaba el codigo',
    'ya van varios codigos que compro aqui, siempre llegan',
    'todo chido, pague con tarjeta y al toque la suscripcion activa',
    'mi primo me recomendo la pagina y la neta no me arrepiento',
    'barato y rapido, lo que cualquier gamer busca',
    'todo funciono solo que me confundi con el numero de pedido, me lo aclararon rapido',
    'llego en menos de lo que pense, recomendadisimo',
    'compre a las 2am y me respondieron, no manches que servicio',
    'el codigo de 12 meses jalo perfecto, ya tengo año asegurado',
    'me late que aceptan spei, asi no batallo con tarjeta',
    'todo en orden, codigo valido y entrega volada',
    'la suscripcion entro de inmediato en la consola, gracias',
    'precio justo y sin vueltas, asi me gusta',
    'ya es mi tercera renovacion, confianza total con ellos',
    'rapidos pa contestar y pa entregar, excelentes',
    'buena compra aunque me hubiera gustado mas opciones de pago, igual recomiendo',
    'active el codigo en la app de pc y listo, facilisimo',
    'me sorprendio lo barato, pense que era mentira jaja',
    'todo legit, ya lo comprobe yo mismo',
    'el soporte me ayudo a canjearlo paso a pasito',
    'compre pa mi novio de regalo y quedo feliz',
    'sin duda el mejor precio de game pass en mexico',
    'llego al correo en 3 min, ni tiempo de arrepentirme jaja',
    'trato amable, te resuelven cualquier duda al toque',
    'ahorro un buen comprando el anual aqui, vale la pena',
    'todo bien en general, solo que la pagina podria cargar un poquito mas rapido',
    'active sin problema en mi series x, todo de lujo',
    'compra segura, me mando hasta el ticket del pago',
    'lo recomiendo al 100, ya somos varios en la familia comprando aqui',
    'rapidisimo, pague y ya tenia mi game pass listo',
    'me daba miedo que fuera fraude pero salio todo bien',
    'atencion de primera, contestan al instante por wpp',
    'barato rapido y seguro, no se que mas pedir',
    'el codigo entro a la primera, cero problemas',
    'ya renove otro año, siempre cumplen estos cuates',
    'buen servicio, tarde tantito en entender el spei pero me guiaron bien',
    'compre el de un mes pa probar y ya voy por el anual',
    'todo perfecto, mi suscripcion quedo activa al instante',
    'precio increible comparado con la store oficial',
    'me llego el codigo volando, lo active y a jugar',
    'muy confiables, me dieron seguimiento hasta el final',
    'el ahorro es real, comprobado, recomendado',
    'facil de pagar y entrega inmediata, asi debe ser',
    'ya lo recomende en mi grupo de discord, no fallan',
    'todo salio como dicen, sin letras chiquitas',
    'buena tienda, una pequeña espera pero el codigo llego sin falla',
    'active mi ultimate en segundos, increible la rapidez',
    'compre de noche y aun asi me atendieron, x10',
    'el mejor lugar pa comprar game pass barato, ya es oficial',
    'todo legit y rapido, repito sin pensarlo',
    'me explicaron como canjear bien clarito, gracias',
    'precio bajisimo y entrega al toque, contentisimo',
    'ya van 4 compras, ni una sola falla',
    'servicio impecable, lo recomiendo con confianza',
    'barato seguro y rapido, mi tienda de cabecera ya',
    'todo correcto, ojala tuvieran promos mas seguido pero el precio ya esta bien',
    'el codigo jalo en mi pc sin bronca, excelente',
    'compra rapida y segura, llegue y sali con mi codigo',
    'atencion super amable, resolvieron todo al instante',
    'compre pa regalo navideño y quedo perfecto',
    'muy confiable la pagina, ya la tengo guardada',
    'el ahorro frente a microsoft es enorme, no exagero',
    'llego al instante a mi correo, sin demoras',
    'me sorprendio lo rapido la verdad, mil gracias',
    'compra segura y barata, vuelvo seguro el otro año',
    'todo bien, solo tuve que escribir pa confirmar el pago pero rapido me respondieron',
    'active el codigo y de inmediato todos los juegos disponibles',
    'me gusto la honestidad y la rapidez, cliente fiel ya',
    'precio justo entrega rapida y en español, 10/10',
    'compre tarde y aun asi atencion al instante, increible',
    'jalo en xbox y en pc, sin ningun detalle',
    'lo mas facil que he comprado en linea, en serio',
    'recomendados al 100, ahorre harto y todo real',
    'atencion inmediata, codigo entregado volando',
    'ya llevo dos años renovando aqui, confianza total',
    'buen servicio nomas que tarde como 10 min, pero llego perfecto',
    'precio increible y sin complicaciones, mi tienda ya',
    'pague spei y en 5 min mi game pass listo, brutal',
    'todo legit y rapidisimo, ojos cerrados lo recomiendo',
    'excelente atencion, me canjearon la duda al toque',
    'compra facil segura y barata, vuelvo seguro',
    'el codigo llego a mi wpp al instante, impecable',
    'mejor precio imposible, activacion inmediata',
    'profesionales, me resolvieron dudas antes de pagar',
    'varias compras y siempre igual de bien, excelentes',
    'buena tienda, la entrega tardo un cachito pero llego el mismo dia sin bronca',
    'active en segundos, el mejor lugar pa comprar game pass',
    'trato excelente y precio inigualable, confiable al 100',
    'rapido seguro y economico, ya lo recomende a mis carnales',
    'compre el anual y fue la mejor decision, ahorrazo',
    'me sorprendio la rapidez, codigo valido al instante',
    'sin duda vuelvo, atencion de lujo y entrega rapida',
    'todo perfecto del pago a la activacion, sin detalles',
    'el soporte siempre disponible por wpp, increible',
    'la mejor compra de game pass que he hecho, barato y rapido',
    'todo bien, solo que esperaba que fuera mas inmediato pero a los minutos llego',
    'compre y al ratito ya estaba jugando, sin broncas',
    'me dieron mucha confianza por wpp, todo transparente',
    'el anual aqui esta regalado comparado con otros lados',
    'lo active en mi xbox sin problema, todo bien',
    'atencion rapida, ni batalle pa nada',
    'ya van varias compras y nunca un problema',
    'todo chido, pague con tarjeta y de volada activo',
    'me lo recomendaron y la neta cumplieron',
    'barato rapido y confiable, asi de simple',
    'buen servicio, me costo tantito el primer pago pero ya luego facil',
    'llego rapidisimo, mejor de lo que esperaba',
    'compre de madrugada y me atendieron, increible',
    'el codigo del año jalo perfecto, contentazo',
    'que bueno que aceptan spei, sin rollos de tarjeta',
    'todo en orden, codigo bueno y entrega volada',
    'entro la suscripcion al instante en consola, gracias',
    'precio justo sin sorpresas, me late',
    'ya es mi cuarta renovacion, full confianza',
    'rapidos pa todo, atencion y entrega, excelentes',
    'buena compra, me gustaria recibir factura pero igual todo jalo bien',
    'active el codigo en pc y listo, super facil',
    'me sorprendio lo barato neta, pense que era broma jaja'
  ];

  function buildSeed() {
    const out = [];
    for (let i = 0; i < comments.length; i++) {
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
      '<p class="review-text">' + escapeHtml(r.comment) + '</p>' +
      (r.image
        ? '<a class="review-shot" href="/uploads/' + encodeURIComponent(r.image) + '" target="_blank" rel="noopener">' +
            '<img src="/uploads/' + encodeURIComponent(r.image) + '" loading="lazy" alt="Captura de compra de un cliente de XPass" />' +
            '<span class="review-shot-badge">✓ Compra verificada</span>' +
          '</a>'
        : '');
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
      '<label class="review-img-label" for="reviewImage">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' +
        '<span id="reviewImgName">Adjuntar captura (opcional)</span>' +
      '</label>' +
      '<input type="file" id="reviewImage" accept="image/*" style="display:none" />' +
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

    // Nombre del archivo adjunto
    const imgInput = document.getElementById('reviewImage');
    imgInput.addEventListener('change', function () {
      const nameEl = document.getElementById('reviewImgName');
      if (imgInput.files && imgInput.files[0]) {
        if (imgInput.files[0].size > 6 * 1024 * 1024) {
          toastMsg('La imagen supera el máximo de 6 MB'); imgInput.value = '';
          nameEl.textContent = 'Adjuntar captura (opcional)'; return;
        }
        nameEl.textContent = imgInput.files[0].name;
      } else {
        nameEl.textContent = 'Adjuntar captura (opcional)';
      }
    });

    document.getElementById('reviewSubmit').addEventListener('click', function () {
      const btn = this;
      const comment = document.getElementById('reviewComment').value.trim();
      if (comment.length < 3) { toastMsg('Escribe un comentario'); return; }
      btn.disabled = true; btn.textContent = 'Publicando...';
      const fd = new FormData();
      fd.append('rating', picked);
      fd.append('comment', comment);
      if (imgInput.files && imgInput.files[0]) fd.append('image', imgInput.files[0]);
      fetch('/api/reviews', {
        method: 'POST',
        body: fd
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
