import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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
import {
  AppointmentPaymentMethod,
  completeAppointment,
} from "../../src/services/appointments/complete-appointment";
import {
  EmployeeAppointmentItem,
  getEmployeeAppointments,
} from "../../src/services/employees/get-employee-appointments";
import { useAuthStore } from "../../src/store/auth.store";

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function EmployeeAppointmentsScreen() {
  const { user } = useAuthStore();

  const barbershopId = user?.employeeBarbershopId || "";
  const employeeId = user?.employeeId || user?.uid || "";

  const [appointments, setAppointments] = useState<EmployeeAppointmentItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const today = getTodayString();

  const loadAppointments = async () => {
    try {
      if (!barbershopId || !employeeId) return;

      const data = await getEmployeeAppointments(barbershopId, employeeId);
      setAppointments(data);
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudieron cargar las citas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadAppointments();
    }, [barbershopId, employeeId]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  const todayAppointments = useMemo(() => {
    return appointments.filter(
      (item) =>
        item.date === today &&
        item.status !== "cancelled" &&
        item.status !== "rejected",
    );
  }, [appointments, today]);

  const upcomingAppointments = useMemo(() => {
    return appointments.filter(
      (item) =>
        item.date >= today &&
        item.status !== "cancelled" &&
        item.status !== "rejected" &&
        item.status !== "completed",
    );
  }, [appointments, today]);

  const handleCompleteAppointment = (appointmentId: string) => {
    Alert.alert("Completar cita", "Selecciona el método de pago", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Efectivo",
        onPress: () => completeWithPayment(appointmentId, "cash"),
      },
      {
        text: "Tarjeta",
        onPress: () => completeWithPayment(appointmentId, "card"),
      },
      {
        text: "Transferencia",
        onPress: () => completeWithPayment(appointmentId, "transfer"),
      },
    ]);
  };

  const completeWithPayment = async (
    appointmentId: string,
    paymentMethod: AppointmentPaymentMethod,
  ) => {
    try {
      await completeAppointment(barbershopId, appointmentId, paymentMethod);
      await loadAppointments();
      Alert.alert("Éxito", "Cita completada y pago registrado");
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo completar la cita");
    }
  };

  const getStatusLabel = (status: EmployeeAppointmentItem["status"]) => {
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

  const getStatusStyle = (status: EmployeeAppointmentItem["status"]) => {
    switch (status) {
      case "pending":
        return styles.statusPending;
      case "approved":
        return styles.statusApproved;
      case "completed":
        return styles.statusCompleted;
      case "rejected":
        return styles.statusRejected;
      case "cancelled":
        return styles.statusCancelled;
      default:
        return styles.statusPending;
    }
  };

  const getPaymentLabel = (
    paymentMethod?: EmployeeAppointmentItem["paymentMethod"],
  ) => {
    if (paymentMethod === "cash") return "Efectivo";
    if (paymentMethod === "card") return "Tarjeta";
    if (paymentMethod === "transfer") return "Transferencia";
    return "";
  };

  const renderActions = (item: EmployeeAppointmentItem) => {
    if (item.status === "approved") {
      return (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => handleCompleteAppointment(item.id)}
          activeOpacity={0.85}
        >
          <Text style={styles.completeButtonText}>Completar cita</Text>
        </TouchableOpacity>
      );
    }

    if (item.status === "completed") {
      return (
        <View style={styles.completedBox}>
          <Text style={styles.completedText}>
            Cita completada
            {item.paymentMethod
              ? ` · Pago: ${getPaymentLabel(item.paymentMethod)}`
              : ""}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.infoBox}>
        <Text style={styles.infoBoxText}>
          Esta cita aún no puede completarse.
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2F6BFF" />
        <Text style={styles.loadingText}>Cargando mis citas...</Text>
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
            <Text style={styles.title}>Agenda asignada</Text>
            <Text style={styles.subtitle}>
              Revisa tus citas, horarios y servicios asignados.
            </Text>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryDark}>
                <Text style={styles.summaryLabelDark}>Citas hoy</Text>
                <Text style={styles.summaryValueDark}>
                  {todayAppointments.length}
                </Text>
              </View>

              <View style={styles.summaryBlue}>
                <Text style={styles.summaryLabelBlue}>Próximas</Text>
                <Text style={styles.summaryValueBlue}>
                  {upcomingAppointments.length}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Listado de citas</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No tienes citas asignadas</Text>
            <Text style={styles.emptyText}>
              Cuando el dueño te asigne una cita, aparecerá aquí.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.appointmentCard}>
            <View style={styles.topRow}>
              <View style={styles.infoWrap}>
                <Text style={styles.customerName}>{item.customerName}</Text>
                <Text style={styles.serviceName}>{item.serviceName}</Text>
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

            {item.paymentMethod && (
              <Text style={styles.detailText}>
                Pago: {getPaymentLabel(item.paymentMethod)}
              </Text>
            )}

            {renderActions(item)}
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
  infoWrap: { flex: 1 },
  customerName: {
    fontSize: 19,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 4,
  },
  serviceName: {
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
  statusText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111111",
  },
  statusPending: { backgroundColor: "#FEF3C7" },
  statusApproved: { backgroundColor: "#DCFCE7" },
  statusRejected: { backgroundColor: "#FEE2E2" },
  statusCompleted: { backgroundColor: "#DBEAFE" },
  statusCancelled: { backgroundColor: "#E5E7EB" },
  completeButton: {
    backgroundColor: "#16A34A",
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 16,
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  completedBox: {
    backgroundColor: "#DBEAFE",
    borderRadius: 16,
    padding: 13,
    marginTop: 16,
    alignItems: "center",
  },
  completedText: {
    color: "#1E3A8A",
    fontSize: 13,
    fontWeight: "900",
  },
  infoBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 13,
    marginTop: 16,
    alignItems: "center",
  },
  infoBoxText: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "800",
  },
});
