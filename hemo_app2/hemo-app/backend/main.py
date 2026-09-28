from fastapi import FastAPI
import sqlite3
import random
import os
import resend
import requests
from dotenv import load_dotenv
import json
from pathlib import Path
import subprocess
import firebase_admin
from firebase_admin import credentials, auth, firestore
from pydantic import BaseModel

load_dotenv()

app = FastAPI()

if not firebase_admin._apps:
    firebase_admin.initialize_app(  options={
            "projectId": "hemo-conexao"
        })

db = firestore.client()

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
        cur.execute("ALTER TABLE usuarios ADD COLUMN sexo TEXT")
    except sqlite3.OperationalError:
        pass

    try:
        cur.execute("ALTER TABLE usuarios ADD COLUMN tipo_sanguineo TEXT")
    except sqlite3.OperationalError:
        pass

    try:
        cur.execute("ALTER TABLE usuarios ADD COLUMN firebase_uid TEXT")
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

def verificar_token_firebase(id_token: str):
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print("ERRO TOKEN FIREBASE:", e)
        return None
    

class UsuarioFirebase(BaseModel):
    id_token: str
    nome: str
    tipo_sanguineo: str = ""
    sexo: str = ""


@app.post("/usuario/firebase")
def salvar_usuario_firebase(dados: UsuarioFirebase):
    conn = None

    try:
        # 1. Verifica o token do Firebase
        decoded_token = verificar_token_firebase(dados.id_token)

        if not decoded_token:
            return {
                "sucesso": False,
                "mensagem": "Token Firebase inválido."
            }

        firebase_uid = decoded_token["uid"]
        email = decoded_token.get("email", "")

        nome = dados.nome
        tipo_sanguineo = dados.tipo_sanguineo
        sexo = dados.sexo

        # 2. Procura o usuário no Firestore
        doc_ref = db.collection("usuarios").document(firebase_uid)
        doc = doc_ref.get()

        legacy_id = None

        if doc.exists:
            dados_firestore = doc.to_dict()
            legacy_id = dados_firestore.get("legacy_id")

        # 3. Se ainda não tiver legacy_id, procura no SQLite
        if legacy_id is None:
            conn = conectar()
            cur = conn.cursor()

            cur.execute(
                """
                SELECT id
                FROM usuarios
                WHERE firebase_uid = ? OR email = ?
                LIMIT 1
                """,
                (firebase_uid, email)
            )

            usuario = cur.fetchone()

            if usuario:
                legacy_id = usuario[0]

        # 4. Salva/atualiza o perfil no Firestore
        doc_ref.set(
            {
                "nome": nome,
                "email": email,
                "tipo_sanguineo": tipo_sanguineo,
                "sexo": sexo,
                "legacy_id": legacy_id
            },
            merge=True
        )

        # 5. Mantém o SQLite como backup
        if conn is None:
            conn = conectar()
            cur = conn.cursor()

        cur.execute(
            """
            SELECT id
            FROM usuarios
            WHERE firebase_uid = ?
            LIMIT 1
            """,
            (firebase_uid,)
        )

        usuario = cur.fetchone()

        if usuario:
            # Usuário já existe no SQLite
            legacy_id = usuario[0]

            cur.execute(
                """
                UPDATE usuarios
                SET nome = ?,
                    email = ?,
                    tipo_sanguineo = ?,
                    sexo = ?
                WHERE firebase_uid = ?
                """,
                (
                    nome,
                    email,
                    tipo_sanguineo,
                    sexo,
                    firebase_uid
                )
            )

        else:
            # Procura pelo e-mail antes de criar outro usuário
            cur.execute(
                """
                SELECT id
                FROM usuarios
                WHERE email = ?
                LIMIT 1
                """,
                (email,)
            )

            usuario_email = cur.fetchone()

            if usuario_email:
                legacy_id = usuario_email[0]

                cur.execute(
                    """
                    UPDATE usuarios
                    SET nome = ?,
                        email = ?,
                        tipo_sanguineo = ?,
                        sexo = ?,
                        firebase_uid = ?,
                        validado = 1
                    WHERE id = ?
                    """,
                    (
                        nome,
                        email,
                        tipo_sanguineo,
                        sexo,
                        firebase_uid,
                        legacy_id
                    )
                )

            else:
                # Usuário totalmente novo
                cur.execute(
                    """
                    INSERT INTO usuarios
                    (
                        nome,
                        email,
                        senha,
                        tipo_sanguineo,
                        sexo,
                        firebase_uid,
                        validado
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        nome,
                        email,
                        "",
                        tipo_sanguineo,
                        sexo,
                        firebase_uid,
                        1
                    )
                )

                legacy_id = cur.lastrowid

        conn.commit()

        # 6. Garante que o Firestore tenha o ID legado correto
        doc_ref.set(
            {
                "legacy_id": legacy_id
            },
            merge=True
        )

        return {
            "sucesso": True,
            "mensagem": "Usuário salvo com sucesso.",
            "id": legacy_id,
            "firebase_uid": firebase_uid
        }

    except Exception as e:
        print("ERRO USUARIO FIREBASE:", e)

        return {
            "sucesso": False,
            "erro": str(e)
        }

    finally:
        if conn:
            conn.close()

@app.get("/usuario/firebase/{firebase_uid}")
def buscar_usuario_firebase(firebase_uid: str):
    try:
        # 1. Primeiro, procura o usuário no Firestore
        doc_ref = db.collection("usuarios").document(firebase_uid)
        doc = doc_ref.get()

        if doc.exists:
            dados = doc.to_dict()

            return {
                "sucesso": True,
                "id": dados.get("legacy_id"),
                "nome": dados.get("nome", ""),
                "email": dados.get("email", ""),
                "tipo_sanguineo": dados.get("tipo_sanguineo", ""),
                "sexo": dados.get("sexo", "")
            }

        # 2. Se ainda não estiver no Firestore,
        # busca os dados no Firebase Authentication
        firebase_user = auth.get_user(firebase_uid)

        email = firebase_user.email or ""
        nome = firebase_user.display_name or ""

        # 3. Procura o usuário antigo no SQLite
        conn = conectar()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT id, nome, email, tipo_sanguineo, sexo
            FROM usuarios
            WHERE firebase_uid = ? OR email = ?
            LIMIT 1
            """,
            (firebase_uid, email)
        )

        usuario = cursor.fetchone()

        if usuario:
            legacy_id = usuario[0]
            nome_sqlite = usuario[1] or nome
            email_sqlite = usuario[2] or email
            tipo_sanguineo = usuario[3] or ""
            sexo = usuario[4] or ""

            # 4. Copia o usuário antigo para o Firestore
            doc_ref.set({
                "nome": nome_sqlite,
                "email": email_sqlite,
                "tipo_sanguineo": tipo_sanguineo,
                "sexo": sexo,
                "legacy_id": legacy_id
            })

            # Garante que o firebase_uid esteja associado
            cursor.execute(
                """
                UPDATE usuarios
                SET firebase_uid = ?
                WHERE id = ?
                """,
                (firebase_uid, legacy_id)
            )

            conn.commit()
            conn.close()

            return {
                "sucesso": True,
                "id": legacy_id,
                "nome": nome_sqlite,
                "email": email_sqlite,
                "tipo_sanguineo": tipo_sanguineo,
                "sexo": sexo
            }

        conn.close()

        # 5. Usuário existe no Firebase Auth,
        # mas ainda não possui perfil no Firestore/SQLite
        doc_ref.set({
            "nome": nome,
            "email": email,
            "tipo_sanguineo": "",
            "sexo": "",
            "legacy_id": None
        })

        return {
            "sucesso": True,
            "id": None,
            "nome": nome,
            "email": email,
            "tipo_sanguineo": "",
            "sexo": ""
        }

    except Exception as e:
        print("ERRO BUSCAR USUARIO FIRESTORE:", e)

        return {
            "sucesso": False,
            "erro": str(e)
        }

    
