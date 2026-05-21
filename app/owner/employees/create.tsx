import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { createEmployee } from "../../../src/services/employees/create-employee";
import { useAuthStore } from "../../../src/store/auth.store";

export default function CreateEmployeeScreen() {
  const { user } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const handleCreateEmployee = async () => {
    try {
      if (!user?.ownerBarbershopId) {
        Alert.alert("Error", "No se encontró la barbería");
        return;
      }

      if (!fullName.trim() || !email.trim() || !phone.trim()) {
        Alert.alert("Error", "Completa todos los campos");
        return;
      }

      await createEmployee({
        barbershopId: user.ownerBarbershopId,
        fullName,
        email,
        phone,
        isAdmin,
      });

      Alert.alert("Éxito", "Empleado creado correctamente");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo crear el empleado");
    }
  };

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
            <Text style={styles.badgeText}>EMPLEADOS</Text>
          </View>

          <Text style={styles.title}>
            Crear nuevo{"\n"}
            <Text style={styles.titleAccent}>empleado</Text>
          </Text>

          <Text style={styles.subtitle}>
            Agrega personal a tu barbería para organizar mejor tus servicios y
            reservas.
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Ejemplo: Carlos Pérez"
              placeholderTextColor="#9CA3AF"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="empleado@correo.com"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

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
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleButton, !isAdmin && styles.roleButtonActive]}
                onPress={() => setIsAdmin(false)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    !isAdmin && styles.roleButtonTextActive,
                  ]}
                >
                  Empleado
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleButton, isAdmin && styles.roleButtonActive]}
                onPress={() => setIsAdmin(true)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    isAdmin && styles.roleButtonTextActive,
                  ]}
                >
                  Administrador
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleCreateEmployee}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#1A1A1A", "#2D2D2D"]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.primaryButtonText}>Guardar empleado</Text>
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
  roleRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  roleButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  roleButtonActive: {
    backgroundColor: "#2F6BFF",
    borderColor: "#2F6BFF",
  },
  roleButtonText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 14,
  },
  roleButtonTextActive: {
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
});
