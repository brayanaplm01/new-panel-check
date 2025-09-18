require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const Database = require('./database/init');
const ApiPoller = require('./services/apiPoller');
const createElectoralRoutes = require('./routes/electoral');
const createInteractionsRoutes = require('./routes/interactions');
const createVerificationsRoutes = require('./routes/verifications');
const createMetricasEngagementRoutes = require('./routes/metricas_engagement');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express.json());

// Inicializar base de datos
const database = new Database();
let apiPoller = null;

// Configurar Socket.IO
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

// API Routes compatibles con el frontend Next.js

// Endpoint para obtener artículos (compatible con /api/articles)
app.get('/api/articles', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;

        const posts = await database.getPosts(limit, offset);
        const total = await database.getPostsCount();

        // Transformar formato para compatibilidad con frontend
        const articles = posts.map(post => ({
            id: post.id,
            title: post.claim,
            status: post.status,
            url: post.item_page_url,
            source: post.red_social,
            format: post.formato,
            createdAt: post.submitted_at,
            updatedAt: post.updated_at,
            tags: post.tags ? post.tags.split(', ') : [],
            engagement: {
                reactions: post.reacciones || 0,
                comments: post.comentarios || 0,
                shares: post.compartidos || 0,
                views: post.visualizaciones || 0
            },
            // Campos adicionales del schema
            metadata: {
                fue_creado_con_ia: post.fue_creado_con_ia,
                ataca_candidato: post.ataca_candidato,
                candidato_atacado: post.candidato_atacado,
                ataca_tse: post.ataca_tse,
                narrativa_tse: post.narrativa_tse,
                es_caso_es: post.es_caso_es,
                narrativa_desinformacion: post.narrativa_desinformacion,
                imita_medio: post.imita_medio,
                medio_imitado: post.medio_imitado,
                tipo_rumor: post.tipo_rumor,
                rumor_promovido: post.rumor_promovido
            }
        }));

        res.json({
            articles,
            total,
            page: Math.floor(offset / limit) + 1,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: 'Error fetching articles' });
    }
});

// Endpoint para obtener artículo por ID
app.get('/api/articles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const posts = await database.getPosts(1, 0);
        const post = posts.find(p => p.id == id);

        if (!post) {
            return res.status(404).json({ error: 'Artículo no encontrado' });
        }

        const article = {
            id: post.id,
            title: post.claim,
            status: post.status,
            url: post.item_page_url,
            source: post.red_social,
            format: post.formato,
            createdAt: post.submitted_at,
            updatedAt: post.updated_at,
            tags: post.tags ? post.tags.split(', ') : [],
            engagement: {
                reactions: post.reacciones || 0,
                comments: post.comentarios || 0,
                shares: post.compartidos || 0,
                views: post.visualizaciones || 0
            },
            metadata: {
                fue_creado_con_ia: post.fue_creado_con_ia,
                ataca_candidato: post.ataca_candidato,
                candidato_atacado: post.candidato_atacado,
                ataca_tse: post.ataca_tse,
                narrativa_tse: post.narrativa_tse,
                es_caso_es: post.es_caso_es,
                narrativa_desinformacion: post.narrativa_desinformacion,
                imita_medio: post.imita_medio,
                medio_imitado: post.medio_imitado,
                tipo_rumor: post.tipo_rumor,
                rumor_promovido: post.rumor_promovido
            }
        };

        res.json(article);
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ error: 'Error fetching article' });
    }
});

// Endpoint para búsqueda
app.get('/api/search', async (req, res) => {
    try {
        const { query, status, source, limit = 100, offset = 0 } = req.query;
        
        // Por ahora retornamos todos los posts y filtraremos en memoria
        // En el futuro se puede optimizar con filtros SQL
        const allPosts = await database.getPosts(1000, 0);
        
        let filteredPosts = allPosts;

        if (query) {
            filteredPosts = filteredPosts.filter(post => 
                post.claim.toLowerCase().includes(query.toLowerCase()) ||
                (post.tags && post.tags.toLowerCase().includes(query.toLowerCase()))
            );
        }

        if (status) {
            filteredPosts = filteredPosts.filter(post => post.status === status);
        }

        if (source) {
            filteredPosts = filteredPosts.filter(post => post.red_social === source);
        }

        const start = parseInt(offset);
        const end = start + parseInt(limit);
        const paginatedPosts = filteredPosts.slice(start, end);

        const articles = paginatedPosts.map(post => ({
            id: post.id,
            title: post.claim,
            status: post.status,
            url: post.item_page_url,
            source: post.red_social,
            format: post.formato,
            createdAt: post.submitted_at,
            updatedAt: post.updated_at,
            tags: post.tags ? post.tags.split(', ') : [],
            engagement: {
                reactions: post.reacciones || 0,
                comments: post.comentarios || 0,
                shares: post.compartidos || 0,
                views: post.visualizaciones || 0
            }
        }));

        res.json({
            articles,
            total: filteredPosts.length,
            page: Math.floor(start / parseInt(limit)) + 1,
            totalPages: Math.ceil(filteredPosts.length / parseInt(limit))
        });
    } catch (error) {
        console.error('Error searching articles:', error);
        res.status(500).json({ error: 'Error searching articles' });
    }
});

