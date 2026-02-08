/**
 * Proxy Scryfall images so they can be used same-origin (e.g. for CSS mask with theme color).
 *
 * @route GET /api/scryfall/proxy-image?url=...
 */

import { NextRequest } from "next/server";

const ALLOWED_ORIGINS = [
    "https://scryfall.com",
    "https://api.scryfall.com",
    "https://c1.scryfall.com",
    "https://c2.scryfall.com",
    "https://c3.scryfall.com",
    "https://c4.scryfall.com",
    "https://cards.scryfall.io",
    "https://assets.scryfall.com",
    "https://svgs.scryfall.io",
];

function isAllowedUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return ALLOWED_ORIGINS.some((origin) => parsed.origin === origin);
    } catch {
        return false;
    }
}

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get("url");
    if (!url || !isAllowedUrl(url)) {
        return new Response("Invalid or disallowed URL", { status: 400 });
    }

    try {
        const res = await fetch(url, { redirect: "follow" });
        if (!res.ok) {
            return new Response("Failed to fetch image", { status: res.status });
        }

        const contentType = res.headers.get("content-type") ?? "image/svg+xml";
        const bytes = await res.arrayBuffer();

        return new Response(bytes, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=86400, s-maxage=86400",
            },
        });
    } catch {
        return new Response("Failed to proxy image", { status: 500 });
    }
}