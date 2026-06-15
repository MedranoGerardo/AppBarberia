import { router, useFocusEffect } from "expo-router";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../../src/config/firebase";
import { useAuthStore } from "../../src/store/auth.store";

interface ClientHistoryItem {
  id: string;
  customerId: string;
  employeeName: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  paid?: boolean;
  paymentMethod?: "cash" | "card" | "transfer" | "";
  createdAt?: any;
}

export default function ClientHistoryScreen() {
  const { user } = useAuthStore();

  const [history, setHistory] = useState<ClientHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async () => {
    try {
      if (!user?.uid) return;

      const completedAppointments: ClientHistoryItem[] = [];

      const barbershopsSnap = await getDocs(collection(db, "barbershops"));

      for (const barbershopDoc of barbershopsSnap.docs) {
        const appointmentsRef = collection(
          db,
          "barbershops",
          barbershopDoc.id,
          "appointments",
        );

        const appointmentsQuery = query(
          appointmentsRef,
          orderBy("createdAt", "desc"),
        );

        const appointmentsSnap = await getDocs(appointmentsQuery);

        appointmentsSnap.docs.forEach((docSnap) => {
          const data = docSnap.data() as Omit<ClientHistoryItem, "id">;

          if (data.customerId === user.uid && data.status === "completed") {
            completedAppointments.push({
              id: docSnap.id,
              ...data,
            });
          }
        });
      }

      setHistory(completedAppointments);
    } catch (error) {
      console.log("Error cargando historial:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadHistory();
    }, [user?.uid]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const getPaymentLabel = (payment?: ClientHistoryItem["paymentMethod"]) => {
    if (payment === "cash") return "Efectivo";
    if (payment === "card") return "Tarjeta";
    if (payment === "transfer") return "Transferencia";
    return "No registrado";
  };

  const totalSpent = history.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0,
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2F6BFF" />
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={history}
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

            <Text style={styles.badge}>HISTORIAL</Text>
            <Text style={styles.title}>Servicios realizados</Text>
            <Text style={styles.subtitle}>
              Consulta tus citas completadas y pagos registrados.
            </Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total gastado</Text>
              <Text style={styles.summaryValue}>${totalSpent.toFixed(2)}</Text>
              <Text style={styles.summaryText}>
                {history.length} servicios completados
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Historial</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Sin historial</Text>
            <Text style={styles.emptyText}>
              Cuando completes una cita, aparecerá aquí.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.historyCard}>
            <View style={styles.topRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceName}>{item.serviceName}</Text>
                <Text style={styles.employeeName}>{item.employeeName}</Text>
              </View>

              <View style={styles.completedPill}>
                <Text style={styles.completedText}>Completado</Text>
              </View>
            </View>

            <Text style={styles.detailText}>
              Fecha: {item.date} · {item.startTime} - {item.endTime}
            </Text>

            <Text style={styles.detailText}>
              Pago: {getPaymentLabel(item.paymentMethod)}
            </Text>

            <Text style={styles.priceText}>
              ${Number(item.price || 0).toFixed(2)}
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
    fontWeight: "900",
    letterSpacing: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 14,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#666666",
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: "#111827",
    borderRadius: 28,
    padding: 22,
    marginBottom: 22,
  },
  summaryLabel: {
    color: "#D1D5DB",
    fontSize: 14,
    fontWeight: "800",
  },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    marginTop: 6,
  },
  summaryText: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
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
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  serviceName: {
    fontSize: 19,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 4,
  },
  employeeName: {
    fontSize: 14,
    color: "#666666",
  },
  completedPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#DBEAFE",
  },
  completedText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#1E3A8A",
  },
  detailText: {
    marginTop: 8,
    fontSize: 14,
    color: "#444444",
  },
  priceText: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111111",
    marginTop: 12,
  },
});
