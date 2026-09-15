import React from 'react';
import { Svg, Flecha, ORO, ORO_OSCURO, VERDE, ROJO, papel, papelSuave, linea, texto, textoSuave, mono } from './ilustraciones';

// Segunda tanda de ilustraciones: pantallas del panel y de MiCorreo dibujadas
// como las ve el dueño, con el botón que hay que tocar resaltado. Mismas
// reglas que en ilustraciones.jsx: 720 de ancho, clases de Tailwind para que
// se vean en claro y en oscuro.

// --- Piezas -----------------------------------------------------------------

/** Marco de una pantalla (barra arriba con tres puntitos y un título). */
const Pantalla = ({ x, y, w, h, titulo, children, oscura = false }) => (
    <g transform={`translate(${x} ${y})`}>
        <rect width={w} height={h} rx="12" className={oscura ? 'fill-[#141414]' : papel} />
        <rect width={w} height={h} rx="12" fill="none" className={oscura ? 'stroke-slate-700' : linea} strokeWidth="1.2" />
        <path d={`M0 12a12 12 0 0 1 12-12h${w - 24}a12 12 0 0 1 12 12v16H0z`} className={oscura ? 'fill-[#1f1f1f]' : papelSuave} />
        {[0, 1, 2].map((i) => <circle key={i} cx={14 + i * 12} cy="14" r="3.5" className="fill-slate-300 dark:fill-slate-600" />)}
        <text x={w / 2} y="18" textAnchor="middle" fontSize={titulo && titulo.length > 28 ? 8.5 : 10} fontWeight="800" letterSpacing={titulo && titulo.length > 28 ? 0.5 : 1.5} className={textoSuave}>{titulo}</text>
        <g transform="translate(0 28)">{children}</g>
    </g>
);

/** Un botón dibujado. `tipo`: 'oro' | 'verde' | 'borde' | 'rojo'. */
const Boton = ({ x, y, w = 140, h = 30, children, tipo = 'oro', resaltar = false, fontSize = 11 }) => {
    const fill = { oro: ORO, verde: VERDE, rojo: ROJO, borde: 'none' }[tipo] || ORO;
    const color = tipo === 'oro' ? '#111' : tipo === 'borde' ? undefined : 'white';
    return (
        <g transform={`translate(${x} ${y})`}>
            {resaltar && <rect x="-5" y="-5" width={w + 10} height={h + 10} rx="12" fill="none" stroke={ROJO} strokeWidth="2.5" strokeDasharray="6 4" />}
            <rect width={w} height={h} rx="8" fill={fill} className={tipo === 'borde' ? linea : ''} strokeWidth={tipo === 'borde' ? 1.3 : 0} />
            <text x={w / 2} y={h / 2 + fontSize * 0.36} textAnchor="middle" fontSize={fontSize} fontWeight="800" fill={color} className={tipo === 'borde' ? texto : ''}>{children}</text>
        </g>
    );
};

/** Renglón de formulario: etiqueta chica arriba y un valor. */
const Campo = ({ x, y, w = 200, etiqueta, valor, vacio = false }) => (
    <g transform={`translate(${x} ${y})`}>
        <text x="0" y="0" fontSize="8.5" fontWeight="800" letterSpacing="1" className={textoSuave}>{etiqueta}</text>
        <rect x="0" y="5" width={w} height="22" rx="6" className={papelSuave} />
        <rect x="0" y="5" width={w} height="22" rx="6" fill="none" className={linea} strokeWidth="1" />
        <text x="8" y="20" fontSize="10" className={vacio ? textoSuave : texto} style={vacio ? undefined : mono}>{valor}</text>
    </g>
);

/** Etiqueta "VOS" / "SOLO" / "EL CORREO", para decir quién hace cada paso. */
const Quien = ({ x, y, quien }) => {
    const estilo = { vos: [ORO, '#111', 'VOS'], solo: [VERDE, 'white', 'SE HACE SOLO'], correo: ['#2563eb', 'white', 'EL CORREO'], clienta: ['#a855f7', 'white', 'LA CLIENTA'] }[quien];
    const w = estilo[2].length * 6.2 + 16;
    return (
        <g transform={`translate(${x - w / 2} ${y})`}>
            <rect width={w} height="16" rx="8" fill={estilo[0]} />
            <text x={w / 2} y="11.5" textAnchor="middle" fontSize="8" fontWeight="900" letterSpacing="1" fill={estilo[1]}>{estilo[2]}</text>
        </g>
    );
};

