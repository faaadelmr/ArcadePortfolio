# Arcade Portfolio - Project Context

This directory contains the source code for a highly interactive, retro arcade-themed portfolio built with **Next.js 16+** and **TypeScript**. The project aims to provide an immersive 8-bit/16-bit experience while showcasing professional projects and certifications.

## Project Overview

-   **Purpose:** Interactive professional portfolio with a gamified UI.
-   **Core Tech Stack:**
    -   **Frontend:** Next.js (App Router), React 19, TypeScript.
    -   **Styling:** Tailwind CSS (v3/v4), Shadcn UI, Framer Motion (via `tailwindcss-animate`).
    -   **Audio:** Tone.js for synthesized 8-bit sound effects and background music.
    -   **State Management:** React Context (Providers for Localization, Visual Settings, and Sound).
    -   **Deployment:** Designed for Firebase App Hosting (`apphosting.yaml`).
-   **Architecture:**
    -   `src/app/`: Next.js App Router structure.
    -   `src/components/pixelplay/`: Core arcade-themed components (MainMenu, ProjectList, BugDodgeGame, etc.).
    -   `src/hooks/`: Custom hooks for audio handling (`useArcadeSounds`), settings management, and localization.
    -   `src/locales/`: JSON-based translation files for English and Indonesian.

## Building and Running

| Task | Command |
| :--- | :--- |
| **Development** | `npm run dev` (Runs on port 9002 by default) |
| **Build** | `npm run build` |
| **Start Production** | `npm run start` |
| **Linting** | `npm run lint` |
| **Type Checking** | `npm run typecheck` |

## Development Conventions

### 1. Arcade Navigation System
The application uses a custom navigation system that mimics classic game consoles. Components should listen for global keyboard events (Arrow Keys, `Enter`/`A`, `Esc`/`B`, `S`) and respond accordingly. Navigation state is often managed via a `selectedItem` index.

### 2. Focus Management
To maintain accessibility while using a custom D-pad navigation, use `useEffect` to sync the `selectedItem` with actual browser focus via refs and `.focus()`.

### 3. Localization
All user-facing strings must be localized.
-   Translations are stored in `src/locales/{en,id}.json`.
-   Access translations using the `useLocalization` hook: `const { t } = useLocalization();`.

### 4. Audio Feedback
Use the `useArcadeSounds` hook to trigger sound effects for interactions:
-   `playNavigate()`: For cursor movement.
-   `playSelect()`: For confirming an action.
-   `playBack()`: For returning to a previous menu.
-   `playStart()`: For major game/menu entries.

### 5. Responsive Design
The project follows a mobile-first approach. The main layout in `src/app/page.tsx` defines a fixed "Arcade Cabinet" safe zone. Use Tailwind breakpoints (`sm:`, `md:`, `lg:`) to adjust internal layouts, especially for the `ProjectList` and `Certified` views.

## Structural Bridges

To maintain a coherent architectural graph, the following relationships are explicitly defined:

- **Next.js & TypeScript**: Serve as the foundational runtime and type system for all files in `src/app`, `src/components`, and `src/hooks`.
- **Tailwind CSS**: Provides the styling engine for the entire **UI Components (Shadcn)** library and all `pixelplay` components.
- **Tone.js**: Powers the **Audio Feedback** system and is primarily implemented within `src/hooks/useArcadeSounds.ts` and `src/hooks/useBackgroundMusic.ts`.
- **Firebase App Hosting**: Acts as the target deployment platform for the entire compiled Next.js application.

## Key Files
-   `src/app/page.tsx`: The "God Component" that manages the arcade shell and page transitions.
-   `src/hooks/useArcadeSounds.ts`: Handles the initialization and playback of Tone.js synthesizers.
-   `apphosting.yaml`: Configuration for Firebase App Hosting deployment.
-   `tailwind.config.ts`: Contains custom retro-themed colors and animations.
