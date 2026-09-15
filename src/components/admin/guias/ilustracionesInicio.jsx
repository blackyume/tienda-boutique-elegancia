import React from 'react';
import { Svg, ORO, ORO_OSCURO, VERDE, ROJO, papel, papelSuave, linea, texto, textoSuave } from './ilustraciones';

// Tercera tanda: el Inicio del panel, Lau sin la llave, las ofertas y el
// editor de la tienda. Mismas reglas: 720 de ancho, clases de Tailwind para
// que se vean en claro y en oscuro.

const Tarjeta = ({ x, y, w, h, children, borde }) => (
    <g transform={`translate(${x} ${y})`}>
        <rect width={w} height={h} rx="10" className={papel} />
        <rect width={w} height={h} rx="10" fill="none" stroke={borde} className={borde ? '' : linea} strokeWidth="1.2" />
        {children}
    </g>
);

const Globo = ({ x, y, w, h, quien = 'lau', children }) => (
    <g transform={`translate(${x} ${y})`}>
        <rect width={w} height={h} rx="12" fill={quien === 'vos' ? ORO : undefined} className={quien === 'vos' ? '' : papel} />
        {quien !== 'vos' && <rect width={w} height={h} rx="12" fill="none" className={linea} />}
        {quien !== 'vos' && <text x="12" y="16" fontSize="8" fontWeight="900" fill={ORO_OSCURO} letterSpacing="2">LAU</text>}
        {children}
    </g>
);

const Chip = ({ x, y, w, children, lleno = false }) => (
    <g transform={`translate(${x} ${y})`}>
        <rect width={w} height="20" rx="10" fill={lleno ? ORO : 'none'} stroke={ORO} strokeWidth="1.2" />
        <text x={w / 2} y="14" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={lleno ? '#111' : ORO_OSCURO}>{children}</text>
    </g>
);

