import vikeReact from "vike-react/config";
import type { Config } from "vike/types";
import Layout from "../layouts/LayoutDefault.js";

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  // https://vike.dev/Layout
  Layout,

  // https://vike.dev/head-tags
  title: "Havesome StratFu",

  description: "Chargeur de stratégies pour les donjons de Wakfu",
  extends: vikeReact,
  prerender: {
    partial: true,
    keepDistServer: true,
  },
  htmlAttributes: {
    lang: "fr",
    class: "dark",
  },
} satisfies Config;
