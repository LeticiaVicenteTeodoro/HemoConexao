/*import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function pedirPermissaoNotificacao() {
  const { status } = await Notifications.getPermissionsAsync();

  if (status !== "granted") {
    const resposta = await Notifications.requestPermissionsAsync();

    if (resposta.status !== "granted") {
      return false;
    }
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("doacoes", {
      name: "Lembretes de doação",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  }

  return true;
}

export function calcularDataProximaDoacao(dataTexto) {
  const partes = dataTexto.split("/");

  const data = new Date(
    Number(partes[2]),
    Number(partes[1]) - 1,
    Number(partes[0])
  );

  data.setSeconds(data.getSeconds() + 10);

  return data;
}

export async function agendarNotificacaoProximaDoacao(dataTexto) {
  const permitido = await pedirPermissaoNotificacao();

  if (!permitido) {
    return false;
  }

  const dataProxima = calcularDataProximaDoacao(dataTexto);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Você já pode doar novamente ❤️",
      body: "Seu prazo para uma nova doação chegou. Que tal salvar vidas hoje?",
      sound: "default",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: dataProxima,
      channelId: "doacoes",
    },
  });

  return true;
}*/