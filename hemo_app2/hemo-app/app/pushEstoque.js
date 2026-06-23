import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

const API_URL = "http://192.168.1.20:8000";

export async function registrarPushToken() {
  try {
    const { status } =
      await Notifications.requestPermissionsAsync();

    if (status !== "granted") {
      console.log("Permissão negada");
      return null;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ||
      Constants?.easConfig?.projectId;

    const token =
      await Notifications.getExpoPushTokenAsync({
        projectId,
      });

    console.log("TOKEN PUSH:");
    console.log(token.data);

    const response = await fetch(
      `${API_URL}/registrar_push_token?token=${encodeURIComponent(
        token.data
      )}`,
      {
        method: "POST",
      }
    );

    const resultado = await response.json();

    console.log("TOKEN SALVO:");
    console.log(resultado);

    return token.data;
  } catch (error) {
    console.log("ERRO PUSH:");
    console.log(error);

    return null;
  }
}