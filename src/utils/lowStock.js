// Detecta productos/variantes con stock por debajo del umbral.
// Soporta ambos modelos: legacy (product.stock) y variantes (array u objeto).
import { getTotalStock, hasVariantMap } from './variants';

export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

// Devuelve un array ordenado por criticidad (menor stock primero).
//   [{ product, total, critical: boolean, variants: [{ size, color, stock }], isAggregate }]
//   - isAggregate=true cuando el producto NO tiene variantes (se mide stock total)
//   - variants: sólo contiene las variantes con stock <= threshold
export const getLowStockItems = (inventory, threshold = DEFAULT_LOW_STOCK_THRESHOLD) => {
    if (!Array.isArray(inventory)) return [];
    const t = Number(threshold) || DEFAULT_LOW_STOCK_THRESHOLD;

    const alerts = [];

    for (const p of inventory) {
        if (!p || p.active === false) continue;

        if (!hasVariantMap(p)) {
            const total = getTotalStock(p);
            if (total <= t) {
                alerts.push({
                    product: p,
                    total,
                    critical: total === 0,
                    variants: [],
                    isAggregate: true,
                });
            }
            continue;
        }

        // Con variantes: juntar las que están bajas
        const lowVariants = [];
        if (Array.isArray(p.variants)) {
            for (const v of p.variants) {
                const stock = typeof v.stock === 'number' ? v.stock : 0;
                if (stock <= t) {
                    lowVariants.push({ size: v.size, color: v.color, stock });
                }
            }
        } else if (p.variants && typeof p.variants === 'object') {
            for (const [key, stock] of Object.entries(p.variants)) {
                const n = typeof stock === 'number' ? stock : 0;
                if (n <= t) {
                    const [size, color] = key.split('::');
                    lowVariants.push({ size, color, stock: n });
                }
            }
        }

        if (lowVariants.length > 0) {
            const total = getTotalStock(p);
            alerts.push({
                product: p,
                total,
                critical: lowVariants.some(v => v.stock === 0) && total === 0,
                variants: lowVariants.sort((a, b) => a.stock - b.stock),
                isAggregate: false,
            });
        }
    }

    return alerts.sort((a, b) => {
        if (a.critical !== b.critical) return a.critical ? -1 : 1;
        return a.total - b.total;
    });
};
