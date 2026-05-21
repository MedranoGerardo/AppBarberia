import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../config/firebase";

export async function deleteEmployee(barbershopId: string, employeeId: string) {
  const employeeRef = doc(
    db,
    "barbershops",
    barbershopId,
    "employees",
    employeeId,
  );
  await deleteDoc(employeeRef);
}
