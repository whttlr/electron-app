# PWA Icon Generation Guide

This directory should contain the following PWA icons for optimal cross-platform support:

## Required Icons

### Standard App Icons
- `icon-72x72.png` - Small app icon
- `icon-96x96.png` - Medium app icon  
- `icon-128x128.png` - Large app icon
- `icon-144x144.png` - Medium-high density
- `icon-152x152.png` - iOS/iPad icon
- `icon-192x192.png` - Standard PWA icon
- `icon-384x384.png` - Large PWA icon
- `icon-512x512.png` - Extra large PWA icon

### Badge and Notification Icons
- `badge-72x72.png` - Notification badge icon
- `badge-96x96.png` - Larger notification badge

### Shortcut Icons
- `shortcut-controls.png` - Controls shortcut (96x96)
- `shortcut-jobs.png` - Jobs shortcut (96x96)
- `shortcut-emergency.png` - Emergency shortcut (96x96)

### File Association Icons
- `gcode-file.png` - G-code file icon (256x256)

### Maskable Icons (for Android)
All icons should also have maskable versions with proper safe zones.

## Icon Design Guidelines

### Base Design
- Industrial/technical aesthetic
- High contrast for visibility in bright shop lighting
- Clear at small sizes
- Recognizable CNC/machining theme

### Color Palette
- Primary: #3b82f6 (blue)
- Secondary: #1f2937 (dark gray)
- Accent: #10b981 (green)
- Warning: #f59e0b (amber)
- Error: #ef4444 (red)

### Safe Zones for Maskable Icons
- 40px safe zone on all sides for 192x192 icons
- 80px safe zone on all sides for 512x512 icons

## Generation Commands

Using ImageMagick or similar tools:

```bash
# Convert base SVG to different sizes
magick cnc-icon.svg -resize 72x72 icon-72x72.png
magick cnc-icon.svg -resize 96x96 icon-96x96.png
magick cnc-icon.svg -resize 128x128 icon-128x128.png
magick cnc-icon.svg -resize 144x144 icon-144x144.png
magick cnc-icon.svg -resize 152x152 icon-152x152.png
magick cnc-icon.svg -resize 192x192 icon-192x192.png
magick cnc-icon.svg -resize 384x384 icon-384x384.png
magick cnc-icon.svg -resize 512x512 icon-512x512.png
```

## Testing Icons

Test icons using:
- Chrome DevTools Application tab
- Lighthouse PWA audit
- Various Android launchers
- iOS Safari Add to Home Screen
- Windows PWA installation

## Placeholder Implementation

For development purposes, you can use online icon generators or create simple colored squares with text labels until proper icons are designed.