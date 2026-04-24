# HeadSpace · IB Manga Edition — Build Rundown

> A landscape-first, manga comic-style Heads Up game for IB students. PWA-ready, tilt-controlled, AI-powered summaries.

---

## 1. Concept & Goals

**The game:** Students hold their phone to their forehead (landscape, screen facing out). Their team sees the IB term on screen and gives clues. The player tilts back to register *correct* or tilts forward to *pass* — just like Heads Up, built for IB revision.

**Why manga:** Gen Z students respond to bold, high-contrast visuals with personality. The manga comic aesthetic — thick ink borders, halftone dots, speed lines, action onomatopoeia — makes it feel like a game rather than a study tool.

**Target users:**
- IB students (Years 12–13) using it in class, study groups, or independently
- IB teachers loading custom term decks before lessons or exams

---

## 2. Design System

### Aesthetic Direction
**2D manga / comic book.** No gradients. No emojis. Custom SVG ink-style icons. Everything feels hand-drawn with a thick nib.

### Colour Palette
| Token | Hex | Usage |
|---|---|---|
| `--ink` | `#0A0A0A` | Borders, text, card backs |
| `--paper` | `#F2EBD9` | Primary screen background (aged paper) |
| `--panel` | `#FAF6EE` | Card surfaces |
| `--red` | `#C8001A` | PASS zone, danger timer, error states |
| `--yellow` | `#F5C800` | CORRECT zone, selected states, rank S/A |
| `--blue-ink` | `#001F5B` | Accent only |
| `--white` | `#FEFCF8` | Term card face |

Only two accent colours ever appear simultaneously (yellow + red). This preserves the manga black/white/accent palette.

### Typography
| Role | Font | Size | Weight |
|---|---|---|---|
| Display / Titles / Terms | Bangers | 16px – 80px | Regular (Bangers is inherently bold) |
| Body / Labels / Definitions | Outfit | 11px – 15px | 400 / 600 / 700 |

### Texture System
Three halftone dot patterns applied to different zones:
- `--dots-sm`: fine 6px grid, 18% opacity — general panel fills
- `--dots-red`: 7px grid, red-tinted — PASS zone overlay
- `--dots-yel`: 8px grid, yellow-tinted — CORRECT zone overlay

### Custom SVG Icons (no emojis)
All icons are 48×48 viewBox, stroke-only (no fill except structural), `stroke-width: 2.5`, `stroke-linecap: round`. Designed to look like manga line art.

| Subject | Icon Design |
|---|---|
| Biology | Atom orbital (three ellipses + nucleus) |
| Chemistry | Erlenmeyer flask with bubbles |
| Physics | Lightning bolt polygon (filled yellow) |
| Mathematics | Integral-bracket with horizontal lines |
| History | Greek column capitals (triple pillar) |
| Economics | Bar chart + rising polyline arrow |
| Psychology | Brain outline with vertical grid lines |
| English Lit | Open book (V-shape) with page lines |

### Manga Effects
- **Panel borders:** `3–4px solid var(--ink)` on all screen containers
- **Box shadows:** `4px 4px 0 var(--ink)` (hard offset, no blur) on selected/active cards
- **Speed lines:** SVG `<line>` elements radiating from card centre, 48 lines, random length variation, `opacity: 0.08`
- **Clip-path button:** `polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))` — gives primary buttons a manga corner cut
- **FX overlay:** Full-screen onomatopoeia text ("NICE!", "BOOM!", "SKIP!") — Bangers 96px, rotated -8°, `-webkit-text-stroke: 4px`, 0.55s fade animation

---

## 3. Screen Architecture

### Screen: Rotate Overlay
Shown via `@media screen and (orientation: portrait) and (max-width: 1024px)`. This fires on **all mobile portrait** sessions — users must rotate.

Contains:
- Animated SVG phone icon (CSS `transform: rotate(0→90deg)` loop)
- "ROTATE YOUR DEVICE" in Bangers
- Subtitle explaining it's a landscape game

### Screen: Home (Landscape)
Two-panel comic layout:

**Left panel (260px, black background):**
- HeadSpace logo in Bangers 52px (white + yellow accent letter)
- "IB EDITION" outlined badge
- Speech bubble with instructions (white, black border, tail pointing down)
- Teacher Mode ghost button at bottom

