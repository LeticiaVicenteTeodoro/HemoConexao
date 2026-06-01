import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("hemo.db");

function createTables() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS doacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT,
      local TEXT,
      tipo TEXT,
      observacao TEXT
    );
  `);
}

function listarDoacoes() {
  return db.getAllSync("SELECT * FROM doacoes ORDER BY id DESC");
}

function deletarDoacao(id) {
  db.runSync("DELETE FROM doacoes WHERE id = ?", [id]);
}

export {
  createTables,
  listarDoacoes,
  deletarDoacao,
};

export default db;