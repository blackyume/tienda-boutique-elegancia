# Cargar muchos productos de una vez

Para no cargar uno por uno. Necesitás dos cosas: **un Excel** con los datos y
**una carpeta con las fotos**. Se sueltan juntos en el panel y listo.

La plantilla del Excel está acá al lado: `plantilla-productos.xlsx`. Tiene tres
productos de ejemplo (borralos) y una segunda hoja que explica cada columna.

---

## 1. Las fotos

Las fotos **no van adentro del Excel**. Van sueltas, en una carpeta. Se emparejan
solas con cada producto **por el nombre del archivo**.

**La regla es una sola: el archivo se llama como el producto.**

| Producto en el Excel | Archivo |
|---|---|
| Jean Elastizado Oxford | `jean-elastizado-oxford.jpg` |
| Campera Ecocuero Chocolate | `campera-ecocuero-chocolate.jpg` |
| Top Cola de Ratón Morley | `top-cola-de-raton-morley.jpg` |

Da igual si lo escribís con mayúsculas, con acentos, con guiones, con guión bajo
o con espacios: `Jean Elastizado Oxford.JPG`, `jean_elastizado_oxford.png` y
`jean-elastizado-oxford.jpg` son lo mismo.

**Varias fotos del mismo producto:** le agregás un número al final.

```
jean-elastizado-oxford-1.jpg   ← ésta es la principal (la de la grilla)
jean-elastizado-oxford-2.jpg
jean-elastizado-oxford-3.jpg
```

Sirven `.jpg`, `.png` y `.webp`. Las fotos vienen como las sacaste, con la
modelo y su fondo: **no hay que retocarlas ni pasarlas por nada**.

> Si un archivo tiene otro nombre y no lo querés renombrar, ponés ese nombre en
> la columna **Foto** del Excel (`foto-047.jpg`). Pero lo más fácil es nombrar
> bien el archivo y dejar esa columna vacía.

---

## 2. El Excel

Abrí `plantilla-productos.xlsx` y llenás una fila por producto.

| Columna | Qué va | Obligatoria |
|---|---|---|
| **Producto** | El nombre. Es lo que se ve en la tienda y lo que empareja la foto. | Sí |
| **Categoría** | Tiene que existir en Admin → Categorías, escrita igual. | No |
| **Precio venta** | Lo que paga la clienta. Acepta `46500`, `46.500` o `$ 46.500`. | Sí, para productos nuevos |
| **Costo** | Lo que te costó. El panel calcula la ganancia con esto. | No |
| **Stock** | Cuántos tenés. Número entero. Vacío = 0. | No |
| **Talles** | Separados por coma: `S, M, L` o `36, 38, 40`. Vacío = S, M. | No |
| **Colores** | Separados por coma: `negro, chocolate`. | No |
| **Estado** | `Publicado` o `Borrador`. Vacío = publicado si tiene foto. | No |
| **Foto** | Casi siempre vacía (ver arriba). | No |
| **Descripción** | Texto libre que ve la clienta. | No |

Dos cosas que conviene saber:

- **Un producto sin foto entra oculto** (borrador), aunque le pongas
  "Publicado". Es a propósito: en la tienda no se muestra nada sin imagen. Le
  subís la foto después desde el panel y lo publicás.
- **El nombre es la llave de todo.** Si más adelante cambiás un nombre en el
  Excel, el importador va a pensar que es un producto nuevo.

---

## 3. Importar

1. Entrás a **Admin → Inventario → ⤴ Importar Excel** (arriba a la derecha, al lado de Exportar).
2. Seleccionás **el Excel y todas las fotos juntos** y los soltás en el
   recuadro. En el explorador de Windows: click en el Excel, `Ctrl+A`, y
   arrastrás todo. También podés soltar primero el Excel y después las fotos.
3. Aparece la **vista previa**. Todavía no se guardó nada. Ahí ves:
   - **Nuevos**: los que se van a crear, cada uno con sus miniaturas y si entra
     publicado o como borrador.
   - **Actualizados**: los que ya existían y cambian precio, stock, etc.
   - **Con foto**: cuántos van con imagen.
   - **Fotos que no van a ningún producto**: archivos cuyo nombre no coincide
     con ninguna fila. Casi siempre es un nombre mal escrito. Las renombrás y
     las volvés a soltar; la vista previa se actualiza sola.
   - **Con error**: filas que no se van a tocar y por qué (sin nombre, sin
     precio, nombre repetido).
4. Si está todo bien, **Confirmar importación**. Sube las fotos y crea los
   productos. Abajo ves el avance.

---

## 4. Después: cambiar precios o stock

No hace falta la carpeta de fotos. **Exportar Excel** en el panel te baja la
planilla con todo lo que hay; cambiás los precios en Excel, la volvés a
importar, y en la vista previa ves exactamente qué cambia en cada producto
(precio anterior → precio nuevo) antes de confirmar.

A un producto que **ya tiene foto no se le pisa**, aunque haya un archivo con
su nombre en la carpeta. Si querés cambiarle la foto, se hace desde el producto
en el panel.

---

## Si algo sale mal

| Ves | Qué pasa | Qué hacer |
|---|---|---|
| "No pude leer el archivo" | No es `.xlsx` ni `.csv`, o está corrupto. | Guardalo desde Excel como `.xlsx`. |
| Un producto quedó como borrador sin querer | No encontró su foto. | Fijate en "Fotos que no van a ningún producto": el archivo tiene otro nombre. |
| "Ya tiene foto: las N del archivo no se tocan" | El producto existía y tenía imagen. | Es normal. La foto se cambia desde el producto. |
| "Hay más de un producto con ese nombre en la tienda" | Tenés dos productos iguales en el panel. | Borrá o renombrá uno en el panel y volvé a importar. |
| "Producto nuevo sin precio" | Falta el precio en esa fila. | Ponele precio. |
| Quedó como borrador "porque la foto no se pudo subir" | Cloudinary falló para esa foto. | Subísela desde el producto. Suele ser internet. |
