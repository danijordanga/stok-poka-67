// Clasifica títulos de tienda en: colección, tipo de producto, variante (Pokémon) e idioma,
// y agrupa ofertas del mismo producto de distintas tiendas.

export const norm = s => String(s ?? '').toLowerCase()
  .replace(/[ºª°]/g, 'o')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[–—−]/g, '-').replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ').trim();

export function decodeEntities(s) {
  return String(s ?? '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/&([aeiouAEIOU])(acute);/g, (_, v) => ({ a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', A: 'Á', E: 'É', I: 'Í', O: 'Ó', U: 'Ú' }[v]))
    .replace(/&ntilde;/g, 'ñ').replace(/&Ntilde;/g, 'Ñ').replace(/&uuml;/g, 'ü')
    .replace(/&[lr]squo;/g, "'").replace(/&ndash;/g, '-').replace(/&mdash;/g, '-').replace(/&hellip;/g, '...');
}

// ---------------------------------------------------------------- Colecciones
// Orden importa: lo más específico primero. Incluye nombres en español, inglés y japonés.
export const COLLECTIONS = [
  { id: 'dominio-delta', name: 'Megaevolución: Dominio Delta (Delta Reign)', sort: '2026-11', label: '6 de noviembre 2026', re: /dominio delta|delta reign|storm emeralda/ },
  { id: 'primer-companero', name: 'Primer Compañero (First Partner)', sort: '2026-03', label: 'marzo a agosto 2026', re: /primer(os)? companero|first partner/ },
  { id: 'pokemon-day', name: 'Pokémon Day 2026', sort: '2026-02', label: '2026', re: /pokemon day|dia pokemon/ },
  { id: '30-aniversario', name: 'Celebración 30 Aniversario', sort: '2026-09', label: 'septiembre 2026', re: /30\s*\.?\s*(th|o)?\s*(aniv\w*|anniv\w*|celebr\w*)|celebra\w*\s*(del\s*)?30|\b30th\b/ },
  { id: 'oscuridad-absoluta', name: 'Megaevolución: Oscuridad Absoluta', sort: '2026-07', label: 'julio 2026', re: /oscuridad absoluta|tinieblas umbrias|absolute darkness/ },
  { id: 'caos-creciente', name: 'Megaevolución: Caos Creciente', sort: '2026-05', label: 'mayo 2026', re: /caos creciente|chaos rising/ },
  { id: 'equilibrio-perfecto', name: 'Megaevolución: Equilibrio Perfecto', sort: '2026-03b', label: 'marzo 2026', re: /equilibrio perfecto|perfect order|cero aniquilador|nihil zero/ },
  { id: 'heroes-ascendentes', name: 'Megaevolución: Héroes Ascendentes', sort: '2026-01', label: 'enero 2026', re: /heroes (ascend\w*|trascend\w*|transcend\w*)|ascenso heroico|ascended heroes|mega dream/ },
  { id: 'llamas-fantasmales', name: 'Megaevolución: Llamas Fantasmales', sort: '2025-11', label: 'noviembre 2025', re: /(llamas|fuegos) fantasm\w*|phantasmal flames|inferno x/ },
  { id: 'megaevolucion', name: 'Megaevolución (set base)', sort: '2025-09', label: 'septiembre 2025', re: /mega ?evoluci(on|ones)|mega evolution|mega brave|mega symphonia/ },
  { id: 'fulgor-negro-llama-blanca', name: 'Fulgor Negro / Llama Blanca', sort: '2025-07', label: 'julio 2025', re: /fulgor negro|llama blanca|black bolt|white flare/ },
  { id: 'rivales-predestinados', name: 'Rivales Predestinados', sort: '2025-05', label: 'mayo 2025', re: /rivales predestinados|destined rivals/ },
  { id: 'juntos-de-aventuras', name: 'Juntos de Aventuras', sort: '2025-03', label: 'marzo 2025', re: /juntos de aventura\w*|aventuras (compartidas|en conjunto)|companeros de aventura|journey together/ },
  { id: 'evoluciones-prismaticas', name: 'Evoluciones Prismáticas', sort: '2025-01', label: 'enero 2025', re: /evoluciones prismaticas|prismatic evolutions|prismaticas/ },
  { id: 'chispas-fulgurantes', name: 'Chispas Fulgurantes', sort: '2024-11', label: 'noviembre 2024', re: /chispas fulgurantes|surging sparks/ },
];
export const EXTRA_COLLECTIONS = [
  { id: 'accesorios', name: 'Accesorios (fundas, tapetes…)', sort: '0001', label: '', re: null },
  { id: 'otros', name: 'Otros productos (sin clasificar)', sort: '0000', label: 'puede incluir productos antiguos', re: null },
];

