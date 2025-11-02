import { Templates } from './templates.js';

export class UIManager {
    constructor() {
        this.templates = new Templates();
    }

    setupEventListeners(blog) {
        this.setupCategoryFilters(blog);
        this.setupSearch(blog);
        this.setupSort(blog);
        this.setupViewControls(blog);
        this.setupMobileMenu();
    }

    setupCategoryFilters(blog) {
        const container = document.querySelector('.category-filters');
        if (!container) return;

        container.innerHTML = this.templates.categoryFilters(blog.categories.getAll());
        
        container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                blog.setCategoryFilter(e.target.dataset.category);
            });
        });
    }

    setupSearch(blog) {
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.querySelector('.search-btn');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                blog.setSearchFilter(e.target.value);
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') blog.setSearchFilter(e.target.value);
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                blog.setSearchFilter(searchInput?.value || '');
            });
        }
    }

    setupSort(blog) {
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                blog.setSortFilter(e.target.value);
            });
        }
    }

    setupViewControls(blog) {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                blog.setView(e.target.dataset.view);
            });
        });
    }

    setupMobileMenu() {
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

    renderPosts(posts, view, categories) {
        const container = document.getElementById('posts-container');
        if (!container) return;

        if (posts.length === 0) {
            container.innerHTML = this.templates.noResults();
            return;
        }

        container.innerHTML = this.templates.postsView(posts, view, categories);
        this.enhancePostInteractivity();
    }

    renderTrending(posts, categories) {
        const container = document.getElementById('trending-sidebar');
        if (!container) return;

        container.innerHTML = posts.map(post => 
            this.templates.trendingPost(post, categories[post.category])
        ).join('');
    }

    updateContentTitle(category, count, categories) {
        const titleElement = document.getElementById('content-title');
        if (!titleElement) return;
        
        if (category === 'all') {
            titleElement.textContent = `Todos los Posts (${count})`;
        } else {
            const categoryInfo = categories[category];
            titleElement.textContent = `${categoryInfo?.name || category} (${count})`;
        }
    }

    updateActiveFilters(activeCategory) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === activeCategory);
        });
    }

    updateActiveView(activeView) {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === activeView);
        });
    }

    showPostModal(post, categoryInfo) {
        const modal = this.templates.postModal(post, categoryInfo);
        document.body.appendChild(modal);
        this.setupModalEvents(modal);
        this.enhancePostImages(modal);
    }

    setupModalEvents(modal) {
        // Cerrar modal al hacer click fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.removeEventListener('keydown', modal._handleEscape);
            }
        });

        // Cerrar modal con ESC
        const handleEscape = (e) => {
            if (e.key === 'Escape') modal.remove();
        };
        
        document.addEventListener('keydown', handleEscape);
        modal._handleEscape = handleEscape;

        // Cerrar con botón
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.remove();
                document.removeEventListener('keydown', modal._handleEscape);
            });
        }
    }

    enhancePostImages(modal) {
        const images = modal.querySelectorAll('.post-body img');
        images.forEach(img => {
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.borderRadius = '8px';
            img.style.margin = '1.5rem 0';
            img.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            img.loading = 'lazy';
            
            img.onerror = function() {
                this.style.display = 'none';
            };
        });
    }

    enhancePostInteractivity() {
        // Todos los posts son clickeables
        document.querySelectorAll('.post-card, .post-list-item, .magazine-hero-post, .magazine-secondary-post').forEach(element => {
            element.style.cursor = 'pointer';
        });
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
                    <button onclick="blog.posts.load().then(() => blog.render())" class="retry-btn">Reintentar</button>
                </div>
            `;
        }
    }
}