import React from 'react';
import { Svg, Flecha, ORO, ORO_OSCURO, VERDE, papel, papelSuave, linea, texto, textoSuave, mono } from './ilustraciones';

// Dibujos de cómo se carga un producto con Lau. Los usa la GUÍA del chat y la
// guía "Lau" del panel. Mismo viewBox de 720 que el resto.

const Chip = ({ x, y, w, label, on = false, punto }) => (
    <g transform={`translate(${x} ${y})`}>
        <rect width={w} height="22" rx="11" fill={on ? ORO : 'none'} stroke={on ? ORO : undefined} className={on ? '' : linea} strokeWidth="1.2" opacity={on ? 0.95 : 1} />
        {punto && <circle cx="12" cy="11" r="5" fill={punto} stroke={on ? '#111' : '#888'} strokeWidth="0.8" />}
        <text x={punto ? 22 : w / 2} y="15" textAnchor={punto ? 'start' : 'middle'} fontSize="10" fontWeight="700" fill={on ? '#111' : undefined} className={on ? '' : textoSuave}>{label}</text>
    </g>
);

/** La pantalla del paso a paso, en el paso de talles y colores. */
export const IlusWizard = () => (
    <Svg alto={320} label="La pantalla de Cargar producto: barra de progreso arriba, vista previa de la prenda, los botones de colores y talles, y Continuar">
        <rect x="20" y="10" width="480" height="300" rx="16" className={papel} />
        <rect x="20" y="10" width="480" height="300" rx="16" fill="none" className={linea} />
        {/* cabecera */}
        <circle cx="48" cy="36" r="13" fill={ORO} />
        <text x="48" y="40" textAnchor="middle" fontSize="11" fontWeight="900" fill="#111">✦</text>
        <text x="68" y="33" fontSize="12" fontWeight="800" className={texto}>Cargar producto</text>
        <text x="68" y="46" fontSize="9" className={textoSuave}>Paso a paso · sin vueltas</text>
        <text x="480" y="40" textAnchor="middle" fontSize="12" className={textoSuave}>✕</text>
        {/* progreso */}
        {[...Array(8)].map((_, i) => (
            <rect key={i} x={36 + i * 57} y="60" width="52" height="4" rx="2" fill={i < 4 ? ORO : undefined} className={i < 4 ? '' : 'fill-slate-200 dark:fill-white/10'} />
        ))}
        {/* vista previa */}
        <g transform="translate(36 76)">
            <rect width="448" height="54" rx="10" fill="none" stroke={ORO} strokeWidth="1" opacity="0.5" />
            <rect x="8" y="7" width="32" height="40" rx="5" className={papelSuave} />
            <path d="M12 42c6-14 12-18 16-18s10 4 16 18z" fill={ORO} opacity="0.6" />
            <text x="50" y="24" fontSize="11" fontWeight="800" className={texto}>Vestido lino blanco</text>
            <text x="50" y="40" fontSize="9.5" className={textoSuave}>Vestidos · Blanco, Beige · S, M, L · stock —</text>
            <text x="436" y="33" textAnchor="end" fontSize="9" fontWeight="700" fill={ORO_OSCURO}>así va quedando</text>
        </g>
        {/* paso actual */}
        <text x="36" y="154" fontSize="9" fontWeight="900" letterSpacing="2" fill={ORO_OSCURO}>COLORES</text>
        <Chip x={36} y={162} w={72} label="Blanco" on punto="#fff" />
        <Chip x={114} y={162} w={66} label="Beige" on punto="#d9c3a3" />
        <Chip x={186} y={162} w={66} label="Negro" punto="#222" />
        <Chip x={258} y={162} w={62} label="Rojo" punto="#c0392b" />
        <Chip x={326} y={162} w={64} label="+ otro" />
        <text x="36" y="212" fontSize="9" fontWeight="900" letterSpacing="2" fill={ORO_OSCURO}>TALLES</text>
        {['XS', 'S', 'M', 'L', 'XL', 'Único'].map((t, i) => (
            <Chip key={t} x={36 + i * 52} y={220} w={t === 'Único' ? 54 : 44} label={t} on={['S', 'M', 'L'].includes(t)} />
        ))}
        {/* botones */}
        <text x="40" y="288" fontSize="10.5" className={textoSuave}>‹ Atrás</text>
        <rect x="380" y="270" width="104" height="28" rx="9" fill={ORO} />
        <text x="432" y="288" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#111">Continuar</text>

        {/* notas */}
        <Flecha x1={520} y1={62} x2={505} y2={62} />
        <text x="526" y="58" fontSize="10" className={textoSuave}>La barra: cuántos</text>
        <text x="526" y="71" fontSize="10" className={textoSuave}>pasos van. Tocás</text>
        <text x="526" y="84" fontSize="10" className={textoSuave}>uno hecho y volvés.</text>
        <Flecha x1={520} y1={103} x2={505} y2={103} />
        <text x="526" y="99" fontSize="10" className={textoSuave}>La prenda se arma</text>
        <text x="526" y="112" fontSize="10" className={textoSuave}>a la vista mientras</text>
        <text x="526" y="125" fontSize="10" className={textoSuave}>la cargás.</text>
        <Flecha x1={520} y1={173} x2={505} y2={173} />
        <text x="526" y="169" fontSize="10" className={textoSuave}>Tocás lo que tiene</text>
        <text x="526" y="182" fontSize="10" className={textoSuave}>la prenda. Dorado</text>
        <text x="526" y="195" fontSize="10" className={textoSuave}>= elegido.</text>
        <Flecha x1={520} y1={284} x2={505} y2={284} />
        <text x="526" y="280" fontSize="10" className={textoSuave}>Nada se publica</text>
        <text x="526" y="293" fontSize="10" className={textoSuave}>hasta el último</text>
        <text x="526" y="306" fontSize="10" fontWeight="800" fill={VERDE}>paso: Publicar.</text>
    </Svg>
);

