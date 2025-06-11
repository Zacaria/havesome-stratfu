import vercel from "vite-plugin-vercel";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import vike from "vike/plugin";

export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode
  const env = loadEnv(mode, process.cwd(), '');
  
  // Set base URL for GitHub Pages
  const base = process.env.NODE_ENV === 'production' ? '/havesome-stratfu/' : '/';

  return {
    plugins: [vike(), react({}), tailwindcss(), vercel()],

    base,

    build: {
      target: "es2022",
      outDir: 'dist',
    },

    resolve: {
      alias: {
        "@": new URL("./", import.meta.url).pathname,
      },
    },
  };
});
