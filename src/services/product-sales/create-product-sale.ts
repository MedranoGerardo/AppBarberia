import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";

interface CreateProductSaleInput {
  barbershopId: string;
  productId: string;
  quantity: number;
  paymentMethod: "cash" | "card" | "transfer";
  customerId?: string;
  customerName?: string;
}

export async function createProductSale({
  barbershopId,
  productId,
  quantity,
  paymentMethod,
  customerId,
  customerName,
}: CreateProductSaleInput) {
  const productRef = doc(
    db,
    "barbershops",
    barbershopId,
    "products",
    productId,
  );
  const productSnap = await getDoc(productRef);

  if (!productSnap.exists()) {
    throw new Error("Producto no encontrado");
  }

  const product = productSnap.data();

  const currentStock = Number(product.stock || 0);
  const price = Number(product.price || 0);
  const cost = Number(product.cost || 0);

  if (quantity <= 0) {
    throw new Error("La cantidad debe ser mayor a 0");
  }

  if (currentStock < quantity) {
    throw new Error("Stock insuficiente");
  }

  const newStock = currentStock - quantity;
  const total = price * quantity;
  const profit = (price - cost) * quantity;

  await updateDoc(productRef, {
    stock: newStock,
    updatedAt: serverTimestamp(),
  });

  const salesRef = collection(db, "barbershops", barbershopId, "productSales");

  const saleRef = await addDoc(salesRef, {
    productId,
    productName: product.name,
    customerId: customerId || "",
    customerName: customerName || "Cliente no registrado",
    quantity,
    unitPrice: price,
    unitCost: cost,
    total,
    profit,
    paymentMethod,
    createdAt: serverTimestamp(),
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
    type: "remove",
    quantity,
    previousStock: currentStock,
    newStock,
    reason: "Venta de producto",
    saleId: saleRef.id,
    createdAt: serverTimestamp(),
  });

  return saleRef.id;
}
