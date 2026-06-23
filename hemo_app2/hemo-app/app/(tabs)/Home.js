import React, {
  useEffect,
  useState,
  useCallback,
} from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Modal,
} from "react-native";
import { registrarPushToken } from "../pushEstoque";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";

const API_URL = "http://192.168.1.20:8000";

const MARCOS = [1, 5, 15, 20, 25, 30, 35, 40, 45, 50, 75, 100];

function calcularMarco(total) {
  const marcoAtual = MARCOS.filter((m) => total >= m).pop() || 0;
  const proximoMarco = MARCOS.find((m) => total < m) || null;

  return {
    marcoAtual,
    proximoMarco,
    faltam: proximoMarco ? proximoMarco - total : 0,
  };
}

function nomeDoMarco(marco) {
  if (marco >= 100) return "Herói da Vida";
  if (marco >= 75) return "Lenda Solidária";
  if (marco >= 50) return "Doador Ouro";
  if (marco >= 35) return "Doador Experiente";
  if (marco >= 25) return "Doador Prata";
  if (marco >= 15) return "Doador Frequente";
  if (marco >= 5) return "Doador Iniciante";
  if (marco >= 1) return "Primeira Doação";

  return "Novo Doador";
}

function calcularProximaDoacao(
  dataTexto,
  sexo
) {
  const partes = dataTexto.split("/");

  const data = new Date(
    partes[2],
    partes[1] - 1,
    partes[0]
  );

  const dias =
    sexo === "Masculino"
      ? 60
      : 90;

  data.setDate(
    data.getDate() + dias
  );

  return data.toLocaleDateString(
    "pt-BR"
  );
}

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [totalDoacoes, setTotalDoacoes] = useState(0);
  const [proximaDoacao, setProximaDoacao] = useState(null);

useEffect(() => {
  checkFirstAccess();
  registrarPushToken();
}, []);

  useFocusEffect(
    useCallback(() => {
      carregarResumo();
    }, [])
  );

  const checkFirstAccess = async () => {
    try {
      const alreadyShown = await AsyncStorage.getItem(
        "welcome_popup_shown"
      );

      if (!alreadyShown) {
        setShowOnboarding(true);
        await AsyncStorage.setItem(
          "welcome_popup_shown",
          "true"
        );
      }
    } catch (error) {
      console.log("Erro ao verificar popup inicial:", error);
    }
  };

  const carregarResumo = async () => {
    try {
      const usuarioSalvo = await AsyncStorage.getItem("usuario");

      if (!usuarioSalvo) return;

      const user = JSON.parse(usuarioSalvo);
      setUsuario(user);

      

      const response = await fetch(`${API_URL}/historico/${user.id}`);
      const historico = await response.json();

      setTotalDoacoes(historico.length);

      if (historico.length > 0) {
        const ultimaDoacao = historico[0];

        const proxima =
          calcularProximaDoacao(
            ultimaDoacao.data,
            user?.sexo
          );

        setProximaDoacao(proxima);
      } else {
        setProximaDoacao(null);
      }
    } catch (error) {
      console.log("Erro ao carregar resumo:", error);
    }
  };

  const { marcoAtual, proximoMarco, faltam } =
    calcularMarco(totalDoacoes);

  const startOnboarding = () => {
    setShowOnboarding(false);
    router.push("/steps/Step1");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HemoConexão</Text>

      <View style={styles.gamificationCard}>
        <Text style={styles.hello}>
          Olá, {usuario?.nome || "doador(a)"} ❤️
        </Text>

        <Text style={styles.totalText}>
          Você já realizou {totalDoacoes} doação(ões).
        </Text>

        <Text style={styles.badgeText}>
          🏅 {nomeDoMarco(marcoAtual)}
        </Text>

        {proximaDoacao && (
          <Text style={styles.nextText}>
            ⏰ Próxima doação: {proximaDoacao}
          </Text>
        )}

        {proximoMarco ? (
          <Text style={styles.nextText}>
            Faltam {faltam} doação(ões) para o marco de {proximoMarco}.
          </Text>
        ) : (
          <Text style={styles.nextText}>
            Você alcançou o maior marco de doações!
          </Text>
        )}
      </View>

      <View style={styles.grid}>
        <Item
          icon="plus"
          text="Registrar"
          onPress={() => router.push("/Registrar")}
        />

        <Item
          icon="calendar"
          text="Agendar"
          link="https://www.mg.gov.br/agendamento_servico/doacao-de-sangue"
        />

        <Item
          icon="heart"
          text="Histórico"
          onPress={() => router.push("/Historico")}
        />

        <Item
          icon="question"
          text="Dúvidas"
          onPress={() => router.push("/FAQ")}
        />

        <Item
          icon="comments"
          text="Chat"
          onPress={() => router.push("/chat")}
        />

        <Item
          icon="map"
          text="Mapa"
          onPress={() => router.push("/map")}
        />

        <Item
          icon="tint"
          text="Estoque"
          onPress={() => router.push("/Stock")}
        />
      </View>

      <Modal visible={showOnboarding} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              Bem-vinda ao HemoConexão ❤️
            </Text>

            <Text style={styles.modalText}>
              Vamos te guiar em 5 passos rápidos.
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={startOnboarding}
            >
              <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Item({ icon, text, link, onPress }) {
  const handlePress = async () => {
    if (onPress) return onPress();

    if (link) {
      const supported = await Linking.canOpenURL(link);
      if (supported) await Linking.openURL(link);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <FontAwesome name={icon} size={24} color="#E30613" />
      <Text>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 20,
    color: "#E30613",
    marginBottom: 15,
    fontWeight: "bold",
  },

  gamificationCard: {
    backgroundColor: "#fff0f0",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ffd0d0",
  },

  hello: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E30613",
    marginBottom: 5,
  },

  totalText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 5,
  },

  badgeText: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 5,
  },

  nextText: {
    fontSize: 13,
    color: "#666",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "30%",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },

  modalText: {
    textAlign: "center",
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#E30613",
    padding: 10,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});