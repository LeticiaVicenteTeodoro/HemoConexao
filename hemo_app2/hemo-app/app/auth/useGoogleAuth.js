import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useEffect, useState } from "react";

WebBrowser.maybeCompleteAuthSession();

export default function useGoogleAuth(onLogin) {
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:
      "82119743922-q6j6cafadi8mjvsliba5dfa53t020mo6.apps.googleusercontent.com",

    androidClientId:
      "82119743922-h51mb26u17ts6btohvlcd3irgu3kgo8n.apps.googleusercontent.com",
  });

  useEffect(() => {
    const getUser = async () => {
      if (response?.type === "success") {
        setLoading(true);

        try {
          const token = response.authentication?.accessToken;

          if (!token) {
            console.log("Token não encontrado.");
            return;
          }

          const res = await fetch(
            "https://www.googleapis.com/userinfo/v2/me",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const user = await res.json();

          console.log("USUÁRIO GOOGLE:", user);

          await onLogin(user);
        } catch (error) {
          console.log("Erro ao obter usuário Google:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    getUser();
  }, [response]);

  return {
    request,
    promptAsync,
    loading,
  };
}