import * as Notifications from "expo-notifications";
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
  const { status } =
    await Notifications.getPermissionsAsync();

  if (status !== "granted") {
    const resposta =
      await Notifications.requestPermissionsAsync();

    if (resposta.status !== "granted") {
      return false;
    }
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(
      "doacoes",
      {
        name: "Lembretes de doação",
        importance:
          Notifications.AndroidImportance.HIGH,
        sound: "default",
      }
    );
  }

  return true;
}

export function calcularDataProximaDoacao(
  dataDoacao,
  sexo
) {
  const proxima = new Date(dataDoacao);

  const dias =
    sexo === "Masculino"
      ? 60
      : 90;

  proxima.setDate(
    proxima.getDate() + dias
  );

  proxima.setHours(9, 0, 0, 0);

  return proxima;
}

export async function agendarNotificacaoProximaDoacao(
  dataDoacao,
  sexo
) {
  const permitido =
    await pedirPermissaoNotificacao();

  if (!permitido) {
    return false;
  }

  let dataProxima =
    calcularDataProximaDoacao(
      dataDoacao,
      sexo
    );

  // Para teste: se a data calculada já passou,
  // agenda para daqui 10 segundos
  if (dataProxima <= new Date()) {
    dataProxima = new Date(
      Date.now() + 10000
    );
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Você já pode doar novamente ❤️",
      body:
        "Seu prazo para uma nova doação chegou. Que tal salvar vidas hoje?",
      sound: "default",
    },

    
    trigger: {
      type:
        Notifications
          .SchedulableTriggerInputTypes
          .DATE,
      date: dataProxima,
      channelId: "doacoes",
    },
  });
console.log("Notificação agendada para:", dataProxima);
  return true;
}