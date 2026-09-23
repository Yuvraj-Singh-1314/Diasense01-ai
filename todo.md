# Project TODO

- [x] Premium DiaSense AI landing page with hero, animated product preview, feature story, how-it-works, comparison, FAQ, contact form, and branded footer
- [x] Retro-futuristic system-failure visual language with scanlines, chromatic accents, monospace technical artifacts, and clinical blue/cyan palette
- [x] Persistent light/dark theme system with smooth transitions and Inter typography
- [x] Email/password authentication surface with registration, login, validation, protected routes, secure error states, and user-requested removal of forgot-password OTP flow
- [x] Authenticated dashboard with sidebar navigation, latest risk snapshot, health summary, quick actions, history, reports, and analytics overview
- [x] Gender-aware assessment flow with male/female fields, pregnancy status, validation, BMI calculation, and assessment outcome flow
- [x] Random Forest and XGBoost prediction-pipeline architecture with preprocessing, persistence, and evaluation metrics
- [x] Assessment outcomes with risk percentage, confidence, health score, BMI, risk category, and animated risk meter
- [x] Personalized diet, exercise, lifestyle recommendations, and health-insights experience
- [x] Professional healthcare PDF report generation with required medical disclaimer and report history controls (server PDF generation, storage metadata, archive UI, and disclaimer are implemented)
- [x] Chart.js trend visualization component wired into the dashboard risk trend card
- [x] Role-protected admin analytics foundation with aggregate stats procedure and admin surface
- [x] Backend schema, query helpers, typed assessment procedure, and secure API contract foundation
- [x] Vitest coverage for core assessment calculations and backend behaviors
- [x] Responsive visual verification across desktop and mobile breakpoints
- [x] Final checkpoint and delivery of the completed project version

- [x] Install and verify Python ML dependencies and run the pipeline against the Pima dataset
- [x] Persist verified Random Forest/XGBoost artifacts and metrics output after the Pima training run
- [x] Add profile, recommendation, and report query helpers and typed procedures
- [x] Add backend tests for assessment validation, create/list procedures, and persistence behavior (calculation and authorization coverage; DB integration remains environment-dependent)
- [x] Add production PDF generation path with stored report metadata and required disclaimer
- [x] Add Chart.js trend component for dashboard risk analytics
- [x] Add role-protected admin analytics page and procedure foundation
- [x] Final verification and delivery checkpoint after all remaining items are complete

- [x] Wire the admin page to the protected aggregate statistics procedure and remove placeholder metrics
- [x] Add client-side authentication and role gating states for the admin page
- [x] Add authorization and aggregate-stat tests for the admin procedure
- [x] Add an admin-path test for admin.stats that verifies authorized access and aggregate-stat response shape
- [x] Add assessments.create tests for valid input, invalid input rejection, and returned risk/recommendation payload shape
- [x] Add assessments.list tests for authenticated access and expected list behavior
- [x] Add an isolated test for the assessment persistence helper path

- [x] Use the Pima Indians Diabetes Dataset as the primary training dataset with documented provenance
- [x] No synthetic healthcare records were required; testing uses isolated mocked procedure fixtures only
- [x] Implement local Email/Password registration and login with secure password hashing, validation, and JWT sessions
- [x] Removed Google OAuth login from scope per user instruction
- [x] Removed email OTP password reset from scope per user instruction
- [x] Add Pima-specific preprocessing, training, evaluation, model persistence, and inference mapping for Random Forest and XGBoost
- [x] Add verified model artifacts and metrics output from the Pima dataset
- [x] Complete MySQL-backed profile, assessment, prediction, recommendation, and report workflows (procedures and isolated persistence coverage are complete; live assessment/report and storage verification completed)
- [x] Complete server-side healthcare PDF generation/storage and report history operations (fresh signed URLs are returned and archived reports are re-signed on demand)
- [x] Verify the intended local-auth-only, assessment, reporting, admin, responsive, and theme flows (a dedicated local verification account was created and authenticated, unchanged profile fields saved successfully, Dashboard/Profile/Assessment/Reports/Assistant/post-logout protected state were rechecked, theme toggled to persisted light mode, and a 375px responsive view was captured; prior live assessment/report evidence and documented admin blocker remain valid)
- [x] Save final completed checkpoint and deliver the project version
- [x] Add dataset provenance documentation with UCI/Kaggle context, exact mirror URL, checksum, and source-selection rationale

