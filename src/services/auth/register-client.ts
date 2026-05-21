import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { ROLES } from "../../constants/roles";

interface RegisterClientInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export async function registerClient({
  fullName,
  email,
  password,
  phone,
}: RegisterClientInput) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = credential.user;

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    fullName,
    email,
    phone: phone || "",
    role: ROLES.CLIENT,
    status: "active",
    preferredLanguage: "es",
    photoUrl: "",
    ownerBarbershopId: null,
    employeeBarbershopId: null,
    isAdmin: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return user;
}
