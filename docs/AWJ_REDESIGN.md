# AWJ / أوج

The selected direction is Emerald & Ivory. AWJ is the user's personal companion for training, nutrition, wellbeing, and daily practices. The name evokes a peak or ascent and makes no claim of Qur’anic origin.

## Navigation and ownership

Today, Train, Nutrition, Wellbeing, and Progress are the five primary destinations. Settings is in the header. Older `/more`, `/more/recovery`, `/more/routines`, and `/health/*` links remain valid aliases. Each feature in `src/client/screens` owns its presentation and retained UI filters. A typed registry owns mount/update/destroy. The core renderer entry points are stable delegates; screen composition no longer replaces those functions at runtime. The client build bundles the feature modules into one offline-cached shell.

Styling is separated into legacy shared components, feature layout (`screens.css`), and semantic AWJ palette tokens (`awj-theme.css`). Optional tools load independently with a visible retry action. The initial shell has its final geometry before hydration, and unfinished meal edits remain available when switching tabs and reloading.

## Data compatibility

The production origin and Worker names, IndexedDB names, browser storage keys, cookie credentials, native bundle identifiers, and Keychain service remain stable. New exports are labelled AWJ; authenticated schema-5 AWJ backups retain their original authenticated header on restore. Habit and health source identifiers in existing Notion records remain compatible.

Device save feedback follows the durable transaction outcome. Failed migrations retain their localStorage source; failed writes remain retryable; unavailable storage cannot be shown as an empty successful hydration. Worker verified receipts, idempotency, retries, and sync record formats retain their existing behavior. A service-worker update waits for the user's Update action and a successful state flush, and its prompt is deferred during a workout.

## Validation and promotion

Run `npm run sync`, `npm run verify`, `npm run test:e2e` with Chromium and WebKit, `npm run test:layout`, and `npm run test:recovery`. Cold portrait and landscape audits run before deployment. Production now additionally depends on an audit of the exact commit deployed to isolated staging. Configure `AWJ_STAGING_URL` and the Cloudflare deploy credentials in the existing GitHub staging environment after completing `docs/STAGING.md`; staging secrets and Notion sources must be independent of production.

Physical iPhone Safari and Honor/Android checks, real keyboards, VoiceOver/TalkBack, storage pressure, interruption/relaunch, and device pairing remain release certification requirements under `docs/DEVICE_CERTIFICATION.md`. Automated tests do not constitute that certification. Promotion uses the existing protected production environment; record the prior version for rollback.

## Repository rename

The owner renamed the repository to `mohamedhosny95/AWJ`. The existing repository ID, history, branches, and PR #104 are retained. Local remotes and checked-in repository links use the AWJ URL. The production Worker address stays `rep-gym-companion.mohamedahmedhosny95.workers.dev` so the rebrand preserves installed-app identity and local records.

## Comprehensive identity change

Browser globals, event/DOM hooks, the bundled app shell, social preview, native targets, tests, tools, and documentation use AWJ naming. `src/client/compatibility.js`, `src/server/compatibility.ts`, and `ios/AWJHealthCompanion/AWJCompatibility.swift` centralize historical identities used only to read existing records or authenticate installed clients. Registered native bundle identifiers and the existing Cloudflare Worker names remain migration addresses. The deployed pairing secret keeps its required provider binding; an optional `AWJ_SYNC_KEY` alias must retain the same value during an upgrade so existing signed device sessions stay valid. New cookies, headers, tokens, and backup headers use AWJ; older equivalents are accepted and tested. The existing Notion Source select value is kept through the server compatibility mapping to avoid changing the user’s database schema.
