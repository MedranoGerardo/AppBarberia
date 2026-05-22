import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";

export interface EmployeeDashboardData {
  employeeName: string;
  barbershopName: string;
  isAdmin: boolean;
  available: boolean;
  status: string;
  servicesCount: number;
  appointmentsToday: number;
  upcomingAppointments: number;
  startHour: string;
  endHour: string;
  workDays: string[];
}

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getEmployeeDashboardData(
  barbershopId: string,
  employeeId: string,
): Promise<EmployeeDashboardData> {
  const employeeRef = doc(
    db,
    "barbershops",
    barbershopId,
    "employees",
    employeeId,
  );

  const employeeSnap = await getDoc(employeeRef);

  if (!employeeSnap.exists()) {
    throw new Error("No se encontró el empleado");
  }

  const employeeData = employeeSnap.data();

  const barbershopRef = doc(db, "barbershops", barbershopId);
  const barbershopSnap = await getDoc(barbershopRef);

  const barbershopData = barbershopSnap.exists() ? barbershopSnap.data() : {};

  const appointmentsSnap = await getDocs(
    collection(db, "barbershops", barbershopId, "appointments"),
  );

  const today = getTodayString();

  const employeeAppointments = appointmentsSnap.docs
    .map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }))
    .filter((appointment) => appointment.employeeId === employeeId);

  const appointmentsToday = employeeAppointments.filter(
    (appointment) =>
      appointment.date === today &&
      appointment.status !== "cancelled" &&
      appointment.status !== "rejected",
  ).length;

  const upcomingAppointments = employeeAppointments.filter(
    (appointment) =>
      appointment.date >= today &&
      appointment.status !== "cancelled" &&
      appointment.status !== "rejected" &&
      appointment.status !== "completed",
  ).length;

  return {
    employeeName: employeeData.fullName || "Empleado",
    barbershopName: barbershopData.name || "Barbería",
    isAdmin: employeeData.isAdmin || false,
    available: employeeData.available ?? true,
    status: employeeData.status || "active",
    servicesCount: Array.isArray(employeeData.serviceIds)
      ? employeeData.serviceIds.length
      : 0,
    appointmentsToday,
    upcomingAppointments,
    startHour: employeeData.startHour || "",
    endHour: employeeData.endHour || "",
    workDays: employeeData.workDays || [],
  };
}