**Right panel (flex-1, paper background):**
- 4×2 subject card grid
- Each card: SVG icon + subject name + term count
- Selected state: yellow background + 4px offset shadow
- Start Game button (clip-path shape, yellow text on ink background)

### Screen: Setup (Landscape)
**Left panel (55%):**
- Subject icon + name in Bangers
- Topic chips (toggle on/off, all selected by default)
- Chips use ink-filled selected state

**Right panel (45%):**
- 2×2 timer grid (30s / 60s / 90s / 2min)
- Selected timer: yellow bg + hard shadow
- FIGHT! button at bottom

### Screen: Permission
Required for iOS 13+ motion access (`DeviceOrientationEvent.requestPermission()`). Shows:
- SVG phone-tilt diagram
- Permission prompt + "Use Buttons Instead" fallback

### Screen: Countdown
Black background with halftone dots. Centered:
- Square border ring (yellow stroke)
- Animated count (3→2→1→GO!) with scale-in animation
- Tilt mode indicator (active / button fallback)

### Screen: Game (Landscape) — CORE SCREEN
Three-column layout:

```
┌──────────────┬─────────────────────────────┬──────────────┐
│  [TOPBAR: timer fill + scores + countdown]              │
├──────────────┼─────────────────────────────┼──────────────┤
│              │     [SPEED LINES SVG]        │              │
│  TILT BACK   │  ┌──────────────────────┐   │ TILT FORWARD │
│  ↑ (bobbing) │  │ CELL BIOLOGY pill    │   │ ↓ (bobbing)  │
│              │  │                      │   │              │
│   GOT IT!    │  │   MITOSIS            │   │   PASS!      │
│  (yellow)    │  │   (Bangers 48-64px)  │   │   (red)      │
│              │  └──────────────────────┘   │              │
│  or tap zone │                              │  or tap zone │
└──────────────┴─────────────────────────────┴──────────────┘
```

**Top bar (46px, black):**
- Animated timer fill (yellow → orange → red as time drops)
- Correct count (yellow checkmark + number)
- Passed count (red × + number)
- Countdown digits (Bangers 28px)
- Danger animation: blink when ≤5 seconds

**Left/Right zones:**
- Full-height clickable buttons — entire zone is the tap target (important for landscape play)
- Dotted halftone overlay (yellow / red)
- Bouncing arrow animation (up / down)
- Small label: direction instruction + "or tap this zone"

**Term card:**
- White card, 4px ink border, hard 6px offset shadow
- Category pill (ink bg, white text)
- Term in Bangers `clamp(32px, 5vw, 64px)` — scales with viewport
- Card number (1/12) subtle top-right
- Flash animation on correct (yellow background pulse) or pass (red dim)

**FX Overlay:** Positioned absolute over game-center, fires and fades in 0.55s. Text rotated -8° for manga energy.

### Screen: Summary (Landscape)
**Left panel (300px, black):**
- Letter rank: S / A / B / C / D in Bangers 80px (yellow)
- Rank subtitle (LEGENDARY / EXCELLENT / SOLID / KEEP AT IT / STUDY UP)
- 3-stat grid: Correct (yellow), Passed (red), Hit rate (blue)
- Play Again button

**Right panel (flex-1):**
- Two tabs: STUDY LIST (passed terms) / NAILED IT (correct terms)
- Each term card: left border colour-coded (red = passed, yellow = correct)
- AI-generated definition loads in below the term (shimmer loading state → text)

---

## 4. IB Content Library

30–40 key terms per subject, chosen for:
- High IB exam frequency
- Oral/verbal recognition (short enough to describe in clues)
- Cross-topic depth (not just tier-1 vocab)

### Biology (67 terms)
**Cell Biology:** Cell membrane, Mitosis, Meiosis, Osmosis, Active transport, Endocytosis, Exocytosis, ATP synthesis, Ribosome, Endoplasmic reticulum, Golgi apparatus, Cell wall, Lysosome, Mitochondria, Cell cycle, Apoptosis, Prokaryote, Eukaryote

**Genetics:** Allele, Genotype, Phenotype, Codominance, Epistasis, Crossing over, Hardy-Weinberg, Gene mutation, Transcription, Translation, Codon, Operon, Epigenetics, Gel electrophoresis, PCR, Karyotype, Plasmid

