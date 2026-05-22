import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCAoWVfi-c-m25y5G2Rh5U9iBSjNX5zFZM",
  authDomain: "barberapp-53d28.firebaseapp.com",
  projectId: "barberapp-53d28",
  storageBucket: "barberapp-53d28.firebasestorage.app",
  messagingSenderId: "92679136468",
  appId: "1:92679136468:web:9c60ede203f221e87d4741",
};

const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");

export const secondaryAuth = getAuth(secondaryApp);
