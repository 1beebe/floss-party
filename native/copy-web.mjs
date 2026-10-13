// Copies the web app from the repo root into native/www, which is the folder
// Capacitor bundles into the iOS app. Run via `npm run sync`, never edit www/ by hand.
//
// The website has no build step, so the app's copy of index.html gets one extra
// line here: a <script> for Capacitor's browser runtime, which lets the page reach
// native plugins (haptics, notifications) through window.Capacitor.
import { cpSync, rmSync, mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const www = new URL("./www/", import.meta.url);
const files = ["index.html", "manifest.webmanifest", "icon.svg", "animations"];

rmSync(www, { recursive: true, force: true });
mkdirSync(www);
for (const f of files) {
  const src = new URL(f, root);
  if (existsSync(src)) cpSync(src, new URL(f, www), { recursive: true });
}

cpSync(new URL("./node_modules/@capacitor/core/dist/capacitor.js", import.meta.url), new URL("capacitor.js", www));
const index = new URL("index.html", www);
const html = readFileSync(index, "utf8");
if (!html.includes("</head>")) throw new Error("index.html has no </head> to inject capacitor.js before");
writeFileSync(index, html.replace("</head>", '<script src="capacitor.js"></script>\n</head>'));

console.log("Copied web app into native/www");
