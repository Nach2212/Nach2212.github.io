# -*- coding: utf-8 -*-
"""Genera el CV en PDF de Ignacio Aguayo (assets/cv/CV_Ignacio_Aguayo.pdf).

Diseño: encabezado oscuro estilo "cyber" (a juego con el portafolio) y cuerpo
claro para que imprima bien. Una sola página A4.
Regenerar con:  python src/generar_cv.py  (desde la raíz del repo)
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "cv", "CV_Ignacio_Aguayo.pdf")
LOGO = os.path.join(ROOT, "assets", "Logo.png")

W, H = A4
DARK = HexColor("#030712")
SLATE = HexColor("#0f172a")
BLUE = HexColor("#3b82f6")
PURPLE = HexColor("#8b5cf6")
GRAY = HexColor("#475569")
LIGHTGRAY = HexColor("#64748b")
TEXT = HexColor("#1e293b")

c = canvas.Canvas(OUT, pagesize=A4)
c.setTitle("CV Ignacio Aguayo - Creative Technologist")
c.setAuthor("Ignacio Aguayo")

# ---------- Encabezado oscuro ----------
HEADER_H = 52 * mm
c.setFillColor(DARK)
c.rect(0, H - HEADER_H, W, HEADER_H, stroke=0, fill=1)
# franja de acento degradada (simulada con dos bloques)
c.setFillColor(BLUE)
c.rect(0, H - HEADER_H, W / 2, 1.6 * mm, stroke=0, fill=1)
c.setFillColor(PURPLE)
c.rect(W / 2, H - HEADER_H, W / 2, 1.6 * mm, stroke=0, fill=1)

# logo
try:
    logo = ImageReader(LOGO)
    size = 26 * mm
    c.drawImage(logo, 18 * mm, H - 14 * mm - size, size, size, mask="auto")
except Exception:
    pass

x0 = 50 * mm
c.setFillColor(white)
c.setFont("Helvetica-Bold", 27)
c.drawString(x0, H - 22 * mm, "IGNACIO AGUAYO")
c.setFillColor(BLUE)
c.setFont("Helvetica-Bold", 13)
c.drawString(x0, H - 29.5 * mm, "CREATIVE TECHNOLOGIST")
c.setFillColor(HexColor("#94a3b8"))
c.setFont("Helvetica", 9)
c.drawString(x0, H - 36.5 * mm, "Concepción, Chile   ·   i.aguayo2212@gmail.com")
c.drawString(x0, H - 41.5 * mm, "nach2212.github.io   ·   github.com/Nach2212")

c.setFillColor(HexColor("#cbd5e1"))
c.setFont("Helvetica-Oblique", 9.5)
c.drawString(18 * mm, H - 48.5 * mm,
             "Construyo experiencias interactivas que conectan el mundo digital y el físico.")

# ---------- utilidades ----------
y = H - HEADER_H - 16 * mm
LM, RM = 18 * mm, W - 18 * mm

def section(title):
    global y
    c.setFillColor(BLUE)
    c.rect(LM, y - 1, 8 * mm, 2.2, stroke=0, fill=1)
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 12.5)
    c.drawString(LM + 10 * mm, y - 2, title.upper())
    y -= 9.5 * mm

def bullet(bold, rest, size=9.8, gap=6.2):
    global y
    c.setFillColor(PURPLE)
    c.circle(LM + 1.5 * mm, y + 1.2, 1.1, stroke=0, fill=1)
    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", size)
    bw = c.stringWidth(bold + "  ", "Helvetica-Bold", size)
    c.drawString(LM + 4 * mm, y, bold)
    c.setFont("Helvetica", size)
    c.setFillColor(GRAY)
    c.drawString(LM + 4 * mm + bw, y, rest)
    y -= gap * mm

def para(text, size=9.8, leading=5.2, color=GRAY, max_w=None):
    global y
    max_w = max_w or (RM - LM)
    c.setFont("Helvetica", size)
    c.setFillColor(color)
    words, line = text.split(), ""
    for w_ in words:
        t = (line + " " + w_).strip()
        if c.stringWidth(t, "Helvetica", size) <= max_w:
            line = t
        else:
            c.drawString(LM, y, line)
            y -= leading * mm
            line = w_
    if line:
        c.drawString(LM, y, line)
        y -= leading * mm

# ---------- Perfil ----------
section("Perfil")
para("Tecnólogo creativo apasionado por la intersección del arte y el código. Diseño y desarrollo "
     "instalaciones interactivas, aplicaciones de realidad virtual y aumentada, y experiencias "
     "inmersivas que desafían la percepción y conectan con las personas a un nivel más profundo.")
y -= 6 * mm

# ---------- Habilidades ----------
section("Habilidades Técnicas")
skills = ["Unity / C#", "Desarrollo VR/AR (Meta Quest)", "TouchDesigner", "Hand & Body Tracking",
          "Apps Móviles", "Modelado y Animación 3D", "Blender / After Effects", "UX/UI",
          "Shaders y Visuales Generativos", "IA Generativa", "Creative Coding"]
cx, cy = LM, y
c.setFont("Helvetica-Bold", 9)
for s in skills:
    wpx = c.stringWidth(s, "Helvetica-Bold", 9) + 8 * mm
    if cx + wpx > RM:
        cx = LM
        cy -= 8.8 * mm
    c.setFillColor(HexColor("#eff6ff"))
    c.setStrokeColor(HexColor("#bfdbfe"))
    c.roundRect(cx, cy - 2 * mm, wpx, 6.6 * mm, 3 * mm, stroke=1, fill=1)
    c.setFillColor(HexColor("#1d4ed8"))
    c.drawString(cx + 4 * mm, cy, s)
    cx += wpx + 3 * mm
y = cy - 12 * mm

# ---------- Proyectos ----------
section("Proyectos Destacados")
projects = [
    ("Galería VR para Fotógrafos", "Unity · Meta Quest 2",
     "Galería virtual inmersiva exhibida en la Biblioteca Municipal de Concepción junto a la comunidad Afoconce."),
    ("App de Entrenamiento para Bomberos", "Unity · Mobile · 3D",
     "Herramienta de estudio para ubicar material del carro bomba y consultar procedimientos de emergencia."),
    ("Instalaciones Interactivas con Hand Tracking", "TouchDesigner · IA",
     "Galería circular, deconstrucción 3D en tiempo real y visuales generados por IA controlados con gestos."),
    ("REC — Obstáculos en Tiempo Real", "Unity · Body Tracking",
     "Experiencia de esquivar obstáculos con el cuerpo, exhibida en el stand de la U. San Sebastián en el festival REC."),
    ("Talleres de IA y 3D para Niños", "Facilitador · Gemini · VR",
     "Co-creación infantil: dibujos animados con IA y reconstrucción 3D visualizada en visores VR."),
]
for title, tech, desc in projects:
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(LM, y, title)
    c.setFillColor(PURPLE)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawString(LM + c.stringWidth(title, "Helvetica-Bold", 11) + 3 * mm, y, tech)
    y -= 5.2 * mm
    para(desc, size=9.4, leading=4.8)
    y -= 3.4 * mm

y -= 3 * mm

# ---------- Más allá del código ----------
section("Más Allá del Código")
bullet("Bombero Voluntario.", "Compromiso con la comunidad y trabajo en equipo bajo presión.")
bullet("Running de larga distancia.", "Disciplina, constancia y metas ambiciosas paso a paso.")
bullet("Trekking.", "Adaptabilidad, claridad mental y conexión con la naturaleza.")

# ---------- pie ----------
c.setFillColor(LIGHTGRAY)
c.setFont("Helvetica-Oblique", 7.5)
c.drawCentredString(W / 2, 10 * mm, "Portafolio completo con demos en video: nach2212.github.io")

c.save()
print("OK ->", OUT)
