class InteractionsController {
    constructor(database) {
        this.database = database;
    }

    async getInteractionStats(req, res) {
        try {
            const { date } = req.query;
            let allPosts;
            
            if (date) {
                // Filtrar por fecha específica
                const targetDate = new Date(date + 'T00:00:00.000Z');
                const startOfDay = new Date(targetDate);
                const endOfDay = new Date(targetDate);
                endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
                endOfDay.setUTCMilliseconds(-1); // 23:59:59.999 del día
                
                // Obtener todos los posts y filtrar por fecha
                const allPostsData = await this.database.getPosts(10000, 0);
                
                allPosts = allPostsData.filter(post => {
                    if (!post.submitted_at) return false;
                    const postDate = new Date(post.submitted_at);
                    const isInRange = postDate >= startOfDay && postDate <= endOfDay;
                    
                    // Log algunas fechas para debugging
                    if (allPostsData.indexOf(post) < 5) {
                        console.log('📅 Post date sample:', {
                            submitted_at: post.submitted_at,
                            postDate: postDate.toISOString(),
                            isInRange
                        });
                    }
                    
                    return isInRange;
                });
                
                console.log('📊 Posts after filtering:', allPosts.length);
            } else {
                // Obtener todos los posts (comportamiento original)
                allPosts = await this.database.getPosts(10000, 0);
                console.log('📊 Total posts (no filter):', allPosts.length);
            }
            
            // Estadísticas por Red Social
            const socialStats = {
                'TikTok': 0,
                'Facebook': 0,
                'Instagram': 0,
                'Twitter/X': 0,
                'YouTube': 0,
                'WhatsApp': 0,
            };
            
            // Estadísticas por Status
            const statusStats = {
                'Verificado': 0,
                'Falso': 0,
                'Engañoso': 0,
                'Sin iniciar': 0,
                'En progreso': 0,
                'Inconcluso': 0
            };
            
            // Estadísticas por Formato
            const formatStats = {
                'Audiovisual': 0,
                'Imagen': 0,
                'Texto': 0,
                'Audio': 0,
                'Otros': 0
            };
            
            // Estadísticas por Tags
            const tagStats = {};
            
            allPosts.forEach(post => {
                // Contar publicaciones por categoría (no sumar interacciones)
                
                // Por Red Social - Contar publicaciones
                const social = post.red_social || 'Otros';
                if (socialStats.hasOwnProperty(social)) {
                    socialStats[social] += 1;
                } else {
                    socialStats['Otros'] = (socialStats['Otros'] || 0) + 1;
                }
                
                // Por Status - Contar publicaciones
                const status = post.status || 'Sin iniciar';
                if (statusStats.hasOwnProperty(status)) {
                    statusStats[status] += 1;
                } else {
                    statusStats['Sin iniciar'] += 1;
                }
                
                // Por Formato - Contar publicaciones
                const format = post.formato || 'Otros';
                if (formatStats.hasOwnProperty(format)) {
                    formatStats[format] += 1;
                } else {
                    formatStats['Otros'] = (formatStats['Otros'] || 0) + 1;
                }
                
                // Por Tags - Contar publicaciones
                if (post.tags && post.tags.trim()) {
                    const tags = post.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
                    tags.forEach(tag => {
                        if (tag && tag !== '') {
                            tagStats[tag] = (tagStats[tag] || 0) + 1;
                        }
                    });
                } else {
                    tagStats['Sin tags'] = (tagStats['Sin tags'] || 0) + 1;
                }
            });

            res.json({
                socialMedia: socialStats,
                status: statusStats,
                format: formatStats,
                tags: tagStats,
                totalInteractions: allPosts.length // Total de publicaciones, no interacciones
            });
        } catch (error) {
            console.error('Error fetching interaction statistics:', error);
            res.status(500).json({ error: 'Error fetching interaction statistics' });
        }
    }

