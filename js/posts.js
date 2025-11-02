export class PostManager {
    constructor(api) {
        this.api = api;
        this.posts = [];
    }

    async load() {
        const files = await this.api.getPosts();
        const postFiles = files.filter(file => file.name.endsWith('.md'));
        
        this.posts = await Promise.all(
            postFiles.map(file => this.parsePost(file))
        );
    }

    async parsePost(file) {
        try {
            const content = await this.api.getFileContent(file.download_url);
            return this.parsePostContent(content, file.name, file.sha);
        } catch (error) {
            console.error('Error parsing post:', file.name, error);
            return this.createErrorPost(file.name);
        }
    }

    parsePostContent(content, filename, fileSha) {
        const lines = content.split('\n');
        let title = this.formatTitle(filename);
        let body = content;
        let category = 'programacion';
        let date = new Date().toISOString();
        let excerpt = '';
        let featured_image = null;

        if (lines[0] === '---') {
            const frontMatter = this.parseFrontMatter(lines);
            title = frontMatter.title || title;
            category = frontMatter.category || category;
            date = frontMatter.date || date;
            excerpt = frontMatter.excerpt || '';
            featured_image = frontMatter.featured_image || null;
            
            body = lines.slice(lines.indexOf('---', 1) + 1).join('\n');
        }

        if (!excerpt) {
            const plainText = body.replace(/[#*`]/g, '').substring(0, 150);
            excerpt = plainText + (plainText.length === 150 ? '...' : '');
        }

        return {
            id: fileSha,
            title,
            body: marked.parse(body),
            excerpt,
            category,
            date: new Date(date),
            slug: filename.replace('.md', ''),
            featured_image,
            url: `#post-${filename.replace('.md', '')}`
        };
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
                
                value = value.replace(/^['"]|['"]$/g, '').trim();
                frontMatter[key] = value;
            }
        }
        return frontMatter;
    }

    formatTitle(filename) {
        return filename
            .replace('.md', '')
            .replace(/^\d{4}-\d{2}-\d{2}-/, '')
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    cleanFrontMatter(line, key) {
        return line.replace(`${key}:`, '').trim().replace(/['"]/g, '');
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

    getAll() { 
        return this.posts; 
    }
    
    getBySlug(slug) { 
        return this.posts.find(p => p.slug === slug); 
    }
    
    getTrending() { 
        return [...this.posts]
            .sort((a, b) => b.date - a.date)
            .slice(0, 3); 
    }
}