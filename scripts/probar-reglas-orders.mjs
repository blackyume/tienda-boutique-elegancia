/**
 * Prueba las reglas de /orders contra PRODUCCION, entrando igual que una
 * visitante: login anonimo, que es lo que usa el checkout.
 *
 * Lo que tiene que pasar:
 *   - una orden fraudulenta (ya aprobada, total 0, campos del servidor) -> RECHAZADA
 *   - una orden legitima como la que arma el checkout                   -> ACEPTADA
 *
 * La orden legitima se crea de verdad, asi que despues hay que borrarla con
 * las credenciales de admin (firebase-tools firestore:delete).
 *
 * NO SE PUEDE CORRER TODAVIA: el login anonimo esta deshabilitado en la consola
 * de Firebase y devuelve auth/admin-restricted-operation. Hay que habilitarlo en
 * Firebase Console -> Authentication -> Sign-in method -> Anonymous (que ademas
 * es lo que hace falta para que funcione la compra como invitado).
 *
 *   node scripts/probar-reglas-orders.mjs
 */
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyC8pSsJ7pedjQ12s77_rwWSDWyYDMJwgAk',
    authDomain: 'la-boutique-de-la-elegancia.firebaseapp.com',
    projectId: 'la-boutique-de-la-elegancia',
    storageBucket: 'la-boutique-de-la-elegancia.firebasestorage.app',
    messagingSenderId: '1037411928146',
    appId: '1:1037411928146:web:5fced4145039b5e5a8f78b',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const { user } = await signInAnonymously(auth);
console.log('entré como visitante anónima, uid =', user.uid.slice(0, 12) + '…\n');

const base = {
    date: new Date().toISOString(),
    customer: { nombre: 'PRUEBA DE REGLAS', email: 'prueba@test.local' },
    items: [{ id: 'x', name: 'Prueba', price: 100, quantity: 1 }],
    userId: user.uid,
};

const casos = [
    ['venta inventada, ya aprobada y en $0', { ...base, status: 'approved', total: 0 }, 'RECHAZAR'],
    ['aprobada con total alto', { ...base, status: 'approved', total: 999999 }, 'RECHAZAR'],
    ['pendiente pero marcando stockApplied', { ...base, status: 'pending_wa', total: 5000, stockApplied: true }, 'RECHAZAR'],
    ['pendiente inventando el pago de MP', { ...base, status: 'pending_wa', total: 5000, mpPaymentId: '123', mpStatus: 'approved' }, 'RECHAZAR'],
    ['total negativo', { ...base, status: 'pending_wa', total: -5000 }, 'RECHAZAR'],
    ['total como texto', { ...base, status: 'pending_wa', total: '5000' }, 'RECHAZAR'],
    ['carrito vacío', { ...base, status: 'pending_wa', total: 5000, items: [] }, 'RECHAZAR'],
    ['a nombre de otra persona', { ...base, status: 'pending_wa', total: 5000, userId: 'otro-uid' }, 'RECHAZAR'],
    ['COMPRA REAL por WhatsApp', { ...base, status: 'pending_wa', total: 46500 }, 'ACEPTAR'],
    ['COMPRA REAL por Mercado Pago', { ...base, status: 'pending_payment', total: 46500 }, 'ACEPTAR'],
];

let creadas = [];
let fallos = 0;

for (const [nombre, orden, esperado] of casos) {
    const id = `PRUEBA-REGLAS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let resultado;
    try {
        await setDoc(doc(db, 'orders', id), orden);
        resultado = 'ACEPTAR';
        creadas.push(id);
    } catch (e) {
        resultado = e.code === 'permission-denied' ? 'RECHAZAR' : `ERROR(${e.code})`;
    }
    const ok = resultado === esperado;
    if (!ok) fallos++;
    console.log(`${ok ? '  OK  ' : ' FALLA'} | esperado ${esperado.padEnd(8)} | dio ${resultado.padEnd(8)} | ${nombre}`);
}

console.log(`\n${fallos === 0 ? 'TODO CORRECTO' : fallos + ' CASO(S) MAL'}`);
if (creadas.length) console.log('ordenes de prueba creadas (hay que borrarlas):\n  ' + creadas.join('\n  '));
process.exit(fallos === 0 ? 0 : 1);
