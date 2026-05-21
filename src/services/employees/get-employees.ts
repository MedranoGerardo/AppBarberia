import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../config/firebase";

export interface EmployeeItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isAdmin: boolean;
  available: boolean;
  status: string;
  specialties?: string[];
  workDays?: string[];
  startHour?: string;
  endHour?: string;
}

export async function getEmployees(
  barbershopId: string,
): Promise<EmployeeItem[]> {
  const employeesRef = collection(db, "barbershops", barbershopId, "employees");
  const q = query(employeesRef, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<EmployeeItem, "id">),
  }));
}