**Ecology:** Trophic level, Biomass pyramid, Ecological succession, Carrying capacity, Keystone species, Eutrophication, Biodiversity index, Symbiosis, Limiting factor, Nutrient cycle, Ecological niche, Biome, Population dynamics, Invasive species, Biomagnification

**Evolution:** Natural selection, Allopatric speciation, Analogous structures, Phylogenetic tree, Genetic drift, Adaptive radiation, Punctuated equilibrium, Vestigial structures, Sexual selection, Founder effect, Bottleneck effect, Gene pool, Cladogram, Convergent evolution

### Chemistry (54 terms)
**Atomic Structure:** Electron configuration, Quantum number, Orbital, Isotope, Mass spectrometry, Ionisation energy, Atomic radius, Electronegativity, Electron affinity, Periodic trend, Aufbau principle, Shielding effect, First ionisation energy

**Bonding:** Covalent bond, Ionic bond, Metallic bonding, Hydrogen bond, Van der Waals forces, Lewis structure, Resonance, Bond polarity, Lattice enthalpy, Molecular geometry, VSEPR theory, Dipole moment, Hybridisation

**Reactions:** Le Chatelier's principle, Activation energy, Rate constant, Buffer solution, Titration endpoint, Standard enthalpy, Gibbs free energy, Hess's law, Equilibrium constant, Arrhenius equation, Collision theory, Redox reaction, Disproportionation

**Organic:** Alkane, Alkene, Benzene, Ester, Aldehyde, Ketone, Carboxylic acid, Markovnikov's rule, Stereoisomers, Nucleophilic substitution, Electrophilic addition, Condensation polymer, Optical isomer, Free radical

### Physics (54 terms)
**Mechanics:** Newton's third law, Conservation of momentum, Torque, Centripetal force, Projectile motion, Simple harmonic motion, Gravitational potential energy, Hooke's law, Terminal velocity, Escape velocity, Impulse, Centre of mass, Elastic collision

**Waves:** Doppler effect, Diffraction, Interference, Polarisation, Standing wave, Superposition, Total internal reflection, Refractive index, Snell's law, Young's double slit, Resonance, Phase difference, Path difference, Coherence

**Electricity:** Ohm's law, Kirchhoff's voltage law, Capacitance, Internal resistance, EMF, Magnetic flux, Faraday's law, Lenz's law, Transformer, AC circuit, Root mean square, Resistivity, Drift velocity

**Modern Physics:** Photoelectric effect, Wave-particle duality, Half-life, Binding energy, Nuclear fission, Nuclear fusion, De Broglie wavelength, Heisenberg uncertainty, Pair production, Radioactive decay, Mass defect, Standard model, Quark

### Mathematics (49 terms)
**Calculus:** Differentiation, Chain rule, Product rule, Integration by parts, L'Hôpital's rule, Taylor series, Implicit differentiation, Riemann sum, Related rates, Differential equation, Fundamental theorem, Maclaurin series, Euler's method

**Statistics:** Standard deviation, Null hypothesis, P-value, Pearson correlation, Regression line, Confidence interval, Chi-squared test, Central limit theorem, Bayes' theorem, Binomial distribution, Normal distribution, Type I error, Unbiased estimator

**Algebra:** Complex number, Matrix multiplication, Determinant, Eigenvalue, Logarithm, Permutation, Combination, Geometric sequence, Proof by induction, De Moivre's theorem, Modulus-argument form, Partial fractions

**Geometry:** Vector cross product, Dot product, Parametric equation, Arc length, Polar coordinates, Curvature, Gradient vector

### History (47 terms)
**WWI:** Schlieffen Plan, Trench warfare, War reparations, Total war, Propaganda, Stalemate, War guilt clause, Armistice, Western Front, Conscription, Attrition, Home front

**WWII:** Appeasement, Blitzkrieg, D-Day, Totalitarianism, Final Solution, Lend-Lease Act, Island hopping, Atlantic Charter, War crimes tribunal

**Cold War:** Marshall Plan, Truman Doctrine, NATO, Berlin Wall, Cuban Missile Crisis, McCarthyism, Détente, Proxy war, Mutual assured destruction, SALT treaties, Arms race, Containment policy, Iron Curtain, Brinksmanship, Glasnost

