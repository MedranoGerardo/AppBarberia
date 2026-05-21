import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";

interface CreateProductInput {
  barbershopId: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
}

export async function createProduct({
  barbershopId,
  name,
  description,
  price,
  cost,
  stock,
}: CreateProductInput) {
  const productsRef = collection(db, "barbershops", barbershopId, "products");

  const docRef = await addDoc(productsRef, {
    name: name.trim(),
    description: description.trim(),
    price,
    cost,
    stock,
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}
