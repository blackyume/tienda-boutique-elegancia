import React from 'react';

// Ilustraciones de las guías. Son SVG dibujados a mano con clases de Tailwind
// para que se vean bien en claro y en oscuro sin duplicar nada. Todas usan
// viewBox de 720 de ancho y escalan al contenedor.

const ORO = '#E8C65E';
const ORO_OSCURO = '#B38728';

// Clases repetidas. "papel" es una tarjeta, "linea" un borde, "texto" tipografía.
const papel = 'fill-white dark:fill-[#1f1f1f]';
const papelSuave = 'fill-slate-50 dark:fill-white/5';
const linea = 'stroke-slate-300 dark:stroke-slate-600';
const texto = 'fill-slate-800 dark:fill-slate-100';
const textoSuave = 'fill-slate-500 dark:fill-slate-400';
const fuente = { fontFamily: 'ui-sans-serif, system-ui, sans-serif' };
const mono = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' };

const Svg = ({ alto, children, label }) => (
    <svg viewBox={`0 0 720 ${alto}`} role="img" aria-label={label} className="w-full h-auto" style={fuente}>
        {children}
    </svg>
);

/** Flecha horizontal o vertical con punta. */
const Flecha = ({ x1, y1, x2, y2, color = ORO_OSCURO }) => {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const l = 9;
    const px = x2 - l * Math.cos(ang), py = y2 - l * Math.sin(ang);
    const a = ang + Math.PI / 2, b = ang - Math.PI / 2;
    return (
        <g>
            <line x1={x1} y1={y1} x2={px} y2={py} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <polygon points={`${x2},${y2} ${px + 5 * Math.cos(a)},${py + 5 * Math.sin(a)} ${px + 5 * Math.cos(b)},${py + 5 * Math.sin(b)}`} fill={color} />
        </g>
    );
};

/** Icono de archivo de imagen con nombre debajo. */
const ArchivoFoto = ({ x, y, nombre, mal = false }) => (
    <g transform={`translate(${x} ${y})`}>
        <rect width="54" height="66" rx="6" className={papel} stroke={mal ? '#ef4444' : undefined} strokeWidth={mal ? 2 : 1.2} />
        {!mal && <rect width="54" height="66" rx="6" fill="none" className={linea} strokeWidth="1.2" />}
        <path d="M0 6a6 6 0 0 1 6-6h48a6 6 0 0 1 6 6v6H0z" fill={ORO} opacity="0.9" />
        <rect x="9" y="20" width="36" height="30" rx="3" className={papelSuave} />
        <circle cx="19" cy="30" r="4" fill={ORO} />
        <path d="M12 47l10-11 7 7 6-5 10 9z" fill={mal ? '#ef4444' : ORO_OSCURO} opacity="0.85" />
        <text x="27" y="82" textAnchor="middle" fontSize="9.5" style={mono} className={mal ? 'fill-red-500' : texto}>{nombre}</text>
    </g>
);

/** Tarjeta de producto como se ve en la tienda. */
const TarjetaProducto = ({ x, y, nombre, precio, gris = false }) => (
    <g transform={`translate(${x} ${y})`}>
        <rect width="150" height="112" rx="10" className={papel} />
        <rect width="150" height="112" rx="10" fill="none" className={linea} strokeWidth="1.2" />
        <rect x="10" y="10" width="130" height="58" rx="6" className={gris ? 'fill-slate-200 dark:fill-slate-700' : papelSuave} />
        {!gris && <path d="M30 60c10-22 24-30 40-30 18 0 32 12 42 30z" fill={ORO} opacity="0.55" />}
        {gris && <text x="75" y="43" textAnchor="middle" fontSize="11" className={textoSuave}>sin foto</text>}
        <text x="12" y="86" fontSize="11.5" fontWeight="700" className={texto}>{nombre}</text>
        <text x="12" y="102" fontSize="11" className={textoSuave}>{precio}</text>
    </g>
);

