from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'output/documents/NutriCare_Investigacion_Final_Fatima_Oviedo.docx'
OUT.parent.mkdir(parents=True, exist_ok=True)
TEMP = Path('C:/Users/Fatima Oviedo/AppData/Local/Temp')
d = Document()
sec = d.sections[0]
sec.page_width, sec.page_height = Inches(8.5), Inches(11)
sec.top_margin = sec.bottom_margin = Inches(.78)
sec.left_margin = sec.right_margin = Inches(.9)
sec.header_distance = sec.footer_distance = Inches(.35)
for name in ['Normal','Title','Subtitle','Heading 1','Heading 2','Heading 3']:
    s=d.styles[name]; s.font.name='Calibri'; s.font.color.rgb=RGBColor(0,0,0)
s=d.styles['Normal']; s.font.size=Pt(11)
s.paragraph_format.line_spacing=1.15; s.paragraph_format.space_after=Pt(8)
for name,size in [('Title',26),('Heading 1',18),('Heading 2',13)]:
    d.styles[name].font.size=Pt(size)
    d.styles[name].paragraph_format.space_before=Pt(12)
    d.styles[name].paragraph_format.space_after=Pt(9)
d.styles['Heading 1'].paragraph_format.keep_with_next=True
d.styles['Heading 2'].paragraph_format.keep_with_next=True
footer=sec.footer.paragraphs[0]; footer.alignment=WD_ALIGN_PARAGRAPH.RIGHT
r=footer.add_run('NutriCare  |  '); r.font.size=Pt(9)
fld=OxmlElement('w:fldSimple'); fld.set(qn('w:instr'),'PAGE'); footer._p.append(fld)
d.core_properties.author='Fátima Yesenia Oviedo'
d.core_properties.title='Integración de Firebase en NutriCare'
d.core_properties.subject='Informe técnico académico de React Native y Firebase'

def p(t='',style=None): return d.add_paragraph(t,style)
def h(t): d.add_heading(t,2)
def page(t): d.add_page_break(); d.add_heading(t,1)
def paras(*ts):
    for t in ts: p(t)
def code(t):
    x=p(); x.paragraph_format.space_after=Pt(10)
    x.paragraph_format.line_spacing=1
    for i,line in enumerate(t.splitlines()):
        r=x.add_run(('\n' if i else '')+line); r.font.name='Consolas'; r.font.size=Pt(9)
def table(headers,rows,widths):
    t=d.add_table(rows=1, cols=len(headers)); t.alignment=WD_TABLE_ALIGNMENT.CENTER; t.autofit=False
    for c,w in zip(t.columns,widths): c.width=Inches(w)
    for c,txt in zip(t.rows[0].cells,headers): c.text=txt
    for row in rows:
        for c,txt in zip(t.add_row().cells,row): c.text=txt
    for ri,row in enumerate(t.rows):
        trpr=row._tr.get_or_add_trPr(); no=OxmlElement('w:cantSplit'); trpr.append(no)
        if ri==0:
            rep=OxmlElement('w:tblHeader'); trpr.append(rep)
        for ci,c in enumerate(row.cells):
            c.width=Inches(widths[ci]); c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
            tcpr=c._tc.get_or_add_tcPr(); borders=OxmlElement('w:tcBorders')
            for edge in ['top','left','bottom','right']:
                e=OxmlElement('w:'+edge); e.set(qn('w:val'),'single'); e.set(qn('w:sz'),'4'); e.set(qn('w:color'),'D9D9D9'); borders.append(e)
            tcpr.append(borders)
            sh=OxmlElement('w:shd'); sh.set(qn('w:fill'),'E3EDF3' if ri==0 else ('F7F9FA' if ri%2==0 else 'FFFFFF')); tcpr.append(sh)
            margins=OxmlElement('w:tcMar')
            for edge in ['top','left','bottom','right']:
                e=OxmlElement('w:'+edge); e.set(qn('w:w'),'95'); e.set(qn('w:type'),'dxa'); margins.append(e)
            tcpr.append(margins)
            for pp in c.paragraphs:
                pp.paragraph_format.space_after=Pt(2); pp.paragraph_format.line_spacing=1.05
                for r in pp.runs: r.font.size=Pt(10); r.bold=(ri==0)
    p('')