**Decolonisation:** Apartheid, Non-Aligned Movement, Partition of India, Bandung Conference, Suez Crisis, Neo-colonialism, Pan-Africanism, Civil disobedience, Nationalism

### Economics (40 terms)
**Microeconomics:** Price elasticity, Consumer surplus, Marginal utility, Price discrimination, Natural monopoly, Oligopoly, Nash equilibrium, Market failure, Negative externality, Indifference curve, Marginal cost, Allocative efficiency, Deadweight loss, Monopsony, Moral hazard

**Macroeconomics:** GDP, Inflation rate, Phillips curve, Fiscal policy, Quantitative easing, Multiplier effect, Current account, Exchange rate, Keynesian economics, Supply-side policy, LRAS curve, Output gap, Stagflation, Crowding out, Balance of payments

**International:** Comparative advantage, Terms of trade, Trade deficit, Protectionism, Import tariff, Exchange rate regime, Purchasing power parity, Trade liberalisation, Capital account, Bretton Woods

### Psychology (38 terms)
**Approaches:** Behaviourism, Social learning theory, Cognitive approach, Biological approach, Psychodynamic theory, Operant conditioning, Classical conditioning, Schema theory, Attribution theory, Cognitive dissonance, Locus of control, Self-efficacy

**Research Methods:** Randomised control trial, Longitudinal study, Case study, Demand characteristics, Ecological validity, Reliability, Replication, Double-blind study, Triangulation, Informed consent, Confounding variable, Standardisation, Inter-rater reliability

**Core Topics:** Memory model, Flashbulb memory, Cognitive bias, Confirmation bias, Fundamental attribution error, Bystander effect, Obedience, Conformity, Social facilitation, Groupthink, Stereotype threat, Deindividuation

### English Literature (38 terms)
**Literary Terms:** Metaphor, Allegory, Dramatic irony, Foreshadowing, Denouement, Soliloquy, Pathetic fallacy, Bildungsroman, Epistolary novel, Unreliable narrator, Hamartia, Anagnorisis, Catharsis, In medias res, Ekphrasis

**Movements:** Modernism, Postmodernism, Romanticism, Naturalism, Magical realism, Stream of consciousness, Gothic literature, Victorian realism, Existentialism, Surrealism, Absurdism, Symbolism, Decadence

**Narrative:** Omniscient narrator, Free indirect discourse, Frame narrative, Prolepsis, Analepsis, Diegetic, Metafiction, Polyphony, Defamiliarisation, Close reading

---

## 5. Game Mechanics

### Tilt Detection
```
DeviceOrientation beta angle (phone landscape, face out):
  beta > 118°  →  TILT BACK  →  registerCorrect()
  beta < 18°   →  TILT FORWARD → registerPass()
  1400ms cooldown between registrations (prevents double-fire)
```

iOS 13+ requires `DeviceOrientationEvent.requestPermission()` — shown on permission screen before countdown.

Android and desktop fire tilt from `window.DeviceOrientationEvent` automatically.

Fallback: entire left/right columns are `<button>` elements — large tap targets that work identically on desktop.

### Timer
- Configurable: 30s / 60s / 90s / 120s
- Visual: fills across entire top bar
- Colour transitions: yellow (full) → orange (≤15s) → red (≤5s)
- Audio tick on final 5 seconds
- Card counter auto-ends game if deck runs out before timer

### Scoring
- `score.correct[]` — array of term objects for correct answers
- `score.passed[]` — array for passed terms
- Both preserved for summary and AI definition fetch
- Letter grade: S(≥90%) / A(≥75%) / B(≥60%) / C(≥40%) / D(<40%)

### Audio (Web Audio API — no files needed)
| Event | Sound |
|---|---|
| Correct | C-E-G-C ascending arpeggio (sine wave, 4 notes, 0.55s total) |
| Pass | Descending sawtooth sweep 280→120Hz (0.28s) |
| Tick (last 5s) | 1000Hz square wave blip (0.06s) |
| Countdown | Silent (visual only) |

### Haptics
- Correct: `navigator.vibrate(70)` — single firm pulse
- Pass: `navigator.vibrate([30,40,30])` — double tap pattern

---

## 6. AI Summary (Anthropic API)

After each game, definitions are fetched for:
- All passed terms (every one — these are the study focus)
- Up to 4 correct terms (reinforcement sampling)

