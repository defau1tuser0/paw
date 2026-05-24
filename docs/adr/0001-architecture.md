# ADR 0001: Architecture Decision for Paw Application

## Status
Approved

## Context
We need to create a dedicated street animal rescue application called **Paw**. The target is a mobile (Android) app, but for testing, prototyping, and review, we want to run the application locally on Windows (using a browser with a mobile-phone viewport preview on localhost). 

The app features:
- Interactive maps prioritizing veterinary clinics and NGOs.
- Capture/report cases with photo and GPS location coordinates.
- Social communication (Case public comment threads).
- Private messaging (Direct Messages between friends).

We need an architecture that supports:
1. Easy browser-based mobile preview.
2. Fast development iteration.
3. Realistic multi-user simulation (sending DMs between different accounts from different tabs or devices on the same local network).
4. No heavy local database installation requirements (like PostgreSQL or MongoDB).

## Decision
We will build the application using a split frontend-backend architecture:

1. **Frontend**: Vite + React + Vanilla CSS
   - Vite offers fast rebuilds and modern bundling.
   - React allows clean state management and component separation.
   - Vanilla CSS will be used for customized premium styling, including glassmorphism layouts and responsive mobile-first viewports.
   - Leaflet.js will be used for map rendering without requiring external API keys.

2. **Mobile Viewport Simulator**:
   - The desktop browser view will render a realistic mobile-phone frame (bezel, notch, home indicator) enclosing the application, to simulate an Android app experience.
   - On actual mobile devices, the frame will hide, and the app will expand to take up the full screen.

3. **Backend**: Node.js + Express
   - A local Express server running on port 3001.
   - Data will be persisted in local JSON files inside a `server/database/` directory.
   - This setup provides simple, readable, and version-controlled data persistence without database dependencies.
   - Enables multi-user interaction testing.

## Consequences
- **Advantages**:
  - Extremely fast start-up time; running `npm install` and `npm run dev` is all that's required.
  - No database credentials, server configuration, or software installation needed.
  - Highly readable data models (stored directly as editable JSON arrays).
- **Disadvantages / Mitigations**:
  - In-memory database with JSON writes is not suitable for high-traffic production. *Mitigation:* The API controllers are structured cleanly so that the JSON database queries can be replaced with a real database driver (e.g. Prisma or MongoDB) when moving to production.
