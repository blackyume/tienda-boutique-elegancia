import React from 'react';
import { Svg, ORO, ORO_OSCURO, VERDE, ROJO, papel, papelSuave, linea, texto, textoSuave, mono } from './ilustraciones';

// Cuarta tanda: la plata. De dónde sale el precio, qué pasa con la comisión
// de Mercado Pago cuando la venta es por fuera, y hasta dónde se puede
// bajar en efectivo. Mismas reglas: 720 de ancho, clases de Tailwind para
// que se vea en claro y en oscuro. Los números son el ejemplo de la guía:
// costo $20.000 + flete $500 + embalaje $300, margen 100%, MP 7,6%.

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

const Confirmar = ({ x, y, w, children }) => (
    <g transform={`translate(${x} ${y})`}>
        <rect width={w} height="66" rx="12" fill={ORO} opacity="0.1" />
        <rect width={w} height="66" rx="12" fill="none" stroke={ORO} strokeWidth="1.2" />
        <text x="14" y="20" fontSize="10.5" fontWeight="800" fill={ORO_OSCURO}>⚠ Confirmá esta acción</text>
        <text x="14" y="38" fontSize="10" className={texto}>{children}</text>
        <rect x="14" y="46" width="80" height="16" rx="8" fill={ORO} /><text x="54" y="57.5" textAnchor="middle" fontSize="9" fontWeight="800" fill="#111">✓ Confirmar</text>
        <rect x="102" y="46" width="60" height="16" rx="8" fill="none" className={linea} /><text x="132" y="57.5" textAnchor="middle" fontSize="9" fontWeight="700" className={textoSuave}>Cancelar</text>
    </g>
);

/** La misma prenda vendida por la web y en efectivo: a $41.700 en mano ganás lo mismo que a $45.100 por MP. */
export const IlusWebVsEfectivo = () => {
    const Columna = ({ x, titulo, emoji, precio, filas, neto, color }) => (
        <g transform={`translate(${x} 16)`}>
            <rect width="310" height="250" rx="14" className={papel} />
            <rect width="310" height="250" rx="14" fill="none" stroke={color} strokeWidth="1.5" />
            <text x="155" y="26" textAnchor="middle" fontSize="13" fontWeight="900" className={texto}>{emoji} {titulo}</text>
            <text x="155" y="58" textAnchor="middle" fontSize="22" fontWeight="900" style={mono} fill={color}>{precio}</text>
            <text x="155" y="72" textAnchor="middle" fontSize="9.5" className={textoSuave}>lo que paga la clienta</text>
            {filas.map(([l, v, sub], i) => (
                <g key={l} transform={`translate(24 ${92 + i * 34})`}>
                    <text x="0" y="12" fontSize="11" className={texto}>{l}</text>
                    <text x="262" y="12" textAnchor="end" fontSize="11.5" fontWeight="800" style={mono} className={sub ? textoSuave : texto}>{v}</text>
                    <line x1="0" y1="22" x2="262" y2="22" className={linea} strokeDasharray="2 3" />
                </g>
            ))}
            <rect x="24" y="196" width="262" height="40" rx="10" fill={VERDE} opacity="0.12" />
            <text x="36" y="221" fontSize="11" fontWeight="800" className={texto}>Te quedan limpios</text>
            <text x="274" y="222" textAnchor="end" fontSize="16" fontWeight="900" style={mono} fill={VERDE}>{neto}</text>
        </g>
    );
    return (
        <Svg alto={300} label="Comparación: la venta por la web paga comisión de Mercado Pago; la venta en efectivo no, así que se puede cobrar menos y ganar lo mismo">
            <Columna x={20} titulo="Por la web (MP)" emoji="🌐" precio="$45.100" color="#3b82f6"
                filas={[['Comisión de Mercado Pago 7,6%', '− $3.428'], ['Costo de la prenda + flete + embalaje', '− $20.800']]} neto="$20.872" />
            <Columna x={390} titulo="En efectivo o transferencia" emoji="💵" precio="$41.700" color={ORO}
                filas={[['Comisión de Mercado Pago', '$0', true], ['Costo de la prenda + flete + embalaje', '− $20.800']]} neto="$20.900" />
            <g transform="translate(360 128)">
                <circle r="22" fill={ORO} />
                <text y="5" textAnchor="middle" fontSize="18" fontWeight="900" fill="#111">=</text>
            </g>
            <text x="360" y="290" textAnchor="middle" fontSize="10.5" className={textoSuave}>$3.400 menos para ella, la misma ganancia para vos. Ese es tu “descuento gratis” en efectivo.</text>
        </Svg>
    );
};

