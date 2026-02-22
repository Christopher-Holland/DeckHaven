/**
 * Generates the theme initialization script that runs before first paint.
 * Prevents theme flash by applying saved theme from localStorage immediately.
 * Must stay in sync with themes.ts.
 */

import {
    baseThemes,
    accentColors,
    defaultBaseTheme,
    defaultAccentColor,
} from "./themes";

export function getThemeInitScript(): string {
    const baseData = Object.fromEntries(
        Object.entries(baseThemes).map(([id, t]) => [id, t.colors])
    );
    const accentData = Object.fromEntries(
        Object.entries(accentColors).map(([id, a]) => [
            id,
            { color: a.color, hoverColor: a.hoverColor ?? a.color },
        ])
    );

    return `(function(){
var t=localStorage.getItem('deckhaven-base-theme')||'${defaultBaseTheme}';
var a=localStorage.getItem('deckhaven-accent-color')||'${defaultAccentColor}';
var base=${JSON.stringify(baseData)};
var accent=${JSON.stringify(accentData)};
var b=base[t]||base['${defaultBaseTheme}'];
var ac=accent[a]||accent['${defaultAccentColor}'];
if(!b||!ac)return;
var r=document.documentElement;
r.style.setProperty('--theme-bg',b.background);
r.style.setProperty('--theme-fg',b.foreground);
r.style.setProperty('--theme-sidebar',b.sidebar);
r.style.setProperty('--theme-card',b.card);
r.style.setProperty('--theme-card-border',b.cardBorder);
r.style.setProperty('--theme-accent',ac.color);
r.style.setProperty('--theme-accent-hover',ac.hoverColor||ac.color);
r.style.setProperty('--theme-border',ac.color);
r.style.setProperty('--theme-sidebar-border',ac.color);
r.setAttribute('data-base-theme',t);
r.setAttribute('data-accent-color',a);
})();`;
}