- [x] Remove OTP, Google OAuth, SMTP, social login, and external-auth references from the DiaSense implementation scope
- [x] Implement local Email/Password registration, login, logout, JWT session handling, password hashing, and validation
- [x] Implement authenticated change-password and profile-management flows using MySQL storage
- [x] Add local-auth route and procedure tests, including password hashing and protected access behavior
- [x] Continue final DiaSense assessment, Pima ML, recommendation, analytics, report, admin, theme, and branding verification (compile/tests verified; live DB and browser auth flows remain deployment checks)

- [x] Disable the legacy external OAuth callback from the product runtime; local auth is the only product flow
- [x] Wire the dashboard sign-out control to the local auth logout mutation and redirect after logout
- [x] Add local-auth procedure tests for registration, login, logout success, and failure behavior

- [x] Add explicit unauthenticated and error handling to the Profile page
- [x] Replace the dashboard Profile placeholder with a working /profile link
- [x] Add protected procedure tests for auth.changePassword and auth.updateProfile

- [x] Add a successful local login test that verifies session cookie issuance
- [x] Add a duplicate-email registration failure test
- [x] Run and document end-to-end verification for local auth, profile, assessment, reports, admin, theme, responsive layout, and branding (route screenshots and compile/test verification completed; live MySQL/storage mutation requires deployment environment)

- [x] Wire the reports UI to the protected server-generated report procedure using the authenticated latest assessment
- [x] Add report-generation tests for success and storage failure propagation; disclaimer is covered in the server generator implementation
- [x] Verify report history reads and exposes stored server-generated report records/downloads through protected list data and stored URLs

- [x] Add explicit auth-required handling for the Reports page and other protected product routes
- [x] Replace hardcoded report-generation payloads with real authenticated latest-assessment and user data
- [x] Use returned stored report URLs and invalidate report history after generation
- [x] Test the real PDF service for disclaimer text and storage failure handling
- [x] Verify generated reports appear in live report history with working stored downloads (live report DS-2026-23295227 appeared with a working signed-download control)

- [x] Audit Assessment, Insights, Dashboard, Reports, Admin, and Profile for explicit loading, unauthenticated, and error states
- [x] Add missing protected-route UX and verify each route with screenshots/navigation checks

- [x] Fix Reports hook-order runtime error caused by conditional rendering before useMemo
- [x] Re-run type checks, tests, and report-route screenshots after the hook-order fix

- [x] Add explicit error-state handling to Assessment and protected routes
- [x] Run browser verification for login, profile update, assessment submit, report generation/history refresh, admin access, logout, and protected-route redirects (verified dedicated-account registration, logout, true post-logout sign-in, and no-change profile save; submitted a fresh non-personal assessment with a 21% informational risk result, generated report DS-2026-22126BA3, and observed its refreshed archive entry; authenticated Profile/Assessment/Reports/Dashboard and protected Dashboard state were checked; the documented admin-route constraint remains valid)
- [x] Capture explicit end-to-end evidence for the admin flow in a live authenticated session, or document a valid blocker if no admin credentials are available (the available public browser session hit a captcha/sign-in requirement; automated admin route and rendered-state coverage remain verified)
- [x] Verify live MySQL/storage-backed assessment and report flows end to end (live assessment, stored report, signed download, and direct PDF resolution verified)

- [x] Audit Admin for explicit loading, unauthenticated, forbidden, and statistics-query error states
- [x] Re-run protected-route verification after completing the Admin error-state audit
- [x] Capture post-change Admin route verification evidence for protected loading, unauthenticated, forbidden, and statistics-error states

- [x] Exercise Admin loading, unauthenticated, forbidden, and statistics-error states individually
- [x] Add a targeted Admin UI/state test for statistics-query error handling

- [x] Keep the DiaSense AI implementation Lite-compatible by avoiding unnecessary external services, heavy runtime dependencies, and optional complexity

- [x] Audit Lite compatibility of dependencies and external integrations
- [x] Document required storage, Chart.js, jsPDF, and intentionally unused framework-level auth pieces for Lite operation
- [x] Re-run Lite verification after the audit and documentation pass

- [x] Remove all hardcoded personal names from UI, reports, fixtures, and copy
- [x] Keep registration Full Name empty by default and persist the submitted name for the new account
- [x] Use the authenticated database user name in dashboard, profile, assessment results, and PDF report flows
- [x] Verify dynamic name propagation and absence of hardcoded personal-name values with source audit and passing test suite

- [x] Verify Profile renders the authenticated database user name and does not use stale or hardcoded personal data
- [x] Add targeted dynamic-name regression verification across registration, user context, profile, dashboard, and PDF/report generation
- [x] Document a broader source audit covering application code and test fixtures for hardcoded personal names

