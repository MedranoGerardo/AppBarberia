import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

interface UpdateServiceInput {
  barbershopId: string;
  serviceId: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
}

export async function updateService({
  barbershopId,
  serviceId,
  name,
  description,
  price,
  durationMinutes,
}: UpdateServiceInput) {
  const serviceRef = doc(
    db,
    "barbershops",
    barbershopId,
    "services",
    serviceId,
  );

  await updateDoc(serviceRef, {
    name: name.trim(),
    description: description.trim(),
    price,
    durationMinutes,
    updatedAt: serverTimestamp(),
  });
}
