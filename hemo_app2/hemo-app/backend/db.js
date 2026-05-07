const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database/database.db", (err) => {
  if (err) {
    console.log("Erro ao conectar SQLite:", err.message);
  } else {
    console.log("SQLite conectado!");

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        acceptedOnboarding INTEGER,
        notifications INTEGER,
        sexo TEXT,
        tipo_sanguineo TEXT
      )
    `);
  }
});

module.exports = db;