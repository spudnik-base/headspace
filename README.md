# HeadSpace · IB Manga Edition

Landscape heads-up-style revision game for IB Diploma students. Pick a
subject, hold the phone to your forehead with the screen facing out, and
let your team shout clues. Tilt back for "got it", tilt forward for
"pass". Ends with a ranked scoreboard and AI-generated one-sentence
definitions for the terms you saw.

See `docs/headspace-build.md` for the design spec.

## Stack

- Static `index.html` (no build step), served at the site root.
- One Vercel serverless function: `api/define.js` proxies Anthropic so
  the API key never ships to the client.
- Model: `claude-haiku-4-5` with prompt caching on the system prompt.
- PWA: manifest + service worker, fullscreen and landscape-locked on
  Android installs.

## Repository layout

```
.
|- index.html                root-served single-page app
|- api/define.js             Vercel serverless proxy
|- icons/                    SVG source + PNG variants (192/512/maskable/apple-touch/favicon)
|- scripts/generate-icons.mjs  regenerates PNGs from SVG (npm run icons)
|- manifest.json             PWA manifest
|- sw.js                     service worker (versioned cache, offline fallback)
|- vercel.json               clean URLs + security headers + sw.js no-cache
|- docs/headspace-build.md   original design spec
|- package.json              Node 20+, sharp as a dev dep for icon gen
```

## Local development

```bash
npm install           # only needed to regenerate icons
npx vercel dev        # runs index.html + api/define.js locally on :3000
```

`vercel dev` auto-loads `.env` from the project root if present.

```bash
cp .env.example .env
# open .env and paste your real key
```

**Never commit `.env`.** It is listed in `.gitignore`.

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel: `New Project` -> import the repo. Framework preset:
   `Other`. Leave build/output settings empty (Vercel auto-detects
   static + `api/`).
3. Project Settings -> Environment Variables. Add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your Anthropic key (starts with `sk-ant-`).
   - Environments: Production, Preview, Development.
4. Deploy. The function is live at `/api/define`.

### Adding it to cramly.study as a subpath

On whatever hosts `cramly.study`, add a rewrite:

```
/headspace        -> <this-vercel-deployment>/
/headspace/:path* -> <this-vercel-deployment>/:path*
```

If cramly.study is on Vercel too, use a `rewrites` block in the parent
project's `vercel.json`. If it's on another host, use that host's
redirect/rewrite feature, or fall back to a subdomain
(`headspace.cramly.study`) which is simpler.

## Regenerating icons

Edit `icons/icon.svg` and/or `icons/icon-maskable.svg`, then:

```bash
npm run icons
```

Outputs `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`,
`apple-touch-icon.png`, `favicon-32.png`.

## Security notes

- `ANTHROPIC_API_KEY` lives only in Vercel env vars, never in the repo.
  The public repo is safe because no secret value is committed.
- If a key is ever committed by mistake, rotate it at
  [console.anthropic.com](https://console.anthropic.com) immediately.
- The proxy caps each request to 40 terms, 80 chars per term, strips
  em dashes from model output, and returns no-store cache headers.

## Gameplay notes

- Tilt is calibrated during the countdown: beta samples are collected
  for 3s, the middle 60% averaged, and thresholds set at rest +/-40 deg.
  If the player prefers to tap, the on-screen zones work identically.
- Teacher mode is PIN-gated. First open prompts create-then-confirm;
  later opens require the PIN. Stored in `localStorage` under
  `hs.teacherPin`. The "Forgot PIN?" link clears it after confirmation.

## License

Private project. No license granted.
