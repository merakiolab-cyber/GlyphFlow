const FORBIDDEN_TAGS = new Set([
  'script',
  'foreignobject',
  'iframe',
  'object',
  'embed',
  'link',
  'meta',
  'style',
  'video',
  'audio',
  'canvas',
  'form',
  'input',
  'textarea',
  'button',
]);

const MAX_SVG_CHARS = 200_000;
const VIEWBOX_RE = /^[\d.\s,-]+$/;

export function sanitizeViewBox(raw: string | null | undefined): string {
  const value = (raw || '').trim();
  return VIEWBOX_RE.test(value) ? value : '0 0 24 24';
}

function stripDangerousNode(el: Element): void {
  const tag = el.tagName.toLowerCase();
  if (FORBIDDEN_TAGS.has(tag)) {
    el.remove();
    return;
  }

  for (const attr of [...el.attributes]) {
    const name = attr.name.toLowerCase();
    const value = attr.value.trim();

    if (name.startsWith('on') || name === 'srcdoc') {
      el.removeAttribute(attr.name);
      continue;
    }

    if (name === 'href' || name === 'xlink:href' || name === 'src' || name === 'action') {
      const lower = value.toLowerCase();
      if (
        lower.startsWith('javascript:') ||
        lower.startsWith('data:') ||
        lower.startsWith('vbscript:') ||
        lower.startsWith('http:') ||
        lower.startsWith('https:')
      ) {
        el.removeAttribute(attr.name);
      }
      continue;
    }

    if (name === 'style' && /expression|url\s*\(/i.test(value)) {
      el.removeAttribute(attr.name);
    }
  }

  for (const child of [...el.children]) {
    stripDangerousNode(child);
  }
}

export function parseUploadedSvg(raw: string): { viewBox: string; inner: string } | null {
  if (!raw || raw.length > MAX_SVG_CHARS) return null;

  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, 'image/svg+xml');
  if (doc.querySelector('parsererror')) return null;

  const svgEl = doc.querySelector('svg');
  if (!svgEl) return null;

  stripDangerousNode(svgEl);
  const inner = svgEl.innerHTML.trim();
  if (!inner) return null;

  return {
    viewBox: sanitizeViewBox(svgEl.getAttribute('viewBox')),
    inner,
  };
}

export function sanitizeSvgInner(raw: string): string {
  if (!raw || raw.length > MAX_SVG_CHARS) return '';
  const wrapped = `<svg xmlns="http://www.w3.org/2000/svg">${raw}</svg>`;
  const parsed = parseUploadedSvg(wrapped);
  return parsed?.inner ?? '';
}