// Sets de más de 2 años: se descartan
const OLD_RE = /corona astral|stellar crown|fabula sombria|shrouded fable|mascarada crepuscular|twilight masquerade|fuerzas temporales|temporal forces|destinos de paldea|paldean fates|evoluciones en paldea|paldea evolved|llamas obsidiana|obsidian flames|brecha paradojica|paradox rift|\b151\b|origen perdido|lost origin|tempestad plateada|silver tempest|zenit supremo|crown zenith|astros brillantes|brilliant stars|escarlata y purpura|scarlet (&|and) violet|espada y escudo|sword (&|and) shield|celebraciones|celebrations|25th|champion.?s path|shining fates|fusion strike|evolving skies|cielos evolutivos|pokemon go\b/;

const EXCLUDE_RE = /peluche|plush|funko|nintendo|switch|lego|camiseta|sudadera|taza\b|llavero|mochila|puzzle|rompecabezas|gorra|pijama|calcetin|amiibo|nanoblock|model kit|\blibro\b|\bmanga\b|figura de accion|squishmallow|jazwares|one piece|magic|yu-?gi-?oh|lorcana|digimon|dragon ball|star wars|riftbound|union arena|flesh and blood|naruto|weiss|carta suelta|\bsingles?\b|psa ?\d|\bcgc\b|\bbgs\b|gradad|graded|\b\d{1,3}\/\d{2,3}\b/;

const ACCESSORY_RE = /funda|sleeves?|protectores?|playmat|tapete|deck ?box|portamazo|deck shield|toploader|porta ?cartas|carpeta|\bbinder\b|album|portfolio|\bdados\b|marcadores|\bcoin(s)?\b(?! set)|storage|ultra pro|dragon shield|gamegenic|ultimate guard|metacrilato|acrilico|\bstand\b/;
// Carpetas/álbumes que vienen CON sobres son un producto de colección, no un accesorio
const ACCESSORY_BUT_COLLECTION = /(binder|album|carpeta).*(collection|coleccion)|(collection|coleccion).*(binder|album|carpeta)|carpeta para colecciones|caja (binder|album|carpeta)|(binder|album|carpeta).*sobres|sobres.*(binder|album|carpeta)/;

