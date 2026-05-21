import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
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

type ReportFilter = "today" | "week" | "month" | "custom";

function getDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timestampToDateString(createdAt: any) {
  if (!createdAt?.seconds) return "";
  return getDateString(new Date(createdAt.seconds * 1000));
}

function getRange(
  filter: ReportFilter,
  customStart: string,
  customEnd: string,
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (filter === "today") {
    const value = getDateString(today);
    return { start: value, end: value };
  }

  if (filter === "week") {
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    return { start: getDateString(start), end: getDateString(today) };
  }

  if (filter === "month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { start: getDateString(start), end: getDateString(today) };
  }

  return {
    start: customStart,
    end: customEnd,
  };
}

function isBetween(date: string, start: string, end: string) {
  if (!date || !start || !end) return false;
  return date >= start && date <= end;
}

export default function OwnerReportsScreen() {
  const { user } = useAuthStore();
  const barbershopId = user?.ownerBarbershopId || "";

  const [filter, setFilter] = useState<ReportFilter>("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

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
      console.log("Error cargando reportes:", error);
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

  const range = useMemo(
    () => getRange(filter, customStart, customEnd),
    [filter, customStart, customEnd],
  );

  const filteredSales = useMemo(() => {
    return sales.filter((sale) =>
      isBetween(timestampToDateString(sale.createdAt), range.start, range.end),
    );
  }, [sales, range]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        isBetween(appointment.date, range.start, range.end) &&
        appointment.status === "completed" &&
        appointment.paid === true,
    );
  }, [appointments, range]);

  const productRevenue = filteredSales.reduce(
    (sum, sale) => sum + Number(sale.total || 0),
    0,
  );

  const productProfit = filteredSales.reduce(
    (sum, sale) => sum + Number(sale.profit || 0),
    0,
  );

  const appointmentRevenue = filteredAppointments.reduce(
    (sum, appointment) => sum + Number(appointment.price || 0),
    0,
  );

  const totalRevenue = productRevenue + appointmentRevenue;
  const totalProfit = productProfit + appointmentRevenue;

  const productsSold = filteredSales.reduce(
    (sum, sale) => sum + Number(sale.quantity || 0),
    0,
  );

  const productCash = filteredSales
    .filter((sale) => sale.paymentMethod === "cash")
    .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

  const productCard = filteredSales
    .filter((sale) => sale.paymentMethod === "card")
    .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

  const productTransfer = filteredSales
    .filter((sale) => sale.paymentMethod === "transfer")
    .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

  const appointmentCash = filteredAppointments
    .filter((appointment) => appointment.paymentMethod === "cash")
    .reduce((sum, appointment) => sum + Number(appointment.price || 0), 0);

  const appointmentCard = filteredAppointments
    .filter((appointment) => appointment.paymentMethod === "card")
    .reduce((sum, appointment) => sum + Number(appointment.price || 0), 0);

  const appointmentTransfer = filteredAppointments
    .filter((appointment) => appointment.paymentMethod === "transfer")
    .reduce((sum, appointment) => sum + Number(appointment.price || 0), 0);

  const cashTotal = productCash + appointmentCash;
  const cardTotal = productCard + appointmentCard;
  const transferTotal = productTransfer + appointmentTransfer;

  const topProducts = useMemo(() => {
    const map = new Map<
      string,
      { name: string; quantity: number; total: number; profit: number }
    >();

    filteredSales.forEach((sale) => {
      const current = map.get(sale.productId) || {
        name: sale.productName,
        quantity: 0,
        total: 0,
        profit: 0,
      };

      current.quantity += Number(sale.quantity || 0);
      current.total += Number(sale.total || 0);
      current.profit += Number(sale.profit || 0);

      map.set(sale.productId, current);
    });

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [filteredSales]);

  const topServices = useMemo(() => {
    const map = new Map<
      string,
      { name: string; count: number; total: number }
    >();

    filteredAppointments.forEach((appointment) => {
      const current = map.get(appointment.serviceId) || {
        name: appointment.serviceName,
        count: 0,
        total: 0,
      };

      current.count += 1;
      current.total += Number(appointment.price || 0);

      map.set(appointment.serviceId, current);
    });

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [filteredAppointments]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2F6BFF" />
        <Text style={styles.loadingText}>Cargando reportes...</Text>
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

        <Text style={styles.badge}>REPORTES</Text>
        <Text style={styles.title}>Reportes PRO</Text>
        <Text style={styles.subtitle}>
          Analiza ingresos, ganancias, productos y servicios por fecha.
        </Text>

        <View style={styles.filtersRow}>
          {(["today", "week", "month", "custom"] as ReportFilter[]).map(
            (item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.filterButton,
                  filter === item && styles.filterButtonActive,
                ]}
                onPress={() => setFilter(item)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === item && styles.filterTextActive,
                  ]}
                >
                  {item === "today"
                    ? "Hoy"
                    : item === "week"
                      ? "Semana"
                      : item === "month"
                        ? "Mes"
                        : "Rango"}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>

        {filter === "custom" && (
          <View style={styles.customBox}>
            <TextInput
              style={styles.input}
              placeholder="Inicio YYYY-MM-DD"
              placeholderTextColor="#8A8A8A"
              value={customStart}
              onChangeText={setCustomStart}
            />

            <TextInput
              style={styles.input}
              placeholder="Fin YYYY-MM-DD"
              placeholderTextColor="#8A8A8A"
              value={customEnd}
              onChangeText={setCustomEnd}
            />
          </View>
        )}

        <Text style={styles.rangeText}>
          Rango: {range.start || "—"} / {range.end || "—"}
        </Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Ingresos totales</Text>
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
            <Text style={styles.cardHintDark}>
              {productsSold} unidades vendidas
            </Text>
          </View>

          <View style={styles.cardBlue}>
            <Text style={styles.cardLabelBlue}>Servicios</Text>
            <Text style={styles.cardValueBlue}>
              ${appointmentRevenue.toFixed(2)}
            </Text>
            <Text style={styles.cardHintBlue}>
              {filteredAppointments.length} citas cobradas
            </Text>
          </View>

          <View style={styles.cardLight}>
            <Text style={styles.cardLabel}>Ganancia productos</Text>
            <Text style={styles.cardValue}>${productProfit.toFixed(2)}</Text>
            <Text style={styles.cardHint}>Después de costo</Text>
          </View>

          <View style={styles.cardLight}>
            <Text style={styles.cardLabel}>Operaciones</Text>
            <Text style={styles.cardValue}>
              {filteredSales.length + filteredAppointments.length}
            </Text>
            <Text style={styles.cardHint}>Ventas + citas</Text>
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

        <Text style={styles.sectionTitle}>Productos más vendidos</Text>

        {topProducts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Sin productos vendidos</Text>
            <Text style={styles.emptyText}>
              No hay ventas de productos en este rango.
            </Text>
          </View>
        ) : (
          topProducts.slice(0, 5).map((item, index) => (
            <View key={`${item.name}-${index}`} style={styles.rankCard}>
              <View>
                <Text style={styles.rankTitle}>
                  #{index + 1} {item.name}
                </Text>
                <Text style={styles.rankText}>
                  {item.quantity} unidades · Ganancia ${item.profit.toFixed(2)}
                </Text>
              </View>

              <Text style={styles.rankAmount}>${item.total.toFixed(2)}</Text>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Servicios más vendidos</Text>

        {topServices.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Sin servicios cobrados</Text>
            <Text style={styles.emptyText}>
              No hay citas completadas y pagadas en este rango.
            </Text>
          </View>
        ) : (
          topServices.slice(0, 5).map((item, index) => (
            <View key={`${item.name}-${index}`} style={styles.rankCard}>
              <View>
                <Text style={styles.rankTitle}>
                  #{index + 1} {item.name}
                </Text>
                <Text style={styles.rankText}>{item.count} citas cobradas</Text>
              </View>

              <Text style={styles.rankAmount}>${item.total.toFixed(2)}</Text>
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
  filtersRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  filterButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#111827",
  },
  filterText: {
    color: "#111111",
    fontSize: 12,
    fontWeight: "900",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  customBox: {
    gap: 10,
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: "#D9D9D9",
    fontSize: 15,
    color: "#111111",
  },
  rangeText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#6B7280",
    marginBottom: 14,
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
    fontSize: 24,
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
    fontSize: 24,
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
    fontSize: 24,
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
  rankCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  rankTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 4,
  },
  rankText: {
    fontSize: 13,
    color: "#666666",
  },
  rankAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111111",
  },
});
