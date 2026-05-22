import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../config/firebase";

export async function sendPasswordReset(email: string) {
  if (!email.trim()) {
    throw new Error("El correo es obligatorio");
  }

  await sendPasswordResetEmail(auth, email.trim());
}
