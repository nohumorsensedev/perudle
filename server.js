const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Base de datos SQLite
const db = new sqlite3.Database('words.db');

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// Endpoint para obtener una palabra aleatoria
app.get('/word', (req, res) => {
  db.get('SELECT word FROM words ORDER BY RANDOM() LIMIT 1', (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al obtener la palabra.');
    } else {
      res.json({ word: row.word });
    }
  });
});

// Endpoint para verificar si la palabra existe
app.get('/validate/:word', (req, res) => {
  const inputWord = req.params.word.toUpperCase();

  db.get('SELECT word FROM words WHERE word = ?', [inputWord], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al validar la palabra.');
    } else if (row) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
