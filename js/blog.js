import { ApiService } from './api.js';
import { PostManager } from './posts.js';
import { CategoryManager } from './categories.js';
import { UIManager } from './ui.js';
import { FilterManager } from './filters.js';

export class PremiumBlog {
    constructor() {
        this.api = new ApiService();
        this.posts = new PostManager(this.api);
        this.categories = new CategoryManager(this.api);
        this.ui = new UIManager();
        this.filters = new FilterManager();
        
        this.init();
    }

    async init() {
        try {
            this.ui.showLoading();
            await this.categories.load();
            await this.posts.load();
            this.ui.setupEventListeners(this);
            this.render();
        } catch (error) {
            console.error('Error initializing blog:', error);
            this.ui.showError('Error al cargar el blog');
        }
    }

    render() {
        const filteredPosts = this.filters.apply(this.posts.getAll(), this.categories.getAll());
        this.ui.renderPosts(filteredPosts, this.filters.getView(), this.categories.getAll());
        this.ui.renderTrending(this.posts.getTrending(), this.categories.getAll());
        this.ui.updateContentTitle(this.filters.getActiveCategory(), filteredPosts.length, this.categories.getAll());
        this.ui.updateActiveFilters(this.filters.getActiveCategory());
        this.ui.updateActiveView(this.filters.getView());
    }

    // Métodos públicos para UI
    setCategoryFilter(category) {
        this.filters.setCategory(category);
        this.render();
    }

    setSearchFilter(query) {
        this.filters.setSearchQuery(query);
        this.render();
    }

    setSortFilter(sortBy) {
        this.filters.setSortBy(sortBy);
        this.render();
    }

    setView(view) {
        this.filters.setView(view);
        this.render();
    }

    showPost(slug) {
        const post = this.posts.getBySlug(slug);
        if (post) {
            this.ui.showPostModal(post, this.categories.getInfo(post.category));
        }
    }

    resetFilters() {
        this.filters.reset();
        this.render();
    }

    // Métodos auxiliares para compatibilidad
    getCategoryInfo(categorySlug) {
        return this.categories.getInfo(categorySlug);
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
}