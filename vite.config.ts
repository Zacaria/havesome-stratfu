// import vercel from "vite-plugin-vercel";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import vike from "vike/plugin";

export default defineConfig(({ mode }) => {
  return {
    plugins: [vike(), react({}), tailwindcss()],

    build: {
      target: "es2022",
      outDir: "dist",
    },

    resolve: {
      alias: {
        "@": new URL("./", import.meta.url).pathname,
      },
    },
  };
});
