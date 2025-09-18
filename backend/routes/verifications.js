const express = require('express');
const router = express.Router();

module.exports = (database) => {
    const VerificationsController = require('../controllers/verificationsController');
    const verificationsController = new VerificationsController(database);

    // Ruta principal para estadísticas del dashboard
    router.get('/dashboard', (req, res) => 
        verificationsController.getDashboardStats(req, res)
    );

    // Ruta para estadísticas detalladas de verificaciones
    router.get('/stats', (req, res) => 
        verificationsController.getVerificationStats(req, res)
    );

    // Ruta para obtener verificaciones por rango de fechas
    router.get('/date-range', (req, res) => 
        verificationsController.getVerificationsByDateRange(req, res)
    );

    return router;
};