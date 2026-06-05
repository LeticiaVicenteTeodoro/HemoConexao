from fastapi import FastAPI
import sqlite3

app = FastAPI()

DB_PATH = "banco.db"


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Tabela de usuários
    cur.execute("""
    CREATE TABLE IF NOT EXISTS usuarios(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        email TEXT UNIQUE,
        senha TEXT
    )
    """)

    # Tabela de doações
    cur.execute("""
    CREATE TABLE IF NOT EXISTS doacoes(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        data TEXT,
        local TEXT,
        tipo TEXT,
        observacao TEXT,
        FOREIGN KEY(usuario_id)
        REFERENCES usuarios(id)
    )
    """)

    conn.commit()
    conn.close()


init_db()


@app.get("/")
def home():
    return {"status": "ok"}


# CADASTRO
@app.post("/cadastro")
def cadastro(
    nome: str,
    email: str,
    senha: str
):
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        cur.execute(
            """
            INSERT INTO usuarios
            (nome,email,senha)
            VALUES(?,?,?)
            """,
            (nome, email, senha)
        )

        conn.commit()

        return {
            "sucesso": True,
            "mensagem": "Usuário criado"
        }

    except sqlite3.IntegrityError:
        return {
            "sucesso": False,
            "mensagem": "Email já cadastrado"
        }

    except Exception as e:
        return {
            "sucesso": False,
            "erro": str(e)
        }

    finally:
        conn.close()


# LOGIN
@app.post("/login")
def login(
    email: str,
    senha: str
):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute(
        """
        SELECT
            id,
            nome,
            email
        FROM usuarios
        WHERE email = ?
        AND senha = ?
        """,
        (email, senha)
    )

    usuario = cur.fetchone()

    conn.close()

    if usuario:
        return {
            "sucesso": True,
            "id": usuario[0],
            "nome": usuario[1],
            "email": usuario[2]
        }

    return {
        "sucesso": False,
        "mensagem": "Login inválido"
    }


# REGISTRAR DOAÇÃO
@app.post("/doacao")
def registrar_doacao(
    usuario_id: int,
    data: str,
    local: str,
    tipo: str,
    observacao: str = ""
):
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        cur.execute(
            """
            INSERT INTO doacoes
            (
                usuario_id,
                data,
                local,
                tipo,
                observacao
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                usuario_id,
                data,
                local,
                tipo,
                observacao
            )
        )

        conn.commit()

        return {
            "sucesso": True,
            "mensagem": "Doação registrada"
        }

    except Exception as e:
        return {
            "sucesso": False,
            "erro": str(e)
        }

    finally:
        conn.close()


# HISTÓRICO DE DOAÇÕES
@app.get("/historico/{usuario_id}")
def historico(usuario_id: int):

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute(
        """
        SELECT
            id,
            data,
            local,
            tipo,
            observacao
        FROM doacoes
        WHERE usuario_id = ?
        ORDER BY id DESC
        """,
        (usuario_id,)
    )

    dados = cur.fetchall()

    conn.close()

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