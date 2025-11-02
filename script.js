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
        if (this.filteredPosts.length === 0) {
            return this.renderNoResults();
        }

        // Magazine view real: 1 post destacado grande + varios pequeños
        const featuredPost = this.filteredPosts[0];
        const secondaryPosts = this.filteredPosts.slice(1, 3); // 2 posts medianos
        const remainingPosts = this.filteredPosts.slice(3); // Resto en grid
        
        return `
            <div class="magazine-layout">
                <!-- Post Destacado Principal -->
                <div class="magazine-hero">
                    ${this.renderMagazineHero(featuredPost)}
                </div>
                
                <!-- Posts Secundarios -->
                ${secondaryPosts.length > 0 ? `
                    <div class="magazine-secondary">
                        ${secondaryPosts.map(post => this.renderMagazineSecondary(post)).join('')}
                    </div>
                ` : ''}
                
                <!-- Grid Normal para el Resto -->
                ${remainingPosts.length > 0 ? `
                    <div class="magazine-grid">
                        <h3 class="section-title">Más Posts</h3>
                        <div class="posts-grid">
                            ${remainingPosts.map(post => this.renderPostCard(post)).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderMagazineHero(post) {
        const categoryInfo = this.getCategoryInfo(post.category);
        const hasImage = post.featured_image;
        const imageUrl = hasImage ? this.getPostImage(post) : null;
        
        return `
            <article class="magazine-hero-post" onclick="blog.showPost('${post.slug}')">
                <div class="hero-image ${hasImage ? 'has-image' : 'no-image'}" 
                    ${hasImage ? `style="background-image: url('${imageUrl}')"` : `style="background: linear-gradient(135deg, ${categoryInfo.color}, ${this.lightenColor(categoryInfo.color, 20)})"`}>
                    ${!hasImage ? `
                        <div class="hero-placeholder">
                            ${categoryInfo.icon}
                        </div>
                    ` : ''}
                    
                    <div class="hero-overlay">
                        <div class="hero-content">
                            <span class="hero-category" style="background: ${this.lightenColor(categoryInfo.color, 90)}; color: ${categoryInfo.color}">
                                ${categoryInfo.icon} ${categoryInfo.name}
                            </span>
                            <h2 class="hero-title">${post.title}</h2>
                            <p class="hero-excerpt">${post.excerpt}</p>
                            <div class="hero-meta">
                                <span>${this.formatDate(post.date)}</span>
                                <button class="hero-read-btn" onclick="event.stopPropagation(); blog.showPost('${post.slug}')">
                                    Leer Más →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    renderMagazineSecondary(post) {
        const categoryInfo = this.getCategoryInfo(post.category);
        const hasImage = post.featured_image;
        const imageUrl = hasImage ? this.getPostImage(post) : null;
        
        return `
            <article class="magazine-secondary-post" onclick="blog.showPost('${post.slug}')">
                <div class="secondary-image ${hasImage ? 'has-image' : 'no-image'}" 
                    ${hasImage ? `style="background-image: url('${imageUrl}')"` : `style="background: linear-gradient(135deg, ${categoryInfo.color}, ${this.lightenColor(categoryInfo.color, 20)})"`}>
                    ${!hasImage ? `
                        <div class="secondary-placeholder">
                            ${categoryInfo.icon}
                        </div>
                    ` : ''}
                </div>
                <div class="secondary-content">
                    <span class="post-category" style="background: ${this.lightenColor(categoryInfo.color, 90)}; color: ${categoryInfo.color}">
                        ${categoryInfo.icon} ${categoryInfo.name}
                    </span>
                    <h3 class="secondary-title">${post.title}</h3>
                    <p class="secondary-excerpt">${post.excerpt}</p>
                    <div class="post-meta">
                        <span>${this.formatDate(post.date)}</span>
                        <button class="read-more-btn" onclick="event.stopPropagation(); blog.showPost('${post.slug}')">
                            Leer más →
                        </button>
                    </div>
                </div>
            </article>
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
        const hasImage = post.featured_image;
        const imageUrl = hasImage ? this.getPostImage(post) : null;
        
        return `
            <article class="featured-post" onclick="blog.showPost('${post.slug}')">
                <div class="featured-image ${hasImage ? 'has-image' : 'no-image'}" 
                    ${hasImage ? `style="background-image: url('${imageUrl}')"` : `style="background: linear-gradient(135deg, ${categoryInfo.color}, ${this.lightenColor(categoryInfo.color, 20)})"`}>
                    ${!hasImage ? `
                        <div class="placeholder-icon">
                            ${categoryInfo.icon}
                        </div>
                    ` : ''}
                </div>
                <div class="featured-content">
                    <span class="post-category" style="background: ${this.lightenColor(categoryInfo.color, 90)}; color: ${categoryInfo.color}">
                        ${categoryInfo.icon} ${categoryInfo.name}
                    </span>
                    <h2 class="featured-title">${post.title}</h2>
                    <p class="featured-excerpt">${post.excerpt}</p>
                    <div class="post-meta">
                        <span>${this.formatDate(post.date)}</span>
                        <button class="read-more-btn" onclick="event.stopPropagation(); blog.showPost('${post.slug}')">
                            Leer más →
                        </button>
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
        let inFrontMatter = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line === '---') {
                if (!inFrontMatter) {
                    inFrontMatter = true;
                    continue;
                } else {
                    break;
                }
            }
            
            if (inFrontMatter && line.includes(':')) {
                const colonIndex = line.indexOf(':');
                const key = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 1).trim();
                
                // **PROBLEMA: Solo maneja comillas al principio y final**
                // Pero el valor puede tener espacios y otros caracteres
                
                // Mejorar el manejo de valores
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                } else if (value.startsWith("'") && value.endsWith("'")) {
                    value = value.slice(1, -1);
                }
                
                // **FIX: También limpiar espacios extra**
                value = value.replace(/^['"]|['"]$/g, '').trim();
                
                frontMatter[key] = value;
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
            console.log('🔍 Featured image found:', post.featured_image);
            
            let imagePath = post.featured_image;
            
            // Si ya es una URL completa, dejarla como está
            if (imagePath.startsWith('http')) {
                return imagePath;
            }
            
            // **FIX: Corregir la ruta base**
            // Las imágenes están en /static/img/ no en /img/
            if (imagePath.startsWith('/')) {
                imagePath = imagePath.substring(1); // quitar el slash inicial
            }
            
            // **IMPORTANTE: Agregar 'static/' a la ruta**
            if (!imagePath.startsWith('static/') && !imagePath.startsWith('img/')) {
                imagePath = `static/${imagePath}`;
            }
            
            // Asegurar que la ruta sea correcta
            if (imagePath.startsWith('img/')) {
                imagePath = `static/${imagePath}`;
            }
            
            const repoBase = 'https://raw.githubusercontent.com/Dan219/myBlog/main/';
            const finalUrl = `${repoBase}${imagePath}`;
            
            console.log('🖼️ Final image URL:', finalUrl);
            return finalUrl;
        }
        
        console.log('❌ No featured image for:', post.title);
        return null;
    }
    enhancePostImages(modal) {
        // Mejorar todas las imágenes dentro del contenido del post
        const images = modal.querySelectorAll('.post-body img');
        images.forEach(img => {
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.borderRadius = '8px';
            img.style.margin = '1.5rem 0';
            img.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            
            // Agregar loading lazy
            img.loading = 'lazy';
            
            // Manejar errores de imágenes
            img.onerror = function() {
                this.style.display = 'none';
            };
        });
        
        // Mejorar bloques de código
        const codeBlocks = modal.querySelectorAll('.post-body pre');
        codeBlocks.forEach(block => {
            block.style.position = 'relative';
        });
    }
    renderPostCard(post) {
        const categoryInfo = this.getCategoryInfo(post.category);
        const hasImage = post.featured_image;
        const imageUrl = hasImage ? this.getPostImage(post) : null;
        
        return `
            <article class="post-card" onclick="blog.showPost('${post.slug}')">
                <div class="post-image ${hasImage ? 'has-image' : ''}" 
                    ${hasImage ? `style="background-image: url('${imageUrl}')"` : ''}>
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
                        <button class="read-more-btn" onclick="event.stopPropagation(); blog.showPost('${post.slug}')">
                            Leer más →
                        </button>
                    </div>
                </div>
            </article>
        `;
    }
    showPost(slug) {
        const post = this.posts.find(p => p.slug === slug);
        if (!post) return;

        const categoryInfo = this.getCategoryInfo(post.category);
        const hasImage = post.featured_image;
        const imageUrl = hasImage ? this.getPostImage(post) : null;

        const modal = document.createElement('div');
        modal.className = 'post-modal';
        modal.innerHTML = `
            <div class="modal-content" onclick="event.stopPropagation()">
                <button class="close-modal" onclick="this.closest('.post-modal').remove()">×</button>
                <article class="full-post">
                    <div class="post-header">
                        ${hasImage ? `
                            <div class="post-hero-image">
                                <img src="${imageUrl}" alt="${post.title}" onerror="this.style.display='none'" />
                            </div>
                        ` : `
                            <div class="post-hero-placeholder" style="background: linear-gradient(135deg, ${categoryInfo.color}, ${this.lightenColor(categoryInfo.color, 20)})">
                                <div class="placeholder-icon">${categoryInfo.icon}</div>
                            </div>
                        `}
                        <span class="post-category" style="color: ${categoryInfo.color}; border: 1px solid ${categoryInfo.color}">
                            ${categoryInfo.icon} ${categoryInfo.name}
                        </span>
                        <h1>${post.title}</h1>
                        <time>${this.formatDate(post.date)}</time>
                    </div>
                    <div class="post-body">
                        ${post.body}
                    </div>
                </article>
            </div>
        `;
        
        // **FIX: Cerrar modal al hacer click fuera**
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // **FIX: Cerrar modal con ESC key**
        const closeModal = () => modal.remove();
        const handleEscape = (e) => {
            if (e.key === 'Escape') closeModal();
        };
        
        document.addEventListener('keydown', handleEscape);
        modal._handleEscape = handleEscape;
        
        document.body.appendChild(modal);
        
        // Enfocar el modal para que ESC funcione inmediatamente
        modal.focus();
        
        // Mejorar el renderizado de imágenes dentro del contenido del post
        this.enhancePostImages(modal);
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

// Y CSS para el modal
const modalCSS = `
.post-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.modal-content {
    background: white;
    border-radius: 15px;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    width: 100%;
}

.close-modal {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: #dc2626;
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
    cursor: pointer;
    z-index: 2001;
}

.full-post {
    padding: 3rem;
}

.post-header {
    text-align: center;
    margin-bottom: 2rem;
}

.post-body {
    line-height: 1.8;
}

.post-body img {
    max-width: 100%;
    border-radius: 10px;
    margin: 1rem 0;
}
`;
// Agregar el CSS al documento
const modalStyle = document.createElement('style');
modalStyle.textContent = modalCSS;
document.head.appendChild(modalStyle);

// Agrega esto al final de additionalCSS
const gridClickableCSS = `
    .post-card {
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .post-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .read-more-btn {
        cursor: pointer;
        transition: color 0.2s ease;
    }
    
    .read-more-btn:hover {
        color: #1e40af;
    }
`;

// Injectar el CSS
const gridStyle = document.createElement('style');
gridStyle.textContent = gridClickableCSS;
document.head.appendChild(gridStyle);

// Agregar este CSS para magazine view y modal
const magazineModalCSS = `
    /* Magazine View Styles */
    .magazine-featured {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        margin-bottom: 2rem;
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
        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }
    
    .featured-image {
        width: 100%;
        height: 250px;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
    }
    
    .featured-image.no-image {
        background: linear-gradient(135deg, var(--primary-color, #3b82f6), #60a5fa);
    }
    
    .featured-content {
        padding: 2rem;
    }
    
    .featured-title {
        font-size: 1.5rem;
        margin: 1rem 0;
        line-height: 1.3;
    }
    
    .featured-excerpt {
        color: #6b7280;
        margin-bottom: 1rem;
        line-height: 1.5;
    }
    
    /* Modal Improvements */
    .post-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        backdrop-filter: blur(5px);
    }
    
    .modal-content {
        background: white;
        border-radius: 15px;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        width: 100%;
        animation: modalAppear 0.3s ease;
    }
    
    @keyframes modalAppear {
        from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
    
    .close-modal {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: #dc2626;
        color: white;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        font-size: 1.5rem;
        cursor: pointer;
        z-index: 2001;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }
    
    .close-modal:hover {
        background: #b91c1c;
        transform: scale(1.1);
    }
    
    .full-post {
        padding: 3rem;
    }
    
    .post-header {
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .post-hero-image {
        width: 100%;
        max-height: 400px;
        overflow: hidden;
        border-radius: 12px;
        margin-bottom: 2rem;
    }
    
    .post-hero-image img {
        width: 100%;
        height: auto;
        object-fit: cover;
    }
    
    .post-hero-placeholder {
        width: 100%;
        height: 200px;
        border-radius: 12px;
        margin-bottom: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }
    
    .post-hero-placeholder .placeholder-icon {
        font-size: 3rem;
        opacity: 0.9;
    }
    
    .post-header .post-category {
        display: inline-block;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 600;
        margin-bottom: 1rem;
        background: transparent !important;
    }
    
    .post-header h1 {
        font-size: 2.5rem;
        margin: 1rem 0;
        line-height: 1.2;
    }
    
    .post-header time {
        color: #6b7280;
        font-size: 1rem;
    }
    
    .post-body {
        line-height: 1.8;
        font-size: 1.1rem;
    }
    
    .post-body img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        margin: 1.5rem 0;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .post-body pre {
        background: #1f2937;
        color: #f8f8f2;
        padding: 1.5rem;
        border-radius: 8px;
        overflow-x: auto;
        margin: 1.5rem 0;
        font-size: 0.9rem;
    }
    
    .post-body code {
        background: #f1f5f9;
        color: #dc2626;
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        font-size: 0.9em;
    }
    
    .post-body pre code {
        background: transparent;
        color: inherit;
        padding: 0;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
        .magazine-featured {
            grid-template-columns: 1fr;
            gap: 1rem;
        }
        
        .modal-content {
            margin: 1rem;
            max-height: 95vh;
        }
        
        .full-post {
            padding: 2rem 1.5rem;
        }
        
        .post-header h1 {
            font-size: 2rem;
        }
        
        .featured-image {
            height: 200px;
        }
    }
`;

// Injectar el CSS
const magazineModalStyle = document.createElement('style');
magazineModalStyle.textContent = magazineModalCSS;
document.head.appendChild(magazineModalStyle);

// Reemplazar el CSS del magazine view
const trueMagazineCSS = `
    /* Magazine Layout Real */
    .magazine-layout {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }
    
    /* Hero Post - Grande y destacado */
    .magazine-hero-post {
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        cursor: pointer;
        transition: all 0.3s ease;
        height: 500px;
        position: relative;
    }
    
    .magazine-hero-post:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 40px rgba(0,0,0,0.2);
    }
    
    .hero-image {
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        position: relative;
    }
    
    .hero-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(transparent, rgba(0,0,0,0.8));
        color: white;
        padding: 3rem;
    }
    
    .hero-content {
        max-width: 600px;
    }
    
    .hero-category {
        background: rgba(255,255,255,0.9) !important;
        color: #333 !important;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 600;
        margin-bottom: 1rem;
        display: inline-block;
    }
    
    .hero-title {
        font-size: 2.5rem;
        margin: 1rem 0;
        color: white;
        line-height: 1.2;
    }
    
    .hero-excerpt {
        font-size: 1.2rem;
        margin-bottom: 1.5rem;
        color: rgba(255,255,255,0.9);
        line-height: 1.5;
    }
    
    .hero-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: rgba(255,255,255,0.8);
    }
    
    .hero-read-btn {
        background: rgba(255,255,255,0.2);
        color: white;
        border: 2px solid rgba(255,255,255,0.5);
        padding: 0.75rem 1.5rem;
        border-radius: 25px;
        cursor: pointer;
        font-weight: 600;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
    }
    
    .hero-read-btn:hover {
        background: white;
        color: #333;
        border-color: white;
    }
    
    /* Posts Secundarios */
    .magazine-secondary {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
    }
    
    .magazine-secondary-post {
        background: white;
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
    }
    
    .magazine-secondary-post:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .secondary-image {
        width: 100%;
        height: 200px;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .secondary-placeholder {
        font-size: 2rem;
        color: white;
    }
    
    .secondary-content {
        padding: 1.5rem;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }
    
    .secondary-title {
        font-size: 1.3rem;
        margin: 0.5rem 0;
        line-height: 1.3;
        flex-grow: 1;
    }
    
    .secondary-excerpt {
        color: #6b7280;
        margin-bottom: 1rem;
        line-height: 1.4;
    }
    
    /* Sección de más posts */
    .section-title {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        color: #374151;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 0.5rem;
    }
    
    .magazine-grid .posts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }
    
    /* Responsive */
    @media (max-width: 1024px) {
        .hero-title {
            font-size: 2rem;
        }
        
        .hero-excerpt {
            font-size: 1.1rem;
        }
    }
    
    @media (max-width: 768px) {
        .magazine-hero-post {
            height: 400px;
        }
        
        .hero-overlay {
            padding: 2rem;
        }
        
        .hero-title {
            font-size: 1.8rem;
        }
        
        .magazine-secondary {
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }
        
        .magazine-grid .posts-grid {
            grid-template-columns: 1fr;
        }
    }
    
    @media (max-width: 480px) {
        .magazine-hero-post {
            height: 350px;
        }
        
        .hero-overlay {
            padding: 1.5rem;
        }
        
        .hero-title {
            font-size: 1.5rem;
        }
        
        .hero-excerpt {
            font-size: 1rem;
        }
    }
`;

// Reemplazar el CSS anterior
const magazineStyle = document.createElement('style');
magazineStyle.textContent = trueMagazineCSS;
document.head.appendChild(magazineStyle);

// En el CSS, agregar placeholders específicos para magazine
const placeholderCSS = `
    .hero-placeholder, .secondary-placeholder {
        font-size: 4rem;
        color: white;
        opacity: 0.8;
    }
    
    .secondary-placeholder {
        font-size: 2rem;
    }
    
    .no-image {
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;

const placeholderStyle = document.createElement('style');
placeholderStyle.textContent = placeholderCSS;
document.head.appendChild(placeholderStyle);