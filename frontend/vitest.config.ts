import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "app/**/*.tsx",
        "components/**/*.tsx",
        "services/api.ts",
      ],
      exclude: ["**/*.test.ts", "**/*.test.tsx"],
    },
  },
});
