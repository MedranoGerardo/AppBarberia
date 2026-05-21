import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  AppointmentPaymentMethod,
  completeAppointment,
} from "../../../src/services/appointments/complete-appointment";
import { createOwnerAppointment } from "../../../src/services/appointments/create-owner-appointment";
import { getAvailableTimes } from "../../../src/services/appointments/get-available-times";
import { getOccupiedSlots } from "../../../src/services/appointments/get-occupied-slots";
import {
  getOwnerAppointments,
  OwnerAppointmentItem,
} from "../../../src/services/appointments/get-owner-appointments";
import { updateAppointmentStatus } from "../../../src/services/appointments/update-appointment-status";
import {
  EmployeeItem,
  getEmployees,
} from "../../../src/services/employees/get-employees";
import {
  getHolidays,
  HolidayItem,
} from "../../../src/services/holidays/get-holidays";
import { DaySchedule } from "../../../src/services/schedule/default-schedule";
import { getSchedule } from "../../../src/services/schedule/get-schedule";
import {
  BarberService,
  getServices,
} from "../../../src/services/services/get-services";
import {
  ClientItem,
  getClients,
} from "../../../src/services/users/get-clients";
import { useAuthStore } from "../../../src/store/auth.store";

function isPastDate(date: string) {
  const today = new Date();
  const compare = new Date(`${date}T00:00:00`);
  today.setHours(0, 0, 0, 0);
  return compare < today;
}

function addMinutes(time: string, minutesToAdd: number) {
  const [hours, minutes] = time.split(":").map(Number);
  const total = hours * 60 + minutes + minutesToAdd;
  const h = String(Math.floor(total / 60)).padStart(2, "0");
  const m = String(total % 60).padStart(2, "0");
  return `${h}:${m}`;
}

