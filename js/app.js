import { PremiumBlog } from './blog.js';

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.blog = new PremiumBlog();
});