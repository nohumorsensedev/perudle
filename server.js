const express = require('express');
const db = require('./database'); // Conexión a la base de datos
const path = require('path'); // Para manejar rutas
const app = express();
const PORT = 3000;

// Servir archivos estáticos desde la carpeta actual
app.use(express.static(__dirname));

// Ruta principal para cargar el juego
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para obtener una palabra aleatoria
app.get('/word', (req, res) => {
  db.get(`SELECT word FROM words ORDER BY RANDOM() LIMIT 1`, [], (err, row) => {
    if (err) {
      return res.status(500).send('Error al obtener la palabra');
    }
    res.json({ word: row.word });
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