def figure(number,title,file,width=6.3):
    x=p(f'Figura {number}'); x.runs[0].bold=True; x.paragraph_format.keep_with_next=True
    x=p(title); x.runs[0].italic=True; x.paragraph_format.keep_with_next=True
    x=p(); x.alignment=WD_ALIGN_PARAGRAPH.CENTER
    x.add_run().add_picture(str(TEMP/file),width=Inches(width))
def note(t):
    x=p('Nota. '+t)
    for r in x.runs: r.font.size=Pt(9)

p('UNIVERSIDAD DON BOSCO').alignment=WD_ALIGN_PARAGRAPH.CENTER
p('Computación').alignment=WD_ALIGN_PARAGRAPH.CENTER
p('')
p('Integración de Firebase\nen NutriCare','Title').alignment=WD_ALIGN_PARAGRAPH.CENTER
p('Arquitectura de datos y autenticación\nen una aplicación React Native','Subtitle').alignment=WD_ALIGN_PARAGRAPH.CENTER
p('')
p('Fátima Yesenia Oviedo').alignment=WD_ALIGN_PARAGRAPH.CENTER
p('Estudiante de Computación').alignment=WD_ALIGN_PARAGRAPH.CENTER
p('8 de noviembre de 2026').alignment=WD_ALIGN_PARAGRAPH.CENTER
p('')
h('Resumen')
p('En este informe explico la integración de Firebase Authentication y Cloud Firestore en la aplicación NutriCare desarrollada con React Native y Expo. Presento la estructura del proyecto, las relaciones entre usuarios y expedientes, el flujo de acceso y las condiciones de seguridad definidas en el repositorio. Las capturas permiten reconocer la interfaz y las cuentas existentes; la revisión del código permite precisar cómo se consultan y guardan los datos. El resultado es una base de integración que todavía requiere completar la sincronización entre sesiones, la persistencia nativa y algunos módulos antes de considerarse una aplicación terminada para uso real.')
p('Palabras clave: React Native, Expo, Firebase Authentication, Cloud Firestore, expediente, autenticación.')

page('1 Introducción y alcance')
paras('NutriCare organiza el seguimiento nutricional entre dos perfiles: nutricionista y paciente. La nutricionista registra expedientes, mediciones y consultas; el paciente accede a la información que le corresponde y puede registrar actividades relacionadas con su alimentación. La incorporación de Firebase busca que los datos dejen de depender exclusivamente del dispositivo donde se ingresaron.',
'El objetivo de este documento es explicar las decisiones técnicas de la integración y relacionarlas con el funcionamiento del proyecto. Considero necesario diferenciar una función presente en el código, una pantalla visible y una prueba completa: cada una aporta evidencia distinta sobre el avance.')
h('Objetivos específicos')
for t in ['Describir la arquitectura de la app y la responsabilidad de sus carpetas y componentes.', 'Explicar el modelo documental y la relación entre cuenta de acceso y expediente.', 'Analizar el registro, la verificación del correo y el control de sesión.', 'Identificar el alcance de las reglas y los límites de la sincronización actual.', 'Presentar evidencias y criterios de validación sin atribuir resultados a pruebas no realizadas.']: p(t,'List Bullet')
h('Entorno del proyecto')
p('El repositorio nutricare contiene una aplicación web en la raíz y una aplicación React Native en mobile. Este informe se centra en mobile. Las capturas de su interfaz corresponden a la ejecución de Expo en navegador; no sustituyen una prueba en un dispositivo Android o iOS.')
table(['Elemento','Configuración declarada en mobile/package.json'],[
('Interfaz','React Native 0.88.0 y React 19.3.0'),('Entorno y rutas','Expo ~58.0.14 y Expo Router ~58.0.23'),('Servicios remotos','Firebase JavaScript SDK ^13.2.0'),('Tipos y formularios','TypeScript ~6.0.3, React Hook Form y Zod'),('Proyecto Firebase','nutricare-d913a; base (default) según firebase.json')],[1.8,4.8])
note('Las versiones corresponden a las declaraciones del proyecto; los símbolos ~ y ^ indican rangos de dependencias.')

