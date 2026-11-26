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
  ScrollView,
  StatusBar,
} from "react-native";

import { auth } from "../../firebaseConfig";
import { registrarPushToken } from "../pushEstoque";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";

const API_URL =
  "https://hemo-backend-683937879829.us-central1.run.app";

// PALETA DE CORES
const COLORS = {
  burgundy: "#E30613",
  darkRed: "#C90012",
  red: "#E30613",
  pink: "#FFE8EA",
  lightPink: "#FFF5F5",
  background: "#FCF9F9",
  white: "#FFFFFF",
  text: "#33262A",
  gray: "#8D8185",
  border: "#F3DCDD",
  gold: "#D6A64B",
};

const MARCOS = [1, 3, 5, 10, 15, 20, 25];

function calcularMarco(total) {
  const marcoAtual =
    MARCOS.filter((m) => total >= m).pop() || 0;

  const proximoMarco =
    MARCOS.find((m) => total < m) || null;

  return {
    marcoAtual,
    proximoMarco,
    faltam: proximoMarco ? proximoMarco - total : 0,
  };
}

function nomeDoMarco(marco) {
  if (marco >= 25) return "Herói da Vida";
  if (marco >= 20) return "Lenda Solidária";
  if (marco >= 15) return "Doador Ouro";
  if (marco >= 10) return "Doador Experiente";
  if (marco >= 5) return "Doador Prata";
  if (marco >= 3) return "Doador Frequente";
  if (marco >= 1) return "Primeira Doação";

  return "Novo Doador";
}

function calcularProximaDoacao(dataTexto, sexo) {
  const partes = dataTexto.split("/");

  const data = new Date(
    Number(partes[2]),
    Number(partes[1]) - 1,
    Number(partes[0])
  );

  const dias =
    sexo === "Masculino" ? 60 : 90;

  data.setDate(data.getDate() + dias);

  return data.toLocaleDateString("pt-BR");
}

