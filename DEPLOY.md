# Deploying Floss Party to floss.lbeebe.com

Floss Party is a static site: plain files, no server code. That makes hosting simple. GitHub Pages serves the files straight from the `main` branch of this repo, for free, with HTTPS. Every time something merges into `main`, the live site updates within a minute or two.

Streaks still live in each visitor's own browser (`localStorage`), so there is no database to set up and nobody's data ever reaches the server.

## How the pieces fit together

When someone types `floss.lbeebe.com`:

1. Their browser asks DNS, "where is floss.lbeebe.com?" lbeebe.com's DNS is managed at **Cloudflare** (its nameservers are `simone.ns.cloudflare.com` and `micah.ns.cloudflare.com`).
2. A **CNAME record** answers, "floss.lbeebe.com is really 1beebe.github.io." A CNAME is an alias: it points one name at another name instead of at an IP address.
3. GitHub's servers receive the request, see the `CNAME` file in this repo that says `floss.lbeebe.com`, and know which repo's files to serve.
4. GitHub automatically gets a free HTTPS certificate (from Let's Encrypt) for the name, so the site is served securely.

## One-time setup (done by hand)

### 1. Turn on GitHub Pages

In the repo on GitHub: **Settings → Pages**.

- **Source:** Deploy from a branch
- **Branch:** `main`, folder `/ (root)`, then **Save**
- **Custom domain:** should fill in as `floss.lbeebe.com` from the `CNAME` file. If not, type it and Save.

### 2. Add the DNS record in Cloudflare

In Cloudflare: pick **lbeebe.com → DNS → Records → Add record**.

| Field | Value |
|---|---|
| Type | `CNAME` |
| Name | `floss` |
| Target | `1beebe.github.io` |
| Proxy status | **DNS only** (grey cloud, not orange) |
| TTL | Auto |

Why grey cloud: with the orange cloud on, Cloudflare stands in front of GitHub, and GitHub can't verify the domain to issue its HTTPS certificate. You can turn the proxy on later if you want Cloudflare's caching, but you'd then set Cloudflare's SSL mode to "Full".

### 3. Turn on HTTPS

Back in **Settings → Pages**, wait until the DNS check shows a green tick (usually a few minutes, sometimes up to an hour), then tick **Enforce HTTPS**.

### 4. Optional but recommended: verify the domain

**GitHub profile Settings → Pages → Add a domain → `lbeebe.com`**. GitHub gives you a TXT record to add in Cloudflare. This stops anyone else's repo from ever claiming a subdomain of lbeebe.com.

## What gets published

Everything committed to `main`: the app (`index.html`, `manifest.webmanifest`, `sw.js`, `icon.svg`), `demo.html`, `privacy.html`, `animations/` and `design/`. The empty `.nojekyll` file tells GitHub to serve files as they are instead of running them through its Jekyll blog builder.

Never commit personal data here. Ligaya's own server-synced tracker, which holds her real floss log, deliberately lives outside this repo.

## Shipping an update

Merge a pull request into `main`. That's the whole deploy. If you changed `index.html` or another cached file, bump `CACHE` in `sw.js` (for example `flossparty-v2`) so installed copies pick up the new version.