page('2 Fundamento de la integración')
h('React Native y Expo')
p('React Native permite construir la interfaz con componentes reutilizables y gestionar su estado con React. En NutriCare, componentes como Screen, FormField y PrimaryButton mantienen criterios visuales comunes entre formularios. Expo aporta herramientas para ejecutar el proyecto y acceder a funciones como la cámara y la galería.')
p('El proyecto utiliza el SDK de JavaScript de Firebase. La documentación de Expo contempla esta alternativa para Authentication y Firestore en aplicaciones React Native, y utiliza la configuración de una aplicación web registrada en Firebase (Expo, s. f.). Por ello, que la consola muestre una aplicación llamada NutriCare Web no significa que la app de Expo no pueda consumir esos servicios.')
h('Identidad y datos del sistema')
p('Firebase Authentication administra la identidad: correo, proveedor de acceso y UID. Firestore almacena información de negocio en documentos agrupados en colecciones (Google, s. f.-a). En el proyecto, el nombre y el rol se guardan en users/{uid}, mientras que el expediente y los registros de seguimiento se guardan en records/{id}.')
p('Esta separación explica una situación que surgió durante el desarrollo: una persona puede aparecer en Mis pacientes sin aparecer en Authentication. La nutricionista ha creado su expediente, pero la persona todavía no ha creado su cuenta. No es correcto asumir que ambos registros se generan al pulsar Guardar paciente.')
h('Almacenamiento local y remoto')
p('AsyncStorage permanece en el código como parte del funcionamiento local de la versión inicial. Su presencia no significa que exista una cola de sincronización automática. La app toma distintas rutas según la configuración y la sesión; un registro local no se convierte por sí mismo en un documento de Firestore.')
p('La documentación de React Native describe AsyncStorage como almacenamiento sin cifrado y lo desaconseja para secretos (Meta, s. f.). La rama de demostración de NutriCare aún conserva cuentas con contraseña en almacenamiento local. Esa rama debe deshabilitarse para un uso real; la autenticación remota debe depender de Firebase y no de contraseñas guardadas por la aplicación.')

page('3 Arquitectura de la aplicación')
p('La app se organiza en pantallas, contextos y acceso a servicios. Las pantallas recogen acciones; los contextos distribuyen el estado; las funciones de Firebase ejecutan las operaciones. Esta separación facilita revisar el guardado sin modificar el diseño de cada formulario.')
code('Pantallas en mobile/src/app\n    | formularios y acciones del usuario\nContextos en mobile/src/context\n    | estado compartido y operaciones\nlib/firebase.ts + lib/cloudRecords.ts\n    | SDK de Firebase\nAuthentication              Cloud Firestore\n    | identidad                 | documentos y reglas\n    +------ UID y correo -------+')
table(['Ubicación','Responsabilidad'],[
('src/app/(auth)','Login, registro y recuperación de contraseña.'),('src/app/(tabs)','Inicio, pacientes, mediciones, planes, progreso y perfil.'),('src/app/new-patient.tsx','Formulario de expediente y confirmación del guardado.'),('src/components/ui','Componentes reutilizables de entrada, botones y calendario.'),('src/context','AuthContext, PatientContext, MeasurementContext, AppointmentContext y PhotoContext.'),('src/lib','Inicialización de Firebase y funciones de consulta y escritura.'),('src/schemas y src/types','Validaciones de formularios y contratos de TypeScript.'),('src/data','Datos de demostración y generación de menús.'),('firestore.rules en la raíz','Reglas seleccionadas por firebase.json para el despliegue.')],[2.5,4.1])
h('Responsabilidad de los contextos')
p('AuthContext observa el acceso y expone el usuario actual. Los demás contextos utilizan esa sesión para consultar registros. El diseño evita repetir las llamadas principales en cada pantalla, aunque todavía debe reforzarse el tratamiento de errores y la limpieza de estado al cambiar de usuario.')

