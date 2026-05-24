# Paw 🐾 — Active Stray Animal Rescue & Community Coordination

Paw is a mobile-first web application designed to connect animal lovers, rescuers, NGOs, and veterinary clinics to streamline stray-animal rescues. Built around a simulated smartphone frame, the application allows users to report cases, coordinate actions in real-time, trace locations via an interactive map, and submit live WebRTC camera snapshots as rescue confirmation.

---

## 🤝 How This Project Was Built (Our Collaboration)

This codebase is the result of a tight, iterative pair-programming collaboration between the **User** (serving as the Product Visionary, Quality Controller, and UX Director) and **Antigravity (AI Coding Assistant)**. 

### What the User Did to Guide the AI:
- **UI & Aesthetic Direction**: Guided the color scheme to a premium, warm clay-beige (`#F6EBDB`) and soft pinkish-cream (`#F4E4E4`), replacing raw browser defaults with frosted-glass panels and styled cards.
- **Logo Optimization**: Provided the initial logo design, requested the removal of black backgrounds and card borders to make it completely transparent, and directed the mathematical adjustments of the toes' ellipses to achieve perfect symmetry.
- **Workflow Architecture**: Defined the "Rescue-Proof" workflow, insisting that cases remain `in_progress` until the rescuer posts a live photo update and the original reporter manually verifies it to close the case.
- **Only Camera Requirement**: Enforced that rescuers uploading proof are prompted with a **live camera stream only** (no file pickers or photo gallery bypass), mimicking real-world verification.
- **Testing & Guardrails**: Caught duplicate mock records and instructed the AI to clean the database and establish test isolation.

### How the AI Coded the System:
- **Full-Stack Implementation**: Developed the React frontend and the Express REST API backend using local JSON database files.
- **GPS & Mapping**: Integrated Leaflet.js with OpenStreetMap to map clinics, NGOs, and cases, complete with Suburb/Landmark searching and GPS locator tracking.
- **WebRTC Camera Capture**: Built the custom camera viewfinder inside the device simulator using HTML5 `navigator.mediaDevices.getUserMedia` and canvas framing to serialize snapshots to Base64 JPEG strings.
- **Test Isolation**: Configured automated integration tests using Vitest and Supertest, writing an isolated test-suffix database router to prevent test suites from polluting active database files.

---

## 🧠 AI Thoughts on This Project

From an AI perspective, **Paw** is an exceptionally satisfying project to build. Its focus on **coordination friction** is highly practical—often, the bottleneck in street animal welfare isn't a lack of volunteers, but rather communication silos (who is responding, where are they, and is the animal safe?). 

The choice to implement **live-only camera capture** for rescue confirmation is brilliant: it acts as a soft cryptographic guarantee that the rescuer is actually on-site with the animal, preventing false resolutions. Furthermore, rendering the app inside a simulated phone viewport is an elegant solution for desktop testing while keeping mobile users in a native-feeling container.

---

## 🌟 Why This Project is Highly Useful

In the domain of stray animal rescue, speed and clarity save lives. **Paw** addresses the major gaps in existing coordination:
1. **Deduplication**: Active cases are shown on a headerless, fullscreen map, preventing multiple teams from rushing to the same location.
2. **Accountability**: Rescuers claim cases using the `"I'm on it"` action, signaling to the community that response is underway.
3. **Closing the Loop**: The original reporter retains final closure authority, verifying the live WebRTC capture before the case status changes to `resolved`.
4. **Rescuer Visibility**: Resolved cards on the home feed showcase the **Rescuer's** name and avatar alongside the **Before/After** photo transition (the original stray photo vs. the live rescue proof), celebrating volunteers and building community trust.

---

## 🛠️ Requirements & Dependencies

To run Paw locally, you will need:
- **Node.js** (v18 or higher recommended)
- **PNPM** package manager (standard workspaces)
- A modern browser with webcam permissions enabled (for live capture testing)

Key dependencies:
- **Frontend**: React 19, Vite 8, Leaflet, Lucide React
- **Backend**: Express 5, Cors
- **Testing & Dev**: Vitest, Supertest, Concurrently, Sharp (for logo rendering)

---

## 🚀 Setup & Installation Guide

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/defau1tuser0/paw.git
   cd paw
   ```

2. **Install Dependencies**:
   ```bash
   pnpm install
   ```

3. **Start Local Servers**:
   This runs both the Express backend API (port `3001`) and the Vite development server (port `5173`/`5174`) concurrently:
   ```bash
   pnpm run dev
   ```

4. **Access the App**:
   Open [http://localhost:5173](http://localhost:5173) (or the port Vite prompts you with) in your browser.

5. **Run Integration Tests**:
   To run backend API tests in an isolated, non-polluting test database environment:
   ```bash
   pnpm test run
   ```