/** Cómo se emparejan los archivos con las filas del Excel por el nombre. */
export const IlusNombresFotos = () => (
    <Svg alto={350} label="Los archivos se emparejan con los productos por el nombre">
        <text x="30" y="24" fontSize="12" fontWeight="800" className={textoSuave} letterSpacing="2">CARPETA DE FOTOS</text>
        <text x="540" y="24" fontSize="12" fontWeight="800" className={textoSuave} letterSpacing="2">EN LA TIENDA</text>

        <ArchivoFoto x={40} y={40} nombre="jean-oxford-1.jpg" />
        <ArchivoFoto x={150} y={40} nombre="jean-oxford-2.jpg" />
        <ArchivoFoto x={40} y={150} nombre="top-morley.png" />
        <ArchivoFoto x={40} y={250} nombre="IMG_2041.jpg" mal />

        {/* dos archivos → un producto */}
        <Flecha x1={216} y1={72} x2={392} y2={90} />
        <Flecha x1={106} y1={72} x2={146} y2={72} color="#94a3b8" />
        <text x="230" y="62" fontSize="10.5" className={textoSuave}>-1 y -2: mismo producto, galería</text>
        <TarjetaProducto x={400} y={40} nombre="Jean Oxford" precio="$46.500 · 2 fotos" />

        <Flecha x1={110} y1={182} x2={392} y2={200} />
        <TarjetaProducto x={400} y={150} nombre="Top Morley" precio="$21.900 · 1 foto" />

        <line x1="110" y1="282" x2="380" y2="282" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 5" strokeLinecap="round" />
        <text x="390" y="278" fontSize="11.5" fontWeight="700" className="fill-red-500">No va a ningún producto</text>
        <text x="390" y="294" fontSize="10.5" className={textoSuave}>La vista previa te lo avisa. Renombrala y volvé a soltarla.</text>
    </Svg>
);

/** El Excel de la plantilla, con sus columnas. */
export const IlusExcel = () => {
    const cols = [
        ['Producto', 150], ['Categoría', 80], ['Precio venta', 82], ['Costo', 62], ['Stock', 48], ['Talles', 82], ['Colores', 96], ['Estado', 70],
    ];
    const filas = [
        ['Jean Elastizado Oxford', 'Jeans', '46500', '24000', '5', '36, 38, 40, 42', 'azul', 'Publicado'],
        ['Top Cola de Ratón Morley', 'Tops', '21900', '9800', '8', 'S, M, L', 'negro, crudo', 'Publicado'],
        ['Campera Ecocuero', 'Abrigos', '', '38000', '2', 'M, L', 'chocolate', 'Borrador'],
    ];
    let x = 30;
    const xs = cols.map(([, w]) => { const v = x; x += w; return v; });
    return (
        <Svg alto={190} label="La planilla con una fila por producto">
            <rect x="30" y="20" width="670" height="140" rx="8" className={papel} />
            <rect x="30" y="20" width="670" height="140" rx="8" fill="none" className={linea} strokeWidth="1.2" />
            <rect x="30" y="20" width="670" height="30" rx="8" fill="#1f7a45" opacity="0.92" />
            {cols.map(([n], i) => (
                <text key={n} x={xs[i] + 8} y="40" fontSize="11" fontWeight="800" fill="white">{n}</text>
            ))}
            {filas.map((f, r) => (
                <g key={r}>
                    <line x1="30" y1={50 + r * 36} x2="700" y2={50 + r * 36} className={linea} strokeWidth="1" />
                    {f.map((c, i) => (
                        <text key={i} x={xs[i] + 8} y={72 + r * 36} fontSize="11" style={i === 2 || i === 3 || i === 4 ? mono : undefined}
                            className={i === 0 ? texto : textoSuave} fontWeight={i === 0 ? 700 : 400}>{c}</text>
                    ))}
                </g>
            ))}
            {/* la fila sin precio, marcada */}
            <rect x="32" y="124" width="666" height="34" rx="4" fill="#ef4444" opacity="0.08" />
            <text x={xs[2] + 8} y="145" fontSize="10.5" fontWeight="800" className="fill-red-500">falta</text>
            <text x="30" y="180" fontSize="10.5" className={textoSuave}>Sólo Producto y Precio venta son obligatorios. La fila roja no tiene precio: no entra. La columna Foto casi siempre va vacía.</text>
        </Svg>
    );
};

