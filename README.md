<p align="center">
  <img src="docs/banner.png" alt="HemoConexão — telas do aplicativo" width="100%">
</p>

<h1 align="center">🩸 HemoConexão</h1>

<p align="center">
  <b>Doe sangue, salve vidas.</b><br>
  Tudo o que você precisa para doar, em um só lugar.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo">
  <img src="https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native">
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
</p>

---

## 💡 Sobre o projeto

Poucas pessoas sabem **quando** e **onde** a doação de sangue é mais necessária. O **HemoConexão** aproxima doadores e hemocentros: o app mostra a situação dos estoques em tempo real, ajuda a agendar a doação, guarda o histórico de cada doador e responde às dúvidas mais comuns — tudo em uma interface simples e acolhedora.

## ✨ Funcionalidades

| | Funcionalidade | O que faz |
|---|---|---|
| 🩸 | **Estoque de sangue** | Consulta o nível de cada tipo sanguíneo (Crítico, Alerta, Estável, Adequado) para saber o melhor momento de doar |
| 📅 | **Agendar** | Marque sua doação com antecedência |
| ➕ | **Registrar** | Registre uma nova doação feita |
| ❤️ | **Histórico** | Acompanhe sua trajetória como doador |
| ❓ | **Dúvidas (FAQ)** | Tire suas dúvidas sobre requisitos e cuidados |
| 💬 | **Chat** | Fale com a gente direto pelo app |
| 📍 | **Mapa** | Encontre unidades de coleta próximas |
| 📤 | **Compartilhar** | Compartilhe sua doação e inspire outras pessoas |
| 🔔 | **Notificações** | Avisos quando um tipo sanguíneo estiver em nível crítico |
| 🔐 | **Login e cadastro** | Autenticação com e-mail/senha e Google |

## 🧱 Arquitetura

```
HemoConexao/
├── Dockerfile              # Imagem do serviço Python (FastAPI + Chromium)
├── docs/                   # Imagens usadas na documentação
└── hemo_app2/
    └── hemo-app/
        ├── app/            # Telas do app (Expo Router, rotas por arquivo)
        ├── components/     # Componentes reutilizáveis
        ├── assets/         # Imagens e ícones
        └── backend/
            ├── main.py     # API FastAPI (Firebase, e-mails, estoque)
            ├── scraper.py  # Coleta os níveis de estoque do hemocentro
            ├── server.js   # API Express + SQLite
            └── data/       # estoque.json gerado pelo scraper
```

**Como os dados do estoque chegam ao app:**
`Site do hemocentro` → `scraper (Selenium)` → `estoque.json` → `API` → `Tela de Estoque`

## 🛠️ Tecnologias

- **App:** React Native, Expo 54, Expo Router, TypeScript/JavaScript
- **Autenticação e dados:** Firebase (Auth + Firestore), Google Sign-In
- **Mapas e localização:** `react-native-maps`, `expo-location`
- **Backend:** FastAPI (Python), Express (Node.js), SQLite
- **Coleta de dados:** Selenium + Chromium headless
- **Deploy:** Docker, EAS Build

## 🚀 Como rodar

### Aplicativo

```bash
cd hemo_app2/hemo-app
npm install
npx expo start
```

Escaneie o QR code com o Expo Go ou abra em um emulador Android/iOS.

### Backend (Python)

```bash
cd hemo_app2/hemo-app/backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8080
```

Crie um arquivo `.env` com as variáveis necessárias (por exemplo `RESEND_API_KEY`).

### Com Docker

```bash
docker build -t hemoconexao .
docker run -p 8080:8080 hemoconexao
```

## 🎨 Identidade visual

Vermelho como cor principal, remetendo ao sangue e à urgência de doar, com selos de cor para o estado de cada estoque:

🔴 **Crítico** · 🟠 **Alerta** · 🔵 **Estável** · 🟢 **Adequado**

## 🗺️ Próximos passos

- [ ] Notificações push automáticas por tipo sanguíneo
- [ ] Parcerias com mais hemocentros
- [ ] Gamificação com conquistas para doadores frequentes

## 👩‍💻 Autoria

Feito com ❤️ por **Leticia** e equipe.

<p align="center">
  <i>Sua atitude inspira. Obrigado por fazer parte do HemoConexão.</i> ❤️
</p>
