# Changelog - GlyphFlow

Všechny významné změny v projektu GlyphFlow jsou zaznamenány v tomto dokumentu.

## [Unreleased]

### Přidáno & Vylepšeno (Knihovna ikon v1.3.2)
- **Precizní Solid (Plná) engine pro ikony**:
  - Vyřešena ztráta detailů a špatné překryvy: zavedena geometrická analýza SVG drah (`isPathClosedGeometry`) a výpočet přesných bounding boxů pro každý SVG element.
  - Vytváření sloučených SVG compound paths s `fill-rule="evenodd"` pro tvary s vnitřními otvory (`Eye`, `Settings`, `Camera`, `Target`, `Disc` apod.), kde je střed skutečně transparentním vektorovým výřezem.
  - Inteligentní **Contrast Knockout**: vnitřní detaily (ručičky hodin u `AlarmClock`, zaškrtávátko u `AlarmClockCheck`, stužka u `Album`, červený kříž u `Ambulance`, oči a úsměv u `Smile`) jsou automaticky vykresleny v kontrastní barvě podkladu, takže se už neslévají do bílého fleku.
  - Otevřené tahy (`Code` závorky, `Plus`, `Search` rukojeť, `Activity` ekg křivka, `TrendingUp`) se v režimu Solid nepřevádí na trojúhelníkové tětivy, ale zachovávají si tučný, ostrý čárový tah (stroke 2.6px).
- **Autentický Duotone (2-tón) engine**:
  - Vyřešen problém "pouze bílých ikon": výchozí barevná paleta nyní páruje ostrou primární bílou linku se zářivou kyanidovou výplní (`#00F2FE`), která je na tmavém podkladu nepřehlédnutelná.
  - Sekundární vrstva využívá 55% krytí pro uzavřená těla a chytré barevné akcenty pro vícedílné čárové ikony (např. šipka u `AArrowDown`, levá závorka u `Code`).
  - Podpora dynamického split náhledu na paletových tlačítkách (lineární diagonální gradient zobrazující obě barvy současně).
  - Přímá podpora URL parametru `?view=icons&style=solid` a `?view=icons&style=duotone`.
- **100% WYSIWYG konzistence**:
  - Náhled v mřížce knihovny ikon, zvětšený detail v modalu, export do schránky pro Figma (`Ctrl+V`), přímé stažení SVG, stažení PNG i hromadný ZIP export nyní sdílejí naprosto identický stylizovaný výstup bez rozporů.

### Přidáno
- Inicializace nativní desktopové Windows 11 aplikace přes **Tauri 2** (`src-tauri`) s Rust backendem, přísným CSP a NSIS/MSI balíčky.
- Skripty `npm run desktop:dev` a `npm run desktop:build` pro Windows aplikaci.
- Galerie screenshotů aplikace v `docs/screenshots/` (Mapa znaků, Knihovna ikon, OpenType Studio) s vložením do `README.md`.
- Podpora přímého otevření záložek pomocí parametru `?view=` (např. `?view=icons`, `?view=typography`).
- Offline asset `apple-touch-icon.png` (180×180 px) vyrenderovaný z vektorového `icon.svg`.
- Self-hostování fontů pro 100% offline běh: 10 WOFF2 souborů (`JetBrains Mono` a `Plus Jakarta Sans`) v `public/fonts/` s lokálním `fonts.css`.
- Inicializace čistého Git repozitáře s `.gitignore` omezujícím build artefakty a tajnosti.
- Licence MIT ([LICENSE](LICENSE)) pro open-source portfolio.
- Rozšířená portfolio dokumentace v [README.md](README.md) pokrývající Figma Bridge, knihovnu 1000+ ikon, OpenType Studio i offline strukturu.

### Změněno
- Povýšení na stabilní Vite 7.3.7: vyřešil deadlock při minifikaci a transformaci velkých modulů, build zrychlen na 4 s.
- Oprava chyby `__dirname` pro ESM v `vite.config.ts`.
- Projekt převzat z Google AI Studio do Cursoru; založen vývojový kontext (`.cursor/rules/`).
- `package.json`: název `glyphflow`, verze `1.3.1`, Vite host jen `127.0.0.1`, `clean` skript pro Windows.
- `index.html`: odstraněny externí požadavky na Google Fonts CDN, nahrazeny lokálním `/fonts/fonts.css`.

### Odstraněno
- Odstraněn leftover `initial_prompt.txt` z kořenového adresáře.
- AI Studio leftover: `@google/genai`, `express`, `dotenv`, `motion`, `tsx`, `@types/express`, `@types/jszip`, `metadata.json`.
- `.env.example` už neobsahuje `GEMINI_API_KEY`.

