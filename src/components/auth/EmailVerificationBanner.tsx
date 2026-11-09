"use client";

import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase/firebase';
import { authService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/errorHandler';

export function EmailVerificationBanner() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  if (!user || !firebaseApp || getAuth(firebaseApp).currentUser?.emailVerified) return null;
  async function act(refresh: boolean) {
    setBusy(true);
    try {
      if (refresh) { await authService.refreshVerification(); window.location.reload(); }
      else { await authService.sendVerification(); setMessage('Enlace enviado. Revisa también la carpeta de correo no deseado.'); }
    } catch (error) { setMessage(getErrorMessage(error)); }
    finally { setBusy(false); }
  }
  return <aside className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm" aria-label="Verificación de correo">
    <p className="font-bold">Verifica tu correo para consultar los expedientes que te compartan.</p>
    <p className="mt-1">Tu nutricionista debe registrar el mismo correo que usaste en esta cuenta.</p>
    <div className="mt-3 flex flex-wrap gap-4"><button disabled={busy} className="font-bold underline disabled:opacity-50" onClick={() => void act(false)}>Enviar enlace</button><button disabled={busy} className="font-bold underline disabled:opacity-50" onClick={() => void act(true)}>Ya verifiqué mi correo</button></div>
    {message && <p role="status" className="mt-3">{message}</p>}
  </aside>;
}
