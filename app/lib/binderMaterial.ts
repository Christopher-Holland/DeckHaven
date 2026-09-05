import type { CSSProperties } from "react";

/** Soft PU / Exo-Tec-style grain + sheen layered over a solid cover/spine color */
export function paddedMaterialStyle(baseColor: string): CSSProperties {
    return {
        backgroundColor: baseColor,
        backgroundImage: [
            "radial-gradient(ellipse 120% 80% at 20% 15%, rgba(255,255,255,0.18), transparent 55%)",
            "radial-gradient(ellipse 90% 70% at 85% 90%, rgba(0,0,0,0.28), transparent 50%)",
            "linear-gradient(145deg, rgba(255,255,255,0.12) 0%, transparent 42%, rgba(0,0,0,0.18) 100%)",
            `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E")`,
        ].join(", "),
        backgroundBlendMode: "normal, normal, soft-light, overlay",
    };
}

export function isLightHex(color: string): boolean {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color.trim());
    if (!m) return false;
    const r = parseInt(m[1], 16);
    const g = parseInt(m[2], 16);
    const b = parseInt(m[3], 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
}