/** Hasta dónde se puede bajar un precio en efectivo: la barra con las tres zonas. */
export const IlusHastaDondeBajar = () => {
    // De $20.800 (costo) a $45.100 (lista) en 560 px.
    const x0 = 80, x1 = 640, min = 20800, max = 45100;
    const px = (v) => x0 + ((v - min) / (max - min)) * (x1 - x0);
    const efectivo = px(41700), lista = px(45100), costo = px(20800);
    return (
        <Svg alto={230} label="Barra de precios: entre lista y precio efectivo el descuento no cuesta nada; de ahí hasta el costo sale de tu ganancia; abajo del costo es pérdida">
            <text x="30" y="26" fontSize="12" fontWeight="800" className={texto}>¿Hasta dónde puedo bajar en efectivo?</text>
            {/* zona roja (pérdida) a la izquierda del costo */}
            <rect x={30} y={70} width={costo - 30} height="34" rx="6" fill={ROJO} opacity="0.25" />
            {/* zona amarilla: sale de tu ganancia */}
            <rect x={costo} y={70} width={efectivo - costo} height="34" fill={ORO} opacity="0.35" />
            {/* zona verde: descuento gratis */}
            <rect x={efectivo} y={70} width={lista - efectivo} height="34" fill={VERDE} opacity="0.5" />
            <rect x={30} y={70} width={lista - 30 + 40} height="34" rx="6" fill="none" className={linea} />
            {/* marcas */}
            {[[costo, '$20.800', 'costo total', ROJO], [efectivo, '$41.700', 'precio efectivo', ORO_OSCURO], [lista, '$45.100', 'precio de lista', VERDE]].map(([x, v, l, c]) => (
                <g key={l}>
                    <line x1={x} y1={62} x2={x} y2={112} stroke={c} strokeWidth="2" />
                    <text x={x} y="52" textAnchor="middle" fontSize="12" fontWeight="900" style={mono} className={texto}>{v}</text>
                    <text x={x} y="126" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={c}>{l}</text>
                </g>
            ))}
            {/* leyendas */}
            <g transform="translate(30 150)">
                <rect width="12" height="12" rx="3" fill={VERDE} opacity="0.6" /><text x="18" y="10" fontSize="10.5" className={texto}><tspan fontWeight="800">Verde:</tspan> es la comisión que MP no cobra. Bajá hasta acá y ganás exactamente lo mismo.</text>
                <rect y="22" width="12" height="12" rx="3" fill={ORO} opacity="0.5" /><text x="18" y="32" fontSize="10.5" className={texto}><tspan fontWeight="800">Dorado:</tspan> cada peso que bajás sale de tu ganancia. Lau te dice cuánto te queda antes de confirmar.</text>
                <rect y="44" width="12" height="12" rx="3" fill={ROJO} opacity="0.35" /><text x="18" y="54" fontSize="10.5" className={texto}><tspan fontWeight="800">Rojo:</tspan> abajo del costo perdés plata. Lau te avisa con ⚠ (y aun así, si querés, podés).</text>
            </g>
        </Svg>
    );
};

