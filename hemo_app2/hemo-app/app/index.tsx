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
import useGoogleAuth from "./auth/useGoogleAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /**
   * LOGIN TRADICIONAL (temporário)
   */
  const handleLogin = () => {
    // por enquanto sem backend
    router.replace("/Home");
  };

  /**
   * LOGIN COM GOOGLE
   */
  const { promptAsync, loading } = useGoogleAuth(async (user: any) => {
    try {
      console.log("Usuário Google:", user);

      // envia os dados do Google para o backend SQLite
      const response = await fetch(
        "http://192.168.1.20:3000/login-google",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            google_id: user.id,
            email: user.email,
            name: user.name,
            photo: user.picture || null,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        Alert.alert(
          "Login realizado",
          `Bem-vinda, ${user.name}!`
        );

        // salva email para usar no onboarding
        setEmail(user.email);

        // após login, vai para a Home
        router.replace("/Home");
      } else {
        Alert.alert(
          "Erro",
          result.error || "Não foi possível fazer login."
        );
      }
    } catch (error) {
      console.log("Erro no login Google:", error);

      Alert.alert(
        "Erro",
        "Não foi possível conectar ao servidor."
      );
    }
  });

  /**
   * Dispara o login com Google
   */
  const handleGoogleLogin = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.log("Erro ao abrir login Google:", error);

      Alert.alert(
        "Erro",
        "Não foi possível iniciar o login com Google."
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* TÍTULO */}
      <Text style={styles.title}>HemoConexão</Text>
      <Text style={styles.subtitle}>
        Faça login para continuar
      </Text>

      {/* EMAIL */}
      <TextInput
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      {/* SENHA */}
      <TextInput
        placeholder="Senha"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {/* BOTÃO LOGIN NORMAL */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      {/* BOTÃO LOGIN COM GOOGLE */}
      <TouchableOpacity
        style={[
          styles.googleButton,
          loading && styles.disabledButton,
        ]}
        onPress={handleGoogleLogin}
        disabled={loading}
      >
        <Text style={styles.googleButtonText}>
          {loading
            ? "Conectando..."
            : "Entrar com Google"}
        </Text>
      </TouchableOpacity>

      {/* TEXTO EXTRA */}
      <Text style={styles.footerText}>
        Doe sangue, salve vidas ❤️
      </Text>
    </View>
  );
}

/* ================= STYLES ================= */

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
    marginBottom: 5,
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
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  googleButton: {
    backgroundColor: "#4285F4",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },

  googleButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  disabledButton: {
    opacity: 0.7,
  },

  footerText: {
    textAlign: "center",
    marginTop: 20,
    color: "#777",
    fontSize: 12,
  },
});