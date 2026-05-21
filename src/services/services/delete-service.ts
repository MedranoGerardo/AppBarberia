import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../config/firebase";

export async function deleteService(barbershopId: string, serviceId: string) {
  const serviceRef = doc(
    db,
    "barbershops",
    barbershopId,
    "services",
    serviceId,
  );
  await deleteDoc(serviceRef);
}
