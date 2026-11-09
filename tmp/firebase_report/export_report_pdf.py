from pathlib import Path
from io import BytesIO
from xml.sax.saxutils import escape
from docx import Document
from docx.text.paragraph import Paragraph as DocParagraph
from docx.table import Table as DocTable
from docx.oxml.ns import qn
from reportlab.platypus import SimpleDocTemplate, Paragraph, PageBreak, Table, TableStyle, Image, Spacer
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'output/documents/NutriCare_Investigacion_Web_Fatima_Oviedo.docx'
OUT=ROOT/'output/pdf/NutriCare_Investigacion_Web_Fatima_Oviedo.pdf'
OUT.parent.mkdir(parents=True,exist_ok=True)
for name,file in [('Calibri','calibri.ttf'),('Calibri-Bold','calibrib.ttf'),('Calibri-Italic','calibrii.ttf'),('Consolas','consola.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(Path('C:/Windows/Fonts')/file)))
pdfmetrics.registerFontFamily('Calibri',normal='Calibri',bold='Calibri-Bold',italic='Calibri-Italic',boldItalic='Calibri-Bold')
doc=Document(SRC)
styles={
    'Normal':ParagraphStyle('normal',fontName='Calibri',fontSize=11,leading=14,spaceAfter=8),
    'Title':ParagraphStyle('title',fontName='Calibri',fontSize=26,leading=30,spaceBefore=12,spaceAfter=9,keepWithNext=True),
    'Subtitle':ParagraphStyle('subtitle',fontName='Calibri',fontSize=14,leading=18,spaceAfter=10),
    'Heading 1':ParagraphStyle('h1',fontName='Calibri-Bold',fontSize=18,leading=22,spaceAfter=9,spaceBefore=12,keepWithNext=True),
    'Heading 2':ParagraphStyle('h2',fontName='Calibri-Bold',fontSize=13,leading=16,spaceAfter=9,spaceBefore=12,keepWithNext=True),
    'Code':ParagraphStyle('code',fontName='Consolas',fontSize=9,leading=11,spaceAfter=10),
    'Small':ParagraphStyle('small',fontName='Calibri',fontSize=9,leading=11,spaceAfter=8),
    'List Bullet':ParagraphStyle('bullet',fontName='Calibri',fontSize=11,leading=14,leftIndent=12,firstLineIndent=-9,spaceAfter=6),
    'Cell':ParagraphStyle('cell',fontName='Calibri',fontSize=10,leading=12,spaceAfter=2),
}
story=[]

def markup(p):
    parts=[]
    for r in p.runs:
        t=escape(r.text).replace('\n','<br/>')
        if r.bold:t='<b>'+t+'</b>'
        if r.italic:t='<i>'+t+'</i>'
        parts.append(t)
    return ''.join(parts)

def render_p(p):
    if p._p.xpath('.//w:br[@w:type="page"]'):return PageBreak()
    images=p._p.xpath('.//a:blip')
    if images:
        rel=images[0].get(qn('r:embed'))
        extent=p._p.xpath('.//wp:extent')[0]
        return Image(BytesIO(doc.part.related_parts[rel].blob),width=int(extent.get('cx'))/12700,height=int(extent.get('cy'))/12700)
    if not p.text:return Spacer(1,5)
    name=p.style.name
    if p.runs and p.runs[0].font.name=='Consolas':name='Code'
    elif p.runs and p.runs[0].font.size and p.runs[0].font.size.pt==9:name='Small'
    base=styles.get(name,styles['Normal'])
    st=ParagraphStyle('local',parent=base)
    if p.alignment==1:st.alignment=1
    if p.paragraph_format.keep_with_next:st.keepWithNext=True
    if p.paragraph_format.left_indent:st.leftIndent=p.paragraph_format.left_indent.pt
    if p.paragraph_format.first_line_indent:st.firstLineIndent=p.paragraph_format.first_line_indent.pt
    text=markup(p)
    if name=='List Bullet':text='• '+text
    return Paragraph(text,st)

for child in doc.element.body:
    if child.tag==qn('w:p'):
        story.append(render_p(DocParagraph(child,doc)))
    elif child.tag==qn('w:tbl'):
        tab=DocTable(child,doc)
        widths=[c.width.pt for c in tab.columns]
        data=[[Paragraph('<br/>'.join(markup(p) for p in c.paragraphs),styles['Cell']) for c in row.cells] for row in tab.rows]
        t=Table(data,colWidths=widths,repeatRows=1,hAlign='CENTER')
        commands=[('GRID',(0,0),(-1,-1),.5,colors.HexColor('#D9D9D9')),('BACKGROUND',(0,0),(-1,0),colors.HexColor('#E3EDF3')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),5),('RIGHTPADDING',(0,0),(-1,-1),5),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]
        for i in range(2,len(data),2):commands.append(('BACKGROUND',(0,i),(-1,i),colors.HexColor('#F7F9FA')))
        t.setStyle(TableStyle(commands));story.append(t)

def decorate(canvas,doc):
    canvas.saveState();canvas.setFont('Calibri',9)
    canvas.drawRightString(547.2,25.2,f'NutriCare  |  {doc.page}')
    canvas.restoreState()

SimpleDocTemplate(str(OUT),pagesize=(612,792),leftMargin=64.8,rightMargin=64.8,topMargin=56.16,bottomMargin=56.16,
                  title='Integración de Firebase en NutriCare',author='Fátima Yesenia Oviedo').build(story,onFirstPage=decorate,onLaterPages=decorate)
print(OUT)