/** El Inicio del panel: aviso, Hoy, favoritos, visitas y stock, numerados. */
export const IlusInicio = () => (
    <Svg alto={400} label="El Inicio del panel, con cada bloque numerado">
        {/* aviso */}
        <Tarjeta x={20} y={10} w={680} h={38} borde="#f59e0b">
            <rect x="0" y="0" width="680" height="38" rx="10" fill="#f59e0b" opacity="0.08" />
            <text x="16" y="16" fontSize="11" fontWeight="800" className={texto}>⚠ Instagram: revisá la conexión</text>
            <text x="16" y="30" fontSize="9.5" className={textoSuave}>Hace 52 días que se conectó. Tocá "Probar conexión" en Configuración → Notificaciones.</text>
        </Tarjeta>
        <circle cx="20" cy="10" r="11" fill={ROJO} /><text x="20" y="14" textAnchor="middle" fontSize="11" fontWeight="900" fill="white">1</text>

        {/* Hoy */}
        <Tarjeta x={20} y={62} w={440} h={120}>
            <text x="14" y="20" fontSize="12" fontWeight="800" className={texto}>Hoy</text>
            {[['2', 'Por enviar', true], ['1', 'Pagos por confirmar', true], ['0', 'Carritos de hoy', false], ['0', 'Reseñas por aprobar', false]].map(([n, l, on], i) => (
                <g key={l} transform={`translate(${14 + i * 105} 32)`}>
                    <rect width="96" height="74" rx="8" fill={on ? ORO : 'none'} opacity={on ? 0.12 : 1} className={on ? '' : papelSuave} />
                    <rect width="96" height="74" rx="8" fill="none" stroke={on ? ORO : undefined} className={on ? '' : linea} strokeWidth="1" />
                    <text x="10" y="34" fontSize="24" fontWeight="900" className={on ? texto : textoSuave}>{n}</text>
                    <text x="10" y="52" fontSize="8.5" fontWeight="800" className={texto}>{l}</text>
                    <text x="10" y="64" fontSize="7.5" className={textoSuave}>tocá para ir</text>
                </g>
            ))}
        </Tarjeta>
        <circle cx="20" cy="62" r="11" fill={ROJO} /><text x="20" y="66" textAnchor="middle" fontSize="11" fontWeight="900" fill="white">2</text>

        {/* Favoritos */}
        <Tarjeta x={20} y={196} w={440} h={100}>
            <text x="14" y="20" fontSize="12" fontWeight="800" className={texto}>♡ Lo más guardado en favoritos</text>
            <text x="426" y="20" textAnchor="end" fontSize="9" className={textoSuave}>últimos 30 días</text>
            {[['Jeans elastizado Oxford', '7 veces', '2 u.', '#f59e0b'], ['Campera ecocuero negra', '4 veces', '3 u.', undefined]].map(([n, v, s, c], i) => (
                <g key={n} transform={`translate(14 ${32 + i * 30})`}>
                    <rect width="412" height="24" rx="6" className={papelSuave} />
                    <circle cx="14" cy="12" r="8" fill={i === 0 ? ORO : '#94a3b8'} /><text x="14" y="15.5" textAnchor="middle" fontSize="9" fontWeight="900" fill={i === 0 ? '#111' : 'white'}>{i + 1}</text>
                    <text x="30" y="16" fontSize="10.5" fontWeight="700" className={texto}>{n}</text>
                    <text x="260" y="16" fontSize="9" className={textoSuave}>{v}</text>
                    <text x="400" y="16" textAnchor="end" fontSize="11" fontWeight="900" fill={c} className={c ? '' : texto}>{s}</text>
                </g>
            ))}
        </Tarjeta>
        <circle cx="20" cy="196" r="11" fill={ROJO} /><text x="20" y="200" textAnchor="middle" fontSize="11" fontWeight="900" fill="white">3</text>

        {/* Visitas */}
        <Tarjeta x={20} y={310} w={440} h={80}>
            <text x="14" y="20" fontSize="12" fontWeight="800" className={texto}>Visitas por día</text>
            <text x="426" y="20" textAnchor="end" fontSize="9" className={textoSuave}>pico el 12/09 (61)</text>
            {[12, 18, 9, 22, 30, 61, 25, 19, 14, 28, 33, 21, 17, 24].map((v, i) => (
                <rect key={i} x={14 + i * 30} y={70 - v * 0.6} width="20" height={v * 0.6} rx="3" fill={ORO} opacity={v === 61 ? 1 : 0.45} />
            ))}
        </Tarjeta>
        <circle cx="20" cy="310" r="11" fill={ROJO} /><text x="20" y="314" textAnchor="middle" fontSize="11" fontWeight="900" fill="white">4</text>

        {/* Stock */}
        <Tarjeta x={476} y={62} w={224} h={110}>
            <text x="14" y="20" fontSize="12" fontWeight="800" className={texto}>Stock</text>
            {[['12', 'Con stock', VERDE], ['2', 'Últimas u.', '#f59e0b'], ['0', 'Agotados', ROJO]].map(([n, l, c], i) => (
                <g key={l} transform={`translate(${14 + i * 66} 32)`}>
                    <rect width="60" height="56" rx="8" fill={c} opacity="0.12" />
                    <text x="30" y="30" textAnchor="middle" fontSize="20" fontWeight="900" fill={c}>{n}</text>
                    <text x="30" y="46" textAnchor="middle" fontSize="7.5" fontWeight="800" fill={c}>{l.toUpperCase()}</text>
                </g>
            ))}
            <text x="14" y="102" fontSize="8.5" className={textoSuave}>1 producto oculto que las clientas no ven →</text>
        </Tarjeta>
        <circle cx="476" cy="62" r="11" fill={ROJO} /><text x="476" y="66" textAnchor="middle" fontSize="11" fontWeight="900" fill="white">5</text>

        {/* Stock bajo */}
        <Tarjeta x={476} y={186} w={224} h={204} borde="#f59e0b">
            <text x="14" y="20" fontSize="12" fontWeight="800" className={texto}>⚠ Stock bajo</text>
            <text x="14" y="34" fontSize="8.5" className={textoSuave}>3 productos · umbral 5 u.</text>
            {[['Jeans elastizado chupin', '46 · Azul: 1', '2'], ['Body musculosa cuello', 'L · Natural: 0', '2'], ['Short algodón Santi', '2 · Verde agua: 0', '3']].map(([n, v, s], i) => (
                <g key={n} transform={`translate(14 ${46 + i * 48})`}>
                    <rect width="196" height="40" rx="6" className={papelSuave} />
                    <rect x="6" y="6" width="28" height="28" rx="5" fill={ORO} opacity="0.5" />
                    <text x="42" y="17" fontSize="9.5" fontWeight="800" className={texto}>{n}</text>
                    <text x="42" y="31" fontSize="8.5" className={textoSuave}>{v}</text>
                    <text x="186" y="24" textAnchor="end" fontSize="12" fontWeight="900" fill="#f59e0b">{s}<tspan fontSize="7"> u.</tspan></text>
                </g>
            ))}
        </Tarjeta>
        <circle cx="476" cy="186" r="11" fill={ROJO} /><text x="476" y="190" textAnchor="middle" fontSize="11" fontWeight="900" fill="white">6</text>
    </Svg>
);

