import { icons } from 'lucide-react';
import { IconItem } from '../types';

export const ICON_THEMES = [
  { id: 'all-icons', name: 'Všechny ikony (1600+)', iconName: 'Grid' },
  { id: 'custom-icons', name: 'Moje sady & Balíčky', iconName: 'Upload' },
  { id: 'finance', name: 'Finance & Investování', iconName: 'TrendingUp' },
  { id: 'software-it', name: 'Software & IT Architektura', iconName: 'Code' },
  { id: 'ai-tech', name: 'Umělá inteligence & AI', iconName: 'Sparkles' },
  { id: 'web-ui', name: 'Web & Rozhraní', iconName: 'Layout' },
  { id: 'business', name: 'Business & Obchod', iconName: 'Briefcase' },
  { id: 'ecommerce', name: 'E-commerce & Nákupy', iconName: 'ShoppingCart' },
  { id: 'security', name: 'Bezpečnost & Šifrování', iconName: 'Shield' },
  { id: 'communication', name: 'Komunikace & Chat', iconName: 'MessageSquare' },
  { id: 'media', name: 'Média & Audio/Video', iconName: 'Play' },
  { id: 'design', name: 'Design & Vektory', iconName: 'Palette' },
  { id: 'devices', name: 'Zařízení & Hardware', iconName: 'Monitor' },
  { id: 'navigation', name: 'Navigace & Šipky', iconName: 'Compass' },
  { id: 'nature-weather', name: 'Příroda & Počasí', iconName: 'Sun' },
  { id: 'lifestyle', name: 'Životní styl & Sport', iconName: 'Heart' },
];

const CATEGORY_RULES: Record<string, RegExp> = {
  finance: /(candlestick|chart|dollar|euro|banknote|receipt|wallet|briefcase|credit|calculator|coins|landmark|piggy|vault|trending|percent|bitcoin|yen|pound|scale|hand-coins|circle-dollar|badge-percent|badge-dollar|badge-euro|badge-pound|badge-yen)/i,
  'software-it': /(code|terminal|git|branch|commit|merge|fork|database|cpu|binary|bug|server|hard-drive|webhook|variable|workflow|braces|brackets|regex|file-code|folder-git|network|router|wifi|cloud|boxes|layers|container|command|script|file-json|file-terminal)/i,
  'ai-tech': /(sparkle|sparkles|bot|brain|circuit|wand|scan-eye|scan-face|neural|robot|microchip|deep|prompt|agent|algorithm|synthetic|atom)/i,
  ecommerce: /cart|shopping|bag|package|tag|barcode|truck|store|gift|box|container|qr/i,
  security: /shield|lock|key|fingerprint|eye|password|scan|badge-check|verified|protect/i,
  communication: /mail|message|chat|phone|send|inbox|at-sign|megaphone|bell|share/i,
  media: /play|pause|camera|video|film|music|mic|volume|audio|radio|image|headphones|disc|speaker/i,
  design: /pen|brush|palette|layers|crop|scissors|pipette|ruler|shapes|frame|vector|wand|paint/i,
  devices: /monitor|smartphone|tablet|laptop|watch|keyboard|mouse|printer|hard-drive|tv|router|battery|bluetooth|wifi|cpu/i,
  navigation: /arrow|chevron|compass|map|globe|navigation|crosshair|pin|locate|route/i,
  'nature-weather': /sun|moon|cloud|wind|umbrella|droplet|tree|flower|flame|snowflake|leaf|zap/i,
  lifestyle: /heart|activity|coffee|cup|smile|dumbbell|foot|shirt|glasses|bike|car|plane|anchor/i,
  business: /briefcase|landmark|award|trophy/i,
};

// Common Czech translations dictionary for frequent icon words
const CZ_WORDS: Record<string, string> = {
  candlestick: 'Svíčkový graf (Trading)',
  bitcoin: 'Bitcoin (Krypto)',
  coins: 'Mince (Krypto)',
  banknote: 'Bankovka',
  wallet: 'Peněženka',
  vault: 'Trezor',
  trending: 'Trend / Růst',
  percent: 'Procento / Výnos',
  credit: 'Kreditní karta',
  calculator: 'Kalkulačka',
  receipt: 'Účtenka',
  scale: 'Rozvaha / Váhy',
  sparkles: 'Jiskry (AI)',
  bot: 'AI Bot / Asistent',
  brain: 'Mozek (Neuronová síť)',
  wand: 'Kouzelná hůlka (AI Prompt)',
  code: 'Kód / Program',
  terminal: 'Terminál / CLI',
  database: 'Databáze / SQL',
  server: 'Server / Cloud',
  cpu: 'Procesor / Hardware',
  workflow: 'Workflow / CI-CD',
  binary: 'Binární kód',
  network: 'Síť / Infrastruktura',
  bug: 'Chyba (Bug)',
  braces: 'Složené závorky',
  git: 'Git repozitář',
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
  map: 'Mapa',
  globe: 'Zeměkoule',
  compass: 'Kompas',
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

    if (category === 'finance') {
      tags.push('finance', 'investice', 'investovani', 'krypto', 'akcie', 'trading', 'penize', 'vynos', 'graf', 'kurz', 'market');
    } else if (category === 'software-it') {
      tags.push('software', 'it', 'vyvoj', 'kod', 'programovani', 'developer', 'architektura', 'cloud', 'devops', 'backend', 'frontend');
    } else if (category === 'ai-tech') {
      tags.push('ai', 'umela-inteligence', 'ml', 'strojove-uceni', 'neural', 'prompt', 'model', 'llm', 'robot', 'agent', 'generovani');
    }

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
