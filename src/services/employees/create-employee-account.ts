import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { secondaryAuth } from "../../config/firebase-secondary";

interface CreateEmployeeAccountInput {
  barbershopId: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  isAdmin: boolean;
  available: boolean;
  status: "active" | "inactive";
  workDays: string[];
  startHour: string;
  endHour: string;
  specialties: string[];
}

export async function createEmployeeAccount({
  barbershopId,
  fullName,
  email,
  phone,
  password,
  isAdmin,
  available,
  status,
  workDays,
  startHour,
  endHour,
  specialties,
}: CreateEmployeeAccountInput) {
  const credential = await createUserWithEmailAndPassword(
    secondaryAuth,
    email.trim(),
    password,
  );

  const uid = credential.user.uid;

  await setDoc(doc(db, "users", uid), {
    uid,
    fullName: fullName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    role: "employee",
    status,
    preferredLanguage: "es",
    photoUrl: "",
    ownerBarbershopId: null,
    employeeBarbershopId: barbershopId,
    employeeId: uid,
    isAdmin,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(doc(db, "barbershops", barbershopId, "employees", uid), {
    uid,
    fullName: fullName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    role: "employee",
    status,
    isAdmin,
    available,
    workDays,
    startHour,
    endHour,
    specialties,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await signOut(secondaryAuth);

  return uid;
}
