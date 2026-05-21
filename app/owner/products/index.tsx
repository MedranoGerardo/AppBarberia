import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { deleteProduct } from "../../../src/services/products/delete-product";
import {
  getProducts,
  ProductItem,
} from "../../../src/services/products/get-products";
import { useAuthStore } from "../../../src/store/auth.store";

export default function OwnerProductsScreen() {
  const { user } = useAuthStore();
  const barbershopId = user?.ownerBarbershopId || "";

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async () => {
    try {
      if (!barbershopId) return;
      const data = await getProducts(barbershopId);
      setProducts(data);
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudieron cargar productos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadProducts();
    }, [barbershopId]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const handleDelete = (productId: string) => {
    Alert.alert("Eliminar producto", "¿Deseas eliminar este producto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sí, eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProduct(barbershopId, productId);
            await loadProducts();
            Alert.alert("Éxito", "Producto eliminado");
          } catch (error: any) {
            Alert.alert("Error", error.message || "No se pudo eliminar");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2F6BFF" />
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <View>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
              <Text style={styles.backText}>← Volver</Text>
            </TouchableOpacity>

            <Text style={styles.badge}>PRODUCTOS</Text>
            <Text style={styles.title}>Inventario</Text>
            <Text style={styles.subtitle}>
              Administra productos, precios, costos y stock disponible.
            </Text>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/owner/products/create" as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.addButtonText}>+ Nuevo producto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.salesButton}
              onPress={() => router.push("/owner/product-sales" as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.salesButtonText}>Ir a ventas</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No hay productos</Text>
            <Text style={styles.emptyText}>
              Crea tu primer producto para comenzar a manejar inventario.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const profit = Number(item.price || 0) - Number(item.cost || 0);
          const lowStock = Number(item.stock || 0) <= 5;

          return (
            <View style={styles.productCard}>
              <View style={styles.topRow}>
                <View style={styles.infoWrap}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productDescription}>
                    {item.description || "Sin descripción"}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusPill,
                    item.status === "active"
                      ? styles.statusActive
                      : styles.statusInactive,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {item.status === "active" ? "Activo" : "Inactivo"}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Precio</Text>
                  <Text style={styles.statValue}>${item.price}</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Costo</Text>
                  <Text style={styles.statValue}>${item.cost}</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Ganancia</Text>
                  <Text style={styles.statValue}>${profit.toFixed(2)}</Text>
                </View>
              </View>

              <View style={[styles.stockBox, lowStock && styles.lowStockBox]}>
                <Text style={styles.stockLabel}>Stock disponible</Text>
                <Text style={styles.stockValue}>{item.stock}</Text>
                {lowStock && (
                  <Text style={styles.lowStockText}>Stock bajo</Text>
                )}
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.stockButton}
                  onPress={() =>
                    router.push(`/owner/products/stock/${item.id}` as any)
                  }
                  activeOpacity={0.85}
                >
                  <Text style={styles.buttonText}>Stock</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    router.push(`/owner/products/edit/${item.id}` as any)
                  }
                  activeOpacity={0.85}
                >
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.deleteButtonFull}
                onPress={() => handleDelete(item.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
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
  container: { padding: 20, paddingBottom: 30 },
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
    fontSize: 15,
    lineHeight: 22,
    color: "#666666",
    marginBottom: 18,
  },
  addButton: {
    backgroundColor: "#2F6BFF",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666666",
  },
  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  infoWrap: { flex: 1 },
  productName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: "#666666",
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusActive: { backgroundColor: "#DCFCE7" },
  statusInactive: { backgroundColor: "#E5E7EB" },
  statusText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111111",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 12,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
    fontWeight: "700",
  },
  statValue: {
    fontSize: 16,
    color: "#111111",
    fontWeight: "900",
  },
  stockBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 18,
    padding: 14,
    marginTop: 12,
  },
  lowStockBox: {
    backgroundColor: "#FEF3C7",
  },
  stockLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "700",
  },
  stockValue: {
    fontSize: 28,
    color: "#111111",
    fontWeight: "900",
    marginTop: 4,
  },
  lowStockText: {
    color: "#92400E",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#111111",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#DC2626",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },
  stockButton: {
    flex: 1,
    backgroundColor: "#2F6BFF",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  deleteButtonFull: {
    backgroundColor: "#DC2626",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  salesButton: {
    backgroundColor: "#111111",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  salesButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
});
