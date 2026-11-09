from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'output/documents/Guion_Firebase_NutriCare_5_minutos_Fatima.docx'
OUT.parent.mkdir(parents=True, exist_ok=True)
doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Inches(8.5), Inches(11)
sec.top_margin = sec.bottom_margin = Inches(.7)
sec.left_margin = sec.right_margin = Inches(.85)
sec.header_distance = sec.footer_distance = Inches(.3)
for name in ['Normal', 'Title', 'Subtitle', 'Heading 1', 'Heading 2', 'Heading 3']:
    st = doc.styles[name]
    st.font.name = 'Calibri'
    st.font.color.rgb = RGBColor(0, 0, 0)
    st.paragraph_format.space_after = Pt(7)
doc.styles['Normal'].font.size = Pt(11)
doc.styles['Normal'].paragraph_format.line_spacing = 1.12
doc.styles['Title'].font.size = Pt(23)
doc.styles['Heading 1'].font.size = Pt(17)
doc.styles['Heading 2'].font.size = Pt(13)
doc.styles['Heading 2'].paragraph_format.space_before = Pt(12)
doc.styles['Subtitle'].font.size = Pt(11)
header = sec.header.paragraphs[0]
header.text = 'NUTRICARE  |  GUION DE DEMOSTRACIÓN  |  FÁTIMA OVIEDO'
header.runs[0].font.size = Pt(9)
footer = sec.footer.paragraphs[0]
footer.alignment = 2
r = footer.add_run('Página ')
r.font.size = Pt(9)
field = OxmlElement('w:fldSimple')
field.set(qn('w:instr'), 'PAGE')
footer._p.append(field)

def p(text='', label=None):
    para = doc.add_paragraph()
    if label:
        para.add_run(label + ' ').bold = True
    para.add_run(text)
    return para

def h(text, level=1):
    doc.add_heading(text, level)

def page():
    doc.add_page_break()

def code(text):
    para = p(text)
    para.paragraph_format.space_after = Pt(5)
    for r in para.runs:
        r.font.name = 'Consolas'
        r.font.size = Pt(10)

spoken = []
def scene(n, start, end, title, actions, speech, evidence):
    h(f'{n} {title}', 2)
    p(f'{start} a {end}', label='Tiempo')
    p(actions, label='Muestra y haz')
    p('«' + speech + '»', label='Di')
    p(evidence, label='Comprueba')
    spoken.append(speech)

doc.add_paragraph('Guion de demostración de Firebase en NutriCare', 'Title')
p('Fátima Yesenia Oviedo · Estudiante de Computación · 8 de noviembre de 2026', label=None)
p('Duración del video 5 minutos · Preparación sugerida 100 minutos', label=None)
p('Este guion te guía para demostrar acceso, sesión, guardado y seguridad con evidencias visibles. Lee en voz alta únicamente los párrafos “Di”. Las acciones y comprobaciones son instrucciones para ti. Ensaya primero: los resultados esperados no equivalen a pruebas ya aprobadas.')
h('Prepara la grabación')
p('1. Abre la carpeta nutricare en Visual Studio Code. La app React Native está en mobile; la web Next.js de localhost:3000 es otra interfaz. Mantén abierta la terminal que ejecuta Expo.')
p('2. Para ensayar en el navegador, abre una terminal en la raíz de nutricare y ejecuta:')
code('Set-Location .\\mobile')
code('pnpm run web:8082')
p('Abre http://localhost:8082/login. Si ya responde, úsalo sin iniciar otro servidor. Para demostrar Android o iOS, usa una app o emulador compatible que ya hayas probado; pnpm start inicia Expo desde mobile. El navegador demuestra Expo para web, no una ejecución nativa.')
p('3. Ten lista tu cuenta real de nutricionista y su contraseña. Abre Firebase Console en el mismo proyecto configurado en mobile: Authentication → Usuarios y Firestore Database → Datos / Reglas. No muestres contraseñas ni el contenido de .env.')
p('4. Prepara estos datos ficticios: nombre “Paciente Video”, correo prueba.video@example.com, nacimiento 01/01/2000, estatura 168 cm, sexo a elección y objetivo “Mejorar hábitos”. Para el ensayo usa “Paciente Ensayo” y otro correo ficticio. No se enviará una invitación al guardar el expediente.')
p('5. Abre en VS Code mobile/src/context/AuthContext.tsx, mobile/src/lib/cloudRecords.ts y firestore.indexes.json. En Firebase deja preparado el simulador descrito en la última página. Anota el UID de tu cuenta y el ID de un expediente de prueba.')
h('Aprende y ensaya en 100 minutos')
p('0–15 min: lee este guion y el vocabulario final. 15–35 min: abre app, consola y archivos. 35–60 min: prueba el recorrido completo y las reglas. 60–80 min: ensaya dos veces con cronómetro. 80–100 min: graba y revisa. Si falla una prueba, corrígela antes de afirmar que funciona; estos tiempos son una guía, no una garantía.')

