const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

/**
 * ROTA DE TESTE
 */
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

/**
 * SALVAR ONBOARDING COMPLETO
 */
app.post("/onboarding", (req, res) => {
  const {
    email,
    acceptedOnboarding,
    notifications,
    sexo,
    tipo_sanguineo,
  } = req.body;

  const sql = `
    INSERT OR REPLACE INTO users (
      email,
      acceptedOnboarding,
      notifications,
      sexo,
      tipo_sanguineo
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      email,
      acceptedOnboarding ? 1 : 0,
      notifications ? 1 : 0,
      sexo,
      tipo_sanguineo,
    ],
    function (err) {
      if (err) {
        console.log(err.message);
        return res.status(500).json({ error: err.message });
      }

      res.json({
        success: true,
        id: this.lastID,
      });
    }
  );
});

/**
 * BUSCAR USUÁRIO
 */
app.get("/user/:email", (req, res) => {
  db.get(
    "SELECT * FROM users WHERE email = ?",
    [req.params.email],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json(row);
    }
  );
});

app.listen(3000, "0.0.0.0", () => {
  console.log("API rodando na porta 3000");
});