page('4 Arquitectura de datos')
p('Firestore utiliza un modelo documental. NutriCare reúne los módulos de seguimiento en records y los distingue mediante kind. La estructura funciona como un contenedor común: los metadatos permiten localizar el registro y payload contiene los detalles codificados como texto JSON.')
table(['Colección','Documento y función'],[
('users','ID igual al UID de Authentication. Guarda id, name, email y role; puede incluir photoUrl.'),('records','Documento de expediente, medición, consulta, plan, fotografía o hábito.'),('settings','Configuración privada prevista en las reglas compartidas. No se acredita aquí su integración completa en la app móvil.')],[1.2,5.4])
table(['Campo de records','Significado'],[
('id y kind','Identificador del documento y categoría del registro.'),('ownerId','UID del propietario del expediente o del hábito personal.'),('patientId','ID del expediente; en hábitos personales se utiliza el UID.'),('patientEmail','Correo normalizado que permite el acceso del paciente verificado.'),('authorId','UID de quien creó el registro.'),('payload','Contenido específico del módulo serializado como JSON.'),('createdAt y updatedAt','Fechas en formato de texto ISO.'),('archived','Marca lógica de archivo.'),('feedback y approved','Respuesta y estado de revisión de una fotografía.')],[2.0,4.6])
h('Relación entre documentos')
p('En un expediente, patientId coincide con su id. Las mediciones, consultas, planes y fotografías apuntan a ese expediente. El UID identifica una cuenta; el ID del expediente identifica un registro clínico. No deben confundirse aunque ambos se utilicen para relacionar información.')

page('5 Consultas y decisiones de modelado')
h('Recuperación de información')
p('listMobileRecords consulta records por ownerId y kind. Si el usuario tiene correo verificado y se solicita el acceso como paciente, también consulta por patientEmail y kind. Después combina los resultados en un Map, evita repetir documentos, descarta los archivados y ordena por createdAt. El filtrado adicional y el ordenamiento ocurren en el cliente.')
h('Escritura y transacciones')
p('saveMobileRecord comprueba la sesión y busca el expediente relacionado antes de guardar registros de seguimiento. Utiliza runTransaction para escribir el documento. Los hábitos usan un identificador compuesto por el UID y la fecha; si ya existe el documento, se actualizan payload y updatedAt. Esto busca mantener un registro diario por usuario.')
p('Una transacción no hace que todo el flujo sea atómico. En el registro de cuenta, Authentication y la creación de users son operaciones distintas. Además, en la función móvil de registros algunas lecturas del expediente se realizan antes de la transacción. Por eso, una operación interrumpida necesita un mensaje claro y una estrategia de recuperación.')
h('Índices y límites actuales')
p('firestore.indexes.json excluye payload de la indexación y no declara índices compuestos. La exclusión es coherente con el hecho de que ese texto no se consulta por campos internos. No se ha medido el costo ni el tiempo de respuesta con muchos registros; por tanto, esta configuración no se presenta como una optimización completa.')
p('Guardar detalles como JSON simplifica la reutilización de la función de escritura, pero impide filtrar directamente por campos internos, como el peso o la fecha de la medición. Como siguiente mejora, propongo guardar los campos que participan en búsquedas como propiedades tipadas, utilizar fechas de servidor y paginar los resultados.')
h('Compatibilidad entre web y móvil')
p('Compartir el proyecto Firebase no garantiza que todos los módulos interpreten igual los datos. Por ejemplo, la app móvil utiliza birthDate y goal, mientras que el formulario web utiliza dateOfBirth y objective. Un contrato de datos compartido, acompañado de una versión de esquema y adaptadores, reduciría errores al abrir en una plataforma un registro creado desde la otra.')

page('6 Flujo de autenticación y sesión')
p('El acceso por correo se implementa en AuthContext. El registro utiliza createUserWithEmailAndPassword, actualiza el nombre, escribe el perfil en users y solicita el envío del correo de verificación. El inicio de sesión llama a signInWithEmailAndPassword; la recuperación usa sendPasswordResetEmail y el cierre de sesión usa signOut.')
code('Nutricionista guarda un expediente\n    -> records/{expedienteId}\nPaciente crea su cuenta con el mismo correo\n    -> Authentication genera el UID\n    -> users/{uid} guarda el perfil\nPaciente verifica el correo\n    -> reload y getIdToken(true)\nConsulta de registros y evaluación de reglas\n    -> acceso a la información autorizada')
h('Estado de la sesión y navegación')
p('onAuthStateChanged observa los cambios de sesión y carga el perfil correspondiente. Firebase recomienda observar ese estado para evitar decisiones durante la inicialización del servicio (Google, s. f.-c). En NutriCare, isReady controla la pantalla de carga. El grupo de rutas privadas redirige al login cuando no existe usuario y el grupo de autenticación redirige al panel cuando ya existe sesión.')
p('El botón Ya verifiqué mi correo ejecuta reload y fuerza la actualización del token. Así, el estado email_verified utilizado por las reglas puede reflejar la verificación reciente. Un usuario registrado y un usuario con correo verificado son estados diferentes.')
h('Alcance de la implementación')
p('El código actual inicializa Auth con getAuth. No incluye una configuración explícita de persistencia nativa con AsyncStorage para Firebase Auth; guardar una copia del perfil local no equivale a conservar las credenciales de sesión del SDK. La prueba de cerrar y reabrir la app en Android o iOS sigue siendo necesaria.')
p('La captura de Authentication incluye un proveedor Google, pero el AuthContext móvil revisado no implementa el inicio con Google. Esa evidencia corresponde al proyecto Firebase compartido y no acredita por sí sola el flujo Google en React Native.')

