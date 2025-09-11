const Database = require('./database/init');

async function testNewElectoralData() {
    const database = new Database();
    await database.init(false);
    
    try {
        console.log('🧪 Probando nuevos datos electorales comparativos...\n');
        
        // Simular el controlador electoral
        const startDate = '2025-09-03';
        const endDate = '2025-09-03';
        
        const limit = 10000;
        const offset = 0;
        const allPosts = await database.getPosts(limit, offset);
        
        // Determinar rango de fechas
        const fechaInicio = new Date(startDate + 'T00:00:00.000Z');
        const fechaFin = new Date(endDate + 'T23:59:59.999Z');

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

        // NUEVO: Contar TODAS las publicaciones por tag (con y sin narrativas)
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

        console.log(`📅 Período: ${startDate} - ${endDate}`);
        console.log(`📊 Posts totales en rango: ${postsInDateRange.length}`);
        console.log(`📊 Posts con etiquetas electorales: ${electoralPosts.length}`);
        
        console.log('\n🎯 NUEVA FUNCIONALIDAD - Conteo por Tags:');
        console.log('📊 allTagCounts:', allTagCounts);
        
        console.log('\n📋 Resumen para la gráfica comparativa:');
        console.log(`- DesinfoElecciones2025: ${allTagCounts['DesinfoElecciones2025']} publicaciones`);
        console.log(`- ContenidoElecciones2025: ${allTagCounts['ContenidoElecciones2025']} publicaciones`);
        console.log(`- Total electoral: ${allTagCounts['DesinfoElecciones2025'] + allTagCounts['ContenidoElecciones2025']} publicaciones`);
        
        if (allTagCounts['DesinfoElecciones2025'] > 0 || allTagCounts['ContenidoElecciones2025'] > 0) {
            const total = allTagCounts['DesinfoElecciones2025'] + allTagCounts['ContenidoElecciones2025'];
            const desinfoPercent = ((allTagCounts['DesinfoElecciones2025'] / total) * 100).toFixed(1);
            const contenidoPercent = ((allTagCounts['ContenidoElecciones2025'] / total) * 100).toFixed(1);
            
            console.log('\n📈 Porcentajes:');
            console.log(`- Desinformación: ${desinfoPercent}%`);
            console.log(`- Contenido Electoral: ${contenidoPercent}%`);
        }
        
        // Mostrar algunos posts de muestra
        console.log('\n📝 Muestra de posts electorales:');
        electoralPosts.slice(0, 5).forEach((post, i) => {
            console.log(`\n  Post ${i + 1}:`);
            console.log(`    ID: ${post.id}`);
            console.log(`    Tags: ${post.tags}`);
            console.log(`    Claim: ${post.claim?.substring(0, 100)}...`);
            console.log(`    Tiene narrativa_desinformacion: ${post.narrativa_desinformacion ? 'Sí' : 'No'}`);
            console.log(`    Tiene narrativa_tse: ${post.narrativa_tse ? 'Sí' : 'No'}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        database.close();
    }
}

testNewElectoralData();
