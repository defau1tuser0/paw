# Paw Handoff Documentation

This document reflects the current state of **Paw** after the UI rebuild, feed behavior changes, rescue-proof workflow update, and seed-data cleanup.

## Project Goal
Paw is a mobile-first stray-animal rescue web app focused on:
- reporting cases with photo + location
- prioritizing active rescue work
- coordinating through case discussion and direct messaging
- showing clinics, NGOs, and rescue cases on a map

The app still runs inside a simulated mobile device frame on desktop and expands full-screen on mobile.

## Current Stack
1. Frontend: React + Vite
2. Styling: Vanilla CSS in [`src/index.css`](/D:/Paw/src/index.css:1)
3. Backend: Express in [`server/server.js`](/D:/Paw/server/server.js:1)
4. Data storage: JSON files in [`server/database`](/D:/Paw/server/database)
5. Mapping: Leaflet + OpenStreetMap
6. Tests: Vitest + Supertest

## What Changed
### 1. Full UI refresh
- Rebuilt the visual system around the Figma-derived palette and serif/sans pairing.
- Restyled the simulated phone shell, bottom nav, headers, cards, inputs, buttons, and overlays.
- Kept the brand name strictly as `Paw`.
- Removed obvious prototype-facing UI such as the old quick-login section.

### 2. Auth and session behavior
- Landing/login/signup screens now use the photographic + frosted-glass direction.
- Login card positioning was adjusted lower/closer to center.
- App session now survives refresh using `localStorage` persistence in [`src/context/AppContext.jsx`](/D:/Paw/src/context/AppContext.jsx:1).
- Logout clears persisted state cleanly.

### 3. Feed behavior
- Feed header and floating filter bar were redesigned and refined.
- `All` feed is no longer a naive status grouping:
  - open cases are still prioritized
  - nearby `in_progress` cases are promoted upward instead of being buried below all open cases
  - the mix aims for a practical balance between open and active rescue work
- Clicking a case in the feed opens an inline discussion section directly below that card.
- Users can comment inside the feed-level discussion using the existing case comment backend.

### 4. Case workflow changes
- `Open` status styling was made more urgent with a red-tinted indicator.
- In case detail:
  - `I'm responding` became `I'm on it`
  - `Mark safe` became `Rescued`
- `Rescued` no longer closes the case immediately.
- Current workflow:
  1. rescuer claims case -> `in_progress`
  2. rescuer clicks `Rescued`
  3. proof-capture flow opens automatically
  4. rescuer posts a proof image into the case discussion
  5. original reporter reviews proof
  6. original reporter closes the case
- Until reporter approval, the case remains `in_progress`.

### 5. Comments and proof images
- Case comments now support:
  - `text`
  - optional `photoUrl`
  - optional `kind`
- Rescue proof images render in:
  - case detail timeline
  - inline feed discussion

### 6. Map semantics
- Map styling was rebuilt to match the new UI.
- Marker meaning is now:
  - NGOs: blue
  - Clinics: green
  - Animal rescue cases: red
- The map logic is still basic and visual-only improvements were prioritized over deeper map behavior changes.

### 7. Seed data cleanup
- [`server/database/cases.json`](/D:/Paw/server/database/cases.json:1) was cleanly re-seeded.
- Database now has exactly 4 active cases, each utilizing a single image from `public/images` exactly once:
  - `dog-1.jpg`
  - `dog-2.png`
  - `kitten-1.png`
  - `kitten-2.png`
- The user explicitly asked not to use the `rescued-kitten.png` image yet.
- Comments and messages have been pruned of old duplicate/noisy logs.

## Important Current Behavior
### Feed
- `All`, `Open`, `In Progress`, `Resolved` filters exist.
- `All` uses custom ordering logic, not plain created-at sorting.
- Feed cards support:
  - help CTA
  - inline discussion toggle
  - map jump
  - share

### Case detail
- Case comments are still the main coordination thread.
- Proof-based rescue confirmation now lives here.
- Reporter-only final closure is enforced in UI flow.

### Report flow
- Still uses the mock camera / mock photo-selection model.
- Still uses browser geolocation + Nominatim reverse geocoding.

### Chat
- Direct messages still work separately from case discussion.
- Friends/discover structure remains intact.

## Files Most Relevant For Next Work
- [`src/screens/FeedScreen.jsx`](/D:/Paw/src/screens/FeedScreen.jsx:1)
- [`src/screens/CaseDetailScreen.jsx`](/D:/Paw/src/screens/CaseDetailScreen.jsx:1)
- [`src/context/AppContext.jsx`](/D:/Paw/src/context/AppContext.jsx:1)
- [`src/index.css`](/D:/Paw/src/index.css:1)
- [`server/server.js`](/D:/Paw/server/server.js:1)
- [`server/database/cases.json`](/D:/Paw/server/database/cases.json:1)

## What Still Needs Doing
### Highest-priority product work
- Design map depth features and additional profile elements. The resolved card redesign (highlighting rescuers, proof photos, and direct link to case details) is complete.

### Feed follow-up
- The new inline discussion works, but it is still lightweight.
- Feed ranking is heuristic only:
  - nearby `in_progress` promotion exists
  - there is no robust scoring model yet
  - no true geospatial service is involved

### Rescue-proof workflow follow-up
- Proof capture utilizes a real WebRTC live camera feed (`navigator.mediaDevices.getUserMedia`) which encodes snapshots to Base64 JPEG data.
- Reporter approval is enforced in UI flow, but not by strict backend authorization rules.

### Data quality
- `comments.json`, `cases.json`, and `messages.json` have been cleanly re-seeded. Old prototype and test noise has been cleared.

### Map/product depth
- Map search and controls are styled, but discovery logic is still shallow.
- No prioritization layers, route guidance, or rescue-specific proximity UX yet.

### Production-readiness gaps
- No real auth/session backend
- No file upload backend
- No server-side authorization rules
- JSON storage only; not production-grade persistence

## How to Resume
1. Start the app:
```powershell
pnpm run dev
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

2. Run checks:
```powershell
pnpm test run
pnpm exec vite build
```

3. Manual sanity pass:
- login and refresh to confirm session persistence
- verify `All` feed ordering
- open a feed card and test inline discussion
- claim a case, post rescue proof, and verify reporter-only close flow
- verify map marker colors

## Recommended Next Task
Focus next on the **Resolved feed section**. That is the next major UX area that still needs a substantial rethink.
