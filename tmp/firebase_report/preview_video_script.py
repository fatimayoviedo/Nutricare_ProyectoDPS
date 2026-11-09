from pathlib import Path
from xml.sax.saxutils import escape
from docx import Document
from docx.oxml.ns import qn
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT/'output/documents/Guion_Firebase_NutriCare_5_minutos_Fatima.docx'
OUT = ROOT/'tmp/firebase_report/video_render/Guion_Firebase_NutriCare_5_minutos_Fatima.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
FONTDIR = Path('C:/Windows/Fonts')
for name, filename in [('Calibri','calibri.ttf'),('Calibri-Bold','calibrib.ttf'),('Calibri-Italic','calibrii.ttf'),('Consolas','consola.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(FONTDIR/filename)))
pdfmetrics.registerFontFamily('Calibri',normal='Calibri',bold='Calibri-Bold',italic='Calibri-Italic',boldItalic='Calibri-Bold')
doc=Document(SRC)
styles={
    'Normal':ParagraphStyle('normal',fontName='Calibri',fontSize=11,leading=14,spaceAfter=7),
    'Title':ParagraphStyle('title',fontName='Calibri',fontSize=23,leading=27,spaceAfter=7,keepWithNext=True),
    'Heading 1':ParagraphStyle('h1',fontName='Calibri-Bold',fontSize=17,leading=21,spaceAfter=7,spaceBefore=8,keepWithNext=True),
    'Heading 2':ParagraphStyle('h2',fontName='Calibri-Bold',fontSize=13,leading=16,spaceAfter=7,spaceBefore=12,keepWithNext=True),
    'Code':ParagraphStyle('code',fontName='Consolas',fontSize=10,leading=13,spaceAfter=5),
}
story=[]
for para in doc.paragraphs:
    if para._p.xpath('.//w:br[@w:type="page"]'):
        story.append(PageBreak()); continue
    if not para.text: continue
    parts=[]
    for r in para.runs:
        t=escape(r.text).replace('\n','<br/>')
        if r.bold: t='<b>'+t+'</b>'
        if r.italic: t='<i>'+t+'</i>'
        parts.append(t)
    st = 'Code' if para.runs and para.runs[0].font.name=='Consolas' else para.style.name
    story.append(Paragraph(''.join(parts),styles.get(st,styles['Normal'])))

def decorate(canvas,doc):
    canvas.saveState()
    canvas.setFont('Calibri',9)
    canvas.drawString(61.2,769,'NUTRICARE  |  GUION DE DEMOSTRACIÓN  |  FÁTIMA OVIEDO')
    canvas.drawRightString(550.8,25,f'Página {doc.page}')
    canvas.restoreState()

SimpleDocTemplate(str(OUT),pagesize=(612,792),leftMargin=61.2,rightMargin=61.2,topMargin=50.4,bottomMargin=50.4,
                  title='Guion de demostración de Firebase en NutriCare',author='Fátima Yesenia Oviedo').build(story,onFirstPage=decorate,onLaterPages=decorate)
print(OUT)
