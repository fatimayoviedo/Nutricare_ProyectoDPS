import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile as updateFirebaseProfile,
  type Auth,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase/firebase";
import { isFirebaseConfigured } from "@/lib/firebase/firebase";
import { firestore } from "@/lib/firebase/firestore";
import type { RegisterInput, UserProfile, UserRole } from "@/types";

const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
const ACCOUNTS_KEY = "nutricare_accounts";
const SESSION_KEY = "nutricare_session";
const AUTH_EVENT = "nutricare-auth-change";

interface LocalAccount {
  profile: UserProfile;
  password: string;
}

export const demoAccounts = {
  nutritionist: { email: "nutricionista@nutricare.com", password: "nutricare2026" },
  patient: { email: "paciente@nutricare.com", password: "nutricare2026" },
} as const;

const seededAccounts: LocalAccount[] = [
  { profile: { id: "demo-nutritionist", name: "Licda. Fátima Oviedo", email: demoAccounts.nutritionist.email, role: "nutritionist" }, password: demoAccounts.nutritionist.password },
  { profile: { id: "gerardo-pena", name: "Gerardo Peña", email: demoAccounts.patient.email, role: "patient" }, password: demoAccounts.patient.password },
];

function readLocalAccounts(): LocalAccount[] {
  if (typeof window === "undefined") return seededAccounts;
  const stored = window.localStorage.getItem(ACCOUNTS_KEY);
  if (!stored) {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(seededAccounts));
    return seededAccounts;
  }
  try {
    const accounts = (JSON.parse(stored) as LocalAccount[]).map((account) => {
      const isLegacyPatient = account.profile.email.toLowerCase() === demoAccounts.patient.email && account.profile.name === "Ana Martínez";
      const isDemoNutritionist = account.profile.email.toLowerCase() === demoAccounts.nutritionist.email;
      if (isDemoNutritionist) return seededAccounts[0];
      return isLegacyPatient ? seededAccounts[1] : account;
    });
    const synchronized = [...accounts];
    const storedEmails = new Set(accounts.map((account) => account.profile.email.toLowerCase()));
    const storedIds = new Set(accounts.map((account) => account.profile.id));
    for (const account of seededAccounts) {
      if (!storedEmails.has(account.profile.email.toLowerCase()) && !storedIds.has(account.profile.id)) synchronized.push(account);
    }
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(synchronized));
    return synchronized;
  } catch {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(seededAccounts));
    return seededAccounts;
  }
}

