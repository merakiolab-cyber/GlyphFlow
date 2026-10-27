# Roadmap projektu - GlyphFlow

Tento dokument definuje plánovaný rozvoj aplikace GlyphFlow v příštích verzích.

## 🚀 Fáze 1: Core Unicode & PWA (Dokončeno)
- [x] Kompletní offline mapa znaků s 600+ Unicode symboly, měnami, matematikou a diakritikou.
- [x] PWA podpora a nativní instalace na plochu Windows.
- [x] Lokální IndexedDB úložiště pro oblíbené položky, historii a nastavení.
- [x] Textová schránka pro skládání textu (Charmap buffer).
- [x] Export Studio pro vektorové SVG a rastrové PNG v různých rozlišeních.

## 🌟 Fáze 2: Designérská knihovna ikon & Emojis (Dokončeno)
- [x] Sekce Knihovna ikon (1600+) s tématy Web, Finance & Investování, Software & IT, Umělá inteligence (AI), Business, E-commerce, Bezpečnost.
- [x] 36 nových ručně navržených vektorových ikon pro DeFi, candlestick trading, Docker, K8s, CI/CD, LLM modely, prompty a agenty.
- [x] Styly Outline, Solid (s compound cutouts), Duotone (zářivé 2-tónové akcenty), Colored a 3D.
- [x] Kopírování SVG, React JSX a Data URL pro Figma a AI.
- [x] Přidání rozsáhlých sad Emojis, smajlíků a samolepek do mapy znaků.

## 🔮 Fáze 3: Pokročilé integrace & Typografie (Dokončeno v AI Studio)
- [x] **Figma Plugin Bridge**: Přímé propojení s Figma Desktop (1-click SVG schránka Ctrl+V s Figma vrstvami, generátor instalovatelného desktopového pluginu .zip pro Figma Plugins menu, Design System Component Board, Tokens Studio export).
- [x] **Vlastní sady ikon**: Nahrávání libovolných SVG balíčků (drag & drop, hromadný import), organizace do kolekcí, správa v lokální IndexedDB paměti, filtrování a export.
- [x] **Rozšířená typografická analýza**: Kompletní OpenType Studio s interaktivním přepínáním funkcí (`liga`, `dlig`, `calt`, `tnum`, `zero`, `frac`, `ss01`-`ss03`, `case`, `smcp`, `kern`), testování na systémových fontech Windows i vlastních písmech, porovnávání Před/Po a anatomie glyfů.
- [ ] **Cloudová synchronizace (volitelná)**: Ponecháno; default je lokální-only. Nezapínat bez explicitního zadání.

## 🪟 Fáze 4: GitHub portfolio + Win 11 Desktop apka (Dokončeno)
- [x] Načtení kontextu, bezpečnostní audit a sanitizace SVG/JSON.
- [x] Vyčištění AI Studio zbytků a příprava Windows-friendly skriptů (`clean`, `lint`, `build`).
- [x] PWA offline podpora, self-hostování WOFF2 fontů a chybějící PWA assety.
- [x] Licence MIT, detailní portfolio dokumentace v README a inicializace veřejného GitHub repozitáře ([merakiolab-cyber/GlyphFlow](https://github.com/merakiolab-cyber/GlyphFlow)).
- [x] Windows 11: **Tauri 2** — nativní backend inicializován (`src-tauri`), bezpečnostní CSP hardened.
- [x] Sestaven a otestován samostatný **portable `.exe`** (3,65 MB standalone binárka bez nutnosti instalace) přes `npm run desktop:portable`.

## 🚀 Fáze 5: Budoucí vylepšení & distribuce (Plánováno)
- [ ] GitHub Actions CI/CD workflow pro automatické vytváření release balíčků (.exe / installer).
- [ ] Podpora pro další proměnné osy Variable Fonts (wght, wdth, slnt, opsz) v Typography Studiu.
- [ ] Volitelná šifrovaná synchronizace nastavení a kolekcí.
