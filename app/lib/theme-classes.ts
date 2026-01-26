/**
 * Theme-aware CSS class utilities
 * 
 * Provides helper functions and class names that use CSS variables
 * for consistent theming across the application.
 */

/**
 * Get theme-aware background color class
 */
export function themeBg() {
    return "bg-[var(--theme-bg)]";
}

/**
 * Get theme-aware foreground/text color class
 */
export function themeFg() {
    return "text-[var(--theme-fg)]";
}

/**
 * Get theme-aware accent color class
 */
export function themeAccent() {
    return "bg-[var(--theme-accent)]";
}

/**
 * Get theme-aware accent text color class
 */
export function themeAccentText() {
    return "text-[var(--theme-accent)]";
}

/**
 * Get theme-aware border color class
 */
export function themeBorder() {
    return "border-[var(--theme-border)]";
}

/**
 * Get theme-aware sidebar background class
 */
export function themeSidebar() {
    return "bg-[var(--theme-sidebar)]";
}

/**
 * Get theme-aware sidebar border class
 */
export function themeSidebarBorder() {
    return "border-[var(--theme-sidebar-border)]";
}

/**
 * Get theme-aware card background class
 */
export function themeCard() {
    return "bg-[var(--theme-card)]";
}

/**
 * Get theme-aware card border class
 */
export function themeCardBorder() {
    return "border-[var(--theme-card-border)]";
}

/**
 * Common theme-aware class combinations
 */
export const themeClasses = {
    page: "bg-[var(--theme-bg)] text-[var(--theme-fg)]",
    sidebar: "bg-[var(--theme-sidebar)] border-[var(--theme-sidebar-border)] text-[var(--theme-fg)]",
    card: "bg-[var(--theme-card)] border-[var(--theme-card-border)]",
    button: {
        primary: "bg-[var(--theme-accent)] text-white hover:opacity-95",
        secondary: "bg-[var(--theme-accent-secondary)] text-white hover:opacity-95",
        outline: "border-[var(--theme-border)] text-[var(--theme-fg)] hover:bg-[var(--theme-accent)]/10",
    },
    input: "bg-[var(--theme-card)] border-[var(--theme-border)] text-[var(--theme-fg)] focus:ring-[var(--theme-accent)]",
    border: "border-[var(--theme-border)]",
    accent: "text-[var(--theme-accent)]",
    accentBg: "bg-[var(--theme-accent)]",
};
