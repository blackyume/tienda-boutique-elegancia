// Las visitas de la casa (el dueño, Lau, quien revisa la tienda) no cuentan
// como visitantes en el panel (pedido del dueño, 1/11/2026). Un dispositivo
// queda marcado para siempre apenas entra un admin o se usa el pase de QA, así
// tampoco cuenta cuando después navega la tienda sin la sesión iniciada.
const CLAVE = 'lbde-dispositivo-casa';

export const esDispositivoDeLaCasa = () => {
    try {
        return localStorage.getItem(CLAVE) === '1' || !!localStorage.getItem('qa_bypass');
    } catch {
        return false;
    }
};

export const marcarDispositivoDeLaCasa = () => {
    try { localStorage.setItem(CLAVE, '1'); } catch { /* sin storage: no se puede recordar */ }
};
