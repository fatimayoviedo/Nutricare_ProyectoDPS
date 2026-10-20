from pathlib import Path
import json, re, html
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Table, TableStyle, Image, Flowable, Spacer, Preformatted
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT=Path(__file__).resolve().parent
OUT=ROOT.parents[2]/'output'/'pdf'
OUT.mkdir(parents=True,exist_ok=True)
PDF=OUT/'Guia_interactiva_IPv6_SSH_desde_cero.pdf'
for n,f in [('Body','arial.ttf'),('Bold','arialbd.ttf'),('Italic','ariali.ttf'),('Code','consola.ttf')]:
    pdfmetrics.registerFont(TTFont(n,str(Path('C:/Windows/Fonts')/f)))
pdfmetrics.registerFontFamily('Body',normal='Body',bold='Bold',italic='Italic',boldItalic='Bold')
INK=colors.HexColor('#153245'); TEAL=colors.HexColor('#087D86'); GRAY=colors.HexColor('#536978'); PALE=colors.HexColor('#ECF5F6')
W,H=612,792; M=52; CW=W-2*M
styles={
 'p':ParagraphStyle('p',fontName='Body',fontSize=10.5,leading=14.7,textColor=INK,spaceAfter=8),
 'h':ParagraphStyle('h',fontName='Bold',fontSize=13,leading=17,textColor=INK,spaceBefore=8,spaceAfter=7),
 'small':ParagraphStyle('small',fontName='Body',fontSize=8.6,leading=11.5,textColor=GRAY,spaceAfter=6),
 'cell':ParagraphStyle('cell',fontName='Body',fontSize=9.4,leading=12.6,textColor=INK),
 'th':ParagraphStyle('th',fontName='Bold',fontSize=9.4,leading=12.6,textColor=colors.white),
 'title':ParagraphStyle('title',fontName='Bold',fontSize=22,leading=26,textColor=INK),
 'cover':ParagraphStyle('cover',fontName='Bold',fontSize=31,leading=38,textColor=INK),
 'code':ParagraphStyle('code',fontName='Code',fontSize=8.8,leading=12.5,textColor=INK,spaceAfter=9),
}
pages=[]
def pg(title,tag='APRENDER',source=None):
    d={'title':title,'tag':tag,'items':[],'source':source}; pages.append(d); return d
def P(d,t): d['items'].append(Paragraph(t,styles['p']))
def S(d,t): d['items'].append(Paragraph(t,styles['small']))
def H2(d,t): d['items'].append(Paragraph(t,styles['h']))
def C(d,t):
    lines=t.splitlines()
    assert max(map(len,lines),default=0)<=94,(d['title'],max(map(len,lines)))
    d['items'].append(Preformatted(t,styles['code']))
def T(d,heads,rows,widths):
    vals=[[Paragraph(str(x),styles['th']) for x in heads]]+[[Paragraph(str(x),styles['cell']) for x in r] for r in rows]
    t=Table(vals,colWidths=[CW*x for x in widths],hAlign='LEFT')
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),INK),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#F3F7F8')]),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('BOX',(0,0),(-1,-1),.4,colors.HexColor('#CFDCE0')),('INNERGRID',(0,0),(-1,-1),.4,colors.HexColor('#CFDCE0')),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]))
    d['items'] += [t,Spacer(1,9)]
def IMG(d,file,cap,width=CW,maxheight=230):
    from PIL import Image as PI
    im=PI.open(ROOT/file); w,h=im.size; scale=min(width/w,maxheight/h)
    d['items'] += [Image(str(ROOT/file),width=w*scale,height=h*scale),Spacer(1,5),Paragraph(cap,styles['small'])]
def EX(d,key,question,answerpage=37):
    d['exercise']={'key':key,'question':question,'answer':answerpage}
def link(d,label,page): P(d,f'<link href="#p{page}" color="#087D86"><u>{label}</u></link>')

class MapDiagram(Flowable):
    def __init__(self,mode='topology'): Flowable.__init__(self); self.width=CW; self.height=178; self.mode=mode
    def draw(self):
        c=self.canv
        if self.mode=='topology':
            boxes=[(0,'Ubuntu Desktop','2001:db8:1::10'),(177,'Fedora Linux','2001:db8:1::20'),(354,'FreeBSD','2001:db8:1::30')]
            for x,a,b in boxes:
                c.setFillColor(PALE); c.setStrokeColor(TEAL); c.roundRect(x,75,154,78,7,fill=1,stroke=1)
                c.setFillColor(INK); c.setFont('Bold',11); c.drawCentredString(x+77,125,a); c.setFont('Code',9); c.drawCentredString(x+77,104,b)
                c.setStrokeColor(TEAL);c.line(x+77,75,x+77,42)
            c.line(77,42,431,42);c.setFont('Body',10);c.drawCentredString(CW/2,20,'Red interna desafio2, prefijo común /64')
        else:
            labels=['IPv6 localiza el destino','TCP conecta con el puerto 3625','SSH protege y autentica','La shell remota ejecuta comandos']
            for i,label in enumerate(labels):
                y=146-i*40;c.setFillColor(PALE);c.rect(0,y-20,CW,32,fill=1,stroke=0);c.setFillColor(INK);c.setFont('Bold',11);c.drawString(12,y-7,label)
                if i<3:c.setStrokeColor(TEAL);c.line(CW/2,y-20,CW/2,y-27)