// ---------------------------------------------------------------- Tipos de producto
// Orden importa (lo específico antes que lo genérico) y es el orden en que se muestran en la web.
export const TYPES = {
  etb:        { label: 'Caja de Entrenador Élite',   name: 'Caja de Entrenador Élite',  re: /elite trainer|entrenador elite|\betb\b|caja de entrenador/ },
  bundle:     { label: 'Booster Bundle',             name: 'Booster Bundle (6 sobres)', re: /booster bundle|bundle|paquete de sobres|lote( de)? \d* ?sobres|\b6 sobres|pack de 6\b/ },
  booster_box:{ label: 'Display / Booster Box',      name: 'Display (36 sobres)',       re: /booster box|booster display|display(?! set)(?!.*card)|caja de 36|36 sobres|caja de sobres|collector display/ },
  upc:        { label: 'Ultra-Premium',              name: 'Colección Ultra-Premium',   re: /ultra.?premium|\bupc\b/ },
  case:       { label: 'Cases (cajas master)',       name: 'Case (caja master)',        re: /\bcase\b|caja master|master case/ },
  buildbattle:{ label: 'Build & Battle',             name: 'Build & Battle Box',        re: /build ?(&|and|y) ?battle|combina y combate/ },
  minitin:    { label: 'Minilatas',                  name: 'Minilata',                  re: /mini ?latas?|mini ?tins?/ },
  techsticker:{ label: 'Colecciones con calcomanías', name: 'Colección con calcomanías', re: /tech ?sticker|calcomania|pegatina/ },
  blister:    { label: 'Blísters',                   name: 'Blíster',                   re: /blister|3.?pack|2.?pack|checklane|\b[23] sobres\b/ },
  tin:        { label: 'Latas (grandes)',            name: 'Lata',                      re: /\blatas?\b|\btins?\b/ },
  deck:       { label: 'Mazos',                      name: 'Mazo de combate',           re: /battle deck|mazo|baraja|deck set|premium deck|theme deck|league battle|\bdeck\b/ },
  poster:     { label: 'Colecciones con póster',     name: 'Colección con póster',      re: /poster/ },
  binder:     { label: 'Carpetas con sobres',        name: 'Carpeta / álbum con sobres', re: /binder|album|carpeta/ },
  figure:     { label: 'Colecciones con figura',     name: 'Colección con figura',      re: /figure|figura/ },
  premium:    { label: 'Colecciones premium',        name: 'Colección premium',         re: /premium/ },
  knockout:   { label: 'Knock Out',                  name: 'Colección Knock Out',       re: /knock ?out/ },
  surprise:   { label: 'Cajas sorpresa',             name: 'Caja sorpresa',             re: /surprise box|caja sorpresa|sobre sorpresa/ },
  coin:       { label: 'Sets de monedas',            name: 'Set de monedas',            re: /coin set|set de monedas|monedas? (set|coleccion)|badge coin/ },
  exbox:      { label: 'Cajas ex',                   name: 'Caja ex',                   re: /\bex box\b|special box|caja ex\b|colecci\w* (de )?(\w+ )?ex\b|colecci\w* (sylveon|greninja)/ },
  collection: { label: 'Otras cajas de colección',   name: 'Caja de colección',         re: /colecci(on)?|collection|\bbox\b|caja|special|card display|display set/ },
  pack:       { label: 'Sobres sueltos',             name: 'Sobres sueltos',            re: /\bsobres?\b|booster packs?|\bbooster\b|\bpacks?\b/ },
};
export const TYPE_LABELS = { ...Object.fromEntries(Object.entries(TYPES).map(([k, v]) => [k, v.label])), other: 'Otros productos', accessory: 'Accesorios' };
export const TYPE_ORDER = [...Object.keys(TYPES), 'other', 'accessory'];

// ---------------------------------------------------------------- Idiomas
const LANGS = [
  ['ES', /espanol|castellano|spanish|[\(\[]es[\)\]]|\|\s*es\b|-\s*es\b|\bes$/],
  ['EN', /ingles|english|[\(\[]e(n|ng)[\)\]]|\|\s*en\b|-\s*en\b|\beng\b|\ben$/],
  ['JP', /japones|japanese|\bjp\b|\bjap\b|\bjpn\b|[\(\[]jp[\)\]]/],
  ['KR', /coreano|korean|\bkr\b|\bkor\b/],
  ['ZH', /chino|chinese|\bzh\b|\bcn\b|simplificado|tradicional/],
  ['OT', /aleman|german|deutsch|frances|french|\bfr\b|italiano|italian|portugues/],
];
export const LANG_LABELS = { ES: 'Español', EN: 'Inglés', JP: 'Japonés', KR: 'Coreano', ZH: 'Chino', OT: 'Otros idiomas', ML: 'Varios idiomas', '?': 'Idioma sin indicar' };

export function detectLang(text) {
  const hits = LANGS.filter(([, re]) => re.test(text)).map(([l]) => l);
  if (hits.length === 0) return '?';
  if (hits.length === 1) return hits[0];
  return 'ML';
}
export function detectType(text) {
  if (ACCESSORY_RE.test(text) && !ACCESSORY_BUT_COLLECTION.test(text)) return 'accessory';
  for (const [k, v] of Object.entries(TYPES)) if (v.re.test(text)) return k;
  return null;
}

