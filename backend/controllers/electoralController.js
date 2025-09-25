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
                
                // Usar solo el campo new_narrativas para todos los tags
                if (post.new_narrativas && 
                    post.new_narrativas.trim() !== '' && 
                    post.new_narrativas !== 'null') {
                    hasNarrative = true;
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

            // Lista completa de todas las narrativas electorales
            const allNarratives = [
                'Se está orquestando un fraude electoral',
                'Dudas sobre el proceso electoral',
                'Campañas financiadas por terceros',
                'Candidatos y partidos ligados al MAS o a Evo Morales',
                'Ataques a candidatos o a partidos políticos',
                'Supuesto apoyo a candidatos o partidos políticos',
                'Tendencias de intención de voto (encuestas)',
                'Resistencia hostil',
                'Voto nulo',
                'Conteo preliminar de votos',
                'Promesas de campaña',
                'Escenarios postelectorales',
                'FIMI',
                'Padrón electoral'
            ];

            // Inicializar conteos específicos con todas las narrativas en 0
            const desinfoNarrativeCounts = {};
            const contenidoNarrativeCounts = {};
            
            // Inicializar todas las narrativas con 0
            allNarratives.forEach(narrative => {
                desinfoNarrativeCounts[narrative] = 0;
                contenidoNarrativeCounts[narrative] = 0;
            });

            postsWithNarratives.forEach(post => {
                // Procesar narrativas del campo new_narrativas para ambos tags
                if (post.new_narrativas) {
                    const narrativesText = post.new_narrativas.trim();
                    if (narrativesText && narrativesText !== 'null') {
                        // Separar narrativas por comas y procesar cada una
                        const individualNarratives = narrativesText.split(',').map(n => n.trim());
                        
                        individualNarratives.forEach(narrative => {
                            if (narrative && allNarratives.includes(narrative)) {
                                // Contar para el tag correspondiente
                                if (post.tags.includes('DesinfoElecciones2025')) {
                                    desinfoNarrativeCounts[narrative]++;
                                    narrativeDetails['DesinfoElecciones2025'][narrative] = 
                                        (narrativeDetails['DesinfoElecciones2025'][narrative] || 0) + 1;
                                }
                                
                                if (post.tags.includes('ContenidoElecciones2025')) {
                                    contenidoNarrativeCounts[narrative]++;
                                    narrativeDetails['ContenidoElecciones2025'][narrative] = 
                                        (narrativeDetails['ContenidoElecciones2025'][narrative] || 0) + 1;
                                }
                            }
                        });
                    }
                }
                
                // Contar posts por tag
                if (post.tags.includes('DesinfoElecciones2025')) {
                    counts['DesinfoElecciones2025']++;
                }
                
                if (post.tags.includes('ContenidoElecciones2025')) {
                    counts['ContenidoElecciones2025']++;
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