page()
h('Guion de acceso y sesión')
scene(1, '0:00', '0:20', 'Presentación',
      'Muestra el login de la app y, durante unos segundos, la carpeta mobile en VS Code. Elige la frase que corresponde al entorno real.',
      'Soy Fátima Oviedo y presentaré la integración de Firebase en NutriCare. Voy a mostrar cómo inicio sesión, guardo un expediente y compruebo sus permisos. Esta es la aplicación React Native con Expo, ejecutada en el navegador.',
      'Si grabas en un teléfono o emulador, sustituye “en el navegador” por el dispositivo concreto. No presentes localhost:3000 como la app React Native.')
scene(2, '0:20', '0:55', 'Inicio de sesión',
      'Ingresa tu correo con una contraseña incorrecta una sola vez. Muestra el mensaje; corrige la contraseña e ingresa. Abre Authentication → Usuarios y señala tu cuenta. Regresa a la app.',
      'Primero intento entrar con una contraseña incorrecta. La aplicación informa el error y me permite corregirlo. Con los datos correctos accedo a mi perfil. Firebase Authentication administra esta identidad y le asigna un UID, que es su identificador único. Esta misma cuenta aparece aquí en la consola.',
      'El error debe aparecer sin dejar el botón cargando indefinidamente. Después del acceso, Perfil debe mostrar tu nombre y rol correctos. No confundas esta cuenta con el expediente que crearás después.')
scene(3, '0:55', '1:20', 'Continuidad de la sesión',
      'Ve a Pacientes y luego a Perfil. En el navegador recarga una vez; en el dispositivo usa la recarga de Expo. Espera a que termine la carga inicial.',
      'Ahora cambio de pantalla y recargo la aplicación. La prueba consiste en comprobar que se recupera mi sesión y aparece el mismo perfil. El estado de autenticación se consulta antes de mostrar las pantallas privadas, para evitar que la navegación dependa de haber escrito una dirección.',
      'Solo continúa con esta afirmación si la sesión se recupera en tu ensayo. La recarga del navegador no demuestra persistencia después de cerrar por completo una app Android o iOS; esa prueba nativa se valida aparte.')
h('Ritmo de esta primera parte')
p('Lleva los campos preparados para escribir sin pausas largas. No leas los nombres de funciones todavía. Mantén visible cada resultado durante dos o tres segundos. Si el inicio de sesión tarda más, deja terminar la operación y ajusta la edición sin ocultar un fallo.')

page()
h('Guion de guardado y recuperación')
scene(4, '1:20', '2:05', 'Crear un expediente',
      'Ve a Pacientes → Registrar nuevo paciente. Completa los datos ficticios preparados. Pulsa Guardar paciente; muestra “Expediente guardado” y luego Volver a pacientes.',
      'Como nutricionista, registro este expediente con los datos básicos del paciente. Al guardar, recibo una confirmación y el paciente aparece en mi lista. Este paso crea un registro en Firestore. La cuenta de acceso es independiente: el paciente debe registrarse con el mismo correo y verificarlo para consultar sus datos.',
      'Aparecen la confirmación y el nuevo nombre en la lista. El correo ficticio de esta demostración no sirve para recibir la verificación; para probar el acceso del paciente usa una cuenta de prueba cuyo correo controles.')
scene(5, '2:05', '2:40', 'Ver el registro en Firestore',
      'Abre Firestore Database → Datos → records. Localiza el documento nuevo por patientEmail igual a prueba.video@example.com; si hay muchos, usa una consulta por ese campo. Señala kind, ownerId, patientId y payload.',
      'En Firestore encuentro el mismo expediente. El campo kind indica que es de tipo patients. ownerId guarda el UID de quien administra el registro, y patientId identifica el expediente. El contenido del formulario está en payload. Así puedo relacionar el registro con su propietario y comprobar que llegó a la base remota.',
      'kind es patients y payload contiene “Paciente Video”. Compara ownerId con el UID de tu cuenta en Authentication. Copia el ID real del documento para la prueba de reglas; no uses el nombre del paciente como ID.')
scene(6, '2:40', '3:05', 'Recuperar datos guardados',
      'Regresa a Pacientes y recarga. Espera la carga. Señala otra vez “Paciente Video”. Si tienes tiempo dentro del bloque, abre Medición para mostrar un control de prueba guardado previamente.',
      'Recargo y el expediente sigue disponible. Esto, junto con el documento que mostré en Firestore, evidencia el guardado y la recuperación desde la nube. En esta versión móvil la consulta se realiza al cargar los datos. Por eso describo esta prueba como persistencia y recuperación, no como actualización instantánea entre dispositivos.',
      'El nombre, correo y objetivo coinciden con el registro. La medición previa es opcional: no necesitas crear otra para completar los cinco minutos.')

page()
h('Guion de seguridad y explicación técnica')
scene(7, '3:05', '3:45', 'Comprobar las reglas',
      'En el simulador preparado, ejecuta get sobre el mismo documento con el UID propietario. Repite con un UID ajeno sin correo coincidente. Sigue los pasos de la última página.',
      'Aquí simulo la lectura del mismo expediente. Con el UID propietario se permite y con un usuario ajeno se deniega. La protección se aplica mediante reglas de Firestore. El acceso del paciente también exige que su correo esté verificado y coincida con el expediente. Este resultado es una prueba concreta de lectura, no una auditoría completa.',
      'Deben verse los dos resultados. Una lista vacía en la app no basta para demostrar seguridad.')