/** Lau sin la llave: una venta por fuera con botones, confirmación y Deshacer. */
export const IlusLauSinIA = () => (
    <Svg alto={340} label="Una venta anotada por chat, con los botones de talle y el Deshacer">
        <rect x="120" y="8" width="480" height="324" rx="18" className={papelSuave} />
        <Globo x={330} y={20} w={256} h={30} quien="vos">
            <text x="12" y="19" fontSize="11" fill="#111">vendí el jean oxford por whatsapp</text>
        </Globo>
        <Globo x={134} y={62} w={330} h={78}>
            <text x="12" y="34" fontSize="11" className={texto}>¿Qué talle y color? Queda: talle 38 · Azul (2),</text>
            <text x="12" y="48" fontSize="11" className={texto}>talle 40 · Azul (1).</text>
            <Chip x={12} y={54} w={100}>talle 38 · Azul</Chip>
            <Chip x={120} y={54} w={100}>talle 40 · Azul</Chip>
        </Globo>
        <Globo x={396} y={152} w={190} h={30} quien="vos">
            <text x="12" y="19" fontSize="11" fill="#111">…talle 38 color Azul</text>
        </Globo>
        <g transform="translate(134 194)">
            <rect width="452" height="66" rx="12" fill={ORO} opacity="0.1" />
            <rect width="452" height="66" rx="12" fill="none" stroke={ORO} strokeWidth="1.2" />
            <text x="14" y="20" fontSize="10.5" fontWeight="800" fill={ORO_OSCURO}>⚠ Confirmá esta acción</text>
            <text x="14" y="38" fontSize="10" className={texto}>Registrar venta externa: 1× JEANS ELASTIZADO OXFORD (38/Azul) por $46.500 — descuenta stock</text>
            <rect x="14" y="46" width="80" height="16" rx="8" fill={ORO} /><text x="54" y="57.5" textAnchor="middle" fontSize="9" fontWeight="800" fill="#111">✓ Confirmar</text>
            <rect x="102" y="46" width="60" height="16" rx="8" fill="none" className={linea} /><text x="132" y="57.5" textAnchor="middle" fontSize="9" fontWeight="700" className={textoSuave}>Cancelar</text>
        </g>
        <Globo x={134} y={272} w={400} h={52}>
            <text x="12" y="32" fontSize="10.5" className={texto}>✅ Venta registrada. Stock descontado → queda 1. Quedó como pedido MAN-482913.</text>
            <Chip x={12} y={36} w={70}>Deshacer</Chip>
        </Globo>
        <text x="612" y="90" fontSize="10" className={textoSuave}>Sin llave de IA:</text>
        <text x="612" y="104" fontSize="10" className={textoSuave}>lo entiende igual.</text>
        <text x="612" y="230" fontSize="10" className={textoSuave}>Nada cambia</text>
        <text x="612" y="244" fontSize="10" className={textoSuave}>hasta que</text>
        <text x="612" y="258" fontSize="10" fontWeight="800" fill={ORO_OSCURO}>confirmás.</text>
        <text x="612" y="300" fontSize="10" className={textoSuave}>Te equivocaste:</text>
        <text x="612" y="314" fontSize="10" fontWeight="800" fill={ORO_OSCURO}>Deshacer.</text>
    </Svg>
);