/** La pantalla de importar: soltar todo junto, vista previa, confirmar. */
export const IlusImportar = () => (
    <Svg alto={300} label="Se sueltan el Excel y las fotos, se revisa la vista previa y se confirma">
        {/* zona de soltar */}
        <rect x="30" y="20" width="300" height="180" rx="14" className={papelSuave} />
        <rect x="30" y="20" width="300" height="180" rx="14" fill="none" stroke={ORO} strokeWidth="2" strokeDasharray="8 6" />
        <g transform="translate(95 52)">
            <rect width="46" height="58" rx="5" fill="#1f7a45" />
            <text x="23" y="38" textAnchor="middle" fontSize="14" fontWeight="900" fill="white">X</text>
        </g>
        <g transform="translate(160 60)"><rect width="42" height="50" rx="5" className={papel} /><rect width="42" height="50" rx="5" fill="none" className={linea} /><path d="M6 42l10-12 7 7 6-5 8 10z" fill={ORO_OSCURO} /></g>
        <g transform="translate(190 50)"><rect width="42" height="50" rx="5" className={papel} /><rect width="42" height="50" rx="5" fill="none" className={linea} /><path d="M6 42l10-12 7 7 6-5 8 10z" fill={ORO_OSCURO} /></g>
        <g transform="translate(220 62)"><rect width="42" height="50" rx="5" className={papel} /><rect width="42" height="50" rx="5" fill="none" className={linea} /><path d="M6 42l10-12 7 7 6-5 8 10z" fill={ORO_OSCURO} /></g>
        <text x="180" y="150" textAnchor="middle" fontSize="12.5" fontWeight="700" className={texto}>Soltá el Excel y todas las fotos juntos</text>
        <text x="180" y="168" textAnchor="middle" fontSize="10.5" className={textoSuave}>o de a tandas: primero el Excel, después las fotos</text>

        <Flecha x1={340} y1={110} x2={380} y2={110} />

        {/* vista previa */}
        <rect x="390" y="20" width="300" height="180" rx="14" className={papel} />
        <rect x="390" y="20" width="300" height="180" rx="14" fill="none" className={linea} strokeWidth="1.2" />
        <text x="410" y="46" fontSize="11" fontWeight="800" className={textoSuave} letterSpacing="2">VISTA PREVIA · SIN GUARDAR</text>
        {[
            ['12', 'Nuevos', '#10b981'], ['3', 'Actualizados', '#3b82f6'], ['12', 'Con foto', ORO_OSCURO], ['1', 'Foto suelta', '#ef4444'],
        ].map(([n, l, c], i) => (
            <g key={l} transform={`translate(${410 + i * 68} 60)`}>
                <rect width="60" height="54" rx="8" className={papelSuave} />
                <text x="30" y="26" textAnchor="middle" fontSize="20" fontWeight="900" fill={c}>{n}</text>
                <text x="30" y="44" textAnchor="middle" fontSize="9.5" className={textoSuave}>{l}</text>
            </g>
        ))}
        <rect x="410" y="128" width="260" height="14" rx="4" className={papelSuave} />
        <rect x="410" y="148" width="200" height="14" rx="4" className={papelSuave} />
        <rect x="410" y="168" width="230" height="14" rx="4" className={papelSuave} />

        <Flecha x1={540} y1={210} x2={540} y2={236} />

        {/* botón */}
        <rect x="430" y="240" width="220" height="40" rx="10" fill={ORO} />
        <text x="540" y="265" textAnchor="middle" fontSize="13" fontWeight="900" fill="#111">Confirmar importación</text>
        <text x="30" y="262" fontSize="11" className={textoSuave}>Si algo está mal, corregís el Excel o el nombre de la foto y</text>
        <text x="30" y="278" fontSize="11" className={textoSuave}>volvés a soltar: la vista previa se actualiza sola.</text>
    </Svg>
);

