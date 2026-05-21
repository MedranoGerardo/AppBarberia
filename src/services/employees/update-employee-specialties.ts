import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

export async function updateEmployeeSpecialties(
  barbershopId: string,
  employeeId: string,
  specialties: string[],
) {
  const employeeRef = doc(
    db,
    "barbershops",
    barbershopId,
    "employees",
    employeeId,
  );

  await updateDoc(employeeRef, {
    specialties,
    updatedAt: serverTimestamp(),
  });
}