page('7 Reglas de seguridad y autorización')
p('La configuración principal está en firestore.rules, seleccionado por firebase.json en la raíz. Las reglas controlan las solicitudes del cliente según request.auth y los datos del documento. Este enfoque permite asociar permisos a la identidad autenticada (Google, s. f.-d).')
code('function recipient(data) {\n  return signedIn()\n    && request.auth.token.email_verified == true\n    && request.auth.token.email.lower() == data.patientEmail;\n}\nfunction owner(data) {\n  return signedIn() && data.ownerId == request.auth.uid;\n}')
note('Extracto del archivo firestore.rules del repositorio. La publicación efectiva debe comprobarse en la consola o mediante el despliegue.')
table(['Recurso u operación','Condición definida'],[
('Perfil users/{uid}','Acceso al perfil propio; id y role no se pueden cambiar en una actualización.'),('Lectura de records','Propiedad del registro o coincidencia de correo verificado.'),('Creación clínica','Autor autenticado y relación válida con el expediente, según la categoría.'),('Revisión de fotos','El propietario puede actualizar feedback y approved.'),('Edición del autor de una foto','Puede cambiar payload y archivar si conserva el acceso permitido.'),('Eliminación de records','El borrado físico está denegado; existe archived.'),('Rutas no previstas','Lecturas y escrituras denegadas por defecto.')],[2.0,4.6])
p('Estas reglas se basan principalmente en propiedad y correo, no en una acreditación profesional de la nutricionista. El rol selecciona la experiencia de navegación, pero no demuestra una autorización administrativa. La seguridad no debe describirse solamente como “ocultar pantallas por rol”.')
p('También hay un límite en la validación: las reglas acotan el texto payload, pero no validan los campos clínicos dentro de ese JSON. Para fortalecer el sistema habría que exponer campos tipados, validar rangos en reglas cuando corresponda y probar intentos de acceso cruzado con emuladores.')

page('8 Sincronización y módulos secundarios')
p('La lectura móvil usa getDocs. Los contextos cargan datos al ejecutarse sus efectos y actualizan su estado después de algunas escrituras. Esto constituye persistencia y actualización por consulta; no equivale a recibir automáticamente cada cambio remoto.')
p('Firestore ofrece listeners como onSnapshot para observar cambios (Google, s. f.-b). Ese mecanismo no aparece en los contextos móviles revisados. Una evolución razonable sería suscribir las consultas de la cuenta activa, cancelar la suscripción al cerrar sesión y mostrar errores de sincronización sin conservar datos de la sesión anterior.')
table(['Módulo','Situación de la versión móvil revisada'],[
('Pacientes y mediciones','Funciones de consulta y escritura conectadas a records; faltan pruebas completas entre plataformas.'),('Consultas','Guardado en consultations. La búsqueda del paciente por nombre puede ser ambigua; conviene seleccionar su ID.'),('Planes','Lectura parcial de datos remotos. Los menús y la lista profesional aún incluyen datos de demostración.'),('Hábitos','Escritura diaria en habits. El porcentaje semanal conserva una base fija y no representa todavía siete días reales.'),('Fotografías','Guardado de metadatos y retroalimentación. En nativo puede guardarse una URI local que no abre en otro dispositivo.'),('Eliminación de fotos','La función actual elimina del estado y AsyncStorage, sin archivar el documento remoto.')],[1.5,5.1])
h('Consistencia de los registros')
p('El mismo formulario debe producir el mismo contrato de datos y conservar los campos inmutables al editar. La función móvil recrea algunos metadatos al actualizar registros distintos de hábitos, lo que puede entrar en conflicto con las reglas. Esa situación requiere corregir la operación de actualización, no debilitar la protección de los documentos.')
p('Para fotografías, considero más adecuado almacenar el archivo en un servicio de objetos con permisos y guardar su referencia en Firestore. La implementación actual no acredita una carga nativa completa a Cloud Storage. Esta mejora debe acompañarse de límites de tamaño coherentes con la interfaz.')

