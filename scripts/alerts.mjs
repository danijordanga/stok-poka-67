// Avisos al móvil cuando un producto de alertas.json aparece con stock (o baja de precio).
// Canales: Telegram (TELEGRAM_TOKEN + TELEGRAM_CHAT_ID) y/o ntfy (NTFY_TOPIC). Sin ellos no envía nada.
import { norm } from './classify.mjs';

const AVAIL = new Set(['in_stock', 'preorder']);
const LABEL = { in_stock: 'en stock', preorder: 'preventa' };
const eur = n => n == null ? 'sin precio' : n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Precio de referencia de pvp.json para un producto (colección > tipo; ETB de Pokémon Center aparte)
export function refPrice(pvp, c, t, name = '') {
  if (!pvp) return null;
  const key = t === 'etb' && /pokemon center/.test(norm(name)) ? 'etb_pc' : t;
  const v = pvp.colecciones?.[c]?.[key] ?? pvp.tipos?.[key];
  return Number.isFinite(v) ? v : null;
}

function index(data) {
  const groups = new Map((data?.groups || []).map(g => [g.id, g]));
  const cols = new Map((data?.cols || []).map(c => [c.id, c.name]));
  return (data?.items || []).map(it => ({ it, g: groups.get(it.g) })).filter(x => x.g).map(x => ({ ...x, col: cols.get(x.g.c) || '' }));
}

// ¿Cumple el producto la regla? prevRun=true acepta datos antiguos para no avisar de nuevo cuando una tienda vuelve a responder
function matches(rule, { it, g, col }, pvp, prevRun = false) {
  const words = norm(rule.buscar || '').split(/\s+/).filter(Boolean);
  if (!words.length) return false;
  const hay = norm(`${g.n} ${it.n} ${col}`);
  if (!words.every(w => hay.includes(w))) return false;
  if (rule.idioma) {
    const want = [].concat(rule.idioma).map(x => String(x).toUpperCase());
    if (!want.includes(g.l) && g.l !== 'ML') return false;
  }
  if (rule.tienda && !norm(it.s).includes(norm(rule.tienda))) return false;
  if (it.o && !prevRun) return false;
  if (rule.soloStock ? it.st !== 'in_stock' : !AVAIL.has(it.st)) return false;
  if (rule.max != null && !(it.p != null && it.p <= rule.max)) return false;
  if (rule.sobrePvp != null) {
    const ref = refPrice(pvp, g.c, g.t, it.n);
    // por debajo del 60 % del PVP suele ser un producto mal clasificado: no avisa
    if (ref == null || it.p == null || it.p < ref * 0.6 || it.p > ref * (1 + rule.sobrePvp / 100)) return false;
  }
  return true;
}

export function findAlerts({ out, prev, rules, pvp }) {
  const now = index(out), before = index(prev);
  const hits = [];
  for (const rule of rules || []) {
    const was = new Map(before.filter(x => matches(rule, x, pvp, true)).map(x => [x.it.u, x.it.p]));
    for (const x of now.filter(x => matches(rule, x, pvp))) {
      const p0 = was.get(x.it.u);
      const isNew = !was.has(x.it.u);
      const cheaper = !isNew && p0 != null && x.it.p != null && x.it.p <= p0 * 0.95;
      if (isNew || cheaper) hits.push({ rule, ...x, why: isNew ? 'nuevo' : `bajó de ${eur(p0)}` });
    }
  }
  return hits;
}

function lines(hits, pvp, html) {
  const byRule = new Map();
  for (const h of hits) { const k = h.rule.nombre || h.rule.buscar; if (!byRule.has(k)) byRule.set(k, []); byRule.get(k).push(h); }
  const out = [];
  for (const [name, list] of byRule) {
    out.push(html ? `🔔 <b>${esc(name)}</b>` : `🔔 ${name}`);
    for (const h of list.sort((a, b) => (a.it.p ?? 1e9) - (b.it.p ?? 1e9))) {
      const ref = refPrice(pvp, h.g.c, h.g.t, h.it.n);
      const vs = ref && h.it.p != null ? ` (${h.it.p <= ref ? 'a PVP o menos' : `+${Math.round((h.it.p / ref - 1) * 100)}% sobre PVP`})` : '';
      const lang = h.g.l === 'ML' ? ', varios idiomas: confirma el tuyo' : '';
      const extra = h.why === 'nuevo' ? '' : `, ${h.why}`;
      out.push(html
        ? `• <a href="${esc(h.it.u)}">${esc(h.it.s)}</a>: ${eur(h.it.p)}${vs}, ${LABEL[h.it.st]}${esc(lang)}${esc(extra)}\n   ${esc(h.g.n)}, ${esc(h.col)}`
        : `• ${h.it.s}: ${eur(h.it.p)}${vs}, ${LABEL[h.it.st]}${lang}${extra}\n   ${h.g.n}, ${h.col}\n   ${h.it.u}`);
    }
    out.push('');
  }
  return out;
}

// Trocea en mensajes de menos de 3.500 caracteres (Telegram admite 4.096)
function chunks(arr, max = 3500) {
  const res = []; let cur = '';
  for (const l of arr) { if ((cur + l + '\n').length > max && cur) { res.push(cur); cur = ''; } cur += l + '\n'; }
  if (cur.trim()) res.push(cur);
  return res.map(t => t.trim());
}

async function post(url, opts) {
  const r = await fetch(url, { method: 'POST', signal: AbortSignal.timeout(15000), ...opts });
  if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (await r.text()).slice(0, 120));
}

export async function sendAlerts({ out, prev, rules, pvp, env = process.env }) {
  if (!rules?.length) return console.log('Alertas: alertas.json vacío');
  if (!prev?.items) return console.log('Alertas: primera ejecución, solo se toma nota del estado actual');
  const hits = findAlerts({ out, prev, rules, pvp });
  const { TELEGRAM_TOKEN: tg, TELEGRAM_CHAT_ID: chat, NTFY_TOPIC: topic } = env;
  console.log(`Alertas: ${hits.length} novedades` + (tg && chat ? ' · Telegram' : '') + (topic ? ' · ntfy' : '') + (!(tg && chat) && !topic ? ' (sin canal configurado, no se envían)' : ''));
  if (!hits.length) return;
  if (tg && chat) {
    for (const text of chunks(lines(hits, pvp, true))) {
      try { await post(`https://api.telegram.org/bot${tg}/sendMessage`, { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chat, text, parse_mode: 'HTML', disable_web_page_preview: true }) }); }
      catch (e) { console.log('  ✗ Telegram:', String(e.message || e).slice(0, 160)); break; }
    }
  }
  if (topic) {
    for (const text of chunks(lines(hits, pvp, false))) {
      try { await post(`https://ntfy.sh/${encodeURIComponent(topic)}`, { headers: { Title: 'Stock Pokemon TCG', Tags: 'bell', Click: hits[0].it.u }, body: text }); }
      catch (e) { console.log('  ✗ ntfy:', String(e.message || e).slice(0, 160)); break; }
    }
  }
}
