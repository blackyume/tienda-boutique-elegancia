import React, { useState } from 'react';

// Piezas del formulario de compra. Viven fuera de Checkout.jsx para que no se
// re-creen en cada tecla (un componente definido adentro del render pierde el
// foco del input al escribir).

/**
 * Campo con etiqueta, ayuda y error. `as="select"` para provincias.
 * El error se muestra debajo, en rojo, y el borde acompaña.
 */
export const CampoCheckout = ({
    label, name, value, onChange, error, hint, opcional = false,
    as = 'input', type = 'text', inputMode, autoComplete, placeholder, children,
}) => {
    const base = 'w-full bg-transparent border-b py-3 text-lg outline-none transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-600';
    const borde = error ? 'border-red-400 focus:border-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-cielo-gold';
    const idError = error ? `${name}-error` : undefined;
    const comunes = {
        id: name, name, value: value ?? '', onChange, autoComplete,
        'aria-invalid': !!error, 'aria-describedby': idError, className: `${base} ${borde}`,
    };
    return (
        <div className="space-y-1.5">
            <label htmlFor={name} className="text-xs font-bold uppercase text-slate-400 ml-1 flex items-baseline gap-2">
                {label}
                {opcional && <span className="text-[10px] font-semibold normal-case tracking-normal text-slate-400/80">(opcional)</span>}
            </label>
            {as === 'select' ? (
                <select {...comunes} className={`${comunes.className} dark:bg-[#11100D] cursor-pointer`}>{children}</select>
            ) : (
                <input {...comunes} type={type} inputMode={inputMode} placeholder={placeholder} />
            )}
            {error
                ? <p id={idError} className="text-xs font-semibold text-red-500 ml-1">{error}</p>
                : hint && <p className="text-[11px] text-slate-400 ml-1 leading-snug">{hint}</p>}
        </div>
    );
};

const LogoGoogle = () => (
    <svg viewBox="0 0 48 48" className="w-6 h-6 shrink-0" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.7 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.9 6.1C12.4 13.7 17.7 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.5-4.1 7-10.2 7-17.6z" />
        <path fill="#FBBC05" d="M10.5 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.1.8-4.6l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.9-6.1z" />
        <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.2-13.5-10l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
);

/** El botón grande de "Continuar con Google". `onClick` devuelve una promesa. */
export const BotonGoogle = ({ onClick }) => {
    const [cargando, setCargando] = useState(false);
    const entrar = async () => {
        if (cargando) return;
        setCargando(true);
        try { await onClick?.(); } finally { setCargando(false); }
    };
    return (
        <button
            type="button"
            onClick={entrar}
            disabled={cargando}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-white text-slate-800 font-bold text-base border border-slate-200 shadow-md hover:shadow-lg hover:border-slate-300 active:scale-[0.99] transition-all disabled:opacity-70"
        >
            <LogoGoogle />
            {cargando ? 'Abriendo Google…' : 'Continuar con Google'}
        </button>
    );
};
