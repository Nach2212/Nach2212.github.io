# -*- coding: utf-8 -*-
"""Genera el CV en PDF de Ignacio Aguayo (assets/cv/CV_Ignacio_Aguayo.pdf).

El contenido y el diseño viven en src/cv/cv.html (con el logo y las fuentes
de la marca). Este script lo imprime a PDF A4 con Chromium vía Playwright.

Requisitos (una vez):  pip install playwright  &&  python -m playwright install chromium
Regenerar con:         python src/generar_cv.py   (desde la raíz del repo)

Sin Python: abre src/cv/cv.html en Chrome → Imprimir → Guardar como PDF
(tamaño A4, márgenes "Ninguno", activar "Gráficos de fondo").
"""
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src" / "cv" / "cv.html"
OUT = ROOT / "assets" / "cv" / "CV_Ignacio_Aguayo.pdf"


def main():
    chrome = os.environ.get("CHROME_PATH")  # opcional: ruta a un Chrome/Chromium propio
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
        page = browser.new_page()
        page.goto(SRC.as_uri(), wait_until="networkidle")
        page.evaluate("document.fonts.ready")
        page.pdf(path=str(OUT), format="A4", print_background=True,
                 margin={"top": "0", "right": "0", "bottom": "0", "left": "0"})
        browser.close()
    print("OK ->", OUT)


if __name__ == "__main__":
    sys.exit(main())