/** Una venta en efectivo por chat: Lau ofrece lista o precio efectivo, dice cuánto te queda y pide confirmar. */
export const IlusVentaEfectivo = () => (
    <Svg alto={360} label="Venta en efectivo anotada por chat: Lau propone el precio de lista o el efectivo, muestra la ganancia y pide confirmar">
        <rect x="100" y="8" width="520" height="344" rx="18" className={papelSuave} />
        <Globo x={356} y={20} w={250} h={30} quien="vos">
            <text x="12" y="19" fontSize="11" fill="#111">vendí el sweater lanilla en efectivo</text>
        </Globo>
        <Globo x={114} y={62} w={420} h={98}>
            <text x="12" y="34" fontSize="10.5" className={texto}>“SWEATER LANILLA” está a $45.100 en la tienda. Como en efectivo</text>
            <text x="12" y="48" fontSize="10.5" className={texto}>no pagás la comisión de MP (7,6%), podés cobrarlo $41.700 y</text>
            <text x="12" y="62" fontSize="10.5" className={texto}>ganás lo mismo que por la web. ¿A cuánto lo vendiste?</text>
            <Chip x={12} y={72} w={120}>…a 45100 (lista)</Chip>
            <Chip x={140} y={72} w={130} lleno>…a 41700 (efectivo)</Chip>
        </Globo>
        <Globo x={386} y={172} w={220} h={30} quien="vos">
            <text x="12" y="19" fontSize="11" fill="#111">…en efectivo a 41700</text>
        </Globo>
        <Globo x={114} y={214} w={420} h={44}>
            <text x="12" y="32" fontSize="10.5" className={texto}>Te quedan <tspan fontWeight="800" fill={VERDE}>$20.900 limpios</tspan> (100% sobre el costo).</text>
        </Globo>
        <Confirmar x={114} y={270} w={492}>Registrar venta externa: 1× SWEATER LANILLA por $41.700 · efectivo — descuenta stock</Confirmar>
        <text x="640" y="90" fontSize="10" className={textoSuave}>Un toque y</text>
        <text x="640" y="104" fontSize="10" className={textoSuave}>listo. O escribís</text>
        <text x="640" y="118" fontSize="10" className={textoSuave}>otro número.</text>
        <text x="640" y="236" fontSize="10" className={textoSuave}>Antes de</text>
        <text x="640" y="250" fontSize="10" className={textoSuave}>confirmar ya</text>
        <text x="640" y="264" fontSize="10" className={textoSuave}>sabés qué ganás.</text>
    </Svg>
);

