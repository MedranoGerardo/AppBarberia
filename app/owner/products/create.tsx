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
} from "react-native";
import { createProduct } from "../../../src/services/products/create-product";
import { useAuthStore } from "../../../src/store/auth.store";

export default function CreateProductScreen() {
  const { user } = useAuthStore();
  const barbershopId = user?.ownerBarbershopId || "";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [stock, setStock] = useState("");

  const handleCreate = async () => {
    try {
      if (!barbershopId) {
        Alert.alert("Error", "No se encontró la barbería");
        return;
      }

      if (!name.trim() || !price.trim() || !cost.trim() || !stock.trim()) {
        Alert.alert("Error", "Completa nombre, precio, costo y stock");
        return;
      }

      await createProduct({
        barbershopId,
        name,
        description,
        price: Number(price),
        cost: Number(cost),
        stock: Number(stock),
      });

      Alert.alert("Éxito", "Producto creado correctamente");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo crear el producto");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.badge}>NUEVO PRODUCTO</Text>
        <Text style={styles.title}>Crear producto</Text>
        <Text style={styles.subtitle}>
          Agrega productos para vender y controlar inventario.
        </Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Ejemplo: Gel fijador"
          placeholderTextColor="#8A8A8A"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={styles.input}
          placeholder="Descripción del producto"
          placeholderTextColor="#8A8A8A"
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Precio de venta</Text>
        <TextInput
          style={styles.input}
          placeholder="5.00"
          placeholderTextColor="#8A8A8A"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.label}>Costo</Text>
        <TextInput
          style={styles.input}
          placeholder="2.50"
          placeholderTextColor="#8A8A8A"
          keyboardType="numeric"
          value={cost}
          onChangeText={setCost}
        />

        <Text style={styles.label}>Stock inicial</Text>
        <TextInput
          style={styles.input}
          placeholder="20"
          placeholderTextColor="#8A8A8A"
          keyboardType="numeric"
          value={stock}
          onChangeText={setStock}
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleCreate}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Guardar producto</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F5F7" },
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
