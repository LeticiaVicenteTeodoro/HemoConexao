import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EditProfile() {
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [gender, setGender] = useState("");

  // 📥 CARREGA DADOS SALVOS
  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const data = await AsyncStorage.getItem("user_profile");

      if (data) {
        const parsed = JSON.parse(data);

        setUser(parsed);
        setName(parsed.email?.split("@")[0] || "");
        setBloodType(parsed.tipo_sanguineo || "");
        setGender(parsed.sexo || "");
      }
    } catch (err) {
      console.log("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  }

  // 💾 SALVA ALTERAÇÕES
  async function handleSave() {
    try {
      const updatedUser = {
        ...user,
        email: user?.email,
        tipo_sanguineo: bloodType,
        sexo: gender,
        nome: name,
      };

      await AsyncStorage.setItem(
        "user_profile",
        JSON.stringify(updatedUser)
      );

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      router.back();
    } catch (err) {
      console.log("Erro ao salvar:", err);
      Alert.alert("Erro", "Não foi possível salvar");
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* VOLTAR */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#E30613" />
      </TouchableOpacity>

      <Text style={styles.title}>Editar Perfil</Text>

      {/* NOME */}
      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Digite seu nome"
      />

      {/* TIPO SANGUÍNEO */}
      <Text style={styles.label}>Tipo Sanguíneo</Text>
      <TextInput
        style={styles.input}
        value={bloodType}
        onChangeText={setBloodType}
        placeholder="Ex: O+"
      />

      {/* SEXO */}
      <Text style={styles.label}>Sexo</Text>

      <View style={styles.genderContainer}>
        <TouchableOpacity
          style={[
            styles.genderButton,
            gender === "Feminino" && styles.genderSelected,
          ]}
          onPress={() => setGender("Feminino")}
        >
          <Text
            style={[
              styles.genderText,
              gender === "Feminino" && styles.genderTextSelected,
            ]}
          >
            Feminino
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.genderButton,
            gender === "Masculino" && styles.genderSelected,
          ]}
          onPress={() => setGender("Masculino")}
        >
          <Text
            style={[
              styles.genderText,
              gender === "Masculino" && styles.genderTextSelected,
            ]}
          >
            Masculino
          </Text>
        </TouchableOpacity>
      </View>

      {/* SALVAR */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Salvar Alterações</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ESTILOS */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },

  backButton: {
    alignSelf: "flex-start",
    padding: 8,
    marginTop: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#E30613",
    marginBottom: 30,
    textAlign: "center",
  },

  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },

  genderContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 5,
    marginBottom: 20,
  },

  genderButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    alignItems: "center",
  },

  genderSelected: {
    backgroundColor: "#E30613",
  },

  genderText: {
    color: "#555",
    fontWeight: "600",
  },

  genderTextSelected: {
    color: "#fff",
  },

  saveButton: {
    backgroundColor: "#E30613",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },

  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});