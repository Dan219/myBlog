export class Templates {
    categoryFilters(categories) {
        const categoriesArray = Object.values(categories);
        return `
            <button class="filter-btn active" data-category="all">Todos</button>
            ${categoriesArray.map(cat => `
                <button class="filter-btn" data-category="${cat.slug}">
                    ${cat.icon} ${cat.name}
                </button>
            `).join('')}
        `;
    }

    postsView(posts, view, categories) {
        switch (view) {
            case 'list':
                return this.listView(posts, categories);
            case 'magazine':
                return this.magazineView(posts, categories);
            case 'grid':
            default:
                return this.gridView(posts, categories);
        }
    }

    gridView(posts, categories) {
        return `
            <div class="posts-grid">
                ${posts.map(post => this.postCard(post, categories[post.category])).join('')}
            </div>
        `;
    }

    listView(posts, categories) {
        return `
            <div class="posts-list">
                ${posts.map(post => this.postListItem(post, categories[post.category])).join('')}
            </div>
        `;
    }

    magazineView(posts, categories) {
        if (posts.length === 0) return this.noResults();

        const featuredPost = posts[0];
        const secondaryPosts = posts.slice(1, 3);
        const remainingPosts = posts.slice(3);
        
        return `
            <div class="magazine-layout">
                <div class="magazine-hero">
                    ${this.magazineHero(featuredPost, categories[featuredPost.category])}
                </div>
                
                ${secondaryPosts.length > 0 ? `
                    <div class="magazine-secondary">
                        ${secondaryPosts.map(post => this.magazineSecondary(post, categories[post.category])).join('')}
                    </div>
                ` : ''}
                
                ${remainingPosts.length > 0 ? `
                    <div class="magazine-grid">
                        <h3 class="section-title">Más Posts</h3>
                        <div class="posts-grid">
                            ${remainingPosts.map(post => this.postCard(post, categories[post.category])).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    postCard(post, categoryInfo) {
        const hasImage = post.featured_image;
        const imageUrl = hasImage ? blog.api.getImageUrl(post.featured_image) : null;
        
        return `
            <article class="post-card" onclick="blog.showPost('${post.slug}')">
                <div class="post-image ${hasImage ? 'has-image' : ''}" 
                    ${hasImage ? `style="background-image: url('${imageUrl}')"` : ''}>
                    ${!hasImage ? categoryInfo.icon : ''}
                </div>
                <div class="post-content">
                    <span class="post-category" style="background: ${blog.lightenColor(categoryInfo.color, 90)}; color: ${categoryInfo.color}">
                        ${categoryInfo.icon} ${categoryInfo.name}
                    </span>
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <div class="post-meta">
                        <span>${blog.formatDate(post.date)}</span>
                        <button class="read-more-btn" onclick="event.stopPropagation(); blog.showPost('${post.slug}')">
                            Leer más →
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    postListItem(post, categoryInfo) {
        return `
            <article class="post-list-item" onclick="blog.showPost('${post.slug}')">
                <div class="list-item-content">
                    <span class="post-category" style="background: ${blog.lightenColor(categoryInfo.color, 90)}; color: ${categoryInfo.color}">
                        ${categoryInfo.icon} ${categoryInfo.name}
                    </span>
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <div class="post-meta">
                        <span>${blog.formatDate(post.date)}</span>
                        <button class="read-more-btn">Leer más →</button>
                    </div>
                </div>
            </article>
        `;
    }

    magazineHero(post, categoryInfo) {
        const hasImage = post.featured_image;
        const imageUrl = hasImage ? blog.api.getImageUrl(post.featured_image) : null;
        
        return `
            <article class="magazine-hero-post" onclick="blog.showPost('${post.slug}')">
                <div class="hero-image ${hasImage ? 'has-image' : 'no-image'}" 
                    ${hasImage ? `style="background-image: url('${imageUrl}')"` : `style="background: linear-gradient(135deg, ${categoryInfo.color}, ${blog.lightenColor(categoryInfo.color, 20)})"`}>
                    ${!hasImage ? `
                        <div class="hero-placeholder">
                            ${categoryInfo.icon}
                        </div>
                    ` : ''}
                    
                    <div class="hero-overlay">
                        <div class="hero-content">
                            <span class="hero-category" style="background: ${blog.lightenColor(categoryInfo.color, 90)}; color: ${categoryInfo.color}">
                                ${categoryInfo.icon} ${categoryInfo.name}
                            </span>
                            <h2 class="hero-title">${post.title}</h2>
                            <p class="hero-excerpt">${post.excerpt}</p>
                            <div class="hero-meta">
                                <span>${blog.formatDate(post.date)}</span>
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

    magazineSecondary(post, categoryInfo) {
        const hasImage = post.featured_image;
        const imageUrl = hasImage ? blog.api.getImageUrl(post.featured_image) : null;
        
        return `
            <article class="magazine-secondary-post" onclick="blog.showPost('${post.slug}')">
                <div class="secondary-image ${hasImage ? 'has-image' : 'no-image'}" 
                    ${hasImage ? `style="background-image: url('${imageUrl}')"` : `style="background: linear-gradient(135deg, ${categoryInfo.color}, ${blog.lightenColor(categoryInfo.color, 20)})"`}>
                    ${!hasImage ? `
                        <div class="secondary-placeholder">
                            ${categoryInfo.icon}
                        </div>
                    ` : ''}
                </div>
                <div class="secondary-content">
                    <span class="post-category" style="background: ${blog.lightenColor(categoryInfo.color, 90)}; color: ${categoryInfo.color}">
                        ${categoryInfo.icon} ${categoryInfo.name}
                    </span>
                    <h3 class="secondary-title">${post.title}</h3>
                    <p class="secondary-excerpt">${post.excerpt}</p>
                    <div class="post-meta">
                        <span>${blog.formatDate(post.date)}</span>
                        <button class="read-more-btn" onclick="event.stopPropagation(); blog.showPost('${post.slug}')">
                            Leer más →
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    trendingPost(post, categoryInfo) {
        return `
            <div class="trending-post" onclick="blog.showPost('${post.slug}')">
                <strong>${post.title}</strong>
                <small>${blog.formatDate(post.date)}</small>
            </div>
        `;
    }

    postModal(post, categoryInfo) {
        const hasImage = post.featured_image;
        const imageUrl = hasImage ? blog.api.getImageUrl(post.featured_image) : null;

        const modal = document.createElement('div');
        modal.className = 'post-modal';
        modal.innerHTML = `
            <div class="modal-content" onclick="event.stopPropagation()">
                <button class="close-modal">×</button>
                <article class="full-post">
                    <div class="post-header">
                        ${hasImage ? `
                            <div class="post-hero-image">
                                <img src="${imageUrl}" alt="${post.title}" onerror="this.style.display='none'" />
                            </div>
                        ` : `
                            <div class="post-hero-placeholder" style="background: linear-gradient(135deg, ${categoryInfo.color}, ${blog.lightenColor(categoryInfo.color, 20)})">
                                <div class="placeholder-icon">${categoryInfo.icon}</div>
                            </div>
                        `}
                        <span class="post-category" style="color: ${categoryInfo.color}; border: 1px solid ${categoryInfo.color}">
                            ${categoryInfo.icon} ${categoryInfo.name}
                        </span>
                        <h1>${post.title}</h1>
                        <time>${blog.formatDate(post.date)}</time>
                    </div>
                    <div class="post-body">
                        ${post.body}
                    </div>
                </article>
            </div>
        `;
        
        return modal;
    }

    noResults() {
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
}