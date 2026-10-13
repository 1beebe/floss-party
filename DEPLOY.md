# Deploying Floss Party to floss.lbeebe.com

Floss Party is a static site: plain files, no server code. It is hosted the same way as lbeebe.com, as a **Cloudflare Worker with static assets**. Cloudflare connects to this GitHub repo, and every time something merges into `main` it redeploys the site within a minute or two.

Streaks still live in each visitor's own browser (`localStorage`), so there is no database to set up and nobody's data ever reaches the server.

## How the pieces fit together

- **`wrangler.jsonc`** is the Worker's settings file. It names the Worker (`floss-party`), says "serve the files in this folder" (`assets`), and claims the custom domain `floss.lbeebe.com`. Wrangler is Cloudflare's deploy tool; it reads this file.
- **`.assetsignore`** lists what stays private: `native/` (the iOS project), the README files and the config itself. It works like `.gitignore`, but for what gets published.
- **Custom domain.** Because lbeebe.com's DNS already lives in your Cloudflare account, Cloudflare creates the DNS record for `floss` and issues the HTTPS certificate by itself the first time the Worker deploys. You don't add a DNS record by hand.
- **Workers Builds** is Cloudflare's link to GitHub. It watches `main`, runs `npx wrangler deploy` on each push, and shows the build log in the dashboard.

## One-time setup (done by hand)

1. In the Cloudflare dashboard, go to **Workers & Pages → Create → Import a repository**.
2. Connect GitHub if asked, and give Cloudflare access to `1beebe/floss-party`.
3. Settings:
   - **Project name:** `floss-party` (must match `name` in `wrangler.jsonc`)
   - **Production branch:** `main`
   - **Build command:** leave empty (there's nothing to build)
   - **Deploy command:** `npx wrangler deploy`
   - **Root directory:** leave as `/`
4. **Save and Deploy.** When the build finishes, open https://floss.lbeebe.com. If the domain step fails because a `floss` DNS record already exists, delete that record and retry the deploy.

## Deploying from your own computer (optional)

```sh
npx wrangler login     # once
npx wrangler deploy    # from the repo root
```

## What gets published

The app (`index.html`, `manifest.webmanifest`, `sw.js`, `icon.svg`), `demo.html`, `privacy.html`, `animations/` and `design/`. Everything listed in `.assetsignore` is left out.

Never commit personal data here. Ligaya's own server-synced tracker, which holds her real floss log, deliberately lives outside this repo.

## Shipping an update

Merge a pull request into `main`. That's the whole deploy. If you changed `index.html` or another cached file, bump `CACHE` in `sw.js` (for example `flossparty-v2`) so installed copies pick up the new version.

## Later: when the backend arrives

The same Worker can grow server code. Adding a `main` script to `wrangler.jsonc` lets it answer API routes (sign-in, syncing streaks) while still serving the static files, so rung 3 doesn't need a new host.