// Devuelve { c, t, l, col, text } o null si se descarta
export function classify({ title, tags = '', vendor = '' }) {
  const text = norm(`${title} ${tags}`);
  if (EXCLUDE_RE.test(text)) return null;
  const isPoke = /pokemon/.test(text) || /pokemon/.test(norm(vendor));
  const col = COLLECTIONS.find(c => c.re.test(text)) || null;
  if (!col) {
    if (!isPoke) return null;
    if (OLD_RE.test(text)) return null;
  }
  let t = detectType(text);
  if (!t) { if (!col) return null; t = 'other'; }
  let c = col ? col.id : 'otros';
  if (t === 'accessory') { if (!isPoke && !col) return null; c = 'accesorios'; }
  return { c, t, l: detectLang(text), col: t === 'accessory' ? null : col, text };
}

// ---------------------------------------------------------------- Variantes (Pokémon protagonista)
const SPECIES = ['mewtwo', 'mew', 'espeon', 'umbreon', 'sylveon', 'greninja', 'pikachu', 'charizard', 'lucario', 'exeggutor', 'ditto', 'eevee',
  'vaporeon', 'jolteon', 'flareon', 'leafeon', 'glaceon', 'zygarde', 'starmie', 'clefable', 'skarmory', 'darkrai', 'excadrill', 'rayquaza',
  'golisopod', 'golurk', 'malamar', 'seel', 'spritzee', 'ampharos', 'delphox', 'xerneas', 'deoxys', 'keldeo', 'delibird', 'gengar', 'zarude',
  'lapras', 'moltres', 'zapdos', 'articuno', 'vivillon', 'snorlax', 'gardevoir', 'mimikyu', 'dragapult', 'ceruledge', 'garchomp', 'kyogre',
  'groudon', 'lugia', 'gyarados', 'blastoise', 'venusaur', 'tyrunt', 'tyrantrum', 'doublade', 'serperior', 'barbaracle', 'meganium', 'feraligatr',
  'typhlosion', 'latias', 'latios', 'chandelure', 'victini', 'reshiram', 'zekrom', 'kyurem', 'arceus', 'dialga', 'palkia', 'giratina'];

// ---------------------------------------------------------------- Agrupar ofertas del mismo producto
const STOP = new Set(['pokemon', 'tcg', 'jcc', 'de', 'del', 'la', 'el', 'los', 'las', 'con', 'y', 'e', 'o', 'the', 'of', 'and', 'a', 'en', 'por', 'para', 'un', 'una', 'set',
  'nuevo', 'new', 'reserva', 'preventa', 'pre', 'venta', 'order', 'preorder', 'oferta', 'coleccion', 'collection', 'caja', 'box', 'pack', 'sobres', 'sobre',
  'booster', 'boosters', 'unidades', 'uds', 'ud', 'x', 'edicion', 'edition', 'aniversario', 'anniversary', 'celebracion', 'celebraciones', 'celebration', 'precintado', 'sellado',
  'megaevolucion', 'megaevoluciones', 'mega', 'evolution', 'evolucion', 'escarlata', 'purpura', 'scarlet', 'violet', 'elite', 'trainer', 'entrenador',
  'surtido', 'surtidos', 'aleatorio', 'aleatorios', 'modelo', 'modelos', 'varios', 'unico', 'oficial', 'original', 'mini', 'lata', 'latas', 'tin', 'tins', 'minilata', 'minilatas',
  'blister', 'blisters', 'ex', 'deck', 'alola', 'alolan', 'alolano', 'edicion', 'especial', 'special', 'version', 'idioma']);

const cap = w => w.split(/([-\s]+)/).map(p => /^[-\s]+$/.test(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)).join('');

export function tokensOf(cls) {
  let s = cls.text;
  if (cls.col) s = s.replace(new RegExp(cls.col.re.source, 'g'), ' ');
  if (TYPES[cls.t]) s = s.replace(new RegExp(TYPES[cls.t].re.source, 'g'), ' ');
  for (const [, re] of LANGS) s = s.replace(new RegExp(re.source, 'g'), ' ');
  if (cls.t !== 'blister') s = s.replace(/\b\d ?(sobres|packs?)\b/g, ' ');
  const sp = new Set(SPECIES.filter(x => new RegExp(`\\b${x}\\b`).test(s)));
  const w = new Set(s.replace(/[^a-z0-9]+/g, ' ').split(' ').filter(x => x && !STOP.has(x) && !sp.has(x)));
  if (cls.t === 'blister') for (const m of cls.text.matchAll(/\b([2-6]) ?(?:sobres|packs?)\b/g)) w.add('x' + m[1]);
  return { w, sp };
}

