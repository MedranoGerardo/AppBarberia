import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
} from "../../src/services/appointments/get-owner-appointments";
import { createCashClosure } from "../../src/services/cash-closures/create-cash-closure";
import {
  CashClosureItem,
  getCashClosures,
} from "../../src/services/cash-closures/get-cash-closures";
import {
  getProductSales,
  ProductSaleItem,
} from "../../src/services/product-sales/get-product-sales";
import { useAuthStore } from "../../src/store/auth.store";

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

function formatPayment(method?: string) {
  if (method === "cash") return "Efectivo";
  if (method === "card") return "Tarjeta";
  if (method === "transfer") return "Transferencia";
  return "Sin método";
}

export default function CashClosureScreen() {
  const { user } = useAuthStore();
  const barbershopId = user?.employeeBarbershopId || "";

  const today = getTodayString();

  const [sales, setSales] = useState<ProductSaleItem[]>([]);
  const [appointments, setAppointments] = useState<OwnerAppointmentItem[]>([]);
  const [closures, setClosures] = useState<CashClosureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      if (!barbershopId) return;

      const [salesData, appointmentsData, closuresData] = await Promise.all([
        getProductSales(barbershopId),
        getOwnerAppointments(barbershopId),
        getCashClosures(barbershopId),
      ]);

      setSales(salesData);
      setAppointments(appointmentsData);
      setClosures(closuresData);
    } catch (error) {
      console.log("Error cargando cierre de caja:", error);
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
        appointment.date === today &&
        appointment.status === "completed" &&
        appointment.paid === true,
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

  const appointmentCash = todayCompletedAppointments
    .filter((appointment) => appointment.paymentMethod === "cash")
    .reduce((sum, appointment) => sum + Number(appointment.price || 0), 0);

  const appointmentCard = todayCompletedAppointments
    .filter((appointment) => appointment.paymentMethod === "card")
    .reduce((sum, appointment) => sum + Number(appointment.price || 0), 0);

  const appointmentTransfer = todayCompletedAppointments
    .filter((appointment) => appointment.paymentMethod === "transfer")
    .reduce((sum, appointment) => sum + Number(appointment.price || 0), 0);

  const productCash = todaySales
    .filter((sale) => sale.paymentMethod === "cash")
    .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

  const productCard = todaySales
    .filter((sale) => sale.paymentMethod === "card")
    .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

  const productTransfer = todaySales
    .filter((sale) => sale.paymentMethod === "transfer")
    .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

  const cashTotal = productCash + appointmentCash;
  const cardTotal = productCard + appointmentCard;
  const transferTotal = productTransfer + appointmentTransfer;

  const totalRevenue = productRevenue + appointmentRevenue;
  const totalProfit = productProfit + appointmentRevenue;

  const alreadyClosedToday = closures.some((closure) => closure.date === today);

  const handleCreateClosure = () => {
    if (alreadyClosedToday) {
      Alert.alert(
        "Caja ya cerrada",
        "Ya existe un cierre registrado para hoy.",
      );
      return;
    }

    Alert.alert(
      "Cerrar caja",
      `¿Deseas cerrar caja por $${totalRevenue.toFixed(2)}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, cerrar",
          onPress: async () => {
            try {
              await createCashClosure({
                barbershopId,
                date: today,
                productRevenue,
                productProfit,
                appointmentRevenue,
                totalRevenue,
                totalProfit,
                cashTotal,
                cardTotal,
                transferTotal,
                productSalesCount: todaySales.length,
                completedAppointmentsCount: todayCompletedAppointments.length,
              });

              await loadData();
              Alert.alert("Éxito", "Cierre de caja guardado correctamente");
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "No se pudo guardar el cierre",
              );
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2F6BFF" />
        <Text style={styles.loadingText}>Cargando cierre de caja...</Text>
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

        <Text style={styles.badge}>CIERRE DE CAJA</Text>
        <Text style={styles.title}>Caja diaria</Text>
        <Text style={styles.subtitle}>
          Revisa ingresos del día y guarda el cierre oficial.
        </Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Total ingresos</Text>
          <Text style={styles.heroValue}>${totalRevenue.toFixed(2)}</Text>
          <Text style={styles.heroSub}>
            Ganancia estimada: ${totalProfit.toFixed(2)}
          </Text>
        </View>

        <View style={styles.paymentCard}>
          <Text style={styles.cardTitle}>Métodos de pago</Text>

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

        <View style={styles.grid}>
          <View style={styles.gridCardDark}>
            <Text style={styles.gridLabelDark}>Productos</Text>
            <Text style={styles.gridValueDark}>
              ${productRevenue.toFixed(2)}
            </Text>
            <Text style={styles.gridHintDark}>{todaySales.length} ventas</Text>
          </View>

          <View style={styles.gridCardBlue}>
            <Text style={styles.gridLabelBlue}>Servicios</Text>
            <Text style={styles.gridValueBlue}>
              ${appointmentRevenue.toFixed(2)}
            </Text>
            <Text style={styles.gridHintBlue}>
              {todayCompletedAppointments.length} citas
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.closeButton,
            alreadyClosedToday && styles.closeButtonDisabled,
          ]}
          onPress={handleCreateClosure}
          activeOpacity={0.85}
        >
          <Text style={styles.closeButtonText}>
            {alreadyClosedToday ? "Caja cerrada hoy" : "Cerrar caja"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Servicios cobrados hoy</Text>

        {todayCompletedAppointments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Sin servicios cobrados</Text>
            <Text style={styles.emptyText}>
              Las citas completadas y pagadas aparecerán aquí.
            </Text>
          </View>
        ) : (
          todayCompletedAppointments.map((appointment) => (
            <View key={appointment.id} style={styles.itemCard}>
              <View>
                <Text style={styles.itemTitle}>{appointment.serviceName}</Text>
                <Text style={styles.itemText}>{appointment.customerName}</Text>
                <Text style={styles.itemText}>
                  Pago: {formatPayment(appointment.paymentMethod)}
                </Text>
              </View>

              <Text style={styles.itemAmount}>
                ${Number(appointment.price || 0).toFixed(2)}
              </Text>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Últimos cierres</Text>

        {closures.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No hay cierres guardados</Text>
            <Text style={styles.emptyText}>
              Cuando cierres caja, el historial aparecerá aquí.
            </Text>
          </View>
        ) : (
          closures.slice(0, 5).map((closure) => (
            <View key={closure.id} style={styles.closureCard}>
              <View>
                <Text style={styles.closureDate}>{closure.date}</Text>
                <Text style={styles.closureText}>
                  Productos: ${Number(closure.productRevenue || 0).toFixed(2)}
                </Text>
                <Text style={styles.closureText}>
                  Servicios: $
                  {Number(closure.appointmentRevenue || 0).toFixed(2)}
                </Text>
              </View>

              <View style={styles.closureRight}>
                <Text style={styles.closureTotal}>
                  ${Number(closure.totalRevenue || 0).toFixed(2)}
                </Text>
                <Text style={styles.closureProfit}>
                  +${Number(closure.totalProfit || 0).toFixed(2)}
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
  paymentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 10,
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
  grid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  gridCardDark: {
    flex: 1,
    backgroundColor: "#1F2937",
    borderRadius: 24,
    padding: 18,
  },
  gridCardBlue: {
    flex: 1,
    backgroundColor: "#2F6BFF",
    borderRadius: 24,
    padding: 18,
  },
  gridLabelDark: {
    color: "#D1D5DB",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  gridValueDark: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },
  gridHintDark: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 6,
  },
  gridLabelBlue: {
    color: "#DDE7FF",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  gridValueBlue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },
  gridHintBlue: {
    color: "#EAF0FF",
    fontSize: 12,
    marginTop: 6,
  },
  closeButton: {
    backgroundColor: "#111111",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 22,
  },
  closeButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  closeButtonText: {
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
    marginBottom: 18,
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
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 4,
  },
  itemText: {
    fontSize: 13,
    color: "#666666",
    marginTop: 2,
  },
  itemAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111111",
  },
  closureCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  closureDate: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 4,
  },
  closureText: {
    fontSize: 13,
    color: "#666666",
    marginTop: 2,
  },
  closureRight: {
    alignItems: "flex-end",
  },
  closureTotal: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111111",
  },
  closureProfit: {
    fontSize: 13,
    color: "#16A34A",
    fontWeight: "900",
    marginTop: 4,
  },
});