### Bezpečnost
- `npm audit`: vyřešeny známé zranitelnosti balíčků, repozitář má 0 zranitelností.
- Tauri 2 Hardened CSP: zakázán `object-src`, `frame-ancestors`, skripty omezeny výhradně na lokální aplikaci.
- Sanitizace nahrávaného SVG (`script`, `on*`, `javascript:`, externí URL, `foreignObject`) před IndexedDB i před renderem.
- Validace JSON záloh a `?sync=` (limit délky, jen známé znaky z katalogu, whitelist polí).
- Vite dev server už neposlouchá na celé síti.
- Vyřešena online závislost na `fonts.googleapis.com` – aplikace a PWA jsou nyní plně soběstačné offline bez volání třetích stran.
- **Otevřené:** Figma plugin UI používá `postMessage(..., '*')` (oficiální vzor Figma iframe); SVG se sanitizuje před schránkou.
- Nález: v `src/` nebyl skrytý síťový klient Gemini.

## [1.3.0] - 2026-10-14
### Přidáno
- **Figma Plugin Bridge**:
  - Přímé vkládání vektorů do Figma Desktop i Figma Web jedním kliknutím (`Ctrl+V`) s automaticky pojmenovanými vrstvami a Auto-Layout kompatibilitou.
  - Oficiální generátor instalovatelného Figma Desktop Pluginu (`glyphflow-figma-plugin.zip` obsahující `manifest.json`, `code.js`, `ui.html`, `README.md`) pro import přes Figma Plugins menu.
  - Generátor kompletního **Figma Design System Boardu** s mřížkou komponent a popisky.
  - Export pro Tokens Studio (Figma Tokens JSON) a Figma Code Connect komponenty.
  - Rychlé 1-click Figma tlačítko přímo na kartách ikon s okamžitou odezvou.

- **Vlastní sady ikon & SVG Manažer**:
  - Plnohodnotný manažer pro nahrávání vlastních SVG souborů a balíčků (podpora Drag & Drop a hromadného výběru souborů).
  - Organizace do kolekcí (např. Branding, Fintech, UI balíčky).
  - Trvalé uložení v lokální databázi IndexedDB (plně funkční offline bez serveru).
  - Integrace do vyhledávání, filtrování, stylizace (Outline, Solid, Duotone, Colored, 3D) a exportů.
  - Možnost zálohování vlastních sad do JSON souboru a mazání celých kolekcí.

- **Typografická analýza & OpenType Studio**:
  - Samostatná sekce v horní navigaci pro pokročilou analýzu písma a OpenType funkcí.
  - Interaktivní přepínače funkcí: standardní ligatury (`liga`), diskréční ligatury (`dlig`), programátorské ligatury (`calt`), tabulární číslice (`tnum`), přeškrtnutá nula (`zero`), diagonální zlomky (`frac`), staré číslice (`onum`), stylistické sady (`ss01`–`ss03`), kapitálky (`smcp`) a optický kerning (`kern`).
  - Podpora testování systémových fontů nainstalovaných ve Windows i zadaných vlastních písem.
  - Režim vizuálního porovnání **Před / Po** s editovatelným textovým editorem a předvolbami (český pangram, DeFi finanční data, ligatury kódu).
  - Hloubkový inspektor glyfů s vizuálním diagramem anatomie písma (Ascender, X-Height, Baseline, Descender) a Unicode kódováním (UTF-8, UTF-16, CSS escape, HTML entity).
  - Export připravených CSS pravidel `font-feature-settings` pro webové projekty.

## [1.2.0] - 2026-10-13
### Přidáno
- **Knihovna ikon (1000+)**: Kompletně nová sekce pro designéry obsahující přes 1000 profesionálních vektorových ikon rozdělených do témat (Web & UI, Business, E-commerce, Kód, Cloud, Social, Devices, Communication, Tools, Navigation).
- **Styly ikon**: Možnost filtrování a generování variant Outline (Line), Solid (Flat), Duotone, Colored a 3D.
- **Jednorázové kopírování pro Figma a AI**: Kopírování čistého SVG kódu nebo React JSX komponent přímo do schránky s nastavením tloušťky čar a barvy.
- **Sady Emojis & Samolepek**: Do mapy znaků přidány populární smajlíky, gesta, samolepky a odznaky (`😀`, `🔥`, `⭐`, `💡`, `📌`, `🎯`).

### Opraveno
- Opravena chyba duplicitních React klíčů při vykreslování znaků vyskytujících se ve více kategoriích.
- Optimalizován plně responzivní full-screen layout pro všechna zařízení.

## [1.1.0] - 2026-10-13
### Přidáno
- Vzdušný, minimalistický design inspirovaný moderními rozhraními (čisté matné pozadí, jemná typografie bez rušivých hi-tech prvků).
- Plná podpora pro Windows PWA (instalace jako desktopová aplikace).
- Lokální IndexedDB databáze pro bleskovou offline odezvu.
- Textová schránka pro skládání znaků (Windows Charmap buffer).
- Export Studio pro SVG a PNG s nastavením rozlišení a průhlednosti.
- Synchronizace a zálohování přes JSON soubory nebo URL odkazy.
