/* eslint-disable react/jsx-key -- las celdas y los items van como datos en arrays; Tabla y Lista les ponen key al renderizar */
import React from 'react';
import { LogIn, FileSpreadsheet, Bot, PackageCheck, Truck, Globe2, KeyRound, Rocket, Receipt } from 'lucide-react';
import { Seccion, P, K, Cod, Ruta, Pasos, Paso, Lista, Aviso, Tabla, Mensaje, Botones, Figura, Link } from './bloques';
import {
    IlusNombresFotos, IlusExcel, IlusImportar, IlusFlujoPedido, IlusRetiroCosto,
    IlusEtiqueta, IlusClaves, IlusLau, IlusMenu, IlusPlanillaVentas,
} from './ilustraciones';
import { TARIFAS_DE_LA_CASA, COSTO_REAL_CORREO_1KG } from '../../../utils/envios';

// Las guías del panel. Cada una tiene un índice (secciones) que la vista usa
// para el menú lateral, y un componente con el contenido. Los precios de
// envío se leen del mismo lugar que usa el checkout, así la guía nunca dice
// un número distinto del que cobra la tienda.

const $ = (n) => `$${Number(n).toLocaleString('es-AR')}`;
const URL_ADMIN = 'https://la-boutique-de-la-elegancia.web.app/admin';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Entrar al panel
// ─────────────────────────────────────────────────────────────────────────────
const Empezar = ({ abrir }) => (
    <>
        <Seccion id="entrar" titulo="Entrar al panel">
            <Pasos>
                <Paso>Abrí <Link href={URL_ADMIN}>{URL_ADMIN}</Link>. Guardalo en favoritos.</Paso>
                <Paso>Tocá <K>Continuar con Google</K> y elegí <strong>la cuenta de Google de la tienda</strong>. Es una sola cuenta para las dos personas que la manejan; con cualquier otra cuenta la página se ve como clienta y el panel no aparece.</Paso>
                <Paso>Si la tienda está <strong>“EN RENOVACIÓN”</strong> (modo mantenimiento), es normal: a vos te deja pasar igual y el panel funciona completo.</Paso>
            </Pasos>
            <Aviso tipo="ojo">
                Si entraste y <strong>no ves el menú de la izquierda</strong> (Inventario, Pedidos…), entraste con otra cuenta. Cerrá sesión y volvé a entrar con la de la tienda.
            </Aviso>
        </Seccion>

        <Seccion id="menu" titulo="Qué hay en cada parte del menú">
            <Figura titulo="El menú del panel. En el celular se abre con el botón ☰ arriba a la izquierda.">
                <IlusMenu resaltar="Guías" nota="Estás acá" />
            </Figura>
            <Tabla
                cabecera={['Sección', 'Para qué sirve', 'Quién la usa']}
                filas={[
                    [<strong>Dashboard</strong>, 'Resumen del día: ventas, visitas, pedidos pendientes, stock bajo. Acá también está el botón de mantenimiento.', 'Dueño'],
                    [<strong>Inventario</strong>, 'Los productos. Crear, editar, publicar u ocultar. Importar y exportar Excel.', 'Quien carga productos'],
                    [<strong>Pedidos</strong>, 'Las compras. Ver la dirección de la clienta y marcar enviado con el número de seguimiento.', 'Dueño'],
                    [<strong>Clientes</strong>, 'Quién compró qué, cuántas veces.', 'Dueño'],
                    [<strong>Ventas</strong>, 'Ventas y ganancia por período.', 'Dueño'],
                    [<strong>Asistente Lau</strong>, 'El asistente con inteligencia artificial: carga productos, edita precios, registra ventas por fuera.', 'Los dos'],
                    [<strong>CMS / Diseño</strong>, 'Textos, banners, categorías, redes sociales.', 'Dueño'],
                    [<strong>Guías</strong>, 'Esto que estás leyendo.', 'Los dos'],
                    [<strong>Configuración</strong>, 'WhatsApp, pagos, tarifas de envío, llaves de IA.', 'Dueño'],
                ]}
            />
        </Seccion>

        <Seccion id="buscador" titulo="El buscador rápido">
            <P>En cualquier lado del panel, apretá <K>Ctrl</K> + <K>K</K> (o el botón <K>Buscar</K> abajo a la izquierda). Escribís el nombre de un producto o de una sección y vas directo. Es la forma más rápida de encontrar un producto para editarlo.</P>
        </Seccion>

        <Seccion id="siguiente" titulo="Y ahora, ¿qué guía sigo?">
            <Lista items={[
                <>Voy a cargar muchos productos de una vez → <button className="font-bold text-[#8a6a1a] dark:text-[#E8C65E] underline" onClick={() => abrir('carga-masiva')}>Cargar productos con Excel y fotos</button></>,
                <>Voy a cargar pocos productos → <button className="font-bold text-[#8a6a1a] dark:text-[#E8C65E] underline" onClick={() => abrir('lau')}>Cargar productos hablándole a Lau</button></>,
                <>Entró un pedido y hay que despacharlo → <button className="font-bold text-[#8a6a1a] dark:text-[#E8C65E] underline" onClick={() => abrir('pedido-envio')}>Del pedido al envío</button></>,
            ]} />
        </Seccion>
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. Carga masiva
// ─────────────────────────────────────────────────────────────────────────────
const CargaMasiva = () => (
    <>
        <Seccion id="idea" titulo="La idea en 30 segundos">
            <P>Necesitás dos cosas: <strong>un Excel</strong> con una fila por producto y <strong>una carpeta con las fotos</strong>. Los soltás juntos en el panel, mirás la vista previa, confirmás. Las fotos van a cada producto <strong>por el nombre del archivo</strong>: si el archivo se llama como el producto, se emparejan solos.</P>
            <P>La plantilla del Excel se descarga desde acá: <Link href="/docs/plantilla-productos.xlsx">plantilla-productos.xlsx</Link>. Tiene tres productos de ejemplo (borralos) y una segunda hoja que explica cada columna.</P>
            <Aviso tipo="dato">Las fotos vienen como las sacaste, con la modelo y su fondo. <strong>No hay que retocarlas ni pasarlas por ningún programa.</strong></Aviso>
            <Aviso tipo="tip">También se lo podés tirar a Lau: clip 📎, elegís el Excel y las fotos juntos, Enter. Te muestra el resumen y confirmás. Es exactamente lo mismo que el paso 3 de esta guía.</Aviso>
        </Seccion>

        <Seccion id="fotos" titulo="1. Las fotos: el archivo se llama como el producto">
            <Figura titulo="Cada archivo va al producto que tiene su mismo nombre. Un archivo con otro nombre queda “suelto” y la vista previa te lo marca.">
                <IlusNombresFotos />
            </Figura>
            <Tabla
                cabecera={['Producto en el Excel', 'Nombre del archivo']}
                filas={[
                    ['Jean Elastizado Oxford', <Cod>jean-elastizado-oxford.jpg</Cod>],
                    ['Campera Ecocuero Chocolate', <Cod>campera-ecocuero-chocolate.jpg</Cod>],
                    ['Top Cola de Ratón Morley', <Cod>top-cola-de-raton-morley.jpg</Cod>],
                ]}
            />
            <P>Da igual si lo escribís con mayúsculas, acentos, guiones, guión bajo o espacios: <Cod>Jean Elastizado Oxford.JPG</Cod>, <Cod>jean_elastizado_oxford.png</Cod> y <Cod>jean-elastizado-oxford.jpg</Cod> son lo mismo.</P>
            <P><strong>Varias fotos del mismo producto:</strong> le agregás un número al final. La <Cod>-1</Cod> es la principal, la que se ve en la grilla de la tienda.</P>
            <div className="grid sm:grid-cols-3 gap-2">
                {['jean-elastizado-oxford-1.jpg', 'jean-elastizado-oxford-2.jpg', 'jean-elastizado-oxford-3.jpg'].map((n, i) => (
                    <div key={n} className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 font-mono text-[13px] text-slate-700 dark:text-slate-200">
                        {n}{i === 0 && <span className="ml-2 text-[10px] font-sans font-black uppercase text-[#B38728] dark:text-[#E8C65E]">principal</span>}
                    </div>
                ))}
            </div>
            <P>Sirven <Cod>.jpg</Cod>, <Cod>.png</Cod> y <Cod>.webp</Cod>.</P>
            <Aviso tipo="tip">
                Si un archivo tiene otro nombre y no lo querés renombrar (<Cod>IMG_2041.jpg</Cod>), ponés ese nombre en la columna <strong>Foto</strong> del Excel. Pero lo más fácil es nombrar bien el archivo y dejar esa columna vacía.
            </Aviso>
        </Seccion>

        <Seccion id="excel" titulo="2. El Excel: una fila por producto">
            <Figura titulo="La plantilla. Sólo Producto y Precio venta son obligatorios para un producto nuevo.">
                <IlusExcel />
            </Figura>
            <Tabla
                cabecera={['Columna', 'Qué va', 'Obligatoria']}
                filas={[
                    [<strong>Producto</strong>, 'El nombre. Es lo que ve la clienta y lo que empareja la foto.', 'Sí'],
                    [<strong>Categoría</strong>, <>Tiene que existir en <Ruta pasos={['Admin', 'CMS / Diseño', 'Categorías']} />, escrita igual.</>, 'No'],
                    [<strong>Precio venta</strong>, <>Lo que paga la clienta. Acepta <Cod>46500</Cod>, <Cod>46.500</Cod> o <Cod>$ 46.500</Cod>.</>, 'Sí, para productos nuevos'],
                    [<strong>Costo</strong>, 'Lo que te costó. Con esto el panel calcula la ganancia.', 'No'],
                    [<strong>Stock</strong>, 'Cuántos tenés. Número entero. Vacío = 0.', 'No'],
                    [<strong>Talles</strong>, <>Separados por coma: <Cod>S, M, L</Cod> o <Cod>36, 38, 40</Cod>. Vacío = S, M.</>, 'No'],
                    [<strong>Colores</strong>, <>Separados por coma: <Cod>negro, chocolate</Cod>.</>, 'No'],
                    [<strong>Estado</strong>, <><Cod>Publicado</Cod> o <Cod>Borrador</Cod>. Vacío = publicado si tiene foto.</>, 'No'],
                    [<strong>Foto</strong>, 'Casi siempre vacía (ver arriba).', 'No'],
                    [<strong>Descripción</strong>, 'Texto libre que ve la clienta.', 'No'],
                ]}
            />
            <Aviso tipo="ojo" titulo="Dos cosas que conviene saber">
                <p><strong>Un producto sin foto entra oculto</strong> (borrador), aunque le pongas “Publicado”. En la tienda no se muestra nada sin imagen. Le subís la foto después desde el panel y lo publicás.</p>
                <p className="mt-2"><strong>El nombre es la llave de todo.</strong> Si más adelante cambiás el nombre en el Excel, el importador va a pensar que es un producto nuevo y lo va a duplicar.</p>
            </Aviso>
        </Seccion>

        <Seccion id="importar" titulo="3. Importar">
            <Figura titulo="Soltar, revisar, confirmar. Hasta que no tocás Confirmar, no se guarda nada.">
                <IlusImportar />
            </Figura>
            <Pasos>
                <Paso>Entrá a <Ruta pasos={['Admin', 'Inventario', '⤴ Importar Excel']} /> (arriba a la derecha, al lado de Exportar).</Paso>
                <Paso>Seleccioná <strong>el Excel y todas las fotos juntos</strong> y soltalos en el recuadro. En Windows: click en el Excel, <K>Ctrl</K> + <K>A</K>, y arrastrás todo. También podés soltar primero el Excel y después las fotos, o tocar <K>Agregar fotos</K>.</Paso>
                <Paso>
                    Aparece la <strong>vista previa</strong>. Ahí ves:
                    <Lista items={[
                        <><strong>Nuevos</strong>: los que se van a crear, cada uno con sus miniaturas y si entra publicado o como borrador.</>,
                        <><strong>Actualizados</strong>: los que ya existían y cambian precio, stock, etc. Te muestra el valor viejo → el nuevo.</>,
                        <><strong>Con foto</strong>: cuántos van con imagen.</>,
                        <><strong>Fotos que no van a ningún producto</strong>: archivos cuyo nombre no coincide con ninguna fila. Casi siempre es un nombre mal escrito. Las renombrás y las volvés a soltar; la vista previa se actualiza sola.</>,
                        <><strong>Con error</strong>: filas que no se van a tocar y por qué (sin nombre, sin precio, nombre repetido).</>,
                    ]} />
                </Paso>
                <Paso>Si está todo bien, <K>Confirmar importación</K>. Sube las fotos y crea los productos; abajo ves el avance. Con 50 productos tarda uno o dos minutos: no cierres la pestaña.</Paso>
            </Pasos>
        </Seccion>

        <Seccion id="despues" titulo="4. Después: cambiar precios o stock">
            <P>No hace falta la carpeta de fotos. <K>⤓ Exportar Excel</K> te baja la planilla con todo lo que hay; cambiás los precios en Excel, la volvés a importar, y en la vista previa ves exactamente qué cambia en cada producto antes de confirmar.</P>
            <Aviso tipo="dato">A un producto que <strong>ya tiene foto no se le pisa</strong>, aunque haya un archivo con su nombre en la carpeta. Si querés cambiarle la foto, se hace desde el producto en Inventario.</Aviso>
        </Seccion>

        <Seccion id="problemas" titulo="Si algo sale mal">
            <Tabla
                cabecera={['Ves', 'Qué pasa', 'Qué hacer']}
                filas={[
                    ['“No pude leer el archivo”', 'No es .xlsx ni .csv, o está roto.', 'Guardalo desde Excel como .xlsx.'],
                    ['Un producto quedó como borrador sin querer', 'No encontró su foto.', 'Mirá “Fotos que no van a ningún producto”: el archivo tiene otro nombre.'],
                    ['“Ya tiene foto: las N del archivo no se tocan”', 'El producto existía y tenía imagen.', 'Es normal. La foto se cambia desde el producto.'],
                    ['“Hay más de un producto con ese nombre”', 'Tenés dos productos iguales en el panel.', 'Borrá o renombrá uno en Inventario y volvé a importar.'],
                    ['“Producto nuevo sin precio”', 'Falta el precio en esa fila.', 'Ponele precio.'],
                    ['Quedó como borrador “porque la foto no se pudo subir”', 'Falló la subida de esa foto (suele ser internet).', 'Subísela desde el producto.'],
                ]}
            />
        </Seccion>
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
// 3. Lau
// ─────────────────────────────────────────────────────────────────────────────
const Lau = ({ abrir }) => (
    <>
        <Seccion id="que-es" titulo="Qué es Lau">
            <P>Lau es el asistente del panel. Le adjuntás la foto, le dictás los datos, y crea el producto. Para <strong>1 a 10 productos</strong> es lo más rápido que hay. Para cargar una colección entera conviene el Excel (<button className="font-bold text-[#8a6a1a] dark:text-[#E8C65E] underline" onClick={() => abrir('carga-masiva')}>esa guía está acá</button>).</P>
            <P>Está en dos lugares: en el menú, <Ruta pasos={['Admin', 'Asistente Lau']} />; y navegando la tienda como admin, el botón dorado flotante <strong>abajo a la izquierda</strong>. Las clientas no lo ven.</P>
        </Seccion>

        <Seccion id="cargar" titulo="Cargar un producto">
            <Figura titulo="Foto + lo que sabés del producto. Lo que falta, Lau lo pregunta con botones. Nada se guarda hasta que confirmás.">
                <IlusLau />
            </Figura>
            <Pasos>
                <Paso>Tocá el clip 📎 y elegí la foto (o varias, si son del mismo producto). Arriba del cuadro de texto hay un botón dorado <K>Cargar producto (paso a paso)</K>: hace lo mismo pero te lleva de la mano, pregunta por pregunta. Usá el que te resulte cómodo.</Paso>
                <Paso>
                    Escribí lo que sabés. Puede ser desprolijo, Lau lo entiende:
                    <div className="space-y-2 pt-1">
                        <Mensaje>jean oxford azul, talles 36 38 40 42, tengo 5, sale 46500, publicalo</Mensaje>
                    </div>
                </Paso>
                <Paso>
                    Lo que falte te lo pregunta <strong>de a uno, con botones</strong>: categoría, color, talle, stock, precio. Tocás y seguís.
                    <div className="space-y-2 pt-1">
                        <Mensaje de="lau">Me falta la categoría. ¿Cuál va?</Mensaje>
                        <Botones opciones={['Jeans', 'Pantalones', 'Otra…']} />
                    </div>
                </Paso>
                <Paso>
                    Al final te muestra un resumen y un botón de <strong>confirmar</strong>. Nada se guarda hasta que lo tocás.
                    <div className="space-y-2 pt-1">
                        <Mensaje de="lau">Publicar “Jean Oxford” — $46.500 · Jeans · azul · 36/38/40/42 · stock 5. ¿Confirmás?</Mensaje>
                        <Botones opciones={['✓ Confirmar', 'Cambiar algo']} />
                    </div>
                </Paso>
            </Pasos>
            <Aviso tipo="dato">Si adjuntás varias fotos, primero te pregunta: <strong>¿mismo producto o productos distintos?</strong> Mismo producto = una galería. Distintos = te guía uno por uno.</Aviso>
        </Seccion>

        <Seccion id="planillas" titulo="Tirale una planilla y ella la carga">
            <P>Con el mismo clip 📎 podés adjuntar un <strong>Excel</strong>. Lau lo lee sola, sin inteligencia artificial de por medio, te muestra qué entendió y te pide confirmar:</P>
            <Lista items={[
                <><strong>La plantilla de productos</strong> (con las fotos adjuntas en el mismo mensaje): crea los productos, sube las fotos y los publica. Es lo mismo que <Ruta pasos={['Inventario', 'Importar Excel']} />, pero desde el chat.</>,
                <><strong>Tu planilla de ventas</strong> (una columna por clienta): registra cada clienta como una venta. Podés agregarle texto: <em>“ventas del 5/9 por instagram”</em>, <em>“descontá el stock”</em>, o corregir un nombre: <em>“Ana Mena y Lorena Vivas”</em> (empareja por el primer nombre y usa el completo).</>,
            ]} />
            <Aviso tipo="tip">Para esto no hace falta la llave de Gemini: aunque Lau diga “IA no configurada”, las planillas las lee igual.</Aviso>
        </Seccion>

        <Seccion id="en-vivo" titulo="Stock y ventas en tiempo real">
            <P>Lau ve el inventario y los pedidos <strong>en vivo</strong>: lo que cambia en la tienda, cambia en el chat en el mismo segundo. Y estas preguntas las contesta al instante, con datos exactos, sin pasar por la inteligencia artificial (funcionan aunque no haya llave):</P>
            <Tabla
                cabecera={['Preguntás', 'Te dice']}
                filas={[
                    ['“¿cuánto queda del vestido negro?” / “stock jean oxford” / “¿hay top rib?”', 'Cuántas unidades quedan, precio, y el detalle por talle y color si lo tiene. Con ⚠️ si queda poco y ⛔ si se agotó.'],
                    ['“¿cuántos vestidos quedan?”', 'Si hay varios que coinciden, te lista todos con su stock.'],
                    ['“¿cómo está el stock?” / “¿qué está agotado?” / “¿qué repongo?”', 'El panorama: cuántos productos y unidades, qué se agotó y qué está por agotarse.'],
                    ['“¿qué se vendió hoy?” / “¿cuánto vendí ayer?” / “ventas de la semana” / “este mes” / “últimas ventas”', 'Cada venta con hora, clienta, total, canal y prendas, y el total del período.'],
                ]}
            />
            <P>Además, mientras tengas a Lau abierta, <strong>te avisa sola</strong>:</P>
            <Mensaje de="lau">{'🛍️ ¡Venta nueva! Carla Pérez · $45.000 · Tienda web · pagado\n• Vestido Negro Largo (talle M) → ⚠️ quedan 2\nCuando lo despaches, en Pedidos tenés "Copiar datos para MiCorreo".'}</Mensaje>
            <Mensaje de="lau">{'⛔ Campera Puffer se agotó (tenías 1). Reponer o sacarlo de la tienda.'}</Mensaje>
            <P>Y al volver a abrirla te cuenta lo que entró mientras no estabas. Si querés enterarte aunque el panel esté cerrado, el navegador también manda una notificación por cada pedido (la primera vez te pide permiso).</P>
        </Seccion>

        <Seccion id="frases" titulo="Frases que entiende">
            <Tabla
                cabecera={['Decís', 'Hace']}
                filas={[
                    ['“publicalo” / “subilo” / “ponelo”', 'Lo crea visible en la tienda.'],
                    ['“guardalo” / “borrador”', 'Lo crea oculto.'],
                    ['“tengo 5” / “hay 5” / “quedan 5”', 'Stock 5.'],
                    ['“me costó 24000”', 'Te arma el precio: pregunta el margen con botones (5%, 10%…), suma packaging y flete, y calcula con la comisión de Mercado Pago.'],
                    ['“generá una descripción”', 'Escribe él la descripción.'],
                    ['“todos negros” / “es negro”', 'Color negro.'],
                ]}
            />
            <P>Y en un solo mensaje podés mandar todo junto: <em>“publicalo, stock 5, y generá la descripción”</em>.</P>
        </Seccion>

        <Seccion id="no-hace" titulo="Lo que Lau NO hace, a propósito">
            <Aviso tipo="ojo" titulo="No adivina nada de la foto">
                No deduce qué prenda es, ni el color, ni nada. <strong>Vos se lo decís.</strong> Está hecho así para que nunca publique un “jean azul” que era una campera negra. Si te parece que “debería darse cuenta”: no, es una decisión, no una falla.
            </Aviso>
        </Seccion>

        <Seccion id="otras" titulo="Otras cosas que le podés pedir">
            <Lista items={[
                <><strong>Editar:</strong> “cambiale el precio al jean oxford a 48000”, “ponele stock 3 al top rib talle M”.</>,
                <><strong>Ventas por fuera:</strong> “vendí 2 jeans por WhatsApp a 46500” → descuenta stock y lo suma a las estadísticas. Te pregunta el canal con botones.</>,
                <><strong>Gastos:</strong> “gasté 20000 en packaging” → lo resta de la ganancia.</>,
                <><strong>Ofertas:</strong> “poné 15% off en camperas el finde”.</>,
                <><strong>Resumen:</strong> “cómo va el negocio”, “qué repongo”.</>,
            ]} />
            <P>Todo lo que cambia algo en la tienda <strong>te pide confirmación</strong> antes. Y no borra en masa: si le decís “borrá todo”, te va a pedir que confirmes uno por uno. También es a propósito.</P>
        </Seccion>

        <Seccion id="no-responde" titulo="Si no responde">
            <Lista items={[
                <>Falta o venció la llave de Gemini. Es la causa el 90% de las veces → <button className="font-bold text-[#8a6a1a] dark:text-[#E8C65E] underline" onClick={() => abrir('ia-keys')}>guía de las llaves</button>.</>,
                <>Si dice que fallaron “todos los modelos”, puede ser la cuota gratis de Google del día. Esperá una hora, o activá facturación en AI Studio (son centavos por producto).</>,
            ]} />
        </Seccion>
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
// 4. Ventas por fuera
// ─────────────────────────────────────────────────────────────────────────────
const VentasFuera = ({ abrir }) => (
    <>
        <Seccion id="por-que" titulo="Por qué anotarlas en la tienda">
            <P>Lo que vendés por WhatsApp, en el local o en una feria no pasa por el checkout, pero conviene que quede en el panel: así <strong>Ventas</strong> y el <strong>Dashboard</strong> muestran lo que vendiste de verdad, y el stock no miente. Cada venta queda como un pedido <Cod>MAN-…</Cod> en Pedidos, igual que uno de la tienda.</P>
            <P>Hay tres formas: de a una hablándole a Lau, o muchas de golpe con tu planilla: se la adjuntás a Lau con el clip 📎 (lo más fácil), o la soltás en Admin → Ventas.</P>
        </Seccion>

        <Seccion id="lau" titulo="De a una: decíselo a Lau">
            <Mensaje>vendí un short sastrero talle 5 chocolate a 13500 por WhatsApp, a Lorena</Mensaje>
            <P>Lau descuenta el stock, lo anota en Ventas y te confirma. Sirve cuando el producto <strong>está en el inventario</strong>. Más en la <button className="font-bold text-[#8a6a1a] dark:text-[#E8C65E] underline" onClick={() => abrir('lau')}>guía de Lau</button>.</P>
        </Seccion>

        <Seccion id="planilla" titulo="Muchas de golpe: tu planilla, tal cual la armás">
            <Figura titulo="El formato que ya usás. Una columna por clienta; cada prenda son cuatro líneas y una línea en blanco entre prenda y prenda.">
                <IlusPlanillaVentas />
            </Figura>
            <Lista items={[
                <><strong>Arriba, el nombre de la clienta.</strong> Una columna por clienta.</>,
                <><strong>Cada prenda, cuatro líneas:</strong> el nombre, <Cod>TALLE …</Cod>, el color, <Cod>PRECIO $ …</Cod>. Y una línea en blanco antes de la siguiente.</>,
                <><strong>Al final:</strong> <Cod>TOTAL $ …</Cod> y <Cod>PAGADO</Cod> (o <Cod>DEBE</Cod> si quedó pendiente).</>,
                <>Si vendiste dos iguales, agregá una línea <Cod>CANTIDAD 2</Cod> antes del precio.</>,
                <>Los precios pueden ir <Cod>13,501</Cod> o <Cod>13.501</Cod>: los dos se leen como trece mil quinientos uno.</>,
            ]} />
            <Aviso tipo="tip">Poné el mes en el nombre del archivo (<Cod>WAKANDA 09-26.xlsx</Cod>) y la fecha de la venta se completa sola. Si no, la elegís al importar.</Aviso>
        </Seccion>

        <Seccion id="importar" titulo="Importar la planilla">
            <P><strong>Por Lau:</strong> abrí el chat, tocá el clip 📎, elegí el Excel, Enter. Te muestra las clientas y los totales y te pide confirmar. Si querés otra fecha o canal, escribilo junto: <em>“ventas del 5/9 en el local”</em>.</P>
            <P><strong>Por el panel</strong>, que es lo mismo con más botones:</P>
            <Pasos>
                <Paso>Entrá a <Ruta pasos={['Admin', 'Ventas', '⤴ Importar ventas']} />.</Paso>
                <Paso>Soltá el Excel. Aparece la <strong>vista previa</strong>: una tarjeta por clienta con sus prendas y el total, y arriba cuántas clientas, cuántas prendas y cuánto suma.</Paso>
                <Paso>Revisá la <strong>fecha</strong> y el <strong>canal</strong> (WhatsApp, Local, Feria…). Si las prendas están cargadas en el inventario con el mismo nombre, podés tildar <K>Descontar stock</K>.</Paso>
                <Paso><K>Registrar ventas</K>. Listo: ya figuran en Ventas y en el Dashboard.</Paso>
            </Pasos>
            <Aviso tipo="dato">Si volvés a soltar la misma planilla con la misma fecha, <strong>no se duplica</strong>: te avisa que esas ventas ya estaban.</Aviso>
        </Seccion>
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
// 4. Del pedido al envío (MiCorreo, retiro a domicilio)
// ─────────────────────────────────────────────────────────────────────────────
const PedidoEnvio = ({ abrir }) => (
    <>
        <Seccion id="resumen" titulo="Cómo funciona, de punta a punta">
            <P>Los pedidos se despachan <strong>sin llevar nada a la sucursal</strong>: el Correo pasa a buscar los paquetes por tu domicilio. Se usa <strong>MiCorreo</strong>, la plataforma de Correo Argentino para pymes: gratis, sin contrato y sin volumen mínimo.</P>
            <Figura titulo="Un pedido, de punta a punta. Los pasos 2, 3, 4 y 6 son tuyos; el 5 lo hace el Correo y el email final sale solo.">
                <IlusFlujoPedido />
            </Figura>
            <Aviso tipo="ojo" titulo="Vas a necesitar una impresora">
                La etiqueta del envío se imprime y se pega en el paquete. <strong>Sin etiqueta impresa no lo aceptan.</strong> Cualquier impresora común sirve, en hoja A4.
            </Aviso>
        </Seccion>

        <Seccion id="cuenta" titulo="1. Abrir la cuenta en MiCorreo (una sola vez)">
            <Pasos>
                <Paso>Entrá a <Link href="https://micorreo.correoargentino.com.ar">micorreo.correoargentino.com.ar</Link> → <K>Registrate</K>.</Paso>
                <Paso>Te pide: nombre y apellido, <strong>CUIT</strong> (por ser negocio), teléfono, email, contraseña, y la dirección de Rafaela con código postal <Cod>2300</Cod>.</Paso>
                <Paso>Te llega un email para validar la cuenta. <strong>Revisá spam</strong> si no aparece.</Paso>
            </Pasos>
        </Seccion>

        <Seccion id="retiro" titulo="2. Pedir que pasen a buscar (una sola vez)">
            <Pasos>
                <Paso><Ruta pasos={['MiCorreo', 'Mi perfil', 'Domicilios']} /> → cargá la dirección exacta desde donde salen los paquetes y la franja que preferís: <strong>mañana o tarde</strong>.</Paso>
                <Paso>La sucursal revisa si tu dirección está dentro de la zona de retiro y te avisa. <strong>Este es el dato clave</strong>: si te cubren, listo para siempre. Si no, avisá para ver Andreani u OCA, que también están en Rafaela.</Paso>
                <Paso>Pasan de <strong>lunes a sábado</strong> (sábado sólo a la mañana).</Paso>
            </Pasos>
            <P><strong>Cuánto cuesta el retiro:</strong> $11.200 cada vez que pasan (IVA incluido). <strong>No es por paquete, es por visita.</strong> Con 10 a 14 paquetes en la misma visita tiene 40% de descuento; con 15 o más, es gratis.</P>
            <Figura titulo="Por eso conviene juntar. En vez de pedir retiro por cada venta, elegís dos días fijos (martes y viernes, por ejemplo) y se llevan todo lo vendido.">
                <IlusRetiroCosto />
            </Figura>
        </Seccion>

        <Seccion id="pedido" titulo="3. Cada vez que entra un pedido">
            <P>Del panel, <Ruta pasos={['Admin', 'Pedidos']} />, en el pedido tocá <K>Datos y envío</K>: se despliega todo lo que necesitás (qué va, DNI, teléfono, dirección completa, y si eligió <strong>a domicilio</strong> o <strong>retiro en sucursal</strong>). El botón <K>Copiar datos para MiCorreo</K> te deja el bloque listo para pegar. Después, en MiCorreo:</P>
            <Pasos>
                <Paso>
                    <K>Nuevo envío</K>. Tres partes:
                    <Lista items={[
                        <><strong>Origen:</strong> tus datos. Quedan guardados desde la primera vez.</>,
                        <><strong>Destino:</strong> los datos de la clienta, tal cual los copiaste del panel, y si va a domicilio o a sucursal.</>,
                        <><strong>Paquete:</strong> medidas, peso y contenido. Una prenda en bolsa o caja chica: alrededor de 30 × 25 × 5 cm y 0,5 a 1 kg.</>,
                    ]} />
                </Paso>
                <Paso><K>Guardar envío</K> → pagar. Con tarjeta o Mercado Pago, por envío o cargando saldo. Al pagar te da el <strong>número de seguimiento</strong> al instante.</Paso>
                <Paso><strong>Imprimí la etiqueta y pegala prolija</strong> en el paquete. La caja o bolsa la ponés vos; el Correo sólo da la etiqueta.</Paso>
                <Paso>Dejá el paquete listo para el próximo retiro.</Paso>
            </Pasos>
            <Figura titulo="La etiqueta la da MiCorreo al pagar. Va impresa, en el frente del paquete.">
                <IlusEtiqueta />
            </Figura>
            <Aviso tipo="tip">
                Si tenés varios pedidos, la pestaña <K>Masivo</K> de MiCorreo deja cargarlos todos de una con un archivo .csv, en vez de uno por uno.
            </Aviso>
            <Aviso tipo="dato">El envío queda 30 días esperando el retiro; pasado eso se cancela solo.</Aviso>
        </Seccion>

        <Seccion id="avisar" titulo="4. Avisarle a la clienta: es automático">
            <Pasos>
                <Paso>Volvé al panel: <Ruta pasos={['Admin', 'Pedidos']} />, buscá el pedido y tocá <K>Marcar Enviado</K>.</Paso>
                <Paso>Te pide el número de seguimiento: pegalo.</Paso>
                <Paso>Listo. <strong>A la clienta le llega solo un email</strong> con el número para rastrear el paquete. No hay que escribirle.</Paso>
            </Pasos>
        </Seccion>

        <Seccion id="numeros" titulo="Ojo con los números">
            <Lista items={[
                <>El envío se cobra en la tienda <strong>{$(TARIFAS_DE_LA_CASA.correo_domicilio.cost)} a domicilio / {$(TARIFAS_DE_LA_CASA.sucursal.cost)} a sucursal</strong>. El Correo cobra hoy hasta {$(COSTO_REAL_CORREO_1KG.domicilio)} / {$(COSTO_REAL_CORREO_1KG.sucursal)}. Va bien, pero <strong>el retiro no está incluido</strong>: si lo usás seguido, subí el precio en la tienda. Cómo, en la <button className="font-bold text-[#8a6a1a] dark:text-[#E8C65E] underline" onClick={() => abrir('tarifas')}>guía de tarifas</button>.</>,
                <>Correo Argentino <strong>aumenta cada dos o tres meses</strong>. Cuando pagues un envío y veas que subió, actualizá los precios en la tienda.</>,
            ]} />
            <P className="text-xs">Fuente: preguntas frecuentes de MiCorreo, <Link href="https://www.correoargentino.com.ar/MiCorreo/public/faqs">correoargentino.com.ar/MiCorreo/public/faqs</Link>.</P>
        </Seccion>
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
// 5. Tarifas de envío
// ─────────────────────────────────────────────────────────────────────────────
const Tarifas = () => (
    <>
        <Seccion id="como" titulo="Cómo se cobra el envío hoy">
            <P>La clienta paga el envío junto con la compra. Hoy el precio es <strong>fijo para todo el país</strong> y ella elige entre dos opciones en el checkout:</P>
            <Tabla
                cabecera={['Opción', 'Lo que paga la clienta', 'Demora', 'Lo que cobra el Correo (1 kg, zona más cara)']}
                filas={[
                    [<strong>{TARIFAS_DE_LA_CASA.correo_domicilio.name}</strong>, <strong>{$(TARIFAS_DE_LA_CASA.correo_domicilio.cost)}</strong>, TARIFAS_DE_LA_CASA.correo_domicilio.time, $(COSTO_REAL_CORREO_1KG.domicilio)],
                    [<strong>{TARIFAS_DE_LA_CASA.sucursal.name}</strong>, <strong>{$(TARIFAS_DE_LA_CASA.sucursal.cost)}</strong>, TARIFAS_DE_LA_CASA.sucursal.time, $(COSTO_REAL_CORREO_1KG.sucursal)],
                ]}
            />
            <P>Estos números son los de septiembre de 2026 y son el <strong>respaldo</strong>: si no cargás nada en el panel, la tienda cobra esto. Lo que cargues en el panel manda.</P>
        </Seccion>

        <Seccion id="cambiar" titulo="Cambiar el precio">
            <Pasos>
                <Paso>Entrá a <Ruta pasos={['Admin', 'Configuración', 'Envíos']} />.</Paso>
                <Paso>Cada opción tiene <strong>nombre, precio y demora</strong>. Cambiá el precio y tocá <K>Guardar</K>.</Paso>
                <Paso>Listo, se aplica al instante: no hay que publicar nada.</Paso>
            </Pasos>
            <Aviso tipo="dato">Una opción <strong>sin nombre o sin precio no se guarda</strong> y no llega al checkout. Es a propósito: una vez quedó una opción en blanco y la tienda regaló el envío sin que nadie se diera cuenta.</Aviso>
        </Seccion>

        <Seccion id="cuando" titulo="Cuándo subirlo">
            <Lista items={[
                <><strong>Cuando el Correo aumenta.</strong> Pasa cada dos o tres meses. Lo notás al pagar un envío en MiCorreo: si te cobran más de lo que cobra la tienda, subí el precio.</>,
                <><strong>Si usás el retiro a domicilio seguido.</strong> El retiro sale $11.200 por visita y no está incluido en el precio. Con 5 paquetes por visita son $2.240 por paquete: con <strong>$13.000 a domicilio</strong> lo cubrís. Con 15 paquetes por visita el retiro es gratis y no hace falta.</>,
            ]} />
            <Aviso tipo="tip">Redondeá para arriba. $10.900 se lee mejor que $10.586, y los $300 de diferencia absorben el próximo aumento sin que tengas que tocar nada.</Aviso>
        </Seccion>

        <Seccion id="automatico" titulo="Más adelante: precio automático por destino">
            <P>Hoy la que vive en Rafaela paga lo mismo que la que vive en Ushuaia. Para que el precio se calcule solo según el código postal de la clienta hace falta conectar la tienda a <strong>Zipnova</strong>. Es un trámite aparte, no hace falta para vender, y tiene su propia guía en esta misma sección.</P>
        </Seccion>
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
// 6. Zipnova
// ─────────────────────────────────────────────────────────────────────────────
const Zipnova = () => (
    <>
        <Seccion id="que" titulo="Qué es esto y para qué sirve">
            <P>Hoy el envío se cobra con un precio fijo para todo el país. Queremos que se calcule <strong>solo, según a dónde va el paquete</strong>. Para eso se usa <strong>Zipnova</strong> (antes Zippin): una plataforma que junta más de 40 transportes (Correo Argentino, Andreani, OCA y más) en una sola cuenta. La tienda le pregunta “¿cuánto sale mandar 1 kg al código postal X?” y Zipnova contesta con el precio real. La clienta paga eso, y cuando la compra se confirma, el envío se genera solo.</P>
            <Aviso tipo="dato" titulo="Por qué Zipnova y no otro">
                Se evaluó Envíopack, que es parecido, pero exige que la dirección de despacho esté en Buenos Aires (textual: <em>“La dirección de despacho tiene que ser en AMBA”</em>). Rafaela queda afuera. La API de Correo Argentino directo no cotiza y pide acuerdo comercial. Zipnova tiene <strong>plan gratis</strong>, cobertura nacional y API.
            </Aviso>
            <Aviso tipo="tip">
                <strong>No hace falta para vender ni para que pasen a buscar los paquetes.</strong> Eso ya funciona con MiCorreo. Esto es una mejora para cuando la tienda mueva volumen.
            </Aviso>
        </Seccion>

        <Seccion id="tener" titulo="Qué tener a mano antes de empezar">
            <Tabla
                cabecera={['Dato', 'Para qué']}
                filas={[
                    [<strong>CUIT o CUIL</strong> , 'La cuenta va a nombre de quien factura.'],
                    [<strong>DNI</strong>, 'Pueden pedir foto o número.'],
                    [<strong>Email</strong> , 'El de la tienda. Es el usuario de la cuenta.'],
                    [<strong>Teléfono</strong>, 'Para coordinar retiros.'],
                    [<strong>Dirección completa en Rafaela</strong>, 'Calle, número, piso, código postal 2300. De acá sale el cálculo del precio.'],
                    [<strong>Nombre del negocio</strong>, 'La Boutique de la Elegancia.'],
                ]}
            />
            <P>Tiempo estimado: <strong>20 a 30 minutos</strong>, más lo que tarde Zipnova en aprobar la cuenta si pide validación.</P>
        </Seccion>

        <Seccion id="cuenta" titulo="Paso 1 — Crear la cuenta">
            <Pasos>
                <Paso>Entrá a <Link href="https://app.zipnova.com.ar/register">app.zipnova.com.ar/register</Link>.</Paso>
                <Paso>Completá email, contraseña y los datos del negocio.</Paso>
                <Paso>Si ofrece elegir plan, elegí <strong>Starter (gratis)</strong>. Si aparece una prueba gratis del plan Pro, se puede aceptar, pero <strong>no cargar tarjeta</strong> para eso.</Paso>
                <Paso>Confirmá el email si te manda un correo de verificación.</Paso>
            </Pasos>
        </Seccion>

        <Seccion id="config" titulo="Paso 2 — Configurar la cuenta">
            <P>Al entrar por primera vez suele aparecer una guía de configuración inicial. Si no, está en <K>Configuración</K>. Hay que completar:</P>
            <Lista items={[
                <><strong>Dirección de origen:</strong> la de Rafaela desde donde salen los paquetes, completa y exacta, con código postal 2300.</>,
                <><strong>Cómo se despachan:</strong> elegí <strong>Despacho en sucursal</strong> para empezar (funciona desde el día uno). La <strong>Colecta</strong> (pasan a buscar) Zipnova la habilita con un mínimo de envíos mensuales; se pide después (Paso 5).</>,
                <><strong>Servicios a ofrecer:</strong> tildá al menos <strong>Envío a domicilio</strong> y <strong>Envío a sucursal</strong>, que son las dos opciones que ya muestra la tienda.</>,
            ]} />
        </Seccion>

        <Seccion id="saldo" titulo="Paso 3 — Cargar saldo">
            <P>Zipnova funciona con <strong>saldo prepago</strong>: se carga plata y de ahí se descuenta cada envío. <strong>No es un costo extra</strong>: la clienta paga el envío en la tienda, y ese dinero cubre lo que Zipnova descuenta.</P>
            <Pasos>
                <Paso>Menú <K>Crédito</K> (o “Saldo”).</Paso>
                <Paso>Para arrancar, con <strong>$50.000</strong> alcanza para unos 5 envíos y ver que todo funcione.</Paso>
                <Paso>Medio de pago: <strong>Mercado Pago</strong> (al momento, con una comisión chica) o <strong>transferencia</strong> (sin comisión, pero hay que mandar el comprobante y esperar).</Paso>
            </Pasos>
        </Seccion>

        <Seccion id="claves" titulo="Paso 4 — Sacar las credenciales de la API (lo más importante)">
            <P>Esto es lo que conecta la tienda con Zipnova. Son dos claves.</P>
            <Pasos>
                <Paso>En el panel de Zipnova, <Ruta pasos={['Configuración', 'Integraciones']} /> (puede llamarse “API”, “Integraciones personalizadas” o “Credenciales”).</Paso>
                <Paso>Buscá la opción de <strong>integración propia / API</strong> (no Shopify ni Tiendanube: la tienda es propia).</Paso>
                <Paso>Muestra dos valores, con nombres tipo <strong>API Key</strong> y <strong>Secret</strong>. <strong>Copiá los dos.</strong></Paso>
                <Paso>Si dice que la API no está incluida en el plan gratis, <strong>frená y avisá</strong> antes de contratar nada.</Paso>
            </Pasos>
            <Figura titulo="Las claves van al servidor de la tienda (Vercel), nunca al código ni a un chat.">
                <IlusClaves />
            </Figura>
            <Aviso tipo="ojo">
                <strong>Estas claves son como la contraseña de la cuenta.</strong> No las mandes por un grupo de WhatsApp ni las dejes en un mensaje a la vista. Pasáselas al dueño por un canal privado, o mejor: pegalas directo donde van (Paso 6).
            </Aviso>
        </Seccion>

        <Seccion id="colecta" titulo="Paso 5 — Pedir la colecta (opcional, se puede hacer después)">
            <Pasos>
                <Paso><Ruta pasos={['Configuración', 'Modalidad de despacho', 'Colecta', 'Solicitar']} />.</Paso>
                <Paso>Zipnova responde en 24-48 h hábiles y confirma si llega a Rafaela y con qué transporte. Su ayuda no lo detalla por ciudad, así que hay que preguntar.</Paso>
                <Paso>Si lo aprueban, se eligen los días y horarios en que pasan.</Paso>
            </Pasos>
        </Seccion>

        <Seccion id="vercel" titulo="Paso 6 — Cargar las claves en Vercel">
            <Pasos>
                <Paso>Entrá a <Link href="https://vercel.com">vercel.com</Link> con la cuenta del proyecto <em>tienda-boutique-elegancia</em>.</Paso>
                <Paso><Ruta pasos={['Settings', 'Environment Variables', 'Add']} />: <Cod>ZIPNOVA_API_KEY</Cod> → la API Key, y <Cod>ZIPNOVA_SECRET</Cod> → el Secret.</Paso>
                <Paso>Guardar y <strong>Redeploy</strong>: <Ruta pasos={['Deployments', '⋯ del último', 'Redeploy']} />. Sin el redeploy las variables no se aplican.</Paso>
            </Pasos>
            <P>Con las claves cargadas, quien programa la tienda hace el resto: la cotización automática en el checkout (con el precio fijo de hoy como respaldo si Zipnova no responde) y la creación automática del envío al confirmar el pago. El dueño no toca nada de eso.</P>
        </Seccion>

        <Seccion id="checklist" titulo="Checklist">
            <Lista items={[
                'Cuenta creada en app.zipnova.com.ar, plan Starter',
                'Dirección de origen en Rafaela cargada, CP 2300',
                'Modalidad: despacho en sucursal',
                'Servicios: a domicilio y a sucursal',
                'Saldo cargado',
                'API Key y Secret copiadas',
                'Claves cargadas en Vercel y redeploy hecho',
                '(Opcional) Colecta solicitada',
            ]} />
            <P className="text-xs">Fuentes: <Link href="https://www.zipnova.com/zipnova-envios/precios-zipnova-envios-ar/">planes de Zipnova</Link> · <Link href="https://docs.zipnova.com/">documentación de la API</Link> · <Link href="https://ayuda.enviopack.com/hc/es-419/articles/360054122951-Configura-tu-cuenta">por qué se descartó Envíopack</Link>.</P>
        </Seccion>
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
// 7. Llaves de IA
// ─────────────────────────────────────────────────────────────────────────────
const IaKeys = () => (
    <>
        <Seccion id="para-que" titulo="Para qué es esto">
            <P>Lau, las descripciones automáticas y el asistente de las clientas funcionan con <strong>Gemini</strong>, la inteligencia artificial de Google. Google la deja usar con una <strong>llave</strong> (una clave larga). Sin llave, Lau no contesta.</P>
            <Aviso tipo="ojo" titulo="Hay que hacer una llave nueva">
                La llave anterior estuvo <strong>expuesta</strong> un tiempo (cualquiera podía leerla) y hay que descartarla. Ya está cerrado el agujero, pero la llave vieja sigue valiendo hasta que la borres.
            </Aviso>
        </Seccion>

        <Seccion id="crear" titulo="Crear la llave nueva y cargarla (5 minutos)">
            <Pasos>
                <Paso>Entrá a <Link href="https://aistudio.google.com/apikey">aistudio.google.com/apikey</Link> con la cuenta de Google de la tienda.</Paso>
                <Paso>Tocá <K>Create API key</K>. Te muestra una clave que empieza con <Cod>AQ.</Cod> (las nuevas) o <Cod>AIzaSy</Cod> (las viejas). Copiala.</Paso>
                <Paso>En la tienda: <Ruta pasos={['Admin', 'Configuración', 'Inteligencia Artificial']} /> → pegala en <strong>“Llaves Administrador (Lau, copy, visión)”</strong> → <K>Guardar Keys</K>.</Paso>
                <Paso>Volvé a AI Studio y <strong>borrá la llave vieja</strong> (el tachito al lado de cada una).</Paso>
            </Pasos>
            <Aviso tipo="tip">Podés pegar <strong>varias llaves, una por línea</strong>. Si una se queda sin cuota en el día, la tienda pasa sola a la siguiente.</Aviso>
        </Seccion>

        <Seccion id="cuota" titulo="Si Lau dice que fallaron “todos los modelos”">
            <P>Casi siempre es la <strong>cuota gratis</strong> de Google del día: se agotó. Dos salidas:</P>
            <Lista items={[
                'Esperar. Se renueva sola.',
                <>Activar facturación en AI Studio. Es barato (centavos por producto cargado) y la cuota deja de ser un problema.</>,
            ]} />
        </Seccion>

        <Seccion id="cerebras" titulo="La otra llave: Cerebras">
            <P>En la misma pantalla hay un campo para <strong>Cerebras</strong>, que se usa como segundo motor. También estuvo expuesta: entrá a <Link href="https://cloud.cerebras.ai">cloud.cerebras.ai</Link>, hacé una nueva, pegala y borrá la vieja. Mismo procedimiento.</P>
        </Seccion>
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
// 8. Abrir la tienda
// ─────────────────────────────────────────────────────────────────────────────
const Abrir = ({ abrir }) => (
    <>
        <Seccion id="estado" titulo="Qué ya está listo">
            <P>La tienda <strong>ya puede vender</strong>: los pagos entran por Mercado Pago, los pedidos aparecen en el panel, el envío lo paga la clienta y los emails salen solos. Está en <strong>modo mantenimiento</strong> (la gente ve “EN RENOVACIÓN”) sólo porque falta cargar los productos y hacer la prueba de abajo.</P>
        </Seccion>

        <Seccion id="antes" titulo="Antes de abrir, en orden">
            <Pasos>
                <Paso><strong>Llaves nuevas de IA.</strong> 5 minutos → <button className="font-bold text-[#8a6a1a] dark:text-[#E8C65E] underline" onClick={() => abrir('ia-keys')}>guía</button>.</Paso>
                <Paso><strong>Cargar los productos</strong> con foto → <button className="font-bold text-[#8a6a1a] dark:text-[#E8C65E] underline" onClick={() => abrir('carga-masiva')}>con Excel</button> o <button className="font-bold text-[#8a6a1a] dark:text-[#E8C65E] underline" onClick={() => abrir('lau')}>con Lau</button>. Un producto sin foto no se muestra.</Paso>
                <Paso><strong>Cuenta en MiCorreo y pedir el retiro</strong>, para saber si cubren tu dirección → <button className="font-bold text-[#8a6a1a] dark:text-[#E8C65E] underline" onClick={() => abrir('pedido-envio')}>guía</button>.</Paso>
                <Paso><strong>Una compra real de prueba</strong> (abajo).</Paso>
                <Paso><strong>Sacar el mantenimiento:</strong> <Ruta pasos={['Admin', 'Dashboard']} /> → el interruptor de <K>Mantenimiento</K>. Se apaga al instante, no hay que publicar nada.</Paso>
            </Pasos>
        </Seccion>

        <Seccion id="prueba" titulo="La compra de prueba">
            <P>Es la única forma de saber que la cadena completa funciona. Se hace con la tienda todavía en mantenimiento, entrando con el enlace de prueba que tiene el dueño.</P>
            <Pasos>
                <Paso>Ponele a un producto un precio bajo (por ejemplo $500) y publicalo.</Paso>
                <Paso>Desde otro navegador o el celular, comprálo como si fueras clienta: elegí envío a domicilio, pagá con Mercado Pago de verdad.</Paso>
                <Paso>
                    Comprobá las cuatro cosas:
                    <Lista items={[
                        <>Te llegó el <strong>email de confirmación</strong> como clienta.</>,
                        <>El pedido aparece en <Ruta pasos={['Admin', 'Pedidos']} /> con la dirección y el envío que elegiste.</>,
                        <>En unos minutos el pedido pasa a <strong>pagado</strong> solo (es Mercado Pago avisándole a la tienda).</>,
                        <>Tocá <K>Marcar Enviado</K> con un número inventado y fijate que llegue el <strong>email de seguimiento</strong>.</>,
                    ]} />
                </Paso>
                <Paso>Volvé a ponerle el precio real al producto. La plata de la prueba queda en tu Mercado Pago.</Paso>
            </Pasos>
            <Aviso tipo="dato">Si alguna de las cuatro no pasa, no abras: anotá cuál falló y avisá. Es mucho más fácil de arreglar antes que con clientas de verdad.</Aviso>
        </Seccion>

        <Seccion id="dia-a-dia" titulo="El día a día, una vez abierta">
            <Tabla
                cabecera={['Cuándo', 'Qué', 'Dónde']}
                filas={[
                    ['Entra un pedido', 'Crear el envío, imprimir la etiqueta, dejarlo listo', 'MiCorreo'],
                    ['Martes y viernes', 'Pasan a buscar los paquetes juntos', 'Tu casa'],
                    ['Al despachar', 'Marcar enviado con el seguimiento', 'Admin → Pedidos'],
                    ['Cuando aumenta el Correo', 'Subir el precio del envío', 'Admin → Configuración → Envíos'],
                    ['Cuando llega mercadería', 'Cargar los productos con foto', 'Admin → Inventario o Lau'],
                    ['Cuando se agota algo', 'Lau avisa en el Dashboard: “stock bajo”', 'Admin → Dashboard'],
                ]}
            />
        </Seccion>
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
// Índice
// ─────────────────────────────────────────────────────────────────────────────
export const GUIAS = [
    {
        id: 'empezar', titulo: 'Entrar al panel y moverse', icono: LogIn, duracion: '3 min', para: 'Los dos',
        resumen: 'Cómo entrar con la cuenta de la tienda, qué hay en cada menú y cuál guía seguir después.',
        palabras: ['login', 'entrar', 'google', 'cuenta', 'menu', 'mantenimiento', 'renovacion', 'buscador'],
        secciones: [['entrar', 'Entrar'], ['menu', 'El menú'], ['buscador', 'Buscador rápido'], ['siguiente', 'Qué guía sigo']],
        Contenido: Empezar,
    },
    {
        id: 'carga-masiva', titulo: 'Cargar productos con Excel y fotos', icono: FileSpreadsheet, duracion: '10 min', para: 'Quien carga productos',
        resumen: 'Una planilla con una fila por producto y una carpeta de fotos que se emparejan por el nombre del archivo. Todo junto, en un solo paso.',
        palabras: ['excel', 'importar', 'exportar', 'planilla', 'plantilla', 'fotos', 'masivo', 'csv', 'xlsx', 'precio', 'stock', 'borrador'],
        secciones: [['idea', 'La idea'], ['fotos', '1. Las fotos'], ['excel', '2. El Excel'], ['importar', '3. Importar'], ['despues', '4. Cambiar precios'], ['problemas', 'Si algo sale mal']],
        Contenido: CargaMasiva,
    },
    {
        id: 'lau', titulo: 'Cargar productos hablándole a Lau', icono: Bot, duracion: '5 min', para: 'Quien carga productos',
        resumen: 'Le adjuntás la foto, le dictás los datos y crea el producto. Lo que falta lo pregunta con botones.',
        palabras: ['lau', 'asistente', 'chat', 'ia', 'inteligencia artificial', 'foto', 'publicar', 'descripcion', 'ventas por fuera', 'gastos', 'stock', 'tiempo real', 'en vivo', 'cuanto queda', 'que se vendio'],
        secciones: [['que-es', 'Qué es Lau'], ['cargar', 'Cargar un producto'], ['planillas', 'Tirale una planilla'], ['en-vivo', 'Stock y ventas en vivo'], ['frases', 'Frases que entiende'], ['no-hace', 'Lo que no hace'], ['otras', 'Otras cosas'], ['no-responde', 'Si no responde']],
        Contenido: Lau,
    },
    {
        id: 'ventas-fuera', titulo: 'Anotar las ventas de WhatsApp y del local', icono: Receipt, duracion: '5 min', para: 'Dueño',
        resumen: 'Las ventas por fuera de la tienda también cuentan: de a una con Lau, o soltando tu planilla en Admin → Ventas.',
        palabras: ['ventas', 'planilla', 'excel', 'whatsapp', 'local', 'feria', 'importar ventas', 'pagado', 'clienta', 'wakanda'],
        secciones: [['por-que', 'Por qué anotarlas'], ['lau', 'De a una: Lau'], ['planilla', 'Tu planilla'], ['importar', 'Importar']],
        Contenido: VentasFuera,
    },
    {
        id: 'pedido-envio', titulo: 'Del pedido al envío: que pasen a buscar', icono: PackageCheck, duracion: '15 min', para: 'Dueño',
        resumen: 'MiCorreo (Correo Argentino): abrir la cuenta, pedir el retiro a domicilio, crear el envío, imprimir la etiqueta y avisarle a la clienta sin escribir nada.',
        palabras: ['correo', 'micorreo', 'envio', 'etiqueta', 'retiro', 'colecta', 'paquete', 'seguimiento', 'tracking', 'pedidos', 'impresora', 'domicilio', 'sucursal'],
        secciones: [['resumen', 'Cómo funciona'], ['cuenta', '1. Abrir la cuenta'], ['retiro', '2. Pedir el retiro'], ['pedido', '3. Cada pedido'], ['avisar', '4. Avisar a la clienta'], ['numeros', 'Ojo con los números']],
        Contenido: PedidoEnvio,
    },
    {
        id: 'tarifas', titulo: 'Cuánto cobra la tienda por el envío', icono: Truck, duracion: '3 min', para: 'Dueño',
        resumen: 'Los dos precios que ve la clienta, dónde se cambian y cuándo conviene subirlos.',
        palabras: ['tarifa', 'precio envio', 'envios', 'configuracion', 'aumento', 'correo', 'gratis'],
        secciones: [['como', 'Cómo se cobra hoy'], ['cambiar', 'Cambiar el precio'], ['cuando', 'Cuándo subirlo'], ['automatico', 'Precio automático']],
        Contenido: Tarifas,
    },
    {
        id: 'zipnova', titulo: 'Registrarse en Zipnova (precio automático)', icono: Globe2, duracion: '30 min', para: 'Dueño',
        resumen: 'Para que el envío se cotice solo según el código postal de la clienta. No hace falta para vender; es una mejora para más adelante.',
        palabras: ['zipnova', 'zippin', 'cotizacion', 'api', 'vercel', 'credenciales', 'saldo', 'colecta', 'enviopack', 'andreani', 'oca'],
        secciones: [['que', 'Qué es'], ['tener', 'Qué tener a mano'], ['cuenta', '1. Cuenta'], ['config', '2. Configurar'], ['saldo', '3. Saldo'], ['claves', '4. Claves'], ['colecta', '5. Colecta'], ['vercel', '6. Vercel'], ['checklist', 'Checklist']],
        Contenido: Zipnova,
    },
    {
        id: 'ia-keys', titulo: 'Las llaves de la inteligencia artificial', icono: KeyRound, duracion: '5 min', para: 'Dueño',
        resumen: 'Crear la llave nueva de Gemini, cargarla en el panel y borrar la vieja. Y qué hacer cuando Lau dice que fallaron todos los modelos.',
        palabras: ['gemini', 'api key', 'llave', 'clave', 'ai studio', 'cerebras', 'cuota', 'lau no responde'],
        secciones: [['para-que', 'Para qué es'], ['crear', 'Crear y cargar'], ['cuota', 'Cuota agotada'], ['cerebras', 'Cerebras']],
        Contenido: IaKeys,
    },
    {
        id: 'abrir', titulo: 'Abrir la tienda al público', icono: Rocket, duracion: '20 min', para: 'Dueño',
        resumen: 'Qué falta antes de sacar el mantenimiento, cómo hacer la compra de prueba y cómo es el día a día una vez abierta.',
        palabras: ['abrir', 'mantenimiento', 'compra de prueba', 'mercado pago', 'checklist', 'dashboard', 'dia a dia'],
        secciones: [['estado', 'Qué está listo'], ['antes', 'Antes de abrir'], ['prueba', 'Compra de prueba'], ['dia-a-dia', 'El día a día']],
        Contenido: Abrir,
    },
];

/** Busca guías por título, resumen o palabras clave. Sin acentos ni mayúsculas. */
const plano = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const buscarGuias = (termino, guias = GUIAS) => {
    const t = plano(termino).trim();
    if (!t) return guias;
    return guias.filter(g => plano(`${g.titulo} ${g.resumen} ${g.palabras.join(' ')}`).includes(t));
};
