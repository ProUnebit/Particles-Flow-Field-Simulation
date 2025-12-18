import { defineConfig } from "vite";

export default defineConfig({
    server: {
        port: 3000,
        open: true,
    },
    build: {
        outDir: "dist",
    },
    resolve: {
        extensions: ['.js', '.ts']
    }
});
