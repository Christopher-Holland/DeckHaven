import type { ReleaseNote } from "./types";
import v1_0 from "./v1.0";

export type { ReleaseNote, ReleaseSection } from "./types";

/**
 * Newest first. When you add a release:
 * 1. Create app/release-notes/vX.Y.tsx (copy v1.0.tsx)
 * 2. Import it here and prepend it to this array
 */
export const releases: ReleaseNote[] = [v1_0];

export function getRelease(slug: string): ReleaseNote | undefined {
    return releases.find((r) => r.slug === slug);
}
