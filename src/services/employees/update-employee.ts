import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

interface UpdateEmployeeInput {
  barbershopId: string;
  employeeId: string;
  fullName: string;
  phone: string;
  status: "active" | "inactive";
  available: boolean;
  isAdmin: boolean;
}

export async function updateEmployee({
  barbershopId,
  employeeId,
  fullName,
  phone,
  status,
  available,
  isAdmin,
}: UpdateEmployeeInput) {
  const employeeRef = doc(
    db,
    "barbershops",
    barbershopId,
    "employees",
    employeeId,
  );

  await updateDoc(employeeRef, {
    fullName,
    phone,
    status,
    available,
    isAdmin,
    updatedAt: serverTimestamp(),
  });

  const userRef = doc(db, "users", employeeId);

  await updateDoc(userRef, {
    fullName,
    phone,
    status,
    isAdmin,
    updatedAt: serverTimestamp(),
  });
}
