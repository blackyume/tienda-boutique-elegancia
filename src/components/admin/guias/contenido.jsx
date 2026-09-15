/* eslint-disable react/jsx-key -- las celdas y los items van como datos en arrays; Tabla y Lista les ponen key al renderizar */
import React from 'react';
import { LogIn, FileSpreadsheet, Bot, PackageCheck, Truck, Globe2, KeyRound, Rocket, Receipt, Instagram, LayoutDashboard, Ticket, Palette } from 'lucide-react';
import { Seccion, P, K, Cod, Ruta, Pasos, Paso, Lista, Aviso, Tabla, Mensaje, Botones, Figura, Link, Resumen, Numero, Numeros, BienMal, Quien } from './bloques';
import {
    IlusNombresFotos, IlusExcel, IlusImportar, IlusRetiroCosto,
    IlusEtiqueta, IlusClaves, IlusLau, IlusMenu, IlusPlanillaVentas,
} from './ilustraciones';
import {
    IlusCaminoEnvio, IlusPedidoPanel, IlusMiCorreoNuevoEnvio, IlusPaquete, IlusMarcarEnviado, IlusDiasRetiro,
    IlusDomicilioSucursal, IlusQuienPaga, IlusCheckoutEnvio, IlusCambiarTarifa, IlusLogin, IlusLlaveViaje,
    IlusInterruptor, IlusPruebaCompra, IlusCostoAPrecio, IlusClip,
    IlusCaminoInstagram, IlusCuentaProfesional, IlusLlaveMeta, IlusPostInstagram,
} from './ilustracionesMas';
import { IlusInicio, IlusLauSinIA, IlusOferta, IlusDiseno } from './ilustracionesInicio';
import { TARIFAS_DE_LA_CASA, COSTO_REAL_CORREO_1KG } from '../../../utils/envios';

// Las guías del panel. Están escritas para que las siga alguien que nunca
// usó un panel: frases cortas, un dibujo por paso, y arriba de todo un
// resumen en tarjetas. Los precios de envío se leen del mismo lugar que usa
// el checkout, así la guía nunca dice un número distinto del que cobra la
// tienda.

const $ = (n) => `$${Number(n).toLocaleString('es-AR')}`;
const URL_ADMIN = 'https://la-boutique-de-la-elegancia.web.app/admin';
const DOMI = TARIFAS_DE_LA_CASA.correo_domicilio;
const SUC = TARIFAS_DE_LA_CASA.sucursal;
const RETIRO = 11200;

/** Botón de texto que abre otra guía. */
const Ir = ({ abrir, a, children }) => (
    <button className="font-bold text-[#8a6a1a] dark:text-[#E8C65E] underline decoration-[#E8C65E]/50 underline-offset-2" onClick={() => abrir(a)}>{children}</button>
);

