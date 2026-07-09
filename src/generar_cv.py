# -*- coding: utf-8 -*-
"""Genera el CV en PDF de Ignacio Aguayo (assets/cv/CV_Ignacio_Aguayo.pdf).

Enfoque: perfil de tecnólogo creativo orientado a ARTE LUMÍNICO, EXPERIENCIAS
INMERSIVAS y MEDIACIÓN ARTÍSTICA (colectivos de new media art, centros
culturales, festivales). Diseño: encabezado oscuro estilo "cyber" (a juego
con el portafolio) y cuerpo claro para que imprima bien. Una página A4.
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
BLUE = HexColor("#3b82f6")
PURPLE = HexColor("#8b5cf6")
GRAY = HexColor("#475569")
LIGHTGRAY = HexColor("#64748b")
TEXT = HexColor("#1e293b")

c = canvas.Canvas(OUT, pagesize=A4)
c.setTitle("CV Ignacio Aguayo - Creative Technologist · Arte Lumínico e Inmersivo")
c.setAuthor("Ignacio Aguayo")

# ---------- Encabezado oscuro ----------
HEADER_H = 52 * mm
c.setFillColor(DARK)
c.rect(0, H - HEADER_H, W, HEADER_H, stroke=0, fill=1)
c.setFillColor(BLUE)
c.rect(0, H - HEADER_H, W / 2, 1.6 * mm, stroke=0, fill=1)
c.setFillColor(PURPLE)
c.rect(W / 2, H - HEADER_H, W / 2, 1.6 * mm, stroke=0, fill=1)

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
c.setFont("Helvetica-Bold", 12)
c.drawString(x0, H - 29.5 * mm, "CREATIVE TECHNOLOGIST  ·  ARTE LUMÍNICO E INTERACTIVO")
c.setFillColor(HexColor("#94a3b8"))
c.setFont("Helvetica", 9)
c.drawString(x0, H - 36.5 * mm, "Concepción, Chile   ·   i.aguayo2212@gmail.com")
c.drawString(x0, H - 41.5 * mm, "nach2212.github.io   ·   github.com/Nach2212")

c.setFillColor(HexColor("#cbd5e1"))
c.setFont("Helvetica-Oblique", 9.5)
c.drawString(18 * mm, H - 48.5 * mm,
             "Instalaciones lumínicas, experiencias inmersivas y mediación artística: arte y código al servicio de la comunidad.")

# ---------- utilidades ----------
y = H - HEADER_H - 11 * mm
LM, RM = 18 * mm, W - 18 * mm

def section(title):
    global y
    c.setFillColor(BLUE)
    c.rect(LM, y - 1, 8 * mm, 2.2, stroke=0, fill=1)
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(LM + 10 * mm, y - 2, title.upper())
    y -= 9 * mm

def bullet(bold, rest, size=9.4, gap=5.8):
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

def para(text, size=9.6, leading=5.0, color=GRAY, max_w=None, indent=0):
    global y
    max_w = max_w or (RM - LM - indent)
    c.setFont("Helvetica", size)
    c.setFillColor(color)
    words, line = text.split(), ""
    for w_ in words:
        t = (line + " " + w_).strip()
        if c.stringWidth(t, "Helvetica", size) <= max_w:
            line = t
        else:
            c.drawString(LM + indent, y, line)
            y -= leading * mm
            line = w_
    if line:
        c.drawString(LM + indent, y, line)
        y -= leading * mm

def proyecto(title, tech, desc):
    global y
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 10.6)
    c.drawString(LM, y, title)
    c.setFillColor(PURPLE)
    c.setFont("Helvetica-Bold", 8.2)
    c.drawString(LM + c.stringWidth(title, "Helvetica-Bold", 10.6) + 3 * mm, y, tech)
    y -= 4.9 * mm
    para(desc, size=9.2, leading=4.6)
    y -= 2.2 * mm

# ---------- Perfil ----------
section("Perfil")
para("Tecnólogo creativo enfocado en la intersección entre arte, luz y código. Creo instalaciones "
     "interactivas que responden al cuerpo y al gesto, experiencias inmersivas en realidad virtual "
     "y espacios de aprendizaje donde comunidades y niños co-crean con tecnología. Me mueve llevar "
     "el arte digital a públicos reales: la calle, la escuela, la biblioteca y el festival.")
y -= 3.5 * mm

# ---------- Obra y experiencia ----------
section("Obra y Experiencia")
proyecto("Instalaciones interactivas con luz y gesto", "TouchDesigner · Hand Tracking · Visuales generativos",
         "Serie de obras controladas con las manos en el espacio: galería circular inmersiva, "
         "deconstrucción de objetos 3D en tiempo real y visuales reactivos al movimiento y al sonido.")
proyecto("Codex del Cosmos", "Unity · VR Meta Quest · Fondo Audiovisual",
         "Obra contemplativa en realidad virtual: el visitante manipula la luz fósil del universo con sus "
         "manos, sin controles, para provocar asombro y conexión con el paisaje cósmico.")
proyecto("Mediación artística: talleres de co-creación con IA", "Facilitador · IA generativa · VR",
         "Diseño y facilitación de talleres infantiles: dibujos en papel animados con IA y reconstruidos "
         "en 3D para verlos en visores VR. Los niños viven el puente entre su imaginación y la tecnología.")
proyecto("Exhibiciones en espacio público", "Festival REC · Biblioteca Municipal de Concepción",
         "Montaje y operación de obras ante audiencias masivas: juego de esquive con body tracking en el "
         "festival REC y galería VR para la comunidad fotográfica Afoconce (Meta Quest 2).")
proyecto("GearMap", "Unity · Móvil · Gemelo digital 3D",
         "App de entrenamiento con modelos 3D interactivos para equipos de emergencia; postulada a fondos "
         "públicos (Sercotec, Jump Chile). Tecnología con propósito social.")
y -= 2.5 * mm

# ---------- Habilidades ----------
section("Herramientas y Lenguajes")
skills = ["TouchDesigner", "Projection / Mapping", "Unity / C#", "VR · Meta Quest", "AR Móvil",
          "Hand & Body Tracking", "Kinect / Sensores", "Shaders y Visuales Generativos",
          "Blender / Maya", "After Effects", "IA Generativa", "Creative Coding"]
cx, cy = LM, y
c.setFont("Helvetica-Bold", 8.6)
for s in skills:
    wpx = c.stringWidth(s, "Helvetica-Bold", 8.6) + 7 * mm
    if cx + wpx > RM:
        cx = LM
        cy -= 8.2 * mm
    c.setFillColor(HexColor("#eff6ff"))
    c.setStrokeColor(HexColor("#bfdbfe"))
    c.roundRect(cx, cy - 2 * mm, wpx, 6.2 * mm, 3 * mm, stroke=1, fill=1)
    c.setFillColor(HexColor("#1d4ed8"))
    c.drawString(cx + 3.5 * mm, cy, s)
    cx += wpx + 2.6 * mm
y = cy - 9.5 * mm

# ---------- Formación y certificaciones ----------
section("Formación y Certificaciones")
c.setFillColor(DARK)
c.setFont("Helvetica-Bold", 10.6)
c.drawString(LM, y, "Animación Digital — Universidad San Sebastián")
c.setFillColor(PURPLE)
c.setFont("Helvetica-Bold", 8.2)
c.drawString(LM + c.stringWidth("Animación Digital — Universidad San Sebastián", "Helvetica-Bold", 10.6) + 3 * mm,
             y, "4º año · New Media Lab")
y -= 4.9 * mm
para("Grado académico de Bachiller en Animación. Vinculado al laboratorio de nuevos medios de la USS.",
     size=9.2, leading=4.6)
y -= 2.2 * mm
bullet("Comunicación escénica:", "certificación en hablar en público con técnicas teatrales.")
bullet("Trabajo seguro con públicos:", "primeros auxilios psicológicos y reanimación cardiopulmonar (RCP).")
bullet("Gestión:", "certificaciones en diseño de modelos de negocio, gestión financiera y negociación.")
y -= 2 * mm

# ---------- Más allá del código ----------
section("Más Allá del Código")
bullet("Bombero voluntario (8ª Cía. de Concepción).", "Servicio comunitario, montaje seguro y calma bajo presión.")
bullet("Trekking y montaña.", "La naturaleza y el paisaje como fuente creativa y de equilibrio.")
bullet("Corredor de larga distancia.", "Disciplina y constancia para proyectos de largo aliento.")

# ---------- pie ----------
c.setFillColor(LIGHTGRAY)
c.setFont("Helvetica-Oblique", 7.5)
c.drawCentredString(W / 2, 5.5 * mm, "Portafolio completo con demos en video: nach2212.github.io")

c.save()
print("OK ->", OUT)
