import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

interface UpdateEmployeeInput {
  barbershopId: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  available: boolean;
  status: string;
}

export async function updateEmployee({
  barbershopId,
  employeeId,
  fullName,
  email,
  phone,
  isAdmin,
  available,
  status,
}: UpdateEmployeeInput) {
  const employeeRef = doc(
    db,
    "barbershops",
    barbershopId,
    "employees",
    employeeId,
  );

  await updateDoc(employeeRef, {
    fullName: fullName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    isAdmin,
    available,
    status,
    updatedAt: serverTimestamp(),
  });
}
