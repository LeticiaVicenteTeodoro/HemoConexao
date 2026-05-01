import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

// 🧠 FAQ mais inteligente e completo
const FAQ = [
  {
    keywords: ["intervalo", "tempo entre doações", "quando posso doar de novo"],
    answer: "Homens podem doar a cada 60 dias e mulheres a cada 90 dias.",
  },
  {
    keywords: ["quanto tempo", "duração", "demora"],
    answer: "A doação leva cerca de 10 a 15 minutos, mas todo o processo dura em média 1 hora.",
  },
  {
    keywords: ["importância", "por que doar", "ajuda", "salvar vidas"],
    answer: "Cada doação pode salvar até 4 vidas ❤️ O sangue não pode ser produzido artificialmente.",
  },
  {
    keywords: ["quem pode", "doar", "requisitos", "idade"],
    answer: "Pessoas entre 16 e 69 anos, com mais de 50kg e boa saúde podem doar.",
  },
  {
    keywords: ["não pode", "doença", "gripado", "febre"],
    answer: "Não pode doar quem estiver com febre, gripe, infecção ou usando certos medicamentos.",
  },
  {
    keywords: ["peso", "mínimo"],
    answer: "O peso mínimo para doar sangue é 50kg.",
  },
  {
    keywords: ["jejum", "comer", "alimentação"],
    answer: "Não é necessário jejum. Apenas evite alimentos gordurosos antes da doação.",
  },
];

// 🧠 normalização inteligente
const normalize = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// 🧠 cérebro do chat (versão forte)
const getResponse = (text) => {
  const input = normalize(text);

  let bestMatch = null;
  let bestScore = 0;

  for (let item of FAQ) {
    let score = 0;

    for (let keyword of item.keywords) {
      const k = normalize(keyword);

      if (input === k) score += 5;
      else if (input.includes(k)) score += 3;
      else if (k.split(" ").some((w) => input.includes(w))) score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item.answer;
    }
  }

  if (bestScore >= 2) return bestMatch;

  // 🧠 fallback estilo IA
  if (input.includes("posso") || input.includes("pode")) {
    return "Depende da situação 👍 Me diga mais detalhes sobre você para te orientar melhor.";
  }

  if (input.includes("como") || input.includes("o que")) {
    return "Posso te ajudar com isso! Tente ser mais específico sobre doação de sangue.";
  }

  return "Não encontrei uma resposta exata 😢 Mas posso te ajudar com: quem pode doar, requisitos, ou intervalo entre doações.";
};

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      text: "Olá! Sou seu assistente sobre doação de sangue ❤️ Pergunte o que quiser!",
      from: "bot",
    },
  ]);

  const suggestions = [
    "Quem pode doar sangue?",
    "Quanto tempo demora a doação?",
    "Posso doar gripado?",
    "Qual o intervalo entre doações?",
  ];

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = { text: input, from: "user" };
    const botMsg = { text: getResponse(input), from: "bot" };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.msg,
              item.from === "user" ? styles.user : styles.bot,
            ]}
          >
            <Text style={styles.text}>{item.text}</Text>
          </View>
        )}
      />

      {/* 💡 sugestões inteligentes */}
      <View style={styles.suggestions}>
        {suggestions.map((s, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setInput(s)}
            style={styles.suggestionBtn}
          >
            <Text style={styles.suggestionText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputArea}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Pergunte algo..."
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage}>
          <FontAwesome name="arrow-right" size={20} color="#E30613" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f5f5f5",
  },

  msg: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: "75%",
  },

  user: {
    backgroundColor: "#E30613",
    alignSelf: "flex-end",
  },

  bot: {
    backgroundColor: "#e0e0e0",
    alignSelf: "flex-start",
  },

  text: {
    color: "#000",
  },

  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 15,
  },

  input: {
    flex: 1,
    paddingVertical: 10,
  },

  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },

  suggestionBtn: {
    backgroundColor: "#ddd",
    padding: 8,
    borderRadius: 10,
    margin: 4,
  },

  suggestionText: {
    fontSize: 12,
  },
});