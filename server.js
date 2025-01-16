const express = require('express');
const bodyParser = require('body-parser');
const { getWords, addWord } = require('./database'); // Módulos de la base de datos

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); // Sirve archivos estáticos desde la carpeta "public"

// Rutas
app.get('/api/words', async (req, res) => {
    try {
        const words = await getWords();
        res.json(words);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener palabras' });
    }
});

app.post('/api/words', async (req, res) => {
    const { word } = req.body;
    try {
        await addWord(word);
        res.status(201).json({ message: 'Palabra añadida correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al añadir palabra' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
