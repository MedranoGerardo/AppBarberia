import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
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
import { registerClient } from "../../src/services/auth/register-client";

export default function RegisterClientScreen() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!fullName.trim() || !phone.trim() || !email.trim() || !password) {
      Alert.alert("Campos incompletos", "Por favor, completa todos los campos");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Contraseña débil",
        "La contraseña debe tener al menos 6 caracteres",
      );
      return;
    }

    setIsLoading(true);
    try {
      await registerClient({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
      });

      Alert.alert(
        "¡Registro exitoso!",
        "Tu cuenta ha sido creada correctamente",
      );
      router.replace("/auth/login" as any);
    } catch (error: any) {
      Alert.alert("Error de registro", error.message || "No se pudo registrar");
    } finally {
      setIsLoading(false);
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

          {/* Botón de retorno */}
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Volver al inicio</Text>
          </TouchableOpacity>

          {/* Sección Hero */}
          <View style={styles.hero}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>REGISTRO DE CLIENTE</Text>
            </View>
            <Text style={styles.title}>
              Crea tu cuenta{"\n"}
              <Text style={styles.titleAccent}>y reserva fácil</Text>
            </Text>
            <Text style={styles.subtitle}>
              Regístrate para agendar citas, elegir barbería, seleccionar tu
              barbero y gestionar tus reservas.
            </Text>
          </View>

          {/* Tarjeta de registro */}
          <View style={styles.card}>
            {/* Campo Nombre completo */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre completo</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === "fullName" && styles.inputFocused,
                ]}
                placeholder="Gerardo Medrano"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
                onFocus={() => setFocusedField("fullName")}
                onBlur={() => setFocusedField(null)}
                editable={!isLoading}
              />
            </View>

            {/* Campo Teléfono */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === "phone" && styles.inputFocused,
                ]}
                placeholder="7000-0000"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                onFocus={() => setFocusedField("phone")}
                onBlur={() => setFocusedField(null)}
                editable={!isLoading}
              />
            </View>

            {/* Campo Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === "email" && styles.inputFocused,
                ]}
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                editable={!isLoading}
              />
              {email.length > 0 && !email.includes("@") && (
                <Text style={styles.hintText}>Ingresa un email válido</Text>
              )}
            </View>

            {/* Campo Contraseña */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === "password" && styles.inputFocused,
                ]}
                placeholder="Crea una contraseña segura"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                editable={!isLoading}
              />
              {password.length > 0 && password.length < 6 && (
                <Text style={styles.hintText}>Mínimo 6 caracteres</Text>
              )}
            </View>

            {/* Botón de registro */}
            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#1A1A1A", "#2D2D2D"]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Crear cuenta</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Botón secundario */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/auth/login" as any)}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#2F6BFF", "#1E4FD8"]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.secondaryButtonText}>Ya tengo cuenta</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer informativo */}
          <View style={styles.footerBox}>
            <View style={styles.footerContent}>
              <Text style={styles.footerTitle}>
                Tu experiencia comienza aquí
              </Text>
              <Text style={styles.footerText}>
                Una vez registrado podrás ver barberías cercanas, reservar
                servicios y dar seguimiento a tus citas.
              </Text>
            </View>
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
  hero: {
    marginTop: 16,
    marginBottom: 24,
    gap: 14,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    marginBottom: 4,
  },
  badgeText: {
    color: "#1F2937",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 38,
    fontWeight: "800",
    lineHeight: 44,
    color: "#111827",
    letterSpacing: -0.5,
  },
  titleAccent: {
    color: "#2F6BFF",
    position: "relative",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
    letterSpacing: -0.2,
    marginTop: 4,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 32,
    padding: 28,
    gap: 8,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  inputFocused: {
    borderColor: "#2F6BFF",
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
    shadowColor: "#2F6BFF",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  hintText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 8,
    marginLeft: 4,
  },
  primaryButton: {
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  gradientButton: {
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  secondaryButton: {
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 14,
    shadowColor: "#2F6BFF",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  footerBox: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 24,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 8,
  },
  footerContent: {
    flex: 1,
  },
  footerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 5,
    letterSpacing: -0.2,
  },
  footerText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
    letterSpacing: -0.2,
  },
});
