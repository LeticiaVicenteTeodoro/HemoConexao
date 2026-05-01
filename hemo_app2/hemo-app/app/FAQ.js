import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function FAQ() {
  const [openBlood, setOpenBlood] = useState(false);
  const [openMarrow, setOpenMarrow] = useState(false);

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>Perguntas Frequentes</Text>

      {/* 🩸 DOAÇÃO DE SANGUE */}
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setOpenBlood(!openBlood)}
      >
        <Text style={styles.dropdownTitle}>🩸 Doação de Sangue</Text>
        <FontAwesome name={openBlood ? "chevron-up" : "chevron-down"} size={16} />
      </TouchableOpacity>

      {openBlood && (
        <View style={styles.content}>

          <Item
            q="Quem pode doar sangue?"
            a="Pessoas entre 16 e 69 anos, com mais de 50kg e em boa saúde."
          />

          <Item
            q="Qual o intervalo entre doações?"
            a="Homens: 60 dias | Mulheres: 90 dias."
          />

          <Item
            q="Quanto tempo dura a doação?"
            a="A coleta dura cerca de 10 a 15 minutos, mas todo o processo leva cerca de 1 hora."
          />

          <Item
            q="Posso doar em jejum?"
            a="Não. É recomendado estar alimentado, evitando alimentos gordurosos antes da doação."
          />

          <Item
            q="Quem não pode doar?"
            a="Pessoas com febre, gripe, infecções ou uso de certos medicamentos temporariamente não podem doar."
          />
        </View>
      )}

      {/* 🧬 MEDULA ÓSSEA */}
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setOpenMarrow(!openMarrow)}
      >
        <Text style={styles.dropdownTitle}>🧬 Medula Óssea</Text>
        <FontAwesome name={openMarrow ? "chevron-up" : "chevron-down"} size={16} />
      </TouchableOpacity>

      {openMarrow && (
        <View style={styles.content}>

          <Item
            q="Quem pode se cadastrar?"
            a="Pessoas entre 18 e 35 anos, saudáveis, que podem se cadastrar como doadores."
          />

          <Item
            q="Como funciona o cadastro?"
            a="É feito no REDOME com coleta de uma pequena amostra de sangue."
          />

          <Item
            q="A doação de medula dói?"
            a="O procedimento é seguro e pode causar desconforto leve, mas não dor intensa."
          />

          <Item
            q="Qual a chance de ser chamado?"
            a="É baixa, pois depende da compatibilidade genética entre doador e paciente."
          />

          <Item
            q="Onde posso me cadastrar?"
            a="Em hemocentros autorizados, como o HemoMinas."
          />
        </View>
      )}

    </ScrollView>
  );
}

// 📦 componente de pergunta/resposta
function Item({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <TouchableOpacity style={styles.item} onPress={() => setOpen(!open)}>
      <Text style={styles.question}>❓ {q}</Text>
      {open && <Text style={styles.answer}>💡 {a}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 15,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E30613",
    marginBottom: 20,
  },

  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },

  dropdownTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },

  content: {
    marginBottom: 15,
  },

  item: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },

  question: {
    fontWeight: "bold",
  },

  answer: {
    marginTop: 8,
    color: "#555",
  },
});