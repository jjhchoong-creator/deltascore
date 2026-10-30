# DeltaScore

Private development source snapshot for DeltaScore, a UCAT mock-logging, reflection and progress product.

## Contents

- `ui-cloud-integration/source/`: current browser application, optional account-connected controllers, integration server, and selected browser/emulator regression harnesses.
- `backend-integration/source/`: account/session, authentication boundary, mock storage/client/intent, paid-daily policy, emulator configuration and backend tests.
- `product-requirements/`: editable Word and canonical Markdown product requirements, dated 30 October 2026.
- `SOURCE-SNAPSHOT.json`: SHA-256 inventory of files copied from the development workspace. This is source provenance, not release certification.

## Current status

This is a development snapshot, **not a deployed or production-ready website**. The existing anonymous UI is browser-local. Account-connected paths use explicit injected sessions/clients and have been exercised with fictional data in Authentication/Firestore emulators. Successful emulator tests do not establish live authentication, live storage, billing, email delivery, security compliance or release approval.

Account-saved review editing has bounded browser/emulator acceptance. The initial account-saved Progress raw-score display has passing implementation checks; additional ownership/collector verification is in progress at export. Account Progress filters and review-label analytics are not complete. The included PRD predates this latest Progress implementation and distinguishes requirements from implementation evidence.

## Running and testing

Backend dependency versions and the existing narrow test commands are in `backend-integration/source/package.json` (Node.js 22 or newer). Emulator tests additionally require the declared Firebase tooling and a compatible Java runtime.

The selected browser test harnesses and `pd-run.account-progress.sh` were authored for an isolated development workspace with preinstalled tools, pinned source dependencies and browser/emulator paths. They are retained as source, **not presented as a portable one-command test setup**. Historical output, machine caches, emulator stores and credentials are deliberately not included. A clean-clone run has not been verified for this export.

Keep `integration-server.js` private to a local/emulator development setup. Never open its static source directories publicly or substitute an emulator configuration into a production deployment.

## Safety and scope

This snapshot excludes assistant configuration/memories, credentials, keys, environment files, private execution transcripts, screenshots/log collections, dependency caches, historical build directories and discarded source revisions. Selected tests use fictional emulator fixtures; no real student database is included.

A Gitleaks scan of the upload tree completed with no remaining findings. Three initial findings were reviewed as two literal SHA-256 source guards, not credentials; `.gitleaks.toml` narrowly allows only those exact hash strings. Automated scans reduce risk but do not prove absence of every possible sensitive value.

No licence or third-party redistribution permission is granted by this repository. Original dependency/asset rights remain with their owners. Repository visibility is private; publishing it requires a separate review and approval.

This is a point-in-time export. Automatic synchronization from the VPS is **not configured**.
