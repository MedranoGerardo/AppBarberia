import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";

export interface CashClosureItem {
  id: string;
  date: string;
  productRevenue: number;
  productProfit: number;
  appointmentRevenue: number;
  totalRevenue: number;
  totalProfit: number;
  cashTotal: number;
  cardTotal: number;
  transferTotal: number;
  productSalesCount: number;
  completedAppointmentsCount: number;
  createdAt?: any;
}

export async function getCashClosures(
  barbershopId: string,
): Promise<CashClosureItem[]> {
  const closuresRef = collection(
    db,
    "barbershops",
    barbershopId,
    "cashClosures",
  );

  const snapshot = await getDocs(closuresRef);

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<CashClosureItem, "id">),
    }))
    .sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
}
