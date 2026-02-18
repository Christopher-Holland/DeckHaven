# Accessibility (a11y) Guide

DeckHaven aims to be accessible to all users. This document describes the a11y features and how to run audits.

## Implemented Features

### ARIA & Semantics
- **Modals & Drawers**: `role="dialog"`, `aria-modal="true"`, `aria-label` on all dialogs
- **Confirm dialogs**: `role="alertdialog"` with `aria-labelledby` and `aria-describedby`
- **Decorative icons**: `aria-hidden` on non-semantic icons (e.g. Lucide icons in buttons)
- **Buttons**: Explicit `aria-label` where the label isn't clear from context (e.g. "Close drawer", "Decrease quantity")

### Keyboard Navigation
- **Focus trap**: Modals and drawers trap focus; Tab cycles through focusable elements
- **Escape to close**: All modals and drawers close on Escape
- **Focus restoration**: When a modal/drawer closes, focus returns to the element that opened it
- **Initial focus**: First focusable element (usually the close button) receives focus when opening

### Focus Styles
- Interactive elements use `focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]` for visible focus indicators

## Running Accessibility Audits

### 1. Lighthouse (Recommended)

1. Start the dev server: `npm run dev`
2. Open Chrome and go to `http://localhost:3000`
3. Open DevTools (F12) → Lighthouse tab
4. Select **Accessibility** only, then **Analyze page load**
5. Review the report and fix any issues

Or use the CLI:
```bash
npm run dev   # in one terminal
npx lighthouse http://localhost:3000 --only-categories=accessibility --view
```

### 2. axe DevTools (Browser Extension)

Install [axe DevTools](https://www.deque.com/axe/devtools/) for Chrome or Firefox. Use the "Scan ALL of my page" option to find issues.

### 3. axe-core (Development)

When running `npm run dev`, the AxeReporter component attempts to run axe-core and log issues to the console. Note: @axe-core/react has limited React 18+ support; Lighthouse is more reliable for full audits.

### 4. ESLint (jsx-a11y)

The project uses `eslint-plugin-jsx-a11y` (via eslint-config-next). Run `npm run lint` to catch common a11y issues in JSX.

## Hooks for Modals/Drawers

Reusable hooks in `app/lib/`:
- **useFocusTrap** – Keeps focus within a container
- **useRestoreFocus** – Restores focus when a modal closes
- **useInitialFocus** – Focuses a specific element or first focusable when opening

Use these when building new modals or drawers for consistent behavior.
