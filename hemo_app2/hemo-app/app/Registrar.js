import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";

import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

import estadosCidades from "./cidadeseestados.json";

const API_URL = "http://192.168.1.20:8000";

function obterSelo(total) {
  if (total >= 100) return "❤️ Herói da Vida";
  if (total >= 75) return "💎 Lenda Solidária";
  if (total >= 50) return "🥇 Doador Ouro";
  if (total >= 35) return "🏆 Doador Experiente";
  if (total >= 25) return "🥈 Doador Prata";
  if (total >= 15) return "⭐ Doador Frequente";
  if (total >= 5) return "🥉 Doador Iniciante";

  return "🌱 Primeira Doação";
}

function formatarData(data) {
  return data.toLocaleDateString("pt-BR");
}

export default function Registrar() {
  const navigation = useNavigation();

  const [data, setData] = useState(null);
  const [mostrarData, setMostrarData] = useState(false);
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [tipo, setTipo] = useState("");
  const [obs, setObs] = useState("");

  const estados = Object.keys(estadosCidades);
  const cidades = estado
    ? estadosCidades[estado]
    : [];

  const salvar = async () => {


    if (
  !data ||
  !estado ||
  !cidade ||
  !tipo
) {
  Alert.alert(
    "Erro",
    "Preencha data, estado, cidade e tipo sanguíneo."
  );
  return;
}

const dataFormatada = formatarData(data);

    try {
      const usuarioSalvo =
        await AsyncStorage.getItem(
          "usuario"
        );

      if (!usuarioSalvo) {
        Alert.alert(
          "Erro",
          "Usuário não encontrado."
        );
        return;
      }

      const usuario =
        JSON.parse(usuarioSalvo);

      const response = await fetch(
        `${API_URL}/doacao?usuario_id=${usuario.id}&data=${encodeURIComponent(
          dataFormatada
        )}&local=${encodeURIComponent(
          `${cidade}, ${estado}`
        )}&tipo=${encodeURIComponent(
          tipo
        )}&observacao=${encodeURIComponent(
          obs
        )}`,
        {
          method: "POST",
        }
      );

      const resultado =
        await response.json();

      if (!resultado.sucesso) {
        Alert.alert(
          "Erro",
          "Falha ao registrar doação."
        );
        return;
      }

    Alert.alert(
      "Sucesso",
      "Doação registrada!"
    );

    const historicoResponse = await fetch(
      `${API_URL}/historico/${usuario.id}`
    );

    const historico = await historicoResponse.json();

    const total = historico.length;
    const selo = obterSelo(total);

    router.push({
      pathname: "./CompartilharDoacao",
      params: {
        data: dataFormatada,
        local: `${cidade}, ${estado}`,
        tipo: tipo,
        total: total,
        selo: selo,
      },
    });

    setData(null);
    setEstado("");
    setCidade("");
    setTipo("");
    setObs("");

    } catch (error) {
      console.log(error);

      Alert.alert(
        "Erro",
        "Não foi possível conectar ao servidor."
      );
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() =>
          navigation.goBack()
        }
        style={styles.backButton}
      >
        <Text style={styles.backText}>
          ←
        </Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        Registrar Doação
      </Text>

      <TouchableOpacity
  style={styles.input}
  onPress={() => setMostrarData(true)}
>
  <Text
    style={
      data
        ? styles.dateText
        : styles.placeholderText
    }
  >
    {data
      ? `📅 ${formatarData(data)}`
      : "📅 Toque para selecionar a data"}
  </Text>
</TouchableOpacity>

      {mostrarData && (
        <DateTimePicker
          value={data || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setMostrarData(false);

            if (selectedDate) {
              setData(selectedDate);
            }
          }}
        />
      )}

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

          <Picker.Item
            label="A+"
            value="A+"
          />
          <Picker.Item
            label="A-"
            value="A-"
          />
          <Picker.Item
            label="B+"
            value="B+"
          />
          <Picker.Item
            label="B-"
            value="B-"
          />
          <Picker.Item
            label="AB+"
            value="AB+"
          />
          <Picker.Item
            label="AB-"
            value="AB-"
          />
          <Picker.Item
            label="O+"
            value="O+"
          />
          <Picker.Item
            label="O-"
            value="O-"
          />
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

  backButton: {
    alignSelf: "flex-start",
    marginBottom: 10,
  },

  backText: {
    color: "#E30613",
    fontSize: 28,
    fontWeight: "bold",
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
dateText: {
  color: "#333",
},

placeholderText: {
  color: "#aaa",
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