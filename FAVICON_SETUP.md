# Favicon Setup for CookItNext

This guide explains how to set up modern favicons for your CookItNext website using your existing logo.

## What's Been Set Up

✅ **Layout Updated**: Modern favicon references added to `src/app/layout.tsx`
✅ **Manifest Updated**: PWA manifest now uses correct favicon paths
✅ **Script Created**: Favicon generation script at `scripts/generate-favicons.js`
✅ **Dependencies Added**: Sharp image processing library added to package.json

## How to Generate Favicons

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Favicons
```bash
npm run generate-favicons
```

This will create the following files in your `public` directory:
- `favicon-16x16.png` - Small favicon for browsers
- `favicon-32x32.png` - Standard favicon size
- `apple-touch-icon.png` - iOS home screen icon (180x180)
- `android-chrome-192x192.png` - Android home screen icon
- `android-chrome-512x512.png` - High-resolution Android icon

### 3. Verify Setup
After running the script, your website will automatically use:
- Modern favicon standards with multiple sizes
- Proper PWA support for mobile devices
- Consistent branding across all platforms

## Favicon Features

- **Multi-size Support**: Automatically serves the right size for each device
- **Apple Touch Icon**: Optimized for iOS home screen
- **Android Chrome**: Proper Android PWA support
- **Fallback Support**: Graceful degradation for older browsers
- **Performance**: Optimized image sizes for fast loading

## Troubleshooting

If you encounter issues:

1. **Sharp not found**: Run `npm install` to install dependencies
2. **Logo not found**: Ensure `cookitnext_logo.png` exists in `public/` directory
3. **Permission errors**: Check file permissions in the `public/` directory

## Manual Override

If you prefer to use your own favicon files, simply:
1. Replace the generated files in the `public/` directory
2. Ensure they match the expected names and sizes
3. The layout will automatically use your custom files

## Browser Support

- ✅ Chrome/Edge (all sizes)
- ✅ Firefox (all sizes)
- ✅ Safari (all sizes)
- ✅ Mobile browsers (PWA support)
- ✅ Legacy browsers (fallback support)
