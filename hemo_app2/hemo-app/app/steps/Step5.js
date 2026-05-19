import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import onboardingData from "./onboardingData";
import AsyncStorage from "@react-native-async-storage/async-storage";

const types = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Step5() {
  const finish = async (tipo) => {
    onboardingData.tipo_sanguineo = tipo;

    const payload = {
      email: "user@email.com", // depois vem do Google Auth
      acceptedOnboarding: onboardingData.acceptedOnboarding,
      notifications: onboardingData.notifications,
      sexo: onboardingData.sexo,
      tipo_sanguineo: tipo,
      doacoes: 0,
      ultima_doacao: null,
      cidade: "Poços de Caldas",
    };

    try {
      const res = await fetch("http://192.168.1.20:3000/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      console.log("RESPOSTA BACKEND:", data);

      if (data.success) {
        // ✔ salva estado de onboarding
        await AsyncStorage.setItem("onboarding_done", "true");

        // ✔ SALVA PERFIL COMPLETO LOCALMENTE (ESSENCIAL)
        await AsyncStorage.setItem(
          "user_profile",
          JSON.stringify(payload)
        );

        Alert.alert("Sucesso", "Cadastro concluído!");

        router.replace("/(tabs)/Home");
      } else {
        Alert.alert("Erro", "Não foi possível salvar os dados");
      }
    } catch (err) {
      console.log("Erro ao salvar:", err);
      Alert.alert("Erro", "Falha na conexão com servidor");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Qual seu tipo sanguíneo?</Text>

      <View style={styles.grid}>
        {types.map((t) => (
          <TouchableOpacity
            key={t}
            style={styles.btn}
            onPress={() => finish(t)}
          >
            <Text style={styles.txt}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { textAlign: "center", color: "#E30613", marginBottom: 20 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  btn: {
    width: "48%",
    backgroundColor: "#E30613",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  txt: { color: "#fff", fontWeight: "bold" },
});