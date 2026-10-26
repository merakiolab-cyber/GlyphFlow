import { icons } from 'lucide-react';
import { IconItem } from '../types';

export const ICON_THEMES = [
  { id: 'all-icons', name: 'Všechny ikony (1600+)', iconName: 'Grid' },
  { id: 'custom-icons', name: 'Moje nahrané ikony', iconName: 'Upload' },
  { id: 'web-ui', name: 'Web & Rozhraní', iconName: 'Layout' },
  { id: 'business', name: 'Business & Finance', iconName: 'TrendingUp' },
  { id: 'ecommerce', name: 'E-commerce & Nákupy', iconName: 'ShoppingCart' },
  { id: 'development', name: 'Kód & Vývoj', iconName: 'Code' },
  { id: 'security', name: 'Bezpečnost & Cloud', iconName: 'Shield' },
  { id: 'communication', name: 'Komunikace & Chat', iconName: 'MessageSquare' },
  { id: 'media', name: 'Média & Audio/Video', iconName: 'Play' },
  { id: 'design', name: 'Design & Nástroje', iconName: 'Palette' },
  { id: 'devices', name: 'Zařízení & Hardware', iconName: 'Monitor' },
  { id: 'navigation', name: 'Navigace & Šipky', iconName: 'Compass' },
  { id: 'nature-weather', name: 'Příroda & Počasí', iconName: 'Sun' },
  { id: 'lifestyle', name: 'Životní styl & Sport', iconName: 'Heart' },
];

const CATEGORY_RULES: Record<string, RegExp> = {
  business: /chart|dollar|euro|banknote|receipt|wallet|briefcase|credit|calculator|coins|landmark|piggy|vault|trending|percent|badge|award|trophy/i,
  ecommerce: /cart|shopping|bag|package|tag|barcode|truck|store|gift|box|container|qr/i,
  development: /code|terminal|git|database|cpu|binary|bug|server|webhook|variable|workflow|braces|brackets|regex|file-code/i,
  security: /shield|lock|key|fingerprint|eye|password|scan|badge-check|verified|protect/i,
  communication: /mail|message|chat|phone|send|inbox|at-sign|megaphone|bell|share/i,
  media: /play|pause|camera|video|film|music|mic|volume|audio|radio|image|headphones|disc|speaker/i,
  design: /pen|brush|palette|layers|crop|scissors|pipette|ruler|shapes|frame|vector|wand|paint/i,
  devices: /monitor|smartphone|tablet|laptop|watch|keyboard|mouse|printer|hard-drive|tv|router|battery|bluetooth|wifi|cpu/i,
  navigation: /arrow|chevron|compass|map|globe|navigation|crosshair|pin|locate|route/i,
  'nature-weather': /sun|moon|cloud|wind|umbrella|droplet|tree|flower|flame|snowflake|leaf|zap/i,
  lifestyle: /heart|activity|coffee|cup|smile|dumbbell|foot|shirt|glasses|bike|car|plane|anchor/i,
};

// Common Czech translations dictionary for frequent icon words
const CZ_WORDS: Record<string, string> = {
  home: 'Domů',
  user: 'Uživatel',
  search: 'Hledat',
  settings: 'Nastavení',
  bell: 'Upozornění',
  cart: 'Košík',
  heart: 'Srdce',
  check: 'Hotovo',
  plus: 'Přidat',
  minus: 'Odebrat',
  trash: 'Koš',
  edit: 'Upravit',
  share: 'Sdílet',
  download: 'Stáhnout',
  upload: 'Nahrát',
  file: 'Soubor',
  folder: 'Složka',
  calendar: 'Kalendář',
  clock: 'Čas',
  mail: 'E-mail',
  phone: 'Telefon',
  camera: 'Kamera',
  video: 'Video',
  image: 'Obrázek',
  lock: 'Zámek',
  shield: 'Štít',
  star: 'Hvězda',
  eye: 'Oko',
  cloud: 'Cloud',
  code: 'Kód',
  terminal: 'Terminál',
  database: 'Databáze',
  map: 'Mapa',
  globe: 'Zeměkoule',
  compass: 'Kompas',
  wallet: 'Peněženka',
  credit: 'Karta',
  dollar: 'Dolar',
  tag: 'Štítek',
  gift: 'Dárek',
  sun: 'Slunce',
  moon: 'Měsíc',
  zap: 'Blesk',
  flame: 'Oheň',
};

function toCzechName(pascalName: string): string {
  const kebab = pascalName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  for (const [en, cz] of Object.entries(CZ_WORDS)) {
    if (kebab.includes(en)) {
      return `${cz} (${pascalName})`;
    }
  }
  return pascalName;
}

function resolveCategory(name: string): string {
  for (const [cat, regex] of Object.entries(CATEGORY_RULES)) {
    if (regex.test(name)) return cat;
  }
  return 'web-ui';
}

/**
 * Pre-indexes all 1,600+ icons from lucide-react with search tags and categories
 */
let cachedIconsList: IconItem[] | null = null;

export function getAllLucideIcons(): IconItem[] {
  if (cachedIconsList) return cachedIconsList;

  const iconNames = Object.keys(icons);
  cachedIconsList = iconNames.map((name) => {
    const category = resolveCategory(name);
    const czechName = toCzechName(name);
    const kebab = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    const tags = [
      kebab,
      name.toLowerCase(),
      category,
      'lucide',
      'vector',
    ];

    return {
      id: name,
      name,
      czechName,
      category,
      tags,
      svgPath: '', // Will be dynamically rendered via Lucide component for crisp SVG extraction
      viewBox: '0 0 24 24',
    };
  });

  return cachedIconsList;
}
