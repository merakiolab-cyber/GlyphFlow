import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.resolve(rootDir, 'public');
const fontsDir = path.resolve(publicDir, 'fonts');

// 1. Generate apple-touch-icon.png
async function generateAppleTouchIcon() {
  console.log('Generating apple-touch-icon.png (180x180)...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const outPng = path.join(publicDir, 'apple-touch-icon.png');
  const svgPath = path.join(publicDir, 'icon.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf8');

  // Create minimal self-contained HTML
  const tmpHtml = path.join(publicDir, '_tmp_render.html');
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; }
  html, body { width: 180px; height: 180px; overflow: hidden; background: #090D14; }
  svg { width: 180px; height: 180px; display: block; }
</style>
</head>
<body>
${svgContent}
</body>
</html>`;

  fs.writeFileSync(tmpHtml, html, 'utf8');

  try {
    execFileSync(edgePath, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--window-size=180,180',
      `--screenshot=${outPng}`,
      `file:///${tmpHtml.replace(/\\/g, '/')}`
    ], { stdio: 'pipe' });

    if (fs.existsSync(outPng)) {
      const stats = fs.statSync(outPng);
      console.log(`✓ apple-touch-icon.png generated (${stats.size} bytes)`);
    } else {
      throw new Error('Screenshot file was not created');
    }
  } finally {
    if (fs.existsSync(tmpHtml)) {
      fs.unlinkSync(tmpHtml);
    }
  }
}

// 2. Download and self-host fonts
async function setupFonts() {
  console.log('Downloading Google Fonts for offline use...');
  if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
  }

  const cssUrl = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  const res = await fetch(cssUrl, { headers: { 'User-Agent': userAgent } });
  if (!res.ok) throw new Error(`Failed to fetch font CSS: ${res.statusText}`);
  let cssText = await res.text();

  // Find all font URLs
  const urlRegex = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g;
  let match;
  let counter = 0;
  const downloadedMap = new Map();

  while ((match = urlRegex.exec(cssText)) !== null) {
    const remoteUrl = match[1];
    if (downloadedMap.has(remoteUrl)) continue;

    // Determine font family from context
    const lastAtRule = cssText.lastIndexOf('@font-face', match.index);
    const snippet = cssText.substring(lastAtRule, match.index + 200);
    const familyMatch = snippet.match(/font-family:\s*['"]?([^'";]+)['"]?/);
    const weightMatch = snippet.match(/font-weight:\s*(\d+)/);
    
    const familySlug = familyMatch ? familyMatch[1].toLowerCase().replace(/\s+/g, '-') : 'font';
    const weight = weightMatch ? weightMatch[1] : '400';
    const filename = `${familySlug}-${weight}-${++counter}.woff2`;
    
    downloadedMap.set(remoteUrl, filename);
  }

  console.log(`Downloading ${downloadedMap.size} WOFF2 files...`);
  for (const [remoteUrl, filename] of downloadedMap.entries()) {
    const fontRes = await fetch(remoteUrl);
    if (!fontRes.ok) throw new Error(`Failed to download ${remoteUrl}`);
    const buffer = Buffer.from(await fontRes.arrayBuffer());
    const destPath = path.join(fontsDir, filename);
    fs.writeFileSync(destPath, buffer);
  }

  // Replace remote URLs in CSS with local path /fonts/<filename>
  let localCss = cssText;
  for (const [remoteUrl, filename] of downloadedMap.entries()) {
    localCss = localCss.split(remoteUrl).join(`/fonts/${filename}`);
  }

  const cssDest = path.join(fontsDir, 'fonts.css');
  fs.writeFileSync(cssDest, localCss, 'utf8');
  console.log(`✓ fonts.css generated with ${downloadedMap.size} offline fonts`);
}

async function run() {
  try {
    await generateAppleTouchIcon();
    await setupFonts();
    console.log('✓ All offline assets created successfully!');
  } catch (err) {
    console.error('Error during offline setup:', err);
    process.exit(1);
  }
}

run();