const subset = (a, b) => [...a].every(x => b.has(x));

// Mismo producto si el Pokémon coincide (o uno incluye al otro: "Sylveon" y "Sylveon / Greninja")
// y las demás palabras se parecen. Un título sin Pokémon ("Mini Lata surtido") no se mezcla con uno con Pokémon.
export function compatible(a, b) {
  const spOk = (a.sp.size === 0 && b.sp.size === 0) || (a.sp.size > 0 && b.sp.size > 0 && (subset(a.sp, b.sp) || subset(b.sp, a.sp)));
  if (!spOk) return false;
  const A = a.w, B = b.w;
  if (A.size === 0 || B.size === 0) return A.size === B.size;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const min = Math.min(A.size, B.size);
  if (min >= 2 && inter === min) return true;
  return inter / (A.size + B.size - inter) >= 0.6;
}

export function clusterItems(items) {
  const withTok = items.map(it => ({ it, tok: tokensOf(it.cls) }));
  withTok.sort((x, y) => (x.tok.w.size + x.tok.sp.size) - (y.tok.w.size + y.tok.sp.size));
  const clusters = [];
  for (const x of withTok) {
    const hit = clusters.find(cl => compatible(cl.tok, x.tok));
    if (hit) { hit.members.push(x.it); for (const s of x.tok.sp) hit.tok.sp.add(s); }
    else clusters.push({ tok: { w: new Set(x.tok.w), sp: new Set(x.tok.sp) }, members: [x.it] });
  }
  return clusters.map(cl => {
    const freq = new Map();
    for (const m of cl.members) { const k = norm(m.title); freq.set(k, (freq.get(k) || 0) + 1); }
    const best = cl.members.slice().sort((a, b) => (freq.get(norm(b.title)) - freq.get(norm(a.title))) || a.title.length - b.title.length)[0];
    return { name: best.title, items: cl.members };
  });
}

// Agrupa los productos de una colección y tipo. Cada idioma va aparte, pero un producto sin idioma
// en el título se une al grupo en español si es el mismo producto (y se marca "idioma no indicado").
export function clusterBucket(items) {
  const byLang = new Map();
  for (const it of items) { const l = it.cls.l; (byLang.get(l) || byLang.set(l, []).get(l)).push(it); }
  const out = [];
  for (const [l, list] of byLang) if (l !== '?') for (const cl of clusterItems(list)) out.push({ l, name: cl.name, items: cl.items });
  for (const cl of clusterItems(byLang.get('?') || [])) {
    const tok = unionTokens(cl.items);
    const target = out.find(g => g.l === 'ES' && compatible(unionTokens(g.items), tok));
    if (target) target.items.push(...cl.items.map(i => ({ ...i, langUnknown: true })));
    else out.push({ l: '?', name: cl.name, items: cl.items });
  }
  return out;
}

function unionTokens(items) {
  const w = new Set(), sp = new Set();
  const first = tokensOf(items[0].cls);
  for (const x of first.w) w.add(x);
  for (const it of items) for (const x of tokensOf(it.cls).sp) sp.add(x);
  return { w, sp };
}

// Nombre limpio y uniforme del producto: "Caja de Entrenador Élite", "Minilata · Espeon", "Caja ex · Greninja / Sylveon"
export function groupTitle(t, items) {
  const tok = unionTokens(items);
  let name = TYPES[t]?.name || (t === 'accessory' ? 'Accesorio' : 'Producto');
  if (t === 'blister') { const x = [...tok.w].find(w => /^x\d$/.test(w)); if (x) name = `Blíster ${x.slice(1)} sobres`; }
  const parts = [name];
  if (tok.sp.size) parts.push([...tok.sp].sort().map(cap).join(' / '));
  if (['collection', 'other', 'deck', 'pack', 'premium', 'case'].includes(t)) {
    const extra = [...tok.w].filter(w => !/^x\d$/.test(w) && !/^\d+$/.test(w) && w.length > 2).slice(0, 3).map(cap).join(' ');
    if (extra) parts.push(extra);
  }
  return parts.join(' · ');
}
