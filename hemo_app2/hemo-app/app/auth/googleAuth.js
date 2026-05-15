import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

// Configuração inicial
GoogleSignin.configure({
  webClientId:
    "82119743922-q6j6cafadi8mjvsliba5dfa53t020mo6.apps.googleusercontent.com",
  offlineAccess: true,
});

export async function signInWithGoogle() {
  try {
    // Verifica se os serviços do Google estão disponíveis
    await GoogleSignin.hasPlayServices();

    // Abre a tela de login
    const userInfo = await GoogleSignin.signIn();

    return {
      success: true,
      user: userInfo.data?.user || userInfo.user || userInfo,
    };
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return {
        success: false,
        error: "Login cancelado.",
      };
    }

    if (error.code === statusCodes.IN_PROGRESS) {
      return {
        success: false,
        error: "Login já em andamento.",
      };
    }

    if (
      error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
    ) {
      return {
        success: false,
        error: "Google Play Services indisponível.",
      };
    }

    return {
      success: false,
      error: error.message || "Erro desconhecido.",
    };
  }
}