const fs = require("fs");
const path = require("path");

const ICONS_DIR = path.join(__dirname, "public/icons");

function makeSVG(size, maskable = false) {
  const pad = maskable ? size * 0.15 : 0;
  const innerSize = size - pad * 2;
  const cx = size / 2;
  const cy = size / 2;
  const r = innerSize / 2;
  const cornerR = maskable ? 0 : Math.round(size * 0.22);

  // Heart emoji font size — big and centered
  const heartSize = Math.round(r * 1.1);
  // Shift heart up slightly so it's visually centered
  const heartY = cy + heartSize * 0.05;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a1a0a"/>
      <stop offset="100%" stop-color="#0f2b0f"/>
    </linearGradient>
    <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#22c55e" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#84cc16" stop-opacity="0.08"/>
    </linearGradient>
    <linearGradient id="heart-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="50%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#65a30d"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${cornerR}" fill="url(#bg)"/>
  <!-- Subtle glow circle -->
  <circle cx="${cx}" cy="${cy}" r="${r * 0.7}" fill="url(#glow)"/>
  <!-- Green heart shape using path (not emoji for reliable rendering) -->
  <g transform="translate(${cx}, ${heartY})">
    <g transform="scale(${heartSize / 120})">
      <path d="M0 30 C0 30 -50 -15 -25 -30 C-10 -40 0 -25 0 -15 C0 -25 10 -40 25 -30 C50 -15 0 30 0 30Z"
            fill="url(#heart-bg)" 
            filter="drop-shadow(0 ${Math.round(size*0.01)}px ${Math.round(size*0.04)}px rgba(34,197,94,0.5))"/>
    </g>
  </g>
</svg>`;
}

// Generate all icons
const configs = [
  { size: 192, maskable: false, name: "icon-192" },
  { size: 512, maskable: false, name: "icon-512" },
  { size: 192, maskable: true, name: "icon-maskable-192" },
  { size: 512, maskable: true, name: "icon-maskable-512" },
  { size: 180, maskable: false, name: "apple-touch-icon" },
];

for (const cfg of configs) {
  const svg = makeSVG(cfg.size, cfg.maskable);
  const outDir = cfg.name === "apple-touch-icon" ? path.join(__dirname, "public") : ICONS_DIR;
  fs.writeFileSync(path.join(outDir, `${cfg.name}.svg`), svg);
  console.log(`✓ ${cfg.name}.svg (${cfg.size}x${cfg.size})`);
}

console.log("\nDone! Now convert to PNG with sharp-cli.");
