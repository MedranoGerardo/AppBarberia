import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getAppointmentById } from "../../../src/services/appointments/get-appointment-by-id";
import { getAvailableTimes } from "../../../src/services/appointments/get-available-times";
import { getOccupiedSlots } from "../../../src/services/appointments/get-occupied-slots";
import { updateOwnerAppointment } from "../../../src/services/appointments/update-owner-appointment";
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

function addMinutes(time: string, minutesToAdd: number) {
  const [hours, minutes] = time.split(":").map(Number);
  const total = hours * 60 + minutes + minutesToAdd;
  const h = String(Math.floor(total / 60)).padStart(2, "0");
  const m = String(total % 60).padStart(2, "0");
  return `${h}:${m}`;
}

function isPastDate(date: string) {
  const today = new Date();
  const compare = new Date(`${date}T00:00:00`);
  today.setHours(0, 0, 0, 0);
  return compare < today;
}

export default function EditOwnerAppointmentScreen() {
  const [appointmentStatus, setAppointmentStatus] = useState("");
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const barbershopId = user?.ownerBarbershopId || "";

  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!barbershopId || !id) {
          Alert.alert("Error", "No se encontró la cita");
          router.back();
          return;
        }

        const [
          appointment,
          clientsData,
          employeesData,
          servicesData,
          scheduleData,
          holidaysData,
        ] = await Promise.all([
          getAppointmentById(barbershopId, id),
          getClients(),
          getEmployees(barbershopId),
          getServices(barbershopId),
          getSchedule(barbershopId),
          getHolidays(barbershopId),
        ]);

        if (!appointment) {
          Alert.alert("Error", "No se encontró la cita");
          router.back();
          return;
        }

        setClients(clientsData);
        setEmployees(employeesData);
        setServices(servicesData);
        setBusinessSchedule(scheduleData);
        setHolidays(holidaysData);

        setSelectedClientId(appointment.customerId);
        setSelectedEmployeeId(appointment.employeeId);
        setSelectedServiceId(appointment.serviceId);
        setDate(appointment.date);
        setSelectedStartTime(appointment.startTime);
        setAppointmentStatus(appointment.status);
      } catch (error: any) {
        Alert.alert("Error", error.message || "No se pudo cargar la cita");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [barbershopId, id]);

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
        setOccupiedSlots(data.filter((item) => item.id !== id));
      } catch (error) {
        console.log("Error cargando horas ocupadas:", error);
      }
    };

    loadOccupied();
  }, [barbershopId, selectedEmployeeId, date, id]);

  const activeEmployees = useMemo(
    () =>
      employees.filter(
        (employee) => employee.status === "active" && employee.available,
      ),
    [employees],
  );

  const selectedClient =
    clients.find((item) => item.id === selectedClientId) || null;

  const selectedService =
    services.find((item) => item.id === selectedServiceId) || null;

  const eligibleEmployees = useMemo(() => {
    if (!selectedServiceId) return activeEmployees;

    return activeEmployees.filter((employee) =>
      (employee.specialties || []).includes(selectedServiceId),
    );
  }, [activeEmployees, selectedServiceId]);

  const selectedEmployee =
    eligibleEmployees.find((item) => item.id === selectedEmployeeId) || null;

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

  const handleSave = async () => {
    try {
      if (!barbershopId || !id) return;

      if (
        appointmentStatus === "completed" ||
        appointmentStatus === "cancelled" ||
        appointmentStatus === "rejected"
      ) {
        Alert.alert(
          "No permitido",
          "Esta cita ya está en estado final y no puede reprogramarse.",
        );
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
        Alert.alert("Error", "No puedes reprogramar a una fecha pasada");
        return;
      }

      const endTime = addMinutes(
        selectedStartTime,
        selectedService.durationMinutes,
      );

      await updateOwnerAppointment({
        barbershopId,
        appointmentId: id,
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

      Alert.alert("Éxito", "Cita actualizada correctamente");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo actualizar la cita");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2F6BFF" />
        <Text style={styles.loadingText}>Cargando cita...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.badge}>REPROGRAMAR</Text>
        <Text style={styles.title}>Reprogramar cita</Text>
        <Text style={styles.subtitle}>
          Cambia fecha, hora, empleado o servicio. El sistema recalcula
          disponibilidad y precio automáticamente.
        </Text>

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
            <Text style={styles.noTimesText}>No hay horarios disponibles</Text>
          )}
        </ScrollView>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen</Text>
          <Text style={styles.summaryText}>
            Servicio: {selectedService?.name || "No seleccionado"}
          </Text>
          <Text style={styles.summaryText}>
            Empleado: {selectedEmployee?.fullName || "No seleccionado"}
          </Text>
          <Text style={styles.summaryText}>
            Precio: ${selectedService?.price ?? 0}
          </Text>
          <Text style={styles.summaryText}>
            Duración: {selectedService?.durationMinutes ?? 0} min
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Guardar cambios</Text>
        </TouchableOpacity>
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
  container: { padding: 20, paddingBottom: 30 },
  backText: {
    fontSize: 16,
    fontWeight: "600",
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
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 8,
    marginTop: 12,
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
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#666666",
    marginBottom: 18,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginTop: 18,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: "#444444",
    marginBottom: 4,
  },
});
