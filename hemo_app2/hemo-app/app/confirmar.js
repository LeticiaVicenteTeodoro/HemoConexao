import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

const API_URL = "http://192.168.1.20:8000";

export default function Confirmar() {
  const { email } = useLocalSearchParams();

  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);

  const confirmar = async () => {
    if (!codigo) {
      Alert.alert("Erro", "Digite o código de confirmação.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/confirmar?email=${encodeURIComponent(
          email
        )}&token=${encodeURIComponent(codigo)}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!data.sucesso) {
        Alert.alert("Erro", data.mensagem || "Token inválido.");
        return;
      }

      Alert.alert("Sucesso", "Email confirmado com sucesso!");

      router.replace("/");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirmar Email</Text>

      <Text style={styles.subtitle}>
        Digite o código enviado para:
      </Text>

      <Text style={styles.email}>{email}</Text>

      <TextInput
        placeholder="Código de confirmação"
        value={codigo}
        onChangeText={setCodigo}
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={confirmar}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Confirmando..." : "Confirmar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace("/")}>
        <Text style={styles.link}>Voltar para login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#E30613",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    textAlign: "center",
    color: "#555",
  },

  email: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#E30613",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#E30613",
    fontWeight: "bold",
  },
});