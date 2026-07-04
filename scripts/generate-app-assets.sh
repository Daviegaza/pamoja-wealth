#!/bin/bash
# generate-app-assets.sh — Generate app icons and splash screens for iOS + Android
# Requires: ImageMagick (convert) or sips (macOS built-in)
# Usage: bash scripts/generate-app-assets.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ASSETS_DIR="$PROJECT_DIR/public/app-assets"

mkdir -p "$ASSETS_DIR"

# Source SVG or high-res PNG
SOURCE="$PROJECT_DIR/public/favicon.svg"

echo "🎨 Pamoja Wealth — App Asset Generator"
echo "========================================"
echo ""

# ── App Icon (iOS) ───────────────────────────────────────────────────────
echo "📱 Generating iOS app icons..."
IOS_SIZES=(
  "20x20"
  "29x29"
  "40x40"
  "58x58"
  "60x60"
  "76x76"
  "80x80"
  "87x87"
  "120x120"
  "152x152"
  "167x167"
  "180x180"
  "1024x1024"
)

for size in "${IOS_SIZES[@]}"; do
  w="${size%x*}"
  echo "  iOS $size → AppIcon.appiconset/icon_${w}.png"
  # Using any SVG-to-PNG tool available
  if command -v rsvg-convert &>/dev/null; then
    rsvg-convert -w "$w" -h "$w" "$SOURCE" -o "$ASSETS_DIR/ios_icon_${w}.png"
  elif command -v convert &>/dev/null; then
    convert -background none -resize "${size}" "$SOURCE" "$ASSETS_DIR/ios_icon_${w}.png"
  elif command -v sips &>/dev/null; then
    # macOS built-in — need a PNG source first
    echo "  (use rsvg-convert or ImageMagick for SVG → PNG conversion)"
  fi
done

# Copy the 1024x1024 as the App Store icon
cp "$ASSETS_DIR/ios_icon_1024.png" "$ASSETS_DIR/app-store-icon.png" 2>/dev/null || true

# ── App Icon (Android adaptive) ──────────────────────────────────────────
echo ""
echo "🤖 Generating Android adaptive icons..."
ANDROID_DIRS=(
  "mipmap-mdpi/48x48"
  "mipmap-hdpi/72x72"
  "mipmap-xhdpi/96x96"
  "mipmap-xxhdpi/144x144"
  "mipmap-xxxhdpi/192x192"
)

for dir_size in "${ANDROID_DIRS[@]}"; do
  dir="${dir_size%/*}"
  size="${dir_size#*/}"
  w="${size%x*}"
  mkdir -p "$ASSETS_DIR/android/$dir"
  echo "  Android $dir ($size) → $dir/ic_launcher.png"
  if command -v rsvg-convert &>/dev/null; then
    rsvg-convert -w "$w" -h "$w" "$SOURCE" -o "$ASSETS_DIR/android/$dir/ic_launcher.png"
  elif command -v convert &>/dev/null; then
    convert -background none -resize "${size}" "$SOURCE" "$ASSETS_DIR/android/$dir/ic_launcher.png"
  fi
done

# ── Splash Screen ────────────────────────────────────────────────────────
echo ""
echo "🎭 Generating splash screens..."

# iOS splash screen sizes (as of iOS 17+)
SPLASH_SIZES=(
  "Default@2x~iphone:640x960"
  "Default@2x~universal~anyany:2732x2732"
  "Default@3x~universal~anyany:2732x2732"
)

# Simple approach: generate a single centered logo on brand background
SPLASH_BG="#059669"
SPLASH_LOGO_SIZE=200

# Generate splash using ImageMagick (if available)
if command -v convert &>/dev/null; then
  # Create a solid green background with centered logo
  for spec in "${SPLASH_SIZES[@]}"; do
    name="${spec%%:*}"
    dims="${spec#*:}"
    w="${dims%x*}"
    h="${dims#*x}"
    echo "  Splash $name (${w}x${h})"
    convert -size "${w}x${h}" "xc:$SPLASH_BG" \
      "$SOURCE" -resize "${SPLASH_LOGO_SIZE}x${SPLASH_LOGO_SIZE}" -gravity center -composite \
      "$ASSETS_DIR/splash_${name}.png"
  done
fi

echo ""
echo "✅ App assets generated in $ASSETS_DIR"
echo ""
echo "Next steps:"
echo "  1. Copy iOS icons to ios/App/App/Assets.xcassets/AppIcon.appiconset/"
echo "  2. Copy Android icons to android/app/src/main/res/"
echo "  3. Copy splash to ios/App/App/Assets.xcassets/Splash.imageset/"
echo "  4. Upload app-store-icon.png (1024x1024) to App Store Connect"