class UsuarioAtualizacao(BaseModel):
    nome: str
    tipo_sanguineo: str = ""
    sexo: str = ""

@app.put("/usuario/firebase/{firebase_uid}")
def atualizar_usuario_firebase(firebase_uid: str, dados: UsuarioAtualizacao):
    try:
        # 1. Atualiza o usuário no Firestore
        doc_ref = db.collection("usuarios").document(firebase_uid)

        doc = doc_ref.get()

        if not doc.exists:
            return {
                "sucesso": False,
                "mensagem": "Usuário não encontrado no Firestore."
            }

        doc_ref.update({
            "nome": dados.nome,
            "tipo_sanguineo": dados.tipo_sanguineo,
            "sexo": dados.sexo
        })

        # 2. Mantemos o SQLite atualizado temporariamente
        # para preservar compatibilidade durante a migração
        conn = conectar()
        cursor = conn.cursor()

        cursor.execute(
            """
            UPDATE usuarios
            SET nome = ?,
                tipo_sanguineo = ?,
                sexo = ?
            WHERE firebase_uid = ?
            """,
            (
                dados.nome,
                dados.tipo_sanguineo,
                dados.sexo,
                firebase_uid
            )
        )

        conn.commit()
        conn.close()

        return {
            "sucesso": True,
            "mensagem": "Usuário atualizado com sucesso!",
            "nome": dados.nome,
            "tipo_sanguineo": dados.tipo_sanguineo,
            "sexo": dados.sexo
        }

    except Exception as e:
        print("ERRO ATUALIZAR USUARIO FIRESTORE:", e)

        return {
            "sucesso": False,
            "erro": str(e)
        }

