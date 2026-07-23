import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    build: {
        outDir: "dist",
    },
    server: {
        // dev-only: `vite dev` runs on its own port, so proxy the API to the
        // Hono server. Under `npm run atlas` the SPA is served same-origin and
        // this proxy is never used.
        proxy: {
            "/chat": { target: "http://localhost:3000", changeOrigin: true },
            "/health": { target: "http://localhost:3000", changeOrigin: true },
        },
    },
});
