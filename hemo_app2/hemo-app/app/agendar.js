import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import { router } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { auth } from "../firebaseConfig";

const API_URL =
  "https://hemo-backend-683937879829.us-central1.run.app";

export default function WebViewPage() {
  const webViewRef = useRef(null);

  const javascript = `
    (function() {

      const frames = document.querySelectorAll("iframe");

      if (!frames.length) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            tipo: "erro",
            mensagem: "Iframe do agendamento não encontrado."
          })
        );
        return;
      }

      const documento = frames[0].contentDocument;

      if (!documento) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            tipo: "erro",
            mensagem: "Não foi possível acessar o formulário."
          })
        );
        return;
      }

      const botao = documento.querySelector("#botao_agendar");

      if (!botao) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            tipo: "erro",
            mensagem: "Botão Confirmar Agendamento não encontrado."
          })
        );
        return;
      }

      if (botao.dataset.hemoMonitorado === "true") {
        return;
      }

      botao.dataset.hemoMonitorado = "true";

      const obterValor = (id) => {

        const campo = documento.querySelector("#" + id);

        if (!campo) {
          return {
            valor: "",
            texto: ""
          };
        }

        const opcao =
          campo.options &&
          campo.options[campo.selectedIndex];

        return {
          valor: campo.value || "",
          texto: opcao
            ? opcao.textContent.trim()
            : ""
        };
      };

      botao.addEventListener(
        "click",
        function() {

          const dados = {

            tipo: "agendamento",

            municipio:
              obterValor("selectMunicipios"),

            unidade:
              obterValor("selectUnidades"),

            data:
              obterValor("selectDatas"),

            horario:
              obterValor("selectHorarios")
          };

          window.ReactNativeWebView.postMessage(
            JSON.stringify(dados)
          );

        },
        true
      );

      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          tipo: "monitoramento_ativo",
          mensagem:
            "Monitoramento do agendamento ativado."
        })
      );

    })();

    true;
  `;

  const salvarAgendamento = async (dados) => {
    try {
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        Alert.alert(
          "Erro",
          "Usuário não está autenticado."
        );
        return;
      }

      if (!dados.data?.valor || !dados.horario?.texto) {
        Alert.alert(
          "Erro",
          "Data ou horário não selecionado."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/agendamento/firebase/${firebaseUser.uid}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            municipio:
              dados.municipio?.texto || "",

            municipio_id:
              dados.municipio?.valor || "",

            unidade:
              dados.unidade?.texto || "",

            unidade_id:
              dados.unidade?.valor || "",

            data:
              dados.data?.valor || "",

            data_texto:
              dados.data?.texto || "",

            horario:
              dados.horario?.texto || "",

            horario_id:
              dados.horario?.valor || "",
          }),
        }
      );

      const resultado = await response.json();

      console.log(
        "RESULTADO SALVAR AGENDAMENTO:",
        resultado
      );

      if (!response.ok || !resultado.sucesso) {

        Alert.alert(
          "Aviso",
          "O agendamento foi processado pelo site, mas não conseguimos salvar os dados no HemoConexão."
        );

        return;
      }

      Alert.alert(
        "Agendamento salvo",
        "Os dados do seu agendamento foram salvos no HemoConexão."
      );

    } catch (erro) {

      console.log(
        "ERRO AO SALVAR AGENDAMENTO:",
        erro
      );

      Alert.alert(
        "Aviso",
        "Não foi possível salvar os dados do agendamento."
      );
    }
  };

  const handleMessage = (event) => {

    try {

      const dados =
        JSON.parse(event.nativeEvent.data);

      console.log(
        "WEBVIEW:",
        dados
      );

      if (dados.tipo === "monitoramento_ativo") {

        console.log(
          "Monitoramento do agendamento ativo."
        );
      }

      if (dados.tipo === "agendamento") {

        console.log(
          "DADOS DO AGENDAMENTO:",
          dados
        );

        salvarAgendamento(dados);
      }

      if (dados.tipo === "erro") {

        console.log(
          "ERRO WEBVIEW:",
          dados.mensagem
        );
      }

    } catch (erro) {

      console.log(
        "ERRO AO LER MENSAGEM DO WEBVIEW:",
        erro
      );
    }
  };

  return (
    <View style={styles.container}>

      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
      >

        <FontAwesome
          name="arrow-left"
          size={18}
          color="#fff"
        />

        <Text style={styles.backText}>
          Voltar
        </Text>

      </TouchableOpacity>

      <WebView
        ref={webViewRef}

        source={{
          uri:
            "https://www.mg.gov.br/agendamento_servico/doacao-de-sangue",
        }}

        style={styles.webview}

        startInLoadingState

        javaScriptEnabled={true}

        domStorageEnabled={true}

        onMessage={handleMessage}

        injectedJavaScript={javascript}

        onLoadEnd={() => {

          console.log(
            "WebView carregado."
          );

          setTimeout(() => {

            webViewRef.current?.injectJavaScript(
              javascript
            );

          }, 1500);

          setTimeout(() => {

            webViewRef.current?.injectJavaScript(
              javascript
            );

          }, 3000);

        }}
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  backButton: {
    height: 55,
    backgroundColor: "#E30613",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 10,
  },

  backText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  webview: {
    flex: 1,
  },

});