scene(8, '3:45', '4:20', 'Relacionar código y datos',
      'En VS Code señala onAuthStateChanged en AuthContext.tsx, los filtros where en cloudRecords.ts y payload en firestore.indexes.json.',
      'El contexto de autenticación escucha los cambios de sesión y comparte el usuario con las pantallas. La capa de datos consulta los registros por propietario y tipo. Además, payload se excluye de los índices porque la aplicación no lo usa para filtrar. Son decisiones concretas de organización; para crecer, todavía conviene incorporar paginación y separar los campos que necesiten búsquedas.',
      'Explica filtros e índices como decisiones de diseño; no hay una prueba de rendimiento en este video.')
scene(9, '4:20', '4:45', 'Cerrar la sesión',
      'Ve a Perfil → Cerrar sesión → Sí, cerrar sesión. En Expo web intenta abrir http://localhost:8082/patients; en el dispositivo intenta volver a la pantalla privada.',
      'Cierro sesión y vuelvo a intentar entrar a Pacientes. El resultado esperado es regresar al login. Así compruebo que el acceso a las pantallas privadas depende de una sesión activa y que salir de la cuenta cambia el flujo de navegación.',
      'Sin sesión, la pantalla debe regresar al login.')
scene(10, '4:45', '5:00', 'Conclusión',
      'Mantén visible el login o el título del informe técnico. Termina al llegar a cinco minutos.',
      'Con estas pruebas relacioné autenticación, almacenamiento y permisos. Aprendí que guardar datos también implica controlar quién los consulta. Como siguientes mejoras, quedan la sincronización en tiempo real y la validación de la persistencia de sesión en dispositivos nativos.',
      'Cierra con los resultados que sí observaste.')

page()
h('Ensayo de seguridad antes de grabar')
p('Esta preparación se hace fuera de los cinco minutos. Sirve para dejar lista la escena 7. Se basa en el simulador oficial de Firebase (Google, s. f.).')
p('1. En Firestore Database → Datos, abre un expediente de prueba existente en records. Copia su ID y el valor ownerId. Ambos son distintos: el ID identifica el expediente; ownerId identifica al propietario.')
p('2. Abre Reglas y Rules Playground o Simulador de reglas. Usa las reglas actuales sin editarlas. Comprueba que incluyen owner y recipient como en el archivo firestore.rules de la raíz de nutricare. El simulador evalúa el código del editor; un archivo local no demuestra por sí solo que esté publicado.')
p('3. Selecciona la operación get y la ubicación records/ seguida del ID real del documento. Si la consola ya muestra un prefijo de base de datos, completa solo la ruta relativa. El documento debe existir: una ruta inventada no prueba la protección de un registro real.')
p('4. Activa la autenticación simulada e introduce como UID el ownerId copiado. Ejecuta Run o Ejecutar. Espera un resultado permitido.')
p('5. Conserva la misma ruta y cambia el UID por usuario_ajeno_video. No incluyas el correo del paciente; deja email_verified en false si aparece. Ejecuta de nuevo. Espera un resultado denegado. Puedes repetir con autenticación desactivada: también debe denegarse.')
p('6. Si el usuario ajeno obtiene permiso, o el propietario no lo obtiene, revisa la ruta y las reglas antes de grabar. No publiques reglas abiertas para que la demostración pase. En el video indica que es una simulación de solicitudes, no un inicio de sesión real de esos usuarios.')
h('Lista final de comprobación')
for text in [
    'Se ve la app de mobile y se identifica si corre en web, Android o iOS.',
    'Se muestra un error de credenciales, acceso correcto, recarga y cierre de sesión.',
    'El mismo expediente aparece en la app, en records y después de recargar.',
    'Se observa una lectura permitida y otra denegada sobre un documento existente.',
    'Las afirmaciones corresponden a resultados visibles; no hay contraseñas ni datos clínicos reales.',
]:
    p('□ ' + text)
h('Cinco conceptos para explicar sin memorizar código')
p('Authentication verifica quién entra. UID identifica la cuenta. Firestore guarda documentos. Las reglas deciden quién puede leer o cambiar datos. El contexto de React comparte la sesión entre pantallas. Un expediente y una cuenta de acceso son objetos diferentes.')
h('Referencia para revisar el simulador')
p('Google. (s. f.). Quickly validate Firebase Security Rules. Firebase. https://firebase.google.com/docs/rules/simulator')
p('Base del guion: revisión del código local de NutriCare del 8 de noviembre de 2026. Las pruebas interactivas de este guion quedan a cargo del ensayo; no se dan por ejecutadas por la redacción del documento.')

doc.core_properties.title = 'Guion de demostración de Firebase en NutriCare'
doc.core_properties.author = 'Fátima Yesenia Oviedo'
doc.core_properties.subject = 'Video de cinco minutos de autenticación y Firestore en React Native'
doc.save(OUT)
print(OUT)
print('Palabras de narración:', sum(len(s.split()) for s in spoken))