    async getStatisticsBySocialNetwork(req, res) {
        try {
            const allPosts = await this.database.getPosts(10000, 0);
            const socialNetworkStats = {};

            allPosts.forEach(post => {
                const redSocial = post.red_social || 'Sin especificar';
                
                if (!socialNetworkStats[redSocial]) {
                    socialNetworkStats[redSocial] = {
                        count: 0,
                        totalReactions: 0,
                        totalComments: 0,
                        totalShares: 0,
                        totalViews: 0,
                        totalInteractions: 0
                    };
                }

                socialNetworkStats[redSocial].count++;
                socialNetworkStats[redSocial].totalReactions += post.reacciones || 0;
                socialNetworkStats[redSocial].totalComments += post.comentarios || 0;
                socialNetworkStats[redSocial].totalShares += post.compartidos || 0;
                socialNetworkStats[redSocial].totalViews += post.visualizaciones || 0;
                socialNetworkStats[redSocial].totalInteractions += 
                    (post.reacciones || 0) + (post.comentarios || 0) + (post.compartidos || 0) + (post.visualizaciones || 0);
            });

            res.json({
                success: true,
                data: socialNetworkStats,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error fetching social network statistics:', error);
            res.status(500).json({ error: 'Error fetching social network statistics' });
        }
    }

    async getStatisticsByStatus(req, res) {
        try {
            const allPosts = await this.database.getPosts(10000, 0);
            const statusStats = {};

            allPosts.forEach(post => {
                const status = post.status || 'Sin estado';
                
                if (!statusStats[status]) {
                    statusStats[status] = {
                        count: 0,
                        totalReactions: 0,
                        totalComments: 0,
                        totalShares: 0,
                        totalViews: 0,
                        totalInteractions: 0
                    };
                }

                statusStats[status].count++;
                statusStats[status].totalReactions += post.reacciones || 0;
                statusStats[status].totalComments += post.comentarios || 0;
                statusStats[status].totalShares += post.compartidos || 0;
                statusStats[status].totalViews += post.visualizaciones || 0;
                statusStats[status].totalInteractions += 
                    (post.reacciones || 0) + (post.comentarios || 0) + (post.compartidos || 0) + (post.visualizaciones || 0);
            });

            res.json({
                success: true,
                data: statusStats,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error fetching status statistics:', error);
            res.status(500).json({ error: 'Error fetching status statistics' });
        }
    }

    async getStatisticsByFormat(req, res) {
        try {
            const allPosts = await this.database.getPosts(10000, 0);
            const formatStats = {};

            allPosts.forEach(post => {
                const formato = post.formato || 'Sin formato';
                
                if (!formatStats[formato]) {
                    formatStats[formato] = {
                        count: 0,
                        totalReactions: 0,
                        totalComments: 0,
                        totalShares: 0,
                        totalViews: 0,
                        totalInteractions: 0
                    };
                }

                formatStats[formato].count++;
                formatStats[formato].totalReactions += post.reacciones || 0;
                formatStats[formato].totalComments += post.comentarios || 0;
                formatStats[formato].totalShares += post.compartidos || 0;
                formatStats[formato].totalViews += post.visualizaciones || 0;
                formatStats[formato].totalInteractions += 
                    (post.reacciones || 0) + (post.comentarios || 0) + (post.compartidos || 0) + (post.visualizaciones || 0);
            });

            res.json({
                success: true,
                data: formatStats,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error fetching format statistics:', error);
            res.status(500).json({ error: 'Error fetching format statistics' });
        }
    }

    async getAccumulatedInteractionsStats(req, res) {
        try {
            const allPosts = await this.database.getPosts(10000, 0);
            
            const socialNetworkStats = {};
            const statusStats = {};
            const formatStats = {};

            allPosts.forEach(post => {
                // Estadísticas por Red Social
                const redSocial = post.red_social || 'Sin especificar';
                if (!socialNetworkStats[redSocial]) {
                    socialNetworkStats[redSocial] = {
                        count: 0,
                        totalInteractions: 0
                    };
                }
                socialNetworkStats[redSocial].count++;
                socialNetworkStats[redSocial].totalInteractions += 
                    (post.reacciones || 0) + (post.comentarios || 0) + (post.compartidos || 0) + (post.visualizaciones || 0);

                // Estadísticas por Status
                const status = post.status || 'Sin estado';
                if (!statusStats[status]) {
                    statusStats[status] = {
                        count: 0,
                        totalInteractions: 0
                    };
                }
                statusStats[status].count++;
                statusStats[status].totalInteractions += 
                    (post.reacciones || 0) + (post.comentarios || 0) + (post.compartidos || 0) + (post.visualizaciones || 0);

                // Estadísticas por Formato
                const formato = post.formato || 'Sin formato';
                if (!formatStats[formato]) {
                    formatStats[formato] = {
                        count: 0,
                        totalInteractions: 0
                    };
                }
                formatStats[formato].count++;
                formatStats[formato].totalInteractions += 
                    (post.reacciones || 0) + (post.comentarios || 0) + (post.compartidos || 0) + (post.visualizaciones || 0);
            });

            res.json({
                success: true,
                data: {
                    bySocialNetwork: socialNetworkStats,
                    byStatus: statusStats,
                    byFormat: formatStats
                },
                totalPosts: allPosts.length,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error fetching accumulated interactions statistics:', error);
            res.status(500).json({ error: 'Error fetching accumulated interactions statistics' });
        }
    }
}

module.exports = InteractionsController;
