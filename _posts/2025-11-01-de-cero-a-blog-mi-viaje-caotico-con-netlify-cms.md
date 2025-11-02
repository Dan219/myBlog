---
title: "De Caos a Orden: Refactorizando Mi Blog con Estructura Modular"
category: programacion
date: 2025-11-02T10:30:00.000Z
featured_image: /img/refactor.jpg
excerpt: Cómo transformé mi blog de un archivo gigante a una estructura organizada y mantenible sin perder funcionalidad.
---

## El Problema: Un Monstruo de 500 Líneas

Mi blog comenzó como la mayoría de proyectos personales: un solo archivo `index.html` que crecía sin control. CSS, JavaScript, HTML... todo mezclado en un caos creativo que se volvía insostenible.

**Antes:**
```html
<!-- index.html (el monstruo) -->
<style>
  /* 200 líneas de CSS */
</style>
<script>
  // 300 líneas de JavaScript  
</script>
<!-- HTML del blog -->
```

## La Solución: Separación de Responsabilidades

Hoy decidí que era suficiente. Aquí está mi transformación:

### 1. Estructura de Carpetas
```
mi-blog/
├── css/
│   ├── main.css          # Estilos base
│   ├── components.css    # Componentes reutilizables
│   └── layout.css        # Maquetación
├── js/
│   ├── app.js           # Lógica principal
│   ├── posts.js         # Manejo de posts
│   ├── ui.js            # Interfaz de usuario
│   └── utils.js         # Utilidades
└── index.html           # Punto de entrada limpio
```

### 2. CSS Organizado y Mantenible

**main.css:**
```css
:root {
    --primary-color: #2563eb;
    --text-color: #1f2937;
    --bg-color: #ffffff;
}

body {
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    color: var(--text-color);
}
```

**components.css:**
```css
.post-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
}

.post-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
}
```

### 3. JavaScript Modular

**app.js:**
```javascript
import { loadPosts } from './posts.js';
import { initUI } from './ui.js';

class BlogApp {
    constructor() {
        this.posts = [];
        this.init();
    }

    async init() {
        this.posts = await loadPosts();
        initUI(this.posts);
    }
}

new BlogApp();
```

**posts.js:**
```javascript
export async function loadPosts() {
    try {
        const response = await fetch('/posts.json');
        return await response.json();
    } catch (error) {
        console.error('Error loading posts:', error);
        return [];
    }
}
```

## Lo que Gané con la Refactorización

### ✅ **Mantenibilidad**
- Encontrar y modificar estilos ahora toma segundos, no minutos
- Los bugs son más fáciles de localizar y arreglar

### ✅ **Reutilización**
- Los componentes de post pueden usarse en otras páginas
- La lógica de carga de posts es independiente

### ✅ **Escalabilidad**
- Agregar nuevas features es trivial
- El equipo (si tuviera uno) podría trabajar en paralelo

### ✅ **Sin Pérdida de Funcionalidad**
- Todo lo que funcionaba antes sigue funcionando
- Pero ahora el código es limpio y profesional

## La Reflexión: ¿Valió la Pena Todo Este Camino?

Mirando hacia atrás, me pregunto: **¿si hubiera sabido que iba a ser tan extenso, habría elegido otra stack?**

### La Opción Alternativa: Strapi + React

**Lo que me tentaba:**
```javascript
// Con Strapi + React sería más "moderno"
import { useState, useEffect } from 'react';
import { strapiClient } from './api';

function BlogApp() {
    const [posts, setPosts] = useState([]);
    
    useEffect(() => {
        strapiClient.get('/posts')
            .then(setPosts);
    }, []);
    
    return <PostList posts={posts} />;
}
```

**Pros que consideré:**
- ✅ **Strapi Cloud** tiene plan free generoso
- ✅ **React** para componentes reutilizables de verdad
- ✅ **API REST/GraphQL** nativa y bien documentada
- ✅ **Autenticación** integrada sin dolores de cabeza
- ✅ **Github integration** más straightforward

**Contras que me detuvieron:**
- ❌ **Overkill** para un blog simple
- ❌ **Dependencia** de otro servicio externo
- ❌ **Complexidad** añadida sin necesidad real
- ❌ **Directus** ya no es gratis (sí, lo investigué)

### Netlify CMS vs Strapi: Mi Verdict

**Netlify CMS gana en:**
- Simplicidad para contenido estático
- Integración nativa con GitHub
- Deploy instantáneo con Netlify
- Zero maintenance del CMS

**Strapi gana en:**
- Flexibilidad para contenido dinámico
- API más robusta
- Mejor experiencia de desarrollo
- Autenticación más confiable

## Los Desafíos Inesperados

### 1. **Paths y Imports**
Aprendí que en JavaScript modules, los paths son relativos al archivo que los importa, no al HTML principal.

### 2. **Orden de Carga**
Tuve que asegurarme de que CSS cargue antes que JavaScript para evitar FOUC (Flash of Unstyled Content).

### 3. **Compatibilidad**
Agregué `type="module"` a mis scripts para usar imports modernos.

## Resultado Final

**Antes:** Un archivo de 500 líneas imposible de mantener  
**Después:** 6 archivos especializados, limpios y fáciles de entender

**Stack final:** Netlify CMS + GitHub + Vanilla JavaScript (organizado)

## Conclusión

La refactorización no es solo para proyectos grandes. Incluso en un blog personal, la organización del código paga dividendos en productividad y satisfacción.

**Mi stack actual funciona**, pero si empezara hoy mismo un proyecto más complejo, probablemente elegiría **Strapi + React** desde el inicio. Para un blog simple, Netlify CMS sigue siendo suficiente, pero conociendo las limitaciones.

**Moraleja:** Elige tu stack basado en la complejidad real del proyecto, no en lo que "suena cool".

---

*¿Tienes algún tip de organización de código que quieras compartir? ¿O alguna experiencia con Strapi vs Netlify CMS? ¡Cuéntame en los comentarios!*
```
