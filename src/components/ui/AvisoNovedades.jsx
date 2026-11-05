import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { avisoDeNovedades } from '../../utils/novedades';
import { optimizeImage } from '../../utils/helpers';
import { Rombo } from './Ornamento';

const CLAVE_VISTA = 'lbe_novedades_vista';
const CLAVE_CERRADO = 'lbe_novedades_cerrado';
const SIN_AVISO = ['/admin', '/checkout', '/success', '/payment-status', '/baja', '/insta', '/product/'];
const ESPERA_MS = 4000;

const leer = (clave) => {
    try { return localStorage.getItem(clave); } catch { return null; }
};
const guardar = (clave, valor) => {
    try { localStorage.setItem(clave, String(valor)); } catch { /* sin almacenamiento */ }
};

// Va abajo a la izquierda: a la derecha está el chat. No sale en la ficha, donde
// taparía la foto, y en el inicio del celular espera a que bajen, para no caer
// encima del botón de la portada.
export const AvisoNovedades = () => {
    const { inventory, inventoryListo, siteConfig, isAdmin } = useStore();
    const { pathname } = useLocation();
    const [aviso, setAviso] = useState(null);
    const [vuelta, setVuelta] = useState(0);
    const [listo, setListo] = useState(false);

    useEffect(() => {
        if (!inventoryListo) return;
        const vista = Number(leer(CLAVE_VISTA)) || 0;
        const siguiente = avisoDeNovedades({ inventory, novedad: siteConfig?.novedad, vista, cerrado: leer(CLAVE_CERRADO) });
        if (!vista && !siguiente) guardar(CLAVE_VISTA, Date.now());
        setAviso(siguiente);
    }, [inventoryListo, inventory, siteConfig?.novedad, vuelta]);

    const hayAviso = Boolean(aviso);

    useEffect(() => {
        if (!hayAviso || listo) return undefined;
        const esperarBajada = pathname === '/' && window.innerWidth < 640;
        if (esperarBajada) {
            const alBajar = () => { if (window.scrollY > 240) setListo(true); };
            window.addEventListener('scroll', alBajar, { passive: true });
            return () => window.removeEventListener('scroll', alBajar);
        }
        const t = setTimeout(() => setListo(true), ESPERA_MS);
        return () => clearTimeout(t);
    }, [hayAviso, listo, pathname]);

    if (!aviso || !listo || SIN_AVISO.some((r) => pathname.startsWith(r))) return null;

    const cerrar = () => {
        if (aviso.tipo === 'tienda') guardar(CLAVE_CERRADO, aviso.clave);
        else guardar(CLAVE_VISTA, Date.now());
        setVuelta((v) => v + 1);
    };

    return (
        <aside
            aria-label="Novedades de la tienda"
            className={`fixed z-[45] left-4 right-20 sm:left-6 sm:right-auto sm:w-[21rem] animate-slideUp ${isAdmin ? 'bottom-24' : 'bottom-4 sm:bottom-6'}`}
        >
            <div className="relative flex items-center gap-4 p-3.5 pr-9 rounded-2xl bg-noche-900/95 backdrop-blur-xl border border-cielo-gold/30 shadow-[0_16px_48px_rgba(0,0,0,0.55)]">
                <div className="relative w-14 h-[5.25rem] shrink-0">
                    {aviso.foto ? (
                        <img src={optimizeImage(aviso.foto, 200)} alt="" className="w-full h-full object-cover rounded-t-full" />
                    ) : (
                        <span className="w-full h-full flex items-center justify-center rounded-t-full bg-noche-850">
                            <Rombo className="bg-cielo-gold w-2.5 h-2.5" />
                        </span>
                    )}
                    <span aria-hidden="true" className="arco-oro" />
                </div>

                <div className="min-w-0">
                    <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-cielo-gold/80">
                        <Rombo /> {aviso.etiqueta}
                    </p>
                    <p className="mt-1 font-serif text-lg leading-tight text-noche-100">{aviso.titulo}</p>
                    {aviso.texto && <p className="mt-1 text-xs leading-snug text-noche-300">{aviso.texto}</p>}
                    {aviso.boton && (
                        <Link
                            to={aviso.enlace}
                            onClick={cerrar}
                            className="btn-oro inline-flex items-center mt-2.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]"
                        >
                            {aviso.boton}
                        </Link>
                    )}
                </div>

                <button
                    type="button"
                    onClick={cerrar}
                    aria-label="Cerrar aviso"
                    className="absolute top-1.5 right-1.5 p-1.5 text-noche-300 hover:text-cielo-gold transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </aside>
    );
};
