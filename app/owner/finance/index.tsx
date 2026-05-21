import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    getOwnerAppointments,
    OwnerAppointmentItem,
} from "../../../src/services/appointments/get-owner-appointments";
import {
    getProductSales,
    ProductSaleItem,
} from "../../../src/services/product-sales/get-product-sales";
import { useAuthStore } from "../../../src/store/auth.store";

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timestampToDateString(createdAt: any) {
  if (!createdAt?.seconds) return "";
  const date = new Date(createdAt.seconds * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function OwnerFinanceDashboardScreen() {
  const { user } = useAuthStore();
  const barbershopId = user?.ownerBarbershopId || "";

  const today = getTodayString();

  const [sales, setSales] = useState<ProductSaleItem[]>([]);
  const [appointments, setAppointments] = useState<OwnerAppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      if (!barbershopId) return;

      const [salesData, appointmentsData] = await Promise.all([
        getProductSales(barbershopId),
        getOwnerAppointments(barbershopId),
      ]);

      setSales(salesData);
      setAppointments(appointmentsData);
    } catch (error) {
      console.log("Error cargando finanzas:", error);
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

  const todaySales = useMemo(() => {
    return sales.filter(
      (sale) => timestampToDateString(sale.createdAt) === today,
    );
  }, [sales, today]);

  const todayCompletedAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        appointment.date === today && appointment.status === "completed",
    );
  }, [appointments, today]);

  const productRevenue = todaySales.reduce(
    (sum, sale) => sum + Number(sale.total || 0),
    0,
  );

  const productProfit = todaySales.reduce(
    (sum, sale) => sum + Number(sale.profit || 0),
    0,
  );

  const appointmentRevenue = todayCompletedAppointments.reduce(
    (sum, appointment) => sum + Number(appointment.price || 0),
    0,
  );

  const totalRevenue = productRevenue + appointmentRevenue;
  const totalProfit = productProfit + appointmentRevenue;

  const productsSold = todaySales.reduce(
    (sum, sale) => sum + Number(sale.quantity || 0),
    0,
  );

  const cashTotal = todaySales
    .filter((sale) => sale.paymentMethod === "cash")
    .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

  const cardTotal = todaySales
    .filter((sale) => sale.paymentMethod === "card")
    .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

  const transferTotal = todaySales
    .filter((sale) => sale.paymentMethod === "transfer")
    .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

  const recentSales = sales.slice(0, 5);

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2F6BFF" />
        <Text style={styles.loadingText}>Cargando finanzas...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.badge}>FINANZAS</Text>
        <Text style={styles.title}>Dashboard financiero</Text>
        <Text style={styles.subtitle}>
          Ventas, ganancias, citas completadas y métodos de pago del día.
        </Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Ingresos de hoy</Text>
          <Text style={styles.heroValue}>${totalRevenue.toFixed(2)}</Text>
          <Text style={styles.heroSub}>
            Ganancia estimada: ${totalProfit.toFixed(2)}
          </Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.cardDark}>
            <Text style={styles.cardLabelDark}>Productos</Text>
            <Text style={styles.cardValueDark}>
              ${productRevenue.toFixed(2)}
            </Text>
            <Text style={styles.cardHintDark}>{productsSold} vendidos</Text>
          </View>

          <View style={styles.cardBlue}>
            <Text style={styles.cardLabelBlue}>Citas</Text>
            <Text style={styles.cardValueBlue}>
              ${appointmentRevenue.toFixed(2)}
            </Text>
            <Text style={styles.cardHintBlue}>
              {todayCompletedAppointments.length} completadas
            </Text>
          </View>

          <View style={styles.cardLight}>
            <Text style={styles.cardLabel}>Ganancia productos</Text>
            <Text style={styles.cardValue}>${productProfit.toFixed(2)}</Text>
            <Text style={styles.cardHint}>Después de costo</Text>
          </View>

          <View style={styles.cardLight}>
            <Text style={styles.cardLabel}>Ventas producto</Text>
            <Text style={styles.cardValue}>{todaySales.length}</Text>
            <Text style={styles.cardHint}>Operaciones hoy</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Métodos de pago</Text>

        <View style={styles.paymentCard}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Efectivo</Text>
            <Text style={styles.paymentValue}>${cashTotal.toFixed(2)}</Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Tarjeta</Text>
            <Text style={styles.paymentValue}>${cardTotal.toFixed(2)}</Text>
          </View>

          <View style={styles.paymentRowLast}>
            <Text style={styles.paymentLabel}>Transferencia</Text>
            <Text style={styles.paymentValue}>${transferTotal.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Acciones rápidas</Text>

        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/owner/product-sales" as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.actionTitle}>Nueva venta</Text>
            <Text style={styles.actionText}>Registrar producto vendido</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/owner/products" as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.actionTitle}>Inventario</Text>
            <Text style={styles.actionText}>Revisar stock y productos</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Ventas recientes</Text>

        {recentSales.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Sin ventas recientes</Text>
            <Text style={styles.emptyText}>
              Cuando registres ventas de productos aparecerán aquí.
            </Text>
          </View>
        ) : (
          recentSales.map((sale) => (
            <View key={sale.id} style={styles.saleCard}>
              <View>
                <Text style={styles.saleProduct}>{sale.productName}</Text>
                <Text style={styles.saleDetail}>
                  Cantidad: {sale.quantity} · {sale.paymentMethod}
                </Text>
              </View>

              <View style={styles.saleRight}>
                <Text style={styles.saleTotal}>
                  ${Number(sale.total || 0).toFixed(2)}
                </Text>
                <Text style={styles.saleProfit}>
                  +${Number(sale.profit || 0).toFixed(2)}
                </Text>
              </View>
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
  container: { padding: 20, paddingBottom: 34 },
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
    fontWeight: "800",
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
  heroCard: {
    backgroundColor: "#111827",
    borderRadius: 30,
    padding: 24,
    marginBottom: 18,
  },
  heroLabel: {
    color: "#D1D5DB",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 8,
  },
  heroValue: {
    color: "#FFFFFF",
    fontSize: 44,
    fontWeight: "900",
  },
  heroSub: {
    color: "#86EFAC",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 22,
  },
  cardDark: {
    width: "48%",
    backgroundColor: "#1F2937",
    borderRadius: 24,
    padding: 18,
  },
  cardBlue: {
    width: "48%",
    backgroundColor: "#2F6BFF",
    borderRadius: 24,
    padding: 18,
  },
  cardLight: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
  },
  cardLabelDark: {
    color: "#D1D5DB",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  cardValueDark: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
  },
  cardHintDark: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 6,
  },
  cardLabelBlue: {
    color: "#DDE7FF",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  cardValueBlue: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
  },
  cardHintBlue: {
    color: "#EAF0FF",
    fontSize: 12,
    marginTop: 6,
  },
  cardLabel: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  cardValue: {
    color: "#111111",
    fontSize: 26,
    fontWeight: "900",
  },
  cardHint: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 14,
  },
  paymentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 22,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingVertical: 12,
  },
  paymentRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  paymentLabel: {
    fontSize: 15,
    color: "#555555",
    fontWeight: "800",
  },
  paymentValue: {
    fontSize: 15,
    color: "#111111",
    fontWeight: "900",
  },
  actionsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 6,
  },
  actionText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#666666",
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
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  saleProduct: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 4,
  },
  saleDetail: {
    fontSize: 13,
    color: "#666666",
  },
  saleRight: {
    alignItems: "flex-end",
  },
  saleTotal: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111111",
  },
  saleProfit: {
    fontSize: 13,
    color: "#16A34A",
    fontWeight: "900",
    marginTop: 4,
  },
});