// Endpoint para estadísticas
app.get('/api/statistics', async (req, res) => {
    try {
        const total = await database.getPostsCount();
        const recent = await database.getRecentPosts(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
        
        // Obtener estadísticas por status
        const allPosts = await database.getPosts(10000, 0);
        const statusStats = {
            'Verificado': 0,
            'Falso': 0,
            'Engañoso': 0,
            'Sin iniciar': 0,
            'Inconcluso': 0,
            'En progreso': 0
        };

        allPosts.forEach(post => {
            if (statusStats.hasOwnProperty(post.status)) {
                statusStats[post.status]++;
            }
        });

        res.json({
            totalPosts: total,
            recentPosts: recent.length,
            lastUpdate: new Date().toISOString(),
            byStatus: statusStats
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Error fetching statistics' });
    }
});

// Endpoint para estadísticas de interacciones (compatibilidad con frontend)
app.get('/api/interactions-stats', async (req, res) => {
    try {
        // Usar el controlador de interacciones
        const InteractionsController = require('./controllers/interactionsController');
        const interactionsController = new InteractionsController(database);
        await interactionsController.getInteractionStats(req, res);
    } catch (error) {
        console.error('Error in compatibility endpoint:', error);
        res.status(500).json({ error: 'Error fetching interaction statistics' });
    }
});

// Endpoint para debug - ver qué fechas tenemos en la base de datos
app.get('/api/debug/dates', async (req, res) => {
    try {
        const allPosts = await database.getPosts(10000, 0);
        
        // Extraer y analizar todas las fechas
        const dateInfo = allPosts.map(post => ({
            id: post.id,
            submitted_at: post.submitted_at,
            parsed_date: post.submitted_at ? new Date(post.submitted_at).toISOString() : null,
            formatted_date: post.submitted_at ? new Date(post.submitted_at).toLocaleDateString() : null
        })).filter(info => info.submitted_at); // Solo posts con fecha
        
        // Obtener fechas únicas
        const uniqueDates = [...new Set(dateInfo.map(info => info.formatted_date))].sort();
        
        res.json({
            total_posts: allPosts.length,
            posts_with_dates: dateInfo.length,
            date_range: {
                oldest: dateInfo.length > 0 ? dateInfo.reduce((min, curr) => 
                    new Date(curr.submitted_at) < new Date(min.submitted_at) ? curr : min
                ) : null,
                newest: dateInfo.length > 0 ? dateInfo.reduce((max, curr) => 
                    new Date(curr.submitted_at) > new Date(max.submitted_at) ? curr : max
                ) : null
            },
            unique_dates: uniqueDates,
            sample_posts: dateInfo.slice(0, 10) // Primeros 10 para muestra
        });
    } catch (error) {
        console.error('Error fetching date debug info:', error);
        res.status(500).json({ error: 'Error fetching date debug info' });
    }
});

// Endpoint para debug - ver qué datos tenemos
app.get('/api/debug/posts', async (req, res) => {
    try {
        const allPosts = await database.getPosts(10, 0);
        
        const debugInfo = allPosts.map(post => ({
            id: post.id,
            claim: post.claim?.substring(0, 100) + '...',
            tags: post.tags,
            narrativa_desinformacion: post.narrativa_desinformacion,
            narrativa_tse: post.narrativa_tse,
            submitted_at: post.submitted_at,
            updated_at: post.updated_at,
            created_at: post.created_at
        }));
        
        res.json({
            success: true,
            data: debugInfo,
            total: allPosts.length
        });
    } catch (error) {
        console.error('Error in debug endpoint:', error);
        res.status(500).json({ error: 'Debug error' });
    }
});

// Endpoints del dashboard original para compatibilidad
app.get('/api/posts', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10000;
        const offset = parseInt(req.query.offset) || 0;

        const posts = await database.getPosts(limit, offset);
        const total = await database.getPostsCount();

        res.json({
            posts,
            total,
            limit,
            offset
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Error fetching posts' });
    }
});

app.get('/api/posts/recent', async (req, res) => {
    try {
        const since = req.query.since || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const posts = await database.getRecentPosts(since);

        res.json({ posts });
    } catch (error) {
        console.error('Error fetching recent posts:', error);
        res.status(500).json({ error: 'Error fetching recent posts' });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const total = await database.getPostsCount();
        const recent = await database.getRecentPosts(new Date(Date.now() - 60 * 60 * 1000).toISOString());

        res.json({
            totalPosts: total,
            recentPosts: recent.length,
            lastUpdate: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Error fetching stats' });
    }
});

app.get('/api/mode', (req, res) => {
    const config = require('./config/sources');
    const status = apiPoller ? apiPoller.getStatus() : { mode: config.type };

    res.json({
        mode: status.mode || config.type,
        status: status
    });
});

// Endpoint para probar conexión con Check API
app.get('/api/check/test', async (req, res) => {
    try {
        if (!apiPoller) {
            return res.status(500).json({
                error: 'API Poller no inicializado'
            });
        }

        const status = await apiPoller.getCheckApiStatus();
        res.json(status);
    } catch (error) {
        console.error('Error testing Check API:', error);
        res.status(500).json({
            error: 'Error testing Check API',
            message: error.message
        });
    }
});

// Endpoint para obtener estadísticas de Check API
app.get('/api/check/stats', async (req, res) => {
    try {
        if (!apiPoller || !apiPoller.checkClient) {
            return res.status(500).json({
                error: 'Check API client no disponible'
            });
        }

        const stats = await apiPoller.checkClient.getStatistics();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching Check API stats:', error);
        res.status(500).json({
            error: 'Error fetching Check API statistics',
            message: error.message
        });
    }
});

// Endpoint para refrescar datos de Check API
app.post('/api/check/refresh', async (req, res) => {
    try {
        if (!apiPoller || !apiPoller.checkClient) {
            return res.status(500).json({
                error: 'Check API client no disponible'
            });
        }

        const limit = parseInt(req.body.limit) || 1000;
        console.log(`🔄 Refrescando datos desde Check API con límite: ${limit}`);
        
        const medias = await apiPoller.checkClient.getMedias(limit, 0);

        let savedPosts = [];
        for (const media of medias) {
            try {
                const result = await database.insertPost(media);

                if (result.changes > 0) {
                    savedPosts.push({
                        ...media,
                        id: result.id
                    });
                }
            } catch (error) {
                console.error('Error guardando post:', error.message);
            }
        }

        if (savedPosts.length > 0) {
            emitNewData(savedPosts);
        }

        res.json({
            message: `Datos refrescados: ${savedPosts.length} nuevos posts de ${medias.length} obtenidos`,
            success: true,
            count: savedPosts.length,
            total: medias.length
        });
    } catch (error) {
        console.error('Error refreshing Check API data:', error);
        res.status(500).json({
            error: 'Error refreshing Check API data',
            message: error.message
        });
    }
});

// Función para emitir nuevos datos a clientes conectados
function emitNewData(newPosts, syncInfo = null) {
    if (newPosts && newPosts.length > 0) {
        console.log(`Emitiendo ${newPosts.length} nuevos posts a clientes`);
        io.emit('newPosts', newPosts);
    }

    if (syncInfo && syncInfo.type === 'sync' && syncInfo.deletedCount > 0) {
        console.log(`🔄 Emitiendo evento de sincronización: ${syncInfo.deletedCount} posts eliminados`);
        io.emit('postsDeleted', { deletedCount: syncInfo.deletedCount });
    }
}

// Endpoint de salud
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        apiPoller: apiPoller ? apiPoller.getStatus() : 'not initialized'
    });
});

// Endpoint de salud para API
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        apiPoller: apiPoller ? apiPoller.getStatus() : 'not initialized'
    });
});

