# Deployment Guide

This guide will help you deploy the Ahmad Ziyad Portfolio to various hosting platforms with live links.

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended - Free)

Vercel provides the easiest deployment with automatic CI/CD from GitHub.

#### Steps:

1. **Fork this repository** to your GitHub account

2. **Sign up for Vercel** at [vercel.com](https://vercel.com)

3. **Import your project**:
   - Click "New Project" in Vercel dashboard
   - Import from GitHub
   - Select your forked repository
   - Set build settings:
     - **Framework Preset**: Create React App
     - **Root Directory**: `packages/frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`

4. **Deploy**: Click "Deploy" and wait for completion

5. **Custom Domain** (Optional):
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed

#### Environment Variables (if using backend):
```
REACT_APP_API_BASE_URL=https://your-backend-url.com
```

### Option 2: Netlify (Free Alternative)

1. **Fork the repository**

2. **Sign up for Netlify** at [netlify.com](https://netlify.com)

3. **Deploy from Git**:
   - Click "New site from Git"
   - Connect to GitHub
   - Select your repository
   - Build settings:
     - **Base directory**: `packages/frontend`
     - **Build command**: `npm run build`
     - **Publish directory**: `packages/frontend/build`

4. **Deploy**: Click "Deploy site"

### Option 3: GitHub Pages (Free)

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages`

2. **Add deployment workflow**:
   ```yaml
   # .github/workflows/gh-pages.yml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: '18'
             cache: 'npm'
         - run: npm ci
         - run: npm run build:frontend
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: packages/frontend/build
   ```

## 🔧 Backend Deployment (Optional)

If you want to deploy the AI chat backend:

### Railway (Free Tier)

1. **Sign up** at [railway.app](https://railway.app)
2. **Deploy from GitHub**:
   - Connect repository
   - Select `packages/backend`
   - Add environment variables
3. **Add Redis**: Add Redis service from Railway marketplace

### Render (Free Tier)

1. **Sign up** at [render.com](https://render.com)
2. **Create Web Service**:
   - Connect GitHub repository
   - Root Directory: `packages/backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

### Docker Deployment

```bash
# Build and push to Docker Hub
docker build -t your-username/portfolio-backend ./packages/backend
docker push your-username/portfolio-backend

# Deploy to any Docker-compatible platform
docker run -p 3001:3001 your-username/portfolio-backend
```

## 🌐 Custom Domain Setup

### Vercel Custom Domain

1. **Add domain** in Vercel dashboard
2. **Configure DNS**:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.19.61
   ```

### Netlify Custom Domain

1. **Add domain** in Netlify dashboard
2. **Configure DNS**:
   ```
   Type: CNAME
   Name: www
   Value: your-site-name.netlify.app
   
   Type: ALIAS/ANAME
   Name: @
   Value: your-site-name.netlify.app
   ```

## 📊 Performance Optimization

### Build Optimization

1. **Enable compression** in hosting platform
2. **Configure caching headers**
3. **Optimize images** before deployment
4. **Enable CDN** for static assets

### Vercel Optimization

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## 🔒 Security Configuration

### Environment Variables

Never commit sensitive data. Use platform environment variables:

```bash
# Vercel
vercel env add REACT_APP_API_KEY

# Netlify
netlify env:set REACT_APP_API_KEY your-key-value
```

### HTTPS Configuration

All recommended platforms provide automatic HTTPS. For custom domains:

1. **Let's Encrypt** certificates (automatic)
2. **Custom SSL** certificates (if needed)

## 📈 Monitoring & Analytics

### Vercel Analytics

```bash
npm install @vercel/analytics
```

```tsx
// Add to App.tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      {/* Your app */}
      <Analytics />
    </>
  );
}
```

### Google Analytics

```tsx
// Add to public/index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build:frontend
   ```

2. **Routing Issues** (SPA):
   ```json
   // vercel.json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

3. **Environment Variables**:
   - Ensure all `REACT_APP_` prefixed variables are set
   - Restart deployment after adding variables

### Performance Issues

1. **Bundle Size**:
   ```bash
   npm run build:frontend
   npx webpack-bundle-analyzer packages/frontend/build/static/js/*.js
   ```

2. **Lighthouse Audit**:
   - Run in Chrome DevTools
   - Address performance recommendations

## 📞 Support

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Netlify**: [netlify.com/support](https://netlify.com/support)
- **GitHub Pages**: [docs.github.com/pages](https://docs.github.com/pages)

---

**Choose the deployment option that best fits your needs. Vercel is recommended for its simplicity and performance.**