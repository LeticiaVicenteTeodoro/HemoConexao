
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.20:8000";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha email e senha.");
      return;
    }

    try {
      setLoading(true);

      const url = `${API_URL}/login?email=${encodeURIComponent(
        email
      )}&senha=${encodeURIComponent(password)}`;

      console.log("TENTANDO CONECTAR:", url);

      const response = await fetch(url, {
        method: "POST",
      });

      console.log("STATUS:", response.status);

      const data = await response.json();

      if (!data.sucesso) {
        Alert.alert("Erro", "Email ou senha inválidos.");
        return;
      }

      await AsyncStorage.setItem(
        "usuario",
        JSON.stringify({
          id: data.id,
          nome: data.nome,
          email: data.email,
        })
      );

      Alert.alert("Sucesso", `Bem-vindo(a), ${data.nome}!`);

      router.replace("/Home");
    } catch (error) {
      console.log("ERRO LOGIN:", error);

      Alert.alert(
        "Erro de conexão",
        `Não foi possível conectar ao servidor.\n\n${String(error)}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HemoConexão</Text>

      <Text style={styles.subtitle}>
        Faça login para continuar
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Entrando..." : "Entrar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/cadastro")}>
        <Text style={styles.link}>
          Não possui conta? Cadastre-se
        </Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Doe sangue, salve vidas ❤️
      </Text>
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
  },

  subtitle: {
    textAlign: "center",
    marginBottom: 30,
    color: "#555",
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

  footerText: {
    textAlign: "center",
    marginTop: 20,
    color: "#777",
  },
});

