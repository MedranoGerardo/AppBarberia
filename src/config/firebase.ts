import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCAoWVfi-c-m25y5G2Rh5U9iBSjNX5zFZM",
  authDomain: "barberapp-53d28.firebaseapp.com",
  projectId: "barberapp-53d28",
  storageBucket: "barberapp-53d28.firebasestorage.app",
  messagingSenderId: "92679136468",
  appId: "1:92679136468:web:9c60ede203f221e87d4741",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
