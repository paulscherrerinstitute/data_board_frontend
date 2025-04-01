import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    test: {
        passWithNoTests: true,
        globals: true,
        environment: "jsdom",
        setupFiles: "./src/setupTests.js",
    },
});
