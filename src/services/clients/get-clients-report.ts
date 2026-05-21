import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";

export interface ClientReportItem {
  id: string;
  fullName: string;
  email?: string;

  appointmentsCount: number;
  purchasesCount: number;

  totalSpent: number;

  lastVisit?: string;

  isFrequent: boolean;
}

export async function getClientsReport(
  barbershopId: string,
): Promise<ClientReportItem[]> {
  const usersSnapshot = await getDocs(collection(db, "users"));

  const appointmentsSnapshot = await getDocs(
    collection(db, "barbershops", barbershopId, "appointments"),
  );

  const salesSnapshot = await getDocs(
    collection(db, "barbershops", barbershopId, "productSales"),
  );

  const users = usersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as any),
  }));

  const appointments = appointmentsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as any),
  }));

  const sales = salesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as any),
  }));

  const clients = users.filter((user) => user.role === "client");

  return clients.map((client) => {
    const clientAppointments = appointments.filter(
      (appointment) => appointment.customerId === client.id,
    );

    const completedAppointments = clientAppointments.filter(
      (appointment) => appointment.status === "completed",
    );

    const clientSales = sales.filter((sale) => sale.customerId === client.id);

    const appointmentsSpent = completedAppointments.reduce(
      (sum, item) => sum + Number(item.price || 0),
      0,
    );

    const productsSpent = clientSales.reduce(
      (sum, item) => sum + Number(item.total || 0),
      0,
    );

    const totalSpent = appointmentsSpent + productsSpent;

    const sortedAppointments = [...completedAppointments].sort((a, b) => {
      return (b.date || "").localeCompare(a.date || "");
    });

    return {
      id: client.id,
      fullName: client.fullName || "Cliente",
      email: client.email || "",

      appointmentsCount: completedAppointments.length,
      purchasesCount: clientSales.length,

      totalSpent,

      lastVisit: sortedAppointments[0]?.date || "",

      isFrequent: completedAppointments.length >= 5,
    };
  });
}
