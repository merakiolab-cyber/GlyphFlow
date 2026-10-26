import JSZip from 'jszip';
import { IconItem, IconStyle } from '../types';
import { sanitizeSvgInner, sanitizeViewBox } from './svgSanitize';

export interface IconExportConfig {
  style: IconStyle;
  strokeWidth: number;
  color: string;
  secondaryColor?: string;
  size: number;
}

/**
 * Generates clean, pristine SVG markup matching the chosen style
 */
export function generateStyledSvgMarkup(
  icon: IconItem,
  config: IconExportConfig
): string {
  const { style, strokeWidth, color, secondaryColor = '#71717A', size } = config;
  const viewBox = sanitizeViewBox(icon.viewBox);

  let fill = 'none';
  let stroke = color;
  let strokeW = strokeWidth;
  let extraElements = '';

  if (style === 'solid') {
    fill = color;
    stroke = 'none';
    strokeW = 0;
  } else if (style === 'duotone') {
    fill = 'none';
    stroke = color;
    // Duotone secondary path background with 20% opacity fill
    extraElements = `<path d="${icon.svgPath}" fill="${secondaryColor}" fill-opacity="0.2" stroke="none" />`;
  } else if (style === 'colored') {
    fill = 'none';
    stroke = color;
    extraElements = `<circle cx="12" cy="12" r="10" fill="${color}" fill-opacity="0.12" stroke="none" />`;
  } else if (style === 'modern3d') {
    // 3D elevated tile background
    extraElements = `
      <defs>
        <filter id="tileShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.25"/>
        </filter>
      </defs>
      <rect width="24" height="24" rx="6" fill="#18181B" filter="url(#tileShadow)"/>
      <rect x="0.5" y="0.5" width="23" height="23" rx="5.5" fill="none" stroke="rgba(255,255,255,0.1)"/>
    `;
  }

  // Handle custom SVG content if stored as complete markup
  if (icon.svgPath.startsWith('<')) {
    const safeInner = sanitizeSvgInner(icon.svgPath);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round">${extraElements}${safeInner}</svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round">${extraElements}<path d="${icon.svgPath}" /></svg>`;
}

/**
 * Formats a clean SVG specifically for Figma direct clipboard paste.
 * When pasted into Figma with Ctrl+V, Figma converts it into vector paths and groups.
 */
export function formatSvgForFigma(icon: IconItem, config: IconExportConfig): string {
  const svg = generateStyledSvgMarkup(icon, config);
  // Add figma layer name and clean attributes
  return svg.replace(
    '<svg ',
    `<svg id="${encodeURIComponent(icon.name)}" data-name="${icon.name}" `
  );
}

/**
 * Figma Batch Bridge:
 * Combines multiple icons into a single organized Figma Component Board SVG.
 * When pasted into Figma, it automatically lays out all selected icons on a clean grid with labels!
 */
export function generateFigmaBatchBoard(
  icons: IconItem[],
  config: IconExportConfig,
  columns = 5
): string {
  const iconSize = config.size || 24;
  const cellSize = 64;
  const gap = 24;
  const rows = Math.ceil(icons.length / columns);
  const totalWidth = columns * (cellSize + gap) + gap;
  const totalHeight = rows * (cellSize + gap) + gap + 40;

  let content = `
    <rect width="${totalWidth}" height="${totalHeight}" rx="12" fill="#18181B" />
    <text x="${gap}" y="28" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="600" fill="#FFFFFF">GlyphFlow Icon Bundle (${icons.length} ikon)</text>
  `;

  icons.forEach((icon, idx) => {
    const col = idx % columns;
    const row = Math.floor(idx / columns);
    const x = gap + col * (cellSize + gap);
    const y = 48 + gap + row * (cellSize + gap);

    const innerSvg = generateStyledSvgMarkup(icon, { ...config, size: 28 });
    // Strip outer svg tags to embed cleanly
    const paths = innerSvg.replace(/<svg[^>]*>|<\/svg>/g, '');

    content += `
      <g transform="translate(${x}, ${y})" id="icon-${icon.id}">
        <rect width="${cellSize}" height="${cellSize}" rx="8" fill="#202024" stroke="rgba(255,255,255,0.06)" />
        <g transform="translate(${cellSize / 2 - 14}, ${cellSize / 2 - 18})">
          ${paths}
        </g>
        <text x="${cellSize / 2}" y="${cellSize - 8}" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle" fill="#A1A1AA">${escapeXml(icon.name.slice(0, 9))}</text>
      </g>
    `;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">${content}</svg>`;
}

/**
 * Generates a clean React JSX component code snippet with TypeScript props
 */
export function generateReactJsxCode(icon: IconItem, config: IconExportConfig): string {
  const componentName = `${icon.id.replace(/(^\w|-\w)/g, (m) => m.replace('-', '').toUpperCase())}Icon`;
  const viewBox = sanitizeViewBox(icon.viewBox);

  return `import React from 'react';

export interface ${componentName}Props extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  size = ${config.size},
  color = '${config.color}',
  strokeWidth = ${config.strokeWidth},
  className = '',
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="${viewBox}"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="${icon.svgPath}" />
  </svg>
);
export default ${componentName};`;
}

/**
 * Generates an inline Tailwind CSS SVG string
 */
export function generateTailwindSvgSnippet(icon: IconItem): string {
  const viewBox = sanitizeViewBox(icon.viewBox);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="w-5 h-5 text-current"><path d="${icon.svgPath}" /></svg>`;
}

/**
 * Generates a Data URI string
 */
export function generateDataUri(icon: IconItem, config: IconExportConfig): string {
  const svg = generateStyledSvgMarkup(icon, config);
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml,${encoded}`;
}

/**
 * Packs multiple icons into a downloadable ZIP archive
 */
export async function downloadIconsZip(
  icons: IconItem[],
  config: IconExportConfig,
  zipName = 'glyphflow_icons.zip'
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('icons');

  icons.forEach((icon) => {
    const svgCode = generateStyledSvgMarkup(icon, config);
    const filename = `${icon.id}_${config.style}.svg`;
    folder?.file(filename, svgCode);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = zipName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Generates an official Figma Desktop Plugin bundle (.zip) with manifest.json, code.js, and ui.html.
 * Allows designers to import the plugin directly into Figma Desktop:
 * Menu -> Plugins -> Development -> Import plugin from manifest...
 */
export async function generateFigmaPluginBundle(): Promise<void> {
  const zip = new JSZip();

  const manifest = JSON.stringify(
    {
      name: "GlyphFlow Bridge",
      id: "glyphflow-figma-bridge",
      api: "1.0.0",
      main: "code.js",
      ui: "ui.html",
      editorType: ["figma", "figjam"],
      networkAccess: {
        allowedDomains: ["none"],
        reasoning: "Local standalone vector insertion",
      },
    },
    null,
    2
  );

  const codeJs = `// GlyphFlow Figma Bridge Plugin (Desktop API)
figma.showUI(__html__, { width: 360, height: 480, title: 'GlyphFlow Bridge' });

figma.ui.onmessage = (msg) => {
  if (msg.type === 'insert-svg') {
    try {
      const node = figma.createNodeFromSvg(msg.svg);
      node.name = msg.name || 'GlyphFlow Icon';
      
      // Center in current viewport
      const center = figma.viewport.center;
      node.x = center.x - node.width / 2;
      node.y = center.y - node.height / 2;
      
      figma.currentPage.appendChild(node);
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);
      
      figma.notify('✓ Vloženo z GlyphFlow: ' + node.name);
    } catch (err) {
      figma.notify('Chyba při vkládání: ' + err.message, { error: true });
    }
  }
};
`;

  const uiHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Inter, system-ui, sans-serif;
      background: #18181B;
      color: #F4F4F5;
      margin: 0;
      padding: 16px;
      font-size: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    h2 { font-size: 14px; margin: 0 0 4px 0; color: #FFF; }
    p { margin: 0; color: #A1A1AA; line-height: 1.4; }
    textarea {
      width: 100%;
      height: 140px;
      background: #27272A;
      border: 1px solid #3F3F46;
      border-radius: 6px;
      color: #E4E4E7;
      padding: 8px;
      font-family: monospace;
      font-size: 11px;
      box-sizing: border-box;
      resize: none;
    }
    button {
      background: #00F2FE;
      color: #09090B;
      border: none;
      border-radius: 6px;
      padding: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    button:hover { background: #38BDF8; }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      background: rgba(0, 242, 254, 0.15);
      color: #00F2FE;
      border-radius: 4px;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div>
    <h2>GlyphFlow Figma Bridge <span class="badge">v1.3</span></h2>
    <p>Vložte SVG kód zkopírovaný v aplikaci GlyphFlow a klikněte na Vložit do plátna.</p>
  </div>
  <textarea id="svgInput" placeholder="Vložte SVG kód z GlyphFlow..."></textarea>
  <button id="insertBtn">Vložit do plátna Figmy</button>
  <script>
    document.getElementById('insertBtn').onclick = () => {
      const svg = document.getElementById('svgInput').value.trim();
      if (!svg) {
        alert('Nejprve vložte SVG kód.');
        return;
      }
      parent.postMessage({ pluginMessage: { type: 'insert-svg', svg: svg, name: 'GlyphFlow Icon' } }, '*');
      document.getElementById('svgInput').value = '';
    };
  </script>
</body>
</html>
`;

  const readme = `# GlyphFlow Figma Bridge Plugin

## Jak nainstalovat do Figmy:
1. Rozbalte tento ZIP soubor do libovolné složky.
2. Otevřete aplikaci **Figma Desktop**.
3. V horním menu zvolte: **Plugins** -> **Development** -> **Import plugin from manifest...**
4. Vyberte soubor \`manifest.json\` z této složky.
5. Plugin se ihned objeví ve vašich Pluginech jako **GlyphFlow Bridge**!

## Použití:
- V GlyphFlow klikněte na ikonu "Kopírovat pro Figmu".
- Ve Figmě buď stiskněte **Ctrl+V** přímo na plátno, nebo spusťte plugin **GlyphFlow Bridge**.
`;

  zip.file('manifest.json', manifest);
  zip.file('code.js', codeJs);
  zip.file('ui.html', uiHtml);
  zip.file('README.md', readme);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'glyphflow-figma-plugin.zip';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Generates Tokens Studio / Figma Tokens compatible JSON export
 */
export function generateFigmaTokensJson(icons: IconItem[], config: IconExportConfig): string {
  const tokenData: Record<string, unknown> = {
    glyphflow: {
      icons: {},
      meta: {
        total: icons.length,
        style: config.style,
        strokeWidth: config.strokeWidth,
        color: config.color,
      },
    },
  };

  const iconsRecord = (tokenData.glyphflow as { icons: Record<string, unknown> }).icons;

  icons.forEach((icon) => {
    iconsRecord[icon.id] = {
      value: generateStyledSvgMarkup(icon, config),
      type: 'asset',
      description: `${icon.name} (${icon.czechName})`,
    };
  });

  return JSON.stringify(tokenData, null, 2);
}

/**
 * Generates a Figma Code Connect snippet
 */
export function generateFigmaCodeConnect(icon: IconItem): string {
  const componentName = `${icon.id.replace(/(^\w|-\w)/g, (m) => m.replace('-', '').toUpperCase())}Icon`;
  return `import figma from '@figma/code-connect';
import { ${componentName} } from './icons';

/**
 * Figma Code Connect snippet for ${icon.name}
 */
figma.connect(${componentName}, 'https://www.figma.com/design/.../?node-id=0%3A1', {
  props: {
    size: figma.enum('Size', {
      Small: 16,
      Medium: 24,
      Large: 32,
    }),
    color: figma.string('Color'),
  },
  example: (props) => (
    <${componentName} size={props.size} color={props.color} />
  ),
});
`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
