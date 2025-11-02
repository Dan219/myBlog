export class CategoryManager {
    constructor(api) {
        this.api = api;
        this.categories = {};
    }

    async load() {
        try {
            const files = await this.api.getCategories();
            if (!files) {
                this.categories = this.getDefaultCategories();
                return;
            }

            const categoryFiles = files.filter(file => file.name.endsWith('.md'));
            
            if (categoryFiles.length === 0) {
                throw new Error('No hay archivos de categoría');
            }
            
            for (const file of categoryFiles) {
                try {
                    const category = await this.parseCategory(file);
                    this.categories[category.slug] = category;
                } catch (error) {
                    console.error('Error parsing category:', file.name, error);
                }
            }
            
        } catch (error) {
            console.error('Error loading categories, using defaults:', error);
            this.categories = this.getDefaultCategories();
        }
    }

    async parseCategory(file) {
        const content = await this.api.getFileContent(file.download_url);
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

    cleanFrontMatter(line, key) {
        return line.replace(`${key}:`, '').trim().replace(/['"]/g, '');
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

    getAll() {
        return this.categories;
    }

    getInfo(categorySlug) {
        return this.categories[categorySlug] || {
            name: 'General',
            icon: '📄',
            color: '#6b7280',
            slug: 'general'
        };
    }
}