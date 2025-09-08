const Database = require('./database/init');

async function findPostWith111Reactions() {
    const database = new Database();
    await database.init(false);
    
    try {
        console.log('🔍 Buscando posts con 111 reacciones...\n');
        
        // Obtener todos los posts
        const allPosts = await database.getPosts(10000, 0);
        console.log(`📊 Total posts en base de datos: ${allPosts.length}`);
        
        // Buscar posts con 111 reacciones
        const postsWithReactions = allPosts.filter(post => 
            post.reacciones === 111 || 
            post.reacciones === '111' ||
            (post.reacciones && post.reacciones.toString().includes('111'))
        );
        
        console.log(`🎯 Posts con 111 reacciones encontrados: ${postsWithReactions.length}`);
        
        if (postsWithReactions.length > 0) {
            postsWithReactions.forEach((post, i) => {
                console.log(`\n📱 Post ${i + 1}:`);
                console.log(`    ID: ${post.id}`);
                console.log(`    Claim: ${post.claim?.substring(0, 100)}...`);
                console.log(`    Red Social: ${post.red_social}`);
                console.log(`    Formato: ${post.formato}`);
                console.log(`    Status: ${post.status}`);
                console.log(`    Fecha submitted_at: ${post.submitted_at}`);
                console.log(`    Fecha updated_at: ${post.updated_at}`);
                console.log(`    Tags: ${post.tags}`);
                console.log(`    REACCIONES: ${post.reacciones}`);
                console.log(`    Comentarios: ${post.comentarios}`);
                console.log(`    Compartidos: ${post.compartidos}`);
                console.log(`    Visualizaciones: ${post.visualizaciones}`);
                
                const totalInteractions = (post.reacciones || 0) + (post.comentarios || 0) + 
                                        (post.compartidos || 0) + (post.visualizaciones || 0);
                console.log(`    TOTAL INTERACCIONES: ${totalInteractions}`);
                
                // Verificar si está en el rango de septiembre 3
                if (post.submitted_at) {
                    const postDate = new Date(post.submitted_at);
                    const sept3Start = new Date('2025-09-03T00:00:00.000Z');
                    const sept3End = new Date('2025-09-03T23:59:59.999Z');
                    const isInSept3 = postDate >= sept3Start && postDate <= sept3End;
                    console.log(`    ¿Está en 3 de septiembre?: ${isInSept3}`);
                    console.log(`    Fecha parseada: ${postDate.toISOString()}`);
                }
            });
        }
        
        // También buscar posts de TikTok con cualquier interacción
        console.log('\n\n🎵 Buscando todos los posts de TikTok con interacciones...');
        const tiktokPosts = allPosts.filter(post => 
            post.red_social === 'TikTok' && 
            ((post.reacciones && post.reacciones > 0) || 
             (post.comentarios && post.comentarios > 0) || 
             (post.compartidos && post.compartidos > 0) || 
             (post.visualizaciones && post.visualizaciones > 0))
        );
        
        console.log(`🎵 Posts de TikTok con interacciones: ${tiktokPosts.length}`);
        
        if (tiktokPosts.length > 0) {
            console.log('\n📊 Top 5 posts de TikTok con más interacciones:');
            tiktokPosts
                .sort((a, b) => {
                    const aTotal = (a.reacciones || 0) + (a.comentarios || 0) + (a.compartidos || 0) + (a.visualizaciones || 0);
                    const bTotal = (b.reacciones || 0) + (b.comentarios || 0) + (b.compartidos || 0) + (b.visualizaciones || 0);
                    return bTotal - aTotal;
                })
                .slice(0, 5)
                .forEach((post, i) => {
                    const totalInteractions = (post.reacciones || 0) + (post.comentarios || 0) + 
                                            (post.compartidos || 0) + (post.visualizaciones || 0);
                    console.log(`\n  ${i + 1}. ID: ${post.id}`);
                    console.log(`     Claim: ${post.claim?.substring(0, 80)}...`);
                    console.log(`     Fecha: ${post.submitted_at}`);
                    console.log(`     Interacciones: ${totalInteractions} (R:${post.reacciones}, C:${post.comentarios}, S:${post.compartidos}, V:${post.visualizaciones})`);
                });
        }
        
        // Buscar posts con cualquier interacción != 0
        console.log('\n\n📈 Buscando posts con CUALQUIER interacción > 0...');
        const postsWithAnyInteractions = allPosts.filter(post => 
            (post.reacciones && post.reacciones > 0) || 
            (post.comentarios && post.comentarios > 0) || 
            (post.compartidos && post.compartidos > 0) || 
            (post.visualizaciones && post.visualizaciones > 0)
        );
        
        console.log(`📈 Total posts con interacciones: ${postsWithAnyInteractions.length}`);
        
        if (postsWithAnyInteractions.length > 0) {
            console.log('\n🏆 Top 3 posts con más interacciones:');
            postsWithAnyInteractions
                .sort((a, b) => {
                    const aTotal = (a.reacciones || 0) + (a.comentarios || 0) + (a.compartidos || 0) + (a.visualizaciones || 0);
                    const bTotal = (b.reacciones || 0) + (b.comentarios || 0) + (b.compartidos || 0) + (b.visualizaciones || 0);
                    return bTotal - aTotal;
                })
                .slice(0, 3)
                .forEach((post, i) => {
                    const totalInteractions = (post.reacciones || 0) + (post.comentarios || 0) + 
                                            (post.compartidos || 0) + (post.visualizaciones || 0);
                    console.log(`\n  ${i + 1}. ID: ${post.id}`);
                    console.log(`     Red Social: ${post.red_social}`);
                    console.log(`     Formato: ${post.formato}`);
                    console.log(`     Fecha: ${post.submitted_at}`);
                    console.log(`     Claim: ${post.claim?.substring(0, 80)}...`);
                    console.log(`     Interacciones: ${totalInteractions} (R:${post.reacciones}, C:${post.comentarios}, S:${post.compartidos}, V:${post.visualizaciones})`);
                });
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        database.close();
    }
}

findPostWith111Reactions();
