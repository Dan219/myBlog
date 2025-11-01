// ====================================================================
// CONFIGURACIÓN DE LA API Y AUTENTICACIÓN
// ====================================================================
const DIRECTUS_URL = 'http://localhost:8055';

// !!! REEMPLAZA ESTE VALOR CON TU TOKEN DE ACCESO ESTATICO DE DIRECTUS !!!
const AUTH_TOKEN = 'rdRS9pTKdArvViFeYEcXYhr4VnKj9hA6'; 

const ASSETS_BASE_URL = `${DIRECTUS_URL}/assets/`;

// Objeto de configuración para las cabeceras de autenticación
const AUTH_HEADERS = {
    'Authorization': `Bearer ${AUTH_TOKEN}`
    // Si tu API requiere Content-Type, también lo incluirías aquí:
    // 'Content-Type': 'application/json' 
};

// Endpoints (Ajusta los nombres de las colecciones si son diferentes)
const ENDPOINTS = {
    BLOG_INFO: `${DIRECTUS_URL}/items/blog`,       
    CATEGORIES: `${DIRECTUS_URL}/items/category`, 
    // Pedimos campos anidados para obtener el nombre de la categoría
    POSTS: `${DIRECTUS_URL}/items/post?fields=*,category.*&sort=-date_created&limit=10` 
};

// ====================================================================
// FUNCIONES DE UTILIDAD
// ====================================================================

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// ====================================================================
// RENDERIZADO DE LA INFORMACIÓN DEL BLOG (Sin Cambios en la Lógica)
// ====================================================================

function renderBlogInfo(blogInfo) {
    if (!blogInfo) return;

    // 1. Cabecera y Título
    document.getElementById('blog-title').textContent = blogInfo.titulo || 'Mi Blog';
    document.getElementById('blog-name').textContent = blogInfo.titulo || 'Mi Blog';
    document.getElementById('footer-blog-name').textContent = blogInfo.titulo || 'Mi Blog';

    // 2. Banner de Cabecera (Si existe)
    if (blogInfo.encabezado) {
        const header = document.getElementById('blog-header');
        header.style.backgroundImage = `url(${ASSETS_BASE_URL}${blogInfo.banner}?fit=cover&width=1600&quality=75)`;
        header.style.backgroundSize = 'cover';
        header.style.backgroundPosition = 'center';
        header.style.height = '300px'; 
    }

    // 3. Descripción
    document.getElementById('blog-description').textContent = blogInfo.descripcion || 'Bienvenido a nuestro rincón de conocimiento.';
    
    // 4. Año actual del footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
}

// ====================================================================
// RENDERIZADO DE CATEGORÍAS (Sin Cambios en la Lógica)
// ====================================================================

function renderCategories(categories) {
    const navUl = document.querySelector('.nav ul');
    const sidebarUl = document.querySelector('#categories-widget ul');

    navUl.innerHTML = '<li><a href="#">Inicio</a></li>';
    sidebarUl.innerHTML = '<li><a href="#">Todas</a></li>';

    if (!categories || categories.length === 0) return;

    categories.forEach(cat => {
        const categoryName = cat.nombre || 'Sin Nombre';
        
        const navItem = `<li><a href="/category/${cat.id}">${categoryName}</a></li>`;
        navUl.innerHTML += navItem;

        const sidebarItem = `<li><a href="/category/${cat.id}">${categoryName}</a></li>`;
        sidebarUl.innerHTML += sidebarItem;
    });
}

// ====================================================================
// RENDERIZADO DE POSTS (Sin Cambios en la Lógica)
// ====================================================================

function createPostCardHTML(post) {
    const categoryName = post.categoria ? (post.categoria.nombre || 'Sin Categoría') : 'Sin Categoría';
    const postDate = formatDate(post.date_created);

    const imageUrl = post.imagen_portada 
        ? `${ASSETS_BASE_URL}${post.imagen_portada}?width=400&fit=cover&format=webp`
        : `https://via.placeholder.com/400x250/cccccc/ffffff?text=Imagen+No+Disponible`;
    
    return `
        <article class="post-card">
            <img src="${imageUrl}" alt="Imagen de ${post.titulo}" class="post-image" loading="lazy">
            <div class="post-content">
                <span class="post-category">${categoryName}</span>
                <h3 class="post-title"><a href="/post/${post.id}">${post.titulo}</a></h3>
                <p class="post-meta">Publicado el <time datetime="${post.date_created}">${postDate}</time></p>
                <p class="post-excerpt">${post.resumen}</p>
                <a href="/post/${post.id}" class="read-more">Leer Más &rarr;</a>
            </div>
        </article>
    `;
}

function renderPosts(posts) {
    const container = document.getElementById('posts-container');
    container.innerHTML = '<h2>Últimas Publicaciones</h2>'; 

    if (!posts || posts.length === 0) {
        container.innerHTML += '<p>No se encontraron publicaciones que mostrar.</p>';
        return;
    }

    let postsHTML = '';
    posts.forEach(post => {
        postsHTML += createPostCardHTML(post);
    });

    container.innerHTML += postsHTML;
}

// ====================================================================
// FUNCIÓN PRINCIPAL DE CARGA (MODIFICADA CON AUTH_HEADERS)
// ====================================================================

async function loadData() {
    // Definimos la configuración para todas las peticiones
    const fetchConfig = {
        headers: AUTH_HEADERS
    };

    try {
        // Hacemos las tres peticiones, pasando la configuración de cabeceras
        const [infoRes, catsRes, postsRes] = await Promise.all([
            fetch(ENDPOINTS.BLOG_INFO, fetchConfig),
            fetch(ENDPOINTS.CATEGORIES, fetchConfig),
            fetch(ENDPOINTS.POSTS, fetchConfig)
        ]);
        
        // Manejo de errores de autenticación/permisos
        if (!infoRes.ok || !catsRes.ok || !postsRes.ok) {
             throw new Error('Error al obtener datos. Revisa el token de autenticación y los permisos del rol.');
        }

        const [infoJson, catsJson, postsJson] = await Promise.all([
            infoRes.json(),
            catsRes.json(),
            postsRes.json()
        ]);

        renderBlogInfo(infoJson.data); 
        renderCategories(catsJson.data);
        renderPosts(postsJson.data);

    } catch (error) {
        console.error('Error fatal al cargar datos de Directus:', error);
        document.getElementById('posts-container').innerHTML = 
            `<h2>Error de Conexión o Autenticación</h2>
             <p class="error">Mensaje: ${error.message}</p>
             <p>Asegúrate de que el token es válido y tiene permisos de **Lectura** en todas las colecciones (blog, categorias_post, posts).</p>`;
    }
}

// Inicia la carga de datos al terminar de cargar el DOM
document.addEventListener('DOMContentLoaded', loadData);