page('9 Evidencia de la interfaz de pacientes')
figure(1,'Lista de expedientes en la aplicación de Expo','codex-clipboard-d3031a1c-fd87-4bbd-8d25-f592f1c047ff.png',6.25)
note('Captura del proceso de desarrollo proporcionada por la autora. Se conserva el estado visible de la aplicación en ese momento.')
paras('La pantalla presenta dos expedientes, su objetivo y un acceso para registrar otro paciente. El encabezado identifica el perfil de nutricionista y las tarjetas resumen la información de la lista.',
'Esta captura demuestra la presentación de los expedientes en la interfaz. Por sí sola no confirma si cada elemento proviene de Firestore o de almacenamiento local. La comprobación del origen exige localizar su documento en records y comparar el correo, el ID y los datos del expediente.',
'El mensaje de confirmación del formulario se ajustó para explicar que guardar el expediente no crea una cuenta de acceso. El paciente debe registrarse con el mismo correo. Esta distinción evita interpretar la lista de pacientes como una copia de la lista de Authentication.')

page('10 Evidencia de las cuentas de acceso')
figure(2,'Usuarios registrados en Firebase Authentication','codex-clipboard-b9475cae-7551-4381-a6e9-f7e770393463.png',6.55)
note('Captura del proyecto Firebase compartido. La tabla muestra identificadores, proveedores y UID; no contiene contraseñas.')
paras('La consola muestra cuentas registradas y sus proveedores. Esta información evidencia que Authentication contiene usuarios en el proyecto. No determina desde qué plataforma se creó cada cuenta ni confirma que todas hayan verificado el correo.',
'El UID debe corresponder al ID del documento de perfil en users. En cambio, para localizar un expediente se consulta records y se comprueba kind: patients junto con patientEmail. Son verificaciones complementarias: una valida la identidad y otra valida la existencia de la información de negocio.')
h('Criterio para documentar Firestore')
p('La evidencia completa de persistencia debe incluir el documento remoto, el dato recién ingresado y su recuperación después de abrir nuevamente la aplicación. La galería de capturas de este informe no incluye una lectura de ese documento en la consola; por tanto, no se utiliza como prueba de sincronización remota concluida.')
h('Manejo de las evidencias')
p('En una exposición pública conviene sustituir cuentas personales por cuentas de prueba o anonimizar los correos y los nombres. Las capturas académicas permiten explicar el flujo, pero no justifican publicar información clínica o credenciales.')

page('11 Incidencias y comprobación técnica')
figure(3,'Error de lectura de un campo indefinido durante el desarrollo','codex-clipboard-88722c2f-c45b-43e0-83bc-18d2262dd66e.png',6.15)
note('Evidencia de una incidencia previa. No representa una prueba exitosa de funcionamiento.')
paras('El error mostrado ocurre al intentar usar toLowerCase sobre un valor indefinido. En la lista de pacientes, el estado podía faltar en registros nuevos; en fotografías también había campos que no siempre estaban presentes. Se agregaron valores de respaldo para impedir esas llamadas sobre valores ausentes.',
'La corrección visual evita el cierre por esos accesos, pero la solución de fondo requiere validar y normalizar los registros cuando llegan de Firestore. Una declaración de TypeScript no transforma ni valida automáticamente el contenido remoto.')
h('Comprobación reproducible')
code('cd mobile\nnode node_modules/typescript/bin/tsc --noEmit --pretty false')
p('La comprobación ejecutada el 8 de noviembre de 2026 terminó con código de salida 0 y sin errores de tipos. Este resultado confirma la revisión estática del proyecto móvil. No demuestra por sí mismo que un guardado haya llegado al servidor, que Google funcione en Android o que una sesión sobreviva al cierre de la app.')

