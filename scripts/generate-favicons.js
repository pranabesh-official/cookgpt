const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
let toIco;

// Ensure the public directory exists
const publicDir = path.join(__dirname, '../public');

// Function to generate favicon
async function generateFavicon() {
  try {
    console.log('🔄 Generating favicons from appicon.png...');
    
    const logoPath = path.join(publicDir, 'appicon.png');
    
    if (!fs.existsSync(logoPath)) {
      console.error('❌ appicon.png not found in public directory');
      return;
    }

    // Brand colors
    const foregroundHex = '#8d9d4f'; // brand accent
    const backgroundHex = '#ffffff'; // neutral background (works for maskable too)

    // Prepare a recolored logo pipeline: tint foreground, compose onto bg
    async function renderIcon(size) {
      // Resize source to fit
      const resized = await sharp(logoPath)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toColourspace('rgba')
        .toBuffer();

      // Create a solid background
      const background = await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: backgroundHex,
        },
      })
        .png()
        .toBuffer();

      // Tint the resized logo by multiplying with the foreground color
      const tinted = await sharp(resized)
        .tint(foregroundHex)
        .png()
        .toBuffer();

      // Compose tinted logo centered over background
      const composed = await sharp(background)
        .composite([{ input: tinted, gravity: 'center' }])
        .png()
        .toBuffer();

      return composed;
    }

    // Generate different favicon sizes (PNG)
    const faviconSizes = [
      { name: 'favicon-16x16.png', size: 16 },
      { name: 'favicon-32x32.png', size: 32 },
      { name: 'apple-icon.png', size: 180 },
      { name: 'android-chrome-192x192.png', size: 192 },
      { name: 'android-chrome-512x512.png', size: 512 },
      // maskable variants for PWA
      { name: 'maskable-icon-192x192.png', size: 192 },
      { name: 'maskable-icon-512x512.png', size: 512 }
    ];

    for (const favicon of faviconSizes) {
      console.log(`📱 Generating ${favicon.name} (${favicon.size}x${favicon.size})...`);
      const buffer = await renderIcon(favicon.size);
      await sharp(buffer).png().toFile(path.join(publicDir, favicon.name));
    }

    // Generate favicon.ico (16x16 and 32x32 combined)
    console.log('🔧 Generating favicon.ico...');
    const icon16 = await renderIcon(16);
    const icon32 = await renderIcon(32);

    try {
      toIco = toIco || require('to-ico');
      const icoBuffer = await toIco([icon16, icon32]);
      fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
    } catch (icoErr) {
      console.warn('⚠️ Could not generate .ico (install dev dep: to-ico). Preserving existing favicon.ico. Error:', icoErr.message);
    }

    console.log('✅ Favicon generation completed!');
    console.log('📁 Generated files:');
    faviconSizes.forEach(favicon => {
      console.log(`   - ${favicon.name}`);
    });
    console.log('💡 Note: favicon.ico generated when to-ico is available');
    
  } catch (error) {
    console.error('❌ Error generating favicons:', error);
  }
}

// Run the script
generateFavicon();
