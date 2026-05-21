import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { EmployeeItem } from "./get-employees";

export interface EmployeeDetail extends EmployeeItem {
  specialties?: string[];
  workDays?: string[];
  startHour?: string;
  endHour?: string;
}

export async function getEmployeeById(
  barbershopId: string,
  employeeId: string,
): Promise<EmployeeDetail | null> {
  const employeeRef = doc(
    db,
    "barbershops",
    barbershopId,
    "employees",
    employeeId,
  );

  const snapshot = await getDoc(employeeRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<EmployeeDetail, "id">),
  };
}
