import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

interface UpdateProductInput {
  barbershopId: string;
  productId: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  status: "active" | "inactive";
}

export async function updateProduct({
  barbershopId,
  productId,
  name,
  description,
  price,
  cost,
  stock,
  status,
}: UpdateProductInput) {
  const productRef = doc(
    db,
    "barbershops",
    barbershopId,
    "products",
    productId,
  );

  await updateDoc(productRef, {
    name: name.trim(),
    description: description.trim(),
    price,
    cost,
    stock,
    status,
    updatedAt: serverTimestamp(),
  });
}
