import { defineConfig, mergeConfig } from "vitest/config";
import vite_config from "./vite.config";

export default mergeConfig(
    vite_config,
    defineConfig({
        test: {
            environment: "jsdom",
            globals: true,
            css: true,
            setupFiles: "./src/test/setup.ts",
            clearMocks: true,
            mockReset: true,
            restoreMocks: true,
            coverage: {
                provider: "v8",
                reporter: ["text", "html"],
                reportsDirectory: "./coverage",
            },
        },
    }),
);