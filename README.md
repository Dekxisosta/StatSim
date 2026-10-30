# StatSim (React + Vite)

    npm install
    npm run dev      -> http://localhost:5173
    npm run build    -> dist/

- `src/App.jsx` is the main app component (state, handlers, layout); everything else lives in focused modules:
  - `src/game/` pure game logic, no React: `defaults` (new sim + normalising old saves), `economy` (gain, multipliers, currency), `pets`, `gacha` (pity), `craft`, `stats`, `tick`, `constants`
  - `src/io/saveFile.js` save/backup file parsing and download
  - `src/hooks/` `useMusic` (Jamendo player), `useTablet`
  - `src/utils/` number formatting, image resizing, small helpers
  - `src/components/` UI by area: `ui/` (buttons, inputs, modal, pager), `header/` (currency pills, tab names), `cards/` (shop, powerup, weather, pets, quests), `modals/` (data, music, craft, presets), `effects/` (intro, weather, confetti), `StatsChart`
- Favicon: `public/favicon.ico`, linked in `index.html`
- Fonts (Lilita One, with Fredoka One / Fredoka as fallback) are bundled via @fontsource, so no internet or Google link is needed
- Rebirth and Quests open as modals from the buttons under RUN SIMULATOR (badge on Quests when a quest is ready)
- Save State / Load State export and import the current simulator as a .json file
- Background music: Jamendo API (Creative Commons). Click the music button in the top bar. Get a free client ID at https://devportal.jamendo.com and either paste it in the Music window or put it in `.env` as `VITE_JAMENDO_CLIENT_ID` (see `.env.example`). Music keeps playing when the window is closed. Settings (mood, volume, filters, client ID) are saved separately from game saves.
- Import / Export: "Load State" opens the Import / Export window. Export the current simulator or everything (all simulators, logo, animation setting). Import accepts a single save, a backup, a bare simulator, a list of simulators, or a raw localStorage blob; files are validated, cleaned (bad numbers, missing ids, broken items) and previewed before you choose Replace, Add as new tab(s), or Replace everything.
- Timing: simulator time and auto-adds are driven by real elapsed time through a pure state update, so they stay exact under React StrictMode.
- Intro: on page load a short CSS-only intro plays (logo, title, loading bar, curtains open). Click or press any key to skip. It is turned off automatically for people who prefer reduced motion, and can be switched off in Settings (stored under `statsim:intro`). It is plain CSS keyframes on purpose, so it still plays when the in-app Animations setting is OFF.
- Presets: the 🎁 Presets button next to the tabs lists every `.json` file in `src/presets/` and adds the chosen one as a new tab. Files are discovered at build time (`import.meta.glob`), so a new preset is just a new file: save a simulator with Save State, drop the file in `src/presets/` and restart/rebuild. Optional metadata for the card (ignored by the normal importer):

        "preset": { "title": "My Sim", "emoji": "🎮", "blurb": "One line description", "order": 6 }

  Included: Pet Sim, Pokemon, Arcaea, Vocaloid, Grow a Garden. The four themed ones reuse the Pet Sim economy curve (resampled per theme, with a small cost-pacing factor) and have not been play-tested end to end.
- Shop: tick **Auto-equip best purchase** (per simulator, on by default) and every purchase equips the owned item with the biggest boost. Ticking it also equips the best owned item right away.
- Section titles (Shop, Powerups, Multipliers, Weather Effects, Pets) are text fields: click one and type. They are saved with the simulator (`titles` in the save file). Clearing a title restores the default.
- Currencies: click a currency pill in the top bar to rename it, change its icon, or **Add / Take / Set** its value (plus quick +10 / +100 / +1K / +1M). These fields are no longer in Settings.
- Settings holds the logo, animation and intro toggles, and the Made-by plug.
- Crafting (the hammer button under Rebirth, or in the Pets section): merge pets of the same kind into the next size. Using the minimum number of pets gives a chance (default 2 pets = 66%); the chance climbs evenly to 100% at the guaranteed number (default 3 pets). A failed craft uses the pets up. Crafted pets keep their own stack (e.g. "Big Cat") and boost = base boost x the size's multiplier.
  Default sizes: Big (x4, 2 pets @66%, 3 sure), Huge (x16, 3 @50%, 5 sure), Giant (x64, 4 @40%, 8 sure). Open **Recipes** in the Crafting window (while stopped) to rename sizes, change the multiplier, minimum, chance and guaranteed count, or add / remove sizes. Saved as `craft.tiers`; inventory entries carry a `tier` number (missing = 0, so old saves still load). Quests can track "Pets crafted (attempts)" and Statistics shows crafts attempted / succeeded.
- Simulator tabs can be dragged left or right to reorder them (the order is saved). Double-click a tab to rename it; the name field is read-only otherwise so dragging doesn't fight with text selection.
- Statistics window: a log-scale graph of the best possible currency per addition if every upgrade were bought (best shop item, all multipliers, all powerups, strongest weather, best pets at max slots, current rebirth bonus), next to what you get now. It recalculates automatically from the simulator's setup; a checkbox includes or ignores the biggest crafted pet size, and with several simulators it lists each one's maximum.
