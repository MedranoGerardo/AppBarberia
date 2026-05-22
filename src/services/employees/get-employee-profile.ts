import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";

export interface EmployeeProfileData {
  fullName: string;
  email: string;
  phone: string;
  barbershopName: string;
  status: string;
  available: boolean;
  isAdmin: boolean;
  startHour: string;
  endHour: string;
  workDays: string[];
  services: string[];
}

export async function getEmployeeProfile(
  barbershopId: string,
  employeeId: string,
): Promise<EmployeeProfileData> {
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

  const servicesSnap = await getDocs(
    collection(db, "barbershops", barbershopId, "services"),
  );

  const assignedServiceIds: string[] =
    employeeData.specialties ||
    employeeData.serviceIds ||
    employeeData.assignedServices ||
    [];

  const services = servicesSnap.docs
    .map((serviceDoc) => ({
      id: serviceDoc.id,
      ...(serviceDoc.data() as any),
    }))
    .filter((service) => assignedServiceIds.includes(service.id))
    .map((service) => service.name || "Servicio");

  return {
    fullName: employeeData.fullName || "Empleado",
    email: employeeData.email || "",
    phone: employeeData.phone || "",
    barbershopName: barbershopData.name || "Barbería",
    status: employeeData.status || "active",
    available: employeeData.available ?? true,
    isAdmin: employeeData.isAdmin || false,
    startHour: employeeData.startHour || "",
    endHour: employeeData.endHour || "",
    workDays: employeeData.workDays || [],
    services,
  };
}
