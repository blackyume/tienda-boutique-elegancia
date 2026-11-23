// Memoria de Lau entre días. Vive en ai_history/lau_memoria (sólo admin la lee
// y la escribe, por firestore.rules). Lista corta de datos que el dueño pidió
// recordar; las reglas de qué se guarda están en lauCerebro.agregarRecuerdo.
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const REF = () => doc(db, 'ai_history', 'lau_memoria');

export const leerMemoria = async () => {
    try {
        const s = await getDoc(REF());
        const lista = s.exists() ? s.data()?.recuerdos : [];
        return Array.isArray(lista) ? lista.filter(r => r && typeof r.texto === 'string') : [];
    } catch {
        return [];
    }
};

export const guardarMemoria = async (lista) => {
    await setDoc(REF(), { recuerdos: lista, actualizado: Date.now() });
};