// Inicializar aplicación
async function initializeApp() {
    try {
        // Inicializar base de datos
        await database.init(false);
        console.log('Base de datos inicializada');

        // Configurar rutas electorales
        app.use('/api/electoral', createElectoralRoutes(database));
        console.log('Rutas electorales configuradas');

        // Configurar rutas de interacciones
        app.use('/api/interactions', createInteractionsRoutes(database));
        console.log('Rutas de interacciones configuradas');

        // Configurar rutas de verificaciones
        app.use('/api/verifications', createVerificationsRoutes(database));
        console.log('Rutas de verificaciones configuradas');

        // Configurar rutas de métricas de engagement
        app.use('/api/metricas-engagement', createMetricasEngagementRoutes(database));
        console.log('Rutas de métricas de engagement configuradas');

        // Iniciar servidor HTTP primero
        server.listen(PORT, () => {
            console.log(`✅ Servidor ejecutándose en http://localhost:${PORT}`);
            console.log(`✅ Frontend esperado en: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
        });

        // Inicializar poller de API en segundo plano
        apiPoller = new ApiPoller(database, emitNewData);
        console.log('🔧 Iniciando poller de API en segundo plano...');
        
        // No esperar a que termine el polling inicial
        apiPoller.start().then(() => {
            console.log('✅ API Check Media conectada y funcionando');
        }).catch(error => {
            console.error('❌ Error iniciando poller de API:', error);
        });

    } catch (error) {
        console.error('Error inicializando aplicación:', error);
        process.exit(1);
    }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
    console.log('Cerrando aplicación...');

    if (apiPoller) {
        apiPoller.stop();
    }

    database.close();

    server.close(() => {
        console.log('Aplicación cerrada');
        process.exit(0);
    });
});

// Inicializar
initializeApp();
