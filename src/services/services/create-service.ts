import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";

interface CreateServiceInput {
  barbershopId: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
}

export async function createService({
  barbershopId,
  name,
  description,
  price,
  durationMinutes,
}: CreateServiceInput) {
  const servicesRef = collection(db, "barbershops", barbershopId, "services");

  const docRef = await addDoc(servicesRef, {
    name: name.trim(),
    description: description.trim(),
    price,
    durationMinutes,
    isActive: true,
    employeeIds: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}
