export class ApiService {
    constructor() {
        this.baseUrl = 'https://api.github.com/repos/Dan219/myBlog/contents';
        this.rawBaseUrl = 'https://raw.githubusercontent.com/Dan219/myBlog/main';
    }

    async fetchJson(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }

    async getPosts() {
        return this.fetchJson(`${this.baseUrl}/_posts`);
    }

    async getCategories() {
        try {
            return await this.fetchJson(`${this.baseUrl}/_categories`);
        } catch (error) {
            console.log('No categories folder found, using defaults');
            return null;
        }
    }

    async getFileContent(downloadUrl) {
        const response = await fetch(downloadUrl);
        if (!response.ok) throw new Error('Failed to fetch file');
        return response.text();
    }

    getImageUrl(imagePath) {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        
        let path = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
        if (!path.startsWith('static/') && !path.startsWith('img/')) {
            path = `static/${path}`;
        }
        
        if (path.startsWith('img/')) {
            path = `static/${path}`;
        }
        
        return `${this.rawBaseUrl}/${path}`;
    }
}