# 🎨 SVG to PNG Conversion Guide

## Quick Conversion Steps

### 1. Convert logo.svg to logo.png (128x128)
1. Go to: https://convertio.co/svg-png/
2. Upload `resources/logo.svg`
3. Set output size to 128x128 pixels
4. Download as `resources/logo.png`

### 2. Convert logo.svg to icon.png (128x128)
1. Go to: https://convertio.co/svg-png/
2. Upload `resources/logo.svg`
3. Set output size to 128x128 pixels
4. Download as `resources/icon.png`

### 3. Convert banner.svg to banner.png (1280x320)
1. Go to: https://convertio.co/svg-png/
2. Upload `resources/banner.svg`
3. Set output size to 1280x320 pixels
4. Download as `resources/banner.png`

## Alternative Tools

### Online Converters:
- https://cloudconvert.com/svg-to-png
- https://www.svgviewer.dev/
- https://convertio.co/svg-png/

### Desktop Software:
- **Inkscape** (Free): File → Export PNG Image
- **GIMP** (Free): File → Export As
- **Photoshop**: File → Export → Export As

### Browser Method:
1. Open SVG file in browser
2. Right-click → Save as PNG
3. Or use browser developer tools to capture

## After Conversion

Once you have all PNG files:
```bash
npm run compile
vsce publish patch
```

## File Requirements

- `resources/logo.png` - 128x128 pixels
- `resources/icon.png` - 128x128 pixels  
- `resources/banner.png` - 1280x320 pixels

All files should be in PNG format with transparent backgrounds.