// ─────────────────────────────────────────────────────────────────────────────
// 1. Entrar al panel
// ─────────────────────────────────────────────────────────────────────────────
const Empezar = ({ abrir }) => (
    <>
        <Resumen pasos={[
            { icono: '🌐', titulo: 'Abrí la dirección', detalle: 'y guardala en favoritos' },
            { icono: '🔵', titulo: 'Tocá “Continuar con Google”' },
            { icono: '👤', titulo: 'Elegí la cuenta de la tienda', detalle: 'la que termina en …oficial@gmail.com' },
            { icono: '✅', titulo: 'Ves el menú', detalle: 'Listo, estás adentro' },
        ]} />

        <Seccion id="entrar" titulo="Entrar al panel">
            <Figura titulo="Un solo botón. Si después ves el menú de la izquierda, entraste bien.">
                <IlusLogin />
            </Figura>
            <Pasos>
                <Paso>Abrí <Link href={URL_ADMIN}>{URL_ADMIN}</Link>. Guardalo en favoritos para no escribirlo cada vez.</Paso>
                <Paso>Tocá <K>Continuar con Google</K> y elegí <strong>la cuenta de Google de la tienda</strong>. Es una sola cuenta para las dos personas que la manejan.</Paso>
                <Paso>Si la tienda dice <strong>“EN RENOVACIÓN”</strong>, es normal: está cerrada para la gente, pero a vos te deja pasar y el panel funciona completo.</Paso>
            </Pasos>
            <Aviso tipo="ojo" titulo="Si no ves el menú de la izquierda">
                Entraste con otra cuenta de Google. Cerrá sesión (tu foto, arriba a la derecha) y volvé a entrar con la de la tienda.
            </Aviso>
        </Seccion>

        <Seccion id="menu" titulo="Qué hay en cada parte del menú">
            <Figura titulo="El menú del panel. En el celular se abre con el botón ☰ arriba a la izquierda.">
                <IlusMenu resaltar="Guías" nota="Estás acá" />
            </Figura>
            <Tabla
                cabecera={['Sección', 'Para qué sirve', 'Quién la usa']}
                filas={[
                    [<strong>Inicio</strong>, 'Cómo va el día: ventas, visitas, pedidos por enviar, qué se está agotando. Acá está el interruptor de mantenimiento.', 'Dueño'],
                    [<strong>Lau</strong>, 'El chat que hace todo: carga productos, cambia precios, anota ventas, te avisa lo que pasa.', 'Los dos'],
                    [<strong>Pedidos</strong>, 'Las compras. La dirección de la clienta y el botón “Marcar Enviado”.', 'Dueño'],
                    [<strong>Inventario</strong>, 'Los productos: crear, editar, publicar u ocultar. Importar y exportar Excel.', 'Quien carga productos'],
                    [<strong>Ventas y ganancia</strong>, 'Cuánto vendiste y cuánto ganaste, por período. Y las ventas por fuera.', 'Dueño'],
                    [<strong>Clientas · Reseñas · Carritos sin terminar · Newsletter</strong>, 'Quién compró, qué escribieron, quién dejó el carrito a medias, quién dejó su email.', 'Dueño'],
                    [<strong>Cupones y ofertas</strong>, 'Descuentos y promociones.', 'Dueño'],
                    [<strong>Diseño de la tienda</strong>, 'Textos, portadas, categorías, redes sociales.', 'Dueño'],
                    [<strong>Gastos · Proveedores · Simulador de precios</strong>, 'Los números: lo que pagás, a quién le comprás, y probar precios sin cargar nada.', 'Dueño'],
                    [<strong>Guías</strong>, 'Esto que estás leyendo.', 'Los dos'],
                    [<strong>Configuración</strong>, 'WhatsApp, pagos, precios de envío, precio automático, llaves de IA.', 'Dueño'],
                ]}
            />
        </Seccion>

        <Seccion id="buscador" titulo="El buscador rápido">
            <P>En cualquier lado del panel, apretá <K>Ctrl</K> + <K>K</K> (o el botón <K>Buscar</K> abajo a la izquierda). Escribís el nombre de un producto o de una sección y vas directo. Es la forma más rápida de llegar a un producto para editarlo.</P>
        </Seccion>

        <Seccion id="siguiente" titulo="Y ahora, ¿qué guía sigo?">
            <Lista items={[
                <>Voy a cargar <strong>muchos</strong> productos de una vez → <Ir abrir={abrir} a="carga-masiva">Cargar productos con Excel y fotos</Ir></>,
                <>Voy a cargar <strong>pocos</strong> productos → <Ir abrir={abrir} a="lau">Cargar productos hablándole a Lau</Ir></>,
                <>Entró un pedido y hay que mandarlo → <Ir abrir={abrir} a="pedido-envio">Del pedido al envío</Ir></>,
                <>Quiero abrir la tienda → <Ir abrir={abrir} a="abrir">Abrir la tienda al público</Ir></>,
            ]} />
        </Seccion>
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. Carga masiva
// ─────────────────────────────────────────────────────────────────────────────
const CargaMasiva = () => (
    <>
        <Resumen pasos={[
            { icono: '📷', titulo: 'Nombrá cada foto', detalle: 'igual que el producto' },
            { icono: '📗', titulo: 'Llená el Excel', detalle: 'una fila por producto' },
            { icono: '🖱️', titulo: 'Soltá todo junto', detalle: 'Excel + fotos en el panel' },
            { icono: '👀', titulo: 'Mirá la vista previa' },
            { icono: '✅', titulo: 'Confirmar', detalle: 'recién ahí se guarda' },
        ]} />

        <Seccion id="idea" titulo="La idea en 30 segundos">
            <P>Necesitás dos cosas: <strong>un Excel</strong> con una fila por producto y <strong>una carpeta con las fotos</strong>. Los soltás juntos en el panel, mirás la vista previa, confirmás.</P>
            <P>¿Cómo sabe qué foto es de qué producto? <strong>Por el nombre del archivo.</strong> Si la foto se llama como el producto, se juntan solos.</P>
            <P>La plantilla del Excel se baja de acá: <Link href="/docs/plantilla-productos.xlsx">plantilla-productos.xlsx</Link>. Tiene tres productos de ejemplo (borralos) y una segunda hoja que explica cada columna.</P>
            <Aviso tipo="dato">Las fotos van como las sacaste. <strong>No hay que retocarlas</strong> ni pasarlas por ningún programa.</Aviso>
            <Aviso tipo="tip">Lo mismo se lo podés dar a Lau: clip 📎, elegís el Excel y las fotos juntos, Enter, Confirmar. Es idéntico al paso 3 de esta guía.</Aviso>
        </Seccion>

        <Seccion id="fotos" titulo="1. Las fotos: el archivo se llama como el producto">
            <Figura titulo="Cada archivo va al producto que tiene su mismo nombre. Uno con otro nombre queda “suelto” y la vista previa te lo marca.">
                <IlusNombresFotos />
            </Figura>
            <BienMal
                bien={[<><Cod>jean-elastizado-oxford.jpg</Cod> → producto “Jean Elastizado Oxford”</>, <><Cod>Jean Elastizado Oxford.JPG</Cod> (mayúsculas y espacios dan igual)</>, <><Cod>jean-elastizado-oxford-1.jpg</Cod>, <Cod>-2.jpg</Cod>, <Cod>-3.jpg</Cod> (varias fotos: la -1 es la principal)</>]}
                mal={[<><Cod>IMG_2041.jpg</Cod> (no dice de qué producto es)</>, <><Cod>jean.jpg</Cod> si hay dos productos que empiezan con “jean”</>, <>Un nombre distinto al del Excel, aunque sea por una letra</>]}
            />
            <P>Sirven <Cod>.jpg</Cod>, <Cod>.png</Cod> y <Cod>.webp</Cod>.</P>
            <Aviso tipo="tip">
                Si no querés renombrar un archivo (<Cod>IMG_2041.jpg</Cod>), ponés ese nombre en la columna <strong>Foto</strong> del Excel. Pero lo más fácil es nombrar bien el archivo y dejar esa columna vacía.
            </Aviso>
        </Seccion>

        <Seccion id="excel" titulo="2. El Excel: una fila por producto">
            <Figura titulo="La plantilla. Para un producto nuevo alcanza con Producto y Precio venta (o Costo: el precio se calcula solo).">
                <IlusExcel />
            </Figura>
            <Tabla
                cabecera={['Columna', 'Qué va', 'Obligatoria']}
                filas={[
                    [<strong>Producto</strong>, 'El nombre. Es lo que ve la clienta y lo que empareja la foto.', 'Sí'],
                    [<strong>Categoría</strong>, <>Tiene que existir en <Ruta pasos={['Admin', 'Diseño de la tienda', 'Categorías']} />, escrita igual.</>, 'No'],
                    [<strong>Precio venta</strong>, <>Lo que paga la clienta. Acepta <Cod>46500</Cod>, <Cod>46.500</Cod> o <Cod>$ 46.500</Cod>. <strong>Si la dejás vacía y ponés Costo, el precio se calcula solo</strong> con tu margen.</>, 'Precio o Costo'],
                    [<strong>Costo</strong>, 'Lo que te costó. Con esto el panel calcula la ganancia (y el precio, si no lo ponés).', 'Precio o Costo'],
                    [<strong>Stock</strong>, 'Cuántos tenés. Número entero. Vacío = 0.', 'No'],
                    [<strong>Talles</strong>, <>Separados por coma: <Cod>S, M, L</Cod> o <Cod>36, 38, 40</Cod>. Vacío = S, M.</>, 'No'],
                    [<strong>Colores</strong>, <>Separados por coma: <Cod>negro, chocolate</Cod>.</>, 'No'],
                    [<strong>Estado</strong>, <><Cod>Publicado</Cod> o <Cod>Borrador</Cod>. Vacío = publicado si tiene foto.</>, 'No'],
                    [<strong>Foto</strong>, 'Casi siempre vacía (ver arriba).', 'No'],
                    [<strong>Descripción</strong>, 'Texto libre que ve la clienta.', 'No'],
                ]}
            />
            <Aviso tipo="ojo" titulo="Dos cosas que conviene saber">
                <p><strong>Un producto sin foto entra oculto</strong> (borrador), aunque le pongas “Publicado”. En la tienda no se muestra nada sin imagen. Le subís la foto después y lo publicás.</p>
                <p className="mt-2"><strong>El nombre es la llave de todo.</strong> Si más adelante cambiás el nombre en el Excel, el importador cree que es un producto nuevo y lo duplica.</p>
            </Aviso>
        </Seccion>

        <Seccion id="importar" titulo="3. Importar">
            <Figura titulo="Soltar, revisar, confirmar. Hasta que no tocás Confirmar, no se guarda nada.">
                <IlusImportar />
            </Figura>
            <Pasos>
                <Paso>Entrá a <Ruta pasos={['Admin', 'Inventario', '⤴ Importar Excel']} /> (arriba a la derecha, al lado de Exportar).</Paso>
                <Paso>Seleccioná <strong>el Excel y todas las fotos juntos</strong> y soltalos en el recuadro. En Windows: click en el Excel, <K>Ctrl</K> + <K>A</K>, y arrastrás todo. También podés soltar primero el Excel y después las fotos.</Paso>
                <Paso>
                    Aparece la <strong>vista previa</strong>. Ahí ves:
                    <Lista items={[
                        <><strong>Nuevos</strong>: los que se van a crear, con sus fotitos y si entran publicados o como borrador.</>,
                        <><strong>Actualizados</strong>: los que ya existían y cambian precio, stock, etc. Te muestra el valor viejo → el nuevo.</>,
                        <><strong>Fotos que no van a ningún producto</strong>: casi siempre un nombre mal escrito. Las renombrás y las volvés a soltar; la vista previa se actualiza sola.</>,
                        <><strong>Con error</strong>: filas que no se tocan y por qué.</>,
                    ]} />
                </Paso>
                <Paso>Si está todo bien, <K>Confirmar importación</K>. Sube las fotos y crea los productos; abajo ves el avance. Con 50 productos tarda uno o dos minutos: no cierres la pestaña.</Paso>
            </Pasos>
        </Seccion>

        <Seccion id="despues" titulo="4. Después: cambiar precios o stock">
            <P>No hace falta la carpeta de fotos. <K>⤓ Exportar Excel</K> te baja la planilla con todo lo que hay; cambiás los precios en Excel, la volvés a importar, y en la vista previa ves exactamente qué cambia antes de confirmar.</P>
            <Aviso tipo="dato">A un producto que <strong>ya tiene foto no se le pisa</strong>, aunque haya un archivo con su nombre. Si querés cambiarle la foto, se hace desde el producto en Inventario.</Aviso>
        </Seccion>

        <Seccion id="problemas" titulo="Si algo sale mal">
            <Tabla
                cabecera={['Ves', 'Qué pasa', 'Qué hacer']}
                filas={[
                    ['“No pude leer el archivo”', 'No es .xlsx ni .csv, o está roto.', 'Guardalo desde Excel como .xlsx.'],
                    ['Un producto quedó como borrador sin querer', 'No encontró su foto.', 'Mirá “Fotos que no van a ningún producto”: el archivo tiene otro nombre.'],
                    ['“Ya tiene foto: las N del archivo no se tocan”', 'El producto existía y tenía imagen.', 'Es normal. La foto se cambia desde el producto.'],
                    ['“Hay más de un producto con ese nombre”', 'Tenés dos productos iguales en el panel.', 'Borrá o renombrá uno en Inventario y volvé a importar.'],
                    ['“Producto nuevo sin precio ni costo”', 'Falta el precio (o el costo) en esa fila.', 'Ponele uno de los dos.'],
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
        <Resumen pasos={[
            { icono: '📎', titulo: 'Tocá el clip', detalle: 'y elegí la foto' },
            { icono: '✍️', titulo: 'Escribí lo que sabés', detalle: 'como te salga' },
            { icono: '🔘', titulo: 'Contestá los botones', detalle: 'lo que falte, lo pregunta' },
            { icono: '✅', titulo: 'Confirmar', detalle: 'recién ahí se guarda' },
            { icono: '↩️', titulo: 'Deshacer', detalle: 'si te equivocaste' },
        ]} />

        <Seccion id="que-es" titulo="Qué es Lau">
            <P>Lau es el chat del panel. <strong>Le hablás como a una empleada y ella hace.</strong> Carga productos, cambia precios, anota ventas, te dice cuánto stock queda y te avisa cuando entra una venta.</P>
            <P>Está en dos lugares: en el menú, <Ruta pasos={['Admin', 'Lau']} />; y navegando la tienda como admin, el botón dorado <strong>abajo a la izquierda</strong>. Las clientas no lo ven.</P>
            <P>Para <strong>1 a 10 productos</strong> es lo más rápido. Para una colección entera conviene el Excel (<Ir abrir={abrir} a="carga-masiva">esa guía está acá</Ir>), que también se lo podés dar a ella.</P>
        </Seccion>

        <Seccion id="cargar" titulo="Cargar un producto">
            <Figura titulo="Foto + lo que sabés del producto. Lo que falta, Lau lo pregunta con botones. Nada se guarda hasta que confirmás.">
                <IlusLau />
            </Figura>
            <Pasos>
                <Paso>Tocá el clip 📎 y elegí la foto (o varias, si son del mismo producto). Si preferís que te lleve de la mano pregunta por pregunta, arriba del cuadro de texto está el botón dorado <K>Cargar producto (paso a paso)</K>.</Paso>
                <Paso>
                    Escribí lo que sabés. Puede ser desprolijo, Lau lo entiende:
                    <div className="space-y-2 pt-1">
                        <Mensaje>jean oxford azul, talles 36 38 40 42, tengo 5, me costó 21000, publicalo</Mensaje>
                    </div>
                </Paso>
                <Paso>
                    Lo que falte te lo pregunta <strong>de a uno, con botones</strong>. Tocás y seguís.
                    <div className="space-y-2 pt-1">
                        <Mensaje de="lau">Me falta la categoría. ¿Cuál va?</Mensaje>
                        <Botones opciones={['Jeans', 'Pantalones', 'Otra…']} />
                    </div>
                </Paso>
                <Paso>
                    Al final te muestra un resumen y un botón de <strong>Confirmar</strong>. Nada se guarda hasta que lo tocás.
                    <div className="space-y-2 pt-1">
                        <Mensaje de="lau">Publicar “Jean Oxford” — $46.500 · Jeans · azul · 36/38/40/42 · stock 5. ¿Confirmás?</Mensaje>
                        <Botones opciones={['✓ Confirmar', 'Cambiar algo']} />
                    </div>
                </Paso>
            </Pasos>
            <Aviso tipo="dato">Con varias fotos, primero te pregunta: <strong>¿mismo producto o productos distintos?</strong> Mismo producto = una galería. Distintos = te guía uno por uno.</Aviso>
        </Seccion>

        <Seccion id="planillas" titulo="Tirale una planilla y ella la carga">
            <Figura titulo="El mismo clip sirve para tres cosas. Lau se da cuenta sola de qué es cada archivo.">
                <IlusClip />
            </Figura>
            <Lista items={[
                <><strong>El Excel de productos + sus fotos</strong> (todo en el mismo mensaje): crea los productos, sube las fotos y los publica. Es lo mismo que <Ruta pasos={['Inventario', 'Importar Excel']} />, desde el chat.</>,
                <><strong>Tu planilla de ventas</strong> (una columna por clienta): anota cada clienta como una venta. Podés agregarle texto: <em>“ventas del 5/9 por instagram”</em>, <em>“descontá el stock”</em>, o corregir nombres: <em>“Ana Mena y Lorena Petroli”</em>.</>,
            ]} />
            <P>Siempre te muestra qué entendió y espera tu <strong>Confirmar</strong>.</P>
            <Aviso tipo="tip">Para esto no hace falta la llave de Gemini: aunque diga “IA no configurada”, las planillas las lee igual.</Aviso>
        </Seccion>

        <Seccion id="en-vivo" titulo="Stock y ventas en tiempo real">
            <P>Lau ve el inventario y los pedidos <strong>en vivo</strong>. Estas preguntas las contesta al instante, con datos exactos, sin inteligencia artificial (funcionan aunque no haya llave):</P>
            <Tabla
                cabecera={['Preguntás', 'Te dice']}
                filas={[
                    ['“¿cuánto queda del vestido negro?” / “stock jean oxford” / “¿hay top rib?”', 'Cuántas unidades quedan, el precio, y el detalle por talle y color. Con ⚠️ si queda poco y ⛔ si se agotó.'],
                    ['“¿cuántos vestidos quedan?”', 'Si hay varios que coinciden, te lista todos con su stock.'],
                    ['“¿cómo está el stock?” / “¿qué está agotado?” / “¿qué repongo?”', 'El panorama: cuántos productos y unidades, qué se agotó y qué está por agotarse.'],
                    ['“¿qué se vendió hoy?” / “¿cuánto vendí ayer?” / “ventas de la semana” / “este mes” / “últimas ventas”', 'Cada venta con hora, clienta, total, canal y prendas, y el total del período.'],
                ]}
            />
            <P>Y mientras la tenés abierta, <strong>te avisa sola</strong>:</P>
            <Mensaje de="lau">{'🛍️ ¡Venta nueva! Carla Pérez · $45.000 · Tienda web · pagado\n• Vestido Negro Largo (talle M) → ⚠️ quedan 2\nCuando lo despaches, en Pedidos tenés "Copiar datos para MiCorreo".'}</Mensaje>
            <Mensaje de="lau">{'⛔ Campera Puffer se agotó (tenías 1). Reponer o sacarlo de la tienda.'}</Mensaje>
            <P>Al volver a abrirla te cuenta lo que entró mientras no estabas. Y con el panel cerrado, el navegador manda una notificación por cada pedido (la primera vez te pide permiso).</P>
        </Seccion>

        <Seccion id="sin-llave" titulo="Lo que hace sin la llave de IA">
            <P>Las cosas de todos los días Lau las entiende <strong>sola</strong>, sin inteligencia artificial: funcionan aunque no haya llave, y son instantáneas. Siempre te muestra qué va a hacer y espera tu <strong>Confirmar</strong>.</P>
            <Figura titulo="Una venta por WhatsApp anotada por chat. Lau pregunta el talle con botones, pide confirmar, y deja un Deshacer por si era otra.">
                <IlusLauSinIA />
            </Figura>
            <Tabla
                cabecera={['Decís', 'Hace']}
                filas={[
                    ['“vendí el jean oxford por whatsapp” · “vendí 2 tops rib a 14.800” · “vendí el short por 30.000 en el local”', 'Anota la venta por fuera: descuenta el stock (te pregunta talle y color con botones), la suma a las ventas y queda como pedido. “a X” es por unidad; “por X” es el total; sin precio usa el de la tienda.'],
                    ['“llegaron 10 sweater lanilla” · “me llegaron 3 jean oxford 40 azul”', 'Suma unidades al stock (con talle y color si el producto los tiene).'],
                    ['“ponele 48000 al sweater lanilla” · “el jean chupín a 45.000”', 'Cambia el precio.'],
                    ['“ocultá el gamulán” · “mostrá la cartera de cuero”', 'Lo saca de la tienda o lo vuelve a poner, sin borrar nada.'],
                    ['📎 + “cambiá la foto del jean oxford” · “agregale esta foto al top rib”', 'Reemplaza la foto (o la suma a la galería). Nombre, precio y stock quedan igual.'],
                    ['“deshacer” (o el botón que aparece después de cada acción)', 'Revierte lo último: vuelve el precio, repone el stock, anula la venta.'],
                    ['“¿cuánto queda del jean?” · “¿qué se vendió hoy?” · “me costó 24000” · “liquidación”', 'Responde al instante (ver las secciones de al lado).'],
                ]}
            />
            <Lista items={[
                <><strong>Si hay dos con el mismo nombre</strong>, te muestra un botón por cada uno con su precio: tocás el que es.</>,
                <><strong>Si no le alcanza el stock</strong> (“vendí 3” y quedan 2), no anota nada y te dice cuántos quedan: primero “llegaron 1”, después la venta.</>,
                <><strong>Micrófono 🎤</strong> al lado del clip: tocás, hablás, y lo que dijiste queda escrito en el cuadro para que lo mandes. Anda en Chrome, Edge y Safari; la primera vez el navegador pide permiso.</>,
            ]} />
            <Aviso tipo="dato" titulo="Qué sí necesita la llave">
                Cargar un producto por chat (la IA arma la ficha), generar descripciones, ofertas programadas, el resumen con consejos, y todo lo que no esté en la tabla. Para cargar productos sin llave está el botón dorado <K>Cargar producto (paso a paso)</K> y el Excel.
            </Aviso>
        </Seccion>

        <Seccion id="precio" titulo="El precio sale solo">
            <Figura titulo="Del costo al precio. Los números del medio los configurás una vez; después sólo decís cuánto te costó.">
                <IlusCostoAPrecio />
            </Figura>
            <P>Una vez, en <Ruta pasos={['Configuración', 'Precios']} /> (o diciéndoselo a Lau), cargás tu <strong>margen</strong>, el <strong>packaging</strong> y el <strong>flete</strong> por prenda, y cómo <strong>redondear</strong>. Desde entonces, en todos lados alcanza con el costo:</P>
            <Lista items={[
                <><strong>Lau:</strong> <em>“me costó 24000”</em> → precio y ganancia limpia, sin preguntas. Si además la estás cargando, la crea con ese precio. Otro margen para esa prenda: <em>“me costó 24000, con 60%”</em>.</>,
                <><strong>Cargador rápido:</strong> elegís “Te doy el costo”, ponés el número y el precio aparece.</>,
                <><strong>Excel:</strong> columna <Cod>costo</Cod> sin <Cod>precio</Cod> → el precio se calcula al importar.</>,
            ]} />
            <P>Para configurarlo hablándole: <em>“poné el margen en 110%”</em>, <em>“las bolsas me cuestan 650”</em>, <em>“flete 500 por prenda”</em>, <em>“redondeá a 500”</em>, <em>“camperas 80% de margen”</em>. Te muestra qué entendió, confirmás, y queda guardado.</P>
            <Aviso tipo="tip" titulo="Liquidación inteligente">
                Decile <em>“liquidación”</em> (o <em>“¿qué no se está vendiendo?”</em>): busca lo que lleva más de 45 días sin venderse, propone −20% <strong>sin bajar nunca del costo + comisión</strong>, y si confirmás lo deja en oferta con el precio anterior tachado. <em>“liquidá con 30%”</em> para otro descuento; <em>“liquidación a los 60 días con 25%”</em> para cambiar la regla. En el resumen del día te avisa cuando hay algo para liquidar.
            </Aviso>
            <Aviso tipo="dato" titulo="La comisión de Mercado Pago no se carga">
                Se mide sola de tus ventas (lo que MP cobró menos lo que te depositó). Hasta la primera venta usa un estimado de 7,6%. Y si reponés una prenda más cara y el precio ya no cubre tu margen, Lau te avisa y te propone el precio nuevo.
            </Aviso>
        </Seccion>

        <Seccion id="frases" titulo="Frases que entiende">
            <Tabla
                cabecera={['Decís', 'Hace']}
                filas={[
                    ['“publicalo” / “subilo” / “ponelo”', 'Lo crea visible en la tienda.'],
                    ['“guardalo” / “borrador”', 'Lo crea oculto.'],
                    ['“tengo 5” / “hay 5” / “quedan 5”', 'Stock 5.'],
                    ['“me costó 24000”', 'Precio al instante con tu margen, packaging, flete y la comisión de MP.'],
                    ['“generá una descripción”', 'Escribe ella la descripción.'],
                    ['“todos negros” / “es negro”', 'Color negro.'],
                ]}
            />
            <P>En un solo mensaje podés mandar todo junto: <em>“publicalo, stock 5, y generá la descripción”</em>.</P>
        </Seccion>

        <Seccion id="no-hace" titulo="Lo que Lau NO hace, a propósito">
            <Aviso tipo="ojo" titulo="No adivina nada de la foto">
                No deduce qué prenda es, ni el color, ni nada. <strong>Vos se lo decís.</strong> Está hecho así para que nunca publique un “jean azul” que era una campera negra.
            </Aviso>
        </Seccion>

        <Seccion id="otras" titulo="Otras cosas que le podés pedir">
            <Lista items={[
                <><strong>Editar:</strong> “cambiale el precio al jean oxford a 48000”, “ponele stock 3 al top rib talle M”.</>,
                <><strong>Cambiar sólo la foto</strong> de un producto ya publicado: clip 📎, elegís la foto nueva y escribís “cambiá la foto del jean oxford”. Te pide confirmar y la reemplaza; nombre, precio y stock quedan igual. Con “agregale esta foto al jean oxford” la suma a la galería. Anda sin llave de IA.</>,
                <><strong>Ofertas y cupones</strong> → <Ir abrir={abrir} a="ofertas">guía</Ir>. <strong>Textos y fotos de la home</strong> → <Ir abrir={abrir} a="diseno">guía</Ir>.</>,
                <><strong>Una venta por fuera:</strong> “vendí 2 jeans por WhatsApp a 46500” → descuenta stock y lo suma a las ventas. Te pregunta el canal con botones.</>,
                <><strong>Gastos:</strong> “gasté 20000 en packaging” → lo resta de la ganancia.</>,
                <><strong>Ofertas:</strong> “poné 15% off en camperas el finde”, “quitá la oferta del jean”.</>,
                <><strong>Resumen:</strong> “cómo va el negocio”, “qué repongo”.</>,
                <><strong>Instagram:</strong> “publicá el jean oxford en instagram” → sale con foto, precio y hashtags. Antes hay un trámite de 30 minutos en Meta → <Ir abrir={abrir} a="instagram">guía</Ir>.</>,
            ]} />
            <P>Todo lo que cambia algo en la tienda <strong>te pide confirmación</strong> antes. Y no borra en masa: si le decís “borrá todo”, te pide confirmar uno por uno. También es a propósito.</P>
        </Seccion>

        <Seccion id="no-responde" titulo="Si no responde">
            <Lista items={[
                <>Falta o venció la llave de Gemini. Es la causa el 90% de las veces → <Ir abrir={abrir} a="ia-keys">guía de las llaves</Ir>.</>,
                <>Si dice que fallaron “todos los modelos”, se agotó la cuota gratis de Google del día. Esperá una hora, o activá facturación en AI Studio (son centavos por producto).</>,
                <>Las planillas, el stock, las ventas, el precio y la liquidación <strong>andan igual sin llave</strong>.</>,
            ]} />
        </Seccion>
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
// 4. Ventas por fuera
// ─────────────────────────────────────────────────────────────────────────────
const VentasFuera = ({ abrir }) => (
    <>
        <Resumen pasos={[
            { icono: '📒', titulo: 'Armá tu planilla', detalle: 'como siempre' },
            { icono: '📎', titulo: 'Se la adjuntás a Lau', detalle: 'con el clip' },
            { icono: '⏎', titulo: 'Enter', detalle: 'te muestra qué entendió' },
            { icono: '✅', titulo: 'Confirmar', detalle: 'ya cuentan en Ventas' },
        ]} />

        <Seccion id="por-que" titulo="Por qué anotarlas en la tienda">
            <P>Lo que vendés por WhatsApp, en el local o en una feria no pasa por la tienda. Si lo anotás en el panel, <strong>Ventas</strong> y <strong>Inicio</strong> muestran lo que vendiste de verdad, y el stock no miente.</P>
            <P>Cada venta queda como un pedido <Cod>MAN-…</Cod> en Pedidos, igual que uno de la tienda.</P>
        </Seccion>

        <Seccion id="lau" titulo="De a una: decíselo a Lau">
            <Mensaje>vendí un short sastrero talle 5 chocolate a 13500 por WhatsApp, a Lorena</Mensaje>
            <P>Lau descuenta el stock, lo anota en Ventas y te confirma. Sirve cuando el producto <strong>está en el inventario</strong>. Más en la <Ir abrir={abrir} a="lau">guía de Lau</Ir>.</P>
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
            <Aviso tipo="tip">Poné el mes en el nombre del archivo (<Cod>WAKANDA 09-26.xlsx</Cod>) y la fecha de la venta se completa sola.</Aviso>
        </Seccion>

        <Seccion id="importar" titulo="Cargar la planilla">
            <P><strong>Con Lau (lo más fácil):</strong> abrí el chat, tocá el clip 📎, elegí el Excel, Enter. Te muestra las clientas y los totales y te pide confirmar. Si querés cambiar algo, lo escribís en el mismo mensaje:</P>
            <Mensaje>Ana Mena y Lorena Petroli, ventas del 5/9 en el local</Mensaje>
            <P><strong>Por el panel</strong> es lo mismo con más botones:</P>
            <Pasos>
                <Paso>Entrá a <Ruta pasos={['Admin', 'Ventas', '⤴ Importar ventas']} />.</Paso>
                <Paso>Soltá el Excel. Aparece la <strong>vista previa</strong>: una tarjeta por clienta con sus prendas y el total.</Paso>
                <Paso>Revisá la <strong>fecha</strong> y el <strong>canal</strong> (WhatsApp, Local, Feria…). Si las prendas están en el inventario con el mismo nombre, podés tildar <K>Descontar stock</K>.</Paso>
                <Paso><K>Registrar ventas</K>. Listo: ya figuran en Ventas y en Inicio.</Paso>
            </Pasos>
            <Aviso tipo="dato">Si volvés a cargar la misma planilla con la misma fecha, <strong>no se duplica</strong>: te avisa que esas ventas ya estaban.</Aviso>
        </Seccion>
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
// 5. Del pedido al envío (MiCorreo, retiro a domicilio)
// ─────────────────────────────────────────────────────────────────────────────
const PedidoEnvio = ({ abrir }) => (
    <>
        <Resumen pasos={[
            { icono: '📋', titulo: 'Copiá los datos', detalle: 'Admin → Pedidos → “Datos y envío”' },
            { icono: '🖥️', titulo: 'Pegalos en MiCorreo', detalle: 'Nuevo envío → Ctrl + V' },
            { icono: '🏷️', titulo: 'Pagá e imprimí', detalle: 'la etiqueta, en A4' },
            { icono: '📦', titulo: 'Pegala en el paquete', detalle: 'y dejalo listo' },
            { icono: '🚚', titulo: 'Pasan a buscar', detalle: 'martes y viernes' },
            { icono: '✅', titulo: 'Marcá enviado', detalle: 'el email sale solo' },
        ]} />

        <Seccion id="resumen" titulo="Cómo funciona, de punta a punta">
            <P>Los pedidos se mandan <strong>sin ir a la sucursal</strong>: el Correo pasa a buscar los paquetes por tu casa. Se usa <strong>MiCorreo</strong>, la página de Correo Argentino para negocios. Es gratis, sin contrato y sin mínimo.</P>
            <Figura titulo="Un pedido de punta a punta. Lo tuyo son cuatro pasos y diez minutos. El resto se hace solo o lo hace el Correo.">
                <IlusCaminoEnvio />
            </Figura>
            <Aviso tipo="ojo" titulo="Vas a necesitar una impresora">
                La etiqueta del envío se imprime y se pega en el paquete. <strong>Sin etiqueta impresa no lo aceptan.</strong> Cualquier impresora común sirve, en hoja A4. Escribir los datos a mano no sirve.
            </Aviso>
        </Seccion>

        <Seccion id="cuenta" titulo="Una sola vez: abrir la cuenta en MiCorreo">
            <Pasos>
                <Paso>Entrá a <Link href="https://micorreo.correoargentino.com.ar">micorreo.correoargentino.com.ar</Link> → <K>Registrate</K>.</Paso>
                <Paso>Te pide: nombre y apellido, <strong>CUIT</strong> (por ser negocio), teléfono, email, contraseña, y la dirección de Rafaela con código postal <Cod>2300</Cod>.</Paso>
                <Paso>Te llega un email para confirmar la cuenta. <strong>Revisá spam</strong> si no aparece.</Paso>
            </Pasos>
            <Aviso tipo="dato">Son 10 minutos y no se vuelve a hacer. Anotá la contraseña en un lugar seguro: la vas a usar con cada pedido.</Aviso>
        </Seccion>

        <Seccion id="retiro" titulo="Una sola vez: pedir que pasen a buscar">
            <Pasos>
                <Paso>En MiCorreo: <Ruta pasos={['Mi perfil', 'Domicilios']} /> → cargá la dirección exacta desde donde salen los paquetes y la franja que preferís: <strong>mañana o tarde</strong>.</Paso>
                <Paso>La sucursal revisa si tu dirección está dentro de la zona de retiro y te avisa. <strong>Este es el dato clave</strong>: si te cubren, queda listo para siempre. Si no, avisá para ver Andreani u OCA, que también están en Rafaela.</Paso>
            </Pasos>
            <Figura titulo="Elegí dos días fijos. Ese día dejás todos los paquetes listos y se llevan todo junto.">
                <IlusDiasRetiro />
            </Figura>
            <Numeros>
                <Numero valor={$(RETIRO)} etiqueta="cada vez que pasan" nota="No es por paquete: es por visita, lleves 1 o 9." tono="rojo" />
                <Numero valor="40% menos" etiqueta="con 10 a 14 paquetes" nota="en la misma visita." />
                <Numero valor="Gratis" etiqueta="con 15 paquetes o más" nota="en la misma visita." tono="verde" />
            </Numeros>
            <Figura titulo="Lo que te sale el retiro por cada paquete, según cuántos juntás en la visita. Con 5 son $2.240 por paquete.">
                <IlusRetiroCosto />
            </Figura>
        </Seccion>

        <Seccion id="pedido" titulo="Cada pedido, paso a paso">
            <P>Esto es lo que hacés cada vez que entra una venta. Son <strong>cuatro pasos y unos diez minutos</strong>. Lau te avisa cuando entra el pedido; también lo ves en <Ruta pasos={['Admin', 'Pedidos']} />.</P>

            <h4 className="text-lg font-bold text-slate-900 dark:text-white pt-2">Paso 1 — Copiá los datos de la clienta <Quien quien="vos" /></h4>
            <Figura titulo="En el pedido, tocá “Datos y envío”. Ahí está todo. El botón dorado copia los datos listos para pegar.">
                <IlusPedidoPanel />
            </Figura>
            <Pasos>
                <Paso>Entrá a <Ruta pasos={['Admin', 'Pedidos']} /> y buscá el pedido (los nuevos están arriba).</Paso>
                <Paso>Tocá <K>Datos y envío</K>. Se abre: qué prendas van, DNI, teléfono, dirección completa, y si eligió <strong>a domicilio</strong> o <strong>retiro en sucursal</strong>.</Paso>
                <Paso>Tocá <K>Copiar datos para MiCorreo</K>. Ya está copiado. No hace falta escribir nada.</Paso>
            </Pasos>

            <h4 className="text-lg font-bold text-slate-900 dark:text-white pt-4">Paso 2 — Cargá el envío en MiCorreo <Quien quien="vos" /></h4>
            <Figura titulo="Nuevo envío tiene tres partes. La primera ya está guardada; la segunda se pega; la tercera es siempre igual.">
                <IlusMiCorreoNuevoEnvio />
            </Figura>
            <Pasos>
                <Paso>Entrá a MiCorreo y tocá <K>Nuevo envío</K>.</Paso>
                <Paso><strong>Origen:</strong> tus datos. Quedan guardados desde la primera vez. No tocás nada.</Paso>
                <Paso><strong>Destino:</strong> pegá lo que copiaste (<K>Ctrl</K> + <K>V</K>) en cada campo: nombre, DNI, teléfono, calle y número, ciudad, código postal. Si la clienta eligió <strong>retiro en sucursal</strong>, elegí esa opción y la sucursal de su ciudad.</Paso>
                <Paso><strong>Paquete:</strong> medidas, peso y contenido. Para una prenda, siempre lo mismo (ver el dibujo de abajo).</Paso>
            </Pasos>
            <Figura titulo="Medidas y peso de un paquete con una prenda. No hace falta medir: es a ojo, y con 1 kg vas seguro.">
                <IlusPaquete />
            </Figura>

            <h4 className="text-lg font-bold text-slate-900 dark:text-white pt-4">Paso 3 — Pagá e imprimí la etiqueta <Quien quien="vos" /></h4>
            <Pasos>
                <Paso><K>Guardar envío</K> → pagar. Con tarjeta o Mercado Pago. Al pagar te da el <strong>número de seguimiento</strong> al instante: es una tira de letras y números tipo <Cod>CU123456789AR</Cod>. <strong>Copialo</strong>, lo vas a usar en el paso 4.</Paso>
                <Paso>Tocá <K>Imprimir etiqueta</K>. Sale una hoja A4 con los datos y un código de barras.</Paso>
                <Paso>Metés la prenda en la bolsa o caja, cerrás bien, y <strong>pegás la etiqueta</strong> en el frente, prolija y sin tapar el código de barras.</Paso>
            </Pasos>
            <Figura titulo="La etiqueta la da MiCorreo al pagar. Va impresa y pegada en el frente del paquete.">
                <IlusEtiqueta />
            </Figura>
            <Aviso tipo="dato">Si un día tenés varios pedidos, en MiCorreo la pestaña <K>Masivo</K> deja cargarlos todos de una con un archivo. Al principio, de a uno es más simple.</Aviso>

            <h4 className="text-lg font-bold text-slate-900 dark:text-white pt-4">Paso 4 — Marcá enviado <Quien quien="vos" /> y avisale a la clienta <Quien quien="solo" /></h4>
            <Figura titulo="Pegás el número de seguimiento y guardás. A la clienta le llega el email con el botón para rastrear. Vos no le escribís nada.">
                <IlusMarcarEnviado />
            </Figura>
            <Pasos>
                <Paso>Volvé al panel: <Ruta pasos={['Admin', 'Pedidos']} />, el mismo pedido, tocá <K>Marcar Enviado</K>.</Paso>
                <Paso>Pegá el número de seguimiento que copiaste y <K>Guardar</K>.</Paso>
                <Paso>Listo. El email sale solo. Dejá el paquete donde lo busca el Correo el próximo día de retiro.</Paso>
            </Pasos>
            <Aviso tipo="tip">Cuando pasan a buscar, <strong>no hay que hacer nada más</strong>. El paquete ya tiene su etiqueta pagada; el cartero lo escanea y se lo lleva.</Aviso>
        </Seccion>

        <Seccion id="sucursal" titulo="¿A domicilio o retiro en sucursal?">
            <P>Lo elige la clienta al comprar. Para vos los pasos son los mismos; sólo cambia el destino que ponés en MiCorreo.</P>
            <Figura titulo="Las dos opciones que ve la clienta. El precio lo cobra la tienda y lo ves en el pedido.">
                <IlusDomicilioSucursal domicilio={DOMI} sucursal={SUC} />
            </Figura>
        </Seccion>

        <Seccion id="numeros" titulo="Quién paga el envío">
            <Figura titulo="La clienta paga el envío en la tienda. Con esa plata le pagás al Correo. No es un gasto tuyo.">
                <IlusQuienPaga tienda={$(DOMI.cost)} correo={$(COSTO_REAL_CORREO_1KG.domicilio)} retiro={RETIRO} />
            </Figura>
            <Tabla
                cabecera={['', 'Paga la clienta en la tienda', 'Te cobra el Correo (1 kg, la zona más cara)']}
                filas={[
                    [<strong>A domicilio</strong>, <strong>{$(DOMI.cost)}</strong>, $(COSTO_REAL_CORREO_1KG.domicilio)],
                    [<strong>Retiro en sucursal</strong>, <strong>{$(SUC.cost)}</strong>, $(COSTO_REAL_CORREO_1KG.sucursal)],
                ]}
            />
            <Lista items={[
                <><strong>El retiro a domicilio no está incluido</strong> ({$(RETIRO)} por visita). Si lo usás seguido, subí un poco el precio del envío en la tienda: cómo, en la <Ir abrir={abrir} a="tarifas">guía de tarifas</Ir>.</>,
                <>Correo Argentino <strong>aumenta cada dos o tres meses</strong>. Cuando pagues un envío y veas que subió, subí también el precio en la tienda.</>,
            ]} />
            <P className="text-xs">Fuente: preguntas frecuentes de MiCorreo, <Link href="https://www.correoargentino.com.ar/MiCorreo/public/faqs">correoargentino.com.ar/MiCorreo/public/faqs</Link>.</P>
        </Seccion>

        <Seccion id="trabas" titulo="Si te trabás">
            <Tabla
                cabecera={['Pasa esto', 'Qué hacer']}
                filas={[
                    ['No encuentro el botón “Datos y envío”', 'Está en cada pedido, a la derecha. Si no lo ves, la pantalla está muy angosta: achicá el zoom o girá el celular.'],
                    ['MiCorreo me pide un dato que no tengo (piso, depto)', 'Si la clienta no lo puso, dejalo vacío. El teléfono y el DNI sí son obligatorios: están en el pedido.'],
                    ['Perdí el número de seguimiento', 'En MiCorreo → Mis envíos, en el envío, figura el número. Copialo de ahí.'],
                    ['No tengo impresora hoy', 'Se puede imprimir en un cíber o librería: mandate el PDF de la etiqueta por email.'],
                    ['Pasaron los días y no vinieron a buscar', 'Revisá en MiCorreo que el retiro esté pedido para ese día y que el envío esté pagado. Un envío queda 30 días esperando; después se cancela solo.'],
                    ['La clienta pregunta dónde está el paquete', 'Tiene el número en su email. Y vos lo ves en MiCorreo → Mis envíos. No hace falta llamar al Correo.'],
                ]}
            />
        </Seccion>
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
// 6. Tarifas de envío
// ─────────────────────────────────────────────────────────────────────────────
const Tarifas = () => {
    const opciones = [DOMI, SUC];
    return (
        <>
            <Resumen pasos={[
                { icono: '👩', titulo: 'La clienta paga el envío', detalle: 'al comprar, junto con la prenda' },
                { icono: '🏠🏤', titulo: 'Elige entre dos', detalle: 'a domicilio o a sucursal' },
                { icono: '⚙️', titulo: 'El precio lo cambiás vos', detalle: 'Configuración → Envíos' },
            ]} />

            <Seccion id="como" titulo="Cómo se cobra el envío hoy">
                <Figura titulo="Lo que ve la clienta al terminar la compra. El precio es el mismo para todo el país.">
                    <IlusCheckoutEnvio opciones={opciones} />
                </Figura>
                <Numeros>
                    <Numero valor={$(DOMI.cost)} etiqueta={DOMI.name} nota={`El Correo te cobra hasta ${$(COSTO_REAL_CORREO_1KG.domicilio)}. ${DOMI.time}.`} />
                    <Numero valor={$(SUC.cost)} etiqueta={SUC.name} nota={`El Correo te cobra hasta ${$(COSTO_REAL_CORREO_1KG.sucursal)}. ${SUC.time}.`} />
                </Numeros>
                <P>Estos son los precios de septiembre de 2026, y son el <strong>respaldo</strong>: si no cargás nada en el panel, la tienda cobra esto. Lo que cargues en el panel manda.</P>
            </Seccion>

            <Seccion id="cambiar" titulo="Cambiar el precio">
                <Figura titulo="Cada opción tiene nombre, precio y demora. Cambiás el número y Guardar.">
                    <IlusCambiarTarifa opciones={opciones} />
                </Figura>
                <Pasos>
                    <Paso>Entrá a <Ruta pasos={['Admin', 'Configuración', 'Envíos']} />.</Paso>
                    <Paso>Cambiá el <strong>precio</strong> de la opción y tocá <K>Guardar</K>.</Paso>
                    <Paso>Listo, se aplica al instante. No hay que publicar nada.</Paso>
                </Pasos>
                <Aviso tipo="dato">Una opción <strong>sin nombre o sin precio no se guarda</strong>. Es a propósito: una vez quedó una opción en blanco y la tienda regaló el envío sin que nadie se diera cuenta.</Aviso>
            </Seccion>

            <Seccion id="cuando" titulo="Cuándo subirlo">
                <Lista items={[
                    <><strong>Cuando el Correo aumenta.</strong> Pasa cada dos o tres meses. Lo notás al pagar un envío en MiCorreo: si te cobran más de lo que cobra la tienda, subí el precio.</>,
                    <><strong>Si usás el retiro a domicilio seguido.</strong> El retiro sale {$(RETIRO)} por visita y no está incluido. Con 5 paquetes por visita son $2.240 por paquete: con <strong>$13.000 a domicilio</strong> lo cubrís. Con 15 paquetes por visita el retiro es gratis y no hace falta.</>,
                ]} />
                <Aviso tipo="tip">Redondeá para arriba. $10.900 se lee mejor que $10.586, y esos $300 de diferencia absorben el próximo aumento sin que tengas que tocar nada.</Aviso>
            </Seccion>

            <Seccion id="automatico" titulo="Más adelante: precio automático por destino">
                <P>Hoy la que vive en Rafaela paga lo mismo que la que vive en Ushuaia. Para que el precio se calcule solo según el código postal de la clienta hace falta conectar la tienda a <strong>Zipnova</strong>. Es un trámite aparte, no hace falta para vender, y tiene su propia guía.</P>
            </Seccion>
        </>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. Zipnova
// ─────────────────────────────────────────────────────────────────────────────
const Zipnova = () => (
    <>
        <Resumen pasos={[
            { icono: '📝', titulo: 'Crear la cuenta', detalle: 'plan gratis' },
            { icono: '📍', titulo: 'Cargar tu dirección', detalle: 'CP 2300' },
            { icono: '💰', titulo: 'Cargar saldo', detalle: 'con $50.000 alcanza' },
            { icono: '🔑', titulo: 'Copiar las 2 claves', detalle: 'API Key y Secret' },
            { icono: '☁️', titulo: 'Pegarlas en Vercel', detalle: 'y Redeploy' },
        ]} />

        <Seccion id="que" titulo="Qué es esto y para qué sirve">
            <P>Hoy el envío se cobra con un precio fijo para todo el país. Con <strong>Zipnova</strong> el precio se calcula <strong>solo, según a dónde va el paquete</strong>. Zipnova junta más de 40 transportes (Correo Argentino, Andreani, OCA y más) en una sola cuenta. La tienda le pregunta “¿cuánto sale mandar 1 kg al código postal X?”, Zipnova contesta, la clienta paga eso, y cuando la compra se confirma el envío se genera solo.</P>
            <Aviso tipo="tip">
                <strong>No hace falta para vender ni para que pasen a buscar los paquetes.</strong> Eso ya funciona con MiCorreo. Esto es una mejora para cuando la tienda mueva volumen.
            </Aviso>
            <Aviso tipo="dato" titulo="Por qué Zipnova y no otro">
                Se evaluó Envíopack, que es parecido, pero exige que la dirección de despacho esté en Buenos Aires. Rafaela queda afuera. Zipnova tiene <strong>plan gratis</strong>, cobertura nacional y API.
            </Aviso>
        </Seccion>

        <Seccion id="tener" titulo="Qué tener a mano antes de empezar">
            <Tabla
                cabecera={['Dato', 'Para qué']}
                filas={[
                    [<strong>CUIT o CUIL</strong>, 'La cuenta va a nombre de quien factura.'],
                    [<strong>DNI</strong>, 'Pueden pedir foto o número.'],
                    [<strong>Email</strong>, 'El de la tienda. Es el usuario de la cuenta.'],
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
                <><strong>Cómo se despachan:</strong> elegí <strong>Despacho en sucursal</strong> para empezar. La <strong>Colecta</strong> (pasan a buscar) se pide después (Paso 5).</>,
                <><strong>Servicios a ofrecer:</strong> tildá <strong>Envío a domicilio</strong> y <strong>Envío a sucursal</strong>, que son las dos opciones que ya muestra la tienda.</>,
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

        <Seccion id="claves" titulo="Paso 4 — Sacar las claves de la API (lo más importante)">
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
                <strong>Estas claves son como la contraseña de la cuenta.</strong> No las mandes por WhatsApp ni las dejes en un mensaje a la vista. Pegalas directo donde van (Paso 6).
            </Aviso>
        </Seccion>

        <Seccion id="colecta" titulo="Paso 5 — Pedir la colecta (opcional, se puede hacer después)">
            <Pasos>
                <Paso><Ruta pasos={['Configuración', 'Modalidad de despacho', 'Colecta', 'Solicitar']} />.</Paso>
                <Paso>Zipnova responde en 24-48 h hábiles y confirma si llega a Rafaela y con qué transporte.</Paso>
                <Paso>Si lo aprueban, se eligen los días y horarios en que pasan.</Paso>
            </Pasos>
        </Seccion>

        <Seccion id="vercel" titulo="Paso 6 — Cargar las claves en Vercel">
            <Pasos>
                <Paso>Entrá a <Link href="https://vercel.com">vercel.com</Link> con la cuenta del proyecto <em>tienda-boutique-elegancia</em>.</Paso>
                <Paso><Ruta pasos={['Settings', 'Environment Variables', 'Add']} />: <Cod>ZIPNOVA_API_KEY</Cod> → la API Key, y <Cod>ZIPNOVA_SECRET</Cod> → el Secret.</Paso>
                <Paso>Guardar y <strong>Redeploy</strong>: <Ruta pasos={['Deployments', '⋯ del último', 'Redeploy']} />. Sin el redeploy las claves no se aplican.</Paso>
            </Pasos>
            <P>Con las claves cargadas, quien programa la tienda hace el resto. El dueño no toca nada más.</P>
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
// 8. Llaves de IA
// ─────────────────────────────────────────────────────────────────────────────
const IaKeys = () => (
    <>
        <Resumen pasos={[
            { icono: '🌐', titulo: 'Entrá a AI Studio', detalle: 'con la cuenta de la tienda' },
            { icono: '➕', titulo: '“Create API key”', detalle: 'y copiala' },
            { icono: '📋', titulo: 'Pegala en el panel', detalle: 'Configuración → IA → Guardar' },
            { icono: '🗑️', titulo: 'Borrá la vieja', detalle: 'en AI Studio' },
        ]} />

        <Seccion id="para-que" titulo="Para qué es esto">
            <P>Lau conversa, escribe descripciones y ayuda a las clientas con <strong>Gemini</strong>, la inteligencia artificial de Google. Google la deja usar con una <strong>llave</strong> (una clave larga). Sin llave, Lau no conversa; lo demás (planillas, stock, ventas, precios) anda igual.</P>
            <Aviso tipo="ojo" titulo="Hay que hacer una llave nueva">
                La llave anterior estuvo <strong>expuesta</strong> un tiempo (cualquiera podía leerla). El agujero ya está cerrado, pero la llave vieja sigue valiendo hasta que la borres.
            </Aviso>
        </Seccion>

        <Seccion id="crear" titulo="Crear la llave nueva y cargarla (5 minutos)">
            <Figura titulo="La llave viaja de AI Studio al campo del panel. Copiar, pegar, Guardar.">
                <IlusLlaveViaje />
            </Figura>
            <Pasos>
                <Paso>Entrá a <Link href="https://aistudio.google.com/apikey">aistudio.google.com/apikey</Link> con la cuenta de Google de la tienda.</Paso>
                <Paso>Tocá <K>Create API key</K>. Te muestra una clave que empieza con <Cod>AQ.</Cod> (las nuevas) o <Cod>AIzaSy</Cod> (las viejas). Copiala.</Paso>
                <Paso>En la tienda: <Ruta pasos={['Admin', 'Configuración', 'Inteligencia Artificial']} /> → pegala en <strong>“Llaves Administrador (Lau, copy, visión)”</strong> → <K>Guardar Keys</K>.</Paso>
                <Paso>Volvé a AI Studio y <strong>borrá la llave vieja</strong> (el tachito al lado de cada una).</Paso>
                <Paso>Probá: escribile a Lau <em>“hola”</em>. Si contesta, listo.</Paso>
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
// 9. Abrir la tienda
// ─────────────────────────────────────────────────────────────────────────────
const Abrir = ({ abrir }) => (
    <>
        <Resumen pasos={[
            { icono: '🔑', titulo: 'Llaves nuevas de IA', detalle: '5 minutos' },
            { icono: '👗', titulo: 'Productos con foto', detalle: 'Excel o Lau' },
            { icono: '📮', titulo: 'Cuenta en MiCorreo', detalle: 'y pedir el retiro' },
            { icono: '🧪', titulo: 'Una compra de prueba', detalle: 'con plata de verdad' },
            { icono: '🟢', titulo: 'Apagar mantenimiento', detalle: 'y ya está abierta' },
        ]} />

        <Seccion id="estado" titulo="Qué ya está listo">
            <P>La tienda <strong>ya puede vender</strong>: los pagos entran por Mercado Pago, los pedidos aparecen en el panel, el envío lo paga la clienta y los emails salen solos. Está en <strong>modo mantenimiento</strong> (la gente ve “EN RENOVACIÓN”) sólo porque falta lo de arriba.</P>
        </Seccion>

        <Seccion id="antes" titulo="Antes de abrir, en orden">
            <Pasos>
                <Paso><strong>Llaves nuevas de IA.</strong> 5 minutos → <Ir abrir={abrir} a="ia-keys">guía</Ir>.</Paso>
                <Paso><strong>Cargar los productos</strong> con foto → <Ir abrir={abrir} a="carga-masiva">con Excel</Ir> o <Ir abrir={abrir} a="lau">con Lau</Ir>. Un producto sin foto no se muestra.</Paso>
                <Paso><strong>Cuenta en MiCorreo y pedir el retiro</strong>, para saber si cubren tu dirección → <Ir abrir={abrir} a="pedido-envio">guía</Ir>.</Paso>
                <Paso><strong>Una compra de prueba</strong> (abajo).</Paso>
                <Paso><strong>Apagar el mantenimiento</strong> (más abajo).</Paso>
            </Pasos>
        </Seccion>

        <Seccion id="prueba" titulo="La compra de prueba">
            <P>Es la única forma de saber que la cadena completa funciona. Se hace con la tienda todavía en mantenimiento, entrando con el enlace de prueba que tiene el dueño.</P>
            <Pasos>
                <Paso>Ponele a un producto un precio bajo (por ejemplo $500) y publicalo.</Paso>
                <Paso>Desde otro navegador o el celular, comprálo como si fueras clienta: elegí envío a domicilio, pagá con Mercado Pago de verdad.</Paso>
                <Paso>Comprobá las cuatro cosas del dibujo.</Paso>
                <Paso>Volvé a ponerle el precio real al producto. La plata de la prueba queda en tu Mercado Pago.</Paso>
            </Pasos>
            <Figura titulo="Las cuatro comprobaciones. Si las cuatro pasan, la tienda está lista.">
                <IlusPruebaCompra />
            </Figura>
            <Aviso tipo="dato">Si alguna falla, no abras: anotá cuál y avisá. Es mucho más fácil de arreglar antes que con clientas de verdad.</Aviso>
        </Seccion>

        <Seccion id="abrir" titulo="Apagar el mantenimiento">
            <Figura titulo="El interruptor está en Inicio. Se apaga al instante; no hay que publicar nada.">
                <IlusInterruptor />
            </Figura>
            <Pasos>
                <Paso>Entrá a <Ruta pasos={['Admin', 'Inicio']} />.</Paso>
                <Paso>Tocá el interruptor de <K>Mantenimiento</K> para que quede apagado.</Paso>
                <Paso>Abrí la tienda desde el celular como clienta: tiene que verse el catálogo, no “EN RENOVACIÓN”.</Paso>
            </Pasos>
            <Aviso tipo="tip">Ese día empieza a contar la liquidación inteligente de Lau: lo cargado antes de abrir no se considera “sin vender”.</Aviso>
        </Seccion>

        <Seccion id="dia-a-dia" titulo="El día a día, una vez abierta">
            <Tabla
                cabecera={['Cuándo', 'Qué', 'Dónde']}
                filas={[
                    ['Entra un pedido', 'Copiar datos, cargar el envío, imprimir la etiqueta, marcar enviado', 'Admin → Pedidos y MiCorreo'],
                    ['Martes y viernes', 'Pasan a buscar los paquetes juntos', 'Tu casa'],
                    ['Cuando llega mercadería', 'Cargar los productos con foto', 'Lau o Inventario'],
                    ['Cuando aumenta el Correo', 'Subir el precio del envío', 'Admin → Configuración → Envíos'],
                    ['Cuando algo se agota', 'Lau te avisa sola; reponer o sacarlo', 'Lau'],
                    ['Cada tanto', 'Preguntarle a Lau “liquidación” y “cómo va el negocio”', 'Lau'],
                ]}
            />
        </Seccion>
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
// Índice
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// 10. Publicar en Instagram con Lau
// ─────────────────────────────────────────────────────────────────────────────
const InstagramGuia = () => (
    <>
        <Resumen pasos={[
            { icono: '📱', titulo: 'Cuenta profesional', detalle: 'en la app, 2 minutos' },
            { icono: '🧑‍💻', titulo: 'Una app en Meta', detalle: 'developers.facebook.com' },
            { icono: '🔑', titulo: 'Generar la llave', detalle: 'y copiarla' },
            { icono: '☁️', titulo: 'Pegarla en Vercel', detalle: 'y Redeploy' },
            { icono: '💬', titulo: 'Decirle a Lau', detalle: '"publicá el jean en insta"' },
        ]} />

        <Seccion id="que" titulo="Qué hace y qué no">
            <P>Con esto Lau <strong>publica en tu Instagram</strong>: le decís qué producto y, si querés, con qué texto; ella te muestra la foto y el texto, confirmás, y aparece en tu cuenta. También hay un botón rosa <K>Publicar en Instagram</K> en cada fila de <Ruta pasos={['Inventario']} />.</P>
            <Figura titulo="Vos hacés dos cosas: pedirlo y confirmar. El resto se hace solo.">
                <IlusCaminoInstagram />
            </Figura>
            <BienMal
                bien={[
                    'Una foto en el feed con texto: el producto, el precio, los talles y hashtags.',
                    'El texto que vos le dictes, tal cual lo escribiste.',
                    'Publicar desde el celular, hablándole a Lau.',
                ]}
                mal={[
                    'Historias, reels ni carruseles de varias fotos (Instagram no lo deja desde acá, por ahora).',
                    'Responder mensajes ni comentarios.',
                    'Publicar sola sin que confirmes: siempre te pregunta.',
                ]}
            />
            <Aviso tipo="dato" titulo="Esto no hace falta para vender">
                La tienda funciona igual sin Instagram conectado. Y los <strong>links de tus redes</strong> que se ven en la tienda (el ícono de Instagram del pie, "Escribinos") se cambian en <Ruta pasos={['Diseño de la tienda', 'Redes']} />, sin ningún trámite.
            </Aviso>
        </Seccion>

        <Seccion id="antes" titulo="Por qué hay un trámite">
            <P>Instagram sólo deja que un programa publique en una cuenta si <strong>la dueña lo autoriza con una llave</strong>. Esa llave la da Meta (la empresa de Instagram y Facebook) desde su sitio para programadores. Es gratis, es una sola vez, y tarda <strong>30 a 40 minutos</strong>. Como lo de MiCorreo: un rato de registro y después no se toca más.</P>
            <Tabla
                cabecera={['Qué tener a mano', 'Para qué']}
                filas={[
                    [<strong>El usuario y la contraseña de tu Instagram</strong>, 'Para pasar la cuenta a profesional y para autorizar la llave.'],
                    [<strong>Una cuenta de Facebook</strong>, 'Para entrar al sitio de programadores de Meta. Sirve la tuya personal; no se publica nada ahí.'],
                    [<strong>Tu teléfono</strong>, 'Meta manda un código por SMS la primera vez.'],
                    [<strong>La cuenta de Vercel de la tienda</strong>, 'Ahí se pega la llave, como con Zipnova.'],
                ]}
            />
        </Seccion>

        <Seccion id="profesional" titulo="Paso 1 — Pasar tu Instagram a cuenta profesional">
            <P>Es un interruptor dentro de la app de Instagram. <strong>Gratis y sin cambiar nada</strong> de lo que ya tenés.</P>
            <Figura titulo="Configuración → Tipo de cuenta y herramientas → Cambiar a cuenta profesional → Empresa.">
                <IlusCuentaProfesional />
            </Figura>
            <Pasos>
                <Paso>En la app de Instagram, en tu perfil, tocá las <K>☰</K> de arriba a la derecha → <K>Configuración y actividad</K>.</Paso>
                <Paso>Bajá hasta <K>Tipo de cuenta y herramientas</K> → <K>Cambiar a cuenta profesional</K>.</Paso>
                <Paso>Elegí <strong>Empresa</strong> y la categoría <strong>Tienda de ropa</strong>. Si pregunta por conectar con Facebook, podés <strong>Omitir</strong>: no hace falta.</Paso>
            </Pasos>
            <Aviso tipo="tip">Si tu cuenta ya dice "Empresa" o "Creador" debajo del nombre en el perfil, este paso ya está.</Aviso>
        </Seccion>

        <Seccion id="meta" titulo="Paso 2 — Crear la app en Meta for Developers">
            <P>"App" suena a mucho, pero es sólo un <strong>permiso con nombre</strong>: le decís a Meta "la tienda va a publicar en mi cuenta". Se hace desde la computadora.</P>
            <Pasos>
                <Paso>Entrá a <Link href="https://developers.facebook.com">developers.facebook.com</Link> → <K>Empezar</K> (o "Get started") → iniciá sesión con tu Facebook. Aceptá los términos y verificá el teléfono con el código que te manda.</Paso>
                <Paso><Ruta pasos={['Mis apps', 'Crear app']} />. Si pregunta por el caso de uso, elegí el de <strong>Instagram</strong> (puede decir "Gestionar todo en Instagram" o "Crear una app con la API de Instagram"). Si en cambio pide tipo, elegí <strong>Empresa</strong> (Business).</Paso>
                <Paso>Nombre de la app: <Cod>La Boutique Lau</Cod>. Email: el de la tienda. <K>Crear app</K>.</Paso>
                <Paso>En el menú de la izquierda de la app, buscá <strong>Instagram</strong> (si no está, <K>Agregar producto</K> → Instagram → <K>Configurar</K>).</Paso>
            </Pasos>
            <Aviso tipo="ojo">
                Meta cambia los nombres de los botones seguido. Si algo no dice exactamente lo de acá, buscá la palabra <strong>Instagram</strong> y la palabra <strong>token</strong>: ese es el camino.
            </Aviso>
        </Seccion>

        <Seccion id="llave" titulo="Paso 3 — Generar la llave (lo más importante)">
            <Figura titulo="En Instagram → 'Configuración de la API con inicio de sesión de Instagram' → Generar token. La llave se copia y va a Vercel.">
                <IlusLlaveMeta />
            </Figura>
            <Pasos>
                <Paso>Dentro de <strong>Instagram</strong> en tu app, entrá a <K>Configuración de la API con inicio de sesión de Instagram</K> ("API setup with Instagram business login").</Paso>
                <Paso>En <strong>1. Generar tokens de acceso</strong>, tocá <K>Agregar cuenta</K> e iniciá sesión con <strong>tu Instagram</strong> (el de la tienda). Aceptá los permisos que pide: son para leer tu perfil y publicar.</Paso>
                <Paso>Al lado de tu cuenta aparece <K>Generar token</K>. Tocalo. Te vuelve a pedir la contraseña de Instagram y te muestra una tira larga de letras que empieza con <Cod>IGAA…</Cod>.</Paso>
                <Paso><K>Copiar</K>. <strong>Se muestra una sola vez.</strong> Si la perdés, se genera otra y listo, pero no la dejes en ningún lado a la vista.</Paso>
            </Pasos>
            <Aviso tipo="ojo" titulo="La llave es la contraseña de tu Instagram">
                Con ella cualquiera puede publicar en tu cuenta. No la mandes por WhatsApp, no la pegues en un chat (tampoco en el de Lau), no la guardes en una nota del celular. <strong>Sólo en Vercel</strong>, Paso 4.
            </Aviso>
        </Seccion>

        <Seccion id="vercel" titulo="Paso 4 — Pegarla en Vercel y probar">
            <Pasos>
                <Paso>Entrá a <Link href="https://vercel.com">vercel.com</Link> con la cuenta del proyecto <em>tienda-boutique-elegancia</em>.</Paso>
                <Paso><Ruta pasos={['Settings', 'Environment Variables', 'Add']} />: Key <Cod>INSTAGRAM_ACCESS_TOKEN</Cod>, Value: la llave. <K>Save</K>.</Paso>
                <Paso><strong>Redeploy</strong>: <Ruta pasos={['Deployments', '⋯ del último', 'Redeploy']} />. Sin esto la llave no se aplica. Tarda un minuto.</Paso>
                <Paso>En el panel: <Ruta pasos={['Configuración', 'Notificaciones', 'Instagram']} /> → <K>Probar conexión</K>. Si dice <strong>"Conectado como @tu_cuenta"</strong>, listo. No publica nada: sólo saluda.</Paso>
            </Pasos>
            <Aviso tipo="dato" titulo="La llave vence a los 60 días, pero la tienda la renueva sola">
                Meta da llaves que duran 60 días. El servidor de la tienda la renueva todas las semanas antes de que venza, así que <strong>no tenés que volver a hacer esto</strong>. Sólo si un día Lau te dice "la llave de Instagram venció", repetís el Paso 3 y el Paso 4.
            </Aviso>
        </Seccion>

        <Seccion id="usar" titulo="Paso 5 — Usarlo con Lau">
            <Figura titulo="Así queda la publicación. Con la foto principal del producto y el texto que arma Lau (o el tuyo).">
                <IlusPostInstagram />
            </Figura>
            <Mensaje de="vos">publicá el jean oxford en instagram</Mensaje>
            <Mensaje de="lau">{'Publicar en Instagram: Jean Oxford Tiro Alto (texto armado por Lau: nombre, precio y hashtags). ¿Confirmás?'}</Mensaje>
            <Botones opciones={['Confirmar', 'Cancelar']} />
            <Mensaje de="lau">{'Publicado en Instagram (@laboutiquedelaelegancia): instagram.com/p/…'}</Mensaje>
            <P>Con tu propio texto:</P>
            <Mensaje de="vos">subí el vestido negro a insta con este texto: Llegó el vestido que estabas esperando 🖤 Ideal para la noche. Consultá talles por mensaje.</Mensaje>
            <P>Lau usa <strong>ese texto tal cual</strong> y abajo agrega el precio, la dirección de la tienda y los hashtags.</P>
            <Tabla
                cabecera={['Frase', 'Qué pasa']}
                filas={[
                    ['"publicá X en instagram" / "subilo a insta" / "postealo"', 'Publica la foto principal de X con nombre, descripción, precio, talles y hashtags.'],
                    ['"... con este texto: ..."', 'Usa tu texto en vez del que arma ella.'],
                    ['Botón rosa en Inventario', 'Lo mismo, sin escribir: te pregunta y publica.'],
                ]}
            />
            <Aviso tipo="tip" titulo="Poné el link de la tienda en tu bio">
                Instagram no deja links en el texto de las publicaciones. Por eso dice "link en la bio". Una sola vez: en tu perfil → <K>Editar perfil</K> → <K>Enlaces</K> → pegá <Cod>la-boutique-de-la-elegancia.web.app</Cod>.
            </Aviso>
        </Seccion>

        <Seccion id="trabas" titulo="Si te trabás">
            <Tabla
                cabecera={['Pasa esto', 'Hacé esto']}
                filas={[
                    ['Lau dice "Instagram no está conectado todavía"', 'Falta la llave en Vercel o el Redeploy. Paso 4.'],
                    ['Lau dice "la llave venció o no sirve"', 'Generá otra (Paso 3) y pegala en Vercel (Paso 4). Pasa si cambiaste la contraseña de Instagram.'],
                    ['"Probar conexión" da error de permisos', 'Al generar la llave no aceptaste todos los permisos. Generá otra y aceptá todo.'],
                    ['"Instagram rechazó la foto"', 'La foto del producto no se pudo convertir. Probá con otra foto principal desde el editor del producto.'],
                    ['"Se publicó demasiado seguido"', 'Instagram deja 25 por día desde acá. Esperá a mañana.'],
                    ['El producto no tiene foto', 'Instagram no acepta publicaciones sin foto. Cargale una y volvé a pedirlo.'],
                    ['No encuentro el botón en Meta', 'Buscá "Instagram" en el menú de la app y después la palabra "token". Los nombres cambian, el camino no.'],
                ]}
            />
            <P className="text-xs">Fuentes: <Link href="https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login">API de Instagram con inicio de sesión de Instagram</Link> · <Link href="https://developers.facebook.com/docs/instagram-platform/content-publishing">publicación de contenido</Link> (límite de 25 por día, JPEG, proporción 4:5 a 1.91:1).</P>
        </Seccion>
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
// 11. El Inicio del panel
// ─────────────────────────────────────────────────────────────────────────────
const InicioGuia = ({ abrir }) => (
    <>
        <Resumen pasos={[
            { icono: '⚠️', titulo: 'Avisos', detalle: 'si hay algo, está arriba' },
            { icono: '📬', titulo: 'Hoy', detalle: 'qué espera tu respuesta' },
            { icono: '♡', titulo: 'Favoritos', detalle: 'qué reponer antes' },
            { icono: '📊', titulo: 'Visitas y stock', detalle: 'cómo viene la mano' },
        ]} />

        <Seccion id="idea" titulo="Para qué sirve">
            <P>El <strong>Inicio</strong> es lo primero que ves al entrar. Está armado para una sola cosa: que en <strong>un minuto</strong> sepas si hay algo que atender hoy, sin recorrer todo el panel.</P>
            <Figura titulo="Cada bloque tiene su número. Abajo, qué es cada uno.">
                <IlusInicio />
            </Figura>
        </Seccion>

        <Seccion id="bloques" titulo="Qué es cada bloque">
            <Lista items={[
                <><strong>1. Avisos.</strong> Sólo aparecen cuando hay algo que mirar: la conexión con Instagram que va a vencer, Lau sin llave. Tocás el aviso y te lleva a arreglarlo. Si no hay nada, no hay barra.</>,
                <><strong>2. Hoy.</strong> Cuatro contadores: <strong>Por enviar</strong> (pagados y sin despachar), <strong>Pagos por confirmar</strong> (esperando la plata o coordinando por WhatsApp), <strong>Carritos de hoy</strong> (empezaron a comprar y no terminaron, últimas 24 h) y <strong>Reseñas por aprobar</strong>. Se pintan de dorado cuando hay algo. Tocás y vas.</>,
                <><strong>3. Lo más guardado en favoritos.</strong> Las prendas que más clientas guardaron con el corazón en los últimos 30 días, con el stock que te queda al lado. Es la lista de <strong>qué reponer antes de que se venda</strong>. Con “Editar” cargás stock ahí mismo.</>,
                <><strong>4. Visitas por día.</strong> Dos semanas, una barra por día, el pico en oro. Sirve para ver si un posteo o una historia movió gente. Tus propias visitas no cuentan.</>,
                <><strong>5. Stock.</strong> Cuántos productos tienen stock, cuántos van por las últimas unidades y cuántos se agotaron. Abajo, si hay productos <strong>ocultos</strong> (que las clientas no ven).</>,
                <><strong>6. Stock bajo.</strong> Los productos por debajo del umbral, con el talle y color más flojo. El lápiz abre el producto para reponer; el ojo lo oculta de la tienda hasta que llegue.</>,
            ]} />
        </Seccion>

        <Seccion id="rutina" titulo="La rutina de la mañana">
            <Pasos>
                <Paso>Mirás <strong>Hoy</strong>. Si “Por enviar” está en dorado, seguí la <Ir abrir={abrir} a="pedido-envio">guía del envío</Ir>.</Paso>
                <Paso>Si hay <strong>Pagos por confirmar</strong>, entrás a Pedidos: los de WhatsApp los cerrás vos cuando te pagan.</Paso>
                <Paso>Un vistazo a <strong>Stock bajo</strong> y a <strong>Favoritos</strong>: lo que está flojo y encima lo guardan muchas, se repone primero.</Paso>
                <Paso>Listo. Lo demás (ventas del mes, ganancia) está en <Ruta pasos={['Ventas y ganancia']} /> y te lo cuenta Lau si le preguntás “¿cómo va el negocio?”.</Paso>
            </Pasos>
            <Aviso tipo="dato" titulo="Antes de la primera venta">
                Mientras no haya ventas, en vez de los números de ingresos vas a ver “Todavía no hubo ventas” con las visitas del período, y arriba “Primeros pasos”, que te va marcando lo que falta para abrir. Cuando entre la primera venta, el Inicio cambia solo.
            </Aviso>
        </Seccion>
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
// 12. Ofertas, cupones y liquidación
// ─────────────────────────────────────────────────────────────────────────────
const OfertasGuia = ({ abrir }) => (
    <>
        <Resumen pasos={[
            { icono: '🏷️', titulo: 'Oferta', detalle: 'baja el precio, se ve tachado' },
            { icono: '🎟️', titulo: 'Cupón', detalle: 'un código para descontar al pagar' },
            { icono: '📉', titulo: 'Liquidación', detalle: 'Lau elige qué bajar, nunca a pérdida' },
            { icono: '🗓️', titulo: 'Programada', detalle: 'se activa sola el día que digas' },
        ]} />

        <Seccion id="cual" titulo="Oferta o cupón: cuál conviene">
            <Figura titulo="Izquierda: una oferta, la ve todo el mundo. Derecha: un cupón, lo usa quien tiene el código.">
                <IlusOferta />
            </Figura>
            <Tabla
                cabecera={['Querés…', 'Usá']}
                filas={[
                    ['Que una prenda (o toda una categoría) se vea más barata para todas', 'Oferta'],
                    ['Premiar a alguien: una amiga, un sorteo, las que se anotaron al newsletter', 'Cupón'],
                    ['Mover lo que hace meses no se vende', 'Liquidación (Lau)'],
                    ['Un descuento para el finde, que arranque solo el sábado', 'Oferta programada'],
                ]}
            />
        </Seccion>

        <Seccion id="oferta" titulo="Poner una oferta">
            <P>Lo más rápido es decírselo a Lau:</P>
            <Mensaje de="vos">poné el jean oxford 20% off</Mensaje>
            <Mensaje de="lau">Poner JEANS ELASTIZADO OXFORD en oferta −20%: $46.500 → $37.200, con el precio anterior tachado. ¿Confirmás?</Mensaje>
            <Lista items={[
                <>Toda una categoría: <em>“15% off en camperas”</em>. Toda la tienda: <em>“10% off en todo”</em>.</>,
                <>Para que arranque sola: <em>“20% off en camperas el sábado a las 10”</em> → queda programada y se aplica ese día (mientras la tienda esté abierta).</>,
                <>Para sacarla: <em>“quitá la oferta del jean oxford”</em>. Vuelve el precio de antes.</>,
                <>Sin Lau: en <Ruta pasos={['Inventario']} />, el lápiz del producto → precio de oferta.</>,
            ]} />
            <Aviso tipo="dato">Una oferta <strong>no toca el costo</strong>: la ganancia de esa prenda baja, y en Ventas lo ves. Si querés bajar sin perder plata, usá la liquidación: esa mira el costo.</Aviso>
        </Seccion>

        <Seccion id="cupon" titulo="Crear un cupón">
            <Pasos>
                <Paso><Ruta pasos={['Cupones y ofertas', 'Nuevo cupón']} />. O a Lau: <em>“creá el cupón PRIMAVERA10 con 10%”</em>.</Paso>
                <Paso>Elegís <strong>código</strong> (lo que la clienta escribe), <strong>porcentaje</strong> o <strong>monto fijo</strong>, y si querés: compra mínima, cuántas veces se puede usar, hasta qué fecha.</Paso>
                <Paso>Se lo pasás por WhatsApp o Instagram. Ella lo escribe en el checkout y el descuento aparece antes de pagar.</Paso>
            </Pasos>
            <BienMal
                bien={['PRIMAVERA10 · 10% · vence en 15 días · una vez por clienta', 'AMIGA · $5.000 · sólo con compra mínima de $40.000']}
                mal={['DESCUENTO · 50% · sin vencimiento ni límite: se lo pasan entre todas y queda para siempre']}
            />
        </Seccion>

        <Seccion id="liquidacion" titulo="Liquidación: que Lau elija">
            <Mensaje de="vos">liquidación</Mensaje>
            <Mensaje de="lau">{'Hay 4 productos con más de 45 días sin venderse. Propongo −20%, sin bajar nunca del costo + comisión:\n• Short algodón Santi $16.500 → $13.200\n• Musculosa modal tirita $8.700 → $7.000\n…\n¿Aplico?'}</Mensaje>
            <Lista items={[
                <>Otro descuento: <em>“liquidá con 30%”</em>. Otra regla: <em>“liquidación a los 60 días con 25%”</em>.</>,
                <>Nunca vende a pérdida: si el descuento pisa el costo, esa prenda baja sólo hasta el costo.</>,
                <>Cuando se vende, sacás la oferta como cualquier otra: <em>“quitá la oferta del short”</em>.</>,
            ]} />
            <P>En el resumen del día Lau te avisa sola cuando hay algo para liquidar. Y cómo se calculan los precios y los márgenes, en la <Ir abrir={abrir} a="lau">guía de Lau</Ir>, sección “El precio sale solo”.</P>
        </Seccion>
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
// 13. Diseño de la tienda
// ─────────────────────────────────────────────────────────────────────────────
const DisenoGuia = ({ abrir }) => (
    <>
        <Resumen pasos={[
            { icono: '🖼️', titulo: 'Portada', detalle: 'fotos, título y frase' },
            { icono: '📣', titulo: 'Barra de arriba', detalle: 'el aviso dorado' },
            { icono: '🗂️', titulo: 'Categorías', detalle: 'las fichas con foto' },
            { icono: '👀', titulo: 'Mirá la tienda', detalle: 'cada cambio, al instante' },
        ]} />

        <Seccion id="donde" titulo="Dónde se cambia cada cosa">
            <P>Todo lo que ve la clienta en la home se edita desde <Ruta pasos={['Diseño de la tienda']} />. Sin código, sin esperar: guardás y ya está online.</P>
            <Figura titulo="La home y, al costado, en qué pestaña se edita cada parte.">
                <IlusDiseno />
            </Figura>
        </Seccion>

        <Seccion id="portada" titulo="La portada">
            <P>Pestaña <K>Portada &amp; Textos</K>:</P>
            <Lista items={[
                <><strong>Título y subtítulo:</strong> “LA BOUTIQUE” y “de la Elegancia”. Mejor no tocarlos: son la marca.</>,
                <><strong>Frase (tagline):</strong> la que va abajo del nombre. Si escribís una oración corta y después el resto (<em>“La elegancia no se improvisa: se elige. Prendas…”</em>), la primera queda grande en cursiva y el resto chico.</>,
                <><strong>Texto del botón:</strong> “Ver la tienda”. Corto, un verbo.</>,
                <><strong>Portadas del carrusel:</strong> las fotos grandes que van rotando. <K>Sumar portada</K>, y con las flechas las ordenás. Fotos verticales de la modelo, sin texto encima: el texto lo pone la tienda.</>,
            ]} />
            <Aviso tipo="tip" titulo="Con Lau también">
                <em>“cambiá la frase de la portada por: …”</em> o <em>“poné en el botón Ver colección”</em>. Te muestra el cambio y confirmás.
            </Aviso>
        </Seccion>

        <Seccion id="barra" titulo="La barra de arriba y el popup">
            <P>Pestaña <K>Anuncios &amp; Popups</K>:</P>
            <Lista items={[
                <><strong>Barra de anuncios:</strong> la franja dorada de arriba de todo. Hoy dice “Compra segura | Envíos a todo el país | Nueva colección 2026”. Cambiala cuando haya algo mejor que decir (“Envío gratis desde $80.000 hasta el domingo”). Se puede apagar.</>,
                <><strong>Popup promocional:</strong> el cartel que salta al entrar. Sirve para un cupón de bienvenida; si no hay nada que ofrecer, mejor apagado: molesta.</>,
                <><strong>Cintilla (marquee):</strong> una tira que se desplaza. Está apagada; si la prendés, el texto se edita al lado.</>,
            ]} />
        </Seccion>

        <Seccion id="categorias" titulo="Las categorías">
            <P>Pestaña <K>Categorías</K>: cada categoría tiene nombre y foto, y en la home se ve como una ficha. Las categorías salen de los productos: si cargás una prenda con categoría “Vestidos” y no existe, se crea. Acá le ponés la foto.</P>
            <BienMal
                bien={['Una foto por categoría con la prenda puesta, misma luz en todas', 'Nombres cortos: Jeans, Camperas, Tops']}
                mal={['Categorías de un solo producto (“Gamulán”): mejor meterlo en Camperas', 'Fotos con fondos distintos entre ficha y ficha']}
            />
        </Seccion>

        <Seccion id="mirar" titulo="Mirar cómo quedó">
            <P>Abajo a la izquierda del panel, <K>Ir a la tienda</K>. Mirala también desde el celular: la mayoría de las clientas entra desde el teléfono. Si algo quedó raro, volvés a Diseño de la tienda y lo corregís; no hay que “publicar” nada, cada cambio sale al instante.</P>
            <P>Las fotos de los productos no se cambian acá sino en <Ruta pasos={['Inventario']} /> o diciéndole a Lau <em>“cambiá la foto del jean oxford”</em> con la foto adjunta (<Ir abrir={abrir} a="lau">guía de Lau</Ir>).</P>
        </Seccion>
    </>
);

export const GUIAS = [
    {
        id: 'empezar', titulo: 'Entrar al panel y moverse', icono: LogIn, duracion: '3 min', para: 'Los dos',
        resumen: 'Cómo entrar con la cuenta de la tienda, qué hay en cada menú y cuál guía seguir después.',
        palabras: ['login', 'entrar', 'google', 'cuenta', 'menu', 'mantenimiento', 'renovacion', 'buscador'],
        secciones: [['entrar', 'Entrar'], ['menu', 'El menú'], ['buscador', 'Buscador rápido'], ['siguiente', 'Qué guía sigo']],
        Contenido: Empezar,
    },
    {
        id: 'inicio', titulo: 'El Inicio: qué mirar cada mañana', icono: LayoutDashboard, duracion: '3 min', para: 'Dueño',
        resumen: 'Avisos, lo que espera tu respuesta hoy, qué reponer, cómo vienen las visitas y el stock. Un minuto y sabés si hay algo que hacer.',
        palabras: ['inicio', 'dashboard', 'panel', 'hoy', 'por enviar', 'favoritos', 'visitas', 'stock bajo', 'avisos', 'resumen', 'mañana'],
        secciones: [['idea', 'Para qué sirve'], ['bloques', 'Qué es cada bloque'], ['rutina', 'La rutina de la mañana']],
        Contenido: InicioGuia,
    },
    {
        id: 'carga-masiva', titulo: 'Cargar productos con Excel y fotos', icono: FileSpreadsheet, duracion: '10 min', para: 'Quien carga productos',
        resumen: 'Una planilla con una fila por producto y una carpeta de fotos que se emparejan por el nombre del archivo. Todo junto, en un solo paso.',
        palabras: ['excel', 'importar', 'exportar', 'planilla', 'plantilla', 'fotos', 'masivo', 'csv', 'xlsx', 'precio', 'stock', 'borrador'],
        secciones: [['idea', 'La idea'], ['fotos', '1. Las fotos'], ['excel', '2. El Excel'], ['importar', '3. Importar'], ['despues', '4. Cambiar precios'], ['problemas', 'Si algo sale mal']],
        Contenido: CargaMasiva,
    },
    {
        id: 'lau', titulo: 'Lau: la que hace todo por vos', icono: Bot, duracion: '6 min', para: 'Los dos',
        resumen: 'Le hablás y ella carga productos, lee tus planillas, te dice el stock y las ventas en vivo, calcula los precios y liquida lo que no se vende.',
        palabras: ['lau', 'asistente', 'chat', 'ia', 'inteligencia artificial', 'foto', 'publicar', 'descripcion', 'ventas por fuera', 'gastos', 'stock', 'tiempo real', 'en vivo', 'cuanto queda', 'que se vendio', 'precio', 'margen', 'comision', 'costo', 'packaging', 'liquidacion', 'sin llave', 'voz', 'microfono', 'dictar', 'deshacer', 'ocultar', 'llegaron', 'cambiar foto'],
        secciones: [['que-es', 'Qué es Lau'], ['cargar', 'Cargar un producto'], ['planillas', 'Tirale una planilla'], ['en-vivo', 'Stock y ventas en vivo'], ['sin-llave', 'Sin la llave de IA'], ['precio', 'El precio sale solo'], ['frases', 'Frases que entiende'], ['no-hace', 'Lo que no hace'], ['otras', 'Otras cosas'], ['no-responde', 'Si no responde']],
        Contenido: Lau,
    },
    {
        id: 'ventas-fuera', titulo: 'Anotar las ventas de WhatsApp y del local', icono: Receipt, duracion: '4 min', para: 'Dueño',
        resumen: 'Las ventas por fuera también cuentan: tu planilla se la das a Lau con el clip y confirmás. O de a una, hablándole.',
        palabras: ['ventas', 'planilla', 'excel', 'whatsapp', 'local', 'feria', 'importar ventas', 'pagado', 'clienta', 'wakanda'],
        secciones: [['por-que', 'Por qué anotarlas'], ['lau', 'De a una: Lau'], ['planilla', 'Tu planilla'], ['importar', 'Cargar la planilla']],
        Contenido: VentasFuera,
    },
    {
        id: 'ofertas', titulo: 'Ofertas, cupones y liquidación', icono: Ticket, duracion: '5 min', para: 'Dueño',
        resumen: 'Cuándo conviene una oferta y cuándo un cupón, cómo se ponen en un mensaje a Lau, y la liquidación que nunca vende a pérdida.',
        palabras: ['oferta', 'descuento', 'cupon', 'codigo', 'liquidacion', 'promo', 'promocion', 'programada', 'finde', 'off', 'tachado', 'sorteo'],
        secciones: [['cual', 'Oferta o cupón'], ['oferta', 'Poner una oferta'], ['cupon', 'Crear un cupón'], ['liquidacion', 'Liquidación']],
        Contenido: OfertasGuia,
    },
    {
        id: 'diseno', titulo: 'Cambiar textos y fotos de la tienda', icono: Palette, duracion: '5 min', para: 'Dueño',
        resumen: 'La portada, la frase, el botón, la barra dorada de arriba, el popup y las fichas de categoría: dónde se cambia cada cosa y qué queda bien.',
        palabras: ['diseño', 'home', 'portada', 'hero', 'frase', 'eslogan', 'slogan', 'tagline', 'boton', 'barra', 'anuncio', 'popup', 'cintilla', 'marquee', 'categorias', 'fotos', 'textos', 'cms'],
        secciones: [['donde', 'Dónde se cambia'], ['portada', 'La portada'], ['barra', 'Barra y popup'], ['categorias', 'Categorías'], ['mirar', 'Mirar cómo quedó']],
        Contenido: DisenoGuia,
    },
    {
        id: 'pedido-envio', titulo: 'Del pedido al envío: que pasen a buscar', icono: PackageCheck, duracion: '12 min', para: 'Dueño',
        resumen: 'Cuatro pasos por pedido: copiar los datos, cargar el envío en MiCorreo, imprimir la etiqueta y marcar enviado. El Correo pasa a buscar por tu casa.',
        palabras: ['correo', 'micorreo', 'envio', 'etiqueta', 'retiro', 'colecta', 'paquete', 'seguimiento', 'tracking', 'pedidos', 'impresora', 'domicilio', 'sucursal', 'copiar datos'],
        secciones: [['resumen', 'Cómo funciona'], ['cuenta', 'Abrir la cuenta'], ['retiro', 'Pedir el retiro'], ['pedido', 'Cada pedido, paso a paso'], ['sucursal', 'Domicilio o sucursal'], ['numeros', 'Quién paga el envío'], ['trabas', 'Si te trabás']],
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
        resumen: 'Crear la llave nueva de Gemini, pegarla en el panel y borrar la vieja. Y qué hacer cuando Lau dice que fallaron todos los modelos.',
        palabras: ['gemini', 'api key', 'llave', 'clave', 'ai studio', 'cerebras', 'cuota', 'lau no responde'],
        secciones: [['para-que', 'Para qué es'], ['crear', 'Crear y cargar'], ['cuota', 'Cuota agotada'], ['cerebras', 'Cerebras']],
        Contenido: IaKeys,
    },
    {
        id: 'abrir', titulo: 'Abrir la tienda al público', icono: Rocket, duracion: '20 min', para: 'Dueño',
        resumen: 'Qué falta antes de abrir, cómo hacer la compra de prueba, dónde está el interruptor y cómo es el día a día.',
        palabras: ['abrir', 'mantenimiento', 'compra de prueba', 'mercado pago', 'checklist', 'dashboard', 'dia a dia', 'interruptor'],
        secciones: [['estado', 'Qué está listo'], ['antes', 'Antes de abrir'], ['prueba', 'Compra de prueba'], ['abrir', 'Apagar mantenimiento'], ['dia-a-dia', 'El día a día']],
        Contenido: Abrir,
    },
    {
        id: 'instagram', titulo: 'Publicar en Instagram con Lau', icono: Instagram, duracion: '8 min', para: 'Dueño',
        resumen: 'Un trámite de 30 minutos en Meta, una sola vez, y después le decís a Lau "publicá el jean en Instagram" y sale con foto, precio y hashtags.',
        palabras: ['instagram', 'insta', 'redes', 'publicar', 'postear', 'meta', 'token', 'llave', 'cuenta profesional', 'facebook', 'developers', 'vercel', 'hashtags', 'bio'],
        secciones: [['que', 'Qué hace'], ['antes', 'Por qué hay un trámite'], ['profesional', '1. Cuenta profesional'], ['meta', '2. La app en Meta'], ['llave', '3. La llave'], ['vercel', '4. Vercel y probar'], ['usar', '5. Usarlo con Lau'], ['trabas', 'Si te trabás']],
        Contenido: InstagramGuia,
    },
];

/** Busca guías por título, resumen o palabras clave. Sin acentos ni mayúsculas. */
const plano = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const buscarGuias = (termino, guias = GUIAS) => {
    const t = plano(termino).trim();
    if (!t) return guias;
    return guias.filter(g => plano(`${g.titulo} ${g.resumen} ${g.palabras.join(' ')}`).includes(t));
};
