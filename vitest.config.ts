import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./"),
        },
    },
    test: {
        environment: "jsdom",
        setupFiles: ["./test/setup.ts"],
        globals: true,
        css: true,
        include: ["test/**/*.{test,spec}.{ts,tsx}", "test/**/*-test.{ts,tsx}"],
    },
});