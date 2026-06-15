import { router, useFocusEffect } from "expo-router";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { useCallback, useMemo, useState } from "react";
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
import { db } from "../../src/config/firebase";
import { useAuthStore } from "../../src/store/auth.store";

interface BarbershopItem {
  id: string;
  name: string;
  businessName?: string;
  description?: string;
}

interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  isActive?: boolean;
}

interface EmployeeItem {
  id: string;
  fullName: string;
  available: boolean;
  status: "active" | "inactive";
  specialties?: string[];
}

export default function ClientBookAppointmentScreen() {
  const { user } = useAuthStore();

  const [barbershops, setBarbershops] = useState<BarbershopItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);

  const [selectedBarbershopId, setSelectedBarbershopId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");

  const [loading, setLoading] = useState(true);

  const selectedBarbershop = barbershops.find(
    (item) => item.id === selectedBarbershopId,
  );

  const selectedService = services.find(
    (item) => item.id === selectedServiceId,
  );

  const selectedEmployee = employees.find(
    (item) => item.id === selectedEmployeeId,
  );

  const availableEmployees = useMemo(() => {
    if (!selectedServiceId) return [];

    return employees.filter(
      (employee) =>
        employee.status === "active" &&
        employee.available === true &&
        employee.specialties?.includes(selectedServiceId),
    );
  }, [employees, selectedServiceId]);

  const calculateEndTime = (time: string, duration: number) => {
    if (!time || !duration) return "";

    const [hours, minutes] = time.split(":").map(Number);
    const start = new Date();
    start.setHours(hours, minutes, 0, 0);
    start.setMinutes(start.getMinutes() + duration);

    const endHours = String(start.getHours()).padStart(2, "0");
    const endMinutes = String(start.getMinutes()).padStart(2, "0");

    return `${endHours}:${endMinutes}`;
  };

  const endTime = selectedService
    ? calculateEndTime(startTime, Number(selectedService.durationMinutes || 0))
    : "";

  const loadBarbershops = async () => {
    try {
      const snapshot = await getDocs(collection(db, "barbershops"));

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<BarbershopItem, "id">),
      }));

      setBarbershops(data);
    } catch (error) {
      console.log("Error cargando barberías:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadBarbershopData = async (barbershopId: string) => {
    try {
      const servicesSnap = await getDocs(
        collection(db, "barbershops", barbershopId, "services"),
      );

      const employeesSnap = await getDocs(
        collection(db, "barbershops", barbershopId, "employees"),
      );

      const servicesData = servicesSnap.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<ServiceItem, "id">),
        }))
        .filter((service) => service.isActive !== false);

      const employeesData = employeesSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<EmployeeItem, "id">),
      }));

      setServices(servicesData);
      setEmployees(employeesData);
    } catch (error) {
      console.log("Error cargando datos barbería:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadBarbershops();
    }, []),
  );

  const handleSelectBarbershop = async (barbershopId: string) => {
    setSelectedBarbershopId(barbershopId);
    setSelectedServiceId("");
    setSelectedEmployeeId("");
    setServices([]);
    setEmployees([]);

    await loadBarbershopData(barbershopId);
  };

  const handleCreateAppointment = async () => {
    try {
      if (!user?.uid) {
        Alert.alert("Error", "No se encontró el usuario");
        return;
      }

      if (!selectedBarbershopId) {
        Alert.alert("Error", "Selecciona una barbería");
        return;
      }

      if (!selectedService) {
        Alert.alert("Error", "Selecciona un servicio");
        return;
      }

      if (!selectedEmployee) {
        Alert.alert("Error", "Selecciona un empleado");
        return;
      }

      if (!date.trim() || !startTime.trim()) {
        Alert.alert("Error", "Ingresa fecha y hora");
        return;
      }

      if (!endTime) {
        Alert.alert("Error", "Hora inválida");
        return;
      }

      await addDoc(
        collection(db, "barbershops", selectedBarbershopId, "appointments"),
        {
          customerId: user.uid,
          customerName: user.fullName || "Cliente",
          customerEmail: user.email || "",

          employeeId: selectedEmployee.id,
          employeeName: selectedEmployee.fullName,

          serviceId: selectedService.id,
          serviceName: selectedService.name,

          date: date.trim(),
          startTime: startTime.trim(),
          endTime,

          price: Number(selectedService.price || 0),
          status: "pending",

          paid: false,
          paymentMethod: "",
          createdBy: "client",

          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
      );

      Alert.alert("Cita solicitada", "Tu cita quedó pendiente de aprobación.", [
        {
          text: "OK",
          onPress: () => router.replace("/client/home" as any),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo crear la cita");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2F6BFF" />
        <Text style={styles.loadingText}>Cargando barberías...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.badge}>RESERVA</Text>
        <Text style={styles.title}>Reservar cita</Text>
        <Text style={styles.subtitle}>
          Selecciona barbería, servicio, empleado, fecha y hora.
        </Text>

        <Text style={styles.sectionTitle}>Barbería</Text>

        {barbershops.map((barbershop) => {
          const selected = selectedBarbershopId === barbershop.id;

          return (
            <TouchableOpacity
              key={barbershop.id}
              style={[styles.optionCard, selected && styles.optionCardActive]}
              onPress={() => handleSelectBarbershop(barbershop.id)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.optionTitle,
                  selected && styles.optionTitleActive,
                ]}
              >
                {barbershop.businessName || barbershop.name || "Barbería"}
              </Text>
              <Text
                style={[styles.optionText, selected && styles.optionTextActive]}
              >
                {barbershop.description || "Disponible para reservas"}
              </Text>
            </TouchableOpacity>
          );
        })}

        {selectedBarbershop && (
          <>
            <Text style={styles.sectionTitle}>Servicio</Text>

            {services.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  No hay servicios disponibles.
                </Text>
              </View>
            ) : (
              services.map((service) => {
                const selected = selectedServiceId === service.id;

                return (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.optionCard,
                      selected && styles.optionCardActive,
                    ]}
                    onPress={() => {
                      setSelectedServiceId(service.id);
                      setSelectedEmployeeId("");
                    }}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.optionTitle,
                        selected && styles.optionTitleActive,
                      ]}
                    >
                      {service.name}
                    </Text>
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextActive,
                      ]}
                    >
                      ${service.price} · {service.durationMinutes} min
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}

            <Text style={styles.sectionTitle}>Empleado</Text>

            {selectedServiceId && availableEmployees.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  No hay empleados disponibles para este servicio.
                </Text>
              </View>
            ) : (
              availableEmployees.map((employee) => {
                const selected = selectedEmployeeId === employee.id;

                return (
                  <TouchableOpacity
                    key={employee.id}
                    style={[
                      styles.optionCard,
                      selected && styles.optionCardActive,
                    ]}
                    onPress={() => setSelectedEmployeeId(employee.id)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.optionTitle,
                        selected && styles.optionTitleActive,
                      ]}
                    >
                      {employee.fullName}
                    </Text>
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextActive,
                      ]}
                    >
                      Disponible
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}

            <Text style={styles.sectionTitle}>Fecha y hora</Text>

            <Text style={styles.label}>Fecha</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#8A8A8A"
              value={date}
              onChangeText={setDate}
            />

            <Text style={styles.label}>Hora inicio</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:mm"
              placeholderTextColor="#8A8A8A"
              value={startTime}
              onChangeText={setStartTime}
            />

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Resumen</Text>
              <Text style={styles.summaryText}>
                Servicio: {selectedService?.name || "—"}
              </Text>
              <Text style={styles.summaryText}>
                Empleado: {selectedEmployee?.fullName || "—"}
              </Text>
              <Text style={styles.summaryText}>
                Horario: {startTime || "--"} - {endTime || "--"}
              </Text>
              <Text style={styles.summaryPrice}>
                Total: ${selectedService?.price || 0}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleCreateAppointment}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Solicitar cita</Text>
            </TouchableOpacity>
          </>
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111111",
    marginTop: 8,
    marginBottom: 14,
  },
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  optionCardActive: {
    backgroundColor: "#2F6BFF",
    borderColor: "#2F6BFF",
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 5,
  },
  optionTitleActive: {
    color: "#FFFFFF",
  },
  optionText: {
    fontSize: 14,
    color: "#666666",
  },
  optionTextActive: {
    color: "#E0E7FF",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#666666",
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#111111",
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: "#D9D9D9",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginTop: 8,
    marginBottom: 18,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: "#555555",
    marginBottom: 5,
  },
  summaryPrice: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111111",
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: "#111111",
    borderRadius: 20,
    paddingVertical: 17,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
});
