import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

import estadosCidades from "./cidadeseestados.json";
import db, { createTables } from "./registros";

export default function Registrar() {
  const [data, setData] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [tipo, setTipo] = useState("");
  const [obs, setObs] = useState("");

  useEffect(() => {
    createTables();
  }, []);

  const estados = Object.keys(estadosCidades);

  const cidades = estado
    ? estadosCidades[estado]
    : [];

  const salvar = () => {
    if (!data || !estado || !cidade || !tipo) {
      Alert.alert(
        "Erro",
        "Preencha data, estado, cidade e tipo sanguíneo."
      );
      return;
    }

    try {
      db.runSync(
        `
        INSERT INTO doacoes
        (data, local, tipo, observacao)
        VALUES (?, ?, ?, ?)
      `,
        [
          data,
          `${cidade}, ${estado}`,
          tipo,
          obs,
        ]
      );

      Alert.alert(
        "Sucesso",
        "Doação registrada!"
      );

      setData("");
      setEstado("");
      setCidade("");
      setTipo("");
      setObs("");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro ao salvar");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Registrar Doação
      </Text>

      <TextInput
        placeholder="Data (01/06/2026)"
        value={data}
        onChangeText={setData}
        style={styles.input}
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={estado}
          onValueChange={(value) => {
            setEstado(value);
            setCidade("");
          }}
        >
          <Picker.Item
            label="Selecione o Estado"
            value=""
          />

          {estados.map((estado) => (
            <Picker.Item
              key={estado}
              label={estado}
              value={estado}
            />
          ))}
        </Picker>
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={cidade}
          enabled={estado !== ""}
          onValueChange={(value) =>
            setCidade(value)
          }
        >
          <Picker.Item
            label="Selecione a Cidade"
            value=""
          />

          {cidades.map((cidade) => (
            <Picker.Item
              key={cidade}
              label={cidade}
              value={cidade}
            />
          ))}
        </Picker>
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={tipo}
          onValueChange={(value) =>
            setTipo(value)
          }
        >
          <Picker.Item
            label="Selecione o Tipo Sanguíneo"
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

      <TextInput
        placeholder="Observações"
        value={obs}
        onChangeText={setObs}
        style={styles.input}
        multiline
      />

      <TouchableOpacity
        style={styles.button}
        onPress={salvar}
      >
        <Text style={styles.buttonText}>
          Salvar
        </Text>
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
    backgroundColor: "#fff",
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },

  button: {
    backgroundColor: "#E30613",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});