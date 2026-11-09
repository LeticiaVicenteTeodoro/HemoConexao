import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  ScrollView,
  Modal,
} from "react-native";

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

function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const buscarUsuario = async () => {
  const user = auth.currentUser;

  if (!user) return null;

  const response = await fetch(
    `${API_URL}/usuario/firebase/${user.uid}`
  );

  const usuario = await response.json();

  if (!response.ok || !usuario.sucesso) return null;

  return usuario;
};

export default function Registrar() {
  const navigation = useNavigation();

  const [data, setData] = useState(null);
  const [mostrarData, setMostrarData] = useState(false);

  const [estado, setEstado] = useState("");
  const [modalEstado, setModalEstado] = useState(false);

  const [cidade, setCidade] = useState("");
  const [dropdownCidade, setDropdownCidade] = useState(false);
  const [buscaCidade, setBuscaCidade] = useState("");

  const [tipo, setTipo] = useState("");
  const [modalSangue, setModalSangue] = useState(false);

  const [obs, setObs] = useState("");

  const [bloqueado, setBloqueado] = useState(false);
  const [diasRestantes, setDiasRestantes] = useState(0);

  const estados = Object.keys(estadosCidades);

  const cidades = estado ? estadosCidades[estado] : [];

  const cidadesFiltradas = cidades.filter((item) =>
    normalizarTexto(item).includes(
      normalizarTexto(buscaCidade.trim())
    )
  );

  const selecionarEstado = (itemEstado) => {
    setEstado(itemEstado);
    setCidade("");
    setBuscaCidade("");
    setDropdownCidade(false);
    setModalEstado(false);
  };

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

      if (!historico || historico.length === 0) return;

      const ultimaDoacao = historico[0];
      const partes = ultimaDoacao.data.split("/");

      const dataUltima = new Date(
        Number(partes[2]),
        Number(partes[1]) - 1,
        Number(partes[0])
      );

      const proximaDoacao = new Date(dataUltima);
      proximaDoacao.setDate(proximaDoacao.getDate() + 90);

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

  const selecionarCidade = (itemCidade) => {
    setCidade(itemCidade);
    setBuscaCidade("");
    setDropdownCidade(false);
  };

  const salvar = async () => {
    const camposFaltando = [];

    if (!data) camposFaltando.push("Data");
    if (!estado) camposFaltando.push("Estado");
    if (!cidade) camposFaltando.push("Cidade");
    if (!tipo) camposFaltando.push("Tipo sanguíneo");

    if (camposFaltando.length > 0) {
      Alert.alert(
        "Campos obrigatórios",
        `Por favor, preencha ${
          camposFaltando.length === 1
            ? "o seguinte campo"
            : "os seguintes campos"
        }:\n\n${camposFaltando.join("\n")}.`
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
      setBuscaCidade("");
      setDropdownCidade(false);
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

      {/* DATA */}
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

      {/* ESTADO */}
      <TouchableOpacity
        style={styles.sangueContainer}
        onPress={() => setModalEstado(true)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.sangueTexto,
            {
              color: estado ? "#222222" : "#777777",
            },
          ]}
        >
          {estado || "Selecione o Estado"}
        </Text>

        <Text style={styles.sangueSeta}>▼</Text>
      </TouchableOpacity>

      {/* POPUP DE ESTADOS - SEMPRE BRANCO */}
      <Modal
        visible={modalEstado}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setModalEstado(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Selecione o Estado
            </Text>

            <ScrollView
              style={styles.listaEstados}
              nestedScrollEnabled
              showsVerticalScrollIndicator
            >
              {estados.map((itemEstado) => (
                <TouchableOpacity
                  key={itemEstado}
                  style={[
                    styles.sangueOption,
                    {
                      backgroundColor:
                        estado === itemEstado
                          ? "#E30613"
                          : "#FFFFFF",
                      borderColor:
                        estado === itemEstado
                          ? "#E30613"
                          : "#DDDDDD",
                    },
                  ]}
                  onPress={() =>
                    selecionarEstado(itemEstado)
                  }
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.sangueOptionText,
                      {
                        color:
                          estado === itemEstado
                            ? "#FFFFFF"
                            : "#222222",
                      },
                    ]}
                  >
                    {itemEstado}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelarModal}
              onPress={() => setModalEstado(false)}
            >
              <Text style={styles.cancelarModalText}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CIDADE COM PESQUISA */}
      <View style={styles.cidadeContainer}>
        <TouchableOpacity
          style={[
            styles.campoCidade,
            !estado && styles.campoDesabilitado,
          ]}
          activeOpacity={0.7}
          disabled={!estado}
          onPress={() => {
            setBuscaCidade("");
            setDropdownCidade(!dropdownCidade);
          }}
        >
          <Text
            style={
              cidade
                ? styles.textoCampoCidade
                : styles.placeholderCidade
            }
          >
            {cidade || "Selecione a Cidade"}
          </Text>

          <Text style={styles.setaCidade}>
            {dropdownCidade ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>

        {dropdownCidade && estado !== "" && (
          <View style={styles.dropdownCidade}>
            <View style={styles.pesquisaContainer}>
              <Text style={styles.iconePesquisa}>
                🔍
              </Text>

              <TextInput
                style={styles.inputPesquisa}
                placeholder="Digite para pesquisar..."
                placeholderTextColor="#888888"
                value={buscaCidade}
                onChangeText={setBuscaCidade}
                autoCorrect={false}
              />

              {buscaCidade.length > 0 && (
                <TouchableOpacity
                  onPress={() => setBuscaCidade("")}
                >
                  <Text style={styles.limparPesquisa}>
                    ✕
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              style={styles.listaCidades}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
            >
              {cidadesFiltradas.length > 0 ? (
                cidadesFiltradas.map((itemCidade) => (
                  <TouchableOpacity
                    key={itemCidade}
                    style={styles.itemCidade}
                    onPress={() =>
                      selecionarCidade(itemCidade)
                    }
                  >
                    <Text style={styles.textoCidade}>
                      {itemCidade}
                    </Text>

                    {cidade === itemCidade && (
                      <Text style={styles.checkCidade}>
                        ✓
                      </Text>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.semResultado}>
                  Nenhuma cidade encontrada.
                </Text>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.fecharDropdown}
              onPress={() => {
                setDropdownCidade(false);
                setBuscaCidade("");
              }}
            >
              <Text style={styles.fecharDropdownTexto}>
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* TIPO SANGUÍNEO */}
      <TouchableOpacity
        style={styles.sangueContainer}
        onPress={() => setModalSangue(true)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.sangueTexto,
            {
              color: tipo ? "#222222" : "#777777",
            },
          ]}
        >
          {tipo || "Selecione o Tipo Sanguíneo"}
        </Text>

        <Text style={styles.sangueSeta}>▼</Text>
      </TouchableOpacity>

      {/* POPUP DE TIPO SANGUÍNEO - SEMPRE BRANCO */}
      <Modal
        visible={modalSangue}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setModalSangue(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Tipo sanguíneo
            </Text>

            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
              (item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.sangueOption,
                    {
                      backgroundColor:
                        tipo === item
                          ? "#E30613"
                          : "#FFFFFF",
                      borderColor:
                        tipo === item
                          ? "#E30613"
                          : "#DDDDDD",
                    },
                  ]}
                  onPress={() => {
                    setTipo(item);
                    setModalSangue(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.sangueOptionText,
                      {
                        color:
                          tipo === item
                            ? "#FFFFFF"
                            : "#222222",
                      },
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )
            )}

            <TouchableOpacity
              style={styles.cancelarModal}
              onPress={() => setModalSangue(false)}
            >
              <Text style={styles.cancelarModalText}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* OBSERVAÇÕES */}
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

      {/* SALVAR */}
      <TouchableOpacity
        style={styles.button}
        onPress={salvar}
      >
        <Text style={styles.buttonText}>Salvar</Text>
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

  cidadeContainer: {
    zIndex: 20,
    marginBottom: 10,
  },

  campoCidade: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },

  campoDesabilitado: {
    backgroundColor: "#F3F3F3",
    opacity: 0.65,
  },

  textoCampoCidade: {
    fontSize: 15,
    color: "#222222",
  },

  placeholderCidade: {
    fontSize: 15,
    color: "#777777",
  },

  setaCidade: {
    fontSize: 12,
    color: "#555555",
  },

  dropdownCidade: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    marginTop: 5,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  pesquisaContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#DDDDDD",
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },

  iconePesquisa: {
    fontSize: 16,
    marginRight: 8,
  },

  inputPesquisa: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: "#222222",
  },

  limparPesquisa: {
    color: "#E30613",
    fontSize: 18,
    padding: 5,
  },

  listaCidades: {
    maxHeight: 250,
  },

  itemCidade: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  textoCidade: {
    fontSize: 15,
    color: "#222222",
  },

  checkCidade: {
    color: "#16A34A",
    fontWeight: "bold",
    fontSize: 18,
  },

  semResultado: {
    padding: 15,
    color: "#777777",
    textAlign: "center",
  },

  fecharDropdown: {
    padding: 12,
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderTopWidth: 1,
    borderTopColor: "#DDDDDD",
  },

  fecharDropdownTexto: {
    color: "#E30613",
    fontWeight: "bold",
  },

  sangueContainer: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    marginBottom: 10,
    height: 50,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },

  sangueTexto: {
    fontSize: 15,
  },

  sangueSeta: {
    fontSize: 12,
    color: "#222222",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  modalBox: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    maxHeight: "85%",
    backgroundColor: "#FFFFFF",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 18,
    color: "#222222",
  },

  listaEstados: {
    maxHeight: 350,
  },

  sangueOption: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 13,
    marginBottom: 8,
    alignItems: "center",
  },

  sangueOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
  },

  cancelarModal: {
    marginTop: 10,
    padding: 12,
    alignItems: "center",
  },

  cancelarModalText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222222",
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
