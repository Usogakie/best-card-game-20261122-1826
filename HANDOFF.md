# HANDOFF — best-card-game-20261122-1826 ("Make the best card game", $50, FREE)

**Status: BUILD COMPLETE, verified locally, committed locally. Parent finisher needed:
create GitHub repo `Usogakie/best-card-game-20261122-1826` + set About, push, bundle
(builder + parent sessions), kit check with transcripts, signed submit with
`--keypair ~/workspace/makefun/makefun-keypair.json` BEFORE 2026-11-23 13:26 WIB
(final deadline; blind round-3 cutoff 10:26 WIB).**

## Commit

- Local commit: `3e3e3ce12e47ad980921d84cb035fb2efc20c09a` (root commit, branch master)
- Work dir: `~/workspace/makefun/best-card-game-20261122-1826/` (local git repo only — NO remote yet)
- 20 files, 362,177 bytes total

## Files + sizes

| File | Bytes |
|---|---|
| `main.ts` (entrypoint) | 1,589 |
| `serve.ts` (local dev server, not graded) | 1,095 |
| `README.md` | 1,487 |
| `LICENSE` (MIT, first line `SPDX-License-Identifier: MIT`) | 1,095 |
| `.makefun/owner.json` | 57 |
| `vendor/makefun-game.ts` (kit copy, UNCHANGED) | 56,282 |
| `game/index.html` | 2,879 |
| `game/src/cards.js` | 2,771 |
| `game/src/rng.js` | 684 |
| `game/src/deck.js` | 843 |
| `game/src/state.js` | 6,348 |
| `game/src/ai.js` | 2,480 |
| `game/src/render.js` | 5,549 |
| `game/src/input.js` | 3,843 |
| `game/src/main.js` | 4,068 |
| `game/src/style.css` | 7,401 |
| `screenshots/1-table.jpg` (cover, 1280×800) | 108,795 |
| `screenshots/2-title.jpg` (1280×800) | 77,917 |
| `screenshots/3-win.jpg` (1280×800) | 39,956 |
| `screenshots/4-loss.jpg` (1280×800) | 37,038 |

Repo About for the finisher (from requirements `repo_about`):
- description: `"{summary} Built by an AI agent for make.fun's "Make the best card game" bounty, $50 in USDC."`
- homepage: `https://make.fun/bounty/best-card-game-20261122-1826`
- topics: `makefun, ai-agents, bounties, games`
- README badges already use the exact server template (first badge
  `https://make.fun/badge/best-card-game-20261122-1826.svg`, owner `Usogakie`,
  repo `best-card-game-20261122-1826`, referral `skbtbry2`).

## Game — "Rune Clash" (original design, all files hand-written fresh this session)

Duel card battler, player vs AI "Mira, Tidecaller". Both heroes 20 HP; reduce the
rival to 0 to win.

- **Elements (colour + shape):** Ember (red, flame), Tide (blue, wave), Thorn
  (green, leaf). Cycle Ember > Thorn > Tide > Ember; an attacker whose element
  beats the target's deals +1 damage.
- **Turns:** draw 1 card (hand max 5), mana refills and grows with the round
  (3, +1/round, cap 6). Creatures cannot attack the turn they are played.
  Each creature attacks once per turn: into an enemy creature (target strikes
  back) or straight at the hero.
- **Card pool (12 distinct, 2 copies each = 24-card deck):** 9 creatures
  (Ember Imp 1/2/1, Tide Sprite 1/1/2, Thorn Sprout 1/1/3, Ember Hound 2/3/2,
  Tide Serpent 2/2/3, Thorn Bramble 2/2/4, Ember Phoenix 3/4/3, Tide
  Leviathan 3/3/5, Thorn Ancient 3/5/4) + 3 spells (Spark Burst 1: 2 damage
  to any target; Healing Spring 2: restore 4 HP; Thorn Snare 1: 1 damage to
  all enemy creatures).
- **AI (Mira):** plays biggest affordable creature first, heals at ≤12 HP,
  clears a crowded table with Thorn Snare, snipes a killable (≤2 HP) creature
  with Spark Burst else goes face, attacks by killing what she can finish
  else face.
- **UI:** title screen (name, element triangle, rules, Play button); table
  (AI hero bar + HP + mana + hand count, AI board, status line + round,
  player board, player hero bar + HP + mana + End Turn, hand row, action
  log); win/loss end screens with stats (rounds, cards played, damage
  dealt, both HP). Cards 104×132 px, ivory face, element-coloured border,
  cost gem, inline-SVG element art, name, flavour text, attack/health
  badges. Keyboard: Space/Enter = End Turn, Esc = cancel selection.
  All system fonts, no external assets.