page('12 Protocolo de validación funcional')
p('Para evaluar la integración propongo usar dos pacientes de prueba y una nutricionista. Las pruebas siguientes son criterios de aceptación; no se presentan como resultados ya aprobados. Cada ejecución debe registrar plataforma, cuenta utilizada, resultado y evidencia.')
table(['Prueba','Procedimiento','Criterio de aceptación'],[
('Registro','Crear una cuenta desde la app y revisar Authentication y users.','UID consistente y perfil recuperable.'),('Acceso inválido','Ingresar una contraseña incorrecta.','Mensaje claro, sin acceso privado.'),('Vinculación','Crear expediente y cuenta con el mismo correo; verificarlo.','El paciente consulta el expediente autorizado.'),('Aislamiento','Entrar con un segundo paciente e intentar leer el expediente ajeno.','Lectura rechazada por las reglas.'),('Persistencia','Guardar una medición, localizarla en records y reabrir la app.','Mismos datos e ID, sin duplicados.'),('Cambio de sesión','Salir y entrar con otra cuenta.','Sin información residual de la primera.'),('Sesión nativa','Cerrar totalmente la app y abrirla en Android o iOS.','Comportamiento de sesión definido y coherente.'),('Pérdida de red','Interrumpir la conexión durante una operación.','Estado comprensible y recuperación controlada.'),('Fotografía','Subir desde un teléfono y abrirla en otro dispositivo.','Imagen accesible solo para usuarios autorizados.'),('Actualización remota','Cambiar un registro desde otra sesión.','Identificar si requiere recarga o recibe cambios automáticamente.')],[1.25,2.75,2.6])
p('El historial debe verificarse por paciente y fecha; una lista visible no acredita una bitácora de auditoría. archived conserva documentos en lugar de borrarlos, pero no registra todas sus versiones. Si se requiere trazabilidad de cambios, será necesario un mecanismo adicional.')
p('Para grabar el video, primero se ejecuta cada caso sin grabar. Después se muestra el dato antes de guardar, la confirmación, el documento remoto y su recuperación. Si una prueba falla, se documenta la incidencia y su estado en lugar de presentar el resultado esperado como un hecho.')

page('13 Análisis reflexivo y conclusiones')
paras('Como estudiante de Computación, considero que la principal enseñanza de esta integración es entender la responsabilidad de cada parte del sistema. Al principio resulta fácil pensar que crear un paciente y crear un usuario son la misma operación. En NutriCare, distinguir ambos conceptos permite explicar por qué un expediente puede existir antes que la cuenta y por qué el correo verificado participa en el acceso.',
'Firebase facilita disponer de autenticación y almacenamiento remoto sin construir desde cero todos esos servicios. Esto permite concentrar parte del esfuerzo en formularios, navegación y relaciones entre datos. Sin embargo, esa facilidad no elimina las decisiones de seguridad: hay que definir quién es propietario de un registro, qué puede cambiar y cómo se comprueba la identidad del paciente.',
'También considero importante no confundir una pantalla terminada con una integración terminada. Una tarjeta puede mostrar un valor de ejemplo y un formulario puede actualizar el estado local aunque todavía falte confirmar su persistencia. El error de campos indefinidos y la confusión entre expediente y cuenta muestran la importancia de diseñar contratos y mensajes comprensibles.')
h('Mejoras prioritarias')
paras('La primera prioridad es completar la autenticación nativa y retirar el acceso local con contraseñas para un uso real. Después corresponde unificar los contratos de la web y la app, preservar metadatos en las actualizaciones y reemplazar los valores de demostración por datos recuperados de Firestore.',
'La siguiente prioridad es hacer visible el estado de cada operación: guardando, guardado o error. Las consultas deberían poder actualizarse de forma controlada y limpiar datos al cambiar de cuenta. Los listeners son una posibilidad para sincronización continua, pero deben diseñarse junto con el manejo de errores y la cancelación de suscripciones.',
'Finalmente, separaría los archivos de imagen del documento de Firestore y revisaría los índices y la paginación según las consultas reales. Estas decisiones deben responder a necesidades observables, no solamente a la intención de llamar al modelo “avanzado”.')
h('Conclusión')
p('NutriCare cuenta con una estructura reutilizable y una base de integración con Firebase. El proyecto permite analizar autenticación, autorización y persistencia en el contexto de React Native. Mi conclusión es que la calidad de esta etapa se demuestra explicando el código, identificando sus límites y aportando pruebas reproducibles. La estabilidad entre dispositivos y la seguridad integral deben acreditarse antes de utilizar el sistema con información clínica real.')

