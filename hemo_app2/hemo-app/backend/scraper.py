from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import json
import os

URL = "https://hemominas.mg.gov.br"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "estoque.json")

TIPOS = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]


def coletar_dados():
    options = Options()
    options.add_argument("--headless=new")

    driver = webdriver.Chrome(options=options)

    try:
        driver.get(URL)

        elementos = driver.find_elements(By.CSS_SELECTOR, "div")

        estoque = {}

        for el in elementos:
            try:
                tipo = el.find_element(By.TAG_NAME, "b").text.strip()
                status = el.find_element(By.TAG_NAME, "p").text.strip()

                if tipo in TIPOS:
                    estoque[tipo] = status
            except:
                continue

        return estoque

    except Exception as e:
        print("ERRO:", e)
        return None

    finally:
        driver.quit()


def salvar_json(dados):
    os.makedirs("data", exist_ok=True)

    if not dados:
        return

    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(dados, f, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    dados = coletar_dados()
    salvar_json(dados)
    print("OK:", dados)