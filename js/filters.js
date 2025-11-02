export class FilterManager {
    constructor() {
        this.filters = {
            category: 'all',
            searchQuery: '',
            sortBy: 'newest',
            view: 'grid'
        };
    }

    apply(posts, categories) {
        let filtered = [...posts];

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
        return this.sortPosts(filtered);
    }

    sortPosts(posts) {
        return [...posts].sort((a, b) => {
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
    }

    // Getters y setters
    setCategory(category) { 
        this.filters.category = category; 
    }
    
    setSearchQuery(query) { 
        this.filters.searchQuery = query; 
    }
    
    setSortBy(sortBy) { 
        this.filters.sortBy = sortBy; 
    }
    
    setView(view) { 
        this.filters.view = view; 
    }
    
    getActiveCategory() { 
        return this.filters.category; 
    }
    
    getView() { 
        return this.filters.view; 
    }

    reset() {
        this.filters = {
            category: 'all',
            searchQuery: '',
            sortBy: 'newest',
            view: 'grid'
        };
    }
}