import { ExportOptions } from '../types';

/**
 * Generates clean, scalable SVG markup for a given glyph or text string
 */
export function generateSvgMarkup(text: string, options: ExportOptions): string {
  const { fontSize, fontFamily, textColor, bgColor, isTransparent, padding, width, height, fontWeight } = options;

  const bgRect = isTransparent
    ? ''
    : `<rect width="100%" height="100%" rx="16" fill="${bgColor}" />`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&amp;family=Plus+Jakarta+Sans:wght@400;700&amp;display=swap');
      .glyph-text {
        font-family: ${fontFamily};
        font-size: ${fontSize}px;
        font-weight: ${fontWeight};
        fill: ${textColor};
        dominant-baseline: central;
        text-anchor: middle;
      }
    </style>
  </defs>
  ${bgRect}
  <text x="50%" y="50%" class="glyph-text">${escapeXml(text)}</text>
</svg>`.trim();
}

/**
 * Escapes XML/SVG special characters in text
 */
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

/**
 * Downloads generated SVG as a file
 */
export function downloadSvg(text: string, options: ExportOptions, filename: string): void {
  const svg = generateSvgMarkup(text, options);
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Renders glyph to offscreen canvas and triggers PNG download
 */
export async function downloadPng(text: string, options: ExportOptions, filename: string): Promise<void> {
  const canvas = document.createElement('canvas');
  const size = options.resolution || 512;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Background
  if (!options.isTransparent) {
    ctx.fillStyle = options.bgColor;
    ctx.fillRect(0, 0, size, size);
  } else {
    ctx.clearRect(0, 0, size, size);
  }

  // Draw Text
  const scale = size / options.width;
  const computedFontSize = options.fontSize * scale;
  ctx.fillStyle = options.textColor;
  ctx.font = `${options.fontWeight} ${computedFontSize}px ${options.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, size / 2, size / 2);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename.endsWith('.png') ? filename : `${filename}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      resolve();
    }, 'image/png');
  });
}

/**
 * Copy SVG code directly to clipboard
 */
export async function copySvgToClipboard(text: string, options: ExportOptions): Promise<boolean> {
  try {
    const svg = generateSvgMarkup(text, options);
    await navigator.clipboard.writeText(svg);
    return true;
  } catch (err) {
    console.error('Failed to copy SVG to clipboard', err);
    return false;
  }
}
