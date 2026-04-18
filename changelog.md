# CipherStack Project Roadmap & Changelog

## Current Status: [STABLE / CORE COMPLETE]
We have successfully implemented the minimum viable product (MVP) according to the Vyro Hackathon guidelines. The core application logic and live-preview rendering are fully operational.

---

### ✅ Completed
- **Project Scaffolded:** Next.js application setup with Tailwind CSS (`oklch` theme variables).
- **Core Cipher Algorithms (`lib/ciphers.ts`):** 
  - `Caesar` (Shift + Case Preservation)
  - `XOR` (Hex-encoded Byte Operations)
  - `Vigenère` (Alphabet-only Keyword Shifting)
  - `Base64` & `Reverse` (Non-configurable algorithms)
- **Pipeline Execution Engine (`lib/pipeline.ts`):** Handles bidirectional flow (encrypt forward, decrypt reversed) and manages step-by-step intermediate output data.
- **NodeCard Component (`components/NodeCard.tsx`):** Self-contained UI module handling cipher configs, intermediate `stepData` I/O, and movement logic.
- **Pipeline App UI (`app/page.tsx`):**
  - Left panel: Node addition library.
  - Center panel: Real-time dynamic node list map.
  - Right panel: Encryption/Decryption selection toggle, master text input, rendering output.
  - Minimum node threshold enforcement (3 nodes minimum).

---

### ⏳ To-Do (Ambition & Polish Phase)
- [ ] **Drag and Drop Mechanics:** Replace `[↑] / [↓]` with smooth drag-and-drop mechanics.
- [ ] **Export / Import Configurations:** Functionality to download the node setup as a JSON file and load it back.
- [ ] **Mobile Responsiveness:** Ensure the three columns collapse smoothly on tiny screens.
- [ ] **Write README.md:** Write the final documentation instructing judges on how to securely test the algorithms.

---

### ⚠️ Technical Notes
- **Decoupling:** Cipher encryption algorithms reside natively in `lib/ciphers.ts` purely as mapping components without being tightly bound to React context logic.
- **Evaluation:** Real-time preview works exclusively off `useMemo` hooks triggering from inputs. No "submit" execution needed.
