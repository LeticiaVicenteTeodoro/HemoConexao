
import { useState, useEffect } from "react";
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
import { auth } from "../firebaseConfig";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { agendarNotificacaoProximaDoacao } from "./notificacoes";

import estadosCidades from "./cidadeseestados.json";

const API_URL =
  "https://hemo-backend-683937879829.us-central1.run.app";

function obterSelo(total) {
  if (total >= 25) return "❤️ Herói da Vida";
  if (total >= 20) return "💎 Lenda Solidária";
  if (total >= 15) return "🥇 Doador Ouro";
  if (total >= 10) return "🏆 Doador Experiente";
  if (total >= 5) return "🥈 Doador Prata";
  if (total >= 3) return "⭐ Doador Frequente";

  return "🌱 Primeira Doação";
}

function formatarData(data) {
  return data.toLocaleDateString("pt-BR");
}

const buscarUsuario = async () => {
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  const response = await fetch(
    `${API_URL}/usuario/firebase/${user.uid}`
  );

  const usuario = await response.json();

  if (!response.ok || !usuario.sucesso) {
    return null;
  }

  return usuario;
};

export default function Registrar() {
  const navigation = useNavigation();

  const [data, setData] = useState(null);
  const [mostrarData, setMostrarData] = useState(false);
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [tipo, setTipo] = useState("");
  const [obs, setObs] = useState("");
  const [bloqueado, setBloqueado] = useState(false);
  const [diasRestantes, setDiasRestantes] = useState(0);

  const estados = Object.keys(estadosCidades);
  const cidades = estado ? estadosCidades[estado] : [];

  const verificarDoacao = async () => {
    try {
      const usuario = await buscarUsuario();

      if (!usuario) {
        console.log("Usuário Firebase não encontrado.");
        return;
      }

      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        console.log("Usuário Firebase não autenticado.");
        return;
      }

      const response = await fetch(
        `${API_URL}/historico/firebase/${firebaseUser.uid}`
      );

      const historico = await response.json();

      if (!historico || historico.length === 0) {
        return;
      }

      const ultimaDoacao = historico[0];
      const partes = ultimaDoacao.data.split("/");

      const dataUltima = new Date(
        Number(partes[2]),
        Number(partes[1]) - 1,
        Number(partes[0])
      );

      const intervalo = 90;
      const proximaDoacao = new Date(dataUltima);

      proximaDoacao.setDate(
        proximaDoacao.getDate() + intervalo
      );

      const hoje = new Date();
      const diferenca =
        proximaDoacao.getTime() - hoje.getTime();

      const dias = Math.ceil(
        diferenca / (1000 * 60 * 60 * 24)
      );

      if (dias > 0) {
        setBloqueado(true);
        setDiasRestantes(dias);
      }
    } catch (error) {
      console.log("Erro ao verificar doação:", error);
    }
  };

  useEffect(() => {
    verificarDoacao();
  }, []);

  const salvar = async () => {
    if (!data || !estado || !cidade || !tipo) {
      Alert.alert(
        "Erro",
        "Preencha data, estado, cidade e tipo sanguíneo."
      );
      return;
    }

    const dataFormatada = formatarData(data);

    try {
      const usuario = await buscarUsuario();

      if (!usuario) {
        Alert.alert("Erro", "Usuário não encontrado.");
        return;
      }

      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        Alert.alert(
          "Erro",
          "Usuário não está autenticado."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/doacao/firebase/${firebaseUser.uid}?data=${encodeURIComponent(
          dataFormatada
        )}&local=${encodeURIComponent(
          `${cidade}, ${estado}`
        )}&tipo=${encodeURIComponent(
          tipo
        )}&observacao=${encodeURIComponent(obs)}`,
        {
          method: "POST",
        }
      );

      const resultado = await response.json();

      if (!response.ok || !resultado.sucesso) {
        Alert.alert(
          "Erro",
          resultado.mensagem ||
            "Falha ao registrar doação."
        );
        return;
      }

      Alert.alert("Sucesso", "Doação registrada!");

      await agendarNotificacaoProximaDoacao(
        data,
        usuario?.sexo
      );

      const historicoResponse = await fetch(
        `${API_URL}/historico/firebase/${firebaseUser.uid}`
      );

      const historico = await historicoResponse.json();

      const total = historico.length;
      const selo = obterSelo(total);

      router.push({
        pathname: "./CompartilharDoacao",
        params: {
          data: dataFormatada,
          local: `${cidade}, ${estado}`,
          tipo,
          total,
          selo,
        },
      });

      setData(null);
      setEstado("");
      setCidade("");
      setTipo("");
      setObs("");
    } catch (error) {
      console.log("Erro ao salvar doação:", error);

      Alert.alert(
        "Erro",
        "Não foi possível conectar ao servidor."
      );
    }
  };

  if (bloqueado) {
    return (
      <View style={styles.bloqueadoContainer}>
        <Text style={styles.bloqueadoIcon}>🩸</Text>

        <Text style={styles.bloqueadoTitulo}>
          Ainda não está na hora
        </Text>

        <Text style={styles.bloqueadoTexto}>
          Você ainda precisa aguardar{" "}
          <Text style={styles.destaque}>
            {diasRestantes} dias
          </Text>{" "}
          para registrar uma nova doação.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>
            Voltar para a Home
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        Registrar Doação
      </Text>

      <TouchableOpacity
        style={styles.input}
        onPress={() => setMostrarData(true)}
        activeOpacity={0.7}
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
          display={
            Platform.OS === "ios" ? "spinner" : "default"
          }
          onChange={(event, selectedDate) => {
            setMostrarData(false);

            if (
              event.type !== "dismissed" &&
              selectedDate
            ) {
              setData(selectedDate);
            }
          }}
        />
      )}

      {/* Estado */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={estado}
          onValueChange={(value) => {
            setEstado(value);
            setCidade("");
          }}
          style={styles.picker}
          dropdownIconColor="#222222"
        >
          <Picker.Item
            label="Selecione o Estado"
            value=""
            color="#777777"
          />

          {estados.map((itemEstado) => (
            <Picker.Item
              key={itemEstado}
              label={itemEstado}
              value={itemEstado}
              color="#222222"
            />
          ))}
        </Picker>
      </View>

      {/* Cidade */}
      <View
        style={[
          styles.pickerContainer,
          !estado && styles.pickerDisabled,
        ]}
      >
        <Picker
          selectedValue={cidade}
          enabled={estado !== ""}
          onValueChange={(value) => setCidade(value)}
          style={styles.picker}
          dropdownIconColor="#222222"
        >
          <Picker.Item
            label="Selecione a Cidade"
            value=""
            color="#777777"
          />

          {cidades.map((itemCidade) => (
            <Picker.Item
              key={itemCidade}
              label={itemCidade}
              value={itemCidade}
              color="#222222"
            />
          ))}
        </Picker>
      </View>

      {/* Tipo sanguíneo */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={tipo}
          onValueChange={(value) => setTipo(value)}
          style={styles.picker}
          dropdownIconColor="#222222"
        >
          <Picker.Item
            label="Selecione o Tipo Sanguíneo"
            value=""
            color="#777777"
          />

          <Picker.Item label="A+" value="A+" color="#222222" />
          <Picker.Item label="A-" value="A-" color="#222222" />
          <Picker.Item label="B+" value="B+" color="#222222" />
          <Picker.Item label="B-" value="B-" color="#222222" />
          <Picker.Item label="AB+" value="AB+" color="#222222" />
          <Picker.Item label="AB-" value="AB-" color="#222222" />
          <Picker.Item label="O+" value="O+" color="#222222" />
          <Picker.Item label="O-" value="O-" color="#222222" />
        </Picker>
      </View>

      {/* Observações */}
      <TextInput
        placeholder="Observações"
        placeholderTextColor="#777777"
        value={obs}
        onChangeText={setObs}
        style={[styles.input, styles.observacoes]}
        multiline
        textAlignVertical="top"
        selectionColor="#E30613"
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
    backgroundColor: "#FFFFFF",
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
    color: "#222222",
  },

  input: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    color: "#222222",
  },

  observacoes: {
    minHeight: 90,
    color: "#222222",
    backgroundColor: "#FFFFFF",
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },

  picker: {
    color: "#222222",
    backgroundColor: "#FFFFFF",
  },

  pickerDisabled: {
    opacity: 0.65,
  },

  dateText: {
    color: "#222222",
  },

  placeholderText: {
    color: "#777777",
  },

  button: {
    backgroundColor: "#E30613",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },

  bloqueadoContainer: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  bloqueadoIcon: {
    fontSize: 60,
    marginBottom: 15,
  },

  bloqueadoTitulo: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#E30613",
    marginBottom: 15,
    textAlign: "center",
  },

  bloqueadoTexto: {
    fontSize: 16,
    color: "#555555",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 25,
  },

  destaque: {
    color: "#E30613",
    fontWeight: "bold",
  },
});