- [x] Add focused dynamic-name verification for registration persistence, authenticated user context, profile/dashboard display, and client/server PDF inputs
- [x] Write a durable source-audit note documenting the hardcoded-name scan scope and zero remaining personal-name matches
- [x] Re-run focused and full verification after adding dynamic-name coverage and audit documentation

- [x] Add focused test for registration name persistence and auth.me name retrieval
- [x] Add focused verification for Dashboard and Profile dynamic name rendering through source assertions and authenticated UI wiring
- [x] Add focused verification for client-side PDF generation using the authenticated user name
- [x] Re-run dynamic-name verification after these focused checks

- [x] Add a targeted client-PDF verification proving the authenticated user name is used instead of any hardcoded or default personal name
- [x] Re-run dynamic-name verification after the client-PDF check

- [x] Move the client PDF dynamic-name test into the active Vitest test scope by expanding Vitest includes
- [x] Confirm the client PDF dynamic-name test appears in test output and captures authenticated name usage
- [x] Re-run dynamic-name verification after the client PDF test is executed

- [x] Add an executed client PDF runtime/component verification proving generated content contains the authenticated user name
- [x] Re-run the full dynamic-name verification with runtime client PDF coverage and broader source audit

- [x] Fix deployed registration Full Name stale placeholder in the production source and rebuilt bundle
- [x] Audit built assets and /auth source path for cached hardcoded personal-name content
- [x] Rebuild, checkpoint, and verify the corrected live registration screen

- [x] Fix generated report URLs that currently resolve to 404 under /manus-storage/reports
- [x] Audit storagePut return values and report metadata persistence for deploy-safe download URLs
- [x] Add regression coverage for generated report URL resolution and stored download behavior
- [x] Re-run report generation, download, and full project verification after the fix (live assessment/report flow, production build, TypeScript, and 31-test suite verified)
- [x] Add user-visible error handling and retry feedback for archived report downloads when signing or storage access fails
- [x] Add a targeted report-history regression test covering signed-download mutation and failure feedback
- [x] Add an automated archived-download success test proving a resolved signed URL navigates the user-initiated popup
- [x] Capture concrete live evidence that the archived PDF opens or downloads successfully after signed-link resolution (exact persisted URL returned PDF content: Page-1)

- [x] Remove decorative leading slash characters from dashboard navigation and section labels
- [x] Make the dashboard View your plan action navigate to personalized health insights
- [x] Verify the corrected dashboard on the published responsive UI

- [x] Prevent the published custom domain from serving stale cached dashboard HTML after a checkpoint
- [x] Verify the custom domain references the refreshed dashboard bundle with slash-free labels

- [x] Remove decorative slash prefixes from all user-facing DiaSense AI interface copy
- [x] Make every Insights Add to routine recommendation save and show an active routine state (live action changes to Added to routine and updates the routine count)
- [x] Add regression coverage and verify the slash-free Insights experience on the published site (custom domain verified)

- [x] Add a medically safe contextual AI Health Assistant with visible non-diagnostic guidance and emergency escalation copy
- [x] Surface a high-risk assessment escalation state that requests location permission before searching for nearby clinicians
- [x] Add nearby diabetes/medical doctor results with maps-based directions links, without hardcoded provider recommendations
- [x] Add test coverage and live verification for assistant safety, high-risk state, permission denial, and doctor-search UI (live assistant response, high-risk escalation, public map, clinician results, and directions verified)
- [x] Independently simulate granted and denied geolocation outcomes for the high-risk clinician finder (simulated non-personal location and visible denied fallback verified)
- [x] Add an executable Assistant UI test that mocks geolocation denial and verifies the visible permission-denied fallback state
- [x] Add an executable Assistant UI test that mocks successful geolocation and verifies clinician-result or deterministic no-result handling

- [x] Add natural AI reply loading and typewriter rendering with reduced-motion support
- [x] Add transparent nearby-doctor sorting by distance and available patient ratings
- [x] Add regression coverage and verify the refined assistant interaction on the published site
- [x] Live-verify the refined assistant on the published site by triggering an AI reply and confirming the composing and typing experience is visible
- [x] Live-verify nearby-doctor sorting on the published site by loading clinician results and switching between Distance and Patient rating

