# AWJ / أوج

The selected direction is Emerald & Ivory. AWJ is the user's personal companion for training, nutrition, wellbeing, and daily practices. The name evokes a peak or ascent and makes no claim of Qur’anic origin.

## Navigation and ownership

Today, Train, Nutrition, Wellbeing, and Progress are the five primary destinations. Settings is in the header. Older `/more`, `/more/recovery`, `/more/routines`, and `/health/*` links remain valid aliases. Each feature in `src/client/screens` owns its presentation and retained UI filters. A typed registry owns mount/update/destroy. The core renderer entry points are stable delegates; screen composition no longer replaces those functions at runtime. The client build bundles the feature modules into one offline-cached shell.

Styling is separated into legacy shared components, feature layout (`screens.css`), and semantic AWJ palette tokens (`awj-theme.css`). Optional tools load independently with a visible retry action. The initial shell has its final geometry before hydration, and unfinished meal edits remain available when switching tabs and reloading.

## Data compatibility

The production origin and Worker names, IndexedDB names, browser storage keys, cookie credentials, native bundle identifiers, and Keychain service remain stable. New exports are labelled AWJ; authenticated schema-5 Rep Gym Companion backups retain their original authenticated header on restore. Habit and health source identifiers in existing Notion records remain compatible.

Device save feedback follows the durable transaction outcome. Failed migrations retain their localStorage source; failed writes remain retryable; unavailable storage cannot be shown as an empty successful hydration. Worker verified receipts, idempotency, retries, and sync record formats retain their existing behavior. A service-worker update waits for the user's Update action and a successful state flush, and its prompt is deferred during a workout.

## Validation and promotion

Run `npm run sync`, `npm run verify`, `npm run test:e2e` with Chromium and WebKit, `npm run test:layout`, and `npm run test:recovery`. Cold portrait and landscape audits run before deployment. Production now additionally depends on an audit of the exact commit deployed to isolated staging. Configure `REP_STAGING_URL` and the Cloudflare deploy credentials in the existing GitHub staging environment after completing `docs/STAGING.md`; staging secrets and Notion sources must be independent of production.

Physical iPhone Safari and Honor/Android checks, real keyboards, VoiceOver/TalkBack, storage pressure, interruption/relaunch, and device pairing remain release certification requirements under `docs/DEVICE_CERTIFICATION.md`. Automated tests do not constitute that certification. Promotion uses the existing protected production environment; record the prior version for rollback.

## Repository rename

The requested repository name is `mohamedhosny95/AWJ`. The name must be available when renaming. Update local remotes and checked-in repository links immediately after GitHub confirms the rename, and verify the old link redirects. Preserve the production Worker address. The GitHub connector in this chat exposes code and PR writes but does not expose repository-administration writes; a logged-in administrator must perform the rename if browser administration is unavailable.
