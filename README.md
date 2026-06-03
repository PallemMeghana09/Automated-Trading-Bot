Automated Trading Bot

A professional real-time trading station, terminal, and sandbox environment featuring automated algorithmic execution strategies, standard backtesting simulations, risk control alerts, and server-side AI-powered market sentiment analysis.

---

## 🎨 Visual Preview & Design Philosophy
Remix is packaged with a custom **Sophisticated Dark** visual terminal designed with maximum color contrast, lightweight indicators, and structured grid panels. Every tab provides distinct density, perfect desktop responsiveness, and fluid interaction designed for high-frequency workflows.

---

## 🚀 Core Features
- **📊 Interactive Live Charting Terminal:** Real-time ticker simulations with Brownian drift volatility updates. Visualize stock histories with customized overlays (moving averages, bands, technical indicators).
- **📝 Backtesting Engine:** Validate trading script parameters against historical ranges, evaluating profitability metrics such as win-rate, total yield, drawdowns, and Sharpe ratios.
- **⚙️ Automated Strategies Manager:** Deploy system algorithms (SMA Cross, RSI Overbought/Oversold, Mean Reversion) or customize triggers. Establish dynamic active price alarm alerts connected to notifications.
- **📂 Live Portfolio & Ledger:** Track open positions, current asset distribution, cash/margin balances, and chronological trade orders inside a local paper trading sandbox.
- **🧠 Server-side Gemini AI Companion:** Leverage advanced Google GenAI algorithms. Analyze tickers for predictive suggestions, read market sentiment, synthesize custom automated strategy configurations, or chat directly with a professional quantitative advisor.
- **📰 Real-Time Sentiment News Panel:** Read mock/real RSS headlines sorted by relevance, with visual markers highlighting bullish, bearish, or neutral sentiment.

---

## 🛠️ Technological Architecture
The application layout is built from the ground up targeting speed, reliability, and security of keys:

- **Frontend Environment (Single-Page App):**
  - **Framework:** React 19 + TypeScript
  - **Bundler:** Vite 6 with disabled HMR monitoring (optimized for Cloud Run scaling)
  - **Styling:** Tailwind CSS v4.0 (Custom high-contrast theme)
  - **Animations:** Fluid transitions powered by `motion`
  - **Data Visualizations:** Dynamic responsive line/area charts utilizing `recharts`
  - **Iconography:** Clean SVG set from `lucide-react`

- **Backend Environment (Proxy Core):**
  - **Framework:** Express 4 server configured on Port 3000
  - **AI Integrations:** Modern server-side `@google/genai` TypeScript SDK (protecting proprietary Gemini credentials)
  - **Compilation:** `esbuild` bundles server logic into a self-contained CJS bundle under `/dist/server.cjs` for immediate high-density serving.

---

## 📁 System Code Directory Layout
```text
/
├── server.ts                       # Backend entry point - Express core & AI router
├── vite.config.ts                  # Vite build settings & dev server configurations
├── metadata.json                   # Applet permissions & capabilities descriptor
├── package.json                    # Configuration & packages manifest
├── src/
│   ├── main.tsx                    # React client-side mount point
│   ├── App.tsx                     # Main navigation layout & core logic provider
│   ├── index.css                   # Tailwind import, fonts & dark theme declarations
│   ├── mockData.ts                 # Hardcoded initial tickers, strategies & signals
│   ├── types.ts                    # Global shared TypeScript schemas
│   ├── components/
│   │   ├── TerminalChart.tsx       # Live interactive chart with indicator overlays
│   │   ├── BacktestPanel.tsx       # Historical simulation controls & stats card
│   │   ├── StrategiesPanel.tsx     # Active alarms & robotic engine configs
│   │   ├── PortfolioPanel.tsx       # Interactive ledger & positions tracker
│   │   ├── NewsPanel.tsx           # Sentiment-graded financial feeds
│   │   ├── AIChatPanel.tsx         # Google GenAI prompt interface
│   │   └── SettingsPanel.tsx       # Standard terminal parameters
│   └── utils/
│       └── indicators.ts           # Math functions (SMA, EMA, RSI bounds)
```

---

## ⚙️ Getting Started

### 1. Prerequisites & Environment
Ensure you have the latest LTS version of Node.js installed. Create a `.env` file in the root directory by renaming or copying from the example:
```bash
cp .env.example .env
```
Ensure to assign your personal Google Gemini credentials:
```env
GEMINI_API_KEY="your-google-gemini-key-placeholder"
```

### 2. Dependency Installation
Install the project packages using npm:
```bash
npm install
```

### 3. Running in Development Mode
Execute standard tsx-driven fast development proxy hot-serving standard:
```bash
npm run dev
```
The terminal console is served on [http://localhost:3000](http://localhost:3000).

### 4. Compiling the Production Build
Generate optimized client-side static artifacts and single unified server-safe package files:
```bash
npm run build
```

This starts a double-compiled process with the following outcomes:
- Compiles the frontend assets to static files in the `/dist` directory.
- Bundles the TypeScript backend using `esbuild` to produce a unified, clean, standalone `dist/server.cjs` file.

### 5. Launching Production Service
To start the production web application, run:
```bash
npm run start
```

---

## 🔒 Security & Safety Controls
- **Zero Real Liquidity Risk:** Remix operates *purely as a demo trading simulator*. No real monetary or cryptocurrency assets can be connected, accessed, or liquidated inside the terminal.
- **Server-Side Key Isolation:** Real-time AI processing never exposes private API keys to the client browser. All authentication keys are managed safely inside server environments.
