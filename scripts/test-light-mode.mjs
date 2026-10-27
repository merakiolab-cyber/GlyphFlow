import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.resolve(rootDir, 'docs', 'screenshots');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const targets = [
  { name: 'charmap_light.png', url: 'http://127.0.0.1:3000/?view=catalog&theme=light' },
  { name: 'icons_light.png', url: 'http://127.0.0.1:3000/?view=icons&theme=light' },
  { name: 'typography_light.png', url: 'http://127.0.0.1:3000/?view=typography&theme=light' }
];

for (const target of targets) {
  const dest = path.join(outDir, target.name);
  console.log(`Capturing ${target.name} from ${target.url}...`);
  try {
    execFileSync(edgePath, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--window-size=1280,840',
      '--virtual-time-budget=2500',
      `--screenshot=${dest}`,
      target.url
    ], { stdio: 'pipe' });

    if (fs.existsSync(dest)) {
      const stat = fs.statSync(dest);
      console.log(`✓ Saved ${target.name} (${stat.size} bytes)`);
    } else {
      console.error(`Failed to capture ${target.name}`);
    }
  } catch (err) {
    console.error(`Error capturing ${target.name}:`, err.message);
  }
}
