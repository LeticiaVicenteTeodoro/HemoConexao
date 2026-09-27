
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
import { Picker } from "@react-native-picker/picker";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../firebaseConfig";

const API_URL =
  "https://hemo-backend-683937879829.us-central1.run.app";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("");
  const [loading, setLoading] = useState(false);

  const cadastrar = async () => {
    if (!nome || !email || !senha) {
      Alert.alert("Erro", "Preencha nome, email e senha.");
      return;
    }

    try {
      setLoading(true);

      // 1. Cria o usuário no Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        senha
      );

      const user = userCredential.user;

      // 2. Pega o ID Token do Firebase
      const idToken = await user.getIdToken();

      // 3. Salva nome + tipo sanguíneo + UID no backend
      const response = await fetch(
  `${API_URL}/usuario/firebase`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_token: idToken,
      nome: nome,
      tipo_sanguineo: tipo,
    }),
  }
);

      const data = await response.json();

      console.log("RESPOSTA BACKEND:", data);

      if (!response.ok || !data.sucesso) {
        Alert.alert(
          "Erro",
          data.mensagem || "Não foi possível salvar os dados do usuário."
        );
        return;
      }

      // 4. Envia o email de confirmação pelo Firebase
      await sendEmailVerification(user);

      // 5. Vai para a tela de confirmação
      Alert.alert(
        "Cadastro realizado",
        "Enviamos um link de confirmação para seu email."
      );

      router.push({
        pathname: "/confirmar",
        params: {
          email: email.trim(),
        },
      });
    } catch (error) {
      console.log("ERRO FIREBASE/BACKEND:", error);

      let mensagem = "Não foi possível criar a conta.";

      if (error.code === "auth/email-already-in-use") {
        mensagem = "Este email já está cadastrado.";
      } else if (error.code === "auth/invalid-email") {
        mensagem = "Digite um email válido.";
      } else if (error.code === "auth/weak-password") {
        mensagem = "A senha precisa ter pelo menos 6 caracteres.";
      }

      Alert.alert("Erro", mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>

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
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={styles.input}
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={tipo}
          onValueChange={(value) => setTipo(value)}
        >
          <Picker.Item
            label="Tipo sanguíneo (opcional)"
            value=""
          />
          <Picker.Item label="A+" value="A+" />
          <Picker.Item label="A-" value="A-" />
          <Picker.Item label="B+" value="B+" />
          <Picker.Item label="B-" value="B-" />
          <Picker.Item label="AB+" value="AB+" />
          <Picker.Item label="AB-" value="AB-" />
          <Picker.Item label="O+" value="O+" />
          <Picker.Item label="O-" value="O-" />
        </Picker>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={cadastrar}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
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

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
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