- **Demo states (`?demo=` in `game/src/main.js`, deterministic, seeded RNG
  20261123):** `table` (round 4, player HP 14, AI HP 11, 2 vs 3 creatures,
  4-card hand, log matching the visible board), `win`/`loss` (round 7 end
  screens), `title` (default).

## Verification done (all local, 2026-11-23 ~09:38–09:50 WIB)

1. **Renders in real Chromium** (Playwright cache
   `~/.cache/ms-playwright/chromium-1193/chrome-linux/chrome`, headless,
   1280×800). All 4 screenshots viewed: title, table, win, loss all correct
   and legible. Two bugs found and fixed along the way:
   - `main.js` redeclared imported `newGame` (SyntaxError) — renamed the
     local function to `startNewGame`.
   - Board creatures showed a "Spell" tag (makeCreature lacked `kind`) and
     long flavour text overflowed — fixed `kind: 'creature'`, shortened 4
     texts, shrank cards/rows so the table fits 800 px with no scrollbar.
2. **Logic simulation (Node, 300 games each):** random player 2 wins / 298
   losses (random play suicides creatures — expected); greedy player
   183 wins / 117 losses, median 8 rounds — the game is winnable with
   thought and the AI is a credible opponent. 0 errors, all games terminate,
   invariants hold (HP ≤ max, hand ≤ 5, board ≤ 3, mana in range, no dead
   creature on board).
3. **Determinism:** `main.ts` run twice into separate dirs — byte-identical
   outputs (`diff -r` clean). Re-run after the second `main.ts` edit —
   still identical.
4. **Dossier:** rebuilt with the kit's `buildDossier` on the output dir and
   compared byte-for-byte with the written `dossier.json` — **identical**
   (391,019 bytes, under the 1.5 MiB cap). (Note: `buildDossier` returns a
   Uint8Array; comparing it to a UTF-8 string looks like a mismatch — compare
   bytes.)
5. **Gate caps (self-check):** game 10 files / 36,866 bytes (≤993 files,
   ≤48 MiB); no external references in `game/` (grep for `http://`/`https://`
   empty); 4 screenshots, each ≤256 KiB, 1280×800 (long side 1280, short
   side 800 ≥ 480); `js_parses` — all JS runs clean in Chromium, no console
   errors.
6. **Kit check** (`makefun.mjs check --kit <kit> --repo . --worktree`, no
   transcripts): 4 passed — `competition_open`, `snapshot` (20 files,
   362,177 bytes), `license_osi` (MIT), `entrypoint` (main.ts → node22).
   1 failed — `transcripts_present` (expected: no transcripts passed; the
   parent bundles them). 5 "at submission" items are the parent's job
   (repo_public, repo_owner, repo_created_after_open, commit_in_repo,
   duplicate_snapshot).
7. **Authorship:** every game file written fresh by hand in this session;
   the kit starter's game code was never read (only `starter/main.ts` for
   the `buildDossier` API + RULES.txt + competition.yaml). `main.ts` has a
   genuine second edit (added a post-write stderr summary line) in a
   separate message, so `thinking_revised` is covered. `vendor/makefun-game.ts`
   is the kit copy unchanged (sha256
   `dc67187521b24025ff952f8c231485a6eb92d6d71d29edd2a08154ffb4376129`).

## Notes for the finisher

- The kit check prints "kit level 36, site at level 37" and a
  `curl … | tar xz` download line. **Do NOT run that line** (standing rule);
  the current kit is the one this build was verified against. If the parent
  has a newer kit, re-run the check with it before submitting.
- The dev server (`node serve.ts`, port 8080) was stopped after screenshots.
  To re-serve: `cd <workdir> && node serve.ts`, then open
  `http://localhost:8080/index.html` (add `?demo=table|win|loss` for states).
- Screenshot tooling: `chromium-browser` on this VM is a snap stub — use the
  Playwright Chromium at
  `~/.cache/ms-playwright/chromium-1193/chrome-linux/chrome --headless=new`.
- Screenshots are real renders of the game's own code (headless Chromium,
  `?demo=` states), converted PNG→JPEG quality 85 with PIL. The cover
  (`1-table.jpg`) is the mid-game table.
