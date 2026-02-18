/**
 * Axe accessibility reporter - runs in development only.
 * Reports a11y issues to the Chrome DevTools console.
 * Note: @axe-core/react may have limited React 18+ support; use Lighthouse for full audits.
 *
 * @see https://github.com/dequelabs/axe-core-npm/tree/develop/packages/react
 */

"use client";

import { useEffect } from "react";
import * as React from "react";
import * as ReactDOM from "react-dom";

export function AxeReporter() {
    useEffect(() => {
        if (process.env.NODE_ENV !== "development") return;

        import("@axe-core/react")
            .then((mod) => {
                const axe = mod.default;
                if (typeof axe === "function") {
                    axe(React, ReactDOM, 1000);
                }
            })
            .catch(() => {
                // Silently fail - axe may not support React 19
            });
    }, []);

    return null;
}
