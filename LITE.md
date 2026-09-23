# DiaSense AI Lite profile

DiaSense AI Lite uses the existing managed Node server, MySQL database, local Email/Password authentication, and built-in object storage. No Google OAuth, email OTP, SMTP, SMS, social login, or user-configured external authentication provider is required.

The Pima training pipeline runs offline during development or model maintenance and persists the resulting Random Forest and XGBoost artifacts. The deployed application performs lightweight inference and does not train models per request. Chart.js provides the required trend visualizations, and jsPDF supports the browser fallback report download. The server-side report path uses the platform’s built-in storage helper because report files must not be kept in the database.

The framework still contains reusable OAuth SDK modules because they ship with the scaffold and the signed session infrastructure is shared. The product runtime does not register the OAuth callback route, and the user-facing application exposes only local Email/Password authentication. These framework files are intentionally retained to avoid modifying scaffold internals unnecessarily.

Lite verification: `pnpm check` and `pnpm test` pass with 22 tests. Live MySQL connectivity has been confirmed with a read-only aggregate query. Interactive authenticated mutation and storage-download checks remain environment validation steps rather than required Lite credentials.

## Dynamic-name audit

The application source under `client`, `server`, `shared`, and `ml`, excluding generated logs and repository metadata, was scanned for the previously hardcoded personal name and other named examples. No personal-name literal remains in application source. Registration initializes the controlled Full Name field as an empty string, the server persists the submitted name, `auth.me` supplies the authenticated database user, and Dashboard, Profile, Assessment, and both PDF paths consume that dynamic value. The real server PDF test asserts that the supplied patient name is present alongside the medical disclaimer.

## Live registration verification

On 23 August 2026, the deployed `/auth` route was opened and switched to registration mode. The Full Name input displayed the neutral placeholder `Enter your full name` and contained no hardcoded personal name. The production bundle had already been rebuilt and its stale-name scan was clean.
