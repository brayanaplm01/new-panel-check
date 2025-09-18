const express = require('express');
const router = express.Router();

module.exports = (database) => {
    const MetricasEngagementController = require('../controllers/metricas_engagement');
    const metricasEngagementController = new MetricasEngagementController(database);

    // Ruta principal para métricas de engagement (últimas 24h vs promedio semanal)
    router.get('/dashboard', (req, res) => 
        metricasEngagementController.getEngagementMetrics(req, res)
    );

    // Ruta para estadísticas detalladas por rango de fechas
    router.get('/detailed', (req, res) => 
        metricasEngagementController.getDetailedEngagementStats(req, res)
    );

    // Ruta para obtener posts con mejor rendimiento
    router.get('/top-posts', (req, res) => 
        metricasEngagementController.getTopPerformingPosts(req, res)
    );

    return router;
};