function readLocalSession(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  try {
    const profile = JSON.parse(stored) as UserProfile;
    const account = readLocalAccounts().find((item) => item.profile.id === profile.id || item.profile.email.toLowerCase() === profile.email.toLowerCase());
    if (account) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(account.profile));
      return account.profile;
    }
    return profile;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function saveLocalSession(profile: UserProfile | null) {
  if (typeof window === "undefined") return;
  if (profile) window.localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
  else window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function requireAuth(): Auth {
  if (!auth) {
    throw new Error(
      "Firebase aún no está configurado. Copia .env.example a .env.local y agrega tus credenciales.",
    );
  }
  return auth;
}

async function toProfile(user: User): Promise<UserProfile> {
  if (firestore) {
    const snapshot = await getDoc(doc(firestore, "users", user.uid));
    if (snapshot.exists()) {
      const data = snapshot.data() as { name?: string; role?: UserRole };
      return {
        id: user.uid,
        name: data.name ?? user.displayName ?? "Usuario",
        email: user.email ?? "",
        role: data.role ?? "patient",
        photoUrl: user.photoURL ?? undefined,
      };
    }
  }
  return {
    id: user.uid,
    name: user.displayName ?? "Usuario",
    email: user.email ?? "",
    role: "patient",
    photoUrl: user.photoURL ?? undefined,
  };
}

export const authService = {
  async login(email: string, password: string): Promise<UserProfile> {
    if (!isFirebaseConfigured) {
      const account = readLocalAccounts().find(
        (item) => item.profile.email.toLowerCase() === email.trim().toLowerCase() && item.password === password,
      );
      if (!account) throw new Error("Correo o contraseña incorrectos.");
      saveLocalSession(account.profile);
      return account.profile;
    }
    const credential = await signInWithEmailAndPassword(requireAuth(), email, password);
    return toProfile(credential.user);
  },

  async register(input: RegisterInput): Promise<UserProfile> {
    if (!isFirebaseConfigured) {
      const accounts = readLocalAccounts();
      if (accounts.some((item) => item.profile.email.toLowerCase() === input.email.trim().toLowerCase())) {
        throw new Error("Ya existe una cuenta con este correo.");
      }
      const profile: UserProfile = {
        id: crypto.randomUUID(),
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        role: input.role,
      };
      accounts.push({ profile, password: input.password });
      window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      saveLocalSession(profile);
      return profile;
    }
    const credential = await createUserWithEmailAndPassword(
      requireAuth(),
      input.email,
      input.password,
    );
    const profile: UserProfile = {
      id: credential.user.uid,
      name: input.name,
      email: input.email,
      role: input.role,
    };
    if (firestore) await setDoc(doc(firestore, "users", profile.id), profile);
    return profile;
  },

  async logout(): Promise<void> {
    if (!isFirebaseConfigured) {
      saveLocalSession(null);
      return;
    }
    await signOut(requireAuth());
  },

  async resetPassword(email: string): Promise<void> {
    if (!isFirebaseConfigured) {
      await new Promise((resolve) => window.setTimeout(resolve, 500));
      return;
    }
    await sendPasswordResetEmail(requireAuth(), email);
  },

  async updateProfile(name: string, email: string): Promise<UserProfile> {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanName || !cleanEmail) throw new Error("Completa el nombre y el correo electrónico.");

    if (!isFirebaseConfigured) {
      const current = readLocalSession();
      if (!current) throw new Error("No hay una sesión activa.");
      const accounts = readLocalAccounts();
      if (accounts.some((item) => item.profile.id !== current.id && item.profile.email.toLowerCase() === cleanEmail)) {
        throw new Error("Ya existe una cuenta con este correo.");
      }
      const index = accounts.findIndex((item) => item.profile.id === current.id);
      if (index < 0) throw new Error("No se encontró la cuenta.");
      const profile = { ...accounts[index].profile, name: cleanName, email: cleanEmail };
      accounts[index] = { ...accounts[index], profile };
      window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      saveLocalSession(profile);
      return profile;
    }

    const currentUser = requireAuth().currentUser;
    if (!currentUser) throw new Error("No hay una sesión activa.");
    await updateFirebaseProfile(currentUser, { displayName: cleanName });
    if (currentUser.email !== cleanEmail) await updateEmail(currentUser, cleanEmail);
    const profile = await toProfile(currentUser);
    if (firestore) await setDoc(doc(firestore, "users", profile.id), { name: cleanName, email: cleanEmail }, { merge: true });
    return { ...profile, name: cleanName, email: cleanEmail };
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (newPassword.length < 8) throw new Error("La nueva contraseña debe tener al menos 8 caracteres.");
    if (!isFirebaseConfigured) {
      const current = readLocalSession();
      if (!current) throw new Error("No hay una sesión activa.");
      const accounts = readLocalAccounts();
      const index = accounts.findIndex((item) => item.profile.id === current.id);
      if (index < 0 || accounts[index].password !== currentPassword) throw new Error("La contraseña actual no es correcta.");
      accounts[index] = { ...accounts[index], password: newPassword };
      window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      return;
    }
    const currentUser = requireAuth().currentUser;
    if (!currentUser) throw new Error("No hay una sesión activa.");
    await updatePassword(currentUser, newPassword);
  },

  subscribe(callback: (profile: UserProfile | null) => void): () => void {
    if (!auth) {
      const emit = () => callback(readLocalSession());
      emit();
      window.addEventListener("storage", emit);
      window.addEventListener(AUTH_EVENT, emit);
      return () => {
        window.removeEventListener("storage", emit);
        window.removeEventListener(AUTH_EVENT, emit);
      };
    }
    return onAuthStateChanged(auth, async (user) => {
      callback(user ? await toProfile(user) : null);
    });
  },
};
