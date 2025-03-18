import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteCompression from "vite-plugin-compression";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        viteCompression({
            verbose: true,
            disable: false,
            threshold: 10240,
            algorithm: "gzip",
            ext: ".gz",
        }),
        nodePolyfills({
            globals: {
                global: true,
                process: true,
                Buffer: true,
            },
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
        extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    server: {
        port: 3000,
    },
    base: "/",
    build: {
        outDir: "build",
        assetsDir: "static",
        sourcemap: true,
    },
});
