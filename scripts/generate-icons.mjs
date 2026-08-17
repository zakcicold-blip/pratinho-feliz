import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "..", "public", "icons");

const UTENSILS_PATHS = `
  <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/>
  <path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/>
  <path d="m2.1 21.8 6.4-6.3"/>
  <path d="m19 5-7 7"/>
`;

function iconSvg({ size, rounded, background = "#f97316" }) {
  const rx = rounded ? size * 0.22 : 0;
  const scale = size / 24 / 1.75; // glyph occupies ~57% of canvas
  const strokeWidth = 2;
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${rx}" fill="${background}"/>
  <g transform="translate(${size / 2} ${size / 2}) scale(${scale}) translate(-12 -12)">
    <g fill="none" stroke="#ffffff" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
      ${UTENSILS_PATHS}
    </g>
  </g>
</svg>`.trim();
}

async function main() {
  const targets = [
    { name: "icon-512.png", size: 512, rounded: true },
    { name: "icon-192.png", size: 192, rounded: true },
    { name: "icon-maskable-512.png", size: 512, rounded: false },
    { name: "apple-touch-icon.png", size: 180, rounded: false },
    { name: "favicon-32.png", size: 32, rounded: false },
    { name: "favicon-16.png", size: 16, rounded: false },
  ];

  for (const t of targets) {
    const svg = iconSvg({ size: t.size, rounded: t.rounded });
    await sharp(Buffer.from(svg)).png().toFile(path.join(OUT_DIR, t.name));
    console.log("wrote", t.name);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
