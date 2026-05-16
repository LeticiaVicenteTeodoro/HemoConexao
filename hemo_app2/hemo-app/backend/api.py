from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

# 🔥 CORS (OBRIGATÓRIO pro React Native / Expo Web)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Caminho do JSON
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "estoque.json")


@app.get("/")
def home():
    return {"msg": "API rodando 🚀"}


@app.get("/estoque")
def get_estoque():
    try:
        if not os.path.exists(DATA_PATH):
            return {"erro": "arquivo não encontrado"}

        with open(DATA_PATH, "r", encoding="utf-8") as f:
            content = f.read().strip()

        if not content:
            return {"erro": "arquivo vazio"}

        return json.loads(content)

    except json.JSONDecodeError:
        return {"erro": "JSON inválido"}

    except Exception as e:
        return {"erro": str(e)}