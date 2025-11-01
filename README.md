# Technical Blog - Full Stack Project

Personal technical blog built with modern web technologies and headless CMS.

## 🌐 Live Demo

**Blog:** https://danielfloresblog.netlify.app  
**CMS:** https://danielfloresblog.netlify.app/admin/

## 🛠 Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript
- **CMS:** Decap CMS (formerly Netlify CMS)
- **Hosting:** Netlify
- **Version Control:** GitHub
- **Deployment:** Continuous Deployment via Git

## 🏗️ Architecture

```
myBlog/
├── admin/               # CMS configuration
├── _posts/              # Markdown content
├── static/              # Assets
├── index.html           # Main page
├── style.css            # Custom styles
└── script.js            # Dynamic content loader
```

## 🚀 Features

- **Headless CMS** - Content management without database
- **Git-based workflow** - All content versioned in Git
- **Responsive design** - Mobile-friendly layout
- **Fast loading** - Static site performance
- **Auto-deploy** - Instant publishing on content changes

## 📝 Content Management

### Using the CMS
1. Visit `/admin/`
2. Login with GitHub
3. Create/edit posts with rich editor
4. Changes automatically deploy

### Manual Content
```markdown
// _posts/2024-11-01-post.md
---
title: "My Post Title"
date: 2024-11-01
---
Post content in markdown...
```

## 🚦 Getting Started

1. **Clone repository:**
   ```bash
   git clone https://github.com/Dan219/myBlog.git
   ```

2. **Local development:**
   ```bash
   # Serve with local server
   python -m http.server 8000
   ```

## 🎯 Project Goals

- Document technical learning journey
- Showcase full-stack development skills
- Practice modern web development
- Create professional developer portfolio

## 🔧 Technical Skills Demonstrated

- Frontend development (HTML/CSS/JS)
- API integration (GitHub REST API)
- Headless CMS configuration
- CI/CD and automated deployment
- Responsive web design
