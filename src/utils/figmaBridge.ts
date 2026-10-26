import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { icons as LucideIcons } from 'lucide-react';
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

function circleToPath(cx: number, cy: number, r: number): string {
  return `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
}

/**
 * Accurately determines if an SVG path forms a closed geometric shape.
 * Evaluates explicit Z/z and endpoint-to-startpoint proximity, taking into account
 * implicit lineto sequences in SVG path data.
 */
export function isPathClosedGeometry(d: string): boolean {
  if (/[zZ]/.test(d)) return true;

  const commands = d.match(/[a-df-z][^a-df-z]*/gi);
  if (!commands || commands.length === 0) return false;

  let startX = 0, startY = 0;
  let curX = 0, curY = 0;

  for (let i = 0; i < commands.length; i++) {
    const cmdStr = commands[i].trim();
    const type = cmdStr[0];
    const args = cmdStr.slice(1).trim().match(/[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g);
    const nums = args ? args.map(Number) : [];

    if (type === 'M') {
      startX = nums[0];
      startY = nums[1];
      curX = startX;
      curY = startY;
      for (let j = 2; j < nums.length; j += 2) {
        curX = nums[j];
        curY = nums[j + 1];
      }
    } else if (type === 'm') {
      startX = curX + (nums[0] || 0);
      startY = curY + (nums[1] || 0);
      curX = startX;
      curY = startY;
      for (let j = 2; j < nums.length; j += 2) {
        curX += nums[j];
        curY += nums[j + 1];
      }
    } else if (type === 'H') {
      curX = nums[nums.length - 1];
    } else if (type === 'h') {
      for (const n of nums) curX += n;
    } else if (type === 'V') {
      curY = nums[nums.length - 1];
    } else if (type === 'v') {
      for (const n of nums) curY += n;
    } else if (type === 'L' || type === 'T') {
      curX = nums[nums.length - 2];
      curY = nums[nums.length - 1];
    } else if (type === 'l' || type === 't') {
      for (let j = 0; j < nums.length; j += 2) {
        curX += nums[j];
        curY += nums[j + 1];
      }
    } else if (type === 'C') {
      curX = nums[nums.length - 2];
      curY = nums[nums.length - 1];
    } else if (type === 'c') {
      for (let j = 0; j < nums.length; j += 6) {
        curX += nums[j + 4];
        curY += nums[j + 5];
      }
    } else if (type === 'S' || type === 'Q') {
      curX = nums[nums.length - 2];
      curY = nums[nums.length - 1];
    } else if (type === 's' || type === 'q') {
      for (let j = 0; j < nums.length; j += 4) {
        curX += nums[j + 2];
        curY += nums[j + 3];
      }
    } else if (type === 'A') {
      curX = nums[nums.length - 2];
      curY = nums[nums.length - 1];
    } else if (type === 'a') {
      for (let j = 0; j < nums.length; j += 7) {
        curX += nums[j + 5];
        curY += nums[j + 6];
      }
    } else if (type === 'Z' || type === 'z') {
      return true;
    }
  }

  const distSq = (curX - startX) ** 2 + (curY - startY) ** 2;
  return distSq < 1.0;
}

interface BBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

function getPathBBox(d: string): BBox | null {
  const commands = d.match(/[a-df-z][^a-df-z]*/gi);
  if (!commands || commands.length === 0) return null;

  let curX = 0, curY = 0;
  const xs: number[] = [0];
  const ys: number[] = [0];

  for (let i = 0; i < commands.length; i++) {
    const cmdStr = commands[i].trim();
    const type = cmdStr[0];
    const args = cmdStr.slice(1).trim().match(/[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g);
    const nums = args ? args.map(Number) : [];

    if (type === 'M' || type === 'm') {
      const isRel = type === 'm';
      curX = isRel ? curX + (nums[0] || 0) : nums[0];
      curY = isRel ? curY + (nums[1] || 0) : nums[1];
      xs.push(curX);
      ys.push(curY);
      for (let j = 2; j < nums.length; j += 2) {
        curX = isRel ? curX + nums[j] : nums[j];
        curY = isRel ? curY + nums[j + 1] : nums[j + 1];
        xs.push(curX);
        ys.push(curY);
      }
    } else if (type === 'H') {
      curX = nums[nums.length - 1];
      xs.push(curX);
    } else if (type === 'h') {
      for (const n of nums) curX += n;
      xs.push(curX);
    } else if (type === 'V') {
      curY = nums[nums.length - 1];
      ys.push(curY);
    } else if (type === 'v') {
      for (const n of nums) curY += n;
      ys.push(curY);
    } else if (type === 'L' || type === 'T') {
      curX = nums[nums.length - 2];
      curY = nums[nums.length - 1];
      xs.push(curX);
      ys.push(curY);
    } else if (type === 'l' || type === 't') {
      for (let j = 0; j < nums.length; j += 2) {
        curX += nums[j];
        curY += nums[j + 1];
        xs.push(curX);
        ys.push(curY);
      }
    } else if (type === 'C') {
      curX = nums[nums.length - 2];
      curY = nums[nums.length - 1];
      xs.push(curX);
      ys.push(curY);
    } else if (type === 'c') {
      for (let j = 0; j < nums.length; j += 6) {
        curX += nums[j + 4];
        curY += nums[j + 5];
        xs.push(curX);
        ys.push(curY);
      }
    } else if (type === 'S' || type === 'Q') {
      curX = nums[nums.length - 2];
      curY = nums[nums.length - 1];
      xs.push(curX);
      ys.push(curY);
    } else if (type === 's' || type === 'q') {
      for (let j = 0; j < nums.length; j += 4) {
        curX += nums[j + 2];
        curY += nums[j + 3];
        xs.push(curX);
        ys.push(curY);
      }
    } else if (type === 'A') {
      curX = nums[nums.length - 2];
      curY = nums[nums.length - 1];
      xs.push(curX);
      ys.push(curY);
    } else if (type === 'a') {
      for (let j = 0; j < nums.length; j += 7) {
        curX += nums[j + 5];
        curY += nums[j + 6];
        xs.push(curX);
        ys.push(curY);
      }
    }
  }

  xs.shift();
  ys.shift();
  if (xs.length === 0 || ys.length === 0) return null;

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

function getElementBBox(tag: string, attrs: string): BBox | null {
  if (tag === 'circle') {
    const cxMatch = attrs.match(/cx="([^"]+)"/);
    const cyMatch = attrs.match(/cy="([^"]+)"/);
    const rMatch = attrs.match(/r="([^"]+)"/);
    if (cxMatch && cyMatch && rMatch) {
      const cx = parseFloat(cxMatch[1]);
      const cy = parseFloat(cyMatch[1]);
      const r = parseFloat(rMatch[1]);
      return { minX: cx - r, maxX: cx + r, minY: cy - r, maxY: cy + r };
    }
  }

  if (tag === 'rect') {
    const xMatch = attrs.match(/x="([^"]+)"/);
    const yMatch = attrs.match(/y="([^"]+)"/);
    const wMatch = attrs.match(/width="([^"]+)"/);
    const hMatch = attrs.match(/height="([^"]+)"/);
    if (xMatch && yMatch && wMatch && hMatch) {
      const x = parseFloat(xMatch[1]);
      const y = parseFloat(yMatch[1]);
      const w = parseFloat(wMatch[1]);
      const h = parseFloat(hMatch[1]);
      return { minX: x, maxX: x + w, minY: y, maxY: y + h };
    }
  }

  if (tag === 'path') {
    const dMatch = attrs.match(/d="([^"]+)"/);
    if (dMatch) return getPathBBox(dMatch[1]);
  }

  if (tag === 'line') {
    const x1 = parseFloat(attrs.match(/x1="([^"]+)"/)?.[1] || '0');
    const x2 = parseFloat(attrs.match(/x2="([^"]+)"/)?.[1] || '0');
    const y1 = parseFloat(attrs.match(/y1="([^"]+)"/)?.[1] || '0');
    const y2 = parseFloat(attrs.match(/y2="([^"]+)"/)?.[1] || '0');
    return { minX: Math.min(x1, x2), maxX: Math.max(x1, x2), minY: Math.min(y1, y2), maxY: Math.max(y1, y2) };
  }

  if (tag === 'polyline' || tag === 'polygon') {
    const pointsMatch = attrs.match(/points="([^"]+)"/);
    if (pointsMatch) {
      const nums = pointsMatch[1].trim().split(/[\s,]+/).map(Number);
      const xs = nums.filter((_, i) => i % 2 === 0);
      const ys = nums.filter((_, i) => i % 2 === 1);
      if (xs.length > 0 && ys.length > 0) {
        return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
      }
    }
  }

  return null;
}

function isInsideBBox(inner: BBox | null, outer: BBox | null): boolean {
  if (!inner || !outer) return false;
  return (
    inner.minX >= outer.minX - 0.5 &&
    inner.maxX <= outer.maxX + 0.5 &&
    inner.minY >= outer.minY - 0.5 &&
    inner.maxY <= outer.maxY + 0.5
  );
}

function getContrastColor(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  return lum > 140 ? '#18181B' : '#FFFFFF';
}

const rawLucideCache = new Map<string, string>();

function getRawIconSvg(iconId: string): string {
  if (rawLucideCache.has(iconId)) return rawLucideCache.get(iconId)!;
  const comp = (LucideIcons as Record<string, React.ComponentType<{ size?: number }>>)[iconId];
  if (!comp) return '';
  try {
    const raw = renderToStaticMarkup(React.createElement(comp, { size: 24 }));
    rawLucideCache.set(iconId, raw);
    return raw;
  } catch {
    return '';
  }
}

/**
 * Generates clean, pristine SVG markup matching the chosen style:
 * - Solid: preserves cutouts (compound evenodd paths), contrast knockouts & open line strokes
 * - Duotone: vibrant 55% secondary tint fill & crisp primary foreground outlines
 */
export function generateStyledSvgMarkup(
  icon: IconItem,
  config: IconExportConfig
): string {
  const { style, strokeWidth = 2, color = '#FFFFFF', secondaryColor = '#00F2FE', size = 24 } = config;

  let rawSvg = '';
  if (icon.isCustom && icon.svgPath) {
    rawSvg = icon.svgPath.startsWith('<svg')
      ? icon.svgPath
      : `<svg viewBox="${sanitizeViewBox(icon.viewBox)}">${icon.svgPath}</svg>`;
  } else {
    rawSvg = getRawIconSvg(icon.id);
  }

  const fallbackViewBox = sanitizeViewBox(icon.viewBox || '0 0 24 24');

  if (!rawSvg) {
    if (icon.svgPath && !icon.svgPath.startsWith('<')) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${fallbackViewBox}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="${icon.svgPath}" /></svg>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${fallbackViewBox}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"></svg>`;
  }

  const viewBoxMatch = rawSvg.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? sanitizeViewBox(viewBoxMatch[1]) : fallbackViewBox;

  const elementMatches = [...rawSvg.matchAll(/<(path|circle|rect|line|polyline|polygon)([^>]*)\/?>/g)];
  if (elementMatches.length === 0) {
    if (rawSvg.startsWith('<svg')) {
      return rawSvg
        .replace(/width="[^"]*"/, `width="${size}"`)
        .replace(/height="[^"]*"/, `height="${size}"`);
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}">${rawSvg}</svg>`;
  }

  // --- 1. OUTLINE ---
  if (style === 'outline') {
    const inner = elementMatches.map((m) => {
      const tag = m[1];
      const cleanAttrs = m[2]
        .replace(/\s*(fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|class|aria-hidden)="[^"]*"/g, '')
        .trim();
      return `<${tag} ${cleanAttrs} fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`;
    }).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}">${inner}</svg>`;
  }

  // --- 2. SOLID ---
  if (style === 'solid') {
    const contrast = getContrastColor(color);
    const paths = elementMatches.filter((m) => m[1] === 'path');
    const circles = elementMatches.filter((m) => m[1] === 'circle');

    // Case A: Single outer path + inner circle cutout (e.g. Eye, Settings, Camera, Target, Disc)
    if (paths.length === 1 && circles.length === 1) {
      const pAttrs = paths[0][2];
      const cAttrs = circles[0][2];
      const dMatch = pAttrs.match(/d="([^"]+)"/);
      const cxMatch = cAttrs.match(/cx="([^"]+)"/);
      const cyMatch = cAttrs.match(/cy="([^"]+)"/);
      const rMatch = cAttrs.match(/r="([^"]+)"/);

      if (dMatch && cxMatch && cyMatch && rMatch) {
        const outerD = dMatch[1];
        const cx = parseFloat(cxMatch[1]);
        const cy = parseFloat(cyMatch[1]);
        const r = parseFloat(rMatch[1]);

        if (r <= 5 && isPathClosedGeometry(outerD)) {
          const circleD = circleToPath(cx, cy, r);
          const compoundSvg = `<path fill-rule="evenodd" fill="${color}" stroke="${color}" stroke-width="0.6" stroke-linejoin="round" d="${outerD} ${circleD}" />`;
          return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}">${compoundSvg}</svg>`;
        }
      }
    }

    // Case B: Detect primary filled body and knockout any inner details (clock hands, cross, checkmark, smile)
    const bboxes = elementMatches.map((e) => getElementBBox(e[1], e[2]));
    let bodyIdx = -1;
    let maxArea = 0;
    elementMatches.forEach((e, idx) => {
      const tag = e[1];
      const b = bboxes[idx];
      if (b) {
        const isClosed =
          tag === 'circle' ||
          tag === 'rect' ||
          tag === 'polygon' ||
          (tag === 'path' && isPathClosedGeometry(e[2].match(/d="([^"]+)"/)?.[1] || ''));
        if (isClosed) {
          const area = (b.maxX - b.minX) * (b.maxY - b.minY);
          if (area > maxArea && area > 20) {
            maxArea = area;
            bodyIdx = idx;
          }
        }
      }
    });

    const bodyBox = bodyIdx >= 0 ? bboxes[bodyIdx] : null;

    const inner = elementMatches.map((m, idx) => {
      const tag = m[1];
      const cleanAttrs = m[2]
        .replace(/\s*(fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|class|aria-hidden)="[^"]*"/g, '')
        .trim();

      const b = bboxes[idx];
      const isInnerDetail = idx !== bodyIdx && bodyBox && b && isInsideBBox(b, bodyBox);

      // Contrast knockout detail (e.g. clock hands, checkmark, cross, smile)
      if (isInnerDetail) {
        return `<${tag} ${cleanAttrs} fill="${contrast}" stroke="${contrast}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />`;
      }

      // Primary filled body
      if (idx === bodyIdx) {
        return `<${tag} ${cleanAttrs} fill="${color}" stroke="${color}" stroke-width="0.6" stroke-linejoin="round" />`;
      }

      if (tag === 'line' || tag === 'polyline') {
        return `<${tag} ${cleanAttrs} fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />`;
      }

      if (tag === 'circle' || tag === 'rect' || tag === 'polygon') {
        return `<${tag} ${cleanAttrs} fill="${color}" stroke="${color}" stroke-width="0.6" stroke-linejoin="round" />`;
      }

      if (tag === 'path') {
        const dMatch = cleanAttrs.match(/d="([^"]+)"/);
        const d = dMatch ? dMatch[1] : '';
        const isClosed = isPathClosedGeometry(d);

        if (isClosed) {
          return `<path ${cleanAttrs} fill="${color}" stroke="${color}" stroke-width="0.6" stroke-linejoin="round" />`;
        } else {
          return `<path ${cleanAttrs} fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />`;
        }
      }

      return `<${tag} ${cleanAttrs} fill="${color}" stroke="${color}" stroke-width="0.6" />`;
    }).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}">${inner}</svg>`;
  }

  // --- 3. DUOTONE ---
  if (style === 'duotone') {
    const paths = elementMatches.filter((m) => m[1] === 'path');
    const circles = elementMatches.filter((m) => m[1] === 'circle');

    let bgCompound = '';
    let hasCompound = false;

    if (paths.length === 1 && circles.length === 1) {
      const pAttrs = paths[0][2];
      const cAttrs = circles[0][2];
      const dMatch = pAttrs.match(/d="([^"]+)"/);
      const cxMatch = cAttrs.match(/cx="([^"]+)"/);
      const cyMatch = cAttrs.match(/cy="([^"]+)"/);
      const rMatch = cAttrs.match(/r="([^"]+)"/);

      if (dMatch && cxMatch && cyMatch && rMatch) {
        const outerD = dMatch[1];
        const cx = parseFloat(cxMatch[1]);
        const cy = parseFloat(cyMatch[1]);
        const r = parseFloat(rMatch[1]);

        if (r <= 5 && isPathClosedGeometry(outerD)) {
          hasCompound = true;
          const circleD = circleToPath(cx, cy, r);
          bgCompound = `<path fill-rule="evenodd" fill="${secondaryColor}" fill-opacity="0.55" stroke="none" d="${outerD} ${circleD}" />`;
        }
      }
    }

    const hasMultipleParts = elementMatches.length >= 2;

    let bgLayer = '';
    if (hasCompound) {
      bgLayer = bgCompound;
    } else {
      bgLayer = elementMatches.map((m, idx) => {
        const tag = m[1];
        const cleanAttrs = m[2]
          .replace(/\s*(fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|class|aria-hidden)="[^"]*"/g, '')
          .trim();

        const isLine = tag === 'line' || tag === 'polyline';
        let isClosed = !isLine;
        if (tag === 'path') {
          const dMatch = cleanAttrs.match(/d="([^"]+)"/);
          isClosed = dMatch ? isPathClosedGeometry(dMatch[1]) : false;
        }

        if (isClosed) {
          return `<${tag} ${cleanAttrs} fill="${secondaryColor}" fill-opacity="0.55" stroke="none" />`;
        } else {
          // If icon consists of multiple open lines (like AArrowDown, Code, ArrowRightCircle),
          // color the secondary half with solid secondaryColor!
          if (hasMultipleParts && idx < Math.ceil(elementMatches.length / 2)) {
            return `<${tag} ${cleanAttrs} fill="none" stroke="${secondaryColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`;
          }
          return `<${tag} ${cleanAttrs} fill="none" stroke="${secondaryColor}" stroke-width="${strokeWidth + 2}" stroke-opacity="0.55" stroke-linecap="round" stroke-linejoin="round" />`;
        }
      }).join('');
    }

    // Foreground Primary Layer: crisp white outlines
    const fgLayer = elementMatches.map((m, idx) => {
      const tag = m[1];
      const cleanAttrs = m[2]
        .replace(/\s*(fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|class|aria-hidden)="[^"]*"/g, '')
        .trim();

      const isLine = tag === 'line' || tag === 'polyline';
      let isClosed = !isLine;
      if (tag === 'path') {
        const dMatch = cleanAttrs.match(/d="([^"]+)"/);
        isClosed = dMatch ? isPathClosedGeometry(dMatch[1]) : false;
      }

      // If already rendered as a distinct solid secondary accent in multi-part icons, skip from primary
      if (!isClosed && hasMultipleParts && idx < Math.ceil(elementMatches.length / 2)) {
        return '';
      }

      return `<${tag} ${cleanAttrs} fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`;
    }).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}"><g class="duotone-secondary">${bgLayer}</g><g class="duotone-primary">${fgLayer}</g></svg>`;
  }

  // --- 4. COLORED ---
  if (style === 'colored') {
    const fgLayer = elementMatches.map((m) => {
      const tag = m[1];
      const cleanAttrs = m[2]
        .replace(/\s*(fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|class|aria-hidden)="[^"]*"/g, '')
        .trim();
      return `<${tag} ${cleanAttrs} fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`;
    }).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}"><circle cx="12" cy="12" r="10" fill="${color}" fill-opacity="0.14" stroke="none" />${fgLayer}</svg>`;
  }

  // --- 5. MODERN 3D ---
  if (style === 'modern3d') {
    const fgLayer = elementMatches.map((m) => {
      const tag = m[1];
      const cleanAttrs = m[2]
        .replace(/\s*(fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|class|aria-hidden)="[^"]*"/g, '')
        .trim();
      return `<${tag} ${cleanAttrs} fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`;
    }).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"><defs><filter id="gfTileShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/></filter></defs><rect width="24" height="24" rx="6" fill="#18181B" filter="url(#gfTileShadow)"/><rect x="0.5" y="0.5" width="23" height="23" rx="5.5" fill="none" stroke="rgba(255,255,255,0.12)"/><g transform="scale(0.75) translate(4, 4)">${fgLayer}</g></svg>`;
  }

  return rawSvg;
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
  const styledSvg = generateStyledSvgMarkup(icon, config);
  const viewBoxMatch = styledSvg.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : sanitizeViewBox(icon.viewBox);
  const inner = styledSvg.replace(/<svg[^>]*>|<\/svg>/g, '');

  return `import React from 'react';

export interface ${componentName}Props extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  size = ${config.size || 24},
  className = '',
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="${viewBox}"
    className={className}
    {...props}
    dangerouslySetInnerHTML={{ __html: \`${inner}\` }}
  />
);
export default ${componentName};`;
}

/**
 * Generates an inline Tailwind CSS SVG string
 */
export function generateTailwindSvgSnippet(icon: IconItem, config?: IconExportConfig): string {
  const effectiveConfig: IconExportConfig = config || {
    style: 'outline',
    strokeWidth: 2,
    color: 'currentColor',
    size: 24,
  };
  const styledSvg = generateStyledSvgMarkup(icon, effectiveConfig);
  return styledSvg.replace('<svg ', '<svg className="w-5 h-5 text-current" ');
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
