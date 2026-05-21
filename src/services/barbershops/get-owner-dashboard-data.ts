import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";

export interface OwnerDashboardData {
  businessName: string;
  description: string;
  businessType: string;
  isOpen: boolean;
  appointmentsToday: number;
  employeesCount: number;
  productsCount: number;
  servicesCount: number;
}

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getOwnerDashboardData(
  barbershopId: string,
): Promise<OwnerDashboardData> {
  const barbershopRef = doc(db, "barbershops", barbershopId);
  const barbershopSnap = await getDoc(barbershopRef);

  if (!barbershopSnap.exists()) {
    throw new Error("No se encontró la barbería");
  }

  const barbershopData = barbershopSnap.data();

  const employeesSnap = await getDocs(
    collection(db, "barbershops", barbershopId, "employees"),
  );

  const productsSnap = await getDocs(
    collection(db, "barbershops", barbershopId, "products"),
  );

  const servicesSnap = await getDocs(
    collection(db, "barbershops", barbershopId, "services"),
  );

  const appointmentsSnap = await getDocs(
    collection(db, "barbershops", barbershopId, "appointments"),
  );

  const today = getTodayString();

  const appointmentsToday = appointmentsSnap.docs.filter((doc) => {
    const data = doc.data();
    return (
      data.date === today &&
      data.status !== "cancelled" &&
      data.status !== "rejected"
    );
  }).length;

  return {
    businessName: barbershopData.name || "",
    description: barbershopData.description || "",
    businessType: barbershopData.businessType || "",
    isOpen: barbershopData.isOpen ?? true,
    appointmentsToday,
    employeesCount: employeesSnap.size,
    productsCount: productsSnap.size,
    servicesCount: servicesSnap.size,
  };
}
