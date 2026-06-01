import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";

import db, { createTables } from "./registros";

export default function Registrar() {
  const [data, setData] = useState("");
  const [local, setLocal] = useState("");
  const [tipo, setTipo] = useState("");
  const [obs, setObs] = useState("");

  useEffect(() => {
    createTables();
  }, []);

  const salvar = () => {
    if (!data || !local) {
      Alert.alert("Erro", "Preencha data e local.");
      return;
    }

    try {
      db.runSync(
        `
        INSERT INTO doacoes (data, local, tipo, observacao)
        VALUES (?, ?, ?, ?)
      `,
        [data, local, tipo, obs]
      );

      Alert.alert("Sucesso", "Doação registrada!");

      setData("");
      setLocal("");
      setTipo("");
      setObs("");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro ao salvar");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Doação</Text>

      <TextInput
        placeholder="Data (01/06/2026)"
        value={data}
        onChangeText={setData}
        style={styles.input}
      />

      <TextInput
        placeholder="Local"
        value={local}
        onChangeText={setLocal}
        style={styles.input}
      />

      <TextInput
        placeholder="Tipo sanguíneo"
        value={tipo}
        onChangeText={setTipo}
        style={styles.input}
      />

      <TextInput
        placeholder="Observações"
        value={obs}
        onChangeText={setObs}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={salvar}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#E30613",
    padding: 15,
    borderRadius: 10,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});