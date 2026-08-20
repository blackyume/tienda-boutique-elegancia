"""Arma las dos portadas del hero a partir de una foto vertical de modelo.

Las fotos de modelo vienen verticales (2:3) sobre fondo dorado de estudio y el
hero es una imagen a pantalla completa. Este script hace las dos versiones que
pide `Hero.jsx`:

  <nombre>.webp     2000x1125  escritorio — el dorado se extiende a los costados
  <nombre>-sm.webp   760x1310  telefono   — con dorado extra arriba

Por que asi:
  - El dorado de los costados sale de las FRANJAS LATERALES de la propia foto,
    no de desenfocarla entera: desenfocar arrastraba una mancha azul del jean.
  - La modelo entra al 90% del alto porque el hero hace un zoom lento (kenburns
    1,02 -> 1,07) y al 100% le come la cabeza y los pies.
  - En el telefono se suma dorado arriba para que la cara no quede detras del
    logo del navbar, que ocupa ~15% de la pantalla.

Uso:
    python scripts/armar-portada.py "C:/ruta/foto.jpeg" portada-modelo-2
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

RAIZ = Path(__file__).resolve().parent.parent
DESTINO = RAIZ / "public"

ANCHO_ESC, ALTO_ESC = 2000, 1125
ANCHO_TEL, ALTO_TEL = 760, 1310
ALTO_MODELO = 0.90      # cuanto del alto del lienzo ocupa la modelo
CENTRO_X = 0.67         # donde cae su eje; la izquierda queda para el texto
FRANJA = 55             # px de cada lado que se usan para fabricar el dorado
PLUMA = 90              # difuminado del borde para fundir con el fondo


def fondo_dorado(foto, ancho, alto):
    """Estira las franjas laterales de la foto hasta cubrir el lienzo."""
    a = np.asarray(foto.convert("RGB")).astype(float)
    izq = a[:, :FRANJA].mean(1)
    der = a[:, -FRANJA:].mean(1)
    filas = np.linspace(0, len(izq) - 1, alto)
    izq = np.stack([np.interp(filas, np.arange(len(izq)), izq[:, c]) for c in range(3)], 1)
    der = np.stack([np.interp(filas, np.arange(len(der)), der[:, c]) for c in range(3)], 1)
    t = np.linspace(0, 1, ancho)[None, :, None]
    campo = izq[:, None, :] * (1 - t) + der[:, None, :] * t
    img = Image.fromarray(np.clip(campo, 0, 255).astype(np.uint8))
    return img.filter(ImageFilter.GaussianBlur(24))


def mascara_pluma(ancho, alto, pluma):
    m = Image.new("L", (ancho, alto), 255)
    a = np.asarray(m).astype(float)
    r = np.clip(np.arange(pluma) / pluma, 0, 1)
    a[:, :pluma] *= r[None, :]
    a[:, -pluma:] *= r[::-1][None, :]
    a[:pluma, :] *= r[:, None]
    a[-pluma:, :] *= r[::-1][:, None]
    return Image.fromarray(a.astype(np.uint8))


def escritorio(foto):
    lienzo = fondo_dorado(foto, ANCHO_ESC, ALTO_ESC)
    alto = int(ALTO_ESC * ALTO_MODELO)
    ancho = round(foto.width * alto / foto.height)
    m = foto.resize((ancho, alto), Image.LANCZOS)
    x = int(ANCHO_ESC * CENTRO_X) - ancho // 2
    y = ALTO_ESC - alto                       # apoyada abajo
    lienzo.paste(m, (x, y), mascara_pluma(ancho, alto, PLUMA))
    return lienzo


def telefono(foto):
    lienzo = fondo_dorado(foto, ANCHO_TEL, ALTO_TEL)
    alto = int(ALTO_TEL * 0.85)               # el 15% de arriba queda dorado
    ancho = round(foto.width * alto / foto.height)
    m = foto.resize((ancho, alto), Image.LANCZOS)
    x = ANCHO_TEL // 2 - ancho // 2
    lienzo.paste(m, (x, ALTO_TEL - alto), mascara_pluma(ancho, alto, PLUMA))
    return lienzo


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        raise SystemExit(1)
    origen, nombre = Path(sys.argv[1]), sys.argv[2]
    foto = Image.open(origen).convert("RGB")

    esc = escritorio(foto)
    tel = telefono(foto)
    esc.save(DESTINO / f"{nombre}.webp", quality=82, method=6)
    esc.save(DESTINO / f"{nombre}.jpg", quality=82, optimize=True)
    tel.save(DESTINO / f"{nombre}-sm.webp", quality=82, method=6)

    for f in (f"{nombre}.webp", f"{nombre}.jpg", f"{nombre}-sm.webp"):
        p = DESTINO / f
        print(f"{f:32s} {Image.open(p).size}  {p.stat().st_size/1024:6.1f} kB")


if __name__ == "__main__":
    main()