/** Cómo se ve una oferta en la tienda: precio tachado, etiqueta, y el cupón en el checkout. */
export const IlusOferta = () => (
    <Svg alto={250} label="Una prenda en oferta y un cupón aplicado en el checkout">
        {/* ficha de producto */}
        <g transform="translate(40 20)">
            <rect width="200" height="210" rx="12" className={papel} />
            <rect width="200" height="210" rx="12" fill="none" className={linea} />
            <rect x="12" y="12" width="176" height="120" rx="8" fill={ORO} opacity="0.35" />
            <rect x="20" y="20" width="58" height="18" rx="9" fill={ROJO} /><text x="49" y="33" textAnchor="middle" fontSize="9" fontWeight="900" fill="white">−20 %</text>
            <text x="12" y="152" fontSize="11" fontWeight="700" className={texto}>Campera ecocuero negra</text>
            <text x="12" y="172" fontSize="10" className={textoSuave} textDecoration="line-through">$82.700</text>
            <text x="64" y="174" fontSize="14" fontWeight="900" fill={ORO_OSCURO}>$66.160</text>
            <text x="12" y="194" fontSize="8.5" className={textoSuave}>La clienta ve el precio anterior tachado.</text>
        </g>
        <text x="140" y="245" textAnchor="middle" fontSize="10" fontWeight="800" className={texto}>OFERTA: baja el precio de la prenda</text>

        {/* checkout con cupón */}
        <g transform="translate(300 20)">
            <rect width="380" height="210" rx="12" className={papel} />
            <rect width="380" height="210" rx="12" fill="none" className={linea} />
            <text x="16" y="24" fontSize="11" fontWeight="800" className={texto}>Tu bolsa</text>
            {[['Jeans elastizado Oxford · 38', '$46.500'], ['Top cola ratón Morley · M', '$14.800']].map(([n, p], i) => (
                <g key={n} transform={`translate(16 ${40 + i * 22})`}>
                    <text x="0" y="12" fontSize="10" className={texto}>{n}</text>
                    <text x="348" y="12" textAnchor="end" fontSize="10" className={texto}>{p}</text>
                </g>
            ))}
            <rect x="16" y="92" width="230" height="24" rx="6" className={papelSuave} /><rect x="16" y="92" width="230" height="24" rx="6" fill="none" className={linea} />
            <text x="26" y="108" fontSize="10" fontWeight="700" className={texto}>PRIMAVERA10</text>
            <rect x="254" y="92" width="110" height="24" rx="6" fill={ORO} /><text x="309" y="108" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#111">Aplicar cupón</text>
            <text x="16" y="140" fontSize="10" fill={VERDE} fontWeight="700">✓ Cupón PRIMAVERA10: −10 %</text>
            <text x="364" y="140" textAnchor="end" fontSize="10" fill={VERDE} fontWeight="700">−$6.130</text>
            <line x1="16" y1="152" x2="364" y2="152" className={linea} />
            <text x="16" y="174" fontSize="12" fontWeight="900" className={texto}>Total</text>
            <text x="364" y="174" textAnchor="end" fontSize="13" fontWeight="900" fill={ORO_OSCURO}>$55.170</text>
            <text x="16" y="196" fontSize="8.5" className={textoSuave}>El cupón lo escribe la clienta; sirve para una campaña, una amiga, un sorteo.</text>
        </g>
        <text x="490" y="245" textAnchor="middle" fontSize="10" fontWeight="800" className={texto}>CUPÓN: un código que descuenta al pagar</text>
    </Svg>
);