# 1
d=pg('IPv6 y SSH desde cero','GUÍA DE ESTUDIO INTERACTIVA')
d['cover']=True
P(d,'<b>Comprender, reproducir y defender el Desafío 2</b>')
P(d,'Esta guía te acompaña desde los conceptos básicos hasta la interpretación de las capturas del laboratorio con Ubuntu Desktop, Fedora Linux y FreeBSD. No necesitas haber configurado una red antes para empezar.')
d['items'].append(MapDiagram())
H2(d,'Al terminar podrás explicar')
P(d,'Qué construyó el equipo, por qué cada máquina necesita una dirección, cómo funciona SSH, qué hace cada comando y qué evidencia permite afirmar que una prueba funcionó.')
P(d,'Cada etapa presenta su propósito, los pasos y el resultado que debes observar. Los ejercicios tienen campos para escribir y enlaces a soluciones. El índice y los enlaces inferiores permiten recorrer el PDF.')
P(d,'<b>Tu punto de partida:</b> puedes aprender y defender la lógica del trabajo sin atribuirte tareas que no realizaste. Usa expresiones como «el equipo configuró» y «la evidencia muestra». Cuando repitas una prueba, podrás describir tu propia comprobación.')
link(d,'Comenzar por la ruta de aprendizaje',2)
S(d,'Material de estudio para ASI941 G01T. Elaborado a partir del informe del equipo y documentación técnica oficial. Edición de estudio: 22 de septiembre de 2026.')
# 2
d=pg('Cómo estudiar y navegar','RUTA DE APRENDIZAJE')
P(d,'Primero construye una explicación mental y luego sigue los comandos. Leer todas las páginas de una vez no es necesario. Avanza cuando puedas explicar el propósito del bloque sin mirar el texto.')
T(d,['Ruta','Contenido enlazado'],[
['Entender el escenario','<link href="#p3" color="#087D86">3 a 5 · Objetivo, vocabulario y comunicación</link>'],
['Comprender IPv6','<link href="#p6" color="#087D86">6 a 8 · Direcciones, prefijos y ejercicios</link>'],
['Entender SSH y terminales','<link href="#p9" color="#087D86">9 y 10 · Sesión remota y comandos</link>'],
['Preparar el laboratorio','<link href="#p11" color="#087D86">11 a 14 · Máquinas virtuales y red interna</link>'],
['Configurar IPv6','<link href="#p15" color="#087D86">15 a 20 · Sistemas, pruebas y resultados</link>'],
['Configurar SSH','<link href="#p21" color="#087D86">21 a 27 · Servicio, permisos y conexiones</link>'],
['Validar y diagnosticar','<link href="#p28" color="#087D86">28 a 32 · Persistencia, evidencia y fallos</link>'],
['Preparar la defensa','<link href="#p33" color="#087D86">33 a 36 · Reparto, guion y preguntas</link>'],
['Resolver y autoevaluarte','<link href="#p37" color="#087D86">37 a 39 · Soluciones y lista de dominio</link>'],
['Consultar rápido','<link href="#p40" color="#087D86">40 a 42 · Comandos y fuentes</link>']],[.34,.66])
H2(d,'Tres formas de usarla')
P(d,'<b>Sin máquinas:</b> resuelve los ejercicios y explica las capturas. <b>Con máquinas:</b> ejecuta una etapa, interpreta la salida y registra tu prueba. <b>Antes de defender:</b> repasa las páginas 29 y 33 a 40, sin saltarte los conceptos que todavía no comprendas.')
P(d,'Los campos se pueden completar en un lector compatible con formularios PDF. Guarda una copia después de escribir. Los enlaces funcionan sin conexión; los enlaces a documentación externa necesitan Internet. No se ejecutan comandos ni se califican respuestas automáticamente desde el PDF.')
# 3
d=pg('Qué debía lograr el laboratorio','VISIÓN GENERAL','Informe del equipo, pp. 3 a 5, 19 y 25; consigna Desafío 2.')
P(d,'El problema consiste en administrar dos servidores diferentes desde una misma computadora cliente. En lugar de comprar tres equipos físicos, se crean tres máquinas virtuales. Se conectan a una red virtual, se asignan direcciones IPv6 y se habilita un servicio de administración remota.')
T(d,['Equipo','Papel en esta práctica','Dirección'],[['Ubuntu Desktop','Inicia las conexiones SSH','2001:db8:1::10/64'],['Fedora Linux','Recibe conexiones SSH','2001:db8:1::20/64'],['FreeBSD','Recibe conexiones SSH','2001:db8:1::30/64']],[.26,.40,.34])
H2(d,'La cadena que debe funcionar')
P(d,'1. Cada máquina arranca y tiene una interfaz de red.<br/>2. Las interfaces comparten la red interna <b>desafio2</b>.<br/>3. Cada interfaz utiliza una dirección distinta de la misma subred.<br/>4. Los equipos intercambian paquetes.<br/>5. Los servidores escuchan conexiones SSH en TCP 3625.<br/>6. Ubuntu autentica una cuenta y obtiene una consola remota.')
H2(d,'Qué significa conseguirlo')
P(d,'Desde una terminal de Ubuntu escribes un comando y la orden termina ejecutándose en Fedora o FreeBSD. Por ejemplo, <b>ifconfig em0</b>, ejecutado dentro de la sesión de FreeBSD, consulta la interfaz del servidor, aunque tú sigas viendo la ventana en Ubuntu.')
H2(d,'Lo comprobado y lo que falta')
P(d,'El informe muestra las dos conexiones exigidas desde Ubuntu y dos ensayos ICMPv6 con cuatro respuestas de cuatro solicitudes. También muestra una conexión adicional de FreeBSD a Fedora. No demuestra una prueba completa posterior a reinicios ni la corrección de SELinux en Enforcing. Mantendremos esa diferencia en toda la guía.')
P(d,'<b>Pregunta para pensar:</b> si Ubuntu tiene la dirección correcta, ¿ya puede administrar Fedora? Todavía necesita comunicación, un servicio accesible y credenciales válidas. Cada capa aporta una condición distinta.')
# 4
d=pg('Las palabras que necesitas primero','FUNDAMENTOS')
T(d,['Concepto','Explicación y relación con la práctica'],[
['Anfitrión','La computadora real que ejecuta VirtualBox. Su memoria y procesadores sostienen las máquinas virtuales.'],['Máquina virtual','Computadora simulada por software con CPU, RAM, disco y tarjeta de red virtuales.'],['Sistema invitado','Sistema operativo instalado dentro de una máquina virtual: Ubuntu, Fedora o FreeBSD.'],['Sistema operativo','Administra recursos y permite ejecutar programas. FreeBSD pertenece a la familia BSD; no es una distribución de Linux.'],['Cliente y servidor','Son funciones. El cliente solicita un servicio; el servidor lo ofrece. Un mismo equipo puede ejercer ambas.'],['Servicio o daemon','Programa que atiende solicitudes en segundo plano. sshd es el servidor de SSH.'],['Terminal y shell','La terminal es la interfaz de texto. La shell interpreta las órdenes que escribes.']],[.29,.71])
P(d,'<b>Analogía útil:</b> piensa en el anfitrión como un edificio y las máquinas virtuales como oficinas independientes. Compartir edificio no implica tener una línea de comunicación configurada. La red virtual aporta ese enlace. Es una analogía: las máquinas comparten recursos físicos, pero ejecutan sistemas separados.')
EX(d,'A','Ubuntu inicia SSH hacia Fedora. ¿Cuál es el cliente, cuál ofrece el servicio y en qué equipo se ejecuta una orden después de entrar?')
# 5
d=pg('Cómo viaja una orden hasta el servidor','FUNDAMENTOS')
d['items'].append(MapDiagram('layers'))
P(d,'Escribes <b>ssh -p 3625 fedoraserver@2001:db8:1::20</b> en Ubuntu. El sistema consulta cómo alcanzar esa dirección. Al estar en la misma red, puede enviar tráfico directamente al vecino a través del enlace virtual. TCP establece una conexión con el puerto elegido. SSH negocia la protección de la sesión y autentica al usuario.')
H2(d,'Cada identificador responde una pregunta')
T(d,['Identificador','Pregunta que resuelve'],[['Interfaz, como enp0s3','¿Por qué tarjeta sale o entra el tráfico?'],['Dirección MAC','¿A qué interfaz del enlace se entrega la trama Ethernet?'],['Dirección IPv6','¿Qué interfaz o destino de red quiero alcanzar?'],['Puerto TCP 3625','¿Qué servicio de ese destino quiero contactar?'],['Cuenta fedoraserver','¿Con qué identidad y permisos entraré?']],[.34,.66])
P(d,'La MAC y la IP no son contraseñas. El puerto tampoco identifica a una persona. Un servidor puede ofrecer varios servicios simultáneamente, cada uno con sus puertos y procesos. SSH cifra la sesión, pero no convierte automáticamente cualquier cuenta en administradora.')
P(d,'<b>Imagina un fallo:</b> si la IP es correcta pero no existe un proceso escuchando en 3625, el destino puede responder a ping y rechazar SSH. Esta es la razón para verificar red y aplicación por separado.')
# 6
d=pg('Leer una dirección IPv6','FUNDAMENTOS','Base conceptual: RFC 4291, apartado 2.2. Ejemplo aplicado al plan del equipo.')
P(d,'IPv6 utiliza direcciones de 128 bits. En la escritura habitual aparecen ocho grupos de cuatro dígitos hexadecimales separados por dos puntos. Cada grupo representa 16 bits. El sistema hexadecimal utiliza 0 a 9 y las letras a a f.')
C(d,'2001:0db8:0001:0000:0000:0000:0000:0010\n                 equivale a\n2001:db8:1::10')
H2(d,'Cómo leer el ejemplo sin memorizarlo')
P(d,'Cuenta ocho grupos en la forma desarrollada. Dentro de cada grupo puedes omitir ceros a la izquierda: <b>0db8</b> se escribe <b>db8</b> y <b>0001</b> se escribe <b>1</b>. Una secuencia de grupos completos en cero puede abreviarse con <b>::</b>. Este símbolo se utiliza como máximo una vez en una dirección, para que la cantidad de grupos omitidos sea inequívoca.')
P(d,'En <b>2001:db8:1::10</b> quedan escritos cuatro grupos: 2001, db8, 1 y 10. Faltan cuatro grupos para completar ocho; todos los omitidos son 0000. El grupo final 10 es hexadecimal, aunque para referirnos informalmente al equipo digamos «terminación diez».')
H2(d,'No confundas los caracteres')
P(d,'Los dos puntos separan grupos. El doble dos puntos abrevia ceros. La barra en <b>/64</b> describe la longitud del prefijo, no es parte de un grupo hexadecimal. Mayúsculas y minúsculas en las letras hexadecimales representan el mismo valor.')
T(d,['Forma','Interpretación'],[['::1','Dirección de loopback: el propio equipo.'],['fe80::…','Dirección de enlace local. Su uso queda restringido al enlace.'],['2001:db8:1::20','Dirección elegida para Fedora en este laboratorio.']],[.30,.70])
P(d,'<b>Comprueba:</b> 2001:db8:1::20 y 2001:0db8:0001:0000:0000:0000:0000:0020 representan la misma dirección. El prefijo /64 se analiza en la siguiente página.')
# 7
d=pg('Qué significan la subred y el prefijo','FUNDAMENTOS','RFC 4291, apartado 2.3; RFC 3849; plan de direccionamiento del informe, p. 13.')
P(d,'El prefijo indica cuántos bits iniciales identifican la parte de red. En nuestro caso son 64. Como cada grupo hexadecimal completo tiene 16 bits, los primeros cuatro grupos de la dirección desarrollada corresponden a esa parte.')
C(d,'2001:0db8:0001:0000 : 0000:0000:0000:0010\n<--- prefijo de 64 bits --->  <- parte restante ->\nRed del laboratorio: 2001:db8:1::/64')
P(d,'Ubuntu, Fedora y FreeBSD comparten los primeros 64 bits y utilizan identificadores finales diferentes. En este diseño están también en el mismo enlace virtual. Esas dos condiciones permiten la comunicación directa entre ellos.')
H2(d,'Por qué no escribimos una puerta de enlace')
P(d,'Una puerta de enlace permite llegar a otras redes por medio de un router. Aquí solo queremos comunicar equipos de la misma subred en el mismo enlace. La ruta conectada es suficiente. No inventes una puerta de enlace como ::1: esa dirección es loopback y representa al propio equipo. Para acceder a redes externas sí se necesitarían una ruta y un siguiente salto válidos.')
H2(d,'Este prefijo no es una dirección pública asignada')
P(d,'2001:db8::/32 está reservado para documentación. El informe lo utiliza en un escenario didáctico aislado. No se debe anunciar hacia Internet ni describirlo como un prefijo privado de producción. En un despliegue real se planifica un direccionamiento apropiado para su alcance.')
H2(d,'DNS y direccionamiento son cosas distintas')
P(d,'DNS traduce nombres a direcciones. Las conexiones de la práctica escriben la dirección IPv6 directamente, por lo que no dependen de resolver un nombre. Que una máquina no resuelva un sitio de Internet no impide necesariamente la comunicación local por direcciones numéricas.')
P(d,'<b>Frase para defender:</b> «Configuramos direcciones diferentes del mismo prefijo /64 sobre la misma red interna. No necesitamos una ruta predeterminada para comunicar estos tres destinos locales».')
# 8
d=pg('Ejercicio de direcciones y destinos','PRÁCTICA ACTIVA')
P(d,'Resuelve antes de consultar la respuesta. Puedes volver a las páginas 6 y 7 mediante los enlaces inferiores o los marcadores del lector.')
H2(d,'Situación 1')
P(d,'Tu cliente tiene <b>2001:db8:1::10/64</b>. Debes contactar el servidor FreeBSD. Escribe su dirección completa abreviada y explica por qué pertenece a la misma subred.')
H2(d,'Situación 2')
P(d,'Un compañero configura Fedora como <b>2001:db8:2::20/64</b>. ¿Coincide con el plan? Compara el tercer grupo. No basta con observar que ambos comienzan con 2001:db8.')
H2(d,'Situación 3')
P(d,'Escribe la forma completa de <b>2001:db8:1::30</b>. Debe contener ocho grupos. Después explica por qué no sería correcto escribir dos abreviaturas :: en la misma dirección.')
H2(d,'Situación 4')
P(d,'¿Qué pasa si ejecutas <b>ssh usuario@::1</b> desde Ubuntu? ¿Estarías contactando Fedora? Distingue la dirección del propio equipo de la dirección de otro host.')
P(d,'<b>Método:</b> primero identifica el destino, después el prefijo y por último la interfaz. Leer una dirección es una tarea de interpretación; copiarla sin comprobarla puede dirigir la prueba hacia otro sistema.')
EX(d,'B','Escribe tus cuatro respuestas y una regla que te ayude a no confundir ::10, ::20 y ::30.')
# 9
d=pg('Qué es SSH y qué ocurre al conectarte','FUNDAMENTOS','RFC 4253 y RFC 4252; OpenSSH ssh(1).')
P(d,'SSH significa Secure Shell. En esta práctica permite abrir una consola remota protegida. El programa <b>ssh</b> inicia la conexión en el cliente; <b>sshd</b> la atiende en el servidor. No necesitas instalar un servidor SSH en Ubuntu solo para iniciar conexiones hacia otros equipos.')
H2(d,'Secuencia simplificada de una conexión')
P(d,'<b>1. Transporte:</b> el cliente intenta establecer TCP con la dirección y el puerto indicados.<br/><b>2. Identidad del servidor:</b> SSH presenta una clave de host. Su huella permite comprobar que el destino es el esperado.<br/><b>3. Canal protegido:</b> los extremos negocian claves para cifrar la comunicación y comprobar su integridad.<br/><b>4. Identidad del usuario:</b> el servidor valida la contraseña o una prueba basada en una clave de usuario.<br/><b>5. Sesión:</b> el servidor abre una shell o ejecuta una orden con los permisos de esa cuenta.')
H2(d,'Dos comprobaciones de identidad diferentes')
P(d,'La clave de host responde «¿a qué servidor estoy hablando?». La autenticación del usuario responde «¿quién solicita entrar?». Aceptar una huella desconocida no equivale a validar una contraseña. Una contraseña correcta tampoco corrige la aceptación de un servidor equivocado.')
H2(d,'Qué cambia al usar el puerto 3625')
P(d,'El puerto habitual de SSH es 22. La actividad exige 3625. Hay que configurar al servidor para escuchar ahí y al cliente para usar <b>-p 3625</b>. Cambiar el número no mejora por sí solo el cifrado ni evita que un atacante descubra el servicio.')
T(d,['Elemento','Ejemplo'],[['Cliente','ssh'],['Servidor','sshd'],['Archivo del servidor','/etc/ssh/sshd_config'],['Cuenta remota','fedoraserver o freebsd'],['Puerto de esta práctica','3625/TCP']],[.36,.64])
P(d,'<b>Pregunta oral:</b> si SSH pide contraseña, ya superaste varias etapas de comunicación. Si después aparece Permission denied, empieza revisando la cuenta y los métodos de autenticación, no cambiando inmediatamente la dirección IP.')
# 10
d=pg('Cómo leer comandos sin ejecutarlos a ciegas','HERRAMIENTAS')
C(d,'ssh -6 -p 3625 fedoraserver@2001:db8:1::20')
T(d,['Parte','Significado'],[['ssh','Programa cliente que abrirá la sesión.'],['-6','Solicita utilizar IPv6. En las capturas se escribe directamente una IPv6.'],['-p 3625','Selecciona el puerto de destino; p minúscula.'],['fedoraserver','Cuenta que debe existir en Fedora.'],['@','Separa la cuenta de la dirección del servidor.'],['2001:db8:1::20','Destino según el plan, sin agregar /64 al comando SSH.']],[.32,.68])
P(d,'<b>sudo</b> ejecuta una orden con privilegios autorizados, normalmente administrativos. <b>root</b> es la cuenta con control total. En los ejemplos de FreeBSD se indica cuándo trabajar desde la consola como root; sudo puede no estar instalado. Nunca copies el texto del prompt, como usuario@equipo:~$, como parte del comando.')
P(d,'En una shell, <b>#</b> al comienzo de una línea marca un comentario. En sshd_config también comenta una directiva. El símbolo <b>|</b> pasa la salida de una orden a otra. <b>grep</b> selecciona líneas que coinciden con un patrón. Las comillas rectas agrupan argumentos. Una barra invertida final continúa una orden en la siguiente línea.')
P(d,'<b>ip</b> y <b>ifconfig</b> consultan red. <b>nmcli</b> administra perfiles en Fedora. <b>systemctl</b> controla servicios en Fedora. <b>service</b> y <b>sysrc</b> se usan en FreeBSD. No todos los comandos se ejecutan en todos los sistemas.')
EX(d,'C','Explica por qué ssh -p 3625 freebsd@2001:db8:1::30 debe ejecutarse en Ubuntu para demostrar el requisito y no dentro de una sesión remota de Fedora.')
# 11
d=pg('Preparar lo necesario antes de configurar','ETAPA 1')
P(d,'<b>Propósito:</b> disponer de tres sistemas utilizables y de una forma de recuperarte si una configuración falla. La práctica separa la instalación del sistema, la conexión de red y la habilitación de SSH. Completar una etapa no completa automáticamente las otras.')
H2(d,'Preparación del entorno')
P(d,'1. Abre VirtualBox en el anfitrión y confirma que puede ejecutar invitados de 64 bits.<br/>2. Prepara las imágenes ISO oficiales de Ubuntu Desktop, Fedora Server y FreeBSD. Una ISO contiene el medio de instalación.<br/>3. Reserva RAM, procesadores y espacio de disco sin agotar el anfitrión.<br/>4. Identifica las credenciales de acceso local y conserva acceso a la consola de cada máquina.<br/>5. Si vas a modificar las máquinas del equipo, acuerda el cambio y toma una instantánea antes. La instantánea facilita regresar a un estado anterior.')
T(d,['Máquina','Recursos documentados'],[['Ubuntu_Cliente','4096 MB de RAM y 2 CPU virtuales.'],['Fedora_Server','2048 MB de RAM y 1 CPU virtual.'],['FreeBSD_Server','1024 MB de RAM y 1 CPU virtual.']],[.35,.65])
P(d,'Estos valores describen las capturas del equipo, no requisitos universales ni un dimensionamiento de producción. Comprueba los requisitos de la versión que realmente instales. El disco virtual ocupa almacenamiento del anfitrión y el sistema puede necesitar espacio adicional para actualizaciones.')
H2(d,'Paquetes y conexión temporal')
P(d,'La red interna no aporta Internet. Comprueba de antemano que Ubuntu tenga el cliente OpenSSH y Fedora el servidor OpenSSH. Si faltan paquetes, instálalos con conectividad temporal antes del aislamiento. Tras hacerlo, vuelve a la red interna prevista y documenta cualquier adaptador adicional.')
P(d,'<b>Punto de control:</b> puedes iniciar sesión localmente en los tres sistemas y sabes qué ventana corresponde a cada uno. Si solo tienes el PDF, estudia los pasos como reconstrucción del procedimiento y no como órdenes ya ejecutadas por ti.')
# 12
d=pg('Crear e instalar Ubuntu y Fedora','ETAPA 1')
P(d,'<b>Propósito:</b> crear los sistemas que más adelante actuarán como cliente y servidor. No necesitas configurar aún el puerto SSH. Las pantallas varían entre versiones, pero la secuencia de decisiones se mantiene.')
H2(d,'Creación común en VirtualBox')
P(d,'1. Selecciona <b>Nueva</b> y escribe Ubuntu_Cliente o Fedora_Server.<br/>2. Selecciona la ISO y comprueba el tipo de sistema y la arquitectura.<br/>3. Asigna RAM y CPU disponibles. Usa los valores del informe como referencia, si el anfitrión los soporta.<br/>4. Crea un disco virtual nuevo y elige una capacidad suficiente para la versión.<br/>5. Arranca desde la ISO. Dentro del instalador, selecciona únicamente el disco virtual de esa máquina.')
H2(d,'Ubuntu Desktop')
P(d,'Elige idioma, teclado, zona horaria y destino de instalación. Crea la cuenta local y una contraseña robusta. Al terminar, reinicia y retira el medio de instalación si vuelve a aparecer el instalador. Accede al escritorio y abre una terminal. Esta cuenta local puede ser distinta de las cuentas de Fedora y FreeBSD.')
H2(d,'Fedora Server')
P(d,'Revisa el resumen del instalador, especialmente disco y cuentas. Crea la cuenta <b>fedoraserver</b> y concédele privilegios administrativos mediante las opciones de la instalación cuando corresponda. Termina la instalación, reinicia y comprueba el acceso local. El informe utiliza esa cuenta para SSH; la cuenta tiene que existir en el servidor.')
C(d,'# Consultas en Ubuntu o Fedora\nhostname\nwhoami\ncat /etc/os-release')
P(d,'<b>Para qué sirven:</b> hostname muestra el nombre del sistema; whoami identifica la cuenta actual; os-release identifica la distribución. El prompt puede personalizarse y no es una prueba suficiente de identidad por sí solo.')
P(d,'<b>Punto de control:</b> ambos sistemas arrancan desde el disco y aceptan el inicio de sesión. Instalar una ISO no demuestra todavía que exista una IPv6 manual ni que SSH esté accesible.')
# 13
d=pg('Crear e instalar FreeBSD','ETAPA 1','Informe, pp. 20 a 22. Manual de FreeBSD, capítulos de instalación y configuración.')
P(d,'<b>Propósito:</b> incorporar un sistema BSD para demostrar interoperabilidad con Linux. FreeBSD utiliza herramientas y archivos de administración que no siempre coinciden con los de Fedora.')
P(d,'1. Crea FreeBSD_Server en VirtualBox, selecciona la ISO y configura sus recursos.<br/>2. Arranca el instalador e identifica el disco virtual sobre el que trabajarás.<br/>3. Selecciona el método y esquema de particionado adecuados para ese entorno de arranque.<br/>4. Configura el sistema, la zona horaria y las cuentas. Crea la cuenta normal <b>freebsd</b>.<br/>5. Conserva una forma de administrar localmente como root. Si utilizas su, la cuenta debe estar autorizada, normalmente mediante el grupo wheel.<br/>6. Completa la instalación, retira la ISO y reinicia desde el disco.')
H2(d,'Qué significa particionar')
P(d,'Particionar distribuye el espacio del disco para el sistema y sus datos. En esta práctica se realiza dentro del disco virtual, no sobre el disco físico del anfitrión. Antes de confirmar una operación de almacenamiento, comprueba el dispositivo y la capacidad. El procedimiento concreto depende del modo BIOS o UEFI y de las opciones seleccionadas.')
H2(d,'DHCP durante la instalación no es el plan final')
P(d,'La captura del instalador muestra una solicitud DHCP. Eso pertenece a la instalación. Más adelante se configura manualmente <b>2001:db8:1::30/64</b>. Tener conectividad temporal para instalar no demuestra que el direccionamiento final esté aplicado.')
C(d,'# Consultas en FreeBSD\nhostname\nwhoami\nfreebsd-version\nifconfig')
P(d,'<b>Resultado esperado:</b> una consola de FreeBSD operativa y una interfaz de red visible. En las capturas la interfaz se llama <b>em0</b>. Ese nombre depende del adaptador presentado al invitado; debes identificar el real antes de copiar comandos.')
P(d,'<b>Explicación oral:</b> «Instalamos un sistema independiente y luego configuramos su red y su servicio SSH. La etapa de instalación prepara el equipo; las pruebas de red vienen después».')
# 14
d=pg('Conectar las tres máquinas a desafio2','ETAPA 2','Informe, p. 10; Oracle VirtualBox, Virtual Networking.')
P(d,'<b>Propósito:</b> proporcionar un enlace compartido para intercambiar tráfico. Con las máquinas apagadas, abre <b>Configuración &gt; Red</b> de cada una. Habilita el Adaptador 1, selecciona <b>Red interna</b>, escribe <b>desafio2</b> y activa <b>Cable conectado</b>. Guarda y repite en las otras dos máquinas.')
IMG(d,'p10_i02.png','Captura del equipo: red interna desafio2 en el adaptador de Fedora.',width=445,maxheight=225)
P(d,'<b>Por qué importa el nombre:</b> desafio2 identifica el segmento virtual. Si una máquina utiliza otro nombre, quedará en otro segmento aunque tenga una dirección parecida. Es como conectar una computadora a otro conmutador sin un enlace entre ambos.')
T(d,['Modo','Diferencia relevante'],[['Red interna','Comunica los invitados conectados al mismo segmento.'],['Solo anfitrión','Incluye también comunicación con el anfitrión.'],['NAT','Facilita salida externa; no equivale a la red interna compartida del ensayo.'],['Adaptador puente','Conecta al invitado con la red física del anfitrión.']],[.30,.70])
P(d,'<b>Punto de control:</b> revisa el mismo nombre en las tres máquinas y arráncalas. No cambies a puente para resolver a ciegas un fallo de ping: alteraría el diseño. El siguiente paso es asignar direcciones; el enlace virtual por sí solo no las configura.')
# 15
d=pg('Asignar IPv6 a Ubuntu Desktop','ETAPA 3','Informe, pp. 13 y 14.')
P(d,'<b>Dónde:</b> Ubuntu, mediante la interfaz gráfica.<br/><b>Propósito:</b> darle al cliente una dirección conocida desde la cual iniciar las pruebas.')
P(d,'1. Abre la configuración de red y la conexión cableada del adaptador del laboratorio.<br/>2. En la pestaña IPv6, selecciona el método <b>Manual</b>.<br/>3. Escribe dirección <b>2001:db8:1::10</b> y prefijo <b>64</b>.<br/>4. Deja vacía la puerta de enlace de este segmento aislado.<br/>5. Aplica los cambios. Si la conexión no se reactiva sola, desactívala y actívala de nuevo.<br/>6. Abre una terminal y comprueba la configuración efectiva.')
C(d,'ip link\nip -6 addr show dev enp0s3')
P(d,'<b>ip link</b> ayuda a identificar las interfaces. <b>-6</b> filtra IPv6, <b>addr show</b> consulta direcciones y <b>dev enp0s3</b> limita la consulta a esa tarjeta. Si tiene otro nombre, utiliza el nombre observado.')
IMG(d,'p14_i02.png','Captura del equipo: ip a incluye 2001:db8:1::10/64 en enp0s3.',maxheight=150)
P(d,'<b>Resultado esperado:</b> la dirección prevista aparece con /64 y la interfaz está activa. Puedes ver además una dirección fe80::, que es de enlace local. También aparece ::1 en loopback; ninguna reemplaza la dirección del plan.')
P(d,'<b>Si algo falla:</b> revisa que aplicaste el cambio a la conexión correcta, que el adaptador virtual sigue conectado y que no escribiste /64 dentro del campo de dirección si el formulario exige el prefijo por separado. Espera a que termine la detección de direcciones duplicadas; dadfailed necesita investigación.')
# 16
d=pg('Asignar IPv6 a Fedora con nmcli','ETAPA 3','Informe, pp. 16 y 17; manual de NetworkManager, nmcli.')
P(d,'<b>Dónde:</b> consola local de Fedora con una cuenta autorizada para sudo.<br/><b>Propósito:</b> crear una configuración de red guardada y activarla. Un perfil de NetworkManager reúne parámetros de una conexión; no es lo mismo que la tarjeta física o virtual.')
C(d,'ip link\nnmcli connection show\n# Ejecutar add solo si ipv6-lab no existe\nsudo nmcli connection add type ethernet ifname enp0s3 \\\n  con-name "ipv6-lab" ipv6.method manual \\\n  ipv6.addresses 2001:db8:1::20/64\nsudo nmcli connection up "ipv6-lab"\nip -6 addr show dev enp0s3')
T(d,['Argumento','Propósito'],[['connection add','Crea un perfil nuevo.'],['type ethernet','Indica una conexión Ethernet.'],['ifname enp0s3','Asocia el perfil con esa interfaz.'],['con-name ipv6-lab','Da un nombre al perfil para administrarlo.'],['ipv6.method manual','Define asignación manual de IPv6.'],['ipv6.addresses …/64','Guarda la dirección y el prefijo.'],['connection up','Activa el perfil y aplica sus parámetros.']],[.40,.60])
P(d,'<b>Si el perfil existe:</b> evita duplicarlo. Ajusta sus parámetros y vuelve a activarlo:')
C(d,'sudo nmcli connection modify "ipv6-lab" \\\n  ipv6.method manual ipv6.addresses 2001:db8:1::20/64\nsudo nmcli connection up "ipv6-lab"')
P(d,'<b>Resultado esperado:</b> enp0s3 muestra ::20/64. Estos comandos reproducen el núcleo del procedimiento del equipo y no deshabilitan por sí mismos IPv4. La exigencia es demostrar el tráfico IPv6. Revisa el perfil realmente activo y su inicio automático antes de afirmar persistencia.')
# 17
d=pg('Asignar IPv6 a FreeBSD con sysrc','ETAPA 3','Informe, pp. 22 y 23; FreeBSD Handbook, Configuration and Services.')
P(d,'<b>Dónde:</b> consola local de FreeBSD como root.<br/><b>Propósito:</b> guardar la dirección en la configuración del sistema y aplicarla a la interfaz. Mantén acceso a la consola porque reiniciar la red puede interrumpir una sesión remota.')
C(d,'ifconfig\nsysrc ifconfig_em0_ipv6="inet6 2001:db8:1::30 prefixlen 64"\nservice netif restart em0\nifconfig em0')
T(d,['Parte','Propósito'],[['ifconfig','Muestra interfaces y parámetros actuales.'],['sysrc','Consulta o cambia variables de configuración, normalmente en /etc/rc.conf.'],['ifconfig_em0_ipv6','Variable asociada a IPv6 en em0.'],['inet6','Selecciona la familia IPv6.'],['prefixlen 64','Indica la longitud del prefijo.'],['service netif restart em0','Aplica la configuración de red al reiniciar esa interfaz.']],[.43,.57])
P(d,'<b>Configuración guardada y estado actual:</b> sysrc registra el valor; ifconfig muestra lo que está aplicado en ese instante. Necesitamos ambas ideas para explicar por qué se ejecutan varias órdenes. Consultar un archivo no prueba que el sistema ya esté usando su contenido.')
IMG(d,'p23_i01.png','Captura del equipo: tras reiniciar netif, em0 contiene 2001:db8:1::30/64.',maxheight=150)
P(d,'<b>Punto de control:</b> busca em0, estado activo y la dirección ::30/64. Si el adaptador tiene otro nombre, adapta tanto la variable de sysrc como las consultas. Si la dirección está duplicada o la interfaz no sube, resuelve ese problema antes de continuar con SSH.')
# 18
d=pg('Leer interfaces, rutas y vecinos','ETAPA 4','RFC 4861; consultas complementarias propuestas, no pruebas ya documentadas.')
P(d,'Una dirección visible es solo una parte de la validación. Conviene comprobar que el sistema conoce la salida hacia la subred y puede identificar al vecino en el enlace.')
T(d,['Qué comprobar','Ubuntu y Fedora','FreeBSD'],[['Dirección e interfaz','ip -6 addr','ifconfig'],['Rutas IPv6','ip -6 route','netstat -rn -f inet6'],['Vecinos del enlace','ip -6 neigh','ndp -an']],[.29,.35,.36])
H2(d,'Cómo interpretar una interfaz')
P(d,'<b>UP</b> indica habilitación administrativa. <b>LOWER_UP</b>, en Linux, señala que la capa inferior informa enlace. <b>inet6</b> introduce una dirección IPv6. <b>scope link</b> corresponde a alcance de enlace. <b>tentative</b> indica que la dirección aún está en comprobación; <b>dadfailed</b> indica un problema de detección de duplicados. Una interfaz habilitada sin la dirección correcta todavía no satisface el plan.')
H2(d,'Qué hace la ruta')
P(d,'Al enviar a ::20, el sistema consulta su tabla de rutas para decidir por qué interfaz salir. Una ruta conectada para 2001:db8:1::/64 permite utilizar el enlace local. Una ruta predeterminada se usa para destinos que no coinciden con rutas más específicas; no se necesita para este intercambio local.')
H2(d,'Qué hace el descubrimiento de vecinos')
P(d,'IPv6 utiliza Neighbor Discovery, apoyado en ICMPv6, para funciones como descubrir vecinos y resolver la dirección del enlace. En Ethernet ayuda a asociar una IPv6 con una MAC. IPv6 no usa ARP para esta tarea. Por eso bloquear indiscriminadamente ICMPv6 puede romper funciones esenciales, más allá de ping.')
P(d,'<b>Ejemplo de diagnóstico:</b> si la ruta sale por un adaptador distinto del laboratorio, revisa perfiles y rutas. Si el vecino permanece incompleto después de intentar comunicar, revisa red interna, enlace y dirección del destino. Una tabla de vecinos vacía antes de generar tráfico no demuestra por sí sola una avería.')
P(d,'<b>Frase para defender:</b> «La interfaz confirma la dirección, la tabla de rutas indica la salida y los vecinos ayudan a revisar la entrega dentro del enlace».')
# 19
d=pg('Probar conectividad con ping','ETAPA 4','Informe, pp. 23 y 25. Matriz completa propuesta para ampliar la evidencia.')
P(d,'<b>Propósito:</b> enviar solicitudes de eco ICMPv6 y comprobar respuestas. Usa la terminal local del equipo origen. Una prueba ejecutada dentro de una sesión SSH sale desde el servidor remoto, no desde Ubuntu.')
C(d,'# En Ubuntu\nping -6 -c 4 2001:db8:1::20\nping -6 -c 4 2001:db8:1::30\n# En Fedora\nping -6 -c 4 2001:db8:1::10\nping -6 -c 4 2001:db8:1::30\n# En FreeBSD\nping6 -c 4 2001:db8:1::10\nping6 -c 4 2001:db8:1::20')
P(d,'<b>-6</b> selecciona IPv6 en ping de Linux. <b>ping6</b> es el comando utilizado en FreeBSD y en las capturas. <b>-c 4</b> limita el ensayo a cuatro solicitudes. La dirección final es el destino. Algunas versiones de Linux permiten ping6 como alias; ping -6 evita depender de ese alias.')
T(d,['Origen','Destinos que debe probar','Estado en el informe'],[['Ubuntu','Fedora y FreeBSD','ICMPv6 hacia FreeBSD documentado.'],['Fedora','Ubuntu y FreeBSD','Falta registrar estos sentidos.'],['FreeBSD','Ubuntu y Fedora','ICMPv6 hacia Fedora documentado.']],[.20,.36,.44])
P(d,'<b>Resultado esperado de cada ensayo:</b> cuatro respuestas y una pérdida calculable. Guarda la salida completa con origen identificable, comando y estadísticas. Probar seis sentidos amplía la cobertura, aunque cada solicitud con respuesta ya implica tráfico de ida y vuelta para ese intercambio.')
P(d,'<b>Límite:</b> ping no usa el puerto TCP 3625. Un eco exitoso no prueba la autenticación ni la escucha SSH. Una pérdida de eco tampoco identifica una causa única: el destino puede estar apagado, mal conectado o filtrando ICMPv6.')
# 20
d=pg('Interpretar las estadísticas reales','PRÁCTICA ACTIVA','Informe, figuras 32 y 35, pp. 23 y 25 del archivo PDF.')
IMG(d,'p25_i01.png','Captura real: Ubuntu envía cuatro solicitudes ICMPv6 a FreeBSD.',width=475,maxheight=190)
P(d,'La línea final indica <b>4 packets transmitted, 4 received, 0% packet loss</b>. En esta muestra no se perdió ninguna solicitud medida. El tiempo aparece en milisegundos: una milésima de segundo. Es un tiempo de ida y vuelta, no solo de ida.')
T(d,['Campo','Valor y significado'],[['min','0,381 ms: menor tiempo observado.'],['avg','0,862 ms: promedio de la muestra.'],['max','1,930 ms: mayor tiempo observado.'],['mdev','0,624 ms: medida de variación de los tiempos que reporta esta implementación.']],[.18,.82])
P(d,'El orden importa: <b>1,930 ms es el máximo, no el promedio</b>. En FreeBSD hacia Fedora el promedio registrado es 1,078 ms. Estas dos muestras pequeñas no permiten decidir qué sistema es «más rápido» ni medir el ancho de banda de la red.')
EX(d,'D','Si un ensayo envía 4 paquetes y recibe 3, ¿qué porcentaje pierde? ¿Qué sí demuestra recibir 4 de 4 y qué no demuestra sobre SSH?')
# 21
d=pg('Preparar el servidor SSH de Fedora','ETAPA 5','Informe, p. 18; OpenSSH sshd(8) y sshd_config(5).')
P(d,'<b>Dónde:</b> consola local de Fedora.<br/><b>Propósito:</b> hacer que sshd use el puerto exigido. La configuración de firewall y SELinux se completa en las dos páginas siguientes antes de validar el acceso.')
C(d,'rpm -q openssh-server\n# Solo si falta el paquete y tienes acceso a los repositorios\nsudo dnf install openssh-server\nsudo cp -n /etc/ssh/sshd_config /etc/ssh/sshd_config.bak\nsudo vi /etc/ssh/sshd_config')
P(d,'<b>Editar:</b> en vi, pulsa <b>i</b> para insertar. En la sección global del archivo, antes de cualquier bloque Match, configura una línea activa <b>Port 3625</b>. Pulsa Esc, escribe <b>:wq</b> y Enter para guardar y salir. Si necesitas salir sin guardar, usa Esc y <b>:q!</b>. La copia con -n evita sobrescribir una copia ya existente.')
C(d,'# Línea del archivo, no es un comando de terminal\nPort 3625\n# Consultas y validación desde la terminal\nsudo sshd -t\nsudo sshd -T | grep "^port "')
P(d,'<b>sshd -t</b> comprueba sintaxis y aspectos básicos de claves. Habitualmente no imprime nada si pasa. <b>sshd -T</b> muestra la configuración efectiva. Si aparece otro puerto o más de uno, revisa directivas repetidas y archivos Include antes de concluir que solo escucha 3625. La escucha real se comprueba además con ss.')
H2(d,'Por qué no basta con buscar la palabra Port')
P(d,'Una línea <b>#Port 22</b> está comentada. Un grep puede mostrarla y crear una impresión incorrecta. El reemplazo sed del informe solo funciona si encuentra exactamente el texto esperado. Comprender la directiva y comprobar la configuración efectiva evita depender de una sustitución ciega.')
P(d,'<b>Continúa:</b> autoriza el tráfico y el puerto de SELinux en las páginas 22 y 23. Después reinicia sshd desde la consola. Si la validación de sintaxis devuelve errores, corrígelos antes del reinicio.')
# 22
d=pg('Autorizar el tráfico en el firewall','ETAPA 5','Informe, p. 18; firewalld, Open a Port or Service.')
P(d,'<b>Propósito:</b> permitir que las conexiones TCP al puerto 3625 atraviesen la política de filtrado. Abrir el puerto no crea el servicio ni autentica al usuario. firewalld organiza reglas por zonas, asociadas a interfaces o fuentes.')
C(d,'sudo firewall-cmd --state\nsudo firewall-cmd --get-active-zones\nsudo firewall-cmd --get-zone-of-interface=enp0s3')
P(d,'Identifica la zona que se aplica al tráfico del laboratorio. Si no hay asignación explícita, consulta también <b>--get-default-zone</b> y revisa las zonas por origen. Si el servicio no está activo, debes identificar cómo se administra realmente el filtrado; no interpretes un error como una regla aplicada.')
C(d,'# Ejemplo: ejecutar con public solo si es la zona correcta\nsudo firewall-cmd --zone=public --add-port=3625/tcp --permanent\nsudo firewall-cmd --reload\nsudo firewall-cmd --zone=public --query-port=3625/tcp')
P(d,'Sustituye la palabra <b>public</b> si la zona real tiene otro nombre. <b>--permanent</b> modifica la configuración guardada. <b>--reload</b> recarga las reglas. <b>--query-port</b> pregunta por el permiso en la configuración de ejecución. El yes esperado responde a esa consulta; la comprobación final sigue siendo conectar desde Ubuntu.')
H2(d,'Tres controles distintos')
T(d,['Control','Pregunta'],[['Firewall','¿La política deja pasar este tráfico?'],['SELinux','¿La política permite a este proceso utilizar este recurso?'],['SSH y la cuenta','¿El servidor escucha y acepta la identidad del usuario?']],[.30,.70])
P(d,'En las capturas, <b>success</b> confirma operaciones de firewalld. No demuestra por sí solo una conexión SSH. Tampoco hace que un puerto inactivo tenga un proceso escuchando. Un diagnóstico ordenado comprueba cada condición y luego prueba el recorrido completo.')
# 23
d=pg('Mantener SELinux activo en Fedora','ETAPA 5','Informe, p. 26; Red Hat, Securing networks. Procedimiento de mejora, no resultado ya demostrado.')
P(d,'SELinux aplica controles de acceso según políticas y etiquetas. <b>Enforcing</b> hace cumplir la política; <b>Permissive</b> registra infracciones sin impedirlas; <b>Disabled</b> significa que no está activo. El equipo utilizó setenforce 0 durante el ensayo. La corrección debe validarse aparte.')
C(d,'getenforce\nsudo semanage port -l | grep ssh_port_t\nsudo semanage port -l\n# Solo si procede crear la asociación de 3625/tcp\nsudo semanage port -a -t ssh_port_t -p tcp 3625')
P(d,'<b>-a</b> agrega una asociación; <b>-t ssh_port_t</b> indica el tipo permitido para SSH; <b>-p tcp</b> identifica el protocolo. Revisa asignaciones existentes e intervalos antes de agregar. Si 3625 ya está asociado a otro servicio, investiga su uso antes de modificarlo. Si semanage falta, el paquete habitual es policycoreutils-python-utils y necesita acceso a repositorios para instalarse.')
C(d,'sudo sshd -t\n# Solo si el estado actual es Permissive y la política está lista\nsudo setenforce 1\nsudo systemctl enable sshd\nsudo systemctl restart sshd\nsudo systemctl status sshd --no-pager\nsudo ss -lntp | grep 3625\ngetenforce')
P(d,'<b>Punto de control:</b> Enforcing, servicio activo, socket en 3625 y nueva conexión desde Ubuntu. setenforce 1 no habilita un sistema en Disabled. El modo tras reiniciar depende además de la configuración de SELinux; revisa /etc/selinux/config y sigue el procedimiento de la distribución antes de cambiar un estado Disabled.')
EX(d,'E','El firewall devuelve success, pero sshd no puede escuchar en 3625 con SELinux activo. ¿Qué condición falta revisar y por qué setenforce 0 no es la solución final?',38)
# 24
d=pg('Configurar SSH en FreeBSD','ETAPA 5','Informe, p. 24; FreeBSD Handbook, Security y Configuration.')
P(d,'<b>Dónde:</b> consola local de FreeBSD como root.<br/><b>Propósito:</b> escuchar en 3625 y preparar el inicio del servicio. FreeBSD incorpora OpenSSH en el sistema base. La cuenta normal freebsd debe existir y permitir autenticación.')
C(d,'cp -n /etc/ssh/sshd_config /etc/ssh/sshd_config.bak\nee /etc/ssh/sshd_config')
P(d,'En el editor <b>ee</b>, configura <b>Port 3625</b> en la sección global. Una línea precedida por # no está activa. Utiliza Esc para abrir el menú del editor y selecciona salir guardando; confirma la escritura cuando lo solicite. Regresa a la terminal para ejecutar las comprobaciones.')
C(d,'/usr/sbin/sshd -t\n/usr/sbin/sshd -T | grep "^port "\nsysrc sshd_enable="YES"\n# Si estaba detenido, iniciar; si estaba activo, reiniciar\nservice sshd status\nservice sshd start\n# Para aplicar cambios a un servicio que ya estaba activo\nservice sshd restart\nsockstat -6 -l')
P(d,'<b>No ejecutes start y restart como alternativas sin mirar el estado:</b> inicia si está detenido; reinicia si ya estaba activo y cambiaste la configuración. sysrc guarda la habilitación al arranque. service aplica una acción al servicio actual. sockstat muestra sockets de escucha IPv6; identifica sshd y 3625.')
H2(d,'Si tienes un firewall en FreeBSD')
P(d,'Revisa la política del firewall que realmente esté habilitado, como PF o IPFW, y permite el acceso necesario desde el cliente. El informe no demuestra una configuración específica de firewall en FreeBSD; no corresponde afirmar que se ejecutaron reglas que no aparecen documentadas.')
P(d,'<b>Resultado esperado:</b> servicio operativo, puerto correcto y sesión autenticada desde Ubuntu. La escucha es una condición local; la conexión desde otro equipo verifica el recorrido de red y la autenticación.')
# 25
d=pg('Entrar desde Ubuntu a Fedora','ETAPA 6','Informe, p. 19, figura 24. OpenSSH ssh(1).')
P(d,'<b>Antes de empezar:</b> Ubuntu tiene ::10, Fedora tiene ::20, ambos comparten desafio2 y el servidor escucha en 3625. Asegúrate de estar en la terminal local de Ubuntu; si habías entrado a otro equipo, ejecuta exit hasta volver al cliente.')
C(d,'ssh -6 -p 3625 fedoraserver@2001:db8:1::20')
P(d,'En una primera conexión puede aparecer una clave de host desconocida. Compara la huella con la obtenida por consola en el servidor antes de aceptarla; la página 27 muestra cómo. Después introduce la contraseña de <b>fedoraserver en Fedora</b>. Es normal que al escribir una contraseña la terminal no muestre caracteres.')
IMG(d,'p19_i01.png','Captura real: el comando sale desde Ubuntu y termina en una consola fedoraserver.',maxheight=150)
H2(d,'Cómo demostrar qué equipo estás administrando')
C(d,'# Ejecutar dentro de la sesión de Fedora\nhostname\nwhoami\ncat /etc/os-release\nip -6 addr show dev enp0s3\nexit')
P(d,'hostname y whoami son comprobaciones adicionales propuestas para la defensa. El informe no registra todas estas consultas. En una nueva ejecución, la cuenta debe ser la prevista y la dirección del destino debe corresponder a ::20. <b>exit</b> cierra la shell remota y devuelve el control a la terminal local.')
P(d,'<b>Qué demuestra la captura:</b> destino indicado, autenticación y sesión remota. El prompt aislado no bastaría. La evidencia documenta el ensayo original con la limitación de SELinux señalada; no prueba que posteriormente se haya corregido.')
# 26
d=pg('Entrar desde Ubuntu a FreeBSD','ETAPA 6','Informe, p. 25, figura 36.')
P(d,'<b>Propósito:</b> completar la segunda conexión requerida desde el mismo cliente. El nombre de usuario cambia a freebsd y la dirección a ::30. Mantén el puerto 3625.')
C(d,'# Desde Ubuntu\nssh -6 -p 3625 freebsd@2001:db8:1::30\n# Dentro de la sesión remota\nifconfig em0\nexit')
P(d,'El mensaje de bienvenida de FreeBSD identifica el sistema remoto. La consulta ifconfig muestra la dirección de em0. El informe registra FreeBSD 15.1-RELEASE y 2001:db8:1::30/64. En una instalación diferente la versión puede cambiar; comprueba la real.')
IMG(d,'p25_i02.png','Captura completa de la sesión Ubuntu a FreeBSD. En pantalla puedes ampliar el PDF para leer los detalles.',width=380,maxheight=265)
EX(d,'F','Ya entraste a FreeBSD y ejecutas ifconfig. ¿Estás consultando Ubuntu o FreeBSD? ¿Qué harías para volver a Ubuntu y qué detalle vincula la sesión con ::30?',38)
# 27
d=pg('Huellas del servidor y claves del usuario','SEGURIDAD','OpenSSH ssh-keygen(1), sshd_config(5); principios de autenticación de RFC 4252.')
H2(d,'Comprobar la identidad del servidor')
P(d,'Una huella es un resumen de una clave pública. Por un canal confiable, por ejemplo la consola de la máquina virtual, obtén la huella de la clave de host que el servidor está ofreciendo. Para una clave de host Ed25519 existente:')
C(d,'# Fedora, en la consola del servidor\nsudo ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub\n# FreeBSD, como root\nssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub')
P(d,'Compara el tipo y el valor SHA256 con el aviso del cliente. Si el servidor ofrece otro tipo de clave, consulta la clave correspondiente. No compares valores de algoritmos distintos. El cliente guarda identidades conocidas en known_hosts. Un aviso de cambio exige comprobar la causa, por ejemplo reinstalación o conexión al destino incorrecto, antes de eliminar entradas.')
H2(d,'Las claves de usuario son otra cosa')
P(d,'Para autenticar una cuenta puede utilizarse un par de claves: una privada, que conserva el usuario, y una pública, que se autoriza en el servidor. Una frase de paso protege la clave privada en reposo. Esto no sustituye la comprobación de la clave de host.')
C(d,'# Mejora opcional, no ejecutada en las evidencias\n# Ubuntu: elegir un archivo nuevo si ya existe una clave\nssh-keygen -t ed25519\nssh-copy-id -p 3625 fedoraserver@2001:db8:1::20')
P(d,'Si ssh-copy-id está disponible y el servidor permite la autenticación inicial, instala la clave pública en la cuenta destino. Prueba una sesión nueva antes de deshabilitar métodos anteriores. No sobrescribas una clave existente sin entender para qué se usa y no compartas la clave privada.')
P(d,'<b>Prioridades del laboratorio:</b> cuentas nominales, credenciales robustas, acceso directo de root restringido después de comprobar una alternativa administrativa, huellas verificadas y SELinux activo. Estos puntos son mejoras a validar; la guía no los convierte en hechos ejecutados.')
# 28
d=pg('Comprobar que todo persiste al reiniciar','VALIDACIÓN')
P(d,'<b>Propósito:</b> distinguir una configuración que funciona ahora de una implementación que se recupera después de apagar y encender. La persistencia importa porque un servidor debe volver a prestar el servicio tras un reinicio previsto.')
H2(d,'Secuencia de comprobación propuesta')
P(d,'1. Guarda la configuración y comprueba acceso a la consola de las tres máquinas.<br/>2. Registra direcciones, perfiles y estado de los servicios antes del reinicio.<br/>3. Reinicia una máquina a la vez y espera a que vuelva a estar disponible.<br/>4. Repite la consulta de direcciones e interfaz.<br/>5. Comprueba la escucha SSH en cada servidor.<br/>6. Repite ping y las dos conexiones desde Ubuntu.<br/>7. Guarda capturas fechadas con el origen y el destino identificables.')
T(d,['Sistema','Consultas importantes'],[['Ubuntu','ip -6 addr; conexión manual activa.'],['Fedora','nmcli connection show --active; ip -6 addr; systemctl is-enabled sshd; systemctl is-active sshd; getenforce.'],['FreeBSD','sysrc ifconfig_em0_ipv6; ifconfig em0; sysrc sshd_enable; service sshd status; sockstat -6 -l.']],[.21,.79])
P(d,'<b>Activo</b> significa que el servicio funciona en este momento. <b>Habilitado</b> indica una intención de inicio al arrancar. Un servicio habilitado puede fallar por un error de configuración; por eso hay que comprobar ambos estados y realizar una conexión real.')
P(d,'En Fedora, revisa que el perfil correcto tenga inicio automático y que no compita con otro perfil de la misma interfaz. En FreeBSD, sysrc muestra el valor guardado y ifconfig el aplicado. En SELinux, el modo temporal y el previsto al arranque pueden diferir.')
P(d,'<b>Criterio de aceptación:</b> las direcciones previstas reaparecen, los servidores escuchan en 3625 y Ubuntu vuelve a autenticarse en ambos. Si no has hecho este ensayo, expresa «falta documentar persistencia» en lugar de afirmar que funciona tras cualquier reinicio.')
# 29
d=pg('Qué muestran realmente las evidencias','ANÁLISIS','Informe del equipo, pp. 14, 17 a 19 y 23 a 26.')
T(d,['Afirmación','Evidencia disponible','Alcance'],[['Direcciones IPv6 configuradas','Salidas de ip a, ip -6 a e ifconfig.','Estado en el momento de la captura.'],['Ubuntu accede a Fedora','Comando y sesión en TCP 3625.','Autenticación y consola remota.'],['Ubuntu accede a FreeBSD','SSH y consulta remota ifconfig.','Sesión vinculada al destino ::30.'],['FreeBSD comunica con Fedora','Ping y conexión SSH adicional.','Pruebas entre servidores.'],['ICMPv6 sin pérdida en dos ensayos','4 de 4 respuestas en cada muestra.','No demuestra rendimiento sostenido.'],['SELinux en Enforcing con SSH válido','No aparece una nueva prueba de ese estado.','Mejora pendiente.'],['Funcionamiento después de reiniciar','No aparece una secuencia completa.','Validación pendiente.']],[.31,.39,.30])
H2(d,'Cómo construir una afirmación técnica')
P(d,'Usa esta estructura: <b>qué configuramos + dónde + cómo lo verificamos + límite</b>. Ejemplo: «El cliente Ubuntu accedió a Fedora por IPv6 y TCP 3625; la captura muestra autenticación y una consola remota. La corrección de SELinux debe validarse con una nueva prueba en Enforcing».')
H2(d,'Qué evitar en la defensa')
P(d,'No conviertas una recomendación en una acción realizada. No digas que la red «es totalmente segura» o que «nunca pierde paquetes». Tampoco afirmes una matriz de ping completa porque existe una sesión SSH. Son evidencias diferentes que responden preguntas distintas.')
P(d,'<b>Tu aporte puede ser el análisis:</b> identificar una limitación, explicar su causa probable y proponer una validación concreta demuestra comprensión. Si te preguntan quién ejecutó un paso, responde con precisión sobre la participación del equipo.')
# 30
d=pg('Diagnóstico cuando no hay comunicación','RESOLVER PROBLEMAS')
P(d,'No cambies varias cosas a la vez. Localiza el primer punto de la cadena que no cumple lo esperado. Después modifica una causa y repite la misma prueba para comprobar el efecto.')
T(d,['Orden','Qué revisar','Qué hacer si no coincide'],[['1','¿Estoy en la máquina origen correcta?','Ejecuta hostname y whoami. Sal de una sesión remota si corresponde.'],['2','¿Los tres sistemas están encendidos?','Comprueba sus consolas y que terminaron de arrancar.'],['3','¿Usan desafio2 y cable conectado?','Corrige la conexión virtual de la máquina afectada.'],['4','¿La interfaz correcta está activa?','Consulta ip link o ifconfig; no asumas el nombre.'],['5','¿Las direcciones y /64 son correctos?','Busca errores de escritura o duplicados y aplica la configuración.'],['6','¿La ruta utiliza el enlace previsto?','Revisa ip -6 route o netstat -rn -f inet6.'],['7','¿Se resuelve el vecino?','Genera tráfico y consulta ip -6 neigh o ndp -an.'],['8','¿La política filtra ICMPv6?','Revisa reglas específicas; evita desactivar toda la protección.']],[.10,.40,.50])
H2(d,'Sigue la rama que corresponda')
link(d,'La dirección no aparece: volver a la configuración IPv6',15)
link(d,'La red responde, pero SSH falla: diagnóstico de SSH',31)
link(d,'La sesión abre, pero no sé dónde estoy: interpretar la conexión',25)
P(d,'<b>No route to host</b> o un mensaje equivalente puede relacionarse con rutas, descubrimiento de vecinos o rechazos de red. <b>Timeout</b> solo dice que no hubo respuesta a tiempo; no identifica por sí mismo un firewall. Contrasta el mensaje con las salidas del origen y del destino.')
P(d,'<b>Prueba controlada:</b> si solo FreeBSD falla con los otros dos, compara primero su adaptador y em0. Si todos fallan, verifica el diseño compartido antes de investigar contraseñas: ping ni siquiera está autenticando usuarios.')
# 31
d=pg('Diagnóstico cuando SSH falla','RESOLVER PROBLEMAS')
T(d,['Síntoma','Interpretación inicial','Siguiente comprobación'],[['Connection refused','Se rechazó el intento TCP. Puede no haber escucha o existir un rechazo activo.','Puerto del comando, estado de sshd y socket de escucha.'],['Connection timed out','No llegó una respuesta a tiempo.','Red, ruta, filtrado y disponibilidad del destino.'],['Permission denied','El acceso alcanzó la fase de autenticación y fue rechazado.','Usuario, credencial y métodos autorizados.'],['Host key verification failed','No se aceptó la identidad del servidor.','Huella por consola y entrada conocida del destino.'],['Address already in use','Otro socket puede ocupar el puerto.','Proceso propietario y direcciones de escucha.']],[.28,.38,.34])
C(d,'# Desde Ubuntu, ampliar diagnóstico del cliente\nssh -vv -p 3625 fedoraserver@2001:db8:1::20\n# Fedora: estado, escucha y eventos recientes\nsudo systemctl status sshd --no-pager\nsudo ss -lntp | grep 3625\nsudo journalctl -u sshd -n 30 --no-pager\n# FreeBSD, como root\nservice sshd status\nsockstat -6 -l\ntail -n 30 /var/log/auth.log')
P(d,'La salida detallada ayuda a ubicar la fase que falla. Conserva el mensaje completo, pero no publiques secretos ni archivos de claves privadas. Si una consulta de escucha muestra solo IPv4, investiga la familia de direcciones y ListenAddress antes de afirmar que el servidor acepta IPv6.')
EX(d,'G','SSH solicita contraseña y luego muestra Permission denied. ¿Qué revisarías primero? Explica por qué reiniciar la red sin más evidencia no es el primer paso.',38)
# 32
d=pg('Laboratorio mental con cambios de escenario','PRÁCTICA ACTIVA')
P(d,'Estos casos desarrollan comprensión sin necesidad de tocar la configuración del equipo. Predice el resultado y justifica tu razonamiento. Hay varias causas posibles: propone la comprobación que mejor separa unas de otras.')
H2(d,'Caso 1 · Nombre de red distinto')
P(d,'Ubuntu y Fedora están en desafio2, pero FreeBSD está en desafio3. Las tres direcciones tienen el mismo prefijo /64. Ubuntu no consigue respuesta de FreeBSD. ¿Por qué compartir prefijo no basta? ¿Qué revisarías antes de cambiar la dirección?')
H2(d,'Caso 2 · Puerto distinto')
P(d,'Fedora escucha en TCP 3625. Desde Ubuntu ejecutas <b>ssh fedoraserver@2001:db8:1::20</b> sin una configuración previa del cliente que cambie el puerto. Ping funciona y SSH falla. ¿A qué puerto intentó conectarse el cliente y qué argumento falta?')
H2(d,'Caso 3 · Identificación del destino')
P(d,'La terminal muestra <b>freebsd@freebsd</b>. Ejecutas <b>ping6 -c 4 2001:db8:1::20</b>. ¿Esta captura demuestra ping desde Ubuntu hacia Fedora o desde FreeBSD hacia Fedora? ¿Qué harías para probar el primer trayecto?')
H2(d,'Caso 4 · Evidencia insuficiente')
P(d,'Un compañero agrega una regla y obtiene success. Afirma que «SSH ya funciona y es seguro». ¿Qué dos pruebas adicionales solicitarías y qué limitación de seguridad del laboratorio le recordarías?')
EX(d,'H','Escribe una predicción y una comprobación para cada caso. No busques las respuestas hasta terminar.',38)
# 33
d=pg('Organizar la defensa de diez minutos','DEFENSA GRUPAL')
P(d,'El equipo confirmó cinco integrantes, con dos minutos por persona. La siguiente distribución coincide con la presentación preparada. El tiempo incluye una demostración breve y deja las preguntas del docente para después de los diez minutos.')
T(d,['Integrante','Tiempo','Contenido'],[['Ariel Nunfio','0:00 a 2:00','Objetivo, tres máquinas y red interna.'],['Eduardo Saa','2:00 a 4:00','Plan IPv6 y configuración por sistema.'],['José Ángel Hernández','4:00 a 6:00','Resultados de ping y SSH hacia Fedora.'],['Fátima Oviedo','6:00 a 8:00','SSH hacia FreeBSD y análisis de seguridad.'],['Gerardo Peña','8:00 a 10:00','Demostración desde Ubuntu y conclusiones.']],[.30,.21,.49])
H2(d,'Una explicación técnica en cuatro pasos')
P(d,'<b>Decisión:</b> qué se eligió. <b>Propósito:</b> qué problema resuelve. <b>Evidencia:</b> dónde se observa el resultado. <b>Límite:</b> qué no se puede concluir todavía. Ejemplo: «Usamos una IPv6 estática en em0 para identificar FreeBSD; ifconfig muestra ::30/64. Falta documentar la prueba posterior a reiniciar».')
H2(d,'Preparación de la demostración')
P(d,'Arranquen las tres máquinas antes de exponer y abran una terminal local en Ubuntu. Prueben las credenciales y las huellas sin mostrarlas. Dejen listos los comandos, no sus resultados. Durante la defensa identifiquen el origen, conecten a Fedora, consulten la identidad, salgan y conecten a FreeBSD. Ensayen el cambio entre diapositivas y terminal.')
P(d,'Si la demostración falla, describan el fallo de ese momento y separen las capturas previas de la ejecución actual. Pueden explicar el orden de diagnóstico sin inventar un resultado. Un cambio improvisado que desactive protección necesita justificarse; no es un atajo para afirmar seguridad.')
P(d,'<b>Para tu preparación individual:</b> domina tu bloque, pero también el recorrido completo. El docente puede preguntar por qué un ping funciona, qué es /64 o por qué una regla de firewall no garantiza autenticación.')
# 34
d=pg('Tu bloque de dos minutos','DEFENSA DE FÁTIMA')
H2(d,'Primer minuto · La conexión a FreeBSD')
P(d,'«Para completar el acceso remoto, el equipo configuró el servidor FreeBSD en el puerto 3625. Desde Ubuntu se utilizó la cuenta freebsd y la dirección 2001:db8:1::30. La captura muestra el inicio de sesión y una consulta ifconfig dentro del servidor. En em0 aparece la dirección ::30 con prefijo 64. Esto relaciona la sesión remota con el destino previsto y comprueba la segunda conexión exigida desde Ubuntu».')
H2(d,'Segundo minuto · La limitación de seguridad')
P(d,'«El funcionamiento no completa toda la validación de seguridad. En Fedora se utilizó temporalmente SELinux en modo permisivo. La mejora es autorizar el puerto con el tipo ssh_port_t y repetir el acceso con SELinux en Enforcing. Esa mejora todavía debe documentarse. También conviene verificar la huella del servidor y comprobar que las direcciones y SSH se mantengan después de reiniciar. El puerto 3625 responde a la consigna, pero no sustituye estos controles».')
H2(d,'Por qué esta explicación es defendible')
P(d,'Identifica origen, cuenta, dirección y puerto. Señala una salida real. Reconoce una limitación concreta y propone una prueba para corregirla. No afirma que tú ejecutaste la configuración ni que una recomendación ya esté implementada.')
P(d,'<b>Si preguntan «¿cómo lo sabes?»:</b> responde señalando el comando de entrada, la autenticación y la dirección en ifconfig. <b>Si preguntan «¿qué falta?»:</b> menciona Enforcing con una nueva conexión y validación después de reiniciar. <b>Si no recuerdas una opción:</b> explica su propósito y consulta la orden en la guía.')
P(d,'Lee el bloque una vez, cierra el PDF y explícalo con tus palabras. Grábate y mide dos minutos incluyendo pausas para señalar la captura. La meta es razonar; recitar una frase sin entenderla te deja sin respuesta ante una variante.')
EX(d,'I','Escribe tu explicación personal de la conexión a FreeBSD y una mejora pendiente. No necesitas copiar el guion.',38)
# 35
d=pg('Preguntas básicas con respuestas razonadas','REPASO ORAL')
H2(d,'1 · ¿Por qué utilizar tres máquinas virtuales?')
P(d,'Permiten separar el cliente y los dos servidores con sistemas independientes dentro de un mismo anfitrión. Cada una tiene su propia red, cuentas y servicio. El ensayo reproduce funciones distintas sin requerir tres computadoras físicas.')
H2(d,'2 · ¿FreeBSD es una distribución de Linux?')
P(d,'No. FreeBSD pertenece a la familia BSD y tiene su propio sistema base. Compararlo con Fedora permite observar herramientas distintas, como sysrc y service frente a NetworkManager y systemctl.')
H2(d,'3 · ¿Por qué IPv6 y por qué /64?')
P(d,'IPv6 es parte del requisito. /64 es la longitud elegida para la subred del laboratorio: sus primeros 64 bits son comunes. No significa que haya solo 64 direcciones ni que el puerto tenga ese número.')
H2(d,'4 · ¿Por qué no hay puerta de enlace?')
P(d,'Los tres destinos del ejercicio están en el mismo enlace y subred. La comunicación entre ellos usa una ruta conectada. Para otras redes harían falta rutas apropiadas y un router alcanzable.')
H2(d,'5 · ¿Para qué sirve la dirección fe80::?')
P(d,'Es de enlace local y participa en comunicación del propio enlace. Puede coexistir con la dirección manual. No debe confundirse con la dirección 2001:db8:1:: que se utiliza para identificar los destinos del plan.')
H2(d,'6 · ¿SSH usa ping o el puerto de ping?')
P(d,'No. ping prueba eco ICMPv6 y no abre el puerto TCP de SSH. SSH utiliza TCP, aquí 3625, y añade negociación y autenticación. Por eso se hacen pruebas separadas.')
H2(d,'7 · ¿Por qué la cuenta local y la remota difieren?')
P(d,'La cuenta antes de @ debe existir en el servidor de destino. No tiene que llamarse igual que la cuenta con la que abriste la terminal de Ubuntu.')
H2(d,'8 · ¿Qué hace exit?')
P(d,'Cierra la shell actual. Dentro de SSH normalmente termina la sesión remota y vuelve al cliente. Si existen sesiones anidadas, sale de una a la vez; comprueba dónde quedaste.')
# 36
d=pg('Preguntas técnicas y de análisis crítico','REPASO ORAL')
H2(d,'1 · ¿El cambio del prompt prueba por sí solo el acceso?')
P(d,'No. El prompt puede personalizarse. Hay que relacionarlo con el comando de conexión, la autenticación y consultas del destino. En FreeBSD, ifconfig vincula la sesión con em0 y ::30.')
H2(d,'2 · ¿Qué prueba success en firewall-cmd?')
P(d,'Que la operación solicitada fue aceptada. Todavía hay que comprobar la zona efectiva, el socket de escucha y la conexión desde el cliente. No es evidencia de contraseña válida.')
H2(d,'3 · ¿Cómo mantienen SELinux activo usando otro puerto?')
P(d,'Revisan la política del puerto, autorizan 3625/TCP con el tipo correspondiente cuando proceda y prueban una conexión en Enforcing. La corrección no consiste en dejarlo permanentemente permisivo.')
H2(d,'4 · ¿Qué significa escuchar en [::]:3625?')
P(d,'Es una notación de socket que indica escucha en direcciones IPv6 no limitadas a una sola dirección local, en el puerto 3625. No equivale a conectarse a loopback ::1. La accesibilidad externa también depende de políticas y red.')
H2(d,'5 · ¿Podemos afirmar que Fedora es más rápido?')
P(d,'No a partir de cuatro ecos por trayecto. Los tiempos observados dependen del entorno virtual y de la carga, entre otros factores. La muestra verifica comunicación, no constituye un estudio de rendimiento comparativo.')
H2(d,'6 · ¿Guardado significa probado después del reinicio?')
P(d,'No. Una configuración persistente expresa lo que debería aplicarse. Debe reiniciarse y comprobar el resultado real: dirección, servicio, puerto y nueva sesión.')
H2(d,'7 · ¿Abrir SSH como usuario normal da acceso root?')
P(d,'No automáticamente. La sesión utiliza los permisos de la cuenta autenticada. La elevación posterior requiere autorizaciones y credenciales apropiadas, mediante sudo o el mecanismo disponible.')
H2(d,'8 · ¿Qué pedirían antes de usar esto en producción?')
P(d,'Direccionamiento apropiado, control de cuentas y claves, reglas limitadas al acceso necesario, servicios actualizados, registros, recuperación y pruebas de persistencia. El laboratorio demuestra una función; no acredita por sí solo un despliegue productivo completo.')
# 37
d=pg('Soluciones de conceptos y conectividad','RESPUESTAS A A D')
H2(d,'A · Cliente, servidor y lugar de ejecución')
P(d,'Ubuntu inicia la solicitud y actúa como cliente. Fedora ofrece SSH mediante sshd y actúa como servidor. Después de autenticar, las órdenes de esa shell se ejecutan en Fedora, aunque la ventana siga abierta en Ubuntu. La función depende de la conexión concreta: FreeBSD también puede actuar como cliente al contactar Fedora.')
link(d,'Volver al ejercicio A',4)
H2(d,'B · Direccionamiento')
P(d,'1. FreeBSD usa 2001:db8:1::30/64 y comparte el prefijo 2001:db8:1::/64.<br/>2. 2001:db8:2::20/64 no coincide: el tercer grupo cambió. No se debe asumir la misma subred ni comunicación sin una ruta apropiada.<br/>3. La expansión es 2001:0db8:0001:0000:0000:0000:0000:0030. Dos abreviaturas :: harían ambiguo cuántos grupos omite cada una.<br/>4. ::1 es loopback. Desde Ubuntu contactarías al propio Ubuntu; no a Fedora.')
link(d,'Volver al ejercicio B',8)
H2(d,'C · El origen importa')
P(d,'La consigna pide que Ubuntu inicie la conexión a FreeBSD. Si ejecutas ssh dentro de la sesión de Fedora, el cliente que realiza esa nueva conexión será Fedora. Debes salir hasta la terminal local de Ubuntu y comprobar el origen antes de generar la evidencia requerida.')
link(d,'Volver al ejercicio C',10)
H2(d,'D · Pérdida de paquetes')
P(d,'Se perdió 1 de 4: (4 - 3) / 4 × 100 = 25 %. Recibir 4 de 4 indica que las cuatro solicitudes medidas tuvieron respuesta. No garantiza disponibilidad continua, ancho de banda, ausencia futura de pérdida ni servicio SSH operativo. El eco y la sesión autenticada responden preguntas distintas.')
link(d,'Volver al ejercicio D',20)
P(d,'<b>Cómo evaluar tu respuesta:</b> si identificaste el resultado pero no explicaste por qué, repite el ejercicio cambiando origen, destino o cantidad de paquetes. El razonamiento debe funcionar también con valores nuevos.')
# 38
d=pg('Soluciones de seguridad y diagnóstico','RESPUESTAS E A I')
H2(d,'E · Firewall y SELinux')
P(d,'Revisa si la política de SELinux permite a sshd usar 3625/TCP y consulta los errores del servicio. success solo pertenece a una operación del firewall. Dejar Permissive evita aplicar controles de SELinux, pero no corrige la asociación de puerto. La aceptación exige una nueva conexión con la protección activa.')
link(d,'Volver al ejercicio E',23)
H2(d,'F · Sesión de FreeBSD')
P(d,'ifconfig se ejecuta en FreeBSD. La interfaz em0 y su dirección 2001:db8:1::30/64 coinciden con el plan. exit termina esa shell remota y normalmente devuelve a Ubuntu. Comprueba el contexto si anidaste varias sesiones.')
link(d,'Volver al ejercicio F',26)
H2(d,'G · Error de autenticación')
P(d,'Permission denied después de pedir contraseña orienta hacia cuenta, credencial o política de autenticación. Revisa usuario exacto, existencia de la cuenta y métodos permitidos; consulta logs. No es una prueba de que la red necesite reiniciarse, porque la conversación ya alcanzó al servidor SSH.')
link(d,'Volver al ejercicio G',31)
H2(d,'H · Cambios de escenario')
P(d,'1. Mismo prefijo no une segmentos virtuales diferentes; revisa desafio2 frente a desafio3.<br/>2. Sin -p ni otra configuración del cliente, se intenta el puerto habitual 22. Agrega -p 3625.<br/>3. El origen es FreeBSD. Para probar Ubuntu a Fedora, sal de SSH y ejecuta la prueba localmente en Ubuntu.<br/>4. Solicita la escucha en 3625 y una sesión autenticada desde Ubuntu. Recuerda validar SELinux Enforcing y la identidad del servidor.')
link(d,'Volver al ejercicio H',32)
H2(d,'I · Tu explicación')
P(d,'Debe identificar Ubuntu como origen, FreeBSD como destino, la cuenta freebsd, IPv6 ::30 y TCP 3625. Debe citar la consulta remota y distinguir una mejora pendiente de lo demostrado. No hay una única redacción correcta: cuenta la precisión y la explicación del propósito.')
link(d,'Volver al ejercicio I',34)
# 39
d=pg('Autoevaluación antes de defender','LISTA INTERACTIVA')
P(d,'Marca una casilla solo cuando puedas explicar el punto sin leer. Si necesitas consultar una respuesta, vuelve al tema y ensaya otra vez con un ejemplo distinto. Las casillas registran tu autoevaluación; no calculan una calificación.')
d['checklist']=[
('Distingo anfitrión, máquina virtual e invitado.',4),
('Identifico origen, destino, cuenta y puerto en un comando SSH.',10),
('Explico ::, /64 y el prefijo de la red del laboratorio.',6),
('Justifico la red interna y la ausencia de puerta de enlace.',14),
('Sé dónde aplicar la dirección en cada sistema.',15),
('Interpreto pérdida, promedio y máximo de una prueba ping.',20),
('Distingo firewall, SELinux y autenticación SSH.',22),
('Relaciono una captura con lo que demuestra y sus límites.',29),
('Propongo un diagnóstico antes de modificar la configuración.',30),
('Explico mi bloque de dos minutos con palabras propias.',34),
]
H2(d,'Mi objetivo antes del ensayo')
P(d,'Elige los dos puntos más débiles y programa una acción concreta: explicar una captura, repetir una consulta o resolver un caso. Si puedes, realiza una prueba personalmente y conserva su salida para reconocer la diferencia entre estudiar y comprobar.')
EX(d,'plan','¿Qué voy a repasar o probar antes de la defensa? Escribe dos acciones concretas.',2)
# 40
d=pg('Hoja de consulta rápida','COMANDOS ESENCIALES')
P(d,'Esta página sirve para repasar después de comprender el procedimiento. Los nombres de interfaz y las cuentas corresponden al informe. No reemplaza las verificaciones previas de las páginas 15 a 27.')
T(d,['Lugar','Consulta o acción','Propósito'],[['Ubuntu / Fedora','ip -6 addr','Ver direcciones IPv6.'],['Ubuntu / Fedora','ip -6 route','Ver rutas.'],['Ubuntu / Fedora','ip -6 neigh','Ver vecinos.'],['Fedora','nmcli connection show --active','Ver perfiles activos.'],['Fedora','sudo sshd -t','Validar configuración SSH.'],['Fedora','sudo ss -lntp','Ver sockets TCP en escucha.'],['Fedora','getenforce','Ver estado de SELinux.'],['FreeBSD','ifconfig em0','Ver interfaz del servidor.'],['FreeBSD','sysrc sshd_enable','Ver habilitación guardada.'],['FreeBSD','service sshd status','Ver estado del servicio.'],['FreeBSD','sockstat -6 -l','Ver escucha IPv6.']],[.23,.46,.31])
H2(d,'Las dos conexiones exigidas desde Ubuntu')
C(d,'ssh -6 -p 3625 fedoraserver@2001:db8:1::20\nssh -6 -p 3625 freebsd@2001:db8:1::30')
P(d,'Ejecuta una, verifica el destino y sal con exit antes de iniciar la otra desde Ubuntu. No pongas /64 al final de la dirección en SSH. La contraseña solicitada corresponde a la cuenta del servidor.')
H2(d,'Orden para recordar')
P(d,'<b>Máquina → enlace → dirección → ruta → conectividad → servicio → política → autenticación → evidencia.</b> Este orden organiza el diagnóstico; algunas comprobaciones se solapan, pero evita empezar por una contraseña cuando todavía no existe comunicación.')
# 41
d=pg('Fuentes y lecturas para profundizar','REFERENCIAS 1')
P(d,'Las capturas y resultados provienen del informe del equipo. Los ejercicios son material de estudio. Las verificaciones adicionales se identifican como propuestas.')
refs1=[
('Material del equipo','Desafío 2 - ASI preliminar para ppt.pdf. Informe de 28 páginas aportado para preparar la defensa. Para ubicar las figuras se cuenta la portada como página 1.',None),
('Consigna del curso','Desafio2.pdf. Experiencia de aprendizaje 1, Desafío 2/3 y rúbrica. Universidad Don Bosco, 2026.',None),
('Oracle','Virtual Networking. Manual de VirtualBox. Modos de conexión de las máquinas virtuales.','https://docs.oracle.com/en/virtualization/virtualbox/7.2/user/networkingdetails.html'),
('Hinden y Deering, 2006','RFC 4291. IP Version 6 Addressing Architecture. Representación y estructura del direccionamiento.','https://www.rfc-editor.org/rfc/rfc4291.html'),
('Huston, Lord y Smith, 2004','RFC 3849. IPv6 Address Prefix Reserved for Documentation. Uso reservado de 2001:db8::/32.','https://www.rfc-editor.org/rfc/rfc3849'),
('Narten y colaboradores, 2007','RFC 4861. Neighbor Discovery for IP version 6. Descubrimiento de vecinos y funciones del enlace.','https://www.rfc-editor.org/rfc/rfc4861.html'),
('NetworkManager','nmcli. Manual de administración de conexiones mediante línea de comandos.','https://networkmanager.dev/docs/api/latest/nmcli.html'),
('The FreeBSD Project','Configuration, Services, Logging and Power Management. Configuración y administración de servicios.','https://docs.freebsd.org/en/books/handbook/config/'),
]
for author,desc,url in refs1:
    H2(d,author);P(d,desc)
    if url:S(d,f'<link href="{url}" color="#087D86"><u>Abrir documentación oficial</u></link>')
