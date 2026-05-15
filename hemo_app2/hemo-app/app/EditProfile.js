import React, { useState } from "react";
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

export default function EditProfile() {
  const [name, setName] = useState("Letícia");
  const [bloodType, setBloodType] = useState("O+");
  const [gender, setGender] = useState("Feminino");

  function handleSave() {
    Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    router.back();
  }

  return (
    <View style={styles.container}>
      
      {/* SETA VOLTAR */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color="#E30613" />
      </TouchableOpacity>

      <Text style={styles.title}>Editar Perfil</Text>

      {/* Nome */}
      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Digite seu nome"
      />

      {/* Tipo Sanguíneo */}
      <Text style={styles.label}>Tipo Sanguíneo</Text>
      <TextInput
        style={styles.input}
        value={bloodType}
        onChangeText={setBloodType}
        placeholder="Ex: O+"
      />

      {/* Sexo */}
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

      {/* BOTÃO SALVAR */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Salvar Alterações</Text>
      </TouchableOpacity>
    </View>
  );
}

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