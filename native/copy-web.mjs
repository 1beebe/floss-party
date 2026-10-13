// Copies the web app from the repo root into native/www, which is the folder
// Capacitor bundles into the iOS app. Run via `npm run sync`, never edit www/ by hand.
import { cpSync, rmSync, mkdirSync, existsSync } from "node:fs";

const root = new URL("../", import.meta.url);
const www = new URL("./www/", import.meta.url);
const files = ["index.html", "manifest.webmanifest", "icon.svg", "animations"];

rmSync(www, { recursive: true, force: true });
mkdirSync(www);
for (const f of files) {
  const src = new URL(f, root);
  if (existsSync(src)) cpSync(src, new URL(f, www), { recursive: true });
}
console.log("Copied web app into native/www");
