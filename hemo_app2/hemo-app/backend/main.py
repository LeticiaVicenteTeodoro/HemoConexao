from fastapi import FastAPI
import sqlite3
import random
import os
import resend
import requests
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

DB_PATH = "banco.db"

resend.api_key = os.environ.get("RESEND_API_KEY")


def conectar():
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA busy_timeout=10000;")
    return conn


def init_db():
    conn = conectar()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS usuarios(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        email TEXT UNIQUE,
        senha TEXT
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS doacoes(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        data TEXT,
        local TEXT,
        tipo TEXT,
        observacao TEXT,
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    )
    """)


    cur.execute("""
    CREATE TABLE IF NOT EXISTS push_tokens(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT UNIQUE
    )
    """)

    try:
        cur.execute("ALTER TABLE usuarios ADD COLUMN token TEXT")
    except sqlite3.OperationalError:
        pass

    try:
        cur.execute("ALTER TABLE usuarios ADD COLUMN validado INTEGER DEFAULT 0")
    except sqlite3.OperationalError:
        pass

    try:
        cur.execute("ALTER TABLE usuarios ADD COLUMN tipo_sanguineo TEXT")
    except sqlite3.OperationalError:
        pass

    conn.commit()
    conn.close()


def enviar_email_token(email, nome, token):
    if not resend.api_key:
        raise Exception("RESEND_API_KEY não configurada.")

    params = {
        "from": "HemoConexão <onboarding@resend.dev>",
        "to": [email],
        "subject": "Confirmação de cadastro - HemoConexão",
        "html": f"""
        <div style="font-family: Arial, sans-serif;">
            <h2>Olá, {nome}!</h2>
            <p>Seu código de confirmação do HemoConexão é:</p>
            <h1 style="color:#E30613;">{token}</h1>
            <p>Digite esse código no aplicativo para ativar sua conta.</p>
        </div>
        """
    }

    resend.Emails.send(params)


init_db()


@app.get("/")
def home():
    return {"status": "ok"}

@app.post("/cadastro")
def cadastro(nome: str, email: str, senha: str, tipo_sanguineo: str = ""):
    token = str(random.randint(100000, 999999))
    conn = None

    try:
        conn = conectar()
        cur = conn.cursor()

        cur.execute(
            """
            INSERT INTO usuarios
            (nome, email, senha, token, validado, tipo_sanguineo)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (nome, email, senha, token, 0, tipo_sanguineo)
        )

        conn.commit()
        conn.close()
        conn = None

        enviar_email_token(email, nome, token)

        return {
            "sucesso": True,
            "mensagem": "Usuário criado. Verifique seu email para confirmar.",
            "email": email
        }

    except sqlite3.IntegrityError:
        return {
            "sucesso": False,
            "mensagem": "Email já cadastrado"
        }

    except Exception as e:
        print("ERRO CADASTRO:", e)
        return {
            "sucesso": False,
            "erro": str(e)
        }

    finally:
        if conn:
            conn.close()


@app.post("/confirmar")
def confirmar(email: str, token: str):
    conn = None

    try:
        conn = conectar()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT id
            FROM usuarios
            WHERE email = ?
            AND token = ?
            """,
            (email, token)
        )

        usuario = cur.fetchone()

        if not usuario:
            return {
                "sucesso": False,
                "mensagem": "Token inválido"
            }

        cur.execute(
            """
            UPDATE usuarios
            SET validado = 1,
                token = NULL
            WHERE email = ?
            """,
            (email,)
        )

        conn.commit()

        return {
            "sucesso": True,
            "mensagem": "Email confirmado com sucesso"
        }

    except Exception as e:
        print("ERRO CONFIRMAR:", e)
        return {
            "sucesso": False,
            "erro": str(e)
        }

    finally:
        if conn:
            conn.close()


@app.post("/login")
def login(email: str, senha: str):
    conn = None

    try:
        conn = conectar()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT id, nome, email, validado, tipo_sanguineo
            FROM usuarios
            WHERE email = ?
            AND senha = ?
            """,
            (email, senha)
        )

        usuario = cur.fetchone()

        if not usuario:
            return {
                "sucesso": False,
                "mensagem": "Login inválido"
            }

        if usuario[3] != 1:
            return {
                "sucesso": False,
                "mensagem": "Email ainda não confirmado"
            }

        return {
            "sucesso": True,
            "id": usuario[0],
            "nome": usuario[1],
            "email": usuario[2],
            "tipo_sanguineo": usuario[4]
        }

    except Exception as e:
        print("ERRO LOGIN:", e)
        return {
            "sucesso": False,
            "erro": str(e)
        }

    finally:
        if conn:
            conn.close()