/** Un pedido de punta a punta, del pago al email. */
export const IlusFlujoPedido = () => {
    const nodos = [
        ['La clienta compra', 'y paga el envío', 'Tienda', false],
        ['Ves el pedido', 'con la dirección', 'Admin → Pedidos', false],
        ['Creás el envío', 'pagás e imprimís', 'MiCorreo', false],
        ['Embalás y pegás', 'la etiqueta', 'En casa', false],
        ['Pasan a buscar', 'el paquete', 'Correo Argentino', true],
        ['Marcás enviado', 'con el seguimiento', 'Admin → Pedidos', false],
    ];
    const pos = (i) => ({ x: 30 + (i % 3) * 230, y: i < 3 ? 30 : 160 });
    return (
        <Svg alto={310} label="Los seis pasos de un pedido">
            {nodos.map(([a, b, donde, correo], i) => {
                const { x, y } = pos(i);
                return (
                    <g key={i} transform={`translate(${x} ${y})`}>
                        <rect width="200" height="96" rx="12" className={correo ? 'fill-[#E8C65E]/15' : papel} />
                        <rect width="200" height="96" rx="12" fill="none" stroke={correo ? ORO : undefined} className={correo ? '' : linea} strokeWidth="1.4" />
                        <circle cx="24" cy="26" r="13" fill={ORO} />
                        <text x="24" y="31" textAnchor="middle" fontSize="13" fontWeight="900" fill="#111">{i + 1}</text>
                        <text x="46" y="24" fontSize="12.5" fontWeight="800" className={texto}>{a}</text>
                        <text x="46" y="40" fontSize="12" className={texto}>{b}</text>
                        <text x="16" y="78" fontSize="10.5" fontWeight="700" className={textoSuave} letterSpacing="1">{donde.toUpperCase()}</text>
                        {correo && <text x="46" y="57" fontSize="10.5" fontWeight="800" fill={ORO_OSCURO}>vos no hacés nada</text>}
                    </g>
                );
            })}
            <Flecha x1={230} y1={78} x2={258} y2={78} />
            <Flecha x1={460} y1={78} x2={488} y2={78} />
            <path d="M590 126 v14 h-460 v18" fill="none" stroke={ORO_OSCURO} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <Flecha x1={130} y1={150} x2={130} y2={160} />
            <Flecha x1={230} y1={208} x2={258} y2={208} />
            <Flecha x1={460} y1={208} x2={488} y2={208} />
            <Flecha x1={590} y1={256} x2={590} y2={274} color="#10b981" />
            <rect x="470" y="276" width="240" height="26" rx="8" fill="#10b981" opacity="0.15" />
            <text x="590" y="294" textAnchor="middle" fontSize="11.5" fontWeight="800" fill="#059669">A la clienta le llega el email solo ✓</text>
        </Svg>
    );
};

