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
import { createService } from "../../src/services/services/create-service";
import { useAuthStore } from "../../src/store/auth.store";

export default function CreateServiceScreen() {
  const { user } = useAuthStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");

  const handleCreateService = async () => {
    try {
      if (!user?.employeeBarbershopId) {
        Alert.alert("Error", "No se encontró la barbería del dueño");
        return;
      }

      if (
        !name.trim() ||
        !description.trim() ||
        !price.trim() ||
        !durationMinutes.trim()
      ) {
        Alert.alert("Error", "Completa todos los campos");
        return;
      }

      await createService({
        barbershopId: user.employeeBarbershopId,
        name,
        description,
        price: Number(price),
        durationMinutes: Number(durationMinutes),
      });

      Alert.alert("Éxito", "Servicio creado correctamente");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo crear el servicio");
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
            <Text style={styles.badgeText}>SERVICIOS</Text>
          </View>

          <Text style={styles.title}>
            Crear nuevo{"\n"}
            <Text style={styles.titleAccent}>servicio</Text>
          </Text>

          <Text style={styles.subtitle}>
            Agrega los servicios que ofrecerá tu barbería para que los clientes
            puedan reservarlos.
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Nombre del servicio</Text>
            <TextInput
              style={styles.input}
              placeholder="Ejemplo: Corte clásico"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe el servicio"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.label}>Precio</Text>
            <TextInput
              style={styles.input}
              placeholder="Ejemplo: 5"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />

            <Text style={styles.label}>Duración en minutos</Text>
            <TextInput
              style={styles.input}
              placeholder="Ejemplo: 45"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={durationMinutes}
              onChangeText={setDurationMinutes}
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleCreateService}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#1A1A1A", "#2D2D2D"]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.primaryButtonText}>Guardar servicio</Text>
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
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
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
