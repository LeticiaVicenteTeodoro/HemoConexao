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

const API_URL = "http://192.168.1.20:8000";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("");
  const [loading, setLoading] = useState(false);

  const cadastrar = async () => {
    if (!nome || !email || !senha) {
      Alert.alert(
        "Erro",
        "Preencha nome, email e senha."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/cadastro?nome=${encodeURIComponent(
          nome
        )}&email=${encodeURIComponent(
          email
        )}&senha=${encodeURIComponent(
          senha
        )}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!data.sucesso) {
        Alert.alert(
          "Erro",
          data.mensagem
        );
        return;
      }

      Alert.alert(
        "Sucesso",
        "Cadastro realizado!"
      );

      router.replace("/");
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Erro",
        "Não foi possível conectar ao servidor."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Criar Conta
      </Text>

      <TextInput
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
        style={styles.input}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={styles.input}
      />

      <TextInput
        placeholder="Tipo sanguíneo (opcional)"
        value={tipo}
        onChangeText={setTipo}
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={cadastrar}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading
            ? "Cadastrando..."
            : "Cadastrar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          router.back()
        }
      >
        <Text style={styles.link}>
          Já possui conta? Entrar
        </Text>
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
    marginBottom: 25,
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