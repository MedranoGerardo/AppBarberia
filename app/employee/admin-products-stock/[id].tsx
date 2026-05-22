import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getProductById } from "../../../src/services/products/get-product-by-id";

import {
  getStockMovements,
  StockMovementItem,
} from "../../../src/services/products/get-stock-movements";

import { updateProductStock } from "../../../src/services/products/update-product-stock";
import { useAuthStore } from "../../../src/store/auth.store";

export default function ProductStockScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const barbershopId = user?.employeeBarbershopId || "";

  const [loading, setLoading] = useState(true);
  const [productName, setProductName] = useState("");
  const [currentStock, setCurrentStock] = useState(0);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [movements, setMovements] = useState<StockMovementItem[]>([]);

  const loadData = async () => {
    try {
      if (!barbershopId || !id) {
        Alert.alert("Error", "No se encontró el producto");
        router.back();
        return;
      }

      const product = await getProductById(barbershopId, id);

      if (!product) {
        Alert.alert("Error", "No se encontró el producto");
        router.back();
        return;
      }

      const movementsData = await getStockMovements(barbershopId, id);

      setProductName(product.name);
      setCurrentStock(Number(product.stock || 0));
      setMovements(movementsData);
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo cargar el producto");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [barbershopId, id]);

  const handleUpdateStock = async (type: "add" | "remove") => {
    try {
      if (!barbershopId || !id) return;

      const amount = Number(quantity);

      if (!quantity.trim() || amount <= 0) {
        Alert.alert("Error", "Ingresa una cantidad válida");
        return;
      }

      const newStock = await updateProductStock({
        barbershopId,
        productId: id,
        currentStock,
        quantity: amount,
        type,
        reason,
      });

      setCurrentStock(newStock);
      setQuantity("");
      setReason("");

      await loadData();

      Alert.alert(
        "Éxito",
        type === "add"
          ? "Stock agregado correctamente"
          : "Stock reducido correctamente",
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo actualizar el stock");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2F6BFF" />
        <Text style={styles.loadingText}>Cargando stock...</Text>
      </SafeAreaView>
    );
  }

  const isOutOfStock = currentStock === 0;
  const isLowStock = currentStock > 0 && currentStock <= 5;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.badge}>STOCK</Text>
        <Text style={styles.title}>Historial inventario</Text>
        <Text style={styles.subtitle}>{productName}</Text>

        <View
          style={[
            styles.stockCard,
            isLowStock && styles.lowStockCard,
            isOutOfStock && styles.outStockCard,
          ]}
        >
          <Text style={styles.stockLabel}>Stock actual</Text>
          <Text style={styles.stockValue}>{currentStock}</Text>
          {isOutOfStock && <Text style={styles.stockWarning}>Agotado</Text>}
          {isLowStock && <Text style={styles.stockWarning}>Stock bajo</Text>}
        </View>

        <Text style={styles.label}>Cantidad</Text>
        <TextInput
          style={styles.input}
          placeholder="Ejemplo: 5"
          placeholderTextColor="#8A8A8A"
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
        />

        <Text style={styles.label}>Motivo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ejemplo: Compra proveedor, producto dañado..."
          placeholderTextColor="#8A8A8A"
          value={reason}
          onChangeText={setReason}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleUpdateStock("add")}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>+ Sumar stock</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleUpdateStock("remove")}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>- Restar stock</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Movimientos recientes</Text>

        {movements.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Sin movimientos</Text>
            <Text style={styles.emptyText}>
              Cuando ajustes el stock, el historial aparecerá aquí.
            </Text>
          </View>
        ) : (
          movements.map((item) => (
            <View key={item.id} style={styles.movementCard}>
              <View style={styles.movementTop}>
                <Text
                  style={[
                    styles.movementType,
                    item.type === "add" ? styles.typeAdd : styles.typeRemove,
                  ]}
                >
                  {item.type === "add" ? "+" : "-"}
                  {item.quantity}
                </Text>

                <Text style={styles.movementStock}>
                  {item.previousStock} → {item.newStock}
                </Text>
              </View>

              <Text style={styles.movementReason}>
                {item.reason || "Ajuste manual"}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F5F7" },
  centerContainer: {
    flex: 1,
    backgroundColor: "#F5F5F7",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: { marginTop: 12, fontSize: 16, color: "#333" },
  container: { padding: 24, paddingBottom: 30 },
  backText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 14,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#111111",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 22,
    fontWeight: "700",
  },
  stockCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    marginBottom: 22,
  },
  lowStockCard: { backgroundColor: "#FEF3C7" },
  outStockCard: { backgroundColor: "#FEE2E2" },
  stockLabel: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "800",
    marginBottom: 8,
  },
  stockValue: {
    fontSize: 56,
    color: "#111111",
    fontWeight: "900",
  },
  stockWarning: {
    fontSize: 15,
    color: "#92400E",
    fontWeight: "900",
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#D9D9D9",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#111111",
    backgroundColor: "#FFFFFF",
    marginBottom: 14,
  },
  addButton: {
    backgroundColor: "#16A34A",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  removeButton: {
    backgroundColor: "#DC2626",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 22,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 14,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666666",
  },
  movementCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
  },
  movementTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  movementType: {
    fontSize: 22,
    fontWeight: "900",
  },
  typeAdd: { color: "#16A34A" },
  typeRemove: { color: "#DC2626" },
  movementStock: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111111",
  },
  movementReason: {
    fontSize: 14,
    color: "#666666",
  },
});
