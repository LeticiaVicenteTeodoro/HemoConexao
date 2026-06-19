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
    try {
      onboardingData.tipo_sanguineo = tipo;

      const usuarioSalvo = await AsyncStorage.getItem("usuario");

      const usuario = usuarioSalvo
        ? JSON.parse(usuarioSalvo)
        : {};

      const usuarioAtualizado = {
        ...usuario,
        acceptedOnboarding: onboardingData.acceptedOnboarding,
        notifications: onboardingData.notifications,
        sexo: onboardingData.sexo,
        tipo_sanguineo: tipo,
        cidade: "Poços de Caldas",
      };

      await AsyncStorage.setItem(
        "usuario",
        JSON.stringify(usuarioAtualizado)
      );

      await AsyncStorage.setItem("onboarding_done", "true");
      await AsyncStorage.setItem("welcome_popup_shown", "true");

      Alert.alert("Sucesso", "Cadastro concluído!");

      router.replace("/Home");
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