**Prompt approach:**
```
"You are an IB examiner. For each term, write one crisp sentence 
definition (max 25 words) for a 17-year-old IB student. Be precise 
and exam-relevant. Return ONLY a JSON array."
```

**Loading state:** Shimmer bars (CSS `opacity` pulse animation) shown while fetching. On success: text replaces shimmers. On failure: "Check your notes for this one."

**Model:** `claude-sonnet-4-20250514`, `max_tokens: 1500`

---

## 7. Teacher Mode

- Text area for bulk paste (one term per line)
- Parsed on "ADD TO DECK" click — deduplicates against existing custom list
- Items shown in scrollable list with remove button
- Custom deck plays as standalone (no subject/topic system — all terms labelled "Custom")
- Deck persists in `S.customTerms` for the session
- Optional future: `localStorage` persistence between sessions

---

## 8. PWA Setup (post-mockup)

### `manifest.json`
```json
{
  "name": "HeadSpace IB Edition",
  "short_name": "HeadSpace",
  "display": "fullscreen",
  "orientation": "landscape",
  "start_url": "/",
  "background_color": "#0A0A0A",
  "theme_color": "#0A0A0A",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Setting `"orientation": "landscape"` in the manifest enforces landscape lock on Android when installed as PWA. iOS relies on the CSS media query overlay.

### `sw.js` (basic service worker)
```javascript
const CACHE = 'headspace-v1';
const ASSETS = ['/', '/index.html', 'https://fonts.googleapis.com/...'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
```

### Registration (in `index.html`)
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

---

## 9. Build Phases

### Phase 1 — Mockup (complete)
- Full interactive HTML prototype
- All screens navigable
- Game logic working with sample deck
- Manga aesthetic applied
- Tilt detection implemented
- Audio implemented

### Phase 2 — Content & Polish
- Expand term library to 50+ per subject
- Add IB Math AA / AI split
- Fine-tune tilt thresholds per device
- Add deck shuffle animation (card flip CSS)
- Teacher mode: add a session PIN option (prevent student access)

### Phase 3 — PWA
- Add `manifest.json` + service worker
- Generate and add app icons (manga-style logo)
- Test installation on iOS Safari and Android Chrome
- Add offline fallback (cached content, no API call)

### Phase 4 — Deployment
- Host on Vercel (single HTML or Next.js wrapper)
- Custom domain: `headspace-ib.com` or school subdomain
- Add Google Analytics (anonymised, GDPR-compliant for EU schools)
- Optional: Anthropic API key handled server-side (proxy endpoint) to protect key

### Phase 5 — Optional Enhancements
- **Multiplayer/class mode:** teacher dashboard showing live class stats
- **Personal progress:** localStorage tracking of weak topics over time
- **Spaced repetition mode:** weight deck towards previously-passed terms
- **Subject-locked teacher PIN:** teachers set a code so students can't sneak into setup
- **QR code share:** teacher generates a QR with a custom deck pre-loaded
- **IB May/November exam mode:** terms weighted by past exam frequency

---

## 10. File Structure (Production)

```
headspace/
├── index.html          # main app (single file or modularised)
├── manifest.json       # PWA manifest
├── sw.js               # service worker
├── /icons
│   ├── icon-192.png
│   ├── icon-512.png
│   └── icon-maskable-512.png
├── /content
│   └── terms.json      # IB term library (JSON export)
└── /api (optional)
    └── definitions.js  # Vercel serverless proxy for Anthropic API key
```

---

## 11. Key Technical Notes

**Landscape enforcement:** CSS `@media (orientation: portrait)` overlay is the primary mechanism. The PWA manifest `orientation: landscape` enforces it on Android home screen installs. iOS does not honour manifest orientation for PWAs — the overlay is essential.

**API key security:** For production, never expose the Anthropic API key client-side. Route through a Vercel serverless function (`/api/definitions`) that holds the key server-side. The client POSTs the term list; the function returns definitions.

**Font loading:** Bangers and Outfit are loaded via Google Fonts. For offline PWA use, subset and self-host both fonts.

**Safari audio:** Web Audio requires a user gesture before `AudioContext` can be created. The game start button serves as this gesture — no extra prompts needed.

**DeviceOrientation on HTTPS:** The `deviceorientation` event only fires on secure origins (HTTPS). localhost works for development. Deployment must use HTTPS.
