# -*- coding: utf-8 -*-
"""Genera el CV en PDF de Ignacio Aguayo (assets/cv/CV_Ignacio_Aguayo.pdf).

Enfoque fusionado: perfil "Creative Technologist & XR Developer" con la
experiencia profesional formal (New Media Lab USS, Festival REC), más la obra
personal y los proyectos con impacto real. Diseño: encabezado oscuro estilo
"cyber" (a juego con el portafolio) y cuerpo claro para que imprima bien.
Una página A4.
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
SLATE = HexColor("#334155")

c = canvas.Canvas(OUT, pagesize=A4)
c.setTitle("CV Ignacio Aguayo - Creative Technologist & XR Developer")
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
c.drawString(x0, H - 29.5 * mm, "CREATIVE TECHNOLOGIST  \u00b7  XR DEVELOPER")
c.setFillColor(HexColor("#94a3b8"))
c.setFont("Helvetica", 9)
c.drawString(x0, H - 36.5 * mm, "Concepci\u00f3n, Chile  \u00b7  i.aguayo2212@gmail.com  \u00b7  +56 9 5733 1178")
c.drawString(x0, H - 41.5 * mm, "nach2212.github.io  \u00b7  github.com/Nach2212  \u00b7  linkedin.com/in/ignacio-aguayo")

c.setFillColor(HexColor("#cbd5e1"))
c.setFont("Helvetica-Oblique", 9.5)
c.drawString(18 * mm, H - 48.5 * mm,
             "Desarrollo e ingenier\u00eda creativa en VR/AR e instalaciones interactivas. Buscando oportunidades remotas en XR.")

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

def role(title, org, dates, tech=""):
    """Encabezado de puesto: título + organización + fechas alineadas a la derecha."""
    global y
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 10.6)
    c.drawString(LM, y, title)
    if tech:
        c.setFillColor(PURPLE)
        c.setFont("Helvetica-Bold", 8.2)
        c.drawString(LM + c.stringWidth(title, "Helvetica-Bold", 10.6) + 3 * mm, y, tech)
    c.setFillColor(LIGHTGRAY)
    c.setFont("Helvetica-Oblique", 8.6)
    c.drawRightString(RM, y, f"{org}   {dates}")
    y -= 4.9 * mm

# ---------- Perfil ----------
section("Perfil")
para("Desarrollador e ingeniero creativo con experiencia en el dise\u00f1o y ejecuci\u00f3n de experiencias "
     "inmersivas (VR/AR) e interactivas. Especializado en Unity, TouchDesigner y tecnolog\u00edas de tracking "
     "(mano y cuerpo) para crear aplicaciones con prop\u00f3sito: capacitaci\u00f3n, educaci\u00f3n y engagement. "
     "Capacidad probada para llevar proyectos desde el concepto hasta su montaje en eventos en vivo. "
     "Buscando oportunidades remotas para aplicar habilidades en XR y tecnolog\u00edas creativas a proyectos de impacto real.")
y -= 3.5 * mm

# ---------- Experiencia profesional ----------
section("Experiencia Profesional")
role("Desarrollador de Experiencias Inmersivas (VR/AR)", "New Media Lab \u2014 USS", "2023 \u2013 Presente")
bullet("", "Dise\u00f1o y desarrollo de experiencias interactivas en Unity y TouchDesigner para captar prospectos.")
bullet("", "Integraci\u00f3n de Hand y Body Tracking para crear interacciones activas que aumentan retenci\u00f3n y engagement.")
bullet("", "Combinaci\u00f3n de programaci\u00f3n con projection mapping para instalaciones h\u00edbridas en espacios f\u00edsicos.")
bullet("", "Montaje, prueba y operaci\u00f3n de software/hardware en eventos de alta concurrencia.")
y -= 1.5 * mm
role("Desarrollador de Proyecto Interactivo", "Festival REC", "2023")
bullet("", "Videojuego interactivo en tiempo real con Body Tracking, exhibido p\u00fablicamente durante 2 d\u00edas.")
bullet("", "Los usuarios controlaban avatares con movimiento corporal para esquivar y atrapar objetos en pantalla.")
bullet("", "Gesti\u00f3n end-to-end del proyecto: +200 asistentes pasaron por el stand (interacci\u00f3n 1 a 1).")
y -= 2.5 * mm

# ---------- Proyectos destacados ----------
section("Proyectos Destacados")
role("GearMap \u2014 App de Entrenamiento de Emergencia", "Gemelo Digital 3D", "",
     tech="Unity \u00b7 C# \u00b7 M\u00f3vil")
para("App m\u00f3vil interactiva con modelos 3D para la capacitaci\u00f3n de equipos de emergencia (bomberos). "
     "Inventario digital de +100 herramientas distribuidas en +7 compartimientos de un carro bomba, "
     "para una compa\u00f1\u00eda en operaci\u00f3n. Postulada a fondos p\u00fablicos (Sercotec, Jump Chile).",
     size=9.2, leading=4.6)
y -= 2.2 * mm
role("Codex del Cosmos \u2014 Experiencia VR Inmersiva", "Obra contemplativa", "",
     tech="Unity \u00b7 VR Meta Quest \u00b7 Hand Tracking")
para("Experiencia VR donde el usuario manipula el entorno \u00fanicamente con sus manos, sin controles, "
     "orientada a provocar asombro y conexi\u00f3n con el paisaje c\u00f3smico. En proceso de postulaci\u00f3n a fondos "
     "de fomento audiovisual.", size=9.2, leading=4.6)
y -= 2.2 * mm
role("Redbital \u2014 Plataforma Web + App PWA", "En desarrollo", "",
     tech="HTML \u00b7 PWA \u00b7 Firebase")
para("Sitio web oficial y PWA para un laboratorio cl\u00ednico veterinario, centralizando protocolos y gu\u00edas "
     "de interpretaci\u00f3n. Desarrollo en curso (~2 meses) como \u00fanico desarrollador, con el apoyo del equipo "
     "del cliente para guiar el contenido cl\u00ednico.", size=9.2, leading=4.6)
y -= 2.5 * mm

# ---------- Habilidades ----------
section("Herramientas y Lenguajes")
skills = ["Unity (C#)", "TouchDesigner", "VR \u00b7 Meta Quest", "AR M\u00f3vil",
          "Hand & Body Tracking", "Kinect / Sensores", "Projection Mapping",
          "Shaders y Visuales Generativos", "Blender / Maya", "After Effects",
          "IA Generativa", "Creative Coding", "HTML / PWA"]
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

# ---------- Formación ----------
section("Formaci\u00f3n y Certificaciones")
role("Bachiller en Animaci\u00f3n Digital", "Universidad San Sebasti\u00f3n, Concepci\u00f3n", "4\u00ba a\u00f1o \u00b7 Nuevos Medios")
para("Grado acad\u00e9mico vinculado al laboratorio de nuevos medios de la USS (New Media Lab).",
     size=9.2, leading=4.6)
y -= 2.2 * mm
bullet("Comunicaci\u00f3n esc\u00e9nica:", "certificaci\u00f3n en hablar en p\u00fablico con t\u00e9cnicas teatrales.")
bullet("Trabajo seguro con p\u00fablicos:", "primeros auxilios psicol\u00f3gicos y RCP.")
bullet("Gesti\u00f3n:", "dise\u00f1o de modelos de negocio, gesti\u00f3n financiera y negociaci\u00f3n.")
y -= 2 * mm

# ---------- Más allá del código ----------
section("M\u00e1s All\u00e1 del C\u00f3digo")
bullet("Bombero voluntario (8\u00aa C\u00eda. de Concepci\u00f3n).", "Gesti\u00f3n de crisis, trabajo en equipo y calma bajo presi\u00f3n.")
bullet("Trekking y montaña.", "Adaptabilidad y la naturaleza como fuente creativa.")
bullet("Corredor de larga distancia.", "Disciplina y constancia para proyectos de largo aliento.")

# ---------- pie ----------
c.setFillColor(LIGHTGRAY)
c.setFont("Helvetica-Oblique", 7.5)
c.drawCentredString(W / 2, 5.5 * mm, "Portafolio completo con demos en video: nach2212.github.io")

c.save()
print("OK ->", OUT)
