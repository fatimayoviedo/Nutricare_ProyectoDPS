import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { demoAccounts } from '@/data/demo';
import type { RegisterPayload, StoredAccount, UserSession } from '@/types/auth';
import { firebaseAuth, firestore, firebaseConfigured } from '@/lib/firebase';

const SESSION_KEY = 'nutricare.mobile.session';
const ACCOUNTS_KEY = 'nutricare.mobile.accounts';
const PROFILE_OVERRIDES_KEY = 'nutricare.mobile.profile-overrides';

interface AuthContextValue {
  user: UserSession | null; isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshVerification: () => Promise<boolean>;
  resendVerification: () => Promise<void>;
  updateProfile: (changes: Pick<UserSession, 'name' | 'birthDate'>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function readRegisteredAccounts(): Promise<StoredAccount[]> {
  const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as StoredAccount[]; } catch { return []; }
}

async function readProfileOverrides(): Promise<Record<string, Pick<UserSession, 'name' | 'birthDate'>>> {
  const raw = await AsyncStorage.getItem(PROFILE_OVERRIDES_KEY);
  if (!raw) return {};
  try { return JSON.parse(raw) as Record<string, Pick<UserSession, 'name' | 'birthDate'>>; } catch { return {}; }
}

function toSession({ password: _password, ...session }: StoredAccount): UserSession { return session; }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (firebaseConfigured && firebaseAuth && firestore) {
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
        if (!firebaseUser) { setUser(null); setIsReady(true); return; }
        try {
          const snapshot = await getDoc(doc(firestore!, 'users', firebaseUser.uid));
          const data = snapshot.exists() ? snapshot.data() : {};
          const session: UserSession = {
            id: firebaseUser.uid,
            name: String(data.name ?? firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'Usuario'),
            email: firebaseUser.email ?? '',
            role: (data.role === 'nutritionist' ? 'nutritionist' : 'patient'),
            emailVerified: firebaseUser.emailVerified,
            birthDate: typeof data.birthDate === 'string' ? data.birthDate : undefined,
          };
          await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
          setUser(session);
        } catch { setUser(null); }
        finally { setIsReady(true); }
      });
      return unsubscribe;
    }
    AsyncStorage.getItem(SESSION_KEY)
      .then((raw) => setUser(raw ? (JSON.parse(raw) as UserSession) : null))
      .catch(() => setUser(null))
      .finally(() => setIsReady(true));
  }, []);

  const persistSession = useCallback(async (session: UserSession) => {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session)); setUser(session);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (firebaseConfigured && firebaseAuth) {
      try { await signInWithEmailAndPassword(firebaseAuth, email.trim(), password); return; }
      catch (error) { throw new Error(firebaseErrorMessage(error)); }
    }
    const [registered, overrides] = await Promise.all([readRegisteredAccounts(), readProfileOverrides()]);
    const normalizedEmail = email.trim().toLowerCase();
    const account = [...demoAccounts, ...registered].find(
      (candidate) => candidate.email.toLowerCase() === normalizedEmail && candidate.password === password,
    );
    if (!account) throw new Error('Correo o contraseña incorrectos. Revisa los datos e intenta de nuevo.');
    await persistSession({ ...toSession(account), ...overrides[account.id] });
  }, [persistSession]);

  const resetPassword = useCallback(async (email: string) => {
    if (firebaseConfigured && firebaseAuth) {
      try { await sendPasswordResetEmail(firebaseAuth, email.trim()); return; }
      catch (error) { throw new Error(firebaseErrorMessage(error)); }
    }
    throw new Error('Configura Firebase para recuperar el acceso.');
  }, []);

  const refreshVerification = useCallback(async () => {
    const current = firebaseAuth?.currentUser;
    if (!current) throw new Error('Inicia sesión para verificar tu correo.');
    await current.reload();
    await current.getIdToken(true);
    setUser((previous) => previous ? { ...previous, emailVerified: current.emailVerified } : previous);
    return current.emailVerified;
  }, []);

  const resendVerification = useCallback(async () => {
    const current = firebaseAuth?.currentUser;
    if (!current) throw new Error('Inicia sesión para verificar tu correo.');
    await sendEmailVerification(current);
  }, []);

  const updateProfile = useCallback(async (changes: Pick<UserSession, 'name' | 'birthDate'>) => {
    if (!user) throw new Error('No hay una sesión activa.');
    if (firebaseConfigured && firebaseAuth && firestore) {
      await updateFirebaseProfile(firebaseAuth.currentUser!, { displayName: changes.name });
      await setDoc(doc(firestore, 'users', user.id), { id: user.id, name: changes.name, email: user.email, role: user.role }, { merge: true });
      const next = { ...user, ...changes }; await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(next)); setUser(next); return;
    }
    const next = { ...user, ...changes };
    const overrides = await readProfileOverrides();
    await Promise.all([
      AsyncStorage.setItem(SESSION_KEY, JSON.stringify(next)),
      AsyncStorage.setItem(PROFILE_OVERRIDES_KEY, JSON.stringify({ ...overrides, [user.id]: changes })),
    ]);
    setUser(next);
  }, [user]);

  const register = useCallback(async (payload: RegisterPayload) => {
    if (firebaseConfigured && firebaseAuth && firestore) {
      try {
        const credential = await createUserWithEmailAndPassword(firebaseAuth, payload.email.trim(), payload.password);
        await updateFirebaseProfile(credential.user, { displayName: payload.name });
        await setDoc(doc(firestore, 'users', credential.user.uid), { id: credential.user.uid, name: payload.name.trim(), email: payload.email.trim().toLowerCase(), role: payload.role });
        await sendEmailVerification(credential.user);
        await persistSession({ id: credential.user.uid, name: payload.name.trim(), email: payload.email.trim().toLowerCase(), role: payload.role, emailVerified: credential.user.emailVerified });
        return;
      } catch (error) { throw new Error(firebaseErrorMessage(error)); }
    }
    const registered = await readRegisteredAccounts();
    const email = payload.email.trim().toLowerCase();
    if ([...demoAccounts, ...registered].some((account) => account.email.toLowerCase() === email)) {
      throw new Error('Ya existe una cuenta con este correo electrónico.');
    }
    const account: StoredAccount = { ...payload, email, id: `account-${Date.now()}` };
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...registered, account]));
    await persistSession(toSession(account));
  }, [persistSession]);

  const logout = useCallback(async () => { if (firebaseConfigured && firebaseAuth) await signOut(firebaseAuth); await AsyncStorage.removeItem(SESSION_KEY); setUser(null); }, []);
  const value = useMemo(() => ({ user, isReady, login, register, resetPassword, refreshVerification, resendVerification, updateProfile, logout }), [isReady, login, logout, register, resetPassword, refreshVerification, resendVerification, updateProfile, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function firebaseErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code: string }).code) : '';
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'Correo o contraseña incorrectos.',
    'auth/email-already-in-use': 'Ya existe una cuenta con este correo electrónico.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/invalid-email': 'El correo electrónico no es válido.',
    'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  };
  return messages[code] ?? 'No fue posible completar la operación con Firebase.';
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider.');
  return context;
}
