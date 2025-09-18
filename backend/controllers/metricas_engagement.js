class MetricasEngagementController {
    constructor(database) {
        this.database = database;
    }

    async getEngagementMetrics(req, res) {
        try {
            console.log('📊 Obteniendo métricas de engagement del día de hoy...');
            
            // Obtener todos los posts
            const allPosts = await this.database.getPosts(10000, 0);
            
            // Calcular inicio y fin del día actual
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            
            console.log('📅 Fecha de filtro:', {
                now: now.toISOString(),
                startOfDay: startOfDay.toISOString(),
                endOfDay: endOfDay.toISOString()
            });

            // Filtrar posts del día de hoy
            const todayPosts = allPosts.filter(post => {
                if (!post.submitted_at && !post.created_at) return false;
                const postDate = new Date(post.submitted_at || post.created_at);
                const isToday = postDate >= startOfDay && postDate <= endOfDay;
                
                // Log detallado para depuración
                if (isToday) {
                    console.log('✅ Post del día de hoy:', {
                        id: post.id,
                        fecha: postDate.toISOString(),
                        visualizaciones: post.visualizaciones || 0,
                        reacciones: post.reacciones || 0,
                        comentarios: post.comentarios || 0,
                        compartidos: post.compartidos || 0
                    });
                }
                
                return isToday;
            });

            console.log('📊 Posts filtrados:', {
                total: allPosts.length,
                hoy: todayPosts.length
            });

            // Mostrar muestra de posts para depuración
            console.log('🔍 Muestra de posts de hoy:', todayPosts.slice(0, 5).map(post => ({
                id: post.id,
                submitted_at: post.submitted_at,
                created_at: post.created_at,
                visualizaciones: post.visualizaciones,
                reacciones: post.reacciones,
                comentarios: post.comentarios,
                compartidos: post.compartidos
            })));

            // Verificar todos los posts del día
            console.log('📋 TODOS los posts del día de hoy:');
            todayPosts.forEach((post, index) => {
                console.log(`Post ${index + 1}/${todayPosts.length} - ID: ${post.id}`, {
                    visualizaciones: post.visualizaciones || 0,
                    reacciones: post.reacciones || 0,
                    comentarios: post.comentarios || 0,
                    compartidos: post.compartidos || 0,
                    fecha: post.submitted_at || post.created_at
                });
            });

            // Calcular totales del día de hoy
            const totals = todayPosts.reduce((acc, post) => {
                const vis = post.visualizaciones || 0;
                const rea = post.reacciones || 0;
                const com = post.comentarios || 0;
                const comp = post.compartidos || 0;
                
                acc.visualizaciones += vis;
                acc.reacciones += rea;
                acc.comentarios += com;
                acc.compartidos += comp;
                acc.posts += 1;
                
                console.log(`📈 Sumando post ${post.id}: vis=${vis}, rea=${rea}, com=${com}, comp=${comp}`);
                
                return acc;
            }, { 
                visualizaciones: 0, 
                reacciones: 0, 
                comentarios: 0, 
                compartidos: 0, 
                posts: 0 
            });

            console.log('🧮 Totales calculados:', totals);

            // Construir respuesta con métricas simples (sin tendencias ni comparaciones)
            const metrics = {
                visualizaciones: {
                    value: totals.visualizaciones,
                    trend: 'neutral',
                    change: 0
                },
                reacciones: {
                    value: totals.reacciones,
                    trend: 'neutral',
                    change: 0
                },
                comentarios: {
                    value: totals.comentarios,
                    trend: 'neutral',
                    change: 0
                },
                compartidos: {
                    value: totals.compartidos,
                    trend: 'neutral',
                    change: 0
                },
                nuevos_posts: {
                    value: totals.posts,
                    trend: 'neutral',
                    change: 0
                }
            };

            console.log('📈 Métricas calculadas:', metrics);

            res.json({
                success: true,
                metrics,
                period: {
                    label: 'Día de hoy',
                    start: startOfDay.toISOString(),
                    end: endOfDay.toISOString(),
                    posts: todayPosts.length
                },
                totalPosts: allPosts.length,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error obteniendo métricas de engagement:', error);
            res.status(500).json({ 
                success: false,
                error: 'Error obteniendo métricas de engagement',
                message: error.message
            });
        }
    }

    async getDetailedEngagementStats(req, res) {
        try {
            const { startDate, endDate, groupBy = 'day' } = req.query;
            
            let start, end;
            if (startDate && endDate) {
                start = new Date(startDate + 'T00:00:00.000Z');
                end = new Date(endDate + 'T23:59:59.999Z');
            } else {
                // Por defecto: últimos 7 días
                end = new Date();
                start = new Date(end.getTime() - (7 * 24 * 60 * 60 * 1000));
            }

            const allPosts = await this.database.getPosts(10000, 0);
            
            // Filtrar posts por rango de fechas
            const filteredPosts = allPosts.filter(post => {
                if (!post.submitted_at && !post.created_at) return false;
                const postDate = new Date(post.submitted_at || post.created_at);
                return postDate >= start && postDate <= end;
            });

            // Agrupar por período
            const groupedData = {};
            
            filteredPosts.forEach(post => {
                const postDate = new Date(post.submitted_at || post.created_at);
                let groupKey;
                
                switch (groupBy) {
                    case 'week':
                        const startOfWeek = new Date(postDate);
                        startOfWeek.setDate(postDate.getDate() - postDate.getDay());
                        groupKey = startOfWeek.toISOString().split('T')[0];
                        break;
                    case 'month':
                        groupKey = `${postDate.getFullYear()}-${String(postDate.getMonth() + 1).padStart(2, '0')}`;
                        break;
                    default:
                        groupKey = postDate.toISOString().split('T')[0];
                }
                
                if (!groupedData[groupKey]) {
                    groupedData[groupKey] = {
                        date: groupKey,
                        visualizaciones: 0,
                        reacciones: 0,
                        comentarios: 0,
                        compartidos: 0,
                        posts: 0,
                        totalEngagement: 0
                    };
                }
                
                groupedData[groupKey].visualizaciones += post.visualizaciones || 0;
                groupedData[groupKey].reacciones += post.reacciones || 0;
                groupedData[groupKey].comentarios += post.comentarios || 0;
                groupedData[groupKey].compartidos += post.compartidos || 0;
                groupedData[groupKey].posts += 1;
                groupedData[groupKey].totalEngagement += 
                    (post.visualizaciones || 0) + (post.reacciones || 0) + 
                    (post.comentarios || 0) + (post.compartidos || 0);
            });

            // Convertir a array y ordenar por fecha
            const result = Object.values(groupedData).sort((a, b) => 
                new Date(a.date) - new Date(b.date)
            );

            res.json({
                success: true,
                data: result,
                summary: {
                    totalPosts: filteredPosts.length,
                    totalVisualizaciones: filteredPosts.reduce((sum, p) => sum + (p.visualizaciones || 0), 0),
                    totalReacciones: filteredPosts.reduce((sum, p) => sum + (p.reacciones || 0), 0),
                    totalComentarios: filteredPosts.reduce((sum, p) => sum + (p.comentarios || 0), 0),
                    totalCompartidos: filteredPosts.reduce((sum, p) => sum + (p.compartidos || 0), 0)
                },
                dateRange: { startDate: start.toISOString(), endDate: end.toISOString() },
                groupBy,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error obteniendo estadísticas detalladas de engagement:', error);
            res.status(500).json({ 
                success: false,
                error: 'Error obteniendo estadísticas detalladas de engagement',
                message: error.message
            });
        }
    }

    async getTopPerformingPosts(req, res) {
        try {
            const { limit = 10, metric = 'total', period = '24h' } = req.query;
            
            // Calcular período
            const now = new Date();
            let startDate;
            switch (period) {
                case '7d':
                    startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
                    break;
                case '30d':
                    startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
                    break;
                default: // 24h
                    startDate = new Date(now.getTime() - (24 * 60 * 60 * 1000));
            }

            const allPosts = await this.database.getPosts(10000, 0);
            
            // Filtrar por período
            const filteredPosts = allPosts.filter(post => {
                if (!post.submitted_at && !post.created_at) return false;
                const postDate = new Date(post.submitted_at || post.created_at);
                return postDate >= startDate;
            });

            // Calcular engagement y ordenar
            const postsWithEngagement = filteredPosts.map(post => {
                const visualizaciones = post.visualizaciones || 0;
                const reacciones = post.reacciones || 0;
                const comentarios = post.comentarios || 0;
                const compartidos = post.compartidos || 0;
                const totalEngagement = visualizaciones + reacciones + comentarios + compartidos;

                return {
                    id: post.id,
                    claim: post.claim ? post.claim.substring(0, 100) + '...' : 'Sin título',
                    red_social: post.red_social,
                    status: post.status,
                    submitted_at: post.submitted_at || post.created_at,
                    engagement: {
                        visualizaciones,
                        reacciones,
                        comentarios,
                        compartidos,
                        total: totalEngagement
                    }
                };
            });

            // Ordenar según la métrica solicitada
            let sortedPosts;
            switch (metric) {
                case 'visualizaciones':
                    sortedPosts = postsWithEngagement.sort((a, b) => b.engagement.visualizaciones - a.engagement.visualizaciones);
                    break;
                case 'reacciones':
                    sortedPosts = postsWithEngagement.sort((a, b) => b.engagement.reacciones - a.engagement.reacciones);
                    break;
                case 'comentarios':
                    sortedPosts = postsWithEngagement.sort((a, b) => b.engagement.comentarios - a.engagement.comentarios);
                    break;
                case 'compartidos':
                    sortedPosts = postsWithEngagement.sort((a, b) => b.engagement.compartidos - a.engagement.compartidos);
                    break;
                default: // total
                    sortedPosts = postsWithEngagement.sort((a, b) => b.engagement.total - a.engagement.total);
            }

            // Limitar resultados
            const topPosts = sortedPosts.slice(0, parseInt(limit));

            res.json({
                success: true,
                posts: topPosts,
                summary: {
                    totalPosts: filteredPosts.length,
                    period,
                    metric,
                    limit: parseInt(limit)
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error obteniendo posts con mejor rendimiento:', error);
            res.status(500).json({ 
                success: false,
                error: 'Error obteniendo posts con mejor rendimiento',
                message: error.message
            });
        }
    }
}

module.exports = MetricasEngagementController;