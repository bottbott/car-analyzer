# Vehicle TCO Analyzer

Compare the **total cost of ownership** of new and used vehicles — depreciation, insurance, maintenance, energy, financing interest, taxes, and fees — with interactive charts and tables.

All data stays in your browser (`localStorage`). Export/import JSON to back up scenarios.

## Quick start

```bash
pnpm install
pnpm dev
```

Open the URL Vite prints (usually http://localhost:5173/car-analyzer/).

```bash
pnpm test      # cost-engine unit tests
pnpm build    # production build
pnpm preview  # serve the build
```

## GitHub Pages

Pushes to `main` build and deploy automatically via GitHub Actions.

Live site: https://bottbott.github.io/car-analyzer/

In the repo settings, set **Pages → Source** to **GitHub Actions** (one-time).

## Stack

- pnpm · TypeScript · Vite · React 19
- Tailwind CSS 4 · Recharts · Zustand · Zod · Vitest

## How the model works

Each vehicle is projected year-by-year over a global ownership horizon.

**Economic TCO** (primary):

```
annual = depreciation + insurance + routine + repairs + energy
       + loan interest + registration + property tax
       + (year 1: sales tax + doc/title fees)
```

Depreciation follows a retained-value curve anchored so a used car’s value at purchase age equals its purchase price. That makes new vs used comparable: older cars sit further down the curve and typically lose less per year.

**Cash-flow TCO** equals cumulative cash out minus end equity (resale − remaining loan). The engine tests assert these two views reconcile.

Other notes:

- Insurance declines annually toward a floor premium.
- Repairs are suppressed while under warranty (years and kilometres).
- Energy supports gas/hybrid (L/100km) and electric (km/kWh) with price escalation.
- Financing uses standard amortization; only interest is an economic cost.
- Optional discount rate converts costs to present value.

## Using the app

1. Adjust **global assumptions** (horizon, kilometres, fuel/electricity prices).
2. Edit vehicles in the garage, or add from a **segment preset** (compact, sedan, SUV, truck, EV, luxury).
3. Compare cumulative TCO, cost breakdown, resale vs loan, and annual stacks.
4. Sort the summary table and export CSV; export/import the full garage as JSON.

Sample vehicles load on first visit. **Reset samples** restores them and default assumptions.
