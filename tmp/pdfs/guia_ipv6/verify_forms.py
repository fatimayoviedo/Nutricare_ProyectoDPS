from pathlib import Path
from pypdf import PdfReader
import subprocess,json,shutil
base=Path('tmp/pdfs/guia_ipv6').resolve()
pdf=Path('output/pdf/Guia_interactiva_IPv6_SSH_desde_cero.pdf').resolve()
r=PdfReader(pdf)
ids={p.indirect_reference.idnum for p in r.pages}
internal=external=0
bad=[]
for i,p in enumerate(r.pages):
  for ref in p.get('/Annots',[]):
    a=ref.get_object()
    if a.get('/Subtype')!='/Link': continue
    if '/Dest' in a:
      internal+=1
      dest=a['/Dest']
      if not isinstance(dest,list) or getattr(dest[0],'idnum',None) not in ids: bad.append((i+1,str(dest)))
    elif a.get('/A',{}).get('/S')=='/URI': external+=1
    else: bad.append((i+1,'Unrecognized link'))
fields=r.get_fields()
rootfields=r.trailer['/Root']['/AcroForm']['/Fields']
canonical={ref.idnum for ref in rootfields}
valid=True
for p in r.pages:
  for ref in p.get('/Annots',[]):
    a=ref.get_object()
    if a.get('/Subtype')=='/Widget':
      valid=valid and (ref.idnum in canonical or getattr(a.get('/Parent'),'idnum',None) in canonical)
      if a.get('/FT')=='/Btn': valid=valid and a.get('/V')==a.get('/AS')=='/Off' and '/Yes' in a['/AP']['/N']
      if a.get('/FT')=='/Tx': valid=valid and a.get('/V')=='' and len(a['/AP']['/N'].get_data())>0
print(json.dumps({'internal_links':internal,'external_links':external,'invalid_links':bad,'canonical_field_widget_values_and_appearances_ok':valid,'pages':len(r.pages),'fields':len(fields)},ensure_ascii=False))
qa=PdfReader(base/'qa_filled.pdf')
f=qa.get_fields()
assert f['respuesta_A']['/V'].startswith('Una maquina virtual')
assert f['dominio_1']['/V']=='/Yes'
for ref in qa.pages[38]['/Annots']:
  a=ref.get_object()
  if a.get('/T')=='dominio_1': assert a['/AS']=='/Yes'
exe=shutil.which('pdftoppm')
assert exe, 'pdftoppm no está disponible en PATH'
for page in [4,39]:
  subprocess.run([exe,'-f',str(page),'-l',str(page),'-r','90','-png','-singlefile',str(base/'qa_filled.pdf'),str(base/f'qa-filled-{page}')],check=True,capture_output=True)
print('Round-trip values and checkbox appearance state verified; filled sample pages rendered.')
