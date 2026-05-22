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
import { login } from "../../src/services/auth/login";
import { getCurrentUser } from "../../src/services/user/get-current-user";
import { useAuthStore } from "../../src/store/auth.store";

export default function LoginScreen() {
  const handleBack = () => {
    router.replace("/" as any);
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser, setLoading } = useAuthStore();

  const handleLogin = async () => {
    try {
      setLoading(true);

      const firebaseUser = await login(email.trim(), password);
      const appUser = await getCurrentUser(firebaseUser.uid);

      if (!appUser) {
        Alert.alert(
          "Error",
          "No se encontró el perfil del usuario en Firestore",
        );
        setLoading(false);
        return;
      }

      setUser(appUser);
      setLoading(false);

      if (appUser.role === "owner" || appUser.role === "admin") {
        router.replace("/owner/dashboard" as any);
        return;
      }

      if (appUser.role === "employee") {
        if (appUser.isAdmin) {
          router.replace("/employee/admin" as any);
        } else {
          router.replace("/employee/panel" as any);
        }
        return;
      }

      router.replace("/client/home" as any);

      router.replace("/client/home" as any);
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Error", error.message || "No se pudo iniciar sesión");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Espaciado superior extra */}
        <View style={styles.topSpacer} />

        <View style={styles.container}>
          <TouchableOpacity onPress={handleBack} activeOpacity={0.8}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>

          <View style={styles.hero}>
            <Text style={styles.badge}>ACCESO</Text>
            <Text style={styles.title}>
              Inicia sesión{"\n"}
              <Text style={styles.titleAccent}>en tu cuenta</Text>
            </Text>
            <Text style={styles.subtitle}>
              Accede a tus citas, barberías, empleados y configuración desde un
              solo lugar.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#8A8A8A"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor="#8A8A8A"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleLogin}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/auth/register-client" as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryButtonText}>
                Crear cuenta de cliente
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() =>
                Alert.alert("Próximamente", "Aquí irá recuperar contraseña")
              }
              activeOpacity={0.8}
            >
              <Text style={styles.linkButtonText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerBox}>
            <Text style={styles.footerTitle}>Acceso seguro</Text>
            <Text style={styles.footerText}>
              Tu información y tus reservas estarán protegidas con autenticación
              de Firebase.
            </Text>
          </View>
        </View>

        {/* Espaciado inferior extra */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  scrollContent: {
    flexGrow: 1,
  },
  topSpacer: {
    height: 40, // Aumentado de 20 a 40
  },
  bottomSpacer: {
    height: 50, // Aumentado de 30 a 50
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
    marginBottom: 20, // Aumentado de 12 a 20
  },
  hero: {
    marginTop: 20, // Aumentado de 12 a 20
    marginBottom: 32, // Aumentado de 22 a 32
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
    marginBottom: 24, // Aumentado de 18 a 24
  },
  title: {
    fontSize: 38,
    fontWeight: "800",
    lineHeight: 44,
    color: "#111111",
    marginBottom: 18, // Aumentado de 14 a 18
  },
  titleAccent: {
    color: "#2F6BFF",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#5B5B5B",
    maxWidth: 340,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    marginBottom: 32, // Aumentado de 22 a 32
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 8,
    marginTop: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#D9D9D9",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    color: "#111111",
    marginBottom: 12,
    backgroundColor: "#FAFAFA",
  },
  primaryButton: {
    backgroundColor: "#111111",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#2F6BFF",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  linkButton: {
    alignItems: "center",
    marginTop: 20, // Aumentado de 16 a 20
  },
  linkButtonText: {
    color: "#2F6BFF",
    fontSize: 14,
    fontWeight: "600",
  },
  footerBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  footerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 6,
  },
  footerText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#666666",
  },
});
