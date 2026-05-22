import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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
import { sendPasswordReset } from "../../../../src/services/auth/send-password-reset";
import {
  EmployeeDetail,
  getEmployeeById,
} from "../../../../src/services/employees/get-employee-by-id";
import { updateEmployee } from "../../../../src/services/employees/update-employee";
import { useAuthStore } from "../../../../src/store/auth.store";

export default function EditEmployeeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();

  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [available, setAvailable] = useState(true);
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(true);

  const handlePasswordReset = () => {
    if (!email.trim()) {
      Alert.alert("Error", "El empleado no tiene correo");
      return;
    }

    Alert.alert("Restablecer contraseña", `Se enviará un correo a ${email}`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Enviar",
        onPress: async () => {
          try {
            await sendPasswordReset(email);

            Alert.alert("Correo enviado", "Se envió el enlace de recuperación");
          } catch (error: any) {
            Alert.alert("Error", error.message || "No se pudo enviar");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        if (!user?.ownerBarbershopId || !id) {
          Alert.alert("Error", "No se encontró información del empleado");
          router.back();
          return;
        }

        const employeeData = await getEmployeeById(user.ownerBarbershopId, id);

        if (!employeeData) {
          Alert.alert("Error", "No se encontró el empleado");
          router.back();
          return;
        }

        setEmployee(employeeData);
        setFullName(employeeData.fullName || "");
        setEmail(employeeData.email || "");
        setPhone(employeeData.phone || "");
        setIsAdmin(!!employeeData.isAdmin);
        setAvailable(!!employeeData.available);
        setStatus(employeeData.status || "active");
      } catch (error: any) {
        Alert.alert("Error", error.message || "No se pudo cargar el empleado");
      } finally {
        setLoading(false);
      }
    };

    loadEmployee();
  }, [id, user?.ownerBarbershopId]);

  const handleSave = async () => {
    try {
      if (!user?.ownerBarbershopId || !id) return;

      if (!fullName.trim() || !email.trim() || !phone.trim()) {
        Alert.alert("Error", "Completa todos los campos");
        return;
      }

      await updateEmployee({
        barbershopId: user.ownerBarbershopId,
        employeeId: id,
        fullName,
        email,
        phone,
        isAdmin,
        available,
        status,
      });

      Alert.alert("Éxito", "Empleado actualizado correctamente");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo actualizar");
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#F8F9FF", "#F0F2FE", "#E9EEFF"]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2F6BFF" />
          <Text style={styles.loadingText}>Cargando empleado...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#F8F9FF", "#F0F2FE", "#E9EEFF"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Espaciado superior extra */}
          <View style={styles.topSpacer} />

          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>EDITAR</Text>
          </View>

          <Text style={styles.title}>
            Editar{"\n"}
            <Text style={styles.titleAccent}>
              {employee?.fullName || "empleado"}
            </Text>
          </Text>

          <Text style={styles.subtitle}>
            Actualiza la información, permisos y disponibilidad del empleado.
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor="#9CA3AF"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              editable={false}
            />

            <Text style={styles.helperText}>
              El correo se usa para iniciar sesión. Si está incorrecto, elimina
              este empleado y créalo nuevamente.
            </Text>

            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              placeholder="7000-0000"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <Text style={styles.label}>Permiso</Text>
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  !isAdmin && styles.optionButtonActive,
                ]}
                onPress={() => setIsAdmin(false)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    !isAdmin && styles.optionButtonTextActive,
                  ]}
                >
                  Empleado normal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  isAdmin && styles.optionButtonActive,
                ]}
                onPress={() => setIsAdmin(true)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    isAdmin && styles.optionButtonTextActive,
                  ]}
                >
                  Administrador
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Disponibilidad</Text>
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  available && styles.optionButtonActive,
                ]}
                onPress={() => setAvailable(true)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    available && styles.optionButtonTextActive,
                  ]}
                >
                  Disponible
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  !available && styles.optionButtonActive,
                ]}
                onPress={() => setAvailable(false)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    !available && styles.optionButtonTextActive,
                  ]}
                >
                  No disponible
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Estado</Text>
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  status === "active" && styles.optionButtonActive,
                ]}
                onPress={() => setStatus("active")}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    status === "active" && styles.optionButtonTextActive,
                  ]}
                >
                  Activo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  status === "inactive" && styles.optionButtonActive,
                ]}
                onPress={() => setStatus("inactive")}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    status === "inactive" && styles.optionButtonTextActive,
                  ]}
                >
                  Inactivo
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.resetPasswordButton}
              onPress={handlePasswordReset}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#F59E0B", "#D97706"]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.resetPasswordButtonText}>
                  Enviar restablecimiento de contraseña
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#1A1A1A", "#2D2D2D"]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.primaryButtonText}>Guardar cambios</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push(`/owner/employees/${id}` as any)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#2F6BFF", "#1E4FD8"]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.secondaryButtonText}>
                  Asignar servicios
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Espaciado inferior extra */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  topSpacer: {
    height: 20,
  },
  bottomSpacer: {
    height: 30,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  backText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4B5563",
    letterSpacing: -0.3,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    marginBottom: 16,
  },
  badgeText: {
    color: "#1F2937",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 40,
    color: "#111827",
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  titleAccent: {
    color: "#2F6BFF",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 32,
    padding: 24,
    gap: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 8,
    letterSpacing: -0.2,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  optionButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  optionButtonActive: {
    backgroundColor: "#2F6BFF",
    borderColor: "#2F6BFF",
  },
  optionButtonText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 14,
  },
  optionButtonTextActive: {
    color: "#FFFFFF",
  },
  primaryButton: {
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  secondaryButton: {
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 12,
    shadowColor: "#2F6BFF",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  disabledInput: {
    opacity: 0.65,
    backgroundColor: "#F3F4F6",
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 8,
  },
  resetPasswordButton: {
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 12,
    shadowColor: "#F59E0B",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  resetPasswordButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
