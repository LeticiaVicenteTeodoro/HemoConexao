from fastapi import FastAPI
import json
import os

app = FastAPI()

# 🔥 MESMO PATH DO SCRAPER (IMPORTANTE!)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "estoque.json")


@app.get("/")
def home():
    return {"msg": "API rodando 🚀"}


@app.get("/estoque")
def get_estoque():
    try:
        # 🚨 arquivo não existe ainda
        if not os.path.exists(DATA_PATH):
            return {"erro": "dados ainda não coletados"}

        with open(DATA_PATH, "r", encoding="utf-8") as f:
            content = f.read().strip()

            # 🚨 arquivo vazio
            if not content:
                return {"erro": "arquivo vazio"}

            return json.loads(content)

    except json.JSONDecodeError:
        return {"erro": "json corrompido"}

    except Exception as e:
        return {"erro": str(e)}