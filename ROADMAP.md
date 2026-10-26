# Roadmap projektu - GlyphFlow

Tento dokument definuje plánovaný rozvoj aplikace GlyphFlow v příštích verzích.

## 🚀 Fáze 1: Core Unicode & PWA (Dokončeno)
- [x] Kompletní offline mapa znaků s 600+ Unicode symboly, měnami, matematikou a diakritikou.
- [x] PWA podpora a nativní instalace na plochu Windows.
- [x] Lokální IndexedDB úložiště pro oblíbené položky, historii a nastavení.
- [x] Textová schránka pro skládání textu (Charmap buffer).
- [x] Export Studio pro vektorové SVG a rastrové PNG v různých rozlišeních.

## 🌟 Fáze 2: Designérská knihovna ikon & Emojis (Dokončeno)
- [x] Sekce Knihovna ikon (1000+) s tématy Web, Business, E-commerce, Code, Cloud.
- [x] Styly Outline, Solid, Duotone, Colored a 3D.
- [x] Kopírování SVG, React JSX a Data URL pro Figma a AI.
- [x] Přidání rozsáhlých sad Emojis, smajlíků a samolepek do mapy znaků.

## 🔮 Fáze 3: Pokročilé integrace & Typografie (Dokončeno v AI Studio)
- [x] **Figma Plugin Bridge**: Přímé propojení s Figma Desktop (1-click SVG schránka Ctrl+V s Figma vrstvami, generátor instalovatelného desktopového pluginu .zip pro Figma Plugins menu, Design System Component Board, Tokens Studio export).
- [x] **Vlastní sady ikon**: Nahrávání libovolných SVG balíčků (drag & drop, hromadný import), organizace do kolekcí, správa v lokální IndexedDB paměti, filtrování a export.
- [x] **Rozšířená typografická analýza**: Kompletní OpenType Studio s interaktivním přepínáním funkcí (`liga`, `dlig`, `calt`, `tnum`, `zero`, `frac`, `ss01`-`ss03`, `case`, `smcp`, `kern`), testování na systémových fontech Windows i vlastních písmech, porovnávání Před/Po a anatomie glyfů.
- [ ] **Cloudová synchronizace (volitelná)**: Ponecháno; default je lokální-only. Nezapínat bez explicitního zadání.

## 🪟 Fáze 4: Cursor → GitHub portfolio + Win 11 apka (v kurzu)
- [x] Načtení kontextu v Cursoru, pravidla do/don't, bezpečnostní audit zapsaný do changelogu.
- [x] Vyčistit AI Studio leftover (`react-example`, Gemini/Express, `metadata.json`, unix `rm` v npm `clean`).
- [x] Sanitizace SVG importu, validace JSON záloh a `?sync=`.
- [x] Doplnit chybějící PWA asset `apple-touch-icon.png`; self-host fonty pro skutečný offline.
- [x] `git init`, licence (MIT), README pro portfolio, veřejný GitHub remote (připraveno na remote).
- [ ] Windows 11: **Tauri 2** — nativní `.exe` / `.msi` (rozhodnuto). PWA nechat jako vedlejší webový kanál.
- [x] Windows-friendly npm skripty (`clean` bez `rm -rf`).
