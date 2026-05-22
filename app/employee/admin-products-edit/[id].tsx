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
} from "react-native";
import { getProductById } from "../../../src/services/products/get-product-by-id";
import { updateProduct } from "../../../src/services/products/update-product";
import { useAuthStore } from "../../../src/store/auth.store";

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const barbershopId = user?.employeeBarbershopId || "";

  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [stock, setStock] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        if (!barbershopId || !id) {
          Alert.alert("Error", "No se encontró el producto");
          router.back();
          return;
        }

        const product = await getProductById(barbershopId, id);

        if (!product) {
          Alert.alert("Error", "No se encontró el producto");
          router.back();
          return;
        }

        setName(product.name || "");
        setDescription(product.description || "");
        setPrice(String(product.price ?? ""));
        setCost(String(product.cost ?? ""));
        setStock(String(product.stock ?? ""));
        setStatus(product.status || "active");
      } catch (error: any) {
        Alert.alert("Error", error.message || "No se pudo cargar el producto");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [barbershopId, id]);

  const handleUpdate = async () => {
    try {
      if (!barbershopId || !id) return;

      if (!name.trim() || !price.trim() || !cost.trim() || !stock.trim()) {
        Alert.alert("Error", "Completa nombre, precio, costo y stock");
        return;
      }

      await updateProduct({
        barbershopId,
        productId: id,
        name,
        description,
        price: Number(price),
        cost: Number(cost),
        stock: Number(stock),
        status,
      });

      Alert.alert("Éxito", "Producto actualizado correctamente");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo actualizar");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2F6BFF" />
        <Text style={styles.loadingText}>Cargando producto...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.badge}>EDITAR PRODUCTO</Text>
        <Text style={styles.title}>Actualizar producto</Text>
        <Text style={styles.subtitle}>
          Modifica datos, precio, costo, stock y estado.
        </Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Precio</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.label}>Costo</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={cost}
          onChangeText={setCost}
        />

        <Text style={styles.label}>Stock</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={stock}
          onChangeText={setStock}
        />

        <Text style={styles.label}>Estado</Text>

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

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleUpdate}
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
  container: { padding: 24, paddingBottom: 30 },
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
    fontWeight: "900",
    color: "#111111",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#666666",
    marginBottom: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#D9D9D9",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#111111",
    backgroundColor: "#FFFFFF",
  },
  optionButton: {
    borderWidth: 1.5,
    borderColor: "#D9D9D9",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  optionButtonActive: {
    backgroundColor: "#2F6BFF",
    borderColor: "#2F6BFF",
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111111",
  },
  optionButtonTextActive: {
    color: "#FFFFFF",
  },
  primaryButton: {
    backgroundColor: "#111111",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 22,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
