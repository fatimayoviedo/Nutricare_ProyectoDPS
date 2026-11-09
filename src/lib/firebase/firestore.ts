import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore";
import { firebaseApp, useFirebaseEmulators } from "./firebase";

export const firestore: Firestore | null = firebaseApp
  ? getFirestore(firebaseApp)
  : null;

const runtime = globalThis as typeof globalThis & { nutricareEmulatorFirestore?: Firestore };
if (firestore && useFirebaseEmulators && runtime.nutricareEmulatorFirestore !== firestore) {
  connectFirestoreEmulator(firestore, '127.0.0.1', 8180);
  runtime.nutricareEmulatorFirestore = firestore;
}