@app.get("/historico/firebase/{firebase_uid}")
def historico_firebase(firebase_uid: str):
    try:
        doacoes_ref = (
            db.collection("usuarios")
            .document(firebase_uid)
            .collection("doacoes")
        )

        docs = doacoes_ref.stream()

        historico = []

        for doc in docs:
            dados = doc.to_dict()

            historico.append({
                "id": dados.get("legacy_id", doc.id),
                "data": dados.get("data", ""),
                "local": dados.get("local", ""),
                "tipo": dados.get("tipo", ""),
                "observacao": dados.get("observacao", "")
            })

        # Ordena pela data da doação, da mais recente para a mais antiga
        from datetime import datetime

        def converter_data(item):
            try:
                return datetime.strptime(
                    item["data"],
                    "%d/%m/%Y"
                )
            except (ValueError, TypeError):
                return datetime.min

        historico.sort(
            key=converter_data,
            reverse=True
        )

        return historico

    except Exception as e:
        print("ERRO HISTORICO FIRESTORE:", e)

        return {
            "sucesso": False,
            "erro": str(e)
        }

        
@app.post("/doacao/firebase/{firebase_uid}")
def registrar_doacao_firebase(
    firebase_uid: str,
    data: str,
    local: str,
    tipo: str,
    observacao: str = ""
):
    try:
        # Verifica se o usuário existe no Firestore
        usuario_ref = db.collection("usuarios").document(firebase_uid)
        usuario_doc = usuario_ref.get()

        if not usuario_doc.exists:
            return {
                "sucesso": False,
                "mensagem": "Usuário não encontrado no Firestore."
            }

        # Cria uma nova doação dentro do usuário
        doacao_ref = usuario_ref.collection("doacoes").document()

        doacao_ref.set({
            "data": data,
            "local": local,
            "tipo": tipo,
            "observacao": observacao
        })

        return {
            "sucesso": True,
            "mensagem": "Doação registrada com sucesso!",
            "id": doacao_ref.id
        }

    except Exception as e:
        print("ERRO REGISTRAR DOACAO FIRESTORE:", e)

        return {
            "sucesso": False,
            "erro": str(e)
        }

    
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

def verificar_tipos_com_estoque_baixo():
    try:
        arquivo = Path("data/estoque.json")

        if not arquivo.exists():
            return []

        with open(arquivo, "r", encoding="utf-8") as f:
            estoque_atual = json.load(f)

        tipos_baixos = []

        for tipo, status in estoque_atual.items():
            status = status.strip()

            if (
                "crítico" in status.lower()
                or "critico" in status.lower()
                or "alerta" in status.lower()
            ):
                tipos_baixos.append(f"{tipo}: {status}")

        return tipos_baixos

    except Exception as e:
        print("ERRO ESTOQUE:", e)
        return []

@app.get("/estoque")
def estoque():
    try:
        subprocess.run(
            ["python", "scraper.py"],
            check=True
        )

        arquivo = Path("data/estoque.json")

        if not arquivo.exists():
            return {
                "sucesso": False,
                "mensagem": "Arquivo de estoque não encontrado"
            }

        with open(arquivo, "r", encoding="utf-8") as f:
            dados = json.load(f)

        return dados

    except Exception as e:
        print("ERRO ESTOQUE:", e)
        return {
            "sucesso": False,
            "erro": str(e)
        }

@app.post("/notificar_estoque_baixo")
def notificar_estoque_baixo():
    conn = None

    try:
        # 1. Atualiza o arquivo data/estoque.json usando o scraper
        try:
            subprocess.run(
                ["python", "scraper.py"],
                check=True
            )
        except Exception as e:
            print("ERRO AO ATUALIZAR ESTOQUE:", e)

        # 2. Lê o estoque real salvo no JSON
        tipos_baixos = verificar_tipos_com_estoque_baixo()

        if not tipos_baixos:
            return {
                "sucesso": True,
                "mensagem": "Nenhum estoque baixo no momento",
                "notificacao_enviada": False
            }

        mensagem = "Estoque em atenção: " + ", ".join(tipos_baixos)

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
                    "body": mensagem,
                    "sound": "default",
                },
                timeout=10
            )

            enviados.append(resposta.json())

        return {
            "sucesso": True,
            "notificacao_enviada": True,
            "tipos_baixos": tipos_baixos,
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