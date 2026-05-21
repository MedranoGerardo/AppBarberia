import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { createProductSale } from "../../../src/services/product-sales/create-product-sale";
import {
    getProductSales,
    ProductSaleItem,
} from "../../../src/services/product-sales/get-product-sales";
import {
    getProducts,
    ProductItem,
} from "../../../src/services/products/get-products";
import { useAuthStore } from "../../../src/store/auth.store";

export default function OwnerProductSalesScreen() {
  const { user } = useAuthStore();
  const barbershopId = user?.ownerBarbershopId || "";

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [sales, setSales] = useState<ProductSaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "transfer"
  >("cash");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      if (!barbershopId) return;

      const [productsData, salesData] = await Promise.all([
        getProducts(barbershopId),
        getProductSales(barbershopId),
      ]);

      setProducts(productsData);
      setSales(salesData);
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudieron cargar ventas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [barbershopId]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const activeProducts = products.filter(
    (product) => product.status === "active" && Number(product.stock || 0) > 0,
  );

  const selectedProduct =
    products.find((product) => product.id === selectedProductId) || null;

  const numericQuantity = Number(quantity || 0);

  const total = useMemo(() => {
    if (!selectedProduct || numericQuantity <= 0) return 0;
    return Number(selectedProduct.price || 0) * numericQuantity;
  }, [selectedProduct, numericQuantity]);

  const profit = useMemo(() => {
    if (!selectedProduct || numericQuantity <= 0) return 0;
    return (
      (Number(selectedProduct.price || 0) - Number(selectedProduct.cost || 0)) *
      numericQuantity
    );
  }, [selectedProduct, numericQuantity]);

  const todayTotal = sales.reduce(
    (sum, sale) => sum + Number(sale.total || 0),
    0,
  );
  const todayProfit = sales.reduce(
    (sum, sale) => sum + Number(sale.profit || 0),
    0,
  );

  const handleCreateSale = async () => {
    try {
      if (!barbershopId) {
        Alert.alert("Error", "No se encontró la barbería");
        return;
      }

      if (!selectedProduct) {
        Alert.alert("Error", "Selecciona un producto");
        return;
      }

      if (!quantity.trim() || numericQuantity <= 0) {
        Alert.alert("Error", "Ingresa una cantidad válida");
        return;
      }

      if (numericQuantity > Number(selectedProduct.stock || 0)) {
        Alert.alert("Error", "No hay suficiente stock");
        return;
      }

      await createProductSale({
        barbershopId,
        productId: selectedProduct.id,
        quantity: numericQuantity,
        paymentMethod,
      });

      setSelectedProductId("");
      setQuantity("");
      setPaymentMethod("cash");

      await loadData();

      Alert.alert("Éxito", "Venta registrada correctamente");
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo registrar la venta");
    }
  };

  const getPaymentLabel = (method: ProductSaleItem["paymentMethod"]) => {
    switch (method) {
      case "cash":
        return "Efectivo";
      case "card":
        return "Tarjeta";
      case "transfer":
        return "Transferencia";
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2F6BFF" />
        <Text style={styles.loadingText}>Cargando ventas...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={sales}
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

            <Text style={styles.badge}>VENTAS</Text>
            <Text style={styles.title}>Ventas de productos</Text>
            <Text style={styles.subtitle}>
              Registra ventas, descuenta inventario y calcula ganancias.
            </Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryLabel}>Total vendido</Text>
                <Text style={styles.summaryValue}>
                  ${todayTotal.toFixed(2)}
                </Text>
              </View>

              <View style={styles.summaryBoxBlue}>
                <Text style={styles.summaryLabelBlue}>Ganancia</Text>
                <Text style={styles.summaryValueBlue}>
                  ${todayProfit.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Nueva venta</Text>

              <Text style={styles.label}>Producto</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productsRow}
              >
                {activeProducts.length === 0 ? (
                  <Text style={styles.emptyInlineText}>
                    No hay productos activos con stock.
                  </Text>
                ) : (
                  activeProducts.map((product) => {
                    const selected = selectedProductId === product.id;

                    return (
                      <TouchableOpacity
                        key={product.id}
                        style={[
                          styles.productChip,
                          selected && styles.productChipActive,
                        ]}
                        onPress={() => setSelectedProductId(product.id)}
                        activeOpacity={0.85}
                      >
                        <Text
                          style={[
                            styles.productChipText,
                            selected && styles.productChipTextActive,
                          ]}
                        >
                          {product.name}
                        </Text>
                        <Text
                          style={[
                            styles.productChipSubText,
                            selected && styles.productChipTextActive,
                          ]}
                        >
                          Stock: {product.stock}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>

              <Text style={styles.label}>Cantidad</Text>
              <TextInput
                style={styles.input}
                placeholder="Ejemplo: 2"
                placeholderTextColor="#8A8A8A"
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
              />

              <Text style={styles.label}>Método de pago</Text>

              <View style={styles.paymentRow}>
                <TouchableOpacity
                  style={[
                    styles.paymentButton,
                    paymentMethod === "cash" && styles.paymentButtonActive,
                  ]}
                  onPress={() => setPaymentMethod("cash")}
                >
                  <Text
                    style={[
                      styles.paymentText,
                      paymentMethod === "cash" && styles.paymentTextActive,
                    ]}
                  >
                    Efectivo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentButton,
                    paymentMethod === "card" && styles.paymentButtonActive,
                  ]}
                  onPress={() => setPaymentMethod("card")}
                >
                  <Text
                    style={[
                      styles.paymentText,
                      paymentMethod === "card" && styles.paymentTextActive,
                    ]}
                  >
                    Tarjeta
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentButton,
                    paymentMethod === "transfer" && styles.paymentButtonActive,
                  ]}
                  onPress={() => setPaymentMethod("transfer")}
                >
                  <Text
                    style={[
                      styles.paymentText,
                      paymentMethod === "transfer" && styles.paymentTextActive,
                    ]}
                  >
                    Transferencia
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.totalCard}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                <Text style={styles.totalProfit}>
                  Ganancia estimada: ${profit.toFixed(2)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleCreateSale}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Registrar venta</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Historial de ventas</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Sin ventas registradas</Text>
            <Text style={styles.emptyText}>
              Cuando registres ventas, aparecerán aquí.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.saleCard}>
            <View style={styles.saleTop}>
              <View>
                <Text style={styles.saleProduct}>{item.productName}</Text>
                <Text style={styles.saleDetail}>
                  Cantidad: {item.quantity} ·{" "}
                  {getPaymentLabel(item.paymentMethod)}
                </Text>
              </View>

              <View style={styles.saleAmountBox}>
                <Text style={styles.saleTotal}>
                  ${Number(item.total).toFixed(2)}
                </Text>
                <Text style={styles.saleProfit}>
                  +${Number(item.profit).toFixed(2)}
                </Text>
              </View>
            </View>

            <Text style={styles.saleDetail}>
              Precio unitario: ${item.unitPrice} · Costo: ${item.unitCost}
            </Text>
          </View>
        )}
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
  summaryCard: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 16,
  },
  summaryBoxBlue: {
    flex: 1,
    backgroundColor: "#2F6BFF",
    borderRadius: 22,
    padding: 16,
  },
  summaryLabel: {
    color: "#D1D5DB",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
  },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },
  summaryLabelBlue: {
    color: "#DDE7FF",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
  },
  summaryValueBlue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 22,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 8,
    marginTop: 10,
  },
  productsRow: {
    gap: 10,
    paddingBottom: 8,
  },
  productChip: {
    backgroundColor: "#F3F4F6",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    minWidth: 130,
  },
  productChipActive: {
    backgroundColor: "#2F6BFF",
    borderColor: "#2F6BFF",
  },
  productChipText: {
    color: "#111111",
    fontWeight: "900",
    fontSize: 14,
  },
  productChipSubText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  productChipTextActive: {
    color: "#FFFFFF",
  },
  emptyInlineText: {
    color: "#6B7280",
    fontStyle: "italic",
    paddingVertical: 10,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#D9D9D9",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#111111",
    backgroundColor: "#F9FAFB",
  },
  paymentRow: {
    flexDirection: "row",
    gap: 8,
  },
  paymentButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  paymentButtonActive: {
    backgroundColor: "#111827",
  },
  paymentText: {
    color: "#111111",
    fontSize: 12,
    fontWeight: "800",
  },
  paymentTextActive: {
    color: "#FFFFFF",
  },
  totalCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    padding: 16,
    marginTop: 18,
  },
  totalLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "800",
  },
  totalValue: {
    fontSize: 34,
    color: "#111111",
    fontWeight: "900",
    marginTop: 4,
  },
  totalProfit: {
    color: "#16A34A",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: "#111111",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 18,
  },
  primaryButtonText: {
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
    color: "#666666",
    lineHeight: 20,
  },
  saleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
  },
  saleTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  saleProduct: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 4,
  },
  saleDetail: {
    fontSize: 14,
    color: "#666666",
  },
  saleAmountBox: {
    alignItems: "flex-end",
  },
  saleTotal: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111111",
  },
  saleProfit: {
    fontSize: 14,
    fontWeight: "900",
    color: "#16A34A",
    marginTop: 4,
  },
});