page('14 Ejecución y trazabilidad del proyecto')
h('Inicio de la app de Expo')
p('Desde la carpeta mobile se cargan las variables EXPO_PUBLIC_FIREBASE_* del archivo .env. El identificador del proyecto debe coincidir con nutricare-d913a. La configuración del cliente no reemplaza las reglas de acceso y no debe contener claves privadas de una cuenta de servicio.')
code('cd "C:\\Users\\Fatima Oviedo\\OneDrive - Universidad Don Bosco\\Escritorio\\nutricare\\mobile"\n$env:EXPO_HOME = (Join-Path (Get-Location) ".expo-home")\n$env:EXPO_NO_TELEMETRY = "1"\n$env:BROWSER = "none"\nnode .\\node_modules\\expo\\bin\\cli start --web --port 8082')
p('La vista de apoyo se abre en http://localhost:8082. Para ejecutar en un dispositivo compatible, se inicia Expo sin --web y se utiliza el flujo de desarrollo correspondiente. La versión Next.js de la raíz se ejecuta por separado en el puerto 3000; no debe usarse como evidencia de una prueba nativa.')
h('Localización de evidencias')
p('En Firebase Console, Authentication → Usuarios muestra las cuentas. Firestore Database → Datos → users muestra los perfiles. La colección records contiene los expedientes y registros identificados por kind. El campo payload se lee como texto JSON y no como una colección adicional.')
h('Archivos que sustentan el informe')
table(['Archivo relativo al repositorio','Contenido revisado'],[
('mobile/src/lib/firebase.ts','Configuración e inicialización del SDK.'),('mobile/src/context/AuthContext.tsx','Acceso, registro, verificación y cierre de sesión.'),('mobile/src/lib/cloudRecords.ts','Consultas, escritura transaccional y revisión de fotos.'),('mobile/src/context/PatientContext.tsx','Alta de expedientes y ruta de almacenamiento local.'),('mobile/src/context/PhotoContext.tsx','Fotografías, comentarios y eliminación local.'),('mobile/src/app/(tabs)/plan.tsx','Lectura parcial del plan y contenido de demostración.'),('mobile/src/app/(tabs)/index.tsx','Checklist, verificación y resumen del paciente.'),('firestore.rules y firestore.indexes.json','Condiciones de acceso e índices declarados.')],[3.55,3.05])
note('Las rutas son relativas a la carpeta nutricare. El análisis corresponde al estado revisado el 8 de noviembre de 2026.')

page('15 Referencias')
p('Referencias en formato APA 7. Las fuentes documentan los servicios y conceptos; las observaciones específicas de NutriCare se sustentan en los archivos y capturas identificados en este informe.')
refs=[
('Expo. (s. f.). Using Firebase. Expo Documentation.','https://docs.expo.dev/guides/using-firebase/'),
('Google. (s. f.-a). Cloud Firestore data model. Firebase.','https://firebase.google.com/docs/firestore/data-model'),
('Google. (s. f.-b). Get realtime updates with Cloud Firestore. Firebase.','https://firebase.google.com/docs/firestore/query-data/listen'),
('Google. (s. f.-c). Manage users in Firebase. Firebase.','https://firebase.google.com/docs/auth/web/manage-users'),
('Google. (s. f.-d). Writing conditions for Cloud Firestore Security Rules. Firebase.','https://firebase.google.com/docs/firestore/security/rules-conditions'),
('Meta. (s. f.). Security. React Native.','https://reactnative.dev/docs/security'),
]
for txt,url in refs:
    prefix, rest = txt.split('). ', 1)
    title, site = rest.rsplit('. ', 1)
    x=p(); x.add_run(prefix+'). '); x.add_run(title).italic=True; x.add_run('. '+site+' '+url)
    x.paragraph_format.left_indent=Inches(.3); x.paragraph_format.first_line_indent=Inches(-.3); x.paragraph_format.space_after=Pt(18)
h('Material primario del proyecto')
p('Oviedo, F. Y. (2026). NutriCare [Código fuente y capturas de desarrollo no publicados]. Universidad Don Bosco.')
p('Consulta de documentación y revisión del repositorio: 8 de noviembre de 2026. Las figuras 1 a 3 reproducen capturas del proceso de desarrollo. No se sustituyeron por pantallas simuladas ni se presentan como comprobantes de operaciones que no muestran.')
d.save(OUT)
print(OUT)
