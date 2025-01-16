const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configura la carpeta estática para servir archivos públicos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal: sirve el archivo index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta de prueba para la API (opcional)
app.get('/api/status', (req, res) => {
    res.json({ status: 'Servidor funcionando correctamente' });
});

// Manejo de rutas no existentes
app.use((req, res) => {
    res.status(404).send('Página no encontrada');
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
