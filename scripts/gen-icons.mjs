/**
 * Generates all PWA / favicon icons from an inline SVG.
 * Run: node scripts/gen-icons.mjs
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";

const OUT = path.resolve("public/icons");
const ROOT = path.resolve("public");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// ─── The icon SVG ────────────────────────────────────────────────────────────
// Rose gradient background + white heart, rounded corners via clipPath
function makeSvg(size, maskable = false) {
  // For maskable icons the content is contained in the central 80% (safe zone)
  const r = maskable ? size * 0.28 : size * 0.26; // corner radius
  const heartScale = maskable ? 0.44 : 0.5;
  const cx = size / 2;
  const cy = size / 2;
  const hs = size * heartScale; // heart bounding size

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e11d48"/>
      <stop offset="100%" stop-color="#f472b6"/>
    </linearGradient>
    <clipPath id="rounded">
      <rect width="${size}" height="${size}" rx="${r}" ry="${r}"/>
    </clipPath>
    <!-- subtle inner highlight -->
    <linearGradient id="shine" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.18)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" fill="url(#bg)" clip-path="url(#rounded)"/>

  <!-- Shine overlay -->
  <rect width="${size}" height="${size / 2}" fill="url(#shine)" clip-path="url(#rounded)" opacity="0.6"/>

  <!-- Heart: centered, scaled to hs -->
  <g transform="translate(${cx - hs / 2}, ${cy - hs / 2}) scale(${hs / 100})">
    <!--
      viewBox centred on 0 0 100 80
      The path is defined in a -50..50 x, -45..35 y coordinate system
      translated to 0..100, 0..80 space
    -->
    <g transform="translate(50, 45)">
      <path
        d="M0 30 C0 30 -50 -15 -25 -30 C-10 -40 0 -25 0 -15 C0 -25 10 -40 25 -30 C50 -15 0 30 0 30Z"
        fill="white"
        fill-opacity="0.92"
      />
    </g>
  </g>
</svg>`;
}

// ─── Generate all sizes ───────────────────────────────────────────────────────
const ICONS = [
  { file: "icon-192.png", size: 192, maskable: false },
  { file: "icon-512.png", size: 512, maskable: false },
  { file: "icon-maskable-192.png", size: 192, maskable: true },
  { file: "icon-maskable-512.png", size: 512, maskable: true },
];

// Favicon sizes (also written to public/ root)
const FAVICONS = [
  { file: "favicon-16.png", size: 16 },
  { file: "favicon-32.png", size: 32 },
  { file: "favicon-96.png", size: 96 },
  { file: "apple-touch-icon.png", size: 180 },
];

async function generatePng(svgStr, outPath) {
  await sharp(Buffer.from(svgStr)).png().toFile(outPath);
  console.log("✓", path.relative(process.cwd(), outPath));
}

for (const { file, size, maskable } of ICONS) {
  await generatePng(makeSvg(size, maskable), path.join(OUT, file));
}

for (const { file, size } of FAVICONS) {
  await generatePng(makeSvg(size, false), path.join(ROOT, file));
}

// Generate favicon.ico (16+32 embedded) — just copy the 32px as a simple ico substitute
// (modern browsers use favicon-32.png; .ico is legacy)
fs.copyFileSync(
  path.join(ROOT, "favicon-32.png"),
  path.join(ROOT, "favicon.ico"),
);
console.log("✓ favicon.ico (32px copy)");

console.log("\n🎉 All icons generated.");
