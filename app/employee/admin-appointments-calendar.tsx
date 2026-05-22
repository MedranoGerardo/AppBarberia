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
} from "../../src/services/appointments/get-owner-appointments";
import {
    EmployeeItem,
    getEmployees,
} from "../../src/services/employees/get-employees";
import { useAuthStore } from "../../src/store/auth.store";

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(baseDate: string, days: number) {
  const date = new Date(`${baseDate}T00:00:00`);
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDayLabel(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  return days[date.getDay()];
}

function getDayNumber(dateString: string) {
  return dateString.split("-")[2];
}

function getStatusLabel(status: OwnerAppointmentItem["status"]) {
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
}

export default function OwnerAppointmentsCalendarScreen() {
  const { user } = useAuthStore();
  const barbershopId = user?.employeeBarbershopId || "";

  const today = getTodayString();

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("all");

  const [appointments, setAppointments] = useState<OwnerAppointmentItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const dates = useMemo(() => {
    return Array.from({ length: 14 }).map((_, index) => addDays(today, index));
  }, [today]);

  const loadData = async () => {
    try {
      if (!barbershopId) return;

      const [appointmentsData, employeesData] = await Promise.all([
        getOwnerAppointments(barbershopId),
        getEmployees(barbershopId),
      ]);

      setAppointments(appointmentsData);
      setEmployees(employeesData);
    } catch (error) {
      console.log("Error cargando calendario:", error);
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

  const dayAppointments = useMemo(() => {
    return appointments
      .filter((item) => item.date === selectedDate)
      .filter((item) =>
        selectedEmployeeId === "all"
          ? true
          : item.employeeId === selectedEmployeeId,
      )
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments, selectedDate, selectedEmployeeId]);

  const groupedByHour = useMemo(() => {
    const groups: Record<string, OwnerAppointmentItem[]> = {};

    dayAppointments.forEach((item) => {
      const hour = item.startTime.split(":")[0] + ":00";

      if (!groups[hour]) {
        groups[hour] = [];
      }

      groups[hour].push(item);
    });

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [dayAppointments]);

  const pendingCount = dayAppointments.filter(
    (item) => item.status === "pending",
  ).length;

  const approvedCount = dayAppointments.filter(
    (item) => item.status === "approved",
  ).length;

  const completedCount = dayAppointments.filter(
    (item) => item.status === "completed",
  ).length;

  const cancelledCount = dayAppointments.filter(
    (item) => item.status === "cancelled" || item.status === "rejected",
  ).length;

  const totalIncome = dayAppointments
    .filter((item) => item.status === "completed")
    .reduce((sum, item) => sum + Number(item.price || 0), 0);

  const getStatusStyle = (status: OwnerAppointmentItem["status"]) => {
    switch (status) {
      case "pending":
        return styles.statusPending;
      case "approved":
        return styles.statusApproved;
      case "rejected":
        return styles.statusRejected;
      case "completed":
        return styles.statusCompleted;
      case "cancelled":
        return styles.statusCancelled;
      default:
        return styles.statusPending;
    }
  };

  const getTimelineBarStyle = (status: OwnerAppointmentItem["status"]) => {
    switch (status) {
      case "pending":
        return styles.timelinePending;
      case "approved":
        return styles.timelineApproved;
      case "rejected":
        return styles.timelineRejected;
      case "completed":
        return styles.timelineCompleted;
      case "cancelled":
        return styles.timelineCancelled;
      default:
        return styles.timelinePending;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2F6BFF" />
        <Text style={styles.loadingText}>Cargando calendario...</Text>
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

        <Text style={styles.badge}>CALENDARIO PRO</Text>
        <Text style={styles.title}>Agenda visual</Text>
        <Text style={styles.subtitle}>
          Revisa tus citas por día, empleado y estado.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysRow}
        >
          {dates.map((date) => {
            const selected = selectedDate === date;

            return (
              <TouchableOpacity
                key={date}
                style={[styles.dayCard, selected && styles.dayCardActive]}
                onPress={() => setSelectedDate(date)}
                activeOpacity={0.85}
              >
                <Text
                  style={[styles.dayLabel, selected && styles.dayLabelActive]}
                >
                  {getDayLabel(date)}
                </Text>
                <Text
                  style={[styles.dayNumber, selected && styles.dayNumberActive]}
                >
                  {getDayNumber(date)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.filterTitle}>Filtrar por empleado</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedEmployeeId === "all" && styles.filterChipActive,
            ]}
            onPress={() => setSelectedEmployeeId("all")}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedEmployeeId === "all" && styles.filterChipTextActive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          {employees.map((employee) => {
            const selected = selectedEmployeeId === employee.id;

            return (
              <TouchableOpacity
                key={employee.id}
                style={[styles.filterChip, selected && styles.filterChipActive]}
                onPress={() => setSelectedEmployeeId(employee.id)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selected && styles.filterChipTextActive,
                  ]}
                >
                  {employee.fullName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen</Text>
          <Text style={styles.summaryDate}>{selectedDate}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{dayAppointments.length}</Text>
              <Text style={styles.statLabel}>Citas</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>{pendingCount}</Text>
              <Text style={styles.statLabel}>Pendientes</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>{approvedCount}</Text>
              <Text style={styles.statLabel}>Aprobadas</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completadas</Text>
            </View>
          </View>

          <View style={styles.extraStatsRow}>
            <View style={styles.extraStatBox}>
              <Text style={styles.extraStatLabel}>Canceladas/Rechazadas</Text>
              <Text style={styles.extraStatValue}>{cancelledCount}</Text>
            </View>

            <View style={styles.extraStatBoxBlue}>
              <Text style={styles.extraStatLabelBlue}>Ingreso real</Text>
              <Text style={styles.extraStatValueBlue}>
                ${totalIncome.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Agenda por hora</Text>

        {dayAppointments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Sin citas</Text>
            <Text style={styles.emptyText}>
              No hay reservas para esta fecha o empleado seleccionado.
            </Text>
          </View>
        ) : (
          groupedByHour.map(([hour, items]) => (
            <View key={hour} style={styles.hourBlock}>
              <Text style={styles.hourText}>{hour}</Text>

              <View style={styles.hourAppointments}>
                {items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.timelineCard}
                    activeOpacity={0.85}
                    onPress={() =>
                      router.push(`/owner/appointments/${item.id}` as any)
                    }
                  >
                    <View
                      style={[
                        styles.timelineBar,
                        getTimelineBarStyle(item.status),
                      ]}
                    />

                    <View style={styles.timelineContent}>
                      <View style={styles.appointmentHeader}>
                        <View>
                          <Text style={styles.appointmentTime}>
                            {item.startTime} - {item.endTime}
                          </Text>
                          <Text style={styles.customerName}>
                            {item.customerName}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.statusPill,
                            getStatusStyle(item.status),
                          ]}
                        >
                          <Text style={styles.statusText}>
                            {getStatusLabel(item.status)}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.detailText}>
                        Servicio: {item.serviceName}
                      </Text>
                      <Text style={styles.detailText}>
                        Empleado: {item.employeeName}
                      </Text>
                      <Text style={styles.priceText}>${item.price}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}

        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Leyenda</Text>

          <View style={styles.legendRow}>
            <View style={[styles.legendDot, styles.timelinePending]} />
            <Text style={styles.legendText}>Pendiente</Text>
          </View>

          <View style={styles.legendRow}>
            <View style={[styles.legendDot, styles.timelineApproved]} />
            <Text style={styles.legendText}>Aprobada</Text>
          </View>

          <View style={styles.legendRow}>
            <View style={[styles.legendDot, styles.timelineCompleted]} />
            <Text style={styles.legendText}>Completada</Text>
          </View>

          <View style={styles.legendRow}>
            <View style={[styles.legendDot, styles.timelineRejected]} />
            <Text style={styles.legendText}>Rechazada</Text>
          </View>

          <View style={styles.legendRow}>
            <View style={[styles.legendDot, styles.timelineCancelled]} />
            <Text style={styles.legendText}>Cancelada</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#F5F5F7",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#333",
  },
  container: {
    padding: 20,
    paddingBottom: 30,
  },
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
    fontWeight: "800",
    color: "#111111",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#666666",
    marginBottom: 18,
  },
  daysRow: {
    gap: 10,
    paddingBottom: 16,
  },
  dayCard: {
    width: 70,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  dayCardActive: {
    backgroundColor: "#2F6BFF",
    borderColor: "#2F6BFF",
  },
  dayLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "700",
    marginBottom: 6,
  },
  dayLabelActive: {
    color: "#FFFFFF",
  },
  dayNumber: {
    fontSize: 22,
    color: "#111827",
    fontWeight: "900",
  },
  dayNumberActive: {
    color: "#FFFFFF",
  },
  filterTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },
  filterRow: {
    gap: 10,
    paddingBottom: 18,
  },
  filterChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterChipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  filterChipText: {
    color: "#111827",
    fontWeight: "800",
    fontSize: 13,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  summaryCard: {
    backgroundColor: "#111827",
    borderRadius: 28,
    padding: 20,
    marginBottom: 22,
  },
  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  summaryDate: {
    color: "#D1D5DB",
    fontSize: 14,
    marginBottom: 18,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statBox: {
    width: "48%",
    backgroundColor: "#1F2937",
    borderRadius: 18,
    padding: 14,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
  },
  statLabel: {
    color: "#D1D5DB",
    fontSize: 12,
    marginTop: 4,
  },
  extraStatsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  extraStatBox: {
    flex: 1,
    backgroundColor: "#1F2937",
    borderRadius: 18,
    padding: 14,
  },
  extraStatBoxBlue: {
    flex: 1,
    backgroundColor: "#2F6BFF",
    borderRadius: 18,
    padding: 14,
  },
  extraStatLabel: {
    color: "#D1D5DB",
    fontSize: 12,
    fontWeight: "700",
  },
  extraStatValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 4,
  },
  extraStatLabelBlue: {
    color: "#DDE7FF",
    fontSize: 12,
    fontWeight: "700",
  },
  extraStatValueBlue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
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
    fontWeight: "800",
    color: "#111111",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666666",
  },
  hourBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  hourText: {
    width: 58,
    fontSize: 14,
    fontWeight: "900",
    color: "#6B7280",
    paddingTop: 18,
  },
  hourAppointments: {
    flex: 1,
    gap: 12,
  },
  timelineCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    overflow: "hidden",
    minHeight: 116,
  },
  timelineBar: {
    width: 7,
  },
  timelinePending: {
    backgroundColor: "#F59E0B",
  },
  timelineApproved: {
    backgroundColor: "#16A34A",
  },
  timelineRejected: {
    backgroundColor: "#DC2626",
  },
  timelineCompleted: {
    backgroundColor: "#2563EB",
  },
  timelineCancelled: {
    backgroundColor: "#6B7280",
  },
  timelineContent: {
    flex: 1,
    padding: 16,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  appointmentTime: {
    fontSize: 14,
    color: "#2F6BFF",
    fontWeight: "900",
    marginBottom: 4,
  },
  customerName: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111111",
  },
  detailText: {
    fontSize: 14,
    color: "#555555",
    marginTop: 4,
  },
  priceText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "900",
    color: "#111111",
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111111",
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
  },
  statusApproved: {
    backgroundColor: "#DCFCE7",
  },
  statusRejected: {
    backgroundColor: "#FEE2E2",
  },
  statusCompleted: {
    backgroundColor: "#DBEAFE",
  },
  statusCancelled: {
    backgroundColor: "#E5E7EB",
  },
  legendCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginTop: 10,
  },
  legendTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
    color: "#555555",
    fontWeight: "700",
  },
});