/** Cuánto sale el retiro por paquete según cuántos juntás. */
export const IlusRetiroCosto = () => {
    const datos = [[1, 11200], [3, 3733], [5, 2240], [10, 672], [15, 0]];
    const max = 11200, altoBarra = 150, base = 200, ancho = 70, sep = 130;
    return (
        <Svg alto={250} label="Costo del retiro por paquete según cuántos se despachan en la misma visita">
            <text x="30" y="24" fontSize="12" fontWeight="800" className={textoSuave} letterSpacing="2">LO QUE TE SALE EL RETIRO, POR PAQUETE</text>
            <line x1="30" y1={base} x2="700" y2={base} className={linea} strokeWidth="1.2" />
            {datos.map(([n, c], i) => {
                const h = Math.max(4, (c / max) * altoBarra);
                const x = 60 + i * sep;
                const gratis = c === 0;
                return (
                    <g key={n}>
                        <rect x={x} y={base - h} width={ancho} height={h} rx="6" fill={gratis ? '#10b981' : n >= 10 ? ORO : n >= 5 ? ORO_OSCURO : '#ef4444'} opacity={n === 1 ? 0.85 : 1} />
                        <text x={x + ancho / 2} y={base - h - 8} textAnchor="middle" fontSize="12.5" fontWeight="900" className={texto}>
                            {gratis ? 'GRATIS' : `$${c.toLocaleString('es-AR')}`}
                        </text>
                        <text x={x + ancho / 2} y={base + 20} textAnchor="middle" fontSize="11.5" fontWeight="700" className={texto}>{n} {n === 1 ? 'paquete' : 'paquetes'}</text>
                        <text x={x + ancho / 2} y={base + 36} textAnchor="middle" fontSize="10" className={textoSuave}>
                            {n === 1 ? '$11.200 la visita' : n === 3 ? 'la visita ÷ 3' : n === 5 ? 'la visita ÷ 5' : n === 10 ? '40% de descuento' : 'no cobran la visita'}
                        </text>
                    </g>
                );
            })}
        </Svg>
    );
};

/** El paquete con la etiqueta impresa. */
export const IlusEtiqueta = () => (
    <Svg alto={230} label="El paquete lleva la etiqueta impresa de MiCorreo">
        {/* caja */}
        <path d="M120 70 l120 -40 l120 40 v110 l-120 40 l-120 -40z" className="fill-[#c9a46a] dark:fill-[#8b6f3f]" />
        <path d="M120 70 l120 40 v110 l-120 -40z" fill="#a9844a" opacity="0.7" />
        <path d="M240 110 l120 -40 v110 l-120 40z" fill="#e2c48a" opacity="0.55" />
        <path d="M120 70 l120 -40 l120 40 l-120 40z" fill="#f0d9a6" opacity="0.7" />
        {/* etiqueta */}
        <g transform="translate(262 92) skewY(-18)">
            <rect width="88" height="70" rx="3" fill="white" stroke="#334155" strokeWidth="1" />
            <text x="6" y="12" fontSize="6.5" fontWeight="900" fill="#0f172a">CORREO ARGENTINO</text>
            <rect x="6" y="17" width="76" height="4" fill="#0f172a" opacity="0.15" />
            <rect x="6" y="24" width="52" height="4" fill="#0f172a" opacity="0.15" />
            <rect x="6" y="31" width="64" height="4" fill="#0f172a" opacity="0.15" />
            {[0, 3, 5, 9, 11, 14, 17, 21, 23, 27, 30, 33, 36, 40, 43, 46, 50, 53, 55, 59, 62, 66, 69, 72].map((o, i) => (
                <rect key={i} x={6 + o} y="40" width={i % 3 === 0 ? 2 : 1} height="20" fill="#0f172a" />
            ))}
            <text x="44" y="67" textAnchor="middle" fontSize="5.5" style={mono} fill="#0f172a">CP 2300 · RAFAELA</text>
        </g>
        <Flecha x1={440} y1={70} x2={360} y2={100} />
        <text x="450" y="60" fontSize="13" fontWeight="800" className={texto}>Etiqueta impresa</text>
        <text x="450" y="78" fontSize="11.5" className={textoSuave}>La da MiCorreo al pagar. Hoja A4 común.</text>
        <text x="450" y="94" fontSize="11.5" className={textoSuave}>Pegada prolija, bien visible.</text>
        <text x="450" y="130" fontSize="13" fontWeight="800" className="fill-red-500">Sin etiqueta impresa no lo aceptan.</text>
        <text x="450" y="148" fontSize="11.5" className={textoSuave}>Escribir los datos a mano no sirve.</text>
        <text x="450" y="180" fontSize="11.5" className={textoSuave}>La caja o la bolsa la ponés vos: una prenda</text>
        <text x="450" y="196" fontSize="11.5" className={textoSuave}>en bolsa entra en ~30 × 25 × 5 cm y pesa ½ a 1 kg.</text>
    </Svg>
);

