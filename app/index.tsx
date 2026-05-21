import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
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

          {/* Badge decorativo */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>BARBER APP PRO</Text>
          </View>

          {/* Sección Hero */}
          <View style={styles.hero}>
            <Text style={styles.title}>
              Reserva tu estilo
              <Text style={styles.titleAccent}> sin límites</Text>
            </Text>
            <Text style={styles.subtitle}>
              Agenda citas, encuentra las mejores barberías y administra tu
              negocio desde una sola app.
            </Text>
          </View>

          {/* Tarjeta de acciones */}
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/auth/login" as any)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#1A1A1A", "#2D2D2D"]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/auth/register-client" as any)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#2F6BFF", "#1E4FD8"]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.secondaryButtonText}>
                  Registrarme como cliente
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => router.push("/auth/register-owner" as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.outlineButtonText}>
                Registrar mi barbería
              </Text>
            </TouchableOpacity>
          </View>

          {/* Características */}
          <View style={styles.featuresRow}>
            <View style={styles.featureBox}>
              <Text style={styles.featureTitle}>Citas rápidas</Text>
              <Text style={styles.featureText}>
                Reserva por fecha, hora y barbero favorito
              </Text>
            </View>

            <View style={styles.featureBox}>
              <Text style={styles.featureTitle}>Control total</Text>
              <Text style={styles.featureText}>
                Administra empleados, ventas y horarios
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
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    marginBottom: 4,
  },
  badgeText: {
    color: "#1A1A1A",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  hero: {
    marginTop: 16,
    marginBottom: 24,
    gap: 14,
  },
  title: {
    fontSize: 44,
    fontWeight: "800",
    lineHeight: 52,
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  titleAccent: {
    color: "#2F6BFF",
    position: "relative",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#5A5A5A",
    letterSpacing: -0.2,
    opacity: 0.85,
    marginTop: 4,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 32,
    padding: 28,
    gap: 14,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  primaryButton: {
    borderRadius: 24,
    overflow: "hidden",
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
    shadowColor: "#2F6BFF",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 24,
    paddingVertical: 17,
    alignItems: "center",
    backgroundColor: "transparent",
    marginTop: 6,
  },
  outlineButtonText: {
    color: "#1A1A1A",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  featuresRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  featureBox: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 24,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    gap: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#6B6B6B",
    letterSpacing: -0.2,
  },
});
