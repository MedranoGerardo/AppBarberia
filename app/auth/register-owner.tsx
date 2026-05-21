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
import { registerOwner } from "../../src/services/auth/register-owner";

export default function RegisterOwnerScreen() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState<
    "barbershop" | "salon" | "both"
  >("barbershop");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [zone, setZone] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const handleRegister = async () => {
    if (!fullName.trim() || !phone.trim() || !email.trim() || !password) {
      Alert.alert(
        "Campos incompletos",
        "Por favor, completa todos los campos personales",
      );
      return;
    }

    if (
      !businessName.trim() ||
      !description.trim() ||
      !address.trim() ||
      !zone.trim()
    ) {
      Alert.alert(
        "Campos incompletos",
        "Por favor, completa todos los datos del negocio",
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Contraseña débil",
        "La contraseña debe tener al menos 6 caracteres",
      );
      return;
    }

    if (!lat || !lng) {
      Alert.alert(
        "Ubicación requerida",
        "Por favor, ingresa la latitud y longitud del negocio",
      );
      return;
    }

    setIsLoading(true);
    try {
      await registerOwner({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
        businessName: businessName.trim(),
        businessType,
        description: description.trim(),
        address: address.trim(),
        zone: zone.trim(),
        lat: Number(lat),
        lng: Number(lng),
      });

      Alert.alert(
        "¡Registro exitoso!",
        "Tu negocio ha sido registrado correctamente",
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
              <Text style={styles.badgeText}>REGISTRO DE DUEÑO</Text>
            </View>
            <Text style={styles.title}>
              Registra tu negocio{"\n"}
              <Text style={styles.titleAccent}>y toma el control</Text>
            </Text>
            <Text style={styles.subtitle}>
              Crea tu barbería o peluquería, administra horarios, empleados,
              servicios, productos y reservas desde una sola plataforma.
            </Text>
          </View>

          {/* Tarjeta de registro */}
          <View style={styles.card}>
            {/* Datos personales */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Datos personales</Text>
            </View>

            <View style={styles.divider} />

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

            {/* Datos del negocio */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Datos del negocio</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre del negocio</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === "businessName" && styles.inputFocused,
                ]}
                placeholder="Barber Pro"
                placeholderTextColor="#9CA3AF"
                value={businessName}
                onChangeText={setBusinessName}
                onFocus={() => setFocusedField("businessName")}
                onBlur={() => setFocusedField(null)}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tipo de negocio</Text>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    businessType === "barbershop" && styles.typeButtonActive,
                  ]}
                  onPress={() => setBusinessType("barbershop")}
                  activeOpacity={0.85}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      businessType === "barbershop" &&
                        styles.typeButtonTextActive,
                    ]}
                  >
                    Barbería
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    businessType === "salon" && styles.typeButtonActive,
                  ]}
                  onPress={() => setBusinessType("salon")}
                  activeOpacity={0.85}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      businessType === "salon" && styles.typeButtonTextActive,
                    ]}
                  >
                    Peluquería
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    businessType === "both" && styles.typeButtonActive,
                  ]}
                  onPress={() => setBusinessType("both")}
                  activeOpacity={0.85}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      businessType === "both" && styles.typeButtonTextActive,
                    ]}
                  >
                    Ambos
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe brevemente tu negocio, servicios y lo que ofreces..."
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                onFocus={() => setFocusedField("description")}
                onBlur={() => setFocusedField(null)}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Dirección</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === "address" && styles.inputFocused,
                ]}
                placeholder="Colonia, calle, número, referencia"
                placeholderTextColor="#9CA3AF"
                value={address}
                onChangeText={setAddress}
                onFocus={() => setFocusedField("address")}
                onBlur={() => setFocusedField(null)}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Zona</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === "zone" && styles.inputFocused,
                ]}
                placeholder="San Miguel Centro"
                placeholderTextColor="#9CA3AF"
                value={zone}
                onChangeText={setZone}
                onFocus={() => setFocusedField("zone")}
                onBlur={() => setFocusedField(null)}
                editable={!isLoading}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputContainer, styles.halfInput]}>
                <Text style={styles.label}>Latitud</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === "lat" && styles.inputFocused,
                  ]}
                  placeholder="13.4833"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={lat}
                  onChangeText={setLat}
                  onFocus={() => setFocusedField("lat")}
                  onBlur={() => setFocusedField(null)}
                  editable={!isLoading}
                />
              </View>

              <View style={[styles.inputContainer, styles.halfInput]}>
                <Text style={styles.label}>Longitud</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === "lng" && styles.inputFocused,
                  ]}
                  placeholder="-88.1833"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={lng}
                  onChangeText={setLng}
                  onFocus={() => setFocusedField("lng")}
                  onBlur={() => setFocusedField(null)}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Botones */}
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
                  <Text style={styles.primaryButtonText}>
                    Registrar negocio
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

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
                Tu negocio, en una sola app
              </Text>
              <Text style={styles.footerText}>
                Una vez registrado podrás gestionar citas, empleados, servicios,
                ventas y reportes desde tu panel de administración.
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
  sectionHeader: {
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
  },
  divider: {
    height: 2,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
    marginTop: 4,
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
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  hintText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 8,
    marginLeft: 4,
  },
  typeRow: {
    flexDirection: "row",
    gap: 10,
  },
  typeButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  typeButtonActive: {
    backgroundColor: "#2F6BFF",
    borderColor: "#2F6BFF",
  },
  typeButtonText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 13,
  },
  typeButtonTextActive: {
    color: "#FFFFFF",
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
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