export default function Home() {
  const [showOnboarding, setShowOnboarding] =
    useState(false);

  const [usuario, setUsuario] = useState(null);

  const [totalDoacoes, setTotalDoacoes] =
    useState(0);

  const [proximaDoacao, setProximaDoacao] =
    useState(null);

  useEffect(() => {
    checkFirstAccess();
    registrarPushToken();
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarResumo();
    }, [])
  );

  // VERIFICA PRIMEIRO ACESSO
  const checkFirstAccess = async () => {
    try {
      const alreadyShown =
        await AsyncStorage.getItem(
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
      console.log(
        "Erro ao verificar popup inicial:",
        error
      );
    }
  };

  // CARREGA DADOS DO USUÁRIO
  const carregarResumo = async () => {
    try {
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        console.log("NENHUM USUARIO FIREBASE LOGADO");
        return;
      }

      // Busca usuário atualizado
      const responseUsuario = await fetch(
        `${API_URL}/usuario/firebase/${firebaseUser.uid}`
      );

      const usuarioAtualizado =
        await responseUsuario.json();

      if (!usuarioAtualizado.sucesso) {
        console.log(
          "ERRO AO BUSCAR USUARIO:",
          usuarioAtualizado
        );
        return;
      }

      await AsyncStorage.setItem(
        "usuario",
        JSON.stringify(usuarioAtualizado)
      );

      setUsuario(usuarioAtualizado);

      // Busca histórico
      const response = await fetch(
        `${API_URL}/historico/firebase/${firebaseUser.uid}`
      );

      const historico = await response.json();

      console.log("HISTORICO DA HOME:", historico);

      const registros = Array.isArray(historico)
        ? historico
        : [];

      setTotalDoacoes(registros.length);

      if (registros.length > 0) {
        const ultimaDoacao = registros[0];

        if (ultimaDoacao.data) {
          const proxima = calcularProximaDoacao(
            ultimaDoacao.data,
            usuarioAtualizado.sexo
          );

          setProximaDoacao(proxima);
        } else {
          setProximaDoacao(null);
        }
      } else {
        setProximaDoacao(null);
      }

    } catch (error) {
      console.log(
        "ERRO AO CARREGAR RESUMO:",
        error
      );
    }
  };

  const {
    marcoAtual,
    proximoMarco,
    faltam,
  } = calcularMarco(totalDoacoes);

  const progressoMarco = proximoMarco
    ? Math.min(
        100,
        ((totalDoacoes - marcoAtual) /
          (proximoMarco - marcoAtual)) *
          100
      )
    : 100;

  const startOnboarding = () => {
    setShowOnboarding(false);
    router.push("/steps/Step1");
  };

  return (
    <View style={styles.container}>

      <StatusBar
        backgroundColor={COLORS.burgundy}
        barStyle="light-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* CABEÇALHO */}

        <View style={styles.header}>

          <View style={styles.headerTop}>

            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <FontAwesome
                  name="tint"
                  size={20}
                  color={COLORS.white}
                />
              </View>

              <View>
                <Text style={styles.logoText}>
                  HemoConexão
                </Text>

                <Text style={styles.logoSubtitle}>
                  CONECTANDO VIDAS
                </Text>
              </View>
            </View>

            <View style={styles.headerHeart}>
              <FontAwesome
                name="heart"
                size={18}
                color="#F7C6CF"
              />
            </View>

          </View>

          <View style={styles.welcomeContainer}>

            <Text style={styles.welcomeSmall}>
              BEM-VINDA DE VOLTA!
            </Text>

            <Text style={styles.welcomeTitle}>
              Olá, {usuario?.nome || "doador(a)"}!
            </Text>

            <Text style={styles.welcomeDescription}>
              Sua solidariedade faz a diferença.
              Continue fazendo parte dessa corrente de vida.
            </Text>

          </View>

          <View style={styles.headerDecoration} />

        </View>

        {/* BANNER PRINCIPAL */}

        <View style={styles.banner}>

          <View style={styles.bannerContent}>

            <Text style={styles.bannerTag}>
              ♥ CORRENTE DO BEM
            </Text>

            <Text style={styles.bannerTitle}>
              Pequenas atitudes,
              grandes transformações.
            </Text>

            <Text style={styles.bannerDescription}>
              Cada gesto de solidariedade pode
              fazer a diferença na vida de alguém.
            </Text>

          </View>

          <View style={styles.bannerIcon}>
            <FontAwesome
              name="heart"
              size={38}
              color={COLORS.white}
            />

            <FontAwesome
              name="tint"
              size={19}
              color="#F5C3CD"
              style={styles.bannerDrop}
            />
          </View>

        </View>

        {/* MINHA JORNADA */}

        <View style={styles.sectionHeader}>

          <View>
            <Text style={styles.sectionTitle}>
              Minha jornada
            </Text>

            <Text style={styles.sectionSubtitle}>
              Acompanhe suas conquistas
            </Text>
          </View>

          <FontAwesome
            name="trophy"
            size={23}
            color={COLORS.gold}
          />

        </View>

        {/* CARD DE DOAÇÕES */}

        <View style={styles.journeyCard}>

          <View style={styles.journeyTop}>

            <View>
              <Text style={styles.cardLabel}>
                TOTAL DE DOAÇÕES
              </Text>

              <Text style={styles.donationNumber}>
                {String(totalDoacoes).padStart(2, "0")}
              </Text>

              <Text style={styles.donationDescription}>
                {totalDoacoes === 1
                  ? "Doação realizada"
                  : "Doações realizadas"}
              </Text>
            </View>

            <View style={styles.donationIcon}>
              <FontAwesome
                name="heart"
                size={28}
                color={COLORS.red}
              />
            </View>

          </View>

          <View style={styles.cardDivider} />

          <View style={styles.levelContainer}>

            <View style={styles.levelIcon}>
              <FontAwesome
                name="trophy"
                size={20}
                color={COLORS.gold}
              />
            </View>

            <View style={styles.levelInfo}>

              <Text style={styles.cardLabel}>
                SEU NÍVEL ATUAL
              </Text>

              <Text style={styles.levelName}>
                {nomeDoMarco(marcoAtual)}
              </Text>

            </View>

            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>
                {marcoAtual}
              </Text>
            </View>

          </View>

          {/* PROGRESSO */}

          <View style={styles.progressContainer}>

            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>
                Próxima conquista
              </Text>

              <Text style={styles.progressCount}>
                {proximoMarco
                  ? `${totalDoacoes}/${proximoMarco}`
                  : "Completo"}
              </Text>
            </View>

            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressoMarco}%`,
                  },
                ]}
              />
            </View>

            <Text style={styles.progressDescription}>
              {proximoMarco
                ? `Faltam ${faltam} doação(ões) para alcançar o próximo marco!`
                : "Você alcançou todos os marcos disponíveis!"}
            </Text>

          </View>

        </View>

        {/* PRÓXIMA DOAÇÃO */}

        {proximaDoacao && (
          <View style={styles.nextDonationCard}>

            <View style={styles.nextDonationIcon}>
              <FontAwesome
                name="calendar"
                size={22}
                color={COLORS.red}
              />
            </View>

            <View style={styles.nextDonationInfo}>

              <Text style={styles.nextDonationTitle}>
                Sua próxima possibilidade de doação
              </Text>

              <Text style={styles.nextDonationDate}>
                {proximaDoacao}
              </Text>

              <Text style={styles.nextDonationDescription}>
                Data estimada. Confirme sua elegibilidade
                com o hemocentro.
              </Text>

            </View>

          </View>
        )}

        {/* ATALHOS */}

        <View style={styles.sectionHeader}>

          <View>
            <Text style={styles.sectionTitle}>
              Explore o aplicativo
            </Text>

            <Text style={styles.sectionSubtitle}>
              Tudo o que você precisa em um só lugar
            </Text>
          </View>

        </View>

        <View style={styles.grid}>

          <Item
            icon="plus"
            text="Registrar"
            description="Nova doação"
            onPress={() => router.push("/Registrar")}
          />

          <Item
            icon="calendar"
            text="Agendar"
            description="Marque sua doação"
            onPress={() => router.push("/agendar")}
          />

          <Item
            icon="heart"
            text="Histórico"
            description="Sua trajetória"
            onPress={() => router.push("/Historico")}
          />

          <Item
            icon="question-circle"
            text="Dúvidas"
            description="Tire suas dúvidas"
            onPress={() => router.push("/FAQ")}
          />

          <Item
            icon="comments"
            text="Chat"
            description="Fale conosco"
            onPress={() => router.push("/chat")}
          />

          <Item
            icon="map-marker"
            text="Mapa"
            description="Encontre unidades"
            onPress={() => router.push("/map")}
          />

          <Item
            icon="tint"
            text="Estoque"
            description="Consulte os estoques"
            onPress={() => router.push("/Stock")}
          />

        </View>

        {/* MENSAGEM FINAL */}

        <View style={styles.finalMessage}>

          <FontAwesome
            name="heart"
            size={20}
            color={COLORS.red}
          />

          <Text style={styles.finalMessageTitle}>
            Sua atitude inspira!
          </Text>

          <Text style={styles.finalMessageText}>
            Obrigado por fazer parte do HemoConexão.
            Juntos, fortalecemos uma rede de solidariedade.
          </Text>

        </View>

        <Text style={styles.footer}>
          HemoConexão • Conectando vidas ❤️
        </Text>

      </ScrollView>

      {/* MODAL DE BOAS-VINDAS */}

      <Modal
        visible={showOnboarding}
        transparent
        animationType="fade"
      >

        <View style={styles.overlay}>

          <View style={styles.modal}>

            <View style={styles.modalIcon}>
              <FontAwesome
                name="heart"
                size={30}
                color={COLORS.white}
              />
            </View>

            <Text style={styles.modalTitle}>
              Bem-vinda ao HemoConexão!
            </Text>

            <Text style={styles.modalText}>
              Estamos felizes em ter você aqui.
              Vamos conhecer o aplicativo em
              5 passos rápidos?
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={startOnboarding}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                Começar
              </Text>

              <FontAwesome
                name="arrow-right"
                size={15}
                color={COLORS.white}
              />
            </TouchableOpacity>

          </View>

        </View>

      </Modal>

    </View>
  );
}

// COMPONENTE DOS ATALHOS

function Item({
  icon,
  text,
  description,
  link,
  onPress,
}) {
  const handlePress = async () => {
    if (onPress) {
      return onPress();
    }

    if (link) {
      const supported =
        await Linking.canOpenURL(link);

      if (supported) {
        await Linking.openURL(link);
      }
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.75}
    >

      <View style={styles.itemIcon}>
        <FontAwesome
          name={icon}
          size={21}
          color={COLORS.red}
        />
      </View>

      <Text style={styles.itemTitle}>
        {text}
      </Text>

      <Text style={styles.itemDescription}>
        {description}
      </Text>

    </TouchableOpacity>
  );
}

// ESTILIZAÇÃO

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingBottom: 30,
  },

  // CABEÇALHO

  header: {
    backgroundColor: COLORS.burgundy,
    paddingTop: 20,
    paddingHorizontal: 22,
    paddingBottom: 35,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  logoText: {
    fontSize: 19,
    fontWeight: "bold",
    color: COLORS.white,
  },

  logoSubtitle: {
    fontSize: 9,
    color: "#EFCBD2",
    letterSpacing: 2,
    marginTop: 3,
  },

  headerHeart: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  welcomeContainer: {
    marginTop: 32,
    zIndex: 2,
  },

  welcomeSmall: {
    fontSize: 10,
    letterSpacing: 2,
    color: "#EFCBD2",
    fontWeight: "bold",
    marginBottom: 8,
  },

  welcomeTitle: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "bold",
  },

  welcomeDescription: {
    color: "#F0DDE1",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 290,
  },

  headerDecoration: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(255,255,255,0.045)",
    right: -65,
    bottom: -90,
  },

  // BANNER

  banner: {
    marginHorizontal: 20,
    marginTop: 22,
    backgroundColor: COLORS.darkRed,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },

  bannerContent: {
    flex: 1,
    paddingRight: 8,
  },

  bannerTag: {
    color: "#F6C8D0",
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: "bold",
    marginBottom: 10,
  },

  bannerTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: COLORS.white,
    lineHeight: 25,
  },

  bannerDescription: {
    color: "#F4DDE2",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 8,
  },

  bannerIcon: {
    width: 75,
    height: 75,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
  },

  bannerDrop: {
    position: "absolute",
    bottom: 11,
    right: 10,
  },

  // TÍTULOS DE SEÇÃO

  sectionHeader: {
    marginHorizontal: 22,
    marginTop: 28,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: COLORS.text,
  },

  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 4,
  },

  // CARD DE JORNADA

  journeyCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 19,
    borderWidth: 1,
    borderColor: COLORS.border,

    elevation: 3,

    shadowColor: "#5D1A2A",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },

  journeyTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardLabel: {
    fontSize: 9,
    color: COLORS.gray,
    fontWeight: "bold",
    letterSpacing: 1.3,
  },

  donationNumber: {
    color: COLORS.burgundy,
    fontSize: 38,
    fontWeight: "bold",
    marginTop: 3,
  },

  donationDescription: {
    fontSize: 11,
    color: COLORS.gray,
  },

  donationIcon: {
    width: 57,
    height: 57,
    borderRadius: 18,
    backgroundColor: COLORS.pink,
    alignItems: "center",
    justifyContent: "center",
  },

  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 18,
  },

  levelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  levelIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFF7E8",
    alignItems: "center",
    justifyContent: "center",
  },

  levelInfo: {
    flex: 1,
    marginLeft: 12,
  },

  levelName: {
    color: COLORS.burgundy,
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 4,
  },

  levelBadge: {
    backgroundColor: COLORS.pink,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },

  levelBadgeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.red,
  },

  // BARRA DE PROGRESSO

  progressContainer: {
    marginTop: 22,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  progressTitle: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: "bold",
  },

  progressCount: {
    fontSize: 11,
    color: COLORS.red,
    fontWeight: "bold",
  },

  progressBackground: {
    height: 8,
    backgroundColor: "#F4E7EA",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: 8,
    backgroundColor: COLORS.red,
    borderRadius: 10,
  },

  progressDescription: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 9,
    lineHeight: 16,
  },

  // PRÓXIMA DOAÇÃO

  nextDonationCard: {
    marginHorizontal: 20,
    marginTop: 15,
    padding: 16,
    borderRadius: 17,
    backgroundColor: COLORS.lightPink,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },

  nextDonationIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  nextDonationInfo: {
    flex: 1,
    marginLeft: 13,
  },

  nextDonationTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.text,
  },

  nextDonationDate: {
    fontSize: 17,
    fontWeight: "bold",
    color: COLORS.red,
    marginTop: 4,
  },

  nextDonationDescription: {
    fontSize: 9,
    color: COLORS.gray,
    marginTop: 4,
    lineHeight: 14,
  },

  // GRID DE FUNCIONALIDADES

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  card: {
    width: "48%",
    minHeight: 132,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 15,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: COLORS.border,

    elevation: 2,

    shadowColor: "#5D1A2A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
  },

  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.pink,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  itemTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
  },

  itemDescription: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 5,
  },

  // MENSAGEM FINAL

  finalMessage: {
    marginHorizontal: 20,
    marginTop: 14,
    padding: 20,
    borderRadius: 20,
    backgroundColor: COLORS.pink,
    alignItems: "center",
  },

  finalMessageTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.burgundy,
    marginTop: 9,
  },

  finalMessageText: {
    fontSize: 11,
    color: "#80656D",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 7,
  },

  footer: {
    textAlign: "center",
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 22,
    marginBottom: 10,
  },

  // MODAL

  overlay: {
    flex: 1,
    backgroundColor: "rgba(35, 5, 13, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  modal: {
    width: "100%",
    backgroundColor: COLORS.white,
    padding: 25,
    borderRadius: 24,
    alignItems: "center",
  },

  modalIcon: {
    width: 65,
    height: 65,
    borderRadius: 22,
    backgroundColor: COLORS.burgundy,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.burgundy,
    textAlign: "center",
  },

  modalText: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: "center",
    lineHeight: 21,
    marginTop: 12,
    marginBottom: 22,
  },

  button: {
    width: "100%",
    backgroundColor: COLORS.burgundy,
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },

  buttonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 14,
  },

});