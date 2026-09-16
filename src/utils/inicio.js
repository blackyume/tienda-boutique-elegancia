// Los números del Inicio del panel. Lógica pura para poder testearla.
import { getTotalStock } from './variants';

const DIA = 86_400_000;

const aMillis = (t) => {
    if (!t) return 0;
    if (typeof t === 'number') return t;
    if (typeof t.toMillis === 'function') return t.toMillis();
    const n = new Date(t).getTime();
    return Number.isFinite(n) ? n : 0;
};

/**
 * Lo que hay que atender hoy: pedidos pagados sin despachar, pagos que todavía
 * no se confirmaron, carritos abandonados del último día y reseñas por aprobar.
 */
export const pendientesDeHoy = ({ orders = [], abandonedCarts = [], reviews = [] } = {}, ahora = Date.now()) => ({
    porEnviar: orders.filter(o => ['approved', 'paid'].includes(o.status)).length,
    porConfirmar: orders.filter(o => ['pending_payment', 'pending', 'pending_wa', 'review'].includes(o.status) || o.mpAmountMismatch).length,
    carritos: abandonedCarts.filter(c => !c.recovered && ahora - aMillis(c.lastUpdated) <= DIA).length,
    resenas: reviews.filter(r => !r.approved).length,
});

/**
 * Los productos más guardados en favoritos en los últimos `dias`, con el
 * stock actual al lado: lo que conviene reponer antes de que se venda.
 */
export const favoritosTop = (wishlistEvents = [], inventory = [], { dias = 30, n = 5, ahora = Date.now() } = {}) => {
    const desde = ahora - dias * DIA;
    const porProducto = new Map();
    for (const e of wishlistEvents) {
        if (e.action !== 'add' || aMillis(e.timestamp) < desde) continue;
        const cur = porProducto.get(e.productId) || { productId: e.productId, name: e.productName, count: 0 };
        cur.count += 1;
        porProducto.set(e.productId, cur);
    }
    const porId = new Map(inventory.map(p => [p.id, p]));
    return [...porProducto.values()]
        .sort((a, b) => b.count - a.count)
        .slice(0, n)
        .map(f => {
            const product = porId.get(f.productId);
            return { ...f, name: product?.name || f.name, product, stock: product ? getTotalStock(product) : null };
        });
};

// Clave YYYY-MM-DD en hora local.
const claveDia = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * Visitas por día (hora local) de los últimos `dias`, a partir de los cubos
 * horarios en UTC de `visit_stats_hourly` (id "YYYYMMDDHH").
 */
export const visitasPorDia = (visitStatsHourly = [], dias = 14, ahora = new Date()) => {
    const porDia = new Map();
    for (const v of visitStatsHourly) {
        const id = String(v.id || v.hour || '');
        if (!/^\d{10}$/.test(id)) continue;
        const d = new Date(Date.UTC(+id.slice(0, 4), +id.slice(4, 6) - 1, +id.slice(6, 8), +id.slice(8, 10)));
        const k = claveDia(d);
        porDia.set(k, (porDia.get(k) || 0) + (Number(v.count) || 0));
    }
    const out = [];
    for (let i = dias - 1; i >= 0; i--) {
        const d = new Date(ahora.getTime() - i * DIA);
        const k = claveDia(d);
        out.push({
            fecha: k,
            label: k.slice(8, 10) + '/' + k.slice(5, 7),
            visitas: porDia.get(k) || 0,
        });
    }
    return out;
};

/** Cuántos productos tienen stock, cuántos van por las últimas unidades, cuántos se agotaron y cuántos están ocultos. */
export const resumenStock = (inventory = []) => {
    const r = { conStock: 0, ultimas: 0, agotados: 0, ocultos: 0, total: inventory.length };
    for (const p of inventory) {
        if (p.active === false) r.ocultos += 1;
        const s = getTotalStock(p);
        if (s <= 0) r.agotados += 1;
        else if (s <= 2) r.ultimas += 1;
        else r.conStock += 1;
    }
    return r;
};

const DIAS_LLAVE_INSTAGRAM = 60;
const AVISO_DIAS_ANTES = 10;

/**
 * Avisos sobre llaves que faltan o pueden estar por vencer. Devuelve sólo lo
 * que hay que mirar; si la lista viene vacía, no se muestra nada. Mercado Pago
 * no va acá: ya lo pide "Primeros pasos".
 */
export const avisosDeLlaves = ({ siteConfig, aiConfig } = {}, ahora = Date.now()) => {
    const avisos = [];
    const ig = siteConfig?.instagram?.conectado;
    if (ig?.fecha) {
        const dias = Math.floor((ahora - aMillis(ig.fecha)) / DIA);
        if (dias >= DIAS_LLAVE_INSTAGRAM) {
            avisos.push({ id: 'ig', nivel: 'alto', titulo: 'Instagram puede haber vencido', detalle: `La conexión con @${ig.username} tiene ${dias} días. Probala en Configuración → Notificaciones; si falla, hay que pedir una llave nueva.`, goto: 'settings' });
        } else if (dias >= DIAS_LLAVE_INSTAGRAM - AVISO_DIAS_ANTES) {
            avisos.push({ id: 'ig', nivel: 'medio', titulo: 'Instagram: revisá la conexión', detalle: `Hace ${dias} días que se conectó @${ig.username}. Tocá "Probar conexión" en Configuración → Notificaciones para confirmar que sigue viva.`, goto: 'settings' });
        }
    }
    if (!(aiConfig?.adminKeys || '').trim()) {
        avisos.push({ id: 'ia', nivel: 'medio', titulo: 'Lau sin llave de IA', detalle: 'Sin la llave de Gemini, Lau sólo hace lo básico (ventas, stock, precios, gastos). Se carga en Configuración → IA.', goto: 'settings' });
    }
    return avisos;
};