export default function OwnerAppointmentsScreen() {
  const { user } = useAuthStore();
  const barbershopId = user?.ownerBarbershopId || "";

  const [appointments, setAppointments] = useState<OwnerAppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [clients, setClients] = useState<ClientItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [services, setServices] = useState<BarberService[]>([]);

  const [businessSchedule, setBusinessSchedule] = useState<DaySchedule[]>([]);
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [occupiedSlots, setOccupiedSlots] = useState<any[]>([]);

  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [date, setDate] = useState("");
  const [selectedStartTime, setSelectedStartTime] = useState("");

  const loadAppointments = async () => {
    try {
      if (!barbershopId) return;
      const data = await getOwnerAppointments(barbershopId);
      setAppointments(data);
    } catch (error: any) {
      console.log("Error cargando citas:", error);
      Alert.alert("Error cargando citas", error.message || "Error desconocido");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadFormData = async () => {
    try {
      if (!barbershopId) return;

      const [
        clientsData,
        employeesData,
        servicesData,
        scheduleData,
        holidaysData,
      ] = await Promise.all([
        getClients(),
        getEmployees(barbershopId),
        getServices(barbershopId),
        getSchedule(barbershopId),
        getHolidays(barbershopId),
      ]);

      setClients(clientsData);
      setEmployees(employeesData);
      setServices(servicesData);
      setBusinessSchedule(scheduleData);
      setHolidays(holidaysData);
    } catch (error) {
      console.log("Error cargando datos del formulario:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadAppointments();
      loadFormData();
    }, [barbershopId]),
  );

  useEffect(() => {
    loadFormData();
  }, [barbershopId]);

  useEffect(() => {
    const loadOccupied = async () => {
      try {
        if (!barbershopId || !selectedEmployeeId || !date) {
          setOccupiedSlots([]);
          return;
        }

        const data = await getOccupiedSlots(
          barbershopId,
          selectedEmployeeId,
          date,
        );
        setOccupiedSlots(data);
      } catch (error) {
        console.log("Error cargando horas ocupadas:", error);
      }
    };

    loadOccupied();
  }, [barbershopId, selectedEmployeeId, date]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAppointments();
    loadFormData();
  };

  const selectedClient =
    clients.find((item) => item.id === selectedClientId) || null;

  const selectedService =
    services.find((item) => item.id === selectedServiceId) || null;

  const activeEmployees = useMemo(
    () =>
      employees.filter(
        (employee) => employee.status === "active" && employee.available,
      ),
    [employees],
  );

  const eligibleEmployees = useMemo(() => {
    if (!selectedServiceId) return activeEmployees;

    return activeEmployees.filter((employee) =>
      (employee.specialties || []).includes(selectedServiceId),
    );
  }, [activeEmployees, selectedServiceId]);

  const selectedEmployee =
    eligibleEmployees.find((item) => item.id === selectedEmployeeId) || null;

  const selectedPrice = selectedService?.price ?? 0;
  const selectedDuration = selectedService?.durationMinutes ?? 0;

  const availableTimes = useMemo(() => {
    if (!selectedService || !selectedEmployee || !date) return [];

    return getAvailableTimes({
      selectedDate: date,
      serviceDuration: selectedService.durationMinutes,
      businessSchedule,
      holidays,
      employeeWorkDays: selectedEmployee.workDays || [],
      employeeStartHour: selectedEmployee.startHour || "",
      employeeEndHour: selectedEmployee.endHour || "",
      occupiedSlots,
    });
  }, [
    selectedService,
    selectedEmployee,
    date,
    businessSchedule,
    holidays,
    occupiedSlots,
  ]);

  const handleChangeStatus = async (
    appointmentId: string,
    status: "pending" | "approved" | "rejected" | "completed" | "cancelled",
  ) => {
    try {
      await updateAppointmentStatus(barbershopId, appointmentId, status);
      await loadAppointments();
      Alert.alert("Éxito", "Estado actualizado");
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo actualizar");
    }
  };

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

  const handleCreateAppointment = async () => {
    try {
      if (!barbershopId) {
        Alert.alert("Error", "No se encontró la barbería");
        return;
      }

      if (!selectedClient || !selectedEmployee || !selectedService) {
        Alert.alert("Error", "Selecciona cliente, empleado y servicio");
        return;
      }

      if (!date.trim() || !selectedStartTime.trim()) {
        Alert.alert("Error", "Selecciona fecha y hora");
        return;
      }

      if (isPastDate(date)) {
        Alert.alert("Error", "No puedes crear citas en fechas pasadas");
        return;
      }

      const endTime = addMinutes(
        selectedStartTime,
        selectedService.durationMinutes,
      );

      await createOwnerAppointment({
        barbershopId,
        customerId: selectedClient.id,
        customerName: selectedClient.fullName,
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.fullName,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        date,
        startTime: selectedStartTime,
        endTime,
        price: selectedService.price,
      });

      setSelectedClientId("");
      setSelectedEmployeeId("");
      setSelectedServiceId("");
      setDate("");
      setSelectedStartTime("");

      await loadAppointments();
      Alert.alert("Éxito", "Cita creada correctamente");
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo crear la cita");
    }
  };

  const getStatusLabel = (status: OwnerAppointmentItem["status"]) => {
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

  const renderStatusActions = (item: OwnerAppointmentItem) => {
    if (item.status === "pending") {
      return (
        <View style={styles.actionsWrap}>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editAppointmentButton]}
              onPress={() =>
                router.push(`/owner/appointments/${item.id}` as any)
              }
              activeOpacity={0.85}
            >
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleChangeStatus(item.id, "approved")}
              activeOpacity={0.85}
            >
              <Text style={styles.actionButtonText}>Aprobar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleChangeStatus(item.id, "rejected")}
              activeOpacity={0.85}
            >
              <Text style={styles.actionButtonText}>Rechazar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleChangeStatus(item.id, "cancelled")}
              activeOpacity={0.85}
            >
              <Text style={styles.actionButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (item.status === "approved") {
      return (
        <View style={styles.actionsWrap}>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editAppointmentButton]}
              onPress={() =>
                router.push(`/owner/appointments/${item.id}` as any)
              }
              activeOpacity={0.85}
            >
              <Text style={styles.actionButtonText}>Reprogramar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleCompleteAppointment(item.id)}
              activeOpacity={0.85}
            >
              <Text style={styles.actionButtonText}>Completar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton, { marginTop: 8 }]}
            onPress={() => handleChangeStatus(item.id, "cancelled")}
            activeOpacity={0.85}
          >
            <Text style={styles.actionButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.finalStatusBox}>
        <Text style={styles.finalStatusText}>
          Esta cita ya está en estado final.
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2F6BFF" />
        <Text style={styles.loadingText}>Cargando citas...</Text>
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
            <Text style={styles.badge}>CITAS</Text>
            <Text style={styles.title}>Reservas del negocio</Text>
            <Text style={styles.subtitle}>
              Administra el estado de las citas y crea reservas dinámicas.
            </Text>

            <TouchableOpacity
              style={styles.calendarButton}
              onPress={() => router.push("/owner/appointments/calendar" as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.calendarButtonText}>Ver calendario</Text>
            </TouchableOpacity>

            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Crear cita</Text>

              <Text style={styles.fieldLabel}>Cliente</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectorRow}
              >
                {clients.map((client) => {
                  const selected = selectedClientId === client.id;

                  return (
                    <TouchableOpacity
                      key={client.id}
                      style={[
                        styles.selectorChip,
                        selected && styles.selectorChipActive,
                      ]}
                      onPress={() => setSelectedClientId(client.id)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.selectorChipText,
                          selected && styles.selectorChipTextActive,
                        ]}
                      >
                        {client.fullName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.fieldLabel}>Servicio</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectorRow}
              >
                {services.map((service) => {
                  const selected = selectedServiceId === service.id;

                  return (
                    <TouchableOpacity
                      key={service.id}
                      style={[
                        styles.selectorChip,
                        selected && styles.selectorChipActive,
                      ]}
                      onPress={() => {
                        setSelectedServiceId(service.id);
                        setSelectedEmployeeId("");
                        setSelectedStartTime("");
                      }}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.selectorChipText,
                          selected && styles.selectorChipTextActive,
                        ]}
                      >
                        {service.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.fieldLabel}>Empleado</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectorRow}
              >
                {eligibleEmployees.map((employee) => {
                  const selected = selectedEmployeeId === employee.id;

                  return (
                    <TouchableOpacity
                      key={employee.id}
                      style={[
                        styles.selectorChip,
                        selected && styles.selectorChipActive,
                      ]}
                      onPress={() => {
                        setSelectedEmployeeId(employee.id);
                        setSelectedStartTime("");
                      }}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.selectorChipText,
                          selected && styles.selectorChipTextActive,
                        ]}
                      >
                        {employee.fullName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Precio automático: ${selectedPrice}
                </Text>
                <Text style={styles.infoText}>
                  Duración: {selectedDuration} min
                </Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Fecha (YYYY-MM-DD)"
                placeholderTextColor="#8A8A8A"
                value={date}
                onChangeText={(value) => {
                  setDate(value);
                  setSelectedStartTime("");
                }}
              />

              <Text style={styles.fieldLabel}>Horas disponibles</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectorRow}
              >
                {availableTimes.length > 0 ? (
                  availableTimes.map((time) => {
                    const selected = selectedStartTime === time;

                    return (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.selectorChip,
                          selected && styles.selectorChipActive,
                        ]}
                        onPress={() => setSelectedStartTime(time)}
                        activeOpacity={0.85}
                      >
                        <Text
                          style={[
                            styles.selectorChipText,
                            selected && styles.selectorChipTextActive,
                          ]}
                        >
                          {time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <Text style={styles.noTimesText}>
                    No hay horarios disponibles
                  </Text>
                )}
              </ScrollView>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleCreateAppointment}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Crear cita</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Listado de citas</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No hay citas registradas</Text>
            <Text style={styles.emptyText}>
              Crea una cita usando cliente, empleado y servicio registrados.
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
                <Text style={styles.statusPillText}>
                  {getStatusLabel(item.status)}
                </Text>
              </View>
            </View>

            <Text style={styles.detailText}>Barbero: {item.employeeName}</Text>
            <Text style={styles.detailText}>
              Fecha: {item.date} · {item.startTime} - {item.endTime}
            </Text>
            <Text style={styles.detailText}>Precio: ${item.price}</Text>
            {item.paymentMethod && (
              <Text style={styles.detailText}>
                Pago:{" "}
                {item.paymentMethod === "cash"
                  ? "Efectivo"
                  : item.paymentMethod === "card"
                    ? "Tarjeta"
                    : "Transferencia"}
              </Text>
            )}
            {renderStatusActions(item)}
          </View>
        )}
      />
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
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 8,
    marginTop: 10,
  },
  selectorRow: {
    paddingBottom: 6,
    gap: 10,
  },
  selectorChip: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  selectorChipActive: {
    backgroundColor: "#2F6BFF",
    borderColor: "#2F6BFF",
  },
  selectorChipText: {
    color: "#111111",
    fontWeight: "700",
    fontSize: 13,
  },
  selectorChipTextActive: {
    color: "#FFFFFF",
  },
  infoBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#444444",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#D9D9D9",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111111",
    backgroundColor: "#F9FAFB",
    marginTop: 10,
  },
  noTimesText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
    paddingVertical: 10,
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
    fontWeight: "700",
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
  appointmentCard: {
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
  infoWrap: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "800",
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
  statusPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111111",
  },
  actionsWrap: {
    marginTop: 16,
    gap: 8,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: "#16A34A",
  },
  rejectButton: {
    backgroundColor: "#DC2626",
  },
  completeButton: {
    backgroundColor: "#2563EB",
  },
  cancelButton: {
    backgroundColor: "#6B7280",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  editAppointmentButton: {
    backgroundColor: "#111111",
  },
  finalStatusBox: {
    marginTop: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  finalStatusText: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  calendarButton: {
    backgroundColor: "#2F6BFF",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 18,
  },
  calendarButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
