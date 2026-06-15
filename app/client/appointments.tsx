import { router, useFocusEffect } from "expo-router";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
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
import { db } from "../../src/config/firebase";
import { cancelClientAppointment } from "../../src/services/clients/cancel-client-appointment";
import { useAuthStore } from "../../src/store/auth.store";

interface ClientAppointmentItem {
  id: string;
  barbershopId: string;
  customerId: string;
  customerName: string;
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

export default function ClientAppointmentsScreen() {
  const { user } = useAuthStore();

  const [appointments, setAppointments] = useState<ClientAppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleCancelAppointment = (item: ClientAppointmentItem) => {
    Alert.alert("Cancelar cita", "¿Seguro que deseas cancelar esta cita?", [
      { text: "No", style: "cancel" },
      {
        text: "Sí, cancelar",
        style: "destructive",
        onPress: async () => {
          await updateDoc(
            doc(db, "barbershops", item.barbershopId, "appointments", item.id),
            {
              status: "cancelled",
              cancelledBy: "client",
              cancelledAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
          );

          await loadAppointments();
        },
      },
    ]);
  };

  const loadAppointments = async () => {
    try {
      if (!user?.uid) return;

      const allAppointments: ClientAppointmentItem[] = [];

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

        const handleCancelAppointment = (item: ClientAppointmentItem) => {
          Alert.alert(
            "Cancelar cita",
            "¿Seguro que deseas cancelar esta cita?",
            [
              { text: "No", style: "cancel" },
              {
                text: "Sí, cancelar",
                style: "destructive",
                onPress: async () => {
                  try {
                    await cancelClientAppointment(item.barbershopId, item.id);
                    await loadAppointments();

                    Alert.alert(
                      "Cita cancelada",
                      "Tu cita fue cancelada correctamente.",
                    );
                  } catch (error: any) {
                    Alert.alert(
                      "Error",
                      error.message || "No se pudo cancelar la cita",
                    );
                  }
                },
              },
            ],
          );
        };

        appointmentsSnap.docs.forEach((docSnap) => {
          const data = docSnap.data() as Omit<ClientAppointmentItem, "id">;

          if (data.customerId === user.uid) {
            allAppointments.push({
              ...data,
              id: docSnap.id,
              barbershopId: barbershopDoc.id,
            });
          }
        });
      }

      setAppointments(allAppointments);
    } catch (error) {
      console.log("Error cargando citas del cliente:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadAppointments();
    }, [user?.uid]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  const getStatusLabel = (status: ClientAppointmentItem["status"]) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "approved":
        return "Aprobada";
      case "rejected":
        return "Rechazada";
      case "completed":
        return "Completada";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  const getStatusStyle = (status: ClientAppointmentItem["status"]) => {
    switch (status) {
      case "pending":
        return styles.pendingPill;
      case "approved":
        return styles.approvedPill;
      case "completed":
        return styles.completedPill;
      case "rejected":
        return styles.rejectedPill;
      case "cancelled":
        return styles.cancelledPill;
      default:
        return styles.pendingPill;
    }
  };

  const upcomingCount = appointments.filter(
    (item) => item.status === "pending" || item.status === "approved",
  ).length;

  const completedCount = appointments.filter(
    (item) => item.status === "completed",
  ).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2F6BFF" />
        <Text style={styles.loadingText}>Cargando tus citas...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={appointments}
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

            <Text style={styles.badge}>MIS CITAS</Text>
            <Text style={styles.title}>Tus reservas</Text>
            <Text style={styles.subtitle}>
              Consulta el estado de tus citas pendientes, aprobadas y
              completadas.
            </Text>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryDark}>
                <Text style={styles.summaryLabelDark}>Activas</Text>
                <Text style={styles.summaryValueDark}>{upcomingCount}</Text>
              </View>

              <View style={styles.summaryBlue}>
                <Text style={styles.summaryLabelBlue}>Completadas</Text>
                <Text style={styles.summaryValueBlue}>{completedCount}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Listado</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No tienes citas</Text>
            <Text style={styles.emptyText}>
              Cuando reserves una cita, aparecerá aquí.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.appointmentCard}>
            <View style={styles.topRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceName}>{item.serviceName}</Text>
                <Text style={styles.employeeName}>{item.employeeName}</Text>
              </View>

              <View style={[styles.statusPill, getStatusStyle(item.status)]}>
                <Text style={styles.statusText}>
                  {getStatusLabel(item.status)}
                </Text>
              </View>
            </View>

            <Text style={styles.detailText}>
              Fecha: {item.date} · {item.startTime} - {item.endTime}
            </Text>

            <Text style={styles.detailText}>Precio: ${item.price}</Text>

            {item.status === "pending" && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Tu cita está esperando aprobación.
                </Text>
              </View>
            )}

            {item.status === "approved" && (
              <View style={styles.successBox}>
                <Text style={styles.successText}>
                  Tu cita fue aprobada. Te esperamos.
                </Text>
              </View>
            )}

            {item.status === "completed" && (
              <View style={styles.completedBox}>
                <Text style={styles.completedText}>Servicio completado</Text>
              </View>
            )}

            {(item.status === "pending" || item.status === "approved") && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelAppointment(item)}
                activeOpacity={0.85}
              >
                <Text style={styles.cancelButtonText}>Cancelar cita</Text>
              </TouchableOpacity>
            )}
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
  summaryGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  summaryDark: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 18,
  },
  summaryBlue: {
    flex: 1,
    backgroundColor: "#2F6BFF",
    borderRadius: 24,
    padding: 18,
  },
  summaryLabelDark: {
    color: "#D1D5DB",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  summaryValueDark: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
  },
  summaryLabelBlue: {
    color: "#DDE7FF",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  summaryValueBlue: {
    color: "#FFFFFF",
    fontSize: 34,
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
  appointmentCard: {
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
  detailText: {
    marginTop: 8,
    fontSize: 14,
    color: "#444444",
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pendingPill: { backgroundColor: "#FEF3C7" },
  approvedPill: { backgroundColor: "#DCFCE7" },
  completedPill: { backgroundColor: "#DBEAFE" },
  rejectedPill: { backgroundColor: "#FEE2E2" },
  cancelledPill: { backgroundColor: "#E5E7EB" },
  statusText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111111",
  },
  infoBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: 16,
    padding: 13,
    marginTop: 16,
  },
  infoText: {
    color: "#92400E",
    fontSize: 13,
    fontWeight: "800",
  },
  successBox: {
    backgroundColor: "#DCFCE7",
    borderRadius: 16,
    padding: 13,
    marginTop: 16,
  },
  successText: {
    color: "#166534",
    fontSize: 13,
    fontWeight: "800",
  },
  completedBox: {
    backgroundColor: "#DBEAFE",
    borderRadius: 16,
    padding: 13,
    marginTop: 16,
  },
  completedText: {
    color: "#1E3A8A",
    fontSize: 13,
    fontWeight: "800",
  },
  cancelButton: {
    backgroundColor: "#DC2626",
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 14,
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});
