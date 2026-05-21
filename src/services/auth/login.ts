import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";

export async function login(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}
