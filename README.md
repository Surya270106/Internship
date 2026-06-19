# Spearmint Finds — AI Product Recommender

A minimal, modern React + Vite application that recommends products from a local catalog based on natural-language preferences using an OpenAI-compatible API.

Built for the **Spearmint Technologies** internship assessment (Task 1).

---

## Features at a Glance

- 🧠 **AI-Powered Matching**: Understands natural language, not just keywords.
- 🎯 **Confidence Scores**: Shows exact match percentage (e.g. 94% Match).
- 💬 **Smart Explanations**: Tells you exactly *why* products were recommended.
- ⚡ **Skeleton Loaders**: Smooth UI transitions without layout shifts.
- 💡 **Suggestion Pills**: Helpful prompts to get you started instantly.
- 🛡️ **Serverless Security**: Vercel API proxy keeps keys out of the browser.
- 🌙 **Dark Mode**: System-aware aesthetic switching.
- 🌊 **Framer Motion**: Fluid, Apple-inspired micro-animations.

---

## How It Works

1. **User types preference**: Enter a query like "Gaming laptop with great thermals" (or click a suggestion pill).
2. **AI matches catalog**: The secure serverless proxy queries the AI model, mapping your intent to our 18-product catalog.
3. **Recommendations highlighted**: The AI returns a JSON array of matched IDs, confidence scores, and an explanation. The UI highlights these cards, sorts them to the top, and displays the exact reason they fit your needs.

---

## Screenshots

> See `/public/images/` for screenshots of the UI, including dark mode, skeleton loaders, and AI recommendation panels.

---

## Live Demo

> Deployed at: [your-project.vercel.app](https://your-project.vercel.app)  
> _(Update this URL after deploying)_

---

## Quick Start

```bash
# Install dependencies
npm install

# Configure your API key
cp .env.example .env
# Edit .env and add your VITE_AI_API_KEY

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Other Commands

```bash
npm run build      # Production build → dist/
npm run preview    # Preview the production build
npm run lint       # Run ESLint
```

---

## Deploying to Vercel

### Option 1: Via Vercel Dashboard (Recommended)

1. Push this project to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository
3. In the **Environment Variables** section, add:
   - `AI_API_KEY` — your OpenAI API key (server-side, not prefixed with VITE_)
   - `AI_BASE_URL` — _(optional)_ defaults to `https://api.openai.com/v1`
   - `AI_MODEL` — _(optional)_ defaults to `gpt-4o-mini`
4. Click **Deploy**

### Option 2: Via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
# When prompted, add environment variables in the Vercel dashboard
```

### How It Works on Vercel

- The `api/recommend.js` serverless function handles AI requests server-side
- The API key (`AI_API_KEY`) is stored in Vercel environment variables — it never reaches the browser
- The frontend automatically detects that no `VITE_AI_API_KEY` is set and routes requests through `/api/recommend`
- Locally with `VITE_AI_API_KEY` set, the app calls the AI API directly for faster iteration

---

## Configuring the AI API

| Variable | Scope | Purpose | Default |
|----------|-------|---------|---------|
| `VITE_AI_API_KEY` | Client (local dev) | API key for direct browser calls | — |
| `VITE_AI_BASE_URL` | Client | OpenAI-compatible base URL | `https://api.openai.com/v1` |
| `VITE_AI_MODEL` | Client | Model name | `gpt-4o-mini` |
| `AI_API_KEY` | Server (Vercel) | API key used by serverless function | — |
| `AI_BASE_URL` | Server (Vercel) | Base URL for serverless function | `https://api.openai.com/v1` |
| `AI_MODEL` | Server (Vercel) | Model for serverless function | `gpt-4o-mini` |

The code speaks the standard `/chat/completions` schema, so you can point it at **any OpenAI-compatible provider** (Groq, OpenRouter, Ollama, etc.) by changing the base URL and model — no code changes needed.

---

## Architecture

```
├── api/
│   └── recommend.js            # Vercel serverless function (secure AI proxy)
├── src/
│   ├── data/
│   │   └── products.js         # Static product catalog (18 products, 6 categories)
│   ├── services/
│   │   └── aiClient.js         # AI abstraction — dual-path (proxy / direct)
│   ├── hooks/
│   │   └── useRecommendations.js  # React state for AI flow
│   ├── components/
│   │   ├── PreferenceInput.jsx    # Search bar + example chips
│   │   ├── RecommendationPanel.jsx # Loading / error / success messaging
│   │   ├── FilterBar.jsx          # Category filter + sort
│   │   ├── ProductGrid.jsx        # Product catalog grid
│   │   ├── ProductCard.jsx        # Single product card
│   │   ├── ProductModal.jsx       # Product detail overlay
│   │   ├── ShareButton.jsx        # Copy recommendations
│   │   ├── HistoryList.jsx        # Recent searches sidebar
│   │   └── DarkModeToggle.jsx     # Theme toggle
│   ├── utils/
│   │   └── format.js             # Formatting helpers
│   ├── App.jsx                    # Root component
│   ├── App.css                    # Component styles
│   ├── index.css                  # Design tokens + reset
│   └── main.jsx                   # Entry point
├── vercel.json                    # Vercel deployment config
└── .env.example                   # Environment variable template
```

### Key Design Decisions

**Dual-path AI routing.** Locally, the app calls OpenAI directly from the browser (no backend needed). On Vercel, it routes through `/api/recommend` which holds the API key server-side. The switch is automatic — if `VITE_AI_API_KEY` is unset, use the proxy.

**Defense-in-depth for catalog-only recommendations.** The prompt constrains the model to the catalog, the response format uses numeric IDs (not names), and `normalizeRecommendation()` filters returned IDs against the real catalog before they reach the UI.

**Framer Motion for animations.** Staggered card entrances, AnimatePresence for filter transitions, layout animation on filter chips, smooth modal enter/exit. All animations respect `prefers-reduced-motion`.

**Minimal design language.** Inter + Instrument Serif type pairing, warm neutral palette, no gradients or glowing effects. Accent color (amber) used sparingly for recommended badges only.

---

## Features

**Core Requirements**
- React functional components + hooks, built with Vite
- 18 products across 6 categories in a local catalog
- Natural-language search via OpenAI-compatible API
- Structured JSON responses, validated against the catalog
- Loading, error, and empty states
- Clean API abstraction with async/await

**Bonus Features**
- Category filter chips
- Sort by price and rating
- AI-recommended cards highlighted and sorted to top
- "Try example" prompt chips
- Product detail modal (click any card)
- Copy/share recommendations
- Recommendation history sidebar
- Dark mode with system preference detection
- Framer Motion animations throughout
- Vercel serverless proxy for API key security
- Image skeleton loading with shimmer effect

---

## Tech Stack

- **React 18** — functional components, hooks
- **Vite 5** — fast dev server, optimized builds
- **Framer Motion** — production-quality animations
- **Vanilla CSS** — custom properties, no utility framework
- **Vercel** — deployment + serverless functions

Zero unnecessary dependencies. Only `react`, `react-dom`, and `framer-motion` at runtime.
