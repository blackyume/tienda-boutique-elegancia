import { getTotalStock } from './variants';

// Primero la misma categoría. Si no alcanza se completa con otras, una por
// categoría, arrancando en un punto distinto para que cada ficha muestre otras.
export const prendasRelacionadas = (inventory, product, cantidad = 4) => {
    const visibles = inventory.filter((p) => p.id !== product.id && p.active !== false && getTotalStock(p) > 0);
    const misma = visibles.filter((p) => p.category === product.category);
    const otras = visibles.filter((p) => p.category !== product.category);
    const corte = otras.length ? Math.max(0, inventory.findIndex((p) => p.id === product.id)) % otras.length : 0;
    const rotadas = [...otras.slice(corte), ...otras.slice(0, corte)];
    const unaPorCategoria = rotadas.filter((p, i) => rotadas.findIndex((x) => x.category === p.category) === i);
    return [...new Set([...misma, ...unaPorCategoria, ...rotadas])].slice(0, cantidad);
};
