import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    tailwindcss(),

    VitePWA({
      strategies: "injectManifest",

      srcDir: "src",
      filename: "sw.ts",

      registerType: "autoUpdate",

      includeAssets: [
        "favicon-64x64.png",
        "apple-touch-icon.png",
      ],

      manifest: {
        name: "Compausa",
        short_name: "Compausa",

        description:
          "Organiza tus comidas, tu compra y tu ritmo de alimentación.",

        theme_color: "#FBF8F3",
        background_color: "#FBF8F3",

        display: "standalone",

        start_url: "/",
        scope: "/",

        lang: "es",

        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      injectManifest: {
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,webmanifest}",
        ],
      },
    }),
  ],
});