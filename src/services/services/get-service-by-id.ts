import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { BarberService } from "./get-services";

export async function getServiceById(
  barbershopId: string,
  serviceId: string,
): Promise<BarberService | null> {
  const serviceRef = doc(
    db,
    "barbershops",
    barbershopId,
    "services",
    serviceId,
  );
  const snapshot = await getDoc(serviceRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<BarberService, "id">),
  };
}
