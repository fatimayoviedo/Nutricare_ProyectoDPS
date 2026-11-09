import { test, expect, type Page } from '@playwright/test';

async function register(page:Page, email:string, role:string) {
  await page.goto('/registro');
  await expect(page.getByRole('button',{name:'Crear cuenta',exact:true})).toBeEnabled();
  await page.getByLabel('Nombre completo').fill(role === 'nutritionist' ? 'Nutricionista Prueba' : 'Paciente Prueba');
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Tipo de cuenta').selectOption(role);
  await page.getByLabel('Contraseña',{exact:true}).fill('PruebaSegura123!');
  await page.getByLabel('Confirmar',{exact:true}).fill('PruebaSegura123!');
  await page.getByRole('button',{name:'Crear cuenta',exact:true}).click();
  await expect(page).toHaveURL(/dashboard/);
}

test('flujo web completo con persistencia entre paciente y nutricionista',async({browser,request})=>{
  const suffix=Date.now();
  const patientEmail=`patient${suffix}@example.com`;
  const professional=await browser.newContext(); const patientContext=await browser.newContext();
  const page=await professional.newPage(); const patientPage=await patientContext.newPage();
  const errors:string[]=[];
  page.on('pageerror',error=>{errors.push(error.message);console.error(error.message);});patientPage.on('pageerror',error=>{errors.push(error.message);console.error(error.message);});
  await register(page,`professional${suffix}@example.com`,'nutritionist');
  await page.goto('/pacientes/nuevo');
  await page.getByLabel('Nombre completo').fill('Paciente Prueba');
  await page.getByLabel('Correo electrónico').fill(patientEmail);
  await page.getByLabel('Fecha de nacimiento').fill('1995-12-20');
  await page.getByLabel('Estatura (cm)').fill('170');
  await page.getByLabel('Objetivo principal').fill('Objetivo registrado en Firestore');
  await page.getByRole('button',{name:'Crear paciente',exact:true}).click();
  await page.getByRole('button',{name:'Ver pacientes',exact:true}).click();
  await expect(page).toHaveURL(/\/pacientes$/);
  await expect(page.getByText('Paciente Prueba',{exact:true})).toBeVisible();

  await page.goto('/mediciones');
  await page.getByRole('button',{name:'Nueva medición'}).click();
  await page.getByRole('combobox',{name:'Paciente',exact:true}).selectOption({label:'Paciente Prueba'});
  await page.getByLabel('Peso (kg)').fill('70');
  await page.getByLabel('Grasa corporal (%)').fill('23');
  await page.getByLabel('Masa muscular (%)').fill('37');
  await page.getByLabel('Edad metabólica').fill('30');
  await page.getByRole('button',{name:'Guardar y calcular IMC'}).click();
  await expect(page.getByRole('cell',{name:'70 kg',exact:true})).toBeVisible();

  await page.goto('/consultas/nueva');
  await page.getByRole('combobox',{name:'Paciente',exact:true}).selectOption({label:'Paciente Prueba'});
  const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);
  const date=`${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,'0')}-${String(tomorrow.getDate()).padStart(2,'0')}T15:30`;
  await page.getByLabel('Fecha y hora').fill(date);
  await page.getByRole('button',{name:'Programar consulta'}).click();
  await expect(page).toHaveURL(/\/consultas$/);
  await expect(page.getByText('Paciente Prueba',{exact:true})).toBeVisible();

  await page.goto('/planes/nuevo');
  await page.getByRole('combobox',{name:'Paciente',exact:true}).selectOption({label:'Paciente Prueba'});
  await page.getByLabel('Mes asignado').selectOption({index:1});
  await page.getByLabel('Nombre del plan').fill('Plan prueba persistente');
  await page.getByRole('button',{name:'Crear y asignar plan'}).click();
  await expect(page).toHaveURL(/\/planes$/);
  await page.getByLabel('Filtrar por paciente').selectOption({label:'Paciente Prueba'});
  await expect(page.getByRole('heading',{name:'Plan prueba persistente'})).toBeVisible();
  await page.getByRole('link',{name:/Editar menú/}).click();
  await page.getByLabel('Nombre del plan').fill('Plan actualizado');
  await page.getByRole('button',{name:'Guardar cambios del plan'}).click();
  await expect(page).toHaveURL(/\/planes$/);

  await register(patientPage,patientEmail,'patient');
  const login=await request.post('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-key',{data:{email:patientEmail,password:'PruebaSegura123!',returnSecureToken:true}});
  const identity=await login.json();
  const verify=await request.post('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:update?key=demo-key',{headers:{Authorization:'Bearer owner'},data:{localId:identity.localId,emailVerified:true}});
  expect(verify.ok()).toBeTruthy();
  await patientPage.getByRole('button',{name:'Ya verifiqué mi correo'}).click();
  await expect(patientPage.getByRole('checkbox')).toHaveCount(5);
  for(const checkbox of await patientPage.getByRole('checkbox').all()) {await checkbox.click();await expect(checkbox).toBeEnabled();}
  await expect(patientPage.getByText('1 de 7 días',{exact:true})).toBeVisible();
  await patientPage.reload();
  await expect(patientPage.getByRole('checkbox').first()).toBeChecked();
  await expect(patientPage.getByText('1 de 7 días',{exact:true})).toBeVisible();

  await patientPage.goto('/comidas');
  await patientPage.getByRole('button',{name:'Agregar fotografía',exact:true}).click();
  const sampleImage = await patientPage.evaluate(() => {const canvas=document.createElement('canvas');canvas.width=100;canvas.height=100;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#0faa91';ctx.fillRect(0,0,100,100);return canvas.toDataURL('image/png').split(',')[1];});
  await patientPage.locator('input[type=file]').setInputFiles({name:'comida.png',mimeType:'image/png',buffer:Buffer.from(sampleImage,'base64')});
  await patientPage.getByLabel('Comentario opcional').fill('Mi comida de prueba');
  await patientPage.getByRole('button',{name:'Guardar fotografía',exact:true}).click();
  await expect(patientPage.getByText('Mi comida de prueba',{exact:true})).toBeVisible();
  await patientPage.reload();
  await expect(patientPage.getByText('Mi comida de prueba',{exact:true})).toBeVisible();
  await expect(patientPage.locator('img').last()).toHaveJSProperty('naturalWidth',100);

  await page.goto('/fotografias');
  await page.getByRole('button',{name:'Ver y comentar'}).click();
  await page.getByLabel('Comentario para el paciente').fill('Retroalimentación de prueba guardada');
  await page.getByRole('button',{name:'Guardar comentario',exact:true}).click();
  await page.getByRole('alertdialog').getByRole('button').last().click();
  await expect(page.getByRole('alertdialog')).toContainText(/guardad/i);
  await page.getByRole('alertdialog').getByRole('button').last().click();
  await page.getByRole('button',{name:'Aprobar fotografía',exact:true}).click();
  await expect(page.getByRole('button',{name:'Fotografía aprobada',exact:true})).toBeVisible();
  await patientPage.reload();
  await expect(patientPage.getByText('Retroalimentación de prueba guardada',{exact:true})).toBeVisible();
  await expect(patientPage.getByText('Aprobada',{exact:true})).toBeVisible();
  await patientPage.goto('/progreso');
  await expect(patientPage.getByRole('heading',{name:'70 kg'})).toBeVisible();
  await patientPage.goto('/historial');
  await expect(patientPage.getByText(/70 kg · IMC/)).toBeVisible();
  await patientPage.setViewportSize({width:390,height:844});
  await expect(patientPage.getByRole('heading',{name:'Historial de registros'})).toBeVisible();
  expect(await patientPage.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await patientPage.screenshot({path:'.local-tools/qa-historial-mobile.png',fullPage:true});
  expect(errors).toEqual([]);
  await professional.close();await patientContext.close();
});

test('perfil, preferencias, contraseña y cierre de sesión',async({page})=>{
  const email=`security${Date.now()}@example.com`;
  await register(page,email,'patient');
  await page.goto('/perfil');
  await page.getByRole('button',{name:/Datos personales/}).click();
  await page.getByLabel('Nombre completo').fill('Nombre actualizado');
  await page.getByRole('button',{name:'Guardar cambios',exact:true}).click();
  await expect(page.getByText('Tus datos personales se actualizaron correctamente.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading',{name:'Nombre actualizado'})).toBeVisible();
  await page.getByRole('button',{name:/Notificaciones Recordatorios/}).click();
  await page.getByRole('switch',{name:'Próximas consultas',exact:true}).click();
  await page.getByRole('button',{name:'Guardar preferencias'}).click();
  await expect(page.getByText('Preferencias guardadas en tu cuenta.')).toBeVisible();
  await page.reload();
  await page.getByRole('button',{name:/Notificaciones Recordatorios/}).click();
  await expect(page.getByRole('switch',{name:'Próximas consultas',exact:true})).not.toBeChecked();
  await page.getByRole('button',{name:/Seguridad Contraseña/}).click();
  await page.getByLabel('Contraseña actual').fill('PruebaSegura123!');
  await page.getByLabel('Nueva contraseña',{exact:true}).fill('NuevaPrueba123!');
  await page.getByLabel('Confirmar contraseña',{exact:true}).fill('NuevaPrueba123!');
  await page.getByRole('button',{name:'Cambiar contraseña',exact:true}).click();
  await expect(page.getByText('Tu contraseña se actualizó correctamente.')).toBeVisible();
  await page.getByRole('button',{name:'Cerrar sesión',exact:true}).click();
  await page.getByRole('button',{name:'Sí, cerrar sesión',exact:true}).click();
  await expect(page).toHaveURL(/login/);
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña',{exact:true}).fill('NuevaPrueba123!');
  await page.getByRole('button',{name:'Ingresar',exact:true}).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.goto('/pacientes');
  await expect(page).toHaveURL(/dashboard/);
});
