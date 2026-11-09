export function getErrorMessage(error: unknown): string {
  const messages: Record<string,string> = {
    'permission-denied':'No tienes permiso para esta operación. Verifica tu correo y que el expediente esté vinculado a tu cuenta.',
    'unavailable':'No se pudo conectar con Firestore. Revisa tu conexión e inténtalo nuevamente.',
    'auth/invalid-credential':'Correo o contraseña incorrectos.',
    'auth/email-already-in-use':'Este correo ya tiene cuenta. Inicia sesión o recupera tu contraseña.',
    'auth/invalid-email':'Ingresa un correo electrónico válido.',
    'auth/too-many-requests':'Hubo demasiados intentos. Espera unos minutos antes de volver a intentar.',
    'auth/network-request-failed':'No se pudo conectar con Firebase. Revisa tu conexión.',
    'auth/popup-closed-by-user':'Se cerró la ventana de Google. Puedes intentarlo de nuevo.',
    'auth/popup-blocked':'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes para este sitio.',
    'auth/unauthorized-domain':'Este dominio no está autorizado en Firebase Authentication. Agrega localhost en Dominios autorizados.',
    'auth/requires-recent-login':'Por seguridad, cierra sesión e ingresa nuevamente antes de cambiar este dato.',
  };
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && messages[error.code]) return messages[error.code];
  if (error instanceof Error) return error.message;
  return "Ocurrió un error inesperado. Intenta nuevamente.";
}