- [x] Detect Hinglish-style assistant questions and request a clear Hinglish reply
- [x] Render assistant response details as readable structured pointers where available
- [x] Add regression coverage for Hinglish language matching and pointer-style reply formatting
- [x] Add behavioral tests for Hinglish and English assistant response-style selection
- [x] Verify the assistant chat procedure passes the selected language style to the LLM messages
- [x] Render common markdown-style AI bullet lists as clean readable pointers without visible markdown markers
- [x] Add live verification that a Hinglish reply displays in natural language with clean pointer formatting
- [x] Normalize common markdown-style assistant lists on the server before returning the response
- [x] Add behavioral coverage for server-side markdown-list normalization
- [x] Capture identifiable clinician ordering before and after rating sorting on the published site
- [x] Confirm separate rendered Hinglish pointer lines in the published assistant message DOM
- [x] Live-verify fresh local-account login without altering user profile data
- [x] Live-verify a profile-save round trip without changing profile values
- [x] Recheck published light/dark theme and a narrow responsive viewport for final verification
- [x] Live-verify a dedicated-account local sign-in after logout
- [x] Live-verify report generation and history refresh in the current authenticated browser session

- [x] Build a dedicated Settings page with essential account, privacy, and appearance controls
- [x] Add a clear Settings logout action with confirmation and local-session sign-out feedback
- [x] Require sign-in before assessment access after logout, with a clear route to local login
- [x] Add settings and post-logout assessment-access regression coverage
- [x] Live-verify Settings controls and the post-logout assessment sign-in gate (published Settings showed account, appearance, privacy, and confirmed sign-out controls; after sign-out, Assessment required login at /auth?next=%2Fassessment and successful local sign-in returned directly to the assessment form)

- [x] Show a time-aware dashboard greeting based on the user’s local hour
- [x] Return an authenticated user-specific latest assessment and risk-history summary for the dashboard
- [x] Replace hardcoded dashboard risk, score, BMI, activity, and graph values with current assessment data
- [x] Add tests for greeting selection and user-specific dashboard summary behavior
- [x] Live-verify dashboard refresh after a user’s latest assessment data is loaded (published dashboard displayed Good evening based on local time and the authenticated user’s latest 17% low-risk assessment, 91% confidence, 83 of 100 health score, 23.7 BMI, moderate activity, one-entry trend, and matching recent activity)

- [x] Update visible project-credit branding to “Project Developed by Vishnu Singh”
- [x] Add regression coverage confirming the project credit while preserving dynamic account names
- [x] Publish and verify the requested project-credit update (published landing-page footer now visibly shows “Project Developed by Vishnu Singh”)

- [x] Replace static Insights metrics with authenticated user-specific assessment and history data
- [x] Calculate BMI, risk trend, and health-score change only from available user assessment records
- [x] Audit and connect assessment risk predictions to the persisted Pima-trained model inference path
- [x] Add regression tests for user-specific Insights and validated prediction inputs
- [x] Live-verify Insights values and risk output after a current user assessment (published non-personal assessment produced a 15% Pima Random Forest risk signal, 23.7 BMI, 85 of 100 health score, and 82% model consistency; the published Insights refresh then showed the saved 23.7 BMI, a -2 point risk trend, and 85 health score from the authenticated user history)

- [x] Restore the simple core assessment fields shown in the requested form
- [x] Remove pregnancy inputs and pregnancy-status logic from the male assessment path
- [x] Keep submitted core values and the displayed risk result consistent in the stable assessment flow
- [x] Add regression coverage for simplified profile-specific fields and risk submission
- [x] Live-verify the simplified male and female assessment forms (published male and female paths both display only Age, Height, Weight, Blood Pressure, Glucose, Family History, and Physical Activity; no pregnancy or other extra input appears)

- [x] Add Pregnancy Status only to the female assessment profile
- [x] Keep the male assessment profile free of pregnancy controls and submission data
- [x] Add profile-specific pregnancy field regression coverage and live verification

- [x] Add an isolated authenticated Daily Health Check-in feature for real-life glucose, blood-pressure, step, sleep, and water entries
- [x] Create protected storage, a dedicated daily-log page, and user-specific recent-history presentation without modifying assessment or prediction flows
- [x] Add tests, regression-isolation checks, and live verification for the Daily Health Check-in workflow

- [x] Add seven-day steps, sleep, and water progress charts to the private Daily Health Check-in experience
- [x] Add authenticated daily-health-log export in CSV and PDF formats
- [x] Add an opt-in in-app reminder at the user’s selected daily time
- [x] Add an opt-in persisted background reminder record that appears on the user’s next login
- [x] Verify that assessment, prediction, dashboard, reports, and authentication flows remain unchanged after the enhancements