@app.post("/doacao")
def registrar_doacao(
    usuario_id: int,
    data: str,
    local: str,
    tipo: str,
    observacao: str = ""
):
    conn = None

    try:
        conn = conectar()
        cur = conn.cursor()

        cur.execute(
            """
            INSERT INTO doacoes
            (usuario_id, data, local, tipo, observacao)
            VALUES (?, ?, ?, ?, ?)
            """,
            (usuario_id, data, local, tipo, observacao)
        )

        conn.commit()

        return {
            "sucesso": True,
            "mensagem": "Doação registrada"
        }

    except Exception as e:
        print("ERRO DOACAO:", e)
        return {
            "sucesso": False,
            "erro": str(e)
        }

    finally:
        if conn:
            conn.close()


@app.get("/historico/{usuario_id}")
def historico(usuario_id: int):
    conn = None

    try:
        conn = conectar()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT id, data, local, tipo, observacao
            FROM doacoes
            WHERE usuario_id = ?
            ORDER BY id DESC
            """,
            (usuario_id,)
        )

        dados = cur.fetchall()

        resultado = []

        for item in dados:
            resultado.append({
                "id": item[0],
                "data": item[1],
                "local": item[2],
                "tipo": item[3],
                "observacao": item[4]
            })

        return resultado

    except Exception as e:
        print("ERRO HISTORICO:", e)
        return []

    finally:
        if conn:
            conn.close()

@app.delete("/usuario/{email}")
def deletar_usuario(email: str):
    conn = conectar()
    cur = conn.cursor()

    cur.execute(
        "DELETE FROM usuarios WHERE email = ?",
        (email,)
    )

    conn.commit()
    conn.close()

    return {"sucesso": True}

@app.post("/registrar_push_token")
def registrar_push_token(token: str):
    conn = None

    try:
        conn = conectar()
        cur = conn.cursor()

        cur.execute(
            """
            INSERT OR IGNORE INTO push_tokens(token)
            VALUES(?)
            """,
            (token,)
        )

        conn.commit()

        return {
            "sucesso": True,
            "mensagem": "Token salvo"
        }

    except Exception as e:
        print("ERRO PUSH TOKEN:", e)
        return {
            "sucesso": False,
            "erro": str(e)
        }

    finally:
        if conn:
            conn.close()


@app.post("/notificar_estoque_baixo")
def notificar_estoque_baixo():
    conn = None

    try:
        conn = conectar()
        cur = conn.cursor()

        cur.execute("SELECT token FROM push_tokens")
        tokens = cur.fetchall()

        enviados = []

        for item in tokens:
            token = item[0]

            resposta = requests.post(
                "https://api.expo.dev/v2/push/send",
                json={
                    "to": token,
                    "title": "⚠️ Estoque Baixo",
                    "body": "Alguns tipos sanguíneos estão com estoque baixo. Doe sangue ❤️",
                    "sound": "default",
                },
                timeout=10
            )

            enviados.append(resposta.json())

        return {
            "sucesso": True,
            "tokens_encontrados": len(tokens),
            "respostas": enviados
        }

    except Exception as e:
        print("ERRO NOTIFICAR ESTOQUE:", e)
        return {
            "sucesso": False,
            "erro": str(e)
        }

    finally:
        if conn:
            conn.close()