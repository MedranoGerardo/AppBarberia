import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

interface UpdateEmployeeAvailabilityInput {
  barbershopId: string;
  employeeId: string;
  workDays: string[];
  startHour: string;
  endHour: string;
  available: boolean;
}

export async function updateEmployeeAvailability({
  barbershopId,
  employeeId,
  workDays,
  startHour,
  endHour,
  available,
}: UpdateEmployeeAvailabilityInput) {
  const employeeRef = doc(
    db,
    "barbershops",
    barbershopId,
    "employees",
    employeeId,
  );

  await updateDoc(employeeRef, {
    workDays,
    startHour,
    endHour,
    available,
    updatedAt: serverTimestamp(),
  });
}
