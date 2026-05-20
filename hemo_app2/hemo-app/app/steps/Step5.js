import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import onboardingData from "./onboardingData";
import AsyncStorage from "@react-native-async-storage/async-storage";

const types = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Step5() {
  const finish = async (tipo) => {
    onboardingData.tipo_sanguineo = tipo;

    // Recupera e-mail salvo no login (se existir)
    const savedEmail =
      (await AsyncStorage.getItem("user_email")) ||
      "user@email.com";

    // Perfil completo do usuário
    const payload = {
      email: savedEmail,
      acceptedOnboarding: onboardingData.acceptedOnboarding,
      notifications: onboardingData.notifications,
      sexo: onboardingData.sexo,
      tipo_sanguineo: tipo,
      doacoes: 0,
      ultima_doacao: null,
      cidade: "Poços de Caldas",
    };

    try {
      // =========================
      // 1. SALVA LOCALMENTE (SEMPRE)
      // =========================
      await AsyncStorage.setItem(
        "user_profile",
        JSON.stringify(payload)
      );

      // =========================
      // 2. MARCA ONBOARDING CONCLUÍDO
      // =========================
      await AsyncStorage.setItem("onboarding_done", "true");

      // =========================
      // 3. TENTA ENVIAR AO BACKEND
      // =========================
      try {
        const res = await fetch(
          "http://192.168.1.20:3000/onboarding",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (res.ok) {
          const data = await res.json();
          console.log("RESPOSTA BACKEND:", data);
        }
      } catch (serverError) {
        console.log(
          "Backend indisponível, mas dados salvos localmente:",
          serverError
        );
      }

      // =========================
      // 4. AVISA SUCESSO
      // =========================
      Alert.alert("Sucesso", "Cadastro concluído!");

      // =========================
      // 5. REDIRECIONA PARA HOME
      // =========================
      router.replace("/(tabs)/Home");
    } catch (err) {
      console.log("Erro ao salvar:", err);
      Alert.alert("Erro", "Não foi possível salvar os dados.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Qual seu tipo sanguíneo?
      </Text>

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
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  title: {
    textAlign: "center",
    color: "#E30613",
    marginBottom: 20,
    fontSize: 20,
    fontWeight: "bold",
  },

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

  txt: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});