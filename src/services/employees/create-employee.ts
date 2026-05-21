import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";

interface CreateEmployeeInput {
  barbershopId: string;
  fullName: string;
  email: string;
  phone: string;
  isAdmin: boolean;
}

export async function createEmployee({
  barbershopId,
  fullName,
  email,
  phone,
  isAdmin,
}: CreateEmployeeInput) {
  const employeesRef = collection(db, "barbershops", barbershopId, "employees");

  const docRef = await addDoc(employeesRef, {
    fullName: fullName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    role: "employee",
    isAdmin,
    available: true,
    status: "active",
    specialties: [],
    workDays: [],
    startHour: "",
    endHour: "",
    photoUrl: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}