/** Las claves de Zipnova viajan al servidor (Vercel), nunca al código. */
export const IlusClaves = () => (
    <Svg alto={200} label="Las dos claves de Zipnova se cargan en Vercel">
        <g transform="translate(30 30)">
            <rect width="200" height="130" rx="12" className={papel} />
            <rect width="200" height="130" rx="12" fill="none" className={linea} strokeWidth="1.2" />
            <text x="16" y="26" fontSize="11" fontWeight="800" className={textoSuave} letterSpacing="2">ZIPNOVA</text>
            <text x="16" y="44" fontSize="10.5" className={textoSuave}>Configuración → Integraciones</text>
            <rect x="16" y="58" width="168" height="24" rx="6" className={papelSuave} />
            <text x="24" y="74" fontSize="10.5" fontWeight="700" className={texto}>API Key</text>
            <text x="90" y="74" fontSize="10" style={mono} className={textoSuave}>zk_live_9f3a…</text>
            <rect x="16" y="90" width="168" height="24" rx="6" className={papelSuave} />
            <text x="24" y="106" fontSize="10.5" fontWeight="700" className={texto}>Secret</text>
            <text x="90" y="106" fontSize="10" style={mono} className={textoSuave}>••••••••••••</text>
        </g>
        <Flecha x1={240} y1={95} x2={288} y2={95} />
        <text x="264" y="82" textAnchor="middle" fontSize="10" fontWeight="700" className={textoSuave}>copiar</text>
        <g transform="translate(295 30)">
            <rect width="230" height="130" rx="12" fill="#0f172a" />
            <text x="16" y="26" fontSize="11" fontWeight="800" fill="#94a3b8" letterSpacing="2">VERCEL</text>
            <text x="16" y="44" fontSize="10.5" fill="#94a3b8">Settings → Environment Variables</text>
            <rect x="16" y="58" width="198" height="24" rx="6" fill="white" opacity="0.08" />
            <text x="24" y="74" fontSize="10.5" style={mono} fill="#fde68a">ZIPNOVA_API_KEY</text>
            <rect x="16" y="90" width="198" height="24" rx="6" fill="white" opacity="0.08" />
            <text x="24" y="106" fontSize="10.5" style={mono} fill="#fde68a">ZIPNOVA_SECRET</text>
        </g>
        <Flecha x1={535} y1={95} x2={580} y2={95} />
        <g transform="translate(585 62)">
            <rect width="110" height="66" rx="12" fill={ORO} />
            <text x="55" y="30" textAnchor="middle" fontSize="12" fontWeight="900" fill="#111">Redeploy</text>
            <text x="55" y="48" textAnchor="middle" fontSize="9.5" fill="#111" opacity="0.8">sin esto no se aplica</text>
        </g>
        <text x="30" y="188" fontSize="11" className="fill-red-500" fontWeight="700">Nunca por WhatsApp ni en un mensaje a la vista: son la contraseña de la cuenta.</text>
    </Svg>
);