/** El paso de stock: una casilla por talle y color. */
export const IlusStockGrilla = () => (
    <Svg alto={190} label="El paso de stock: una casilla por cada talle y color, y el total abajo">
        <rect x="20" y="10" width="440" height="170" rx="14" className={papel} />
        <rect x="20" y="10" width="440" height="170" rx="14" fill="none" className={linea} />
        <text x="36" y="34" fontSize="9" fontWeight="900" letterSpacing="2" fill={ORO_OSCURO}>STOCK · CUÁNTAS TENÉS DE CADA UNA</text>
        {[['S', 'Blanco', 2], ['M', 'Blanco', 3], ['L', 'Blanco', 1], ['S', 'Beige', 0], ['M', 'Beige', 2], ['L', 'Beige', 1]].map(([t, c, n], i) => (
            <g key={i} transform={`translate(${36 + (i % 3) * 140} ${46 + Math.floor(i / 3) * 52})`}>
                <rect width="128" height="42" rx="9" className={papelSuave} />
                <text x="12" y="18" fontSize="10" fontWeight="800" className={texto}>{t} · {c}</text>
                <rect x="12" y="24" width="40" height="14" rx="4" fill="none" className={linea} />
                <text x="32" y="35" textAnchor="middle" fontSize="10" fontWeight="800" style={mono} className={n ? texto : textoSuave}>{n}</text>
                <text x="70" y="35" fontSize="9" className={textoSuave}>{n === 0 ? 'se ve agotado' : n === 1 ? 'última' : ''}</text>
            </g>
        ))}
        <text x="36" y="168" fontSize="10.5" className={texto}>Total: <tspan fontWeight="900" fill={ORO_OSCURO}>9 prendas</tspan></text>
        <text x="480" y="60" fontSize="10" className={textoSuave}>Así la tienda sabe</text>
        <text x="480" y="73" fontSize="10" className={textoSuave}>qué talle y color</text>
        <text x="480" y="86" fontSize="10" className={textoSuave}>se agotó, y Lau</text>
        <text x="480" y="99" fontSize="10" className={textoSuave}>descuenta el justo</text>
        <text x="480" y="112" fontSize="10" className={textoSuave}>cuando vendés.</text>
        <text x="480" y="140" fontSize="10" className={textoSuave}>Un solo talle y color:</text>
        <text x="480" y="153" fontSize="10" className={textoSuave}>una sola casilla.</text>
    </Svg>
);
