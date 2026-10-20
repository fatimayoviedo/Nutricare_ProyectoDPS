import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { demoAccounts } from '@/data/demo';
import type { RegisterPayload, StoredAccount, UserSession } from '@/types/auth';

const SESSION_KEY = 'nutricare.mobile.session';
const ACCOUNTS_KEY = 'nutricare.mobile.accounts';
const PROFILE_OVERRIDES_KEY = 'nutricare.mobile.profile-overrides';

interface AuthContextValue {
  user: UserSession | null; isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
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
    AsyncStorage.getItem(SESSION_KEY)
      .then((raw) => setUser(raw ? (JSON.parse(raw) as UserSession) : null))
      .catch(() => setUser(null))
      .finally(() => setIsReady(true));
  }, []);

  const persistSession = useCallback(async (session: UserSession) => {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session)); setUser(session);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const [registered, overrides] = await Promise.all([readRegisteredAccounts(), readProfileOverrides()]);
    const normalizedEmail = email.trim().toLowerCase();
    const account = [...demoAccounts, ...registered].find(
      (candidate) => candidate.email.toLowerCase() === normalizedEmail && candidate.password === password,
    );
    if (!account) throw new Error('Correo o contraseña incorrectos. Revisa los datos e intenta de nuevo.');
    await persistSession({ ...toSession(account), ...overrides[account.id] });
  }, [persistSession]);

  const updateProfile = useCallback(async (changes: Pick<UserSession, 'name' | 'birthDate'>) => {
    if (!user) throw new Error('No hay una sesión activa.');
    const next = { ...user, ...changes };
    const overrides = await readProfileOverrides();
    await Promise.all([
      AsyncStorage.setItem(SESSION_KEY, JSON.stringify(next)),
      AsyncStorage.setItem(PROFILE_OVERRIDES_KEY, JSON.stringify({ ...overrides, [user.id]: changes })),
    ]);
    setUser(next);
  }, [user]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const registered = await readRegisteredAccounts();
    const email = payload.email.trim().toLowerCase();
    if ([...demoAccounts, ...registered].some((account) => account.email.toLowerCase() === email)) {
      throw new Error('Ya existe una cuenta con este correo electrónico.');
    }
    const account: StoredAccount = { ...payload, email, id: `account-${Date.now()}` };
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...registered, account]));
    await persistSession(toSession(account));
  }, [persistSession]);

  const logout = useCallback(async () => { await AsyncStorage.removeItem(SESSION_KEY); setUser(null); }, []);
  const value = useMemo(() => ({ user, isReady, login, register, updateProfile, logout }), [isReady, login, logout, register, updateProfile, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider.');
  return context;
}