/** Conversación de ejemplo con Lau para cargar un producto. */
export const IlusLau = () => (
    <Svg alto={330} label="Cómo se le carga un producto a Lau">
        <rect x="140" y="10" width="440" height="310" rx="18" className={papelSuave} />
        {/* mensaje del usuario con foto */}
        <g transform="translate(300 28)">
            <rect width="264" height="96" rx="14" fill={ORO} />
            <rect x="12" y="12" width="52" height="52" rx="8" fill="white" opacity="0.8" />
            <path d="M18 56l14-16 9 9 8-7 13 14z" fill={ORO_OSCURO} />
            <text x="74" y="30" fontSize="11.5" fontWeight="700" fill="#111">📎 jean-oxford.jpg</text>
            <text x="74" y="50" fontSize="11" fill="#111">jean oxford azul, talles 36 38</text>
            <text x="74" y="66" fontSize="11" fill="#111">40 42, tengo 5, sale 46500,</text>
            <text x="74" y="82" fontSize="11" fill="#111">publicalo</text>
        </g>
        {/* Lau pregunta */}
        <g transform="translate(156 138)">
            <rect width="290" height="74" rx="14" className={papel} />
            <rect width="290" height="74" rx="14" fill="none" className={linea} />
            <text x="14" y="18" fontSize="9" fontWeight="900" fill={ORO_OSCURO} letterSpacing="2">LAU</text>
            <text x="14" y="38" fontSize="11.5" className={texto}>Me falta la categoría. ¿Cuál va?</text>
            {['Jeans', 'Pantalones', 'Otra…'].map((o, i) => (
                <g key={o} transform={`translate(${14 + i * 88} 48)`}>
                    <rect width="80" height="20" rx="10" fill="none" stroke={ORO} strokeWidth="1.2" />
                    <text x="40" y="14" textAnchor="middle" fontSize="10" fontWeight="700" fill={ORO_OSCURO}>{o}</text>
                </g>
            ))}
        </g>
        {/* resumen y confirmar */}
        <g transform="translate(156 224)">
            <rect width="300" height="84" rx="14" className={papel} />
            <rect width="300" height="84" rx="14" fill="none" className={linea} />
            <text x="14" y="18" fontSize="9" fontWeight="900" fill={ORO_OSCURO} letterSpacing="2">LAU</text>
            <text x="14" y="36" fontSize="11" className={texto}>Publicar “Jean Oxford” — $46.500 · Jeans</text>
            <text x="14" y="51" fontSize="11" className={texto}>· azul · 36/38/40/42 · stock 5</text>
            <rect x="14" y="58" width="110" height="20" rx="10" fill="#10b981" />
            <text x="69" y="72" textAnchor="middle" fontSize="10" fontWeight="800" fill="white">✓ Confirmar</text>
            <rect x="132" y="58" width="80" height="20" rx="10" fill="none" className={linea} />
            <text x="172" y="72" textAnchor="middle" fontSize="10" fontWeight="700" className={textoSuave}>Cambiar</text>
        </g>
        <text x="600" y="150" fontSize="10.5" className={textoSuave}>Lo que falta,</text>
        <text x="600" y="164" fontSize="10.5" className={textoSuave}>lo pregunta</text>
        <text x="600" y="178" fontSize="10.5" className={textoSuave}>con botones.</text>
        <text x="600" y="250" fontSize="10.5" className={textoSuave}>Nada se guarda</text>
        <text x="600" y="264" fontSize="10.5" className={textoSuave}>hasta que tocás</text>
        <text x="600" y="278" fontSize="10.5" fontWeight="800" fill="#059669">Confirmar.</text>
    </Svg>
);

