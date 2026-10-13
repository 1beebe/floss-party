# Floss Party for iPhone

This folder wraps the Floss Party web app in a native iOS app using [Capacitor](https://capacitorjs.com). Capacitor gives you a real Xcode project whose only screen is a full-screen web view, and it loads the app's HTML from inside the app bundle, so it works offline and needs no server. Native plugins (haptics, notifications) can be added later and called from the same JavaScript.

| Path | What it is |
|---|---|
| `copy-web.mjs` | Copies `index.html`, the manifest, the icon and `animations/` from the repo root into `www/` |
| `capacitor.config.json` | App name, bundle ID (`com.lbeebe.flossparty`), and where the web files live |
| `ios/` | The Xcode project. Open `ios/App/App.xcodeproj` |
| `www/` | Generated copy of the web app. Ignored by git; never edit it by hand |

The app icon is already in `ios/App/App/Assets.xcassets/AppIcon.appiconset/` (1024×1024, rendered from `icon.svg`).

## What needs your hands

Code can get this far from anywhere. The rest needs three things only you can supply:

1. **An Apple Developer Program membership.** $99/year at [developer.apple.com/programs](https://developer.apple.com/programs/). Enroll as an individual to publish under your own name, or as an organization to publish as L. Beebe, LLC. Organization enrollment needs a D-U-N-S number (free, but it can take a week or two to issue), so start that early if you want the LLC name on the listing.
2. **A Mac with Xcode** (free from the Mac App Store). Apple only lets you build and upload iOS apps from Xcode on macOS.
3. **App Store Connect** ([appstoreconnect.apple.com](https://appstoreconnect.apple.com)), Apple's dashboard for listings, screenshots, TestFlight and review. You get it with the developer membership.

## Steps

### 1. Build it on your Mac

```sh
git clone https://github.com/1beebe/floss-party.git
cd floss-party/native
npm install
npm run ios          # copies the web app in, syncs, and opens Xcode
```

In Xcode, pick an iPhone simulator at the top and press ▶. Floss Party should launch as an app.

### 2. Sign it with your Apple account

In Xcode, click the **App** project in the left sidebar → **App** target → **Signing & Capabilities**. Tick *Automatically manage signing* and choose your team (your developer account). If `com.lbeebe.flossparty` is taken, change it here and in `capacitor.config.json` to match.

Plug in your iPhone and pick it instead of the simulator to try it on a real device.

### 3. Make it more than a website

Apple's review guideline 4.2 ("minimum functionality") rejects apps that are just a website in a frame. Floss Party already runs fully offline from the bundle, which helps, and a couple of native touches make the case solid:

- **Haptics** on the floss button and the party (`@capacitor/haptics`).
- **A daily reminder notification** at a time you choose (`@capacitor/local-notifications`).

These are the next code changes, and Claude can do them in this repo.

### 4. Create the listing in App Store Connect

**Apps → + → New App.** Platform iOS, name *Floss Party*, primary language, the bundle ID from step 2, and a SKU (any private label, e.g. `flossparty1`).

You'll fill in:

- **Privacy policy URL:** `https://floss.lbeebe.com/privacy.html` (already written; it goes live with the site).
- **App Privacy:** "Data Not Collected". True today, because everything stays on the device.
- **Category:** Health & Fitness (or Lifestyle).
- **Age rating questionnaire:** all "None", which lands at 4+.
- **Screenshots:** at least one set for 6.9" iPhones (1320×2868 or 1290×2796). Easiest is the iPhone 17 Pro Max simulator in Xcode and ⌘S.
- **Description, keywords, support URL** (lbeebe.com works).
- **Price:** Free for now. Paid features come later through Apple's in-app purchase.

### 5. Upload a build and test it

In Xcode: choose **Any iOS Device (arm64)** as the destination, then **Product → Archive**. When the Organizer opens, **Distribute App → App Store Connect → Upload**.

After processing (often 10–30 minutes), the build appears under **TestFlight**. Install the TestFlight app on your iPhone and test it there first. You can invite friends, or your kid tester, as external testers.

### 6. Submit for review

In App Store Connect, open the version, pick the build, answer the export compliance question (Floss Party uses no encryption beyond HTTPS, so "None of the algorithms mentioned above" applies), and **Submit for Review**. Reviews usually take a day or two. If Apple rejects it, the message says which guideline; most first rejections are fixable in one round.

## Updating the app

When the web app changes, run `npm run sync` and archive a new build with a higher build number (Xcode → App target → General → Build). Unlike the website, App Store updates go through review each time.
