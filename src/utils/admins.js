// Única fuente de verdad del lado JS para la whitelist de admins.
// Debe coincidir con isAdmin() en firestore.rules (las rules no pueden
// importar JS, así que si cambia un email hay que tocar ambos lugares).
export const ADMIN_WHITELIST = [
    'laboutiquedelaeleganciaoficial@gmail.com',
    'juampi218@gmail.com'
];

export const isAdminEmail = (email) =>
    !!email && ADMIN_WHITELIST.includes(email);
