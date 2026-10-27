# Changelog - GlyphFlow

Všechny významné změny v projektu GlyphFlow jsou zaznamenány v tomto dokumentu.

## [Unreleased]

### Přidáno & Dokončeno (Windows 11 Desktop & GitHub v1.3.4)
- **Samostatný Portable `.exe` balíček pro Windows 11**:
  - Přidán skript `npm run desktop:portable` (`tauri build --no-bundle`), který generuje čistý samostatný spustitelný soubor bez nutnosti instalátoru.
  - Výsledný `glyphflow.exe` (3,65 MB) obsahuje veškeré frontendové assety, fonty a offline databázi přímo v sobě a využívá vestavěný WebView2 runtime Windows 11 s minimálním paměťovým footprintem.
- **Oficiální veřejný GitHub repozitář**:
  - Publikován veřejný repozitář na [merakiolab-cyber/GlyphFlow](https://github.com/merakiolab-cyber/GlyphFlow) se synchronizací hlavní větve `master`.
- **Aktualizace dokumentace a plánu rozvoje**:
  - V [README.md](README.md) a [ROADMAP.md](ROADMAP.md) zaznamenán návod na portable build a uzavřena Fáze 4 rozvoje.

### Opraveno & Vylepšeno (Fluent Light Mode v1.3.3)
- **Kompletní Fluent Windows 11 Light Mode visual overhaul**:
  - **Tailwind v4 integrace**: Přidána `@custom-variant dark (&:where(.dark, .dark *));` do `src/index.css`, která zaručuje správnou aktivaci `.dark` tříd nezávisle na systémovém nastavení OS.
  - **Okamžitá inicializace tématu bez probliknutí**: Přidán synchronní inline skript do `<head>` v `index.html` vyhodnocující URL parametr `?theme=` a `localStorage.getItem('gf_theme')` ještě před vykreslením DOMu.
  - **Automatická adaptace barev ikon**: `IconsLibraryView` dynamicky přizpůsobuje výchozí tahy ikon (`#18181B` v Light Mode vs `#FFFFFF` v Dark Mode) i sekundární Duotone barvu (`#0284C7` vs `#00F2FE`), takže ikony jsou okamžitě zřetelné a kontrastní.
  - **Oprava kolize URL parametrů**: Odstraněn konflikt v inicializaci kategorie, kde `?theme=light` způsobovalo nastavení `selectedCategory = 'light'` s 0 nalezenými ikonami.
  - **Sjednocený Fluent Design System**:
    - **Header**: Bílý podklad `bg-white/90` s jemným rozostřením `backdrop-blur-md`, tmavé navigační indikátory s vysokým kontrastem a přepínač Sun/Moon.
    - **Vyhledávací lišta & Schránka**: Čistě bílé povrchy karet s jemnými rámečky `border-zinc-200`, tmavým textem a přehlednou historií.
    - **Katalog & Karty znaků**: Elegantní karty `bg-white` se subtilním hover efektem a stínováním Windows 11 Fluent UX.
    - **Knihovna ikon & Modály**: Kompletně přepracované zobrazení pro `IconsLibraryView`, `TypographyStudioView`, `CustomIconsManagerModal`, `FigmaBridgeModal`, `GlyphDetailModal`, `ExportModal` a `SyncModal`.
  - **Aktualizace dokumentace & Náhledy**: Do `README.md` i repozitáře přidány screenshoty pro oba režimy (`charmap_light.png`, `icons_light.png`, `typography_light.png`).

### Přidáno & Vylepšeno (Knihovna ikon v1.3.2)
- **Nové sady ikon & specializované kategorie: Finance, Software/IT a Umělá inteligence (AI)**:
  - **Finance & Investování (93+ ikon)**: 12 nových ručně navržených 24×24 vektorových ikon (`Crypto Token`, `Candlestick Bull/Bear`, `Liquidity Pool`, `Yield Farming`, `Staking Rewards`, `Hardware Wallet`, `Smart Contract`, `Order Book`, `DeFi Swap`, `Bull Market`, `Investment Portfolio`) + provázání s existujícími Lucide ikonami a rozšířenými českými/anglickými štítky (krypto, akcie, trading, burza, defi, staking, výnos, bitcoin, peněženka, grafy).
  - **Software & IT Architektura (112+ ikon)**: 12 nových vektorových ikon pro moderní inženýrství (`API Endpoint`, `Docker Container`, `Kubernetes Cluster`, `CI/CD Pipeline`, `Microservices Mesh`, `Load Balancer`, `GraphQL Schema`, `Event Queue / Kafka`, `Cloud Native`, `Git Hotfix`, `WebAssembly (WASM)`, `Monorepo Architecture`) + provázání s vývojářskými ikonami (code, cloud, database, server, cpu, terminal, git, bug, container, pipeline).
  - **Umělá inteligence & AI (36+ ikon)**: 12 nových specializovaných ikon pro generativní AI a strojové učení (`LLM Neural Model`, `AI Prompt Cursor`, `Autonomous AI Agent`, `Neural Synapse`, `Token Streaming`, `RAG Vector Search`, `Generative Diffusion`, `AI Copilot`, `AI Tensor GPU`, `Transformer Attention`, `Computer Vision AI`, `Voice AI Waveform`) + provázání s Lucide ikonami (bot, brain, sparkles, wand, microchip).
  - **Plná podpora všech 5 stylů a Figma Bridge**: Všechny nové ikony mají precizní geometrii s podporou Solid výřezů (`evenodd`), zářivých 2-tónových Duotone akcentů i okamžitého exportu do Figma (`Ctrl+V`), React JSX a SVG/PNG ZIPu.
  - **Vylepšený správce sad (CustomIconsManagerModal)**:
    - Nová karta "Doporučené kurátorské sady GlyphFlow" s mini-náhledy a 1-click instalací jednotlivých sad i všech 36 ikon do lokální IndexedDB paměti.
    - Interaktivní filtrovací pilulky v zobrazení "Moje sady & Balíčky" umožňující bleskové přepínání mezi kurátorskými sadami (`Finance & Krypto`, `Software & IT`, `Umělá inteligence (AI)`) a uživatelskými importy.
  - **URL hluboké odkazy**: Podpora parametrů `?view=icons&category=finance`, `?view=icons&category=software-it`, `?view=icons&category=ai-tech` a parametru hledání `?q=`.
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