/** Cargar el costo de una prenda por chat: Lau lo guarda y propone el precio con un botón. */
export const IlusCostoPorChat = () => (
    <Svg alto={330} label="El costo dicho por chat: Lau lo guarda en el producto, calcula el precio de lista y el efectivo, y ofrece un botón para aplicarlo">
        <rect x="100" y="8" width="520" height="314" rx="18" className={papelSuave} />
        <Globo x={236} y={20} w={370} h={30} quien="vos">
            <text x="12" y="19" fontSize="11" fill="#111">el sweater lanilla me costó 20000 más 500 de flete y 300 de embalaje</text>
        </Globo>
        <Confirmar x={114} y={62} w={492}>Editar “SWEATER LANILLA”: costo $20.000, flete $500, embalaje $300</Confirmar>
        <Globo x={114} y={140} w={492} h={130}>
            <text x="12" y="34" fontSize="10.5" className={texto}>✅ “SWEATER LANILLA” actualizado → costo: $20.000, flete: $500, embalaje: $300.</text>
            <text x="12" y="56" fontSize="10.5" className={texto}>Precio sugerido: <tspan fontWeight="900" fill={ORO_OSCURO}>$45.100</tspan>. Costo $20.000 + packaging $300 + flete $500 = $20.800,</text>
            <text x="12" y="70" fontSize="10.5" className={texto}>comisión MP 7,6% = $3.428. Con tu margen del 100% te quedan $20.872 limpios por venta.</text>
            <text x="12" y="88" fontSize="10.5" className={texto}>En efectivo o transferencia lo podés dejar a <tspan fontWeight="800">$41.700</tspan> y ganás lo mismo.</text>
            <text x="12" y="102" fontSize="10.5" className={texto}>Hoy está a $48.700. ¿Le pongo el precio sugerido?</text>
            <Chip x={12} y={108} w={180} lleno>ponele 45100 al SWEATER LANILLA</Chip>
        </Globo>
        <Globo x={114} y={282} w={330} h={30}>
            <text x="12" y="20" fontSize="10.5" className={texto}>✅ Precio de “SWEATER LANILLA”: $45.100. <tspan fill={ORO_OSCURO} fontWeight="700">Deshacer</tspan></text>
        </Globo>
        <text x="640" y="80" fontSize="10" className={textoSuave}>Vos ponés</text>
        <text x="640" y="94" fontSize="10" className={textoSuave}>los costos.</text>
        <text x="640" y="190" fontSize="10" className={textoSuave}>Lau hace</text>
        <text x="640" y="204" fontSize="10" className={textoSuave}>la cuenta.</text>
        <text x="640" y="290" fontSize="10" className={textoSuave}>Un toque y</text>
        <text x="640" y="304" fontSize="10" className={textoSuave}>queda puesto.</text>
    </Svg>
);

/** La ficha de una prenda en la tienda, con lo que se completa al cargarla: tela, cuidados, detalles, medidas. */
export const IlusFichaCompleta = () => {
    const Marca = ({ x, y, n }) => (<g><circle cx={x} cy={y} r="10" fill={ROJO} /><text x={x} y={y + 4} textAnchor="middle" fontSize="10" fontWeight="900" fill="white">{n}</text></g>);
    return (
        <Svg alto={330} label="La ficha de una prenda en la tienda, numerada: descripción, composición, cuidados, guía de talles y detalles">
            <rect x="20" y="10" width="680" height="310" rx="14" className={papel} />
            <rect x="20" y="10" width="680" height="310" rx="14" fill="none" className={linea} />
            {/* foto */}
            <rect x="36" y="26" width="220" height="278" rx="10" className={papelSuave} />
            <text x="146" y="170" textAnchor="middle" fontSize="11" className={textoSuave}>foto</text>
            {/* datos */}
            <text x="276" y="40" fontSize="9" fontWeight="800" letterSpacing="2" fill={ORO_OSCURO}>VESTIDOS</text>
            <text x="276" y="62" fontSize="16" fontWeight="900" className={texto}>Vestido lino blanco</text>
            <text x="276" y="84" fontSize="14" fontWeight="900" style={mono} fill={ORO_OSCURO}>$45.100</text>
            <text x="276" y="106" fontSize="10" className={texto}>Un vestido de lino liviano, de corte recto y largo a la rodilla,</text>
            <text x="276" y="119" fontSize="10" className={texto}>pensado para los días de calor. Fresco, simple y elegante.</text>
            <Marca x={690} y={112} n="1" />
            <text x="276" y="140" fontSize="9.5" className={textoSuave}><tspan fontWeight="800">COMPOSICIÓN:</tspan> Lino 100%</text>
            <Marca x={690} y={137} n="2" />
            {[['🫧 Lavar a mano', 0], ['⛱️ Secar a la sombra', 92], ['🚫 Sin lavandina', 200]].map(([l, dx]) => (
                <g key={l} transform={`translate(${276 + dx} 150)`}>
                    <rect width={l.length * 5.4 + 14} height="18" rx="9" fill="none" className={linea} />
                    <text x="7" y="12.5" fontSize="8.5" className={textoSuave}>{l}</text>
                </g>
            ))}
            <Marca x={690} y={159} n="3" />
            <text x="276" y="192" fontSize="9" fontWeight="800" letterSpacing="1" className={textoSuave}>TALLE</text>
            <text x="600" y="192" textAnchor="end" fontSize="8.5" fontWeight="800" letterSpacing="1" fill={ORO_OSCURO}>MEDIDAS DE ESTA PRENDA</text>
            <Marca x={690} y={189} n="4" />
            {['S', 'M', 'L'].map((s, i) => (
                <g key={s} transform={`translate(${276 + i * 40} 200)`}>
                    <rect width="32" height="24" rx="5" fill="none" stroke={i === 1 ? ORO : undefined} className={i === 1 ? '' : linea} strokeWidth="1.3" />
                    <text x="16" y="16" textAnchor="middle" fontSize="10" fontWeight="800" className={texto}>{s}</text>
                </g>
            ))}
            <rect x="276" y="236" width="324" height="26" rx="6" fill={ORO} />
            <text x="438" y="253" textAnchor="middle" fontSize="10" fontWeight="900" fill="#111" letterSpacing="2">AGREGAR A LA BOLSA</text>
            <text x="276" y="284" fontSize="10" fontWeight="800" className={texto}>Detalles del producto</text>
            <text x="276" y="298" fontSize="9" className={textoSuave}>• Corte recto  • Largo a la rodilla  • Lino 100%  • Lavar a mano</text>
            <Marca x={690} y={290} n="5" />
            <text x="146" y="282" textAnchor="middle" fontSize="8.5" className={textoSuave}>1 descripción · 2 tela · 3 cuidados</text>
            <text x="146" y="295" textAnchor="middle" fontSize="8.5" className={textoSuave}>4 medidas · 5 detalles</text>
        </Svg>
    );
};

