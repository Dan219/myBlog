class PremiumBlog {
    constructor() {
        this.posts = [];
        this.categories = {};
        this.filteredPosts = [];
        this.filters = {
            category: 'all',
            searchQuery: '',
            sortBy: 'newest',
            view: 'grid'
        };
        this.init();
    }

    async init() {
        await this.loadCategories();
        await this.loadPosts();
        this.setupEventListeners();
        this.render();
        this.setupMobileMenu();
    }
     // ... constructor y funciones existentes ...

    // ✅ FUNCIONES FALTANTES:
    async loadPosts() {
        try {
            this.showLoading();
            
            const response = await fetch('https://api.github.com/repos/Dan219/myBlog/contents/_posts');
            if (!response.ok) throw new Error('Error cargando posts');
            
            const files = await response.json();
            const postFiles = files.filter(file => file.name.endsWith('.md'));
            
            this.posts = await Promise.all(
                postFiles.map(file => this.parsePost(file))
            );
            
            this.applyFilters();
            
        } catch (error) {
            console.error('Error:', error);
            this.showError('Error al cargar los posts. Intenta recargar la página.');
        }
    }

    applyFilters() {
        let filtered = [...this.posts];

        // Filtrar por categoría
        if (this.filters.category !== 'all') {
            filtered = filtered.filter(post => 
                post.category === this.filters.category
            );
        }

        // Filtrar por búsqueda
        if (this.filters.searchQuery) {
            const query = this.filters.searchQuery.toLowerCase();
            filtered = filtered.filter(post =>
                post.title.toLowerCase().includes(query) ||
                post.excerpt.toLowerCase().includes(query) ||
                post.body.toLowerCase().includes(query)
            );
        }

        // Ordenar
        filtered.sort((a, b) => {
            switch (this.filters.sortBy) {
                case 'oldest':
                    return a.date - b.date;
                case 'popular':
                    return b.date - a.date; // Por ahora igual que newest
                case 'newest':
                default:
                    return b.date - a.date;
            }
        });

        this.filteredPosts = filtered;
        this.updateContentTitle();
    }

    updateContentTitle() {
        const titleElement = document.getElementById('content-title');
        if (!titleElement) return;

        const category = this.filters.category;
        const count = this.filteredPosts.length;
        
        if (category === 'all') {
            titleElement.textContent = `Todos los Posts (${count})`;
        } else {
            const categoryInfo = this.getCategoryInfo(category);
            titleElement.textContent = `${categoryInfo.name} (${count})`;
        }
    }

    render() {
        this.renderPosts();
        this.renderTrending();
        this.updateActiveFilters();
    }

    renderPosts() {
        const container = document.getElementById('posts-container');
        if (!container) return;

        if (this.filteredPosts.length === 0) {
            container.innerHTML = this.renderNoResults();
            return;
        }

        switch (this.filters.view) {
            case 'list':
                container.innerHTML = this.renderListView();
                break;
            case 'magazine':
                container.innerHTML = this.renderMagazineView();
                break;
            case 'grid':
            default:
                container.innerHTML = this.renderGridView();
        }
    }

    renderGridView() {
        return `
            <div class="posts-grid">
                ${this.filteredPosts.map(post => this.renderPostCard(post)).join('')}
            </div>
        `;
    }

    renderListView() {
        return `
            <div class="posts-list">
                ${this.filteredPosts.map(post => this.renderPostListItem(post)).join('')}
            </div>
        `;
    }

    renderMagazineView() {
        const featured = this.filteredPosts.slice(0, 2);
        const rest = this.filteredPosts.slice(2);
        
        return `
            <div class="magazine-layout">
                <div class="magazine-featured">
                    ${featured.map(post => this.renderFeaturedPost(post)).join('')}
                </div>
                <div class="magazine-grid posts-grid">
                    ${rest.map(post => this.renderPostCard(post)).join('')}
                </div>
            </div>
        `;
    }

    renderPostListItem(post) {
        const categoryInfo = this.getCategoryInfo(post.category);
        
        return `
            <article class="post-list-item" onclick="blog.showPost('${post.slug}')">
                <div class="list-item-content">
                    <span class="post-category" style="background: ${this.lightenColor(categoryInfo.color, 90)}; color: ${categoryInfo.color}">
                        ${categoryInfo.icon} ${categoryInfo.name}
                    </span>
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <div class="post-meta">
                        <span>${this.formatDate(post.date)}</span>
                        <button class="read-more-btn">Leer más →</button>
                    </div>
                </div>
            </article>
        `;
    }

    renderFeaturedPost(post) {
        const categoryInfo = this.getCategoryInfo(post.category);
        
        return `
            <article class="featured-post" onclick="blog.showPost('${post.slug}')">
                <div class="featured-image" style="background: linear-gradient(135deg, ${categoryInfo.color}, ${this.lightenColor(categoryInfo.color, 20)})">
                    ${categoryInfo.icon}
                </div>
                <div class="featured-content">
                    <span class="post-category" style="background: ${this.lightenColor(categoryInfo.color, 90)}; color: ${categoryInfo.color}">
                        ${categoryInfo.icon} ${categoryInfo.name}
                    </span>
                    <h2 class="featured-title">${post.title}</h2>
                    <p class="featured-excerpt">${post.excerpt}</p>
                    <div class="post-meta">
                        <span>${this.formatDate(post.date)}</span>
                        <button class="read-more-btn">Leer más →</button>
                    </div>
                </div>
            </article>
        `;
    }

    renderNoResults() {
        return `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>No se encontraron posts</h3>
                <p>Intenta con otros filtros o términos de búsqueda.</p>
                <button class="reset-filters-btn" onclick="blog.resetFilters()">
                    Reiniciar filtros
                </button>
            </div>
        `;
    }

    renderTrending() {
        const container = document.getElementById('trending-sidebar');
        if (!container) return;

        const trending = this.posts
            .sort((a, b) => b.date - a.date)
            .slice(0, 3);

        container.innerHTML = trending.map(post => `
            <div class="trending-post" onclick="blog.showPost('${post.slug}')">
                <strong>${post.title}</strong>
                <small>${this.formatDate(post.date)}</small>
            </div>
        `).join('');
    }

    cleanFrontMatter(line, key) {
        return line.replace(`${key}:`, '').trim().replace(/['"]/g, '');
    }

    formatTitle(filename) {
        return filename
            .replace('.md', '')
            .replace(/^\d{4}-\d{2}-\d{2}-/, '')
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    createErrorPost(filename) {
        return {
            id: filename,
            title: `Error: ${filename}`,
            body: 'No se pudo cargar este post.',
            excerpt: 'Error al cargar el contenido.',
            category: 'personal',
            date: new Date(),
            slug: filename.replace('.md', ''),
            featured_image: null,
            url: '#error'
        };
    }
    async loadCategories() {
        try {
            console.log('Cargando categorías...');
            const response = await fetch('https://api.github.com/repos/Dan219/myBlog/contents/_categories');
            
            if (!response.ok) {
                console.log('No hay carpeta _categories, usando categorías por defecto');
                this.categories = this.getDefaultCategories();
                this.renderCategoryFilters();
                return;
            }
            
            const files = await response.json();
            const categoryFiles = files.filter(file => file.name.endsWith('.md'));
            
            console.log(`Encontradas ${categoryFiles.length} categorías`);
            
            if (categoryFiles.length === 0) {
                throw new Error('No hay archivos de categoría');
            }
            
            const categories = {};
            for (const file of categoryFiles) {
                try {
                    const category = await this.parseCategory(file);
                    categories[category.slug] = category;
                } catch (error) {
                    console.error('Error parsing category:', file.name, error);
                }
            }
            
            this.categories = categories;
            this.renderCategoryFilters();
            
        } catch (error) {
            console.error('Error loading categories, using defaults:', error);
            this.categories = this.getDefaultCategories();
            this.renderCategoryFilters();
        }
    }

    // Y asegúrate que parsePost tenga categoría por defecto
    async parsePost(file) {
        try {
            const response = await fetch(file.download_url);
            const content = await response.text();
            
            const lines = content.split('\n');
            let title = this.formatTitle(file.name);
            let body = content;
            let category = 'programacion'; // ✅ CATEGORÍA POR DEFECTO
            let date = new Date().toISOString();
            let excerpt = '';
            let featured_image = null;

            if (lines[0] === '---') {
                const frontMatter = this.parseFrontMatter(lines);
                title = frontMatter.title || title;
                category = frontMatter.category || category; // ✅ Usa la del post o por defecto
                date = frontMatter.date || date;
                excerpt = frontMatter.excerpt || '';
                featured_image = frontMatter.featured_image || null;
                
                body = lines.slice(lines.indexOf('---', 1) + 1).join('\n');
            }

            // Generar excerpt si no existe
            if (!excerpt) {
                const plainText = body.replace(/[#*`]/g, '').substring(0, 150);
                excerpt = plainText + (plainText.length === 150 ? '...' : '');
            }

            return {
                id: file.sha,
                title,
                body: marked.parse(body),
                excerpt,
                category, // ✅ Siempre tendrá categoría
                date: new Date(date),
                slug: file.name.replace('.md', ''),
                featured_image, // ✅ Imagen del post si existe
                url: `#post-${file.name.replace('.md', '')}`
            };
            
        } catch (error) {
            console.error('Error parsing post:', file.name, error);
            return this.createErrorPost(file.name);
        }
    }
    
    async parseCategory(file) {
        const response = await fetch(file.download_url);
        const content = await response.text();

        const lines = content.split('\n');
        let name = 'General';
        let slug = 'general';
        let icon = '📄';
        let color = '#6b7280';

        if (lines[0] === '---') {
            for (let i = 1; i < lines.length; i++) {
                if (lines[i] === '---') break;
                if (lines[i].startsWith('name:')) name = this.cleanFrontMatter(lines[i], 'name');
                if (lines[i].startsWith('slug:')) slug = this.cleanFrontMatter(lines[i], 'slug');
                if (lines[i].startsWith('icon:')) icon = this.cleanFrontMatter(lines[i], 'icon');
                if (lines[i].startsWith('color:')) color = this.cleanFrontMatter(lines[i], 'color');
            }
        }

        return { name, slug, icon, color };
    }
    parseFrontMatter(lines) {
        const frontMatter = {};
        for (let i = 1; i < lines.length; i++) {
            if (lines[i] === '---') break;
            if (lines[i].includes(':')) {
                const [key, ...valueParts] = lines[i].split(':');
                const value = valueParts.join(':').trim().replace(/['"]/g, '');
                frontMatter[key.trim()] = value;
            }
        }
        return frontMatter;
    }
    getDefaultCategories() {
        return {
            programacion: { name: 'Programación', slug: 'programacion', icon: '💻', color: '#2563eb' },
            anime: { name: 'Anime', slug: 'anime', icon: '🎌', color: '#dc2626' },
            videojuegos: { name: 'Videojuegos', slug: 'videojuegos', icon: '🎮', color: '#16a34a' },
            tecnologia: { name: 'Tecnología', slug: 'tecnologia', icon: '🚀', color: '#7c3aed' },
            personal: { name: 'Personal', slug: 'personal', icon: '📝', color: '#ea580c' }
        };
    }

    renderCategoryFilters() {
        const container = document.querySelector('.category-filters');
        if (!container) return;

        const categories = Object.values(this.categories);

        container.innerHTML = `
            <button class="filter-btn active" data-category="all">Todos</button>
            ${categories.map(cat => `
                <button class="filter-btn" data-category="${cat.slug}">
                    ${cat.icon} ${cat.name}
                </button>
            `).join('')}
        `;

        // Re-attach event listeners
        container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setCategoryFilter(e.target.dataset.category);
            });
        });
    }

    getCategoryInfo(categorySlug) {
        return this.categories[categorySlug] || {
            name: 'General',
            icon: '📄',
            color: '#6b7280',
            slug: 'general'
        };
    }


    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    setupEventListeners() {
        // Filtros de categoría
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setCategoryFilter(e.target.dataset.category);
            });
        });

        // Búsqueda
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.querySelector('.search-btn');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.setSearchFilter(e.target.value);
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.setSearchFilter(e.target.value);
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.setSearchFilter(searchInput?.value || '');
            });
        }

        // Ordenamiento
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.setSortFilter(e.target.value);
            });
        }

        // Vistas
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setView(e.target.dataset.view);
            });
        });
    }

    setupMobileMenu() {
        // Para móvil: toggle sidebar
        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.innerHTML = '☰';
        mobileMenuBtn.style.cssText = `
            display: none; 
            position: fixed; 
            bottom: 20px; 
            right: 20px; 
            z-index: 1001;
            background: var(--primary-blue);
            color: white;
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 1.2rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;

        document.body.appendChild(mobileMenuBtn);

        // Media query para mostrar/ocultar
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        this.handleMobileView(mediaQuery);
        mediaQuery.addListener(this.handleMobileView);

        mobileMenuBtn.addEventListener('click', () => {
            document.querySelector('.glass-sidebar').classList.toggle('mobile-open');
        });
    }

    handleMobileView = (mediaQuery) => {
        const mobileBtn = document.querySelector('.mobile-menu-btn');
        const sidebar = document.querySelector('.glass-sidebar');

        if (mediaQuery.matches) {
            mobileBtn.style.display = 'block';
            sidebar.classList.remove('mobile-open');
        } else {
            mobileBtn.style.display = 'none';
            sidebar.classList.add('mobile-open');
        }
    }

    setCategoryFilter(category) {
        this.filters.category = category;
        this.applyFilters();
        this.render();
    }

    setSearchFilter(query) {
        this.filters.searchQuery = query;
        this.applyFilters();
        this.render();
    }

    setSortFilter(sortBy) {
        this.filters.sortBy = sortBy;
        this.applyFilters();
        this.render();
    }

    setView(view) {
        this.filters.view = view;
        this.updateActiveView();
        this.render();
    }

    updateActiveFilters() {
        // Actualizar botones activos
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === this.filters.category);
        });
    }

    updateActiveView() {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === this.filters.view);
        });
    }

    showPost(slug) {
        // Navegar a la página del post individual
        window.location.hash = `post-${slug}`;

        // Por ahora mostrar alert, después implementar página individual
        const post = this.posts.find(p => p.slug === slug);
        if (post) {
            alert(`Abriendo: ${post.title}\n\nEsta funcionalidad se implementará en la siguiente versión.`);
        }
    }

    resetFilters() {
        this.filters = {
            category: 'all',
            searchQuery: '',
            sortBy: 'newest',
            view: 'grid'
        };

        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';

        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) sortSelect.value = 'newest';

        this.applyFilters();
        this.render();
    }

    showLoading() {
        const container = document.getElementById('posts-container');
        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Cargando posts...</p>
                </div>
            `;
        }
    }

    showError(message) {
        const container = document.getElementById('posts-container');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h3>Error</h3>
                    <p>${message}</p>
                    <button onclick="blog.loadPosts()" class="retry-btn">Reintentar</button>
                </div>
            `;
        }
    }
    getPostImage(post) {

        if (post.featured_image) {
            return `/img/${post.featured_image}`;
        }
        return null;
    }

    renderPostCard(post) {
        const categoryInfo = this.getCategoryInfo(post.category);
        const hasImage = post.featured_image; // Solo chequea imagen del post
        
        return `
            <article class="post-card">
            <div class="post-image" ${hasImage ? 
                `style="background-image: url('${this.getPostImage(post)}')"` : 
                `style="background: linear-gradient(135deg, ${categoryInfo.color}, ${this.lightenColor(categoryInfo.color, 20)})"`}>
                ${!hasImage ? categoryInfo.icon : ''}
            </div>
            <div class="post-content">
                <span class="post-category" style="background: ${this.lightenColor(categoryInfo.color, 90)}; color: ${categoryInfo.color}">
                ${categoryInfo.icon} ${categoryInfo.name}
                </span>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="post-meta">
                <span>${this.formatDate(post.date)}</span>
                <button class="read-more-btn">Leer más →</button>
                </div>
            </div>
            </article>
        `;
    }
}

// CSS adicional para nuevas vistas
const additionalCSS = `
    .posts-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .post-list-item {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .post-list-item:hover {
        transform: translateX(5px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }
    
    .magazine-layout {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }
    
    .magazine-featured {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
    }
    
    .featured-post {
        background: white;
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .featured-post:hover {
        transform: translateY(-5px);
    }
    
    .featured-image {
        width: 100%;
        height: 250px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 3rem;
    }
    
    .featured-content {
        padding: 2rem;
    }
    
    .featured-title {
        font-size: 1.5rem;
        margin: 1rem 0;
    }
    
    .no-results, .error-state {
        text-align: center;
        padding: 3rem;
        background: white;
        border-radius: 15px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    
    .no-results-icon, .error-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }
    
    .reset-filters-btn, .retry-btn {
        background: var(--primary-blue);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        margin-top: 1rem;
    }
    
    .read-more-btn {
        background: transparent;
        border: none;
        color: var(--primary-blue);
        cursor: pointer;
        font-weight: 600;
    }
    
    @media (max-width: 768px) {
        .magazine-featured {
            grid-template-columns: 1fr;
        }
        
        .glass-sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            z-index: 1000;
            margin: 0;
            border-radius: 0;
        }
        
        .glass-sidebar.mobile-open {
            transform: translateX(0);
        }
    }
`;

// Inject additional CSS
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

// Inicializar la aplicación
const blog = new PremiumBlog();

