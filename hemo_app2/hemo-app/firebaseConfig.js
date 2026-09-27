import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBrA62Vvi6sYoj6bZZoOW10s7QOVI7rm5c",
  authDomain: "hemo-conexao.firebaseapp.com",
  projectId: "hemo-conexao",
  storageBucket: "hemo-conexao.firebasestorage.app",
  messagingSenderId: "555246546116",
  appId: "1:555246546116:web:2748cbad0cc8e773e72d91",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);