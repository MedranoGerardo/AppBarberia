import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";

interface CreateCashClosureInput {
  barbershopId: string;
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
}

export async function createCashClosure({
  barbershopId,
  date,
  productRevenue,
  productProfit,
  appointmentRevenue,
  totalRevenue,
  totalProfit,
  cashTotal,
  cardTotal,
  transferTotal,
  productSalesCount,
  completedAppointmentsCount,
}: CreateCashClosureInput) {
  const closuresRef = collection(
    db,
    "barbershops",
    barbershopId,
    "cashClosures",
  );

  const docRef = await addDoc(closuresRef, {
    date,
    productRevenue,
    productProfit,
    appointmentRevenue,
    totalRevenue,
    totalProfit,
    cashTotal,
    cardTotal,
    transferTotal,
    productSalesCount,
    completedAppointmentsCount,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}