/** El menú del panel con una entrada resaltada, para decir "acá". */
export const IlusMenu = ({ resaltar = 'Inventario', nota }) => {
    const items = ['Dashboard', 'Inventario', 'Pedidos', 'Clientes', 'Ventas', 'Asistente Lau', 'CMS / Diseño', 'Guías', 'Configuración'];
    return (
        <Svg alto={40 + items.length * 30} label={`Dónde está ${resaltar} en el menú del panel`}>
            <rect x="30" y="10" width="220" height={20 + items.length * 30} rx="14" className={papel} />
            <rect x="30" y="10" width="220" height={20 + items.length * 30} rx="14" fill="none" className={linea} strokeWidth="1.2" />
            {items.map((it, i) => {
                const y = 22 + i * 30;
                const on = it === resaltar;
                return (
                    <g key={it}>
                        {on && <rect x="40" y={y - 2} width="200" height="26" rx="8" fill={ORO} />}
                        <rect x="50" y={y + 5} width="12" height="12" rx="3" fill={on ? '#111' : undefined} className={on ? '' : 'fill-slate-300 dark:fill-slate-600'} opacity={on ? 0.75 : 1} />
                        <text x="72" y={y + 15} fontSize="12" fontWeight={on ? 900 : 500} fill={on ? '#111' : undefined} className={on ? '' : textoSuave}>{it}</text>
                    </g>
                );
            })}
            {nota && (
                <g>
                    <Flecha x1={300} y1={35 + items.indexOf(resaltar) * 30} x2={252} y2={35 + items.indexOf(resaltar) * 30} />
                    <text x="310" y={39 + items.indexOf(resaltar) * 30} fontSize="12" fontWeight="700" className={texto}>{nota}</text>
                </g>
            )}
        </Svg>
    );
};

/** La planilla de ventas por fuera: una columna por clienta. */
export const IlusPlanillaVentas = () => {
    const col = (x, nombre, bloques, total, estado) => (
        <g transform={`translate(${x} 0)`}>
            <rect x="0" y="20" width="300" height="300" rx="10" className={papel} />
            <rect x="0" y="20" width="300" height="300" rx="10" fill="none" className={linea} strokeWidth="1.2" />
            <rect x="0" y="20" width="300" height="34" rx="10" fill={ORO} />
            <text x="16" y="43" fontSize="13" fontWeight="900" fill="#111">{nombre}</text>
            {bloques.map((b, i) => (
                <g key={i} transform={`translate(16 ${70 + i * 92})`}>
                    <text x="0" y="12" fontSize="11" fontWeight="800" className={texto}>{b[0]}</text>
                    <text x="0" y="30" fontSize="11" className={textoSuave}>TALLE {b[1]}</text>
                    <text x="0" y="48" fontSize="11" className={textoSuave}>{b[2]}</text>
                    <text x="0" y="66" fontSize="11" style={mono} className={texto}>PRECIO $ {b[3]}</text>
                </g>
            ))}
            <line x1="16" y1={70 + bloques.length * 92 - 8} x2="284" y2={70 + bloques.length * 92 - 8} className={linea} strokeDasharray="4 4" />
            <text x="16" y={70 + bloques.length * 92 + 12} fontSize="11.5" fontWeight="900" className={texto}>TOTAL $ {total}</text>
            <text x="16" y={70 + bloques.length * 92 + 32} fontSize="11.5" fontWeight="900" fill={estado === 'PAGADO' ? '#059669' : '#d97706'}>{estado}</text>
        </g>
    );
    return (
        <Svg alto={330} label="La planilla de ventas: una columna por clienta">
            {col(30, 'LORENA', [['SHORT SASTRERO', '5', 'CHOCOLATE', '13,501'], ['BODY MUSCULOSA MODAL', 'XL', 'BEIGE', '10,501']], '24,002', 'PAGADO')}
            {col(390, 'ANA', [['REMERA MANGA JAPONESA', 'M', 'NEGRO', '12,400'], ['SHORT WKND', '2', 'BEIGE', '13,501']], '25,901', 'DEBE')}
            <text x="345" y="200" textAnchor="middle" fontSize="10" className={textoSuave}>una</text>
            <text x="345" y="213" textAnchor="middle" fontSize="10" className={textoSuave}>columna</text>
            <text x="345" y="226" textAnchor="middle" fontSize="10" className={textoSuave}>por clienta</text>
        </Svg>
    );
};