/** Ganancia bruta − gastos = neta, como se ve en Ventas. */
export const IlusGastos = () => {
    const Caja = ({ x, titulo, valor, sub, color, ancho = 150 }) => (
        <g transform={`translate(${x} 30)`}>
            <rect width={ancho} height="96" rx="12" className={papel} />
            <rect width={ancho} height="96" rx="12" fill="none" stroke={color || undefined} className={color ? '' : linea} strokeWidth="1.5" />
            <text x="14" y="22" fontSize="8.5" fontWeight="800" letterSpacing="1.5" className={textoSuave}>{titulo}</text>
            <text x="14" y="52" fontSize="18" fontWeight="900" style={mono} fill={color || undefined} className={color ? '' : texto}>{valor}</text>
            <text x="14" y="72" fontSize="8.5" className={textoSuave}>{sub}</text>
            <text x="14" y="84" fontSize="8.5" className={textoSuave}>{sub === 'Ventas − costo de las prendas' ? '− comisión de MP' : ''}</text>
        </g>
    );
    return (
        <Svg alto={190} label="En Ventas y ganancia: ganancia bruta, menos los gastos del período, igual a la ganancia neta">
            <Caja x={20} titulo="GANANCIA BRUTA" valor="$312.000" sub="Ventas − costo de las prendas" />
            <text x="190" y="88" textAnchor="middle" fontSize="22" fontWeight="900" className={textoSuave}>−</text>
            <Caja x={210} titulo="GASTOS" valor="$68.000" sub="Publicidad, bolsas, envíos" color="#d97706" />
            <text x="380" y="88" textAnchor="middle" fontSize="22" fontWeight="900" className={textoSuave}>=</text>
            <Caja x={400} titulo="GANANCIA NETA" valor="$244.000" sub="Lo que te queda de verdad" color={VERDE} ancho={300} />
            <text x="360" y="160" textAnchor="middle" fontSize="10.5" className={textoSuave}>Los gastos se cargan en Gastos o diciéndole a Lau “gasté 20000 en publicidad”. El costo de cada prenda NO va ahí: ya se descuenta venta por venta.</text>
        </Svg>
    );
};
