const sqlite3 = require('sqlite3').verbose();

// Conectar a la base de datos (se crea si no existe)
const db = new sqlite3.Database('./words.db', (err) => {
  if (err) {
    console.error('Error al abrir la base de datos:', err.message);
  } else {
    console.log('Base de datos conectada.');
  }
});

// Crear tabla para las palabras
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS words (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            word TEXT NOT NULL
          )`);
});

// Insertar palabras si no están en la tabla
const words = ['causa', 'pisco', 'chifa', 'llama', 'cañas'];
words.forEach(word => {
  db.run(`INSERT INTO words (word) VALUES (?)`, [word], (err) => {
    if (err) {
      console.log(`La palabra '${word}' ya existe.`);
    }
  });
});

module.exports = db;