/** Un emoji grande como icono. */
const Emoji = ({ x, y, size = 30, children }) => (
    <text x={x} y={y} textAnchor="middle" fontSize={size} style={{ fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif' }}>{children}</text>
);

// --- Pedido → envío -----------------------------------------------------------

/** El camino completo de un pedido, con quién hace cada cosa. */
export const IlusCaminoEnvio = () => {
    const pasos = [
        ['🛒', 'Compra', 'y paga el envío', 'clienta'],
        ['📋', 'Ves el pedido', 'en Pedidos', 'vos'],
        ['🖥️', 'Cargás el envío', 'en MiCorreo', 'vos'],
        ['🏷️', 'Imprimís', 'la etiqueta', 'vos'],
        ['📦', 'Embalás', 'y la pegás', 'vos'],
        ['🚚', 'Pasan a buscar', 'a tu casa', 'correo'],
        ['✉️', 'Le avisa', 'a la clienta', 'solo'],
    ];
    const w = 92, sep = 100;
    return (
        <Svg alto={190} label="El camino de un pedido, del pago al aviso a la clienta">
            {pasos.map(([e, a, b, q], i) => {
                const x = 12 + i * sep;
                return (
                    <g key={i} transform={`translate(${x} 20)`}>
                        <rect width={w} height="120" rx="14" className={q === 'vos' ? 'fill-[#E8C65E]/15' : q === 'solo' ? 'fill-emerald-500/10' : papelSuave} />
                        <rect width={w} height="120" rx="14" fill="none" stroke={q === 'vos' ? ORO : q === 'solo' ? VERDE : undefined} className={q === 'vos' || q === 'solo' ? '' : linea} strokeWidth="1.4" />
                        <circle cx="14" cy="14" r="10" fill={ORO} />
                        <text x="14" y="18" textAnchor="middle" fontSize="11" fontWeight="900" fill="#111">{i + 1}</text>
                        <Emoji x={w / 2} y={58} size={30}>{e}</Emoji>
                        <text x={w / 2} y="80" textAnchor="middle" fontSize="11" fontWeight="800" className={texto}>{a}</text>
                        <text x={w / 2} y="94" textAnchor="middle" fontSize="10" className={textoSuave}>{b}</text>
                        <Quien x={w / 2} y={100} quien={q} />
                        {i < pasos.length - 1 && <Flecha x1={w + 1} y1={60} x2={sep - 2} y2={60} />}
                    </g>
                );
            })}
            <g transform="translate(12 158)">
                <rect width="14" height="14" rx="4" fill={ORO} /><text x="20" y="11" fontSize="10.5" className={texto}>Lo hacés vos (4 pasos, 10 minutos por pedido)</text>
                <rect x="290" width="14" height="14" rx="4" fill={VERDE} /><text x="310" y="11" fontSize="10.5" className={texto}>Se hace solo</text>
                <rect x="410" width="14" height="14" rx="4" fill="#2563eb" /><text x="430" y="11" fontSize="10.5" className={texto}>Lo hace el Correo</text>
            </g>
        </Svg>
    );
};

/** Admin → Pedidos: el pedido abierto con "Datos y envío" y el botón de copiar. */
export const IlusPedidoPanel = () => (
    <Svg alto={300} label="En el panel, el pedido con Datos y envío abierto">
        <Pantalla x={30} y={10} w={420} h={270} titulo="ADMIN → PEDIDOS">
            <rect x="16" y="10" width="388" height="40" rx="8" className={papelSuave} />
            <text x="28" y="27" fontSize="11" fontWeight="800" className={texto}>ORD-4F2A91 · Carla Pérez</text>
            <text x="28" y="41" fontSize="9.5" className={textoSuave}>$45.000 · pagado · hoy 14:32</text>
            <Boton x={300} y={16} w={92} h={26} tipo="borde" fontSize={9.5} resaltar>Datos y envío</Boton>
            {/* desplegado */}
            <rect x="16" y="58" width="388" height="180" rx="8" fill="none" className={linea} strokeDasharray="4 3" />
            <text x="28" y="78" fontSize="9" fontWeight="800" letterSpacing="1" className={textoSuave}>QUÉ VA</text>
            <text x="28" y="92" fontSize="10" className={texto}>1× Vestido Negro Largo · talle M</text>
            <text x="28" y="114" fontSize="9" fontWeight="800" letterSpacing="1" className={textoSuave}>LA CLIENTA</text>
            <text x="28" y="128" fontSize="10" className={texto}>Carla Pérez · DNI 30.123.456 · 11 5555 1234</text>
            <text x="28" y="150" fontSize="9" fontWeight="800" letterSpacing="1" className={textoSuave}>A DÓNDE VA</text>
            <text x="28" y="164" fontSize="10" className={texto}>Belgrano 1234, 2° B — Rafaela, Santa Fe (2300)</text>
            <text x="28" y="178" fontSize="10" fontWeight="700" fill={ORO_OSCURO}>Envío a domicilio</text>
            <Boton x={190} y={198} w={200} h={30} tipo="oro" fontSize={10.5} resaltar>📋 Copiar datos para MiCorreo</Boton>
        </Pantalla>
        <Flecha x1={460} y1={140} x2={510} y2={140} />
        <g transform="translate(520 70)">
            <Emoji x={90} y={50} size={44}>📋</Emoji>
            <text x="90" y="80" textAnchor="middle" fontSize="12" fontWeight="800" className={texto}>Queda copiado.</text>
            <text x="90" y="98" textAnchor="middle" fontSize="10.5" className={textoSuave}>Después lo pegás en MiCorreo</text>
            <text x="90" y="112" textAnchor="middle" fontSize="10.5" className={textoSuave}>con Ctrl + V. No escribís nada.</text>
        </g>
    </Svg>
);

/** MiCorreo → Nuevo envío: las tres partes del formulario. */
export const IlusMiCorreoNuevoEnvio = () => (
    <Svg alto={330} label="El formulario de Nuevo envío en MiCorreo: origen, destino y paquete">
        <Pantalla x={30} y={10} w={660} h={300} titulo="MICORREO → NUEVO ENVÍO">
            {[
                ['1', 'ORIGEN', 'Tus datos', 'Quedan guardados desde la primera vez.', [['Nombre', 'La Boutique de la Elegancia'], ['Dirección', 'Tu calle 123, Rafaela'], ['CP', '2300']], VERDE, 'ya está'],
                ['2', 'DESTINO', 'La clienta', 'Pegás lo que copiaste del panel.', [['Nombre', 'Carla Pérez'], ['Dirección', 'Belgrano 1234, 2° B'], ['CP · Ciudad', '2300 · Rafaela']], ORO, 'Ctrl + V'],
                ['3', 'PAQUETE', 'Qué mandás', 'Una prenda en bolsa: siempre lo mismo.', [['Medidas', '30 × 25 × 5 cm'], ['Peso', '1 kg'], ['Contenido', 'Indumentaria']], ORO, 'siempre igual'],
            ].map(([n, t, sub, nota, campos, color, chip], i) => (
                <g key={t} transform={`translate(${16 + i * 216} 12)`}>
                    <rect width="200" height="216" rx="10" className={papelSuave} />
                    <rect width="200" height="216" rx="10" fill="none" stroke={color} strokeWidth="1.4" opacity="0.7" />
                    <circle cx="18" cy="18" r="11" fill={color} />
                    <text x="18" y="22" textAnchor="middle" fontSize="11" fontWeight="900" fill={color === ORO ? '#111' : 'white'}>{n}</text>
                    <text x="36" y="16" fontSize="10" fontWeight="900" letterSpacing="1.5" className={textoSuave}>{t}</text>
                    <text x="36" y="29" fontSize="10.5" fontWeight="700" className={texto}>{sub}</text>
                    {campos.map(([e, v], j) => <Campo key={e} x={12} y={48 + j * 40} w={176} etiqueta={e} valor={v} />)}
                    <rect x="12" y="172" width="176" height="34" rx="6" fill={color} opacity="0.12" />
                    <text x="100" y="187" textAnchor="middle" fontSize="9.5" className={texto}>{nota}</text>
                    <text x="100" y="200" textAnchor="middle" fontSize="9.5" fontWeight="900" fill={color === ORO ? ORO_OSCURO : '#059669'}>{chip}</text>
                </g>
            ))}
            <Boton x={230} y={238} w={200} h={30} tipo="verde" fontSize={11}>Guardar envío → Pagar</Boton>
        </Pantalla>
    </Svg>
);

/** El paquete con las medidas y el peso, y la balanza. */
export const IlusPaquete = () => (
    <Svg alto={230} label="Medidas y peso de un paquete con una prenda">
        {/* bolsa */}
        <g transform="translate(60 40)">
            <rect x="0" y="0" width="240" height="150" rx="10" className="fill-[#c9a46a] dark:fill-[#8b6f3f]" />
            <rect x="12" y="12" width="216" height="126" rx="6" fill="none" stroke="#fff" strokeOpacity="0.5" strokeDasharray="5 4" />
            <Emoji x={120} y={95} size={44}>👗</Emoji>
            {/* cotas */}
            <line x1="0" y1="-14" x2="240" y2="-14" stroke={ORO_OSCURO} strokeWidth="2" />
            <text x="120" y="-20" textAnchor="middle" fontSize="12" fontWeight="900" className={texto}>30 cm</text>
            <line x1="-14" y1="0" x2="-14" y2="150" stroke={ORO_OSCURO} strokeWidth="2" />
            <text x="-22" y="80" textAnchor="end" fontSize="12" fontWeight="900" className={texto}>25 cm</text>
            <line x1="252" y1="140" x2="252" y2="150" stroke={ORO_OSCURO} strokeWidth="2" />
            <text x="262" y="150" fontSize="12" fontWeight="900" className={texto}>5 cm de alto</text>
        </g>
        {/* balanza */}
        <g transform="translate(440 50)">
            <rect x="0" y="100" width="200" height="30" rx="8" className="fill-slate-300 dark:fill-slate-600" />
            <rect x="60" y="40" width="80" height="60" rx="6" className={papel} />
            <rect x="60" y="40" width="80" height="60" rx="6" fill="none" className={linea} />
            <text x="100" y="78" textAnchor="middle" fontSize="20" fontWeight="900" style={mono} className={texto}>1 kg</text>
            <text x="100" y="20" textAnchor="middle" fontSize="12" fontWeight="800" className={texto}>Peso: poné 1 kg</text>
            <text x="100" y="150" textAnchor="middle" fontSize="10.5" className={textoSuave}>Una prenda pesa ½ kg. Con 1 kg</text>
            <text x="100" y="164" textAnchor="middle" fontSize="10.5" className={textoSuave}>vas seguro y el precio es el mismo.</text>
        </g>
        <text x="60" y="222" fontSize="11" fontWeight="700" className={texto}>Dos prendas: 40 × 30 × 10 cm y 2 kg. No hace falta medir con regla: es a ojo.</text>
    </Svg>
);

/** Marcar enviado en el panel y el email que le llega a la clienta. */
export const IlusMarcarEnviado = () => (
    <Svg alto={230} label="Marcar enviado con el número de seguimiento; el email sale solo">
        <Pantalla x={30} y={10} w={330} h={200} titulo="ADMIN → PEDIDOS">
            <text x="20" y="22" fontSize="11" fontWeight="800" className={texto}>ORD-4F2A91 · Carla Pérez</text>
            <Boton x={20} y={36} w={140} h={28} tipo="oro" fontSize={10.5} resaltar>✓ Marcar Enviado</Boton>
            <Campo x={20} y={86} w={290} etiqueta="NÚMERO DE SEGUIMIENTO (LO DA MICORREO)" valor="CU123456789AR" />
            <Boton x={20} y={128} w={110} h={26} tipo="verde" fontSize={10}>Guardar</Boton>
        </Pantalla>
        <Flecha x1={370} y1={110} x2={432} y2={110} color={VERDE} />
        <Quien x={392} y={84} quien="solo" />
        <g transform="translate(440 40)">
            <rect width="250" height="140" rx="12" className={papel} />
            <rect width="250" height="140" rx="12" fill="none" stroke={VERDE} strokeWidth="1.5" />
            <Emoji x={30} y={38} size={22}>✉️</Emoji>
            <text x="50" y="30" fontSize="9" fontWeight="800" letterSpacing="1" className={textoSuave}>EMAIL A LA CLIENTA</text>
            <text x="50" y="44" fontSize="10.5" fontWeight="800" className={texto}>¡Tu pedido ya salió! 📦</text>
            <text x="16" y="70" fontSize="10" className={texto}>Hola Carla, tu compra está en camino.</text>
            <text x="16" y="86" fontSize="10" className={texto}>Seguimiento: <tspan style={mono} fontWeight="800">CU123456789AR</tspan></text>
            <rect x="16" y="100" width="150" height="24" rx="6" fill={VERDE} />
            <text x="91" y="116" textAnchor="middle" fontSize="10" fontWeight="800" fill="white">Rastrear mi paquete</text>
        </g>
        <text x="30" y="226" fontSize="11" fontWeight="700" className={texto}>Vos no le escribís nada. El email sale solo apenas tocás Guardar.</text>
    </Svg>
);

/** La semana, con los dos días en que pasan a buscar. */
export const IlusDiasRetiro = () => {
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return (
        <Svg alto={200} label="Elegí dos días fijos para que pasen a buscar, por ejemplo martes y viernes">
            {dias.map((d, i) => {
                const pasan = d === 'Mar' || d === 'Vie';
                const x = 30 + i * 96;
                return (
                    <g key={d} transform={`translate(${x} 20)`}>
                        <rect width="84" height="110" rx="12" className={pasan ? 'fill-[#E8C65E]/15' : papelSuave} />
                        <rect width="84" height="110" rx="12" fill="none" stroke={pasan ? ORO : undefined} className={pasan ? '' : linea} strokeWidth="1.5" />
                        <text x="42" y="24" textAnchor="middle" fontSize="12" fontWeight="900" className={d === 'Dom' ? 'fill-red-400' : texto}>{d}</text>
                        {pasan ? (
                            <>
                                <Emoji x={42} y={70} size={30}>🚚</Emoji>
                                <text x="42" y="96" textAnchor="middle" fontSize="9.5" fontWeight="900" fill={ORO_OSCURO}>PASAN A BUSCAR</text>
                            </>
                        ) : (
                            <>
                                <Emoji x={42} y={70} size={24}>{d === 'Dom' ? '🛋️' : '📦'}</Emoji>
                                <text x="42" y="96" textAnchor="middle" fontSize="9.5" className={textoSuave}>{d === 'Dom' ? 'no pasan' : 'juntás paquetes'}</text>
                            </>
                        )}
                    </g>
                );
            })}
            <text x="30" y="160" fontSize="11.5" fontWeight="700" className={texto}>Cada visita cuesta lo mismo, lleves 1 paquete o 9. Por eso conviene juntar y pedir dos días fijos.</text>
            <text x="30" y="180" fontSize="11" className={textoSuave}>Con 10 a 14 paquetes en la visita: 40% de descuento. Con 15 o más: gratis. Pasan de lunes a sábado (sábado sólo a la mañana).</text>
        </Svg>
    );
};

/** A domicilio o a sucursal: qué cambia para vos (nada) y para la clienta. */
export const IlusDomicilioSucursal = ({ domicilio, sucursal }) => (
    <Svg alto={210} label="Envío a domicilio o retiro en sucursal: para vos es lo mismo">
        {[
            ['🏠', 'A domicilio', 'El cartero lo lleva a la puerta.', 'Destino: la dirección de la clienta.', `$${Number(domicilio?.cost || 0).toLocaleString('es-AR')} · ${domicilio?.time || ''}`],
            ['🏤', 'Retiro en sucursal', 'La clienta lo busca en su correo.', 'Destino: la sucursal más cercana a ella.', `$${Number(sucursal?.cost || 0).toLocaleString('es-AR')} · ${sucursal?.time || ''}`],
        ].map(([e, t, a, b, c], i) => (
            <g key={t} transform={`translate(${30 + i * 340} 20)`}>
                <rect width="320" height="140" rx="14" className={papel} />
                <rect width="320" height="140" rx="14" fill="none" className={linea} strokeWidth="1.2" />
                <Emoji x={44} y={62} size={36}>{e}</Emoji>
                <text x="84" y="34" fontSize="14" fontWeight="900" className={texto}>{t}</text>
                <text x="84" y="54" fontSize="11" className={texto}>{a}</text>
                <text x="84" y="72" fontSize="11" className={textoSuave}>{b}</text>
                <rect x="84" y="86" width="150" height="22" rx="6" className={papelSuave} />
                <text x="92" y="101" fontSize="10.5" fontWeight="800" style={mono} className={texto}>{c}</text>
                <text x="84" y="128" fontSize="10" className={textoSuave}>Lo elige la clienta al comprar. Lo ves en el pedido.</text>
            </g>
        ))}
        <rect x="30" y="172" width="660" height="26" rx="8" fill={VERDE} opacity="0.12" />
        <text x="360" y="189" textAnchor="middle" fontSize="11.5" fontWeight="800" fill="#059669">Para vos los pasos son los mismos. Sólo cambia qué destino ponés en MiCorreo.</text>
    </Svg>
);

/** Quién paga qué: la clienta paga el envío, vos le pagás al Correo. */
export const IlusQuienPaga = ({ tienda, correo, retiro = 11200 }) => (
    <Svg alto={180} label="La clienta paga el envío en la tienda; con eso le pagás al Correo">
        <g transform="translate(30 20)">
            <rect width="200" height="120" rx="14" className="fill-purple-500/10" />
            <rect width="200" height="120" rx="14" fill="none" stroke="#a855f7" strokeWidth="1.4" />
            <Emoji x={30} y={46} size={26}>👩</Emoji>
            <text x="52" y="32" fontSize="10" fontWeight="900" letterSpacing="1" fill="#a855f7">LA CLIENTA PAGA</text>
            <text x="52" y="52" fontSize="18" fontWeight="900" className={texto}>{tienda}</text>
            <text x="16" y="82" fontSize="10.5" className={textoSuave}>al comprar, junto con la prenda.</text>
            <text x="16" y="98" fontSize="10.5" className={textoSuave}>Entra a tu Mercado Pago.</text>
        </g>
        <Flecha x1={240} y1={80} x2={272} y2={80} />
        <g transform="translate(280 20)">
            <rect width="230" height="120" rx="14" className="fill-blue-500/10" />
            <rect width="230" height="120" rx="14" fill="none" stroke="#2563eb" strokeWidth="1.4" />
            <Emoji x={30} y={46} size={26}>📮</Emoji>
            <text x="52" y="32" fontSize="9.5" fontWeight="900" letterSpacing="0.5" fill="#2563eb">VOS LE PAGÁS AL CORREO</text>
            <text x="52" y="52" fontSize="18" fontWeight="900" className={texto}>{correo}</text>
            <text x="16" y="82" fontSize="10.5" className={textoSuave}>por cada envío, en MiCorreo,</text>
            <text x="16" y="98" fontSize="10.5" className={textoSuave}>con tarjeta o Mercado Pago.</text>
        </g>
        <Flecha x1={520} y1={80} x2={548} y2={80} />
        <g transform="translate(555 20)">
            <rect width="140" height="120" rx="14" className={papelSuave} />
            <rect width="140" height="120" rx="14" fill="none" className={linea} strokeWidth="1.2" />
            <text x="70" y="32" textAnchor="middle" fontSize="10" fontWeight="900" letterSpacing="1" className={textoSuave}>TE QUEDA</text>
            <text x="70" y="60" textAnchor="middle" fontSize="16" fontWeight="900" fill="#059669">un poco</text>
            <text x="70" y="82" textAnchor="middle" fontSize="10" className={textoSuave}>que ayuda a pagar</text>
            <text x="70" y="96" textAnchor="middle" fontSize="10" className={textoSuave}>el retiro (${retiro.toLocaleString('es-AR')}</text>
            <text x="70" y="110" textAnchor="middle" fontSize="10" className={textoSuave}>por visita)</text>
        </g>
        <text x="30" y="166" fontSize="11" className={textoSuave}>El envío no lo pagás vos: sale de lo que pagó la clienta. Si el Correo aumenta, subís el precio en la tienda y listo.</text>
    </Svg>
);

// --- Tarifas ------------------------------------------------------------------

/** Lo que ve la clienta al elegir el envío en el checkout. */
export const IlusCheckoutEnvio = ({ opciones = [] }) => (
    <Svg alto={100 + opciones.length * 64} label="Las opciones de envío que ve la clienta al comprar">
        <Pantalla x={140} y={10} w={440} h={70 + opciones.length * 64} titulo="LA TIENDA → FINALIZAR COMPRA">
            <text x="20" y="18" fontSize="10" fontWeight="800" letterSpacing="1" className={textoSuave}>¿CÓMO TE LO MANDAMOS?</text>
            {opciones.map((o, i) => (
                <g key={o.name} transform={`translate(20 ${28 + i * 64})`}>
                    <rect width="400" height="52" rx="10" className={i === 0 ? 'fill-[#E8C65E]/15' : papelSuave} />
                    <rect width="400" height="52" rx="10" fill="none" stroke={i === 0 ? ORO : undefined} className={i === 0 ? '' : linea} strokeWidth="1.4" />
                    <circle cx="22" cy="26" r="8" fill="none" stroke={i === 0 ? ORO_OSCURO : '#94a3b8'} strokeWidth="2" />
                    {i === 0 && <circle cx="22" cy="26" r="4" fill={ORO_OSCURO} />}
                    <text x="40" y="22" fontSize="12" fontWeight="800" className={texto}>{o.name}</text>
                    <text x="40" y="38" fontSize="10" className={textoSuave}>{o.time}</text>
                    <text x="385" y="31" textAnchor="end" fontSize="14" fontWeight="900" className={texto}>${Number(o.cost).toLocaleString('es-AR')}</text>
                </g>
            ))}
        </Pantalla>
    </Svg>
);

/** Configuración → Envíos: dónde se cambia el precio. */
export const IlusCambiarTarifa = ({ opciones = [] }) => (
    <Svg alto={60 + opciones.length * 50 + 50} label="Dónde se cambia el precio del envío en el panel">
        <Pantalla x={90} y={10} w={540} h={30 + opciones.length * 50 + 50} titulo="ADMIN → CONFIGURACIÓN → ENVÍOS">
            {opciones.map((o, i) => (
                <g key={o.name} transform={`translate(20 ${16 + i * 50})`}>
                    <Campo x={0} y={0} w={250} etiqueta="NOMBRE" valor={o.name} />
                    <Campo x={266} y={0} w={100} etiqueta="PRECIO ($)" valor={String(o.cost)} />
                    <Campo x={382} y={0} w={120} etiqueta="DEMORA" valor={o.time} />
                    {i === 0 && <rect x="260" y="-12" width="112" height="46" rx="8" fill="none" stroke={ROJO} strokeWidth="2.5" strokeDasharray="6 4" />}
                </g>
            ))}
            <Boton x={20} y={22 + opciones.length * 50} w={120} h={28} tipo="oro" fontSize={11} resaltar>Guardar</Boton>
            <text x="160" y="40" fontSize="10" className={textoSuave} transform={`translate(0 ${opciones.length * 50})`}>Se aplica al instante. No hay que publicar nada.</text>
        </Pantalla>
    </Svg>
);

// --- Panel: entrar, llaves, abrir ---------------------------------------------

/** La pantalla de entrada con el botón de Google. */
export const IlusLogin = () => (
    <Svg alto={250} label="Entrar al panel con la cuenta de Google de la tienda">
        <Pantalla x={30} y={10} w={300} h={220} titulo="…WEB.APP/ADMIN">
            <text x="150" y="40" textAnchor="middle" fontSize="13" fontWeight="900" className={texto}>Panel de administración</text>
            <text x="150" y="58" textAnchor="middle" fontSize="10" className={textoSuave}>Entrá con la cuenta de la tienda</text>
            <Boton x={40} y={80} w={220} h={40} tipo="borde" fontSize={12} resaltar>G  Continuar con Google</Boton>
            <text x="150" y="160" textAnchor="middle" fontSize="9.5" className={textoSuave}>Elegí la cuenta que termina en</text>
            <text x="150" y="174" textAnchor="middle" fontSize="9.5" fontWeight="800" style={mono} className={texto}>…oficial@gmail.com</text>
        </Pantalla>
        <Flecha x1={340} y1={120} x2={390} y2={120} />
        <Pantalla x={400} y={10} w={290} h={220} titulo="EL PANEL">
            {['Inicio', 'Lau', 'Pedidos', 'Inventario', 'Ventas', 'Guías'].map((it, i) => (
                <g key={it} transform={`translate(16 ${12 + i * 27})`}>
                    <rect width="120" height="22" rx="6" className={i === 5 ? '' : papelSuave} fill={i === 5 ? ORO : undefined} />
                    <text x="10" y="15" fontSize="10" fontWeight={i === 5 ? 900 : 600} fill={i === 5 ? '#111' : undefined} className={i === 5 ? '' : textoSuave}>{it}</text>
                </g>
            ))}
            <rect x="150" y="12" width="124" height="160" rx="8" className={papelSuave} />
            <text x="212" y="80" textAnchor="middle" fontSize="10" fontWeight="800" className={texto}>Si ves este menú</text>
            <text x="212" y="96" textAnchor="middle" fontSize="10" fontWeight="800" fill="#059669">entraste bien ✓</text>
            <text x="212" y="120" textAnchor="middle" fontSize="9" className={textoSuave}>Si no está el menú,</text>
            <text x="212" y="132" textAnchor="middle" fontSize="9" className={textoSuave}>es otra cuenta.</text>
        </Pantalla>
    </Svg>
);

/** El viaje de la llave de Gemini: AI Studio → copiar → pegar en Configuración → Guardar. */
export const IlusLlaveViaje = () => (
    <Svg alto={230} label="Crear la llave en AI Studio y pegarla en el panel">
        <Pantalla x={30} y={10} w={300} h={200} titulo="AISTUDIO.GOOGLE.COM/APIKEY">
            <Boton x={20} y={14} w={130} h={28} tipo="oro" fontSize={10.5} resaltar>+ Create API key</Boton>
            <rect x="20" y="58" width="260" height="34" rx="8" className={papelSuave} />
            <text x="32" y="80" fontSize="10.5" style={mono} className={texto}>AQ.Ab8R•••••••••••••••••••</text>
            <Boton x={20} y={104} w={80} h={24} tipo="borde" fontSize={10}>Copiar</Boton>
            <text x="20" y="150" fontSize="9.5" className={textoSuave}>Después, la llave vieja: 🗑️ borrarla.</text>
        </Pantalla>
        <Flecha x1={340} y1={105} x2={390} y2={105} />
        <text x="365" y="92" textAnchor="middle" fontSize="9.5" fontWeight="800" className={textoSuave}>copiar</text>
        <Pantalla x={400} y={10} w={290} h={200} titulo="CONFIGURACIÓN → INTELIGENCIA ARTIFICIAL">
            <Campo x={20} y={16} w={250} etiqueta="LLAVES ADMINISTRADOR (LAU, COPY, VISIÓN)" valor="AQ.Ab8R•••••••••••••" />
            <text x="20" y="66" fontSize="9" className={textoSuave}>Podés pegar varias, una por línea.</text>
            <Boton x={20} y={80} w={120} h={28} tipo="oro" fontSize={10.5} resaltar>Guardar Keys</Boton>
            <text x="20" y="140" fontSize="10" fontWeight="800" fill="#059669">Listo. Lau ya contesta.</text>
        </Pantalla>
        <text x="30" y="226" fontSize="11" className="fill-red-500" fontWeight="700">La llave es como una contraseña: no la mandes por WhatsApp ni la pegues en un chat. Sólo en ese campo.</text>
    </Svg>
);

/** El interruptor de mantenimiento en el Dashboard. */
export const IlusInterruptor = () => (
    <Svg alto={170} label="El interruptor de mantenimiento en el Dashboard">
        {[
            ['ANTES DE ABRIR', true, 'La gente ve “EN RENOVACIÓN”.', 'Vos entrás igual y ves todo.'],
            ['TIENDA ABIERTA', false, 'La gente ve la tienda y compra.', 'Se apaga al instante.'],
        ].map(([t, on, a, b], i) => (
            <g key={t} transform={`translate(${30 + i * 340} 20)`}>
                <rect width="320" height="120" rx="14" className={papel} />
                <rect width="320" height="120" rx="14" fill="none" className={linea} strokeWidth="1.2" />
                <text x="20" y="28" fontSize="10" fontWeight="900" letterSpacing="1.5" className={textoSuave}>{t}</text>
                <text x="20" y="48" fontSize="11" fontWeight="700" className={texto}>Mantenimiento</text>
                <rect x="220" y="34" width="64" height="30" rx="15" fill={on ? ROJO : VERDE} />
                <circle cx={on ? 269 : 235} cy="49" r="11" fill="white" />
                <text x={on ? 240 : 266} y="53" textAnchor="middle" fontSize="9" fontWeight="900" fill="white">{on ? 'ON' : 'OFF'}</text>
                <text x="20" y="84" fontSize="10.5" className={texto}>{a}</text>
                <text x="20" y="100" fontSize="10.5" className={textoSuave}>{b}</text>
            </g>
        ))}
        <Flecha x1={350} y1={80} x2={370} y2={80} />
    </Svg>
);

/** Las cuatro cosas que tienen que pasar en la compra de prueba. */
export const IlusPruebaCompra = () => {
    const checks = [['✉️', 'Te llega el email', 'de confirmación'], ['📋', 'El pedido aparece', 'en Pedidos'], ['💳', 'Pasa a “pagado”', 'solo, en minutos'], ['🚚', 'Marcás enviado y', 'llega el email']];
    return (
        <Svg alto={170} label="Las cuatro comprobaciones de la compra de prueba">
            {checks.map(([e, a, b], i) => (
                <g key={i} transform={`translate(${30 + i * 168} 20)`}>
                    <rect width="150" height="120" rx="14" className={papel} />
                    <rect width="150" height="120" rx="14" fill="none" stroke={VERDE} strokeWidth="1.5" />
                    <Emoji x={75} y={52} size={30}>{e}</Emoji>
                    <text x="75" y="78" textAnchor="middle" fontSize="11" fontWeight="800" className={texto}>{a}</text>
                    <text x="75" y="93" textAnchor="middle" fontSize="10.5" className={textoSuave}>{b}</text>
                    <rect x="55" y="100" width="40" height="14" rx="7" fill={VERDE} />
                    <text x="75" y="110.5" textAnchor="middle" fontSize="9" fontWeight="900" fill="white">✓ SÍ</text>
                </g>
            ))}
            <text x="30" y="160" fontSize="11" fontWeight="700" className={texto}>Las cuatro en verde → abrís. Si una falla, anotá cuál y avisá antes de abrir.</text>
        </Svg>
    );
};

// --- Lau y precios --------------------------------------------------------------

/** Del costo al precio: qué se suma y qué se descuenta. */
export const IlusCostoAPrecio = () => {
    const cajas = [['Costo', '$20.000', 'lo que pagaste', papelSuave], ['+ Packaging', '$650', 'la bolsa', papelSuave], ['+ Flete', '$500', 'traerla', papelSuave], ['× Margen', '100%', 'tu ganancia', 'fill-[#E8C65E]/20'], ['+ MP', '7,6%', 'la comisión', 'fill-blue-500/10']];
    return (
        <Svg alto={180} label="Cómo se arma el precio a partir del costo">
            {cajas.map(([t, v, s, cls], i) => (
                <g key={t} transform={`translate(${30 + i * 112} 20)`}>
                    <rect width="100" height="90" rx="12" className={cls} />
                    <rect width="100" height="90" rx="12" fill="none" className={linea} strokeWidth="1.2" />
                    <text x="50" y="24" textAnchor="middle" fontSize="11" fontWeight="800" className={texto}>{t}</text>
                    <text x="50" y="52" textAnchor="middle" fontSize="16" fontWeight="900" style={mono} className={texto}>{v}</text>
                    <text x="50" y="74" textAnchor="middle" fontSize="9.5" className={textoSuave}>{s}</text>
                </g>
            ))}
            <Flecha x1={592} y1={65} x2={610} y2={65} />
            <g transform="translate(615 20)">
                <rect width="90" height="90" rx="12" fill={ORO} />
                <text x="45" y="26" textAnchor="middle" fontSize="10" fontWeight="900" fill="#111">PRECIO</text>
                <text x="45" y="56" textAnchor="middle" fontSize="16" fontWeight="900" fill="#111" style={mono}>$45.800</text>
                <text x="45" y="76" textAnchor="middle" fontSize="9" fill="#111" opacity="0.8">redondeado</text>
            </g>
            <text x="30" y="140" fontSize="11.5" fontWeight="700" className={texto}>Todo eso lo configurás una sola vez. Después decís “me costó 20000” y sale $45.800.</text>
            <text x="30" y="160" fontSize="10.5" className={textoSuave}>Te quedan $21.100 limpios (el 100% del costo total) después de pagarle a Mercado Pago.</text>
        </Svg>
    );
};

/** El clip de Lau: qué se le puede adjuntar. */
export const IlusClip = () => (
    <Svg alto={170} label="Con el clip se adjuntan fotos, la planilla de productos o la de ventas">
        <g transform="translate(30 30)">
            <rect width="200" height="110" rx="14" className={papelSuave} />
            <rect width="200" height="110" rx="14" fill="none" className={linea} strokeWidth="1.2" />
            <Emoji x={60} y={72} size={44}>📎</Emoji>
            <text x="120" y="50" fontSize="12" fontWeight="900" className={texto}>El clip</text>
            <text x="120" y="68" fontSize="10" className={textoSuave}>abajo a la</text>
            <text x="120" y="82" fontSize="10" className={textoSuave}>izquierda</text>
        </g>
        {[['📷', 'Fotos', 'de la prenda'], ['📗', 'Excel de productos', '+ sus fotos'], ['📒', 'Tu planilla', 'de ventas']].map(([e, a, b], i) => (
            <g key={a} transform={`translate(${270 + i * 145} 30)`}>
                <Flecha x1={-35 + (i === 0 ? 0 : 0)} y1={55} x2={-8} y2={55} />
                <rect width="130" height="110" rx="14" className={papel} />
                <rect width="130" height="110" rx="14" fill="none" stroke={ORO} strokeWidth="1.3" />
                <Emoji x={65} y={52} size={30}>{e}</Emoji>
                <text x="65" y="78" textAnchor="middle" fontSize="11" fontWeight="800" className={texto}>{a}</text>
                <text x="65" y="93" textAnchor="middle" fontSize="10" className={textoSuave}>{b}</text>
            </g>
        ))}
    </Svg>
);

// --- Instagram -----------------------------------------------------------------

/** Marco de un celular: pantalla angosta con muesca arriba. */
const Celular = ({ x, y, w = 170, h = 300, children }) => (
    <g transform={`translate(${x} ${y})`}>
        <rect width={w} height={h} rx="22" className="fill-slate-800 dark:fill-slate-200" />
        <rect x="6" y="6" width={w - 12} height={h - 12} rx="18" className={papel} />
        <rect x={w / 2 - 22} y="6" width="44" height="12" rx="6" className="fill-slate-800 dark:fill-slate-200" />
        <g transform="translate(6 24)">{children}</g>
    </g>
);

/** El camino de una publicación: de la frase a Lau al post en Instagram. */
export const IlusCaminoInstagram = () => {
    const pasos = [
        ['💬', 'Le decís a Lau', '"publicá el jean"', 'vos'],
        ['👀', 'Lau te muestra', 'foto y texto', 'solo'],
        ['✅', 'Confirmás', 'un toque', 'vos'],
        ['☁️', 'El servidor', 'se lo manda a Meta', 'solo'],
        ['📸', 'Aparece', 'en tu Instagram', 'solo'],
    ];
    const w = 118, sep = 138;
    return (
        <Svg alto={175} label="Cómo llega una publicación a Instagram: dos toques tuyos, el resto se hace solo">
            {pasos.map(([e, a, b, q], i) => {
                const x = 14 + i * sep;
                return (
                    <g key={i} transform={`translate(${x} 16)`}>
                        <rect width={w} height="122" rx="14" className={q === 'vos' ? 'fill-[#E8C65E]/15' : 'fill-emerald-500/10'} />
                        <rect width={w} height="122" rx="14" fill="none" stroke={q === 'vos' ? ORO : VERDE} strokeWidth="1.4" />
                        <circle cx="14" cy="14" r="10" fill={ORO} />
                        <text x="14" y="18" textAnchor="middle" fontSize="11" fontWeight="900" fill="#111">{i + 1}</text>
                        <Emoji x={w / 2} y={60} size={30}>{e}</Emoji>
                        <text x={w / 2} y="82" textAnchor="middle" fontSize="11" fontWeight="800" className={texto}>{a}</text>
                        <text x={w / 2} y="96" textAnchor="middle" fontSize="10" className={textoSuave}>{b}</text>
                        <Quien x={w / 2} y={102} quien={q} />
                        {i < pasos.length - 1 && <Flecha x1={w + 1} y1={60} x2={sep - 2} y2={60} />}
                    </g>
                );
            })}
            <g transform="translate(14 152)">
                <rect width="14" height="14" rx="4" fill={ORO} /><text x="20" y="11" fontSize="10.5" className={texto}>Lo hacés vos: una frase y un toque</text>
                <rect x="260" width="14" height="14" rx="4" fill={VERDE} /><text x="280" y="11" fontSize="10.5" className={texto}>Se hace solo</text>
            </g>
        </Svg>
    );
};

/** Pasar la cuenta de Instagram a profesional, en el celular. */
export const IlusCuentaProfesional = () => (
    <Svg alto={290} label="En la app de Instagram: Configuración, Tipo de cuenta, Cambiar a cuenta profesional, Empresa">
        <Celular x={40} y={10} w={180} h={270}>
            <text x="84" y="16" textAnchor="middle" fontSize="9" fontWeight="800" letterSpacing="1" className={textoSuave}>CONFIGURACIÓN</text>
            {['Tu actividad', 'Notificaciones', 'Tipo de cuenta y herramientas', 'Privacidad'].map((t, i) => (
                <g key={t} transform={`translate(10 ${30 + i * 30})`}>
                    <rect width="148" height="24" rx="6" className={papelSuave} />
                    {i === 2 && <rect x="-3" y="-3" width="154" height="30" rx="8" fill="none" stroke={ROJO} strokeWidth="2.5" strokeDasharray="6 4" />}
                    <text x="8" y="16" fontSize={i === 2 ? 8.5 : 9.5} fontWeight={i === 2 ? 800 : 500} className={texto}>{t}</text>
                    <text x="140" y="16" fontSize="10" className={textoSuave}>›</text>
                </g>
            ))}
            <text x="84" y="175" textAnchor="middle" fontSize="8.5" className={textoSuave}>1° tocá acá</text>
        </Celular>
        <Flecha x1={230} y1={145} x2={280} y2={145} />
        <Celular x={290} y={10} w={180} h={270}>
            <text x="84" y="16" textAnchor="middle" fontSize="8" fontWeight="800" letterSpacing="0.5" className={textoSuave}>TIPO DE CUENTA Y HERRAMIENTAS</text>
            <g transform="translate(10 30)">
                <rect width="148" height="24" rx="6" className={papelSuave} />
                <text x="8" y="16" fontSize="8.5" fontWeight="800" className={texto}>Cambiar a cuenta profesional</text>
                <rect x="-3" y="-3" width="154" height="30" rx="8" fill="none" stroke={ROJO} strokeWidth="2.5" strokeDasharray="6 4" />
            </g>
            <text x="84" y="80" textAnchor="middle" fontSize="8.5" className={textoSuave}>2° tocá acá</text>
            <text x="84" y="118" textAnchor="middle" fontSize="9" fontWeight="800" className={texto}>¿Qué tipo?</text>
            <Boton x={14} y={128} w={140} h={26} tipo="oro" fontSize={10.5} resaltar>Empresa</Boton>
            <Boton x={14} y={168} w={140} h={26} tipo="borde" fontSize={10.5}>Creador</Boton>
            <text x="84" y="220" textAnchor="middle" fontSize="8.5" className={textoSuave}>3° elegí Empresa</text>
            <text x="84" y="234" textAnchor="middle" fontSize="8.5" className={textoSuave}>y la categoría "Tienda de ropa"</text>
        </Celular>
        <g transform="translate(490 60)">
            <rect width="215" height="150" rx="14" className="fill-emerald-500/10" />
            <rect width="215" height="150" rx="14" fill="none" stroke={VERDE} strokeWidth="1.4" />
            <text x="14" y="26" fontSize="11" fontWeight="900" fill="#059669">Es gratis y no cambia nada</text>
            <text x="14" y="50" fontSize="10" className={texto}>• Tus fotos y seguidoras quedan igual.</text>
            <text x="14" y="70" fontSize="10" className={texto}>• Se agrega un botón de contacto.</text>
            <text x="14" y="90" fontSize="10" className={texto}>• Ves estadísticas de cada publicación.</text>
            <text x="14" y="110" fontSize="10" className={texto}>• Se puede volver atrás cuando quieras.</text>
            <text x="14" y="135" fontSize="9.5" fontWeight="800" className={textoSuave}>Tarda 2 minutos.</text>
        </g>
    </Svg>
);

/** Sacar la llave en Meta for Developers y pegarla en Vercel. */
export const IlusLlaveMeta = () => (
    <Svg alto={250} label="Generar la llave en Meta for Developers, copiarla y pegarla en Vercel como INSTAGRAM_ACCESS_TOKEN">
        <Pantalla x={14} y={10} w={330} h={215} titulo="META → TU APP → INSTAGRAM">
            <text x="20" y="18" fontSize="10" fontWeight="800" className={texto}>Configuración de la API con inicio de sesión de Instagram</text>
            <text x="20" y="36" fontSize="9.5" className={textoSuave}>1. Generar tokens de acceso</text>
            <rect x="20" y="46" width="290" height="30" rx="8" className={papelSuave} />
            <Emoji x={38} y={68} size={14}>📸</Emoji>
            <text x="52" y="66" fontSize="10" className={texto}>@laboutiquedelaelegancia</text>
            <Boton x={200} y={50} w={104} h={22} tipo="oro" fontSize={9.5} resaltar>Generar token</Boton>
            <rect x="20" y="92" width="290" height="34" rx="8" className={papelSuave} />
            <text x="32" y="114" fontSize="10.5" style={mono} className={texto}>IGAAR7•••••••••••••••••••••••••</text>
            <Boton x={20} y={138} w={80} h={24} tipo="borde" fontSize={10}>Copiar</Boton>
            <text x="110" y="154" fontSize="9" className={textoSuave}>Se muestra UNA vez: copiala ahora.</text>
        </Pantalla>
        <Flecha x1={354} y1={115} x2={396} y2={115} />
        <text x="375" y="102" textAnchor="middle" fontSize="9.5" fontWeight="800" className={textoSuave}>pegar</text>
        <Pantalla x={406} y={10} w={300} h={215} titulo="VERCEL → SETTINGS → ENVIRONMENT VARIABLES">
            <Campo x={20} y={14} w={260} etiqueta="KEY" valor="INSTAGRAM_ACCESS_TOKEN" />
            <Campo x={20} y={58} w={260} etiqueta="VALUE" valor="IGAAR7•••••••••••••••••" />
            <Boton x={20} y={104} w={80} h={26} tipo="oro" fontSize={10.5} resaltar>Save</Boton>
            <text x="20" y="152" fontSize="9.5" fontWeight="800" className={texto}>Después: Deployments → ⋯ → Redeploy</text>
            <text x="20" y="168" fontSize="9" className={textoSuave}>Sin el redeploy la llave no se aplica.</text>
        </Pantalla>
        <text x="14" y="244" fontSize="11" className="fill-red-500" fontWeight="700">La llave es la contraseña de tu Instagram: no la mandes por WhatsApp ni la pegues en un chat. Sólo en Vercel.</text>
    </Svg>
);

/** Cómo queda la publicación que arma Lau, vista en el celular. */
export const IlusPostInstagram = () => {
    const puntos = [
        ['📷', 'La foto', 'Es la principal del producto. Instagram la quiere JPEG y 4:5:', 'la tienda la convierte sola.'],
        ['✍️', 'El texto', 'Si le dictaste uno a Lau, va ese, tal cual. Si no, arma:', 'nombre, descripción, precio, talles y hashtags.'],
        ['🔗', 'El link', 'Instagram no deja links en el texto. Por eso dice "link en la bio":', 'poné la dirección de la tienda en tu perfil, una sola vez.'],
        ['🔢', 'El límite', 'Instagram acepta 25 publicaciones por día desde el panel.', 'Para una tienda, sobra.'],
    ];
    return (
        <Svg alto={340} label="Lo que publica Lau: la foto principal del producto y un texto con nombre, precio, talles y hashtags">
            <Celular x={30} y={10} w={190} h={320}>
                <g transform="translate(10 4)">
                    <circle cx="10" cy="10" r="9" fill={ORO} />
                    <text x="26" y="14" fontSize="9" fontWeight="800" className={texto}>laboutiquedelaelegancia</text>
                </g>
                <rect x="0" y="28" width="178" height="150" className={papelSuave} />
                <rect x="0" y="28" width="178" height="150" fill="none" className={linea} strokeWidth="1" />
                <Emoji x={89} y={115} size={44}>👖</Emoji>
                <text x="89" y="150" textAnchor="middle" fontSize="8.5" className={textoSuave}>la foto principal, recortada 4:5</text>
                <text x="8" y="196" fontSize="10">♡  💬  ✈️</text>
                <text x="8" y="216" fontSize="8.5" fontWeight="800" className={texto}>✨ Jean Oxford Tiro Alto</text>
                <text x="8" y="230" fontSize="8" className={texto}>Denim rígido, cintura alta, pierna ancha.</text>
                <text x="8" y="248" fontSize="8" className={texto}>💰 $45.900   📏 Talles: 36 · 38 · 40 · 42</text>
                <text x="8" y="262" fontSize="8" className={texto}>🛍️ Comprá en la-boutique… (link en la bio)</text>
                <text x="8" y="280" fontSize="8" fill="#2563eb">#LaBoutiqueDeLaElegancia #Rafaela #Jeans</text>
            </Celular>
            <g transform="translate(250 30)">
                {puntos.map(([e, t, d1, d2], i) => (
                    <g key={t} transform={`translate(0 ${i * 72})`}>
                        <rect width="440" height="62" rx="12" className={papelSuave} />
                        <rect width="440" height="62" rx="12" fill="none" className={linea} strokeWidth="1" />
                        <Emoji x={30} y={40} size={24}>{e}</Emoji>
                        <text x="58" y="24" fontSize="11" fontWeight="900" className={texto}>{t}</text>
                        <text x="58" y="41" fontSize="9.5" className={texto}>{d1}</text>
                        <text x="58" y="54" fontSize="9.5" className={texto}>{d2}</text>
                    </g>
                ))}
            </g>
        </Svg>
    );
};
