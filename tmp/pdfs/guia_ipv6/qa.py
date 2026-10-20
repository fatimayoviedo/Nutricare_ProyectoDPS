from pathlib import Path
from pypdf import PdfReader, PdfWriter
from PIL import Image,ImageOps,ImageDraw
root=Path('tmp/pdfs/guia_ipv6')
pdf=Path('output/pdf/Guia_interactiva_IPv6_SSH_desde_cero.pdf')
r=PdfReader(pdf)
f=r.get_fields()
widgets=[]
links=0
for i,p in enumerate(r.pages):
    for ref in p.get('/Annots',[]):
        a=ref.get_object()
        if a.get('/Subtype')=='/Widget':
            widgets.append({'page':i+1,'name':a.get('/T'),'type':a.get('/FT'),'value':str(a.get('/V','')),'ap':bool(a.get('/AP'))})
        if a.get('/Subtype')=='/Link': links+=1
print('Pages:',len(r.pages),'Words:',sum(len(p.extract_text().split()) for p in r.pages),'Fields:',len(f),'Widgets:',len(widgets),'Links:',links,'Bookmarks:',len(r.outline),'Bytes:',pdf.stat().st_size)
print('Fields:',list(f))
print('Widget appearance checks:',all(w['ap'] for w in widgets))
print('Widgets:',widgets)
for i in range(1,43,2):
    a=Image.open(root/f'page-{i:02d}.png').convert('RGB')
    b=Image.open(root/f'page-{i+1:02d}.png').convert('RGB')
    sheet=Image.new('RGB',(a.width+b.width+12,max(a.height,b.height)), '#d4d8df')
    sheet.paste(a,(0,0));sheet.paste(b,(a.width+12,0))
    sheet.save(root/f'qa-pair-{i:02d}.png')
w=PdfWriter(); w.append(r)
w.update_page_form_field_values(w.pages[3],{'respuesta_A':'Una maquina virtual comparte hardware fisico, pero tiene su propio sistema operativo.'},auto_regenerate=False)
w.update_page_form_field_values(w.pages[38],{'dominio_1':'/Yes'},auto_regenerate=False)
with (root/'qa_filled.pdf').open('wb') as out: w.write(out)
f2=PdfReader(root/'qa_filled.pdf').get_fields()
print('Filled test:',{k:str(f2[k].get('/V')) for k in ['respuesta_A','dominio_1']})
