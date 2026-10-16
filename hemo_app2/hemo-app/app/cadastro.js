
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
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [tipo, setTipo] = useState("");
  const [loading, setLoading] = useState(false);

  const cadastrar = async () => {
    if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          senha
        );

      const user = userCredential.user;
      const idToken = await user.getIdToken();

      const response = await fetch(
        `${API_URL}/usuario/firebase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_token: idToken,
            nome: nome.trim(),
            tipo_sanguineo: tipo,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        Alert.alert(
          "Erro",
          data.mensagem ||
            "Não foi possível salvar os dados do usuário."
        );
        return;
      }

      await sendEmailVerification(user);

      Alert.alert(
        "Cadastro realizado",
        "Enviamos um link de confirmação para seu e-mail."
      );

      router.push({
        pathname: "/confirmar",
        params: { email: email.trim() },
      });
    } catch (error) {
      console.log("ERRO FIREBASE/BACKEND:", error);

      let mensagem = "Não foi possível criar a conta.";

      if (error.code === "auth/email-already-in-use") {
        mensagem = "Este e-mail já está cadastrado.";
      } else if (error.code === "auth/invalid-email") {
        mensagem = "Digite um e-mail válido.";
      } else if (error.code === "auth/weak-password") {
        mensagem = "A senha precisa ter pelo menos 6 caracteres.";
      } else if (error.code === "auth/network-request-failed") {
        mensagem = "Verifique sua conexão com a internet.";
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
        placeholderTextColor="#777"
        value={nome}
        onChangeText={setNome}
        style={styles.input}
        selectionColor="#E30613"
      />

      <TextInput
        placeholder="E-mail"
        placeholderTextColor="#777"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        style={styles.input}
        selectionColor="#E30613"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Senha"
          placeholderTextColor="#777"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry={!mostrarSenha}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.passwordInput}
          selectionColor="#E30613"
        />

        <TouchableOpacity
          onPress={() => setMostrarSenha(!mostrarSenha)}
          style={styles.eyeButton}
          accessibilityRole="button"
          accessibilityLabel={
            mostrarSenha ? "Ocultar senha" : "Mostrar senha"
          }
        >
          <Text style={styles.eyeText}>
            {mostrarSenha ? "Ocultar" : "Mostrar"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Confirmar senha"
          placeholderTextColor="#777"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry={!mostrarConfirmacao}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.passwordInput}
          selectionColor="#E30613"
        />

        <TouchableOpacity
          onPress={() =>
            setMostrarConfirmacao(!mostrarConfirmacao)
          }
          style={styles.eyeButton}
          accessibilityRole="button"
          accessibilityLabel={
            mostrarConfirmacao
              ? "Ocultar confirmação da senha"
              : "Mostrar confirmação da senha"
          }
        >
          <Text style={styles.eyeText}>
            {mostrarConfirmacao ? "Ocultar" : "Mostrar"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={tipo}
          onValueChange={(value) => setTipo(value)}
          style={styles.picker}
          dropdownIconColor="#222"
        >
          <Picker.Item
            label="Tipo sanguíneo (opcional)"
            value=""
            color="#555"
          />
          <Picker.Item label="A+" value="A+" color="#222" />
          <Picker.Item label="A-" value="A-" color="#222" />
          <Picker.Item label="B+" value="B+" color="#222" />
          <Picker.Item label="B-" value="B-" color="#222" />
          <Picker.Item label="AB+" value="AB+" color="#222" />
          <Picker.Item label="AB-" value="AB-" color="#222" />
          <Picker.Item label="O+" value="O+" color="#222" />
          <Picker.Item label="O-" value="O-" color="#222" />
        </Picker>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={cadastrar}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Já possui conta? Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#E30613",
    textAlign: "center",
    marginBottom: 25,
  },
  input: {
    backgroundColor: "#FFFFFF",
    color: "#222222",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    color: "#222222",
    backgroundColor: "#FFFFFF",
    padding: 12,
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  eyeText: {
    color: "#E30613",
    fontWeight: "bold",
    fontSize: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  picker: {
    color: "#222222",
    backgroundColor: "#FFFFFF",
  },
  button: {
    backgroundColor: "#E30613",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#E30613",
    fontWeight: "bold",
  },
});
