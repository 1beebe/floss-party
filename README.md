# Floss Party 🦷🪩

A daily floss tracker that throws you a disco party every time you floss. Tap the big button and you get a perspective light floor, sweeping spotlight beams, confetti, and a synth-funk groove that is improvised fresh with the Web Audio API on every tap. About six parties in ten, one of the Floss Tooth animations dances above the FLOSSED! banner; the rest are just the disco floor, so you never know which you'll get. The first party always brings out a tooth, and the same one never plays twice in a row (`TOOTH_CHANCE` and `DANCES` in `index.html`). Each animation page also plays inside the party when opened with `?embed`. A multicolor "look back" calendar shows your streak, and you can tap any past day to fix a mistake.

This repo is where Floss Party grows from a single-file toy into a full app. The goal is to learn, end to end, how to ship a real product: front end, back end, auth, payments, and an App Store listing, all served from **floss.lbeebe.com**.

## Where it is today: rung 1, a static PWA

Plain HTML, CSS and JavaScript with no build step and no dependencies.

| File | What it does |
|---|---|
| `index.html` | The whole app: markup, styles, streak logic, calendar, party animation, and the synth |
| `manifest.webmanifest` | Makes it installable ("Add to Home Screen") with its own icon and full-screen launch |
| `sw.js` | Service worker that caches the app so it opens offline |
| `icon.svg` | App icon |
| `demo.html` | Preview build seeded with two months of sample history, for showing off the look (nothing saves) |
| `animations/` | The seven Floss Tooth animations (**Lasso**, **Hoop**, **Limbo**, **Jump Rope**, **Swing**, **Whip** and **Web**), an index page, and `tooth-kit.js`, the shared on-model tooth the newer four are built from |
| `design/model-sheet/` | The Floss Tooth model sheet: turnaround, character rules, expressions, limbo pose study and palette |

Your streak is stored in your own browser (`localStorage`), so every visitor gets a private tracker and nobody sees anyone else's days. The flip side is that clearing browser data erases your streak, and it does not follow you between devices. Rung 3 fixes that.

### Run it locally

Service workers need a real server, not a `file://` URL:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## The plan

Each rung is shippable on its own, and each one teaches one layer of the stack.

1. **Static PWA** (done). The app above.
2. **Live at floss.lbeebe.com.** Host on a static host (Cloudflare Pages, Netlify or GitHub Pages), add a `CNAME` DNS record for the `floss` subdomain on lbeebe.com, and get HTTPS. Optionally add real 30-second song previews from Apple's free iTunes Search API, with the synth as fallback.
3. **Backend and auth.** Add a database and sign-in (for example Supabase: Postgres plus email magic-link or Sign in with Apple) so a streak syncs across devices. Keep the no-account local mode as the default, and offer to import local history on first sign-in.
4. **Payments.** A small paid tier (ideas: extra music styles, streak freezes, custom party themes) through Stripe on the web. Apps sold through the App Store must use Apple's in-app purchase for digital goods, so this rung also decides how web and iOS purchases map to one account.
5. **App Store.** Wrap the web app in a native shell with Capacitor, since Apple rejects thin website wrappers, then add native touches (haptics, a daily reminder notification). Needs an Apple Developer account ($99/year), Xcode on a Mac, a privacy policy page, screenshots, and review. Google Play via a Trusted Web Activity is the cheaper sibling ($25 one-time).

### Ideas on the shelf

- Longest-streak starburst celebration.
- Export-my-streak backup button.
- More music styles to shuffle between (lo-fi, house, chiptune).

## Origin

The tracker was built with Claude in one sitting in August 2026; the Floss Tooth character and its three animations followed in September, and stress-tested by a kid who found a real bug (a double tap used to play two songs at once). Made by [Ligaya Beebe](https://lbeebe.com).