/** Diseño de la tienda: qué parte de la home se edita en cada pestaña. */
export const IlusDiseno = () => (
    <Svg alto={330} label="Las partes de la home que se cambian desde Diseño de la tienda">
        {/* home dibujada */}
        <g transform="translate(40 14)">
            <rect width="400" height="300" rx="12" className="fill-[#1a1814]" />
            <rect width="400" height="22" rx="0" fill={ORO} opacity="0.85" />
            <text x="200" y="15" textAnchor="middle" fontSize="8" fontWeight="800" fill="#111" letterSpacing="1.5">COMPRA SEGURA | ENVÍOS A TODO EL PAÍS | NUEVA COLECCIÓN</text>
            <text x="200" y="44" textAnchor="middle" fontSize="9" fontWeight="800" fill={ORO} letterSpacing="2">LA BOUTIQUE</text>
            <rect x="0" y="52" width="400" height="120" fill={ORO} opacity="0.12" />
            <text x="24" y="86" fontSize="20" fontWeight="900" fill="white">LA BOUTIQUE</text>
            <text x="24" y="104" fontSize="12" fontStyle="italic" fill="#F1EEE4">de la Elegancia</text>
            <text x="24" y="122" fontSize="8" fill="#D1CBBD">La elegancia no se improvisa: se elige.</text>
            <rect x="24" y="134" width="70" height="16" rx="2" fill={ORO} /><text x="59" y="145" textAnchor="middle" fontSize="7" fontWeight="800" fill="#111">VER LA TIENDA</text>
            <rect x="250" y="60" width="130" height="104" rx="6" fill="white" opacity="0.15" />
            <text x="315" y="116" textAnchor="middle" fontSize="8" fill="#D1CBBD">foto de portada</text>
            <text x="24" y="196" fontSize="9" fontWeight="800" fill="#F1EEE4">Por tipo de prenda</text>
            {['Jeans', 'Camperas', 'Tops', 'Shorts'].map((c, i) => (
                <g key={c} transform={`translate(${24 + i * 92} 204)`}>
                    <rect width="84" height="60" rx="6" fill="white" opacity="0.08" />
                    <text x="42" y="36" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#F1EEE4">{c}</text>
                </g>
            ))}
            <rect x="0" y="278" width="400" height="22" fill={ORO} opacity="0.5" />
            <text x="200" y="292" textAnchor="middle" fontSize="8" fontWeight="800" fill="#111">🎁 POPUP: 10 % OFF EN TU PRIMERA COMPRA</text>
        </g>
        {/* llamadas */}
        {[
            [14, 25, 'Anuncios & Popups', 'la barra de arriba'],
            [14, 100, 'Portada & Textos', 'título, frase, botón y las fotos de portada'],
            [14, 230, 'Categorías', 'las fichas con foto'],
            [14, 290, 'Anuncios & Popups', 'el cartel que salta al entrar'],
        ].map(([, y, tab, que], i) => (
            <g key={i} transform={`translate(470 ${y - 14})`}>
                <circle cx="0" cy="12" r="10" fill={ROJO} /><text x="0" y="16" textAnchor="middle" fontSize="10" fontWeight="900" fill="white">{i + 1}</text>
                <text x="18" y="10" fontSize="10.5" fontWeight="800" className={texto}>{tab}</text>
                <text x="18" y="24" fontSize="9" className={textoSuave}>{que}</text>
            </g>
        ))}
        <line x1="440" y1="25" x2="458" y2="23" stroke={ROJO} strokeWidth="1.2" strokeDasharray="3 2" />
        <line x1="440" y1="110" x2="458" y2="98" stroke={ROJO} strokeWidth="1.2" strokeDasharray="3 2" />
        <line x1="440" y1="240" x2="458" y2="228" stroke={ROJO} strokeWidth="1.2" strokeDasharray="3 2" />
        <line x1="440" y1="302" x2="458" y2="288" stroke={ROJO} strokeWidth="1.2" strokeDasharray="3 2" />
    </Svg>
);