# 42
d=pg('Fuentes sobre SSH y seguridad','REFERENCIAS 2')
refs2=[
('Ylonen y Lonvick, 2006','RFC 4253. The Secure Shell Transport Layer Protocol. Protección del transporte SSH.','https://www.rfc-editor.org/rfc/rfc4253.html'),
('Ylonen y Lonvick, 2006','RFC 4252. The Secure Shell Authentication Protocol. Autenticación de usuarios.','https://www.rfc-editor.org/rfc/rfc4252.html'),
('OpenBSD Project','ssh(1) y sshd(8). Opciones del cliente y comprobaciones del servidor.','https://man.openbsd.org/ssh'),
('OpenBSD Project','sshd_config(5). Directivas del servidor, puertos, direcciones y permisos.','https://man.openbsd.org/sshd_config'),
('OpenBSD Project','ssh-keygen(1). Gestión de claves y presentación de huellas.','https://man.openbsd.org/ssh-keygen'),
('firewalld','Open a Port or Service. Reglas por zona y configuración de ejecución o permanente.','https://firewalld.org/documentation/howto/open-a-port-or-service.html'),
('Red Hat','Securing networks, Red Hat Enterprise Linux 9. OpenSSH y tratamiento del puerto con SELinux. Se usa como referencia de la política, no para afirmar que Fedora y RHEL son idénticos.','https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html-single/securing_networks/index'),
('The FreeBSD Project','Security, sección OpenSSH. Configuración y administración del acceso remoto.','https://docs.freebsd.org/en/books/handbook/security/'),
]
for author,desc,url in refs2:
    H2(d,author);P(d,desc);S(d,f'<link href="{url}" color="#087D86"><u>Abrir documentación oficial</u></link>')

