const express = require('express');
const InteractionsController = require('../controllers/interactionsController');

const router = express.Router();

// Función para inicializar las rutas con la instancia de la base de datos
function createInteractionsRoutes(database) {
    const interactionsController = new InteractionsController(database);

    // Ruta principal para estadísticas de interacciones
    router.get('/stats', (req, res) => interactionsController.getInteractionStats(req, res));

    // Rutas específicas por categoría
    router.get('/by-social-network', (req, res) => interactionsController.getStatisticsBySocialNetwork(req, res));
    router.get('/by-status', (req, res) => interactionsController.getStatisticsByStatus(req, res));
    router.get('/by-format', (req, res) => interactionsController.getStatisticsByFormat(req, res));
    router.get('/accumulated', (req, res) => interactionsController.getAccumulatedInteractionsStats(req, res));

    return router;
}

module.exports = createInteractionsRoutes;
