import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../config/firebase";

export interface BarberService {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
}

export async function getServices(
  barbershopId: string,
): Promise<BarberService[]> {
  const servicesRef = collection(db, "barbershops", barbershopId, "services");
  const q = query(servicesRef, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<BarberService, "id">),
  }));
}
