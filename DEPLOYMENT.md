# Deployment Guide

This project supports multiple deployment options:

## 1. Firebase Hosting (Current)

### Manual Deployment
```bash
npm run build
firebase deploy --only hosting
```

### URL
- Production: https://cookgpt-a865a.web.app

## 2. Netlify (CI/CD Ready)

### Setup Instructions

1. **Connect to Netlify**:
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository: `pranabesh-official/cookitnext`
   - Use these build settings:
     - Build command: `npm run build`
     - Publish directory: `out`

2. **Configure GitHub Secrets**:
   - Go to your GitHub repository settings
   - Navigate to "Secrets and variables" > "Actions"
   - Add these secrets:
     - `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token
     - `NETLIFY_SITE_ID`: Your Netlify site's API ID

3. **Automatic Deployment**:
   - Push to `main` branch triggers automatic deployment
   - Pull requests will also trigger preview deployments

### Build Configuration
- **Build Command**: `npm run build`
- **Publish Directory**: `out`
- **Node Version**: 18
- **Environment Variables**: Configure in Netlify dashboard

### Features
- ✅ Automatic deployments on push to main
- ✅ Preview deployments for pull requests
- ✅ Build optimization and caching
- ✅ Custom headers and redirects
- ✅ Form handling and edge functions support

## 3. Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 4. Environment Variables

Create a `.env.local` file for local development:

```env
# Add your environment variables here
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
# ... other Firebase config
```

## 5. Build Optimization

The project is configured for optimal static export:
- Static generation for all pages
- Image optimization disabled for static export
- Trailing slashes enabled for better routing
- TypeScript and ESLint errors ignored during build for faster deployment

## 6. Troubleshooting

### Build Issues
- Ensure all static files are in the `public/` directory
- Check that `next.config.ts` has `output: 'export'` enabled
- Verify all routes have proper static generation

### Deployment Issues
- Check GitHub Actions logs for CI/CD issues
- Verify Netlify build logs for deployment problems
- Ensure all environment variables are properly set
