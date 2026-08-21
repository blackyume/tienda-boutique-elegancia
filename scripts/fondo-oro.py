"""Pone una prenda sobre el fondo dorado del catalogo.

Las 12 fotos que ya estan publicadas comparten EXACTAMENTE la misma placa de
fondo: el 40% de sus pixeles son identicos entre foto y foto, y las cuatro
esquinas dan #A07829 en todas, con dispersion cero. O sea que el dorado no se
elige por foto, es una sola placa. Este script la reconstruye y compone
encima la prenda nueva, para que una foto sacada hoy entre al catalogo sin
que se note cual es cual.

De donde salen los numeros:
  - La placa se midio sobre esas 12 fotos, no a ojo. Se tomaron los pixeles
    identicos en las 12 (los que no tienen prenda encima) y se les ajusto una
    campana por canal -- que es como cae la luz de un foco de estudio sobre un
    fondo liso. El error medio del ajuste es de 4,5 sobre 255 (1,8%).
  - El CENTRO de la placa es extrapolado: en las 12 fotos la prenda tapa el
    medio, asi que ahi no hay dato medido. Solo se nota con prendas chicas.
  - El encuadre tambien se midio: la prenda ocupa el 81% del ancho en 11 de
    las 12, centrada en x=50% e y=52%. Las verticales (jeans) quedan limitadas
    por el alto, ~88%.

El recorte usa rembg. Si la prenda sale con el borde comido, casi siempre es
que la foto tenia poco contraste contra su fondo original: conviene sacarla
sobre una pared lisa y clara.

Uso:
    python scripts/fondo-oro.py "C:/ruta/foto.jpg"
    python scripts/fondo-oro.py "C:/ruta/carpeta"      # toda la carpeta
    python scripts/fondo-oro.py --placa                # solo el fondo, suelto
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

LADO = 900              # el catalogo publicado es 900x900
ANCHO_PRENDA = 0.81     # medido: 81% del ancho en 11 de 12 fotos
ALTO_MAXIMO = 0.88      # las verticales topean aca
CENTRO_Y = 0.52         # medido: la prenda cae apenas debajo del medio
ALTO_REFLEJO = 0.28     # cuanto de la prenda devuelve el piso
OPACIDAD_REFLEJO = 0.34

# Campana por canal ajustada sobre las 12 fotos: base + pico * exp(-r^2/2s^2)
CAMPANA = {
    "R": (129.7, 93.3, 0.91),
    "G": (80.0, 108.7, 0.96),
    "B": (-9.6, 118.7, 1.05),
}

EXTENSIONES = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff"}


def placa_dorada(ancho=LADO, alto=LADO):
    """Reconstruye el fondo del catalogo al tamano que se pida."""
    yy, xx = np.mgrid[0:alto, 0:ancho]
    cx, cy = (ancho - 1) / 2, (alto - 1) / 2
    r = np.sqrt(((xx - cx) / cx) ** 2 + ((yy - cy) / cy) ** 2)
    canales = [base + pico * np.exp(-(r ** 2) / (2 * s ** 2))
               for base, pico, s in CAMPANA.values()]
    return Image.fromarray(np.clip(np.stack(canales, -1), 0, 255).astype(np.uint8))


def recortar(foto):
    """Devuelve la prenda con alfa, ya sin su fondo original."""
    from rembg import remove
    from scipy import ndimage

    recorte = remove(foto.convert("RGBA"))

    # Si la foto original traia sombra o reflejo en el piso, rembg los recorta
    # como si fueran parte de la prenda y quedan flotando sobre el dorado. Nos
    # quedamos solo con la mancha mas grande, que siempre es la prenda.
    alfa = np.asarray(recorte)[..., 3]
    piezas, cuantas = ndimage.label(alfa > 24)
    if cuantas > 1:
        tamanos = ndimage.sum(alfa > 24, piezas, range(1, cuantas + 1))
        limpio = np.asarray(recorte).copy()
        limpio[..., 3] = np.where(piezas == int(np.argmax(tamanos)) + 1, alfa, 0)
        recorte = Image.fromarray(limpio)
    return recorte


def encuadrar(prenda):
    """Escala la prenda al encuadre del catalogo y la centra."""
    caja = prenda.getbbox()
    if caja is None:
        raise SystemExit("el recorte salio vacio: la prenda no se distingue de su fondo")
    prenda = prenda.crop(caja)

    escala = min(LADO * ANCHO_PRENDA / prenda.width,
                 LADO * ALTO_MAXIMO / prenda.height)
    tam = (max(1, round(prenda.width * escala)), max(1, round(prenda.height * escala)))
    return prenda.resize(tam, Image.LANCZOS)


def reflejo(prenda, lienzo, posicion):
    """El piso del catalogo es brillante y devuelve la prenda espejada.

    Sin esto una foto nueva se distingue al toque de las 12 publicadas: en
    aquellas el reflejo suma casi 6 puntos al alto de la prenda.
    """
    espejo = prenda.transpose(Image.FLIP_TOP_BOTTOM)
    alto = max(1, round(espejo.height * ALTO_REFLEJO))
    espejo = espejo.crop((0, 0, espejo.width, alto))

    desvanecido = np.linspace(OPACIDAD_REFLEJO, 0, alto)[:, None]
    datos = np.asarray(espejo).copy()
    datos[..., 3] = (datos[..., 3] * desvanecido).astype(np.uint8)
    espejo = Image.fromarray(datos).filter(ImageFilter.GaussianBlur(2.5))

    capa = Image.new("RGBA", lienzo, (0, 0, 0, 0))
    capa.paste(espejo, (posicion[0], posicion[1] + prenda.height + 2), espejo)
    return capa


def sombra(prenda, lienzo, posicion):
    """Sombra suave debajo: sin esto la prenda flota sobre el dorado."""
    capa = Image.new("RGBA", lienzo, (0, 0, 0, 0))
    tinta = Image.new("RGBA", prenda.size, (46, 30, 6, 150))
    capa.paste(tinta, (posicion[0] + 6, posicion[1] + 26), prenda)
    return capa.filter(ImageFilter.GaussianBlur(22))


def procesar(origen, destino=None):
    foto = Image.open(origen)
    prenda = encuadrar(recortar(foto))

    fondo = placa_dorada().convert("RGBA")
    x = (LADO - prenda.width) // 2
    y = round(LADO * CENTRO_Y) - prenda.height // 2
    y = max(0, min(y, LADO - prenda.height))

    fondo.alpha_composite(sombra(prenda, (LADO, LADO), (x, y)))
    fondo.alpha_composite(reflejo(prenda, (LADO, LADO), (x, y)))
    fondo.alpha_composite(prenda, (x, y))

    salida = Path(destino) if destino else Path(origen).with_name(Path(origen).stem + "-oro.jpg")
    fondo.convert("RGB").save(salida, quality=92, subsampling=0)
    return salida


def main():
    args = [a for a in sys.argv[1:] if a]
    if not args:
        raise SystemExit(__doc__)

    if args[0] == "--placa":
        salida = Path(args[1]) if len(args) > 1 else Path("placa-oro.png")
        placa_dorada().save(salida)
        print(f"placa -> {salida}")
        return

    ruta = Path(args[0])
    if ruta.is_dir():
        fotos = [f for f in sorted(ruta.iterdir())
                 if f.suffix.lower() in EXTENSIONES and not f.stem.endswith("-oro")]
        if not fotos:
            raise SystemExit(f"no hay fotos en {ruta}")
        for f in fotos:
            print(f"{f.name} -> {procesar(f).name}")
    else:
        print(f"listo -> {procesar(ruta, args[1] if len(args) > 1 else None)}")


if __name__ == "__main__":
    main()
