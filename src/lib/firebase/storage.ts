import { getStorage, type FirebaseStorage } from "firebase/storage";
import { firebaseApp } from "./firebase";

export const firebaseStorage: FirebaseStorage | null = firebaseApp
  ? getStorage(firebaseApp)
  : null;

