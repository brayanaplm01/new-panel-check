class ElectoralController {
    constructor(database) {
        this.database = database;
    }

    async getElectoralAnalysis(req, res) {
        try {
            const { tag = 'DesinfoElecciones2025', timeRange = 'september', startDate, endDate } = req.query;

            // Obtener posts usando el mismo método que /api/articles
            const limit = 10000; // Obtener suficientes posts
            const offset = 0;
            const allPosts = await this.database.getPosts(limit, offset);
            
            // Determinar rango de fechas basado en parámetros
            let fechaInicio, fechaFin;
            
            if (startDate && endDate) {
                // Usar fechas específicas proporcionadas
                fechaInicio = new Date(startDate + 'T00:00:00.000Z');
                fechaFin = new Date(endDate + 'T23:59:59.999Z');
            } else if (startDate) {
                // Solo fecha de inicio - buscar ese día específico
                fechaInicio = new Date(startDate + 'T00:00:00.000Z');
                fechaFin = new Date(startDate + 'T23:59:59.999Z');
            } else {
                // Fallback a septiembre 2025 completo
                fechaInicio = new Date('2025-09-01T00:00:00.000Z');
                fechaFin = new Date('2025-09-30T23:59:59.999Z');
            }

            // Filtrar posts por fecha
            const postsInDateRange = allPosts.filter(post => {
                if (post.submitted_at || post.updated_at) {
                    const postDate = new Date(post.submitted_at || post.updated_at);
                    return postDate >= fechaInicio && postDate <= fechaFin;
                }
                return false;
            });

            // Filtrar posts con etiquetas electorales
            const electoralPosts = postsInDateRange.filter(post => {
                if (!post.tags) return false;
                return post.tags.includes('DesinfoElecciones2025') || 
                       post.tags.includes('ContenidoElecciones2025');
            });

            // Separar posts CON narrativas y SIN narrativas
            const postsWithNarratives = [];
            const postsWithoutNarratives = [];

            electoralPosts.forEach(post => {
                let hasNarrative = false;
                
                if (post.tags.includes('DesinfoElecciones2025')) {
                    if (post.narrativa_desinformacion && 
                        post.narrativa_desinformacion.trim() !== '' && 
                        post.narrativa_desinformacion !== 'null') {
                        hasNarrative = true;
                    }
                }
                
                if (post.tags.includes('ContenidoElecciones2025')) {
                    if (post.narrativa_tse && 
                        post.narrativa_tse.trim() !== '' && 
                        post.narrativa_tse !== 'null') {
                        hasNarrative = true;
                    }
                }
                
                if (hasNarrative) {
                    postsWithNarratives.push(post);
                } else {
                    postsWithoutNarratives.push(post);
                }
            });

            // Contar publicaciones por etiqueta y narrativa (solo los que tienen narrativas)
            const counts = {
                'DesinfoElecciones2025': 0,
                'ContenidoElecciones2025': 0
            };

            const narrativeDetails = {
                'DesinfoElecciones2025': {},
                'ContenidoElecciones2025': {}
            };

            // Conteos específicos por cada narrativa de DesinfoElecciones2025
            const desinfoNarrativeCounts = {};
            
            // Conteos específicos por cada narrativa de ContenidoElecciones2025 (TSE)
            const contenidoNarrativeCounts = {};

            postsWithNarratives.forEach(post => {
                if (post.tags.includes('DesinfoElecciones2025')) {
                    counts['DesinfoElecciones2025']++;
                    
                    if (post.narrativa_desinformacion) {
                        const narrative = post.narrativa_desinformacion.trim();
                        if (narrative && narrative !== 'null') {
                            // Contar cada narrativa individual
                            desinfoNarrativeCounts[narrative] = (desinfoNarrativeCounts[narrative] || 0) + 1;
                            
                            // Mantener detalles para compatibilidad
                            narrativeDetails['DesinfoElecciones2025'][narrative] = 
                                (narrativeDetails['DesinfoElecciones2025'][narrative] || 0) + 1;
                        }
                    }
                }
                
                if (post.tags.includes('ContenidoElecciones2025')) {
                    counts['ContenidoElecciones2025']++;
                    
                    if (post.narrativa_tse) {
                        const narrative = post.narrativa_tse.trim();
                        if (narrative && narrative !== 'null') {
                            // Contar cada narrativa individual de TSE
                            contenidoNarrativeCounts[narrative] = (contenidoNarrativeCounts[narrative] || 0) + 1;
                            
                            // Mantener detalles para compatibilidad
                            narrativeDetails['ContenidoElecciones2025'][narrative] = 
                                (narrativeDetails['ContenidoElecciones2025'][narrative] || 0) + 1;
                        }
                    }
                }
            });

            // Contar TODAS las publicaciones por tag (con y sin narrativas)
            const allTagCounts = {
                'DesinfoElecciones2025': 0,
                'ContenidoElecciones2025': 0
            };

            electoralPosts.forEach(post => {
                if (post.tags.includes('DesinfoElecciones2025')) {
                    allTagCounts['DesinfoElecciones2025']++;
                }
                if (post.tags.includes('ContenidoElecciones2025')) {
                    allTagCounts['ContenidoElecciones2025']++;
                }
            });

            // Contar publicaciones SIN narrativas por etiqueta
            const withoutNarrativeCounts = {
                'DesinfoElecciones2025': 0,
                'ContenidoElecciones2025': 0
            };

            postsWithoutNarratives.forEach(post => {
                if (post.tags.includes('DesinfoElecciones2025')) {
                    withoutNarrativeCounts['DesinfoElecciones2025']++;
                }
                if (post.tags.includes('ContenidoElecciones2025')) {
                    withoutNarrativeCounts['ContenidoElecciones2025']++;
                }
            });

            console.log(`📊 Análisis Electoral (${fechaInicio.toISOString().split('T')[0]} - ${fechaFin.toISOString().split('T')[0]}):`);
            console.log(`- Posts totales en rango: ${postsInDateRange.length}`);
            console.log(`- Posts con etiquetas electorales: ${electoralPosts.length}`);
            console.log(`- Posts CON narrativas: ${postsWithNarratives.length}`);
            console.log(`- Posts SIN narrativas: ${postsWithoutNarratives.length}`);
            console.log(`- DesinfoElecciones2025 con narrativa: ${counts['DesinfoElecciones2025']}`);
            console.log(`- ContenidoElecciones2025 con narrativa: ${counts['ContenidoElecciones2025']}`);
            console.log(`- DesinfoElecciones2025 sin narrativa: ${withoutNarrativeCounts['DesinfoElecciones2025']}`);
            console.log(`- ContenidoElecciones2025 sin narrativa: ${withoutNarrativeCounts['ContenidoElecciones2025']}`);
            console.log('📋 Narrativas DesinfoElecciones2025:', desinfoNarrativeCounts);
            console.log('📋 Narrativas ContenidoElecciones2025:', contenidoNarrativeCounts);

            res.json({
                success: true,
                data: {
                    narratives: counts,
                    narrativeDetails,
                    desinfoNarratives: desinfoNarrativeCounts, // Conteos individuales de narrativas de desinformación
                    contenidoNarratives: contenidoNarrativeCounts, // Conteos individuales de narrativas de TSE
                    withoutNarratives: withoutNarrativeCounts,
                    allTagCounts: allTagCounts, // NUEVO: Conteos totales por tag
                    totalPosts: electoralPosts.length,
                    totalWithNarratives: postsWithNarratives.length,
                    totalWithoutNarratives: postsWithoutNarratives.length,
                    filters: {
                        tag,
                        timeRange,
                        startDate: fechaInicio.toISOString().split('T')[0],
                        endDate: fechaFin.toISOString().split('T')[0],
                        includeNarratives: true
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching electoral analysis:', error);
            res.status(500).json({ error: 'Error fetching electoral analysis' });
        }
    }
}

module.exports = ElectoralController;
