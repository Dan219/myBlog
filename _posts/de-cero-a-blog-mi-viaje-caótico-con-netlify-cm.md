---
title: "De Cero a Blog: Mi Viaje Caótico con Netlify CMS"
category: personal
date: 2025-11-01T23:47:59.330Z
featured_image: /img/1.jpg
excerpt: Mi experiencia configurando un blog técnico con Netlify CMS, desde la
  lucha con Identity hasta el deploy exitoso.
---
## La Promesa vs La Realidad

**Lo que prometían:** "Configura tu blog en 15 minutos con Netlify CMS"
**Lo que pasó:** 2 horas de lucha con Netlify Identity, confirmación de emails, y URLs malformadas.

## Lecciones Aprendidas (a los golpes)

### 1. Netlify Identity es... interesante

* Los emails de confirmación son más esquivos que un bug en producción
* La documentación asume que todo funciona perfecto a la primera
* "Email not confirmed" se convirtió en mi mantra

### 2. GitHub API tiene sus mañas

````javascript
```javascript
// Esto NO funciona:
https://api.github.com/repos/usuario/repo/_posts

// Esto SÍ funciona:  
https://api.github.com/repos/usuario/repo/contents/_posts
````



El mágico `/contents/` que nadie te dice pero es crucial.

### 3. CSS mejora todo

De un diseño plano y aburrido a algo que al menos no da pena mostrar.

## Lo que SÍ Funcionó

* **Netlify deploy**: Impecable, cada cambio en segundos
* **GitHub integration**: Una vez que entendí el API, fluido
* **Decap CMS**: Cuando finalmente funciona, es genial

## Conclusión

Valió la pena el sufrimiento. Ahora tengo un blog técnico funcional donde puedo documentar mis proyectos reales sin depender de plataformas de terceros.

**Moraleja:** A veces el camino más "fácil" resulta ser el más educativo.

````

## **Para mejorar el diseño**, agreguemos esto al CSS:

```css
/* Mejoras adicionales */
.post-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.post-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.header {
    position: sticky;
    top: 0;
    z-index: 100;
}

/* Mejorar bloques de código */
.post-content pre {
    background: #2d2d2d;
    color: #f8f8f2;
    padding: 1rem;
    border-radius: 5px;
    overflow-x: auto;
    margin: 1rem 0;
}

.post-content code {
    background: #f1f3f4;
    color: #c7254e;
}
````