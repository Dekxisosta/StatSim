# StatSim

A tycoon simulator of numerical values. Build up currency, buy upgrades, hatch and craft pets, rebirth for permanent bonuses, and watch the numbers climb. Run several simulators at once in draggable tabs.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?logo=framer&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES_Modules-F7DF1E?logo=javascript&logoColor=black)
![Last commit](https://img.shields.io/github/last-commit/Dekxisosta/statsim)
![Repo size](https://img.shields.io/github/repo-size/Dekxisosta/statsim)

## Quick start

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build locally
```

## Features

- **Multiple simulators** in tabs. Drag to reorder (order is saved), double-click to rename.
- **Sticky layout.** The navbar and tabs stay pinned while scrolling, and on desktop the run panel stays in view beside the content.
- **Economy.** Shop items, multiplier groups, powerups, weather effects, rebirth, and quests.
- **Pets.** Egg hatching with a pity system, an equip limit, and crafting into bigger sizes.
- **Statistics.** Live totals plus a log-scale graph of the best possible gain per addition.
- **Presets.** Ready-made simulators you can add as a new tab in one click.
- **Save and load.** Export and import single simulators or full backups, with validation.
- **Background music** from Jamendo (Creative Commons).
- **Effects.** CSS intro, weather overlays, and confetti on rare pulls and successful crafts.

## How it plays

### Running a simulator

Press **RUN SIMULATOR** to start. Time and auto-adds are driven by real elapsed time through a pure state update, so they stay exact under React StrictMode. Use **Add Now** for manual additions and **Auto** to toggle automatic ones. Shop purchases, hatching and crafting only work while the simulator is running; editing is only possible while it is stopped.

### Shop, multipliers and powerups

- Shop items are one-time purchases. Tick **Auto-equip best purchase** (per simulator, on by default) and every purchase equips the owned item with the biggest boost. Ticking it also equips the best owned item right away.
- Section titles (Shop, Powerups, Multipliers, Weather Effects, Pets) are editable text fields, saved with the simulator. Clearing a title restores the default.

### Currencies

Click a currency pill in the top bar to rename it, change its icon, or **Add / Take / Set** its value (with quick +10, +100, +1K and +1M buttons).

### Rebirth and quests

Rebirth and Quests open as modals from the buttons under RUN SIMULATOR. A badge on Quests shows how many rewards are ready to claim. Quests can track metrics such as pets crafted (attempts).

### Pets and hatching

Eggs are probability distributions over their pets. Missing a rare builds pity along a sigmoid curve until one drops. Equipped pets add their boost to every addition. Confetti plays on a rare pull.

### Crafting

Open Crafting from the hammer button under Rebirth, or from the Pets section. Merge pets of the same kind into the next size:

- Using the minimum number of pets gives a chance (default: 2 pets at 66%).
- The chance climbs evenly to 100% at the guaranteed count (default: 3 pets).
- A failed craft uses the pets up. A success plays confetti.
- Crafted pets keep their own stack (for example "Big Cat") and their boost is the base boost times the size multiplier.

| Size  | Multiplier | Minimum pets | Chance at minimum | Guaranteed at |
| ----- | ---------- | ------------ | ----------------- | ------------- |
| Big   | x4         | 2            | 66%               | 3             |
| Huge  | x16        | 3            | 50%               | 5             |
| Giant | x64        | 4            | 40%               | 8             |

Open **Recipes** in the Crafting window (while stopped) to rename sizes, change the multiplier, minimum, chance and guaranteed count, or add and remove sizes. Sizes are saved as `craft.tiers`, and inventory entries carry a `tier` number (missing means 0, so old saves still load).

### Statistics

The Statistics window shows a log-scale graph of the best possible currency per addition if every upgrade were bought: best shop item, all multipliers, all powerups, strongest weather, best pets at max slots, and your current rebirth bonus, next to what you get now. It recalculates automatically from the simulator setup. A checkbox includes or ignores the biggest crafted pet size, and with several simulators it lists each one's maximum. Statistics also tracks crafts attempted and succeeded.

## Save files and import / export

- **Save State** exports the current simulator as a `.json` file.
- **Load State** opens the Import / Export window. Export the current simulator or everything (all simulators, logo, animation setting).
- Import accepts a single save, a backup, a bare simulator, a list of simulators, or a raw localStorage blob. Files are validated, cleaned (bad numbers, missing ids, broken items) and previewed before you choose **Replace**, **Add as new tab(s)**, or **Replace everything**.

## Presets

The **Presets** button next to the tabs lists every `.json` file in `src/presets/` and adds the chosen one as a new tab. Files are discovered at build time (`import.meta.glob`), so adding a preset is just adding a file:

1. Build a simulator and use **Save State**.
2. Drop the file in `src/presets/`.
3. Restart the dev server or rebuild.

Optional metadata for the preset card (ignored by the normal importer):

```json
"preset": { "title": "My Sim", "emoji": "<one emoji or an image URL>", "blurb": "One line description", "order": 6 }
```

Included presets: Pet Sim, Pokemon, Arcaea, Vocaloid, Grow a Garden. The four themed ones reuse the Pet Sim economy curve (resampled per theme, with a small cost-pacing factor) and have not been play-tested end to end.

## Background music

Music uses the [Jamendo API](https://devportal.jamendo.com) (Creative Commons). Click the music button in the top bar.

1. Get a free client ID from the Jamendo developer portal.
2. Either paste it in the Music window, or set it at build time in `.env`:

   ```bash
   VITE_JAMENDO_CLIENT_ID=your_client_id
   ```

   See `.env.example`.

Music keeps playing when the window is closed. Settings (mood, volume, filters, client ID) are saved separately from game saves.

## Settings and intro

Settings holds the logo, the animation and intro toggles, and the Made-by plug.

On page load a short CSS-only intro plays (logo, title, loading bar, curtains open). Click or press any key to skip. It is turned off automatically for people who prefer reduced motion, and can be switched off in Settings (stored under `statsim:intro`). It is plain CSS keyframes on purpose, so it still plays when the in-app Animations setting is off. Confetti is built the same way.

## Project structure

```
src/
  App.jsx             main component: state, handlers, layout
  main.jsx            entry point
  index.css           all styles
  game/               pure game logic, no React
    defaults.js         new simulator + normalising old saves
    economy.js          gain, multipliers, currency
    pets.js  gacha.js  craft.js  stats.js  tick.js  constants.js
  io/saveFile.js      save/backup parsing and download
  hooks/              useMusic (Jamendo player), useTablet
  utils/              number formatting, image resizing, helpers
  components/
    ui/                 buttons, inputs, modal, pager
    header/             currency pills, tab names
    cards/              shop, powerup, weather, pets, quests
    modals/             data, music, craft, presets
    effects/            intro, weather, confetti
    StatsChart.jsx
  presets/            ready-made simulators (*.json)
public/favicon.ico    linked in index.html
```

Fonts (Lilita One, with Fredoka One and Fredoka as fallback) are bundled through `@fontsource`, so no internet connection or Google Fonts link is needed.
