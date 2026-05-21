import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";

interface UpdateProductStockInput {
  barbershopId: string;
  productId: string;
  currentStock: number;
  quantity: number;
  type: "add" | "remove";
  reason: string;
}

export async function updateProductStock({
  barbershopId,
  productId,
  currentStock,
  quantity,
  type,
  reason,
}: UpdateProductStockInput) {
  const newStock =
    type === "add" ? currentStock + quantity : currentStock - quantity;

  if (newStock < 0) {
    throw new Error("El stock no puede ser negativo");
  }

  const productRef = doc(
    db,
    "barbershops",
    barbershopId,
    "products",
    productId,
  );

  await updateDoc(productRef, {
    stock: newStock,
    updatedAt: serverTimestamp(),
  });

  const movementsRef = collection(
    db,
    "barbershops",
    barbershopId,
    "products",
    productId,
    "stockMovements",
  );

  await addDoc(movementsRef, {
    type,
    quantity,
    previousStock: currentStock,
    newStock,
    reason: reason.trim() || "Ajuste manual",
    createdAt: serverTimestamp(),
  });

  return newStock;
}
