import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("hemo.db");

function createTables() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      tipo_sanguineo TEXT
    );

    CREATE TABLE IF NOT EXISTS doacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT,
      local TEXT,
      tipo TEXT,
      observacao TEXT
    );
  `);
}

function cadastrarUsuario(
  nome,
  email,
  senha,
  tipoSanguineo
) {
  db.runSync(
    `
    INSERT INTO usuarios
    (nome, email, senha, tipo_sanguineo)
    VALUES (?, ?, ?, ?)
  `,
    [nome, email, senha, tipoSanguineo]
  );
}

function buscarUsuario(email, senha) {
  return db.getFirstSync(
    `
    SELECT *
    FROM usuarios
    WHERE email = ?
    AND senha = ?
  `,
    [email, senha]
  );
}

function listarDoacoes() {
  return db.getAllSync(
    "SELECT * FROM doacoes ORDER BY id DESC"
  );
}

function deletarDoacao(id) {
  db.runSync(
    "DELETE FROM doacoes WHERE id = ?",
    [id]
  );
}

export {
  createTables,
  cadastrarUsuario,
  buscarUsuario,
  listarDoacoes,
  deletarDoacao,
};

export default db;