const express = require('express');
const ElectoralController = require('../controllers/electoralController');

const router = express.Router();

// Función para inicializar las rutas con la instancia de la base de datos
function createElectoralRoutes(database) {
    const electoralController = new ElectoralController(database);

    // Ruta para análisis electoral
    router.get('/analysis', (req, res) => electoralController.getElectoralAnalysis(req, res));

    return router;
}

module.exports = createElectoralRoutes;