def draw_para(c,txt,style,x,y,width):
    ob=Paragraph(txt,style);_,ht=ob.wrap(width,1000);ob.drawOn(c,x,y-ht);return y-ht

def render():
    c=canvas.Canvas(str(PDF),pagesize=(W,H),pageCompression=1)
    c.setTitle('Guía interactiva de IPv6 y SSH desde cero')
    c.setAuthor('Material de estudio para el equipo del Desafío 2')
    c.setSubject('Conceptos, procedimientos, diagnóstico y preparación de la defensa')
    over=[]; manifest=[]
    for idx,d in enumerate(pages,1):
        c.bookmarkPage('p'+str(idx));c.addOutlineEntry(f'{idx:02d}  {d["title"]}','p'+str(idx),level=0)
        c.setFillColor(TEAL);c.setFont('Bold',8.5);c.drawString(M,H-36,d['tag'])
        draw_para(c,d['title'],styles['cover'] if d.get('cover') else styles['title'],M,H-53,CW)
        y=H-(155 if d.get('cover') else 115)
        floor=75+(134 if d.get('exercise') else 0)
        for nitem,item in enumerate(d['items']):
            if d.get('checklist') and nitem>0:continue
            if isinstance(item,Paragraph):
                y-=item.style.spaceBefore
            wi,hi=item.wrap(CW,1000)
            item.drawOn(c,M,y-hi)
            y-=hi
            if isinstance(item,Paragraph):y-=item.style.spaceAfter
        if d.get('checklist'):
            y=H-197
            for j,(label,dest) in enumerate(d['checklist']):
                c.acroForm.checkbox(name=f'dominio_{j+1}',tooltip=label,x=M,y=y-12,size=12,buttonStyle='check',borderWidth=.8,borderColor=TEAL,fillColor=colors.white,textColor=INK,checked=False)
                draw_para(c,f'{label} <link href="#p{dest}" color="#087D86">[repasar]</link>',styles['p'],M+23,y+2,CW-23)
                y-=33
            y=draw_para(c,'Elige tus dos puntos más débiles. Vuelve al tema, explica una captura o repite una prueba y registra lo que aprendiste.',styles['small'],M,y-2,CW)
        if y<floor:over.append((idx,d['title'],round(y,1),floor))
        if d.get('exercise'):
            ex=d['exercise'];qstyle=ParagraphStyle('ex',parent=styles['small'],fontName='Bold',fontSize=9.5,leading=12,textColor=INK)
            draw_para(c,'Tu respuesta · '+ex['question'],qstyle,M,197,CW)
            c.acroForm.textfield(name='respuesta_'+ex['key'],tooltip=ex['question'],x=M,y=91,width=CW,height=64,borderWidth=.7,borderColor=TEAL,fillColor=colors.HexColor('#F6FBFB'),textColor=INK,fontName='Helvetica',fontSize=10,fieldFlags='multiline',maxlen=1600,value='')
            label='Consultar respuesta' if ex['key']!='plan' else 'Volver a la ruta de aprendizaje'
            c.setFillColor(TEAL);c.setFont('Body',9);c.drawString(M,77,label);c.linkRect('',f'p{ex["answer"]}',(M,73,M+185,88),relative=0,thickness=0)
        if d.get('source'):
            draw_para(c,d['source'],ParagraphStyle('src',parent=styles['small'],fontSize=7.4,leading=9),M,59,CW)
        c.setStrokeColor(colors.HexColor('#CCDDE2'));c.setLineWidth(.5);c.line(M,34,W-M,34)
        c.setFillColor(GRAY);c.setFont('Body',8.4)
        if idx>1:c.drawString(M,20,'Anterior');c.linkRect('',f'p{idx-1}',(M,15,M+43,29),relative=0,thickness=0)
        c.drawString(M+80,20,'Índice');c.linkRect('','p2',(M+80,15,M+116,29),relative=0,thickness=0)
        if idx<len(pages):c.drawString(M+155,20,'Siguiente');c.linkRect('',f'p{idx+1}',(M+155,15,M+205,29),relative=0,thickness=0)
        c.drawRightString(W-M,20,f'{idx} / {len(pages)}')
        manifest.append({'page':idx,'title':d['title'],'bottom':round(y,1),'exercise':d.get('exercise',{}).get('key')})
        c.showPage()
    c.save()
    (ROOT/'layout.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print('PDF',PDF,'PAGES',len(pages));print('OVERFLOW',over)

if __name__=='__main__':render()
