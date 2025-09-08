const Database = require('./database/init');

async function searchAll111() {
    const database = new Database();
    await database.init(false);
    
    try {
        console.log('🔍 Buscando posts con 111 en CUALQUIER campo...\n');
        
        // Obtener todos los posts
        const allPosts = await database.getPosts(10000, 0);
        console.log(`📊 Total posts en base de datos: ${allPosts.length}`);
        
        // Buscar cualquier post que contenga "111"
        const postsWithAny111 = allPosts.filter(post => 
            JSON.stringify(post).includes('111')
        );
        
        console.log(`🎯 Posts que contienen "111": ${postsWithAny111.length}`);
        
        if (postsWithAny111.length > 0) {
            postsWithAny111.forEach((post, i) => {
                console.log(`\n📱 Post ${i + 1}:`);
                console.log(`    ID: ${post.id}`);
                console.log(`    Claim: ${post.claim?.substring(0, 100)}...`);
                console.log(`    Red Social: ${post.red_social}`);
                console.log(`    Formato: ${post.formato}`);
                console.log(`    Fecha submitted_at: ${post.submitted_at}`);
                console.log(`    Reacciones: ${post.reacciones}`);
                console.log(`    Comentarios: ${post.comentarios}`);
                console.log(`    Compartidos: ${post.compartidos}`);
                console.log(`    Visualizaciones: ${post.visualizaciones}`);
                console.log(`    Tags: ${post.tags}`);
                
                // Buscar dónde aparece 111
                const postStr = JSON.stringify(post);
                if (postStr.includes('111')) {
                    console.log(`    ⭐ Contiene "111" en: ${Object.keys(post).filter(key => 
                        post[key] && post[key].toString().includes('111')
                    ).join(', ')}`);
                }
            });
        }
        
        // También buscar exactamente 111 en campos numéricos
        console.log('\n\n🎯 Buscando exactamente 111 en campos de interacción...');
        const exact111 = allPosts.filter(post => 
            post.reacciones == 111 || 
            post.comentarios == 111 || 
            post.compartidos == 111 || 
            post.visualizaciones == 111
        );
        
        console.log(`🎯 Posts con exactamente 111 en algún campo: ${exact111.length}`);
        
        if (exact111.length > 0) {
            exact111.forEach((post, i) => {
                console.log(`\n📱 Post ${i + 1} con 111 exacto:`);
                console.log(`    ID: ${post.id}`);
                console.log(`    Claim: ${post.claim?.substring(0, 80)}...`);
                console.log(`    Red Social: ${post.red_social}`);
                console.log(`    Formato: ${post.formato}`);
                console.log(`    Fecha: ${post.submitted_at}`);
                console.log(`    R: ${post.reacciones}, C: ${post.comentarios}, S: ${post.compartidos}, V: ${post.visualizaciones}`);
                
                if (post.reacciones == 111) console.log(`    ⭐ REACCIONES = 111`);
                if (post.comentarios == 111) console.log(`    ⭐ COMENTARIOS = 111`);
                if (post.compartidos == 111) console.log(`    ⭐ COMPARTIDOS = 111`);
                if (post.visualizaciones == 111) console.log(`    ⭐ VISUALIZACIONES = 111`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        database.close();
    }
}

searchAll111();
