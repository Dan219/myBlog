// Cargar posts desde archivos Markdown
async function loadPosts() {
    try {
        // Obtener la lista de archivos en _posts
        const response = await fetch('https://api.github.com/repos/Dan219/myBlog/contents/_posts');
        
        if (!response.ok) {
            throw new Error('No se pudieron cargar los posts');
        }
        
        const files = await response.json();
        const postsContainer = document.getElementById('posts-container');
        postsContainer.innerHTML = '';

        // Para cada archivo .md, cargar y mostrar el contenido
        for (const file of files) {
            if (file.name.endsWith('.md')) {
                const postResponse = await fetch(file.download_url);
                const postContent = await postResponse.text();
                
                // Parsear front matter básico (primeras líneas con ---)
                const lines = postContent.split('\n');
                let title = file.name.replace('.md', '');
                let body = postContent;
                
                // Intentar extraer título del front matter
                if (lines[0] === '---') {
                    for (let i = 1; i < lines.length; i++) {
                        if (lines[i] === '---') break;
                        if (lines[i].startsWith('title:')) {
                            title = lines[i].replace('title:', '').trim().replace(/['"]/g, '');
                        }
                    }
                    body = lines.slice(lines.indexOf('---', 1) + 1).join('\n');
                }
                
                const postElement = document.createElement('article');
                postElement.className = 'post-card';
                postElement.innerHTML = `
                    <h3>${title}</h3>
                    <div class="post-content">${marked.parse(body)}</div>
                    <hr>
                `;
                
                postsContainer.appendChild(postElement);
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('posts-container').innerHTML = 
            '<p>Error cargando posts. Asegúrate de que hay posts en la carpeta _posts.</p>';
    }
}

// Cargar posts cuando la página esté lista
document.addEventListener('DOMContentLoaded', loadPosts);