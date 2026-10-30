# DeltaScore — Whole-Product Requirements Document

| Field | Value |
| --- | --- |
| Document | DeltaScore Product Requirements, version 1.0 |
| Snapshot date | 30 October 2026 (compiled 11:27 UTC; parent-reviewed 11:45 UTC) |
| Status | Consolidated requirements baseline for the whole product. Reader-facing product specification, not a test diary. |
| Cutoff rule | This document consolidates the principal saved DeltaScore product discussions and decision records identified in Appendix B through the snapshot date, with later explicit decisions overriding earlier ones. It is a whole-product synthesis, not a verbatim transcript or a claim that every historical message/file was audited. Dates, prices, models and official cycle examples quoted inside source records are attributed to those records at retrieval time; none are re-verified as current facts by this document. Any live date-sensitive rule (official testing-cycle end dates, provider availability, model pricing) must be re-checked against primary sources before enabling the affected feature. |
| Authority method | Where records conflict, the narrower, later record governs (for example mock-review-session-current-contract.md supersedes older optional-stage statements; limit-upgrade-flow.md's latest paid policy supersedes the withdrawn 100-total cap; the onboarding correction records supersede older wording). MASTER-BUILD-BRIEF.md is an older consolidation and is overridden in important areas; its assumptions are restated here only where a later record confirms them. |

## How to read the status labels

Every statement in this document carries one of these labels:

| Label | Meaning |
| --- | --- |
| APPROVED | Joseph agreed the requirement (recorded with message ID where available). |
| PROPOSED | Recommendation from Edith/parent; not agreed. Never to be treated as a requirement. |
| DEFERRED | Agreed as wanted but explicitly lower priority; not in current scope. |
| REJECTED / SUPERSEDED | Decided against or replaced by a later decision; retained in Appendix A for history. |
| OPEN | A genuine unresolved product decision; blocked pending Joseph. |
| ENGINEERING | Parent/implementation choice, not user policy. |
| EVIDENCE | Implementation status fact: browser-local (vanilla prototype), emulator (Firebase/Auth emulator + loopback HTTP), or live-not-verified. |

## 1. Product definition

### 1.1 Product goal (APPROVED)

DeltaScore is a UCAT full-mock reflection, analytics and practice-follow-up workspace. It helps students log full mock results, review individual questions, see estimated scaled score progress, and add resource-aware practice tasks; approved linked tutors can follow up with notes and assignments. (MASTER-BUILD-BRIEF.md §1)

- REQ-1.1.1 (APPROVED) Prioritise independent students; supporting a linked tutor is secondary. (mock-logging-decisions.md; MASTER §1)
- REQ-1.1.2 (APPROVED) It is NOT a question bank, NOT an official score, and NOT a validated score-prediction service. The estimated scaled score is explicitly labelled "Estimated scaled score" and is a consistent reporting measure only. (MASTER §1, §5; mock-logging-decisions.md "Agreed score wording")
- REQ-1.1.3 (APPROVED) First version covers UCAT full mocks only. Single-section mocks are planned for the future, not included. (mock-logging-decisions.md "Agreed scope for mock types")
- REQ-1.1.4 (APPROVED) UK default jurisdiction; UK versus ANZ scoring applicability remains a pre-launch domain check, not a locked assumption. (onboarding-confirmed-rules-and-resources.md; mock-logging-decisions.md "Domain reference checked")

### 1.2 Audiences and roles

| Role | Description |
| --- | --- |
| Anonymous visitor | Public landing page only; the browser-local preview workspace starts in an anonymous local mode (EVIDENCE: anonymous save path verified in emulator/browser tests, ui-cloud fm-family checks). A button in the prototype is not an account. |
| Student (independent) | Core user: signs up, onboards, logs mocks, reviews questions, uses analytics, builds a practice to-do list, keeps personal notes, manages settings. |
| Tutor / Educator | Approved educator who can receive explicitly consented linked students, view agreed student data, write attributed notes and assign practice. |
| Platform administrator | Manually verifies educator role before any educator features or data access. |

- REQ-1.2.1 (APPROVED) Sign-in method alone never grants an educator role or student-data access; manual administrator approval is always required. (accounts-settings-decisions.md sign-in §1; educator-dashboard-decisions.md batch 1 §1)
- REQ-1.2.2 (APPROVED) A student answering "yes" to having a tutor grants no sharing, no educator privilege and no funding. Self-reported tutor status is context only. (MASTER §2; accounts-settings-decisions.md signup onboarding)
- REQ-1.2.3 (APPROVED) Shared organisation/staff access is not authorised; only the single approved, actively linked tutor receives educator access. (educator-dashboard-decisions.md scope status)

### 1.3 Non-goals (APPROVED / DEFERRED)

- Not a question bank or provider integration; no provider question import in the first version. (mock-logging-decisions.md; question-review-decisions.md)
- No official/validated score prediction, percentile, admissions advice. (scaling-research.md; MASTER §1)
- Cookie-scanner/Kukie-style marketing examples from the old source PDF are stylistic context only, NOT DeltaScore features; no counterfeit testimonials, invented pricing tiers, AI diagnosis guarantees or accessibility overlay-as-compliance. (MASTER §1)
- Downloadable score-sharing cards are requested but explicitly below core functions (DEFERRED — section 18).
- No automatic social posting, public links, live payments, public deployment or AI use is implied anywhere in this document.

### 1.4 Visual direction and information architecture

- REQ-1.4.1 (APPROVED) After Joseph rejected the earlier clinical preview, the entire visual system was remade reference-led: minimal near-white, deep ink, one blue accent, deliberate readable sans, compact top navigation, no permanent explanatory/profile sidebar. Settled product logic (flows, quota, immutability) was preserved, not redone. (REDESIGN-DIRECTION.md; visual-design-approval.md, "yes thats great", Discord 1559889710912897095)
- REQ-1.4.2 (APPROVED) Home is an action workspace: prominent Log mock, practice/to-do ledger, recent mocks/results, and exam-countdown context only when a date is known; unknown/today/past dates handled neutrally. No generic SaaS hero, invented social proof or live statistics in the signed-in dashboard. (MASTER §1; REDESIGN-DIRECTION.md)
- REQ-1.4.3 (APPROVED) Profile, resources, tutor, access and preview-detail explanations live in Settings. (visual-design-approval.md; REDESIGN-DIRECTION.md)
- REQ-1.4.4 (APPROVED) Public marketing and the signed-in workspace are distinct contexts; the landing page is frozen as approved (graph-led right preview, "Example analytics" label, illustration retained) unless Joseph asks for change. (landing-final-approval.md, Discord 1559959294357807246)
- REQ-1.4.5 (APPROVED) The old product PDF/brief is NOT implementation authority; later explicit agreements govern, and ambiguous provenance must be asked directly rather than filled from the old brief. (REDESIGN-DIRECTION.md, Discord 1559864468899373148)
- REQ-1.4.6 (APPROVED) Truthful but unobtrusive browser-local / not-live disclosure; never hide missing integrations to appear production-ready. (REDESIGN-DIRECTION.md)
- Production target stack (ENGINEERING context): Next.js/TypeScript/React with a Firebase backend, frontend and backend as separate phases; the current portable vanilla HTML/JS candidate is a browser-local design/implementation artifact, not the production stack. (MASTER §1; frontend-completion-ledger.md)

## 2. Accounts, sign-in and recovery

All requirements APPROVED in accounts-settings-decisions.md "Agreed sign-in and account recovery" (Discord 1559828619432435734). These are product requirements, not configured or tested integrations (EVIDENCE: live sign-in/recovery is not verified; real Auth-emulator token verification and account-session foundations were separately exercised, but do not establish a live student-facing login).

- REQ-2.1 (APPROVED) First-version sign-in offers email/password and Continue with Google, for students and tutors.
- REQ-2.2 (APPROVED) Verify ownership of the signup email before access to the private workspace. Google sign-in satisfies verification when the authentication service supplies a trusted verified-email result; do not re-ask.
- REQ-2.3 (APPROVED) Email/password users can request a time-limited, single-use password-reset link. Reset preserves account records and access entitlements. Google-only users are directed to Google account recovery.
- REQ-2.4 (APPROVED) Different sign-in methods must not silently create duplicate workspaces or auto-merge accounts on matching email; guide users to the existing account and link a method only after proving ownership. Do not reveal private account information to unauthenticated users.
- REQ-2.5 (ENGINEERING/OPEN) Live authentication configuration, browser sign-in/recovery wiring and deployment-specific session handling remain integration work; accepted emulator auth/session controls must be reused rather than rebuilt (E1 in backend-integration/account-cloud-requirements-map.md).

## 3. Onboarding

Authority: accounts-settings-decisions.md "Agreed signup onboarding" (Discord 1559784011700772885) and finishing touches (1559784470192590869), refined by onboarding-confirmed-rules-and-resources.md (Discord 1560129541676994664) and onboarding-resource-ui-correction.md (Discord 1560133445169053718).

- REQ-3.1 (APPROVED) Four questions in this fixed order: target score, exam date, preparation resources, tutor status. One question per screen with Back/Next and a simple step indicator (Step x of 4).
- REQ-3.2 (APPROVED) Target score is required: a whole-number cognitive TOTAL from 900 to 2700 inclusive, or the explicit option "Not sure yet". SJT is separate and never part of this target. Do not accept a past exam date; today is allowed.
- REQ-3.3 (APPROVED) Exam date is required or "Not booked yet"; reject dates earlier than the student's local-calendar today (never determine "today" by UTC string slicing). Do not invent an official booking-window constraint.
- REQ-3.4 (APPROVED) Tutor answer required (yes/no); existing unknown handling remains only as previously agreed in direct records; no invented tutor sharing.
- REQ-3.5 (APPROVED) Resources: multi-select from UK-default named providers MedEntry, Medify, PassMedicine and UCAT Ninja, plus "Other" (resource name plus material-type checkboxes). No "None" option; the official UK question bank baseline is shown as "Official UK question bank · Included" — a default inclusion, not verified personal access.
- REQ-3.6 (APPROVED) Known providers get conservative material-type prefill from saved provider research (advertised offerings only — not subscription access, integration or availability proof). Prefill helper copy: "Prefilled from provider information—adjust to match your access." Joseph-confirmed mapping: Medify = all six material types. When a known provider is selected alongside "Other", no per-material tickboxes are shown for the known provider; only "Other" requests name + material-type checkboxes. Student amendments must not be silently overwritten on Back/reload/reselect.
- REQ-3.7 (APPROVED) Material-type catalogue (exact labels): Full mocks; Mini/section mocks; Question banks; Topic sets; Walkthroughs/worked examples; Lessons/guides. Declared resources confer no provider permission or filter-existence guarantee.
- REQ-3.8 (APPROVED) Save onboarding progress: a student who leaves partway resumes at the unanswered step without re-entering saved answers. All answers are editable later in Settings.
- REQ-3.9 (APPROVED) No exact question/mock quantities, prices, performance promises or provider branding assets in onboarding; unknown is never presented as absent. (onboarding-confirmed-rules-and-resources.md)
- EVIDENCE: onboarding UI implemented and independently reviewed in the browser-local candidate (onboarding-frontend-step-d-review.md as historical bounded PASS; later Settings/onboarding behavior exercised in browser-local P5b work). Not a live service.

## 4. Mock logging

Authorities: mock-logging-decisions.md; limit-upgrade-flow.md (current policy); mock-review-session-current-contract.md; saved-mock editing restriction (Discord 1559833584485793793).

- REQ-4.1 (APPROVED) Log full mocks with raw earned/maximum results per section. Required cognitive sections: VR, DM, QR. SJT is optional; skipped SJT is missing, never zero. An explicitly entered zero is valid.
- REQ-4.2 (APPROVED) DM supports two scoring modes: question-count out of 35, or weighted/partial-credit marks out of 47. The chosen mode is saved with each record; the 35/47 denominators are student-requested formats, not universal provider facts.
- REQ-4.3 (APPROVED) Fixed maxima are displayed as clearly labelled non-editable text (e.g. an earned input followed by "/44 questions"), never as input-like editable boxes: standard maxima VR 44, DM 35, QR 36, weighted DM 47 tied to the selected mode. Saved/legacy records keep their actual stored maxima; no silent rewriting or clamping. (mock-logging-ui-correction-and-final-audit.md, Discord 1561727253862424607)
- REQ-4.4 (APPROVED) Provider/source and mock name/number are optional but preferred; missing identification must not block logging. Use a clear fallback title ("Untitled mock"; exact wording not locked) and never invent a provider.
- REQ-4.5 (APPROVED) Automatically save the date logged; do not ask for a separate completion date; the date logged makes no claim about when the mock was completed. (The editable-completion-date proposal was rejected.)
- REQ-4.6 (APPROVED) An optional whole-mock free-text note (students write anything; no prompts or ratings). Blank never blocks saving. It is separate from per-question reflections and is shown in the overview as written when present, omitted when absent.
- REQ-4.7 (APPROVED) Saving requires raw results for every cognitive section (SJT excepted). Qualitative data and question reviews may be incomplete; they never block saving core results.
- REQ-4.8 (APPROVED) After a successful save, identification, raw results and DM scoring mode are immutable — students cannot edit a saved mock to substitute a different mock. No paid-user editing exception was approved. Question reviews remain viewable and completable/editable afterwards; the immutability rule does not freeze review activity. (Discord 1559833584485793793; mock-review-session-current-contract.md)
- REQ-4.9 (OPEN) Whether the whole-mock note remains editable after saving, and any typo-correction process that does not enable mock replacement, remain unsettled. Do not invent an exception.
- REQ-4.10 (APPROVED) Allowance behaviour (see section 17 for the paid policy): a Log-mock attempt after the allowance is spent shows the limit/upgrade message from ANY entry point instead of starting another mock; existing records and allowance accounting are preserved. (limit-upgrade-flow.md, Discord 1563150307251453963)
- EVIDENCE: browser-local score-entry/draft/validation/recovery historically verified; account-backed save, detail, list and delete implemented and accepted only at the emulator/preview level (backend-integration and ui-cloud-integration acceptance records). No live persistence.
## 5. Question-review session (journey and coverage)

Operative authority: mock-review-session-current-contract.md (settled by Discord 1562374206312681483 and 1562375261562081332), which supersedes the earlier optional-stage and post-save-review sequences in question-review-decisions.md and analytics-advice-practice-decisions.md.

- REQ-5.1 (APPROVED) Required journey: enter cognitive scores → individual-question review STAGE → review as many mistakes as the student chooses → explicit final Save (with confirmation, section 6) → completed session, celebration and overview. The review stage is part of the journey, not a bypass labelled optional.
- REQ-5.2 (APPROVED) Zero reviews are explicitly allowed, even when mistakes exist and even for perfect scores. No minimum-review count, no all-mistakes quota, no filled-field gate. Unreviewed mistakes are not incomplete work, do not withhold celebration, and do not reopen session completion later.
- REQ-5.3 (APPROVED) First-version review population: incorrect, partially correct and skipped/unanswered questions. Correct-but-guessed questions are EXCLUDED from this first version (later correction superseding earlier inclusion); genuinely incorrect guesses keep the existing Guess labels. Selection is manual by section and question number from the student's provider-marked results; student-reported, not independently verified; no provider integration or automatic import is assumed.
- REQ-5.4 (APPROVED) Selecting a question for review never changes earned marks, partial marks or the calculated score.
- REQ-5.5 (APPROVED) Descriptive coverage counts are per-format: for genuine question-count formats (VR out of 44, QR out of 36, DM count-mode out of 35) derive the incorrect denominator as recorded maximum minus earned; show e.g. "3 out of 5 incorrect questions reviewed". Weighted/partial-credit DM shows only the actual reviewed count ("3 questions reviewed") — lost marks are not a question count. Unsupported legacy formats get no invented denominator. Count only unique section/question identities actually marked reviewed; never count absent questions, infer identities from aggregate scores, or cap the numerator.
- REQ-5.6 (APPROVED) The final Save does not falsely mark unreviewed questions reviewed; reviewed status remains the explicit per-question "Mark reviewed" mechanism unless deliberately replaced later.
- REQ-5.7 (APPROVED) Students can reopen a reviewed question and unmark it (updating the descriptive count, not the saved session-complete status); can edit/add question-review content later without reopening completion, replaying celebration, editing raw scores/identity/mode, or resetting quota.
- REQ-5.8 (APPROVED) Review drafts autosave within the flow and resume; students may save partway through reviews with completed reviews and unfinished drafts preserved; reopening a saved mock allows adding later questions to review.
- EVIDENCE: implemented in the browser-local candidate and accepted as a bounded slice (mock-review-session-final-acceptance.md: 89 browser checks, 3 audit tests/21 states, keyboard/Escape behavior exercised). The account-saved review editor was later accepted at emulator level only — see section 6 and 19.

## 6. Per-question review content and label catalogue

Authorities: question-review-decisions.md; label-catalogue.md (source: PDR_-_DeltaScore_1.pdf supplied by Joseph, pages 7–9); save-confirmation contract in mock-review-session-current-contract.md.

### 6.1 Review content and status

- REQ-6.1 (APPROVED) For each selected question: reflection first, then label confirmation.
- REQ-6.2 (APPROVED) Each question offers guided reflection with the exact prompts "how I was thinking" and "what I should've thought instead", or an unrestricted free-text note, chosen per question; guided is the initial default; students can change their preferred default in Settings; the default never blocks choosing the other format for one question. Text is preserved when switching formats. Whether guided and free-text can be combined within one question remains undecided (OPEN).
- REQ-6.3 (APPROVED) All qualitative fields are optional. No compulsory reflection, label or 400-character limit. A student may mark a question reviewed with blank reflections/labels.
- REQ-6.4 (APPROVED) Marking reviewed confirms the CURRENT labels, including unchanged DeltaScore suggestions; no separate confirmation action; missing labels remain missing; it is not proof of mastery and does not create labels. If the student changed suggestions before marking reviewed, the changed selections are confirmed.
- REQ-6.5 (APPROVED) Confirmed labels stay stable when the reflection is later edited, unless the student changes labels manually or requests fresh suggestions (handling of newly requested suggestions remains undecided — OPEN). No silent overwriting of accepted labels.
- REQ-6.6 (APPROVED) Label suggestions: DeltaScore suggests question-type and error-reason labels from the agreed catalogue based on the student's reflection plus selected section; the full question text is never required; with insufficient information the suggestion is left unset rather than guessed. The suggestion preference is changeable in Settings (manual selection available). Suggestion mechanism, initial enabled default and post-edit behavior are undecided (OPEN); no suggestion AI is implemented or verified — manual labelling must work without it.
- REQ-6.7 (APPROVED) SJT review: optional question type and optional reflection, NO error-reason list; skipped SJT stays out of the review flow. Guess never hides reflections (the old document behavior was rejected). "Other" allows an optional student-written reason.

### 6.2 Exact question-type label catalogue (APPROVED, source pages 7–9)

- VR: True / False / Can't Tell; Incomplete Statements; Reading Comprehension.
- DM: Syllogisms; Logical Puzzles; Recognising Assumptions (Strongest Argument); Interpreting Information; Venn Diagrams; Probabilistic & Statistical Reasoning.
- QR: Data Interpretation; Percentages, Proportions & Ratios; Rates & Conversions; Averages & Statistics; Tax & Tiered Pricing.
- SJT: Appropriateness; Importance; Most/Least Appropriate (Less Common).

### 6.3 Exact error-reason label catalogue (APPROVED, source page 9, with user-confirmed separators)

- VR: Extreme Language; Outside Knowledge; False Equivalence; Missed Qualifier; Skim Read Error; Guess; Other.
- DM: Assumption Made; Ignored Parameter; Calculation Error; Misread Graph/Diagram; Logical Fallacy; Unable to do; Guess; other. (The run-together source phrase "Assumption Made Ignored Parameter" is confirmed as two labels.)
- QR: Unit Conversion Error; Calculator Typo; Mental Math Error; Formula Forgotten; Misread Table/Graph; Misread Question; Guess; other. ("Formula Forgotten Misread Table/Graph" confirmed as two labels.)
- SJT: none approved (document specifies reflection boxes only).

- REQ-6.8 (APPROVED) Cardinality: exactly one optional question-type label per cognitive question; multiple optional error-reason labels allowed; no minimum or primary-error ranking.

### 6.4 Save confirmation and commit semantics (APPROVED)

Authority: mock-review-session-current-contract.md "Accidental-save confirmation" (Discord 1562376253032505365 and 1562376288885415937).

- REQ-6.4.1 Both final-save paths require confirmation BEFORE any new mock commit, quota consumption, session-complete state or celebration. The purpose is preventing accidental logging, never pressuring more reviewing.
- REQ-6.4.2 Exact copy — zero actually marked-reviewed questions: "Save this mock without reviewing any questions?" with "You can add reviews later." One or more reviewed: "Log this mock now?" with reassurance that reviews remain editable later. Merely adding questions or typing is not a reviewed count.
- REQ-6.4.3 Controls — "Keep reviewing" cancels; "Log mock" confirms. Accessible app dialog; keyboard/Escape supported; initial focus on the non-committing option; focus returns to the initiating Save on cancellation; Tab/Shift+Tab stay within the dialog. This pre-save dialog is distinct from (and does not violate) the ban on blocking celebration modals.
- REQ-6.4.4 Opening or cancelling never commits a mock or spends allowance; the draft, selections and typed reviews are preserved. Failed persistence never claims success; explicit final-save retries must confirm again and never bypass confirmation of the current intended record. Ordinary review autosaves and later saved-review edits never re-prompt to log the mock.
- REQ-6.4.5 (APPROVED quota semantics, section 17) Only successful saves count; exact retries of the same save never double-count; failed saves never debit; deletion never replenishes.
- REQ-6.4.6 (ENGINEERING) Technical exactly-once enforcement/idempotency, conflict and lost-acknowledgement handling is engineering design; its verified behavior is summarized in section 19 (EVIDENCE), not restated as product policy.

### 6.5 Account-saved review editor (ENGINEERING contract; EVIDENCE: accepted browser/emulator)

The accepted extension uses the real account-owned detail snapshot and its opaque ETag, not list summaries or a browser-local mock copy. Native Edit question reviews opens a private tab-memory draft; typing does not write. Save question reviews captures the full reviews array and exact If-Match version; Cancel discards without a request. Existing catalogue types/reasons/Other and explicit reviewed flags are editable; other stored metadata is preserved. Pending/uncertain attempts freeze the captured submission. A genuine 412 retains current typing and requires explicit, cancel-safe reload/reconciliation; no silent overwrite or blind version refresh. A lost acknowledgement remains truthfully uncertain; explicit exact retry cannot duplicate a revision/debit. Account/view/editor replacement invalidates private drafts and obsolete controls/results. Already-dispatched original-owner writes may commit, but cannot present under another owner. Source: ui-cloud-integration/account-review-edit-extension-contract.md and account-review-final-connected-parent-acceptance.md. This is not live-service verification.

## 7. Saved-mock overview

Authorities: mock-logging-decisions.md; estimated-overview-final-acceptance.md.

- REQ-7.1 (APPROVED) The overview shows results section by section, each cognitive section with BOTH its raw earned/maximum result and its DeltaScore scaled result, plus the DeltaScore-calculated estimated cognitive total as the main overview score (not a provider-reported total). Display label exactly: "Estimated scaled score".
- REQ-7.2 (APPROVED) SJT is displayed separately when recorded and never contributes to the cognitive total.
- REQ-7.3 (APPROVED) The overview shows the mock title (or agreed fallback), provider/source when entered, and the original date logged.
- REQ-7.4 (APPROVED) The optional whole-mock note is shown as written when present; omitted when absent; no automatic interpretation at this stage.
- REQ-7.5 (APPROVED) The overview states the session completed; unreviewed mistakes are never flagged as incomplete work.
- REQ-7.6 (APPROVED) After the saved overview comes the refreshed overall picture and optional suggested practice (selectable into the to-do list, never auto-assigned).
- REQ-7.7 (APPROVED) No separate "How this score is calculated" explanation step in the first version (rejected).
- EVIDENCE: the fixed approved conversion is imported and served to saved overviews in the browser-local candidate (estimated-overview-final-acceptance.md: 90 browser checks; all 166 supported integer inputs model-verified); unsupported legacy records display "Unavailable" rather than an invented conversion.

## 8. Estimated scaled score — conversion, versioning and limits

Authorities: mock-logging-decisions.md (agreed rules); scaling-research.md (research provenance); estimated-score-model-acceptance.md.

- REQ-8.1 (APPROVED) Reporting range: 300–900 per cognitive section; 900–2700 cognitive total, clearly labelled as DeltaScore scores. Matching the official reporting range does not establish official status or prediction accuracy.
- REQ-8.2 (APPROVED) Conversion = exact 50/50 midpoint of MyUCAT (current default, not Legacy Mode) and TheUKCATPeople outputs for the same section, raw input and DM mode; no smoothing (smoothing was rejected). Midpoints ending in 5 round UP to the next multiple of 10; values ending in 0 are unchanged. Cognitive total = sum of the rounded VR/DM/QR section scores; SJT excluded.
- REQ-8.3 (APPROVED) Zero and missing: an explicitly entered zero maps to 300; a blank result remains missing and is never coerced to zero/300 or counted. Skipped SJT is excluded regardless.
- REQ-8.4 (APPROVED) Versioning: the conversion is frozen unless a new version is explicitly approved; source-website changes alone never trigger recalculation. If a future version is approved, existing mocks are recalculated (raw results, DM mode, date logged, notes and reviews stay unchanged) with a brief student notice that the conversion changed and their raw results did not (notice wording/delivery deferred).
- REQ-8.5 (APPROVED) Limits preserved in every display: averaging two estimates is a reporting compromise, not predictive validity; scaled display does not establish DM mode equivalence or provider-difficulty calibration; raw progression series keep the two DM modes separate; nonstandard/historical maxima are outside the verified domain and are never silently normalised.
- REQ-8.6 (IMPLEMENTED as frozen model) The frozen snapshot version is recorded in evidence as midpoint-20261006-v1, reconstructed from archived 6 October 2026 live-source observations (scaling-recovered-evidence). The research date is historical evidence, not a claim about today's provider tables.
- OPEN: exact half-value tie display rule in averages remains an implementation detail to specify.

## 9. History, analytics views and trends

Authority: analytics-advice-practice-decisions.md (thread 1559500658367930460).

- REQ-9.1 (APPROVED) History/trend filters: last 3 / last 10 / all eligible mocks, meaning the latest eligible mocks after any DM-mode exclusion, ordered by original date logged; when fewer exist use what is available and show the actual number included.
- REQ-9.2 (APPROVED) Score analytics work without completed question reviews.
- REQ-9.3 (APPROVED DM reporting) Combined estimated scaled reporting across both DM modes is the default (DM simple = question-count, DM complex = weighted/partial-credit), with options to separate modes or exclude DM simple/complex. Unlike raw series, never average incompatible raw marks/question counts into one raw series. Combined display is not validated mode equivalence.
- REQ-9.4 (APPROVED) Averages: arithmetic means of eligible stored estimated scaled scores under the selected filters; displayed as whole numbers with full precision retained internally; do not round averages to multiples of ten merely because converted singles are.
- REQ-9.5 (APPROVED SJT) SJT stays outside cognitive totals/averages; first-version SJT analytics shows recorded raw earned/maximum per mock separately; no invented band conversion; numerical SJT averaging deferred until comparable formats are defined. Missing/skipped SJT is excluded from its own summaries, not counted as zero.
- REQ-9.6 (APPROVED labels analytics) Views: confirmed-only (default) and confirmed+unconfirmed with a visible distinction. Each distinct label counts once per question; overlapping different error reasons on one question contribute overlapping counts. Display counts before percentages initially. Reviewed-subset observations are never presented as overall attempted-question error rates; missing labels are never "no weakness"; absent information is not zero.
- REQ-9.7 (APPROVED) Results/patterns are visually distinguishable from recommendations within the analytics page; they need not be separate pages.

## 10. Advice, overall focus and practice recommendations

Authorities: analytics-advice-practice-decisions.md; practice-selection-proposal.md (core rules AGREED, Discord 1559547048674467882); progress-implementation-decisions.md (six approved defaults resolving recommendation edge cases).

- REQ-10.1 (APPROVED) Advice proposes ONE overall focus with a short explanation linked to the student's recorded evidence; the student can choose a different focus and an explicit learner-chosen focus is honoured rather than silently overridden.
- REQ-10.2 (APPROVED) Personalised advice bases itself on confirmed labels, reflections and calculated score patterns. Unconfirmed suggestions may be explored but never promoted to established causes. Scores alone do not establish causes; never invent exact marks lost or guaranteed gains. With insufficient evidence, disclose the limit and offer an optional next review rather than force a diagnosis.
- REQ-10.3 (APPROVED) Evidence windows: latest 3 eligible mocks for current patterns; latest 10 for context; a section-specific confirmed pattern appearing in at least 2 of the latest 3 distinct eligible mocks counts as recurring. These are agreed product rules, not validated diagnostic cutoffs. With fewer mocks, use available evidence and disclose it; an isolated, clearly supported method gap may receive practice without being called recurrence.
- REQ-10.4 (APPROVED) Presentation: exactly up to three relevant practice options ranked Priority 1 / Priority 2 / Priority 3 (superseding the single "Recommended" label), each with a focus, concrete activity and suggested time or question quantity, and NO per-item rationale paragraph. Students explicitly Add individual items; multiple deliberate additions are allowed; nothing is ever auto-assigned. When genuinely fewer than 3 supported options exist, show fewer and offer an explicit choose-another-focus instead of fabricating weaknesses.
- REQ-10.5 (APPROVED) Reconsideration: a new mock or later review change triggers reconsideration of advice; the existing focus/routine may be retained; reconsideration never alters the student's existing selected practice tasks. Saving shows scores/overview immediately; advice refresh is optional and non-blocking, with honest "Updating"/not-refreshed states on failure (precise loading/failure implementation wording remains ENGINEERING detail).
- REQ-10.6 (APPROVED) Recommendations stay resource-aware: use the student's declared resources and material types; never generate UCAT questions/answer keys or invent provider filters, identifiers or access.
- REQ-10.7 (APPROVED, six defaults) Tie/evidence handling: the overall focus/ranking uses its own latest-3/latest-10 confirmed-evidence windows across both DM modes; exploratory chart range/mode/label filters do not silently redefine recommendation eligibility (scope is displayed clearly). Equal evidence prefers the learner-selected still-supported focus, then preserves the valid previous order, then a stable accepted-catalogue order — no invented numeric confidence. Stable catalogue routine/variant + section/focus + resource/material identity keys suggested pending tasks: editing text/date/note never bypasses "Already added"; completed matches may deliberately repeat; manual tasks are not deduplicated by text. Frontend may ship a clearly identified LOCAL DETERMINISTIC catalogue selection from confirmed structured evidence — never a live-AI or free-text-diagnosis claim; deterministic analytics and manual tasks must work with AI entirely unavailable.
- EVIDENCE: Progress page with raw-mode/filter reporting and local deterministic suggestions implemented in the browser-local candidate (historical bounded PASS; Progress C-series slices accepted stepwise). Scaled analytics display is separately gated only by the frozen conversion (now recovered/integrated per section 8).

## 11. Practice to-do list and manual tasks

Authorities: analytics-advice-practice-decisions.md "Agreed practice-item requirements"; HOME-STEP-C-REVIEW.md.

- REQ-11.1 (APPROVED) The to-do practice list holds both student-selected suggested items and manually created tasks; items are editable, markable completed, and removable, with optional due dates and completion notes.
- REQ-11.2 (APPROVED) A manually marked completion records activity, not mastery, and never auto-triggers harder/faster tasks. Completed items may be deliberately repeated.
- REQ-11.3 (APPROVED) If a suggested task is already pending in the list, show "Already added" instead of inserting a duplicate (exact identity keys per REQ-10.7).
- REQ-11.4 (APPROVED behavioral failures/recovery — implementation-level contract) Practice mutations commit before UI state changes; refused add/remove/complete never creates phantom items or silently drops edits; inline edits live in an in-tab draft, denied writes show a practice-specific alert plus Retry, focus is preserved, and recovery commits once without duplication. (HOME-STEP-C-REVIEW.md, EVIDENCE browser-local implemented/verified.)
- EVIDENCE: practice ledger/details/completion/repeat and explicit recovery implemented in the browser-local candidate (frontend-completion-ledger.md; P2 regression slices).

## 12. Personal notes (student)

Authorities: personal-notes-decisions.md (Discord 1560922710408822877 / 1560923578973823059; multiple titled notes chosen 1561298577899135028); personal-notes-p4-implementation-contract.md; personal-notes-style-revision.md (Discord 1561303781012934777).

- REQ-12.1 (APPROVED) A separate student personal-notes area, independent of practice items and recommendations; notes are optional; nothing forces notes onto a mock or task; note prose is never used to infer diagnoses.
- REQ-12.2 (APPROVED) Multiple independently titled notes; create / open / edit / delete; separate note-entry view with a Home preview and no inline Home composer.
- REQ-12.3 (ENGINEERING — approved-scope implementation defaults) Title and body individually optional; saving requires at least one non-whitespace field with associated-field feedback when both are blank; unheaded notes display a fallback title rather than a fabricated one; entered text is preserved rather than destructively trimmed. These validation behaviours are parent-selected engineering defaults under the approved notes contract, not separately user-approved field policy. The fixture maxlength 120/5000 values are NOT agreed production limits. No tags/dates/pins/reminders/sharing/AI/cloud by default.
- REQ-12.4 (APPROVED transactional behavior) Explicit Save commits; Cancel discards only the current draft and its save failure and makes zero storage writes; failed saves retain text, warn truthfully and offer keyboard-operable Retry with stable new-note identity across retries (no duplicate notes); delete is secondary inside the existing-note view behind native confirmation with captured-ID (never index) targeting and independent retry/dismissal.
- REQ-12.5 (EVIDENCE / visual provenance) Notebook-inspired fixtures and style revisions are part of the historical design trail. The later P4 contract authorizes the separate note-entry view and Home preview without another generic reapproval gate. Preserve the current accepted cross-screen candidate; do not turn an old style proposal into a fresh redesign requirement.
- REQ-12.6 (OPEN / DEFERRED) Personal-note cloud sync and tutor visibility are not established by the browser-local implementation. Reminders/notifications are excluded from the current notes scope. Explicit Save/Cancel and separate note-entry/Home-preview placement are already settled by the later P4 contract; do not reopen them as pending user decisions.
- EVIDENCE: P4 browser-local notes implemented with 62/62 targeted author checks; the earlier process-review hold is historical, and the later final cross-screen UI acceptance includes inspected notes failure states (personal-notes-p4-implementation-result.md; final-cross-screen-ui-acceptance.md). Browser-local persistence only: clearing browser storage removes notes; in-tab drafts do not survive reload.
## 13. Settings

Authorities: accounts-settings-decisions.md "Agreed account/settings behaviour" (Discord 1559797114890887299) and "Agreed Settings persistence and profile-edit behavior" (Joseph 1561645836235055105); analytics-advice-practice-decisions.md resource rules.

- REQ-13.1 (APPROVED) Settings groups: profile details; target score/exam date; resources; tutor connection; reflection-default choice; review-suggestion preference. Access/payment details display separately once their policy areas apply (access source, included features and applicable end date must be shown per section 17).
- REQ-13.2 (APPROVED) Updating target score, exam date or resources preserves mock history, reviews, tutor notes and existing practice tasks; the new context shapes future advice without treating it as a new mock or replacing tasks.
- REQ-13.3 (APPROVED) A passing exam date never deletes data, resets progress or ends access by itself; any access expiry follows the separate entitlement policy; a later exam date can be entered.
- REQ-13.4 (APPROVED reflection default) Keep the last successfully saved setting active until a change persists; on failure show a clear unsaved warning with explicit Retry. Successful changes apply to future reviews without altering existing review text/formats.
- REQ-13.5 (APPROVED profile editing) Profile edits are staged, not committed per keystroke: Save validates and commits; Cancel discards staged changes; leaving with unsaved edits asks save/discard/stay. Existing learning records and onboarding resume/autosave behavior are preserved. (EVIDENCE: staged draft behavior verified in browser-local P5 slices.)
- REQ-13.6 (APPROVED resource editing) The same multi-select/material-type rules as onboarding apply in Settings; student amendments must never be silently overwritten.
- REQ-13.7 (EVIDENCE) Settings transactional persistence (checkboxes, disabled fields, resources, step navigation, draft loss on departure) was exercised through the browser-local P5a/P5b slices; the final-state audit and mobile-nav/focus checks are recorded there. Not a live service.

## 14. Educator dashboard and tutor linkage

Authority: educator-dashboard-decisions.md (batches 1–6, Discord 1559551244182487041, 1559553203903664249, 1559763211379548231, 1559764115386404946, 1559764635098415167, 1559782077644415009) plus fast-track switching (1559838703470247937). All APPROVED at requirements level.

### 14.1 Verification and linking

- REQ-14.1.1 (APPROVED) A platform administrator manually verifies an educator's name, teaching role and supporting evidence before any educator features or data access. Approval means approved to use educator features — not endorsement of teaching quality or results. The precise evidence checklist is pre-launch work.
- REQ-14.1.2 (APPROVED) Linking flow: student enters the tutor's invitation code/link, sees tutor identity and sharing scope, explicitly consents and submits; the tutor accepts before access starts. A code alone never grants access.
- REQ-14.1.3 (APPROVED) One active tutor at a time. Switching requires DISCONNECT FIRST, then the ordinary invitation/consent/acceptance flow to the replacement; no pending replacement while connected, no automatic handover. Disconnection immediately ends old-tutor read/write/assign authority.
- REQ-14.1.4 (APPROVED) Either party may end the link; access and new assignments stop immediately; student records are never deleted by unlinking. Existing notes/assignments stay with the student under original attribution; unfinished assignments become optional (continue or archive); the disconnected tutor can no longer view, edit or withdraw them.
- REQ-14.1.5 (APPROVED) A replacement tutor sees the student's own history, reviews, analytics and practice progress after fresh consent — NOT previous tutors' notes/assignment text; sharing those requires an additional explicit student choice.

### 14.2 Tutor data access

- REQ-14.2.1 (APPROVED) Linked view: student roster summary with name, latest mock cognitive total and section scores, average across the latest three eligible mocks (with actual-count disclosure when fewer), score trend, days until exam when entered, task states. SJT stays separate; DM reporting follows student-side controls.
- REQ-14.2.2 (APPROVED) Explicit missing-data labels ("No mocks logged", "Exam date not set"); missing information is never zero. Search by name; sortable by name, nearest exam date, most recent mock or latest cognitive total; DEFAULT order is name, never performance ranking. No automatic at-risk/struggling labels from low scores or missing activity.
- REQ-14.2.3 (APPROVED) Tutors see the student's score history, analytics, overall focus and automated suggestions using the SAME student-side reporting rules — no separately generated conflicting results. Tutors can open saved mocks and reviews (scores, reflections, question types, error reasons; confirmed vs unconfirmed distinguishable; reviewed sets are explicitly subsets).
- REQ-14.2.4 (APPROVED) Tutors cannot edit or delete student-entered scores/reviews, change student settings or completion status, or see billing information. No private tutor notebook in the first version.

### 14.3 Notes, assignments, templates and notifications

- REQ-14.3.1 (APPROVED) Tutor notes are student-visible with tutor name and date; attachable at general, mock or individual-question level; tutors can edit their own notes with an "Edited" label, retained previous versions and student notification on material change; no editing another tutor's notes or student reflections.
- REQ-14.3.2 (APPROVED) Advice-only notes (e.g. "for this question make sure you…") are supported without forcing practice-assignment fields. Practice assignments: task title, clear instructions, suggested time or question quantity, optional due date/resource reference, using existing resources; no automatically generated assessment questions.
- REQ-14.3.3 (APPROVED) New assignments appear directly in the student's practice list with assigning tutor and date, distinct from student-selected practice; tutors see progress on both but cannot silently overwrite student-selected tasks. Statuses: Not started / In progress / Completed; completion is student-reported.
- REQ-14.3.4 (APPROVED) Tutors can edit/withdraw their own assignments, with notification for changes to instructions/workload/due date; completed assignments remain as history; withdrawals are marked clearly and removed from outstanding work.
- REQ-14.3.5 (APPROVED) In-app notification opens an assignment; email/push are outside the first version. NEW tutor updates pop up FIRST on the student dashboard at login; the student can open or dismiss without forced task completion; dismissed items remain in notifications/history and do not repeat unless a new update arrives; dismissal is never completion.
- REQ-14.3.6 (APPROVED) Each tutor has a private reusable template library (name/search/edit/delete; no tutor-to-tutor sharing). Reusing creates a separate copy for the selected student, customizable before sending; editing a template never changes sent copies; templates must contain no other student's identity, scores or private reflections, and saving from an existing item requires the tutor to strip student-specific content.
- EVIDENCE: NO educator implementation exists. The prototype has no operational tutor/auth services; a button or hidden navigation is neither integration nor authorisation. (frontend-completion-ledger.md; account-cloud-requirements-map.md)

## 15. Permission matrix (summary)

| Capability | Anonymous/visitor | Student | Linked tutor | Admin |
| --- | --- | --- | --- | --- |
| Public landing page | Yes (example content visibly fictional) | Yes | Yes | Yes |
| Log/confirm/save mock (within allowance) | Preview-local only | Yes | No | No |
| Edit saved raw scores / identity / DM mode | No | No (immutable) | No | No (policy; support process OPEN) |
| View/complete/edit question reviews | No | Yes, always (even at limit/expiry) | View within current consented link | Administrative data access not specified; no implicit access grant |
| Practice to-do items | — | Add/edit/complete/remove own items | Assign own items; never overwrite student-selected | — |
| Personal notes | — | Own, private (tutor visibility OPEN) | No (not agreed) | — |
| Tutor notes on student | — | Read (student-visible) | Author/edit own with history | — |
| Settings/billing of student | — | Own | No | Administrative access not specified |
| Educator role | No — manual admin verification only | — | Granted by admin | Verifies educators |
| Approve join requests / capacity | — | — | Tutor accepts; consent/link checks apply, and funding/capacity checks apply where allocation is involved | Educator-role verification only; no extra final join-approval stage agreed |
| Funded pass allocation | — | Receives | Purchases variable quantity | — |
| Deletion/export of student data | — | Own, with 2FA + final warning | No | Per retention policy (OPEN) |

Hidden navigation is not backend authorisation; all sensitive reads/writes must be enforced server-side with tested rules (section 18.1). (MASTER §7; educator batches; accounts records.)

## 16. Positive feedback, personal bests and celebration

Authorities: mock-logging-positive-feedback-requirement.md (Discord 1561794558902411357; settled 1562374206312681483; policy approved 1562406307737243773); mock-record-final-acceptance.md.

- REQ-16.1 (APPROVED) Give positive, truthful acknowledgement from the earliest saved mocks — including a history of one or two; do not reserve encouragement for long streaks or imply improvement that did not happen.
- REQ-16.2 (APPROVED) Personal-best comparisons use the approved ESTIMATED scaled scores only: overall compares the estimated VR+DM+QR total against the highest valid previous saved total; each section compares against its own highest previous saved scaled score. Both DM formats compete on the shared estimated scale — no raw-mark or same-mode-only gate. Strict improvement only; ties are not records; SJT is excluded. Compare against the previous best, not merely the latest mock or an average. One valid prior result suffices; the first-ever save is an acknowledgement, not a comparative PB.
- REQ-16.3 (APPROVED) Hierarchy: one prioritised celebration per successful initial final Save; an overall record leads with subordinate section detail in the same event; a section-only record can lead when the total does not improve.
- REQ-16.4 (APPROVED) Milestones: first save — warm acknowledgement ("you've made a start" example); second save — effort acknowledgement even when scores fall; ordinary saves — brief supportive truthful note. No shame, forced streaks, competitive ranking or guaranteed-outcome language.
- REQ-16.5 (APPROVED) Trigger only after confirmed persistence; never for cancelled/denied saves; a successful explicitly confirmed retry emits once; no replay across rerender, reload, navigation or later review edits.
- REQ-16.6 (APPROVED) Form: accessible, non-blocking, no modal, no sound, no focus theft, no blocked next action; brief noninteractive confetti for actual records only, replaced by identical static text under reduced-motion. (Copy/animation mechanics are design defaults, not scoring policy.)
- EVIDENCE: implemented in the browser-local candidate and accepted with bounded evidence (mock-record-final-acceptance.md: 93 browser checks + 26 model checks + 3 audit tests/30 states; emulator account-save PB slices fm12–fm25 accepted with qualifications). Not live.

## 17. Allowances, paid/funded access, invitations and pricing

Authority order: accounts-settings-decisions.md entitlement sections; then limit-upgrade-flow.md "Latest paid allowance direction" which SUPERSEDES the historical 100-total decision.

### 17.1 Initial allowance (APPROVED)

- REQ-17.1.1 Everyone starts with a cumulative allowance of three successfully saved mock logs total. Logging beyond three requires purchased or funded access.
- REQ-17.1.2 Deletion never restores allowance (cumulative usage, not a storage cap). Opening a form, abandoning a draft or a failed save never consumes; retrying the same save never double-counts; only successful saves debit; enforcement must be server-side atomically in production (browser-local counters in the preview are labeled as such).
- REQ-17.1.3 Show usage (e.g. "2 of 3 mock logs used"), explain that deletion does not replenish, and present the restriction BEFORE starting a fourth mock. At exhaustion/expiry, viewing history and completing reviews remain available. The initial three never reset per day or cycle.

### 17.2 Paid access while active (APPROVED — current policy)

- REQ-17.2.1 (Joseph 1564641524543922318) Active paid access grants UNLIMITED TOTAL mock logs over the access period — rate-limited to a maximum of 12 successful, distinct NEW mock saves per account per calendar day, resetting at 00:00 UTC for everyone (calendar-day accounting approved by 1564641886596235417; not rolling 24 hours).
- REQ-17.2.2 Failed saves do not consume daily capacity; retries of the same save do not double-count; deletion does not replenish consumed daily allowance; the initial cumulative three remain a separate, non-renewing allowance (the daily reset grants nothing to unpaid accounts).
- REQ-17.2.3 The earlier "100 mock logs total" approval (1564626903984251011) and the "includes 100 mock logs" offer copy (1563151529966436424) are SUPERSEDED/withdrawn for future implementation; obsolete 100-offer copy was removed from the tested UI (EVIDENCE pd5). No 100-total implementation is accepted.
- REQ-17.2.4 Access duration: unlimited logging runs from activation to the LATER official UK/ANZ testing-cycle end date for that cycle — one shared cutoff for all students regardless of jurisdiction or personal exam date. Official dates must be verified each cycle before setting the cutoff; 24 September 2026 is a cycle-specific recorded example from the source research, not a recurring rule; do not hard-code a September date or a rolling year. (The 12-month pass proposal was rejected.) Between-cycle activation begins immediately and lasts through the following cycle's shared cutoff; if official dates are unpublished, identify the cycle and mark the exact expiry as awaiting confirmation. Precise expiry time/timezone/extensions are OPEN.
- REQ-17.2.5 Expiry behaviour: stop new logging if the initial three are used, without resetting or replenishing them; existing results/reviews remain viewable; expiry is not account deletion; further logging needs a new purchased/funded pass; no automatic renewal or billing.
- REQ-17.2.6 AI allowance is SEPARATE from logging access: mock-log access must never imply unlimited AI; AI must be limited separately with spending safeguards (requirement; no AI route exists in the current boundary).
- REQ-17.2.7 Rate/safeguard requirements (APPROVED as requirements, NOT implemented-control claims): server-enforced allowances; per-account and per-IP request-rate/burst limits including rejected attempts (allowance is not bot protection); bounded request size and per-request work; protection of expensive/private operations.
- REQ-17.2.8 The 12/day limit belongs in Terms and Conditions (Joseph 1564642407813742744); public plan naming and fair-use wording are DEFERRED. Internal draft clause exists (terms-and-conditions-draft.md — not published, not legally reviewed); purchase-time accessibility of the limit is required but no Terms page/acceptance flow is implemented.

### 17.3 Tutor-funded access, places and invitations (APPROVED)

- REQ-17.3.1 Tutors/organisations purchase student access; covered students never pay again for included features and must not see upgrade prompts for included entitlements. Funded and self-paid logging rules are identical while active.
- REQ-17.3.2 Variable purchased quantity (the fixed 20-student cap is superseded); top-ups later don't disturb prior purchases or current students; unused unassigned places carry forward until used and do not expire at cycle end; consumed places never replenish on removal/expiry and are non-transferable between learners.
- REQ-17.3.3 Keep three counts separate: distinct cohort members, funding inventory (purchased units), activated cycle passes. A same-student renewal needs a fresh funding unit but is NOT a second distinct member; a rejoin of the same account to the same tutor isn't double-counted.
- REQ-17.3.4 Invitation codes: eight characters, valid one week; tutors may set a usage limit within remaining capacity; a code starts a REQUEST only — approved consent + tutor acceptance + funding/capacity checks still gate activation. Pending/rejected/failed joins don't permanently consume a slot; a pending request does not reserve funding; requests submitted before expiry remain approvable after expiry; an expired code accepts no new requests. Indefinite pending retention and post-cycle automatic activation are OPEN.
- REQ-17.3.5 Disconnection (either party): the already-activated student pass keeps its original expiry; the tutor immediately loses data access; the consumed place stays consumed. Already-covered students may connect to a new tutor without another charge; a later renewal by the new tutor consumes a new place.
- REQ-17.3.6 Access source transparency: Settings shows whether the student is on the initial three-mock allowance, tutor/organisation funded, or self-paid, with included features and applicable end date. Any future change from complimentary to paid requires advance notice and explicit purchase agreement.

### 17.4 Pricing (OPEN — nothing approved)

- Prices, currency confirmation, discounts, minimum/maximum purchase, top-up and renewal pricing, refund terms remain UNAPPROVED. Seller operates from Malaysia; audience mainly UK; affordability is a priority. Earlier £19 self-paid cycle pass / £15 funded per-student pass and a voluntary 14-day refund promise are PROPOSALS only from commercial-review.md; GBP itself is a recommendation pending approval (the user's "GDP?" was interpreted as GBP, not an approved token). No payment provider, tax treatment (UK VAT digital-services rules for a non-established supplier), merchant eligibility or consumer-terms classification is settled; all are pre-launch checks, and no fictional checkout or payment record may exist. (commercial-review.md; ai-model-commercial-review.md)

## 18. Security, privacy, accessibility and platform requirements

Authority: MASTER-BUILD-BRIEF.md §9–§11, retained as acceptance TARGETS (later records confirm none are certified complete). These are requirements and verification targets — never claims of implemented controls or legal compliance.

### 18.1 Security (APPROVED targets)

- Use OWASP ASVS 5.0.0 as a versioned verification checklist for applicable production controls; independent review, threat model, dependency/secret scans, input validation, contextual safe output and XSS regressions before release; no eval/unsafe-HTML interpolation of student text. (EVIDENCE: browser-local/emulator candidates escape HTML at owned sinks including hostile long inputs.)
- Never place AI/provider keys, admin/service-account credentials or payment secrets in frontend bundles, source maps, HTML, URLs, browser storage, console output, screenshots or exported archives; secrets stay server-side, least-privilege, dev/test/prod separated; no .env* served/committed; redact logs, no request-body/PII dumps. Firebase public web identifiers are project identifiers, not authorisation: backend rules/IAM/App Check and key restrictions are what secure data.
- Production authentication/authorisation enforced server-side with tested Firebase rules: deny-by-default, student ownership and approved-current-link checks on every sensitive read/write/pagination; revocation blocks stale reads/writes; test IDOR, concurrent saves, quota/retry/replay, mass assignment and privilege escalation. Hidden educator navigation is not authorisation.
- Session safety/CSRF/origin checks, secure cookies/tokens, rate limiting, transport security/headers/CSP, backup/recovery policy — verify in actual deployment; the preview cannot prove any of these. No public exposure without approval.
- Student content is untrusted input, including prompt-injection payloads aimed at future AI features. Under-18 safeguards, provider terms and Malaysian/UK obligations are unresolved launch gates (note: Joseph has stated under-18 users will be allowed, Discord 1563159246164598885, which collides with the free Gemini Developer API restriction — see section 20).

### 18.2 Accessibility (APPROVED targets)

- Target WCAG 2.2 AA (building on the source WCAG 2.1 AA direction); test applicable criteria and disclose coverage; no conformance or immunity claim.
- Keyboard-everywhere: logical Tab/Shift+Tab, Enter/Space, Escape closes modals, no traps or drag-only controls; skip link; semantic landmarks/headings; labelled controls with adequate accessible names; visible focus never hidden by sticky headers/dialogs; purposeful focus movement/restoration; announcements for saved/error/loading; errors associated with fields, readable without colour, data preserved on validation failure.
- Contrast ≥ 4.5:1 normal text / 3:1 large text; adequate targets (aim 44px); zoom/reflow/mobile; reduced-motion and no unnecessary animation; charts with text/table equivalents and missing-data labels.
- Verification = automated axe PLUS keyboard-only E2E, mobile/desktop, zoom/contrast and manual screen-reader checks before claiming coverage; an accessibility drawer is not a substitute. (EVIDENCE: current tested coverage — zero axe violations with retained, supplemented color-contrast "incomplete" occurrences at 320/390/1440 in the browser-local and emulator slices; NO screen-reader/zoom/cross-browser certification performed.)

### 18.3 Data deletion, export and retention (APPROVED + OPEN)

- Student deletion: optional download of own results/reviews first; two-factor verification and explicit final warning; confirmed deletion ends tutor access and removes active-service learning records.
- Backup deletion, required payment/security retention, and the quota anti-abuse retention rule (account-recreation bypass) are NOT settled and must be resolved before enabling destructive production actions; no instant-global-erasure claim. (OPEN policy; ENGINEERING note in account-cloud-requirements-map.md: implement authenticated ownership/quota per account; do not invent cross-account fingerprinting.)

### 18.4 Platform and recovery (APPROVED targets)

- Mobile-responsive behavior and desktop layouts are explicit acceptance surfaces (320/390/1440 checks in EVIDENCE).
- Draft persistence across navigation/retry/failure is specified per flow (onboarding resume, review autosave, staged Settings edits, tab-local note/practice drafts with honest reload limits). Cloud durability is not claimed for browser-local state.

## 19. Current implementation evidence matrix

EVIDENCE classes: BROWSER-LOCAL = vanilla prototype at /opt/data/deltascore/practice-integration-p1 (+ successors) — data lives in that browser only. EMULATOR = backend-integration / ui-cloud-integration slices on Firebase Auth/Firestore emulators with loopback HTTP and fictional accounts. LIVE = production services/public site. Nothing is LIVE-verified; there is no public deployment, and per record, deployment/publishing was never authorised by consolidation work.

| Area | Requirement status | Implementation evidence (source-backed) |
| --- | --- | --- |
| Landing page | APPROVED (frozen) | BROWSER-LOCAL; landing-final-approval.md; visual-design-approval.md |
| Onboarding | APPROVED | BROWSER-LOCAL historical bounded PASS (onboarding-frontend-step-d-review.md); resource prefill/correction implemented in later onboarding steps; Browser-local P5 slices exercised onboarding/settings interaction; cloud profile sync is not established |
| Auth / recovery / email verification | APPROVED requirements | Live sign-in/recovery not verified. Auth/account boundary and trusted-token verification foundations accepted in emulator tests (backend-integration/auth-account-foundation-acceptance.md). Older maps describing no seams are historical, not a current component inventory |
| Mock logging + fixed maxima | APPROVED | BROWSER-LOCAL verified (score-fixed-maximum-final-acceptance); EMULATOR account save/detail/list/delete accepted (backend-integration mock-*-foundation-acceptance; ui-cloud account-save family) — NOT live |
| Required review stage + zero-review + save confirmation | APPROVED (latest contract) | BROWSER-LOCAL accepted slice (mock-review-session-final-acceptance.md; app 3c87a5b5 pin recorded there). Account-saved review editor: EMULATOR/browser PATCH/ETag accepted, product pin 47c99f7b (account-review-final-connected-parent-acceptance.md) — explicitly NOT live |
| Label catalogue + suggestions | APPROVED catalogue; suggestion mechanism ENGINEERING-open | BROWSER-LOCAL catalogue-backed labels verified in emulator editor; no AI suggestion integration exists |
| Estimated scaled conversion + overview | APPROVED; frozen model midpoint-20261006-v1 | BROWSER-LOCAL model+overview accepted (estimated-score-model-acceptance.md; estimated-overview-final-acceptance.md); saved-mock score rows EMULATOR-verified (ui-cloud-integration/saved-mock-score-row checkpoints per paid-daily-current.md) |
| History + filters + analytics | APPROVED | BROWSER-LOCAL partial (raw-mode/filter reporting); account history list/detail EMULATOR accepted (ui-cloud-integration account-history checkpoints); broader account-connected analytics REMAINING |
| Advice / Priority 1-2-3 / Add controls | APPROVED incl. six defaults | BROWSER-LOCAL deterministic Progress slices accepted (progress-implementation-decisions.md; progress C1/C2a/C2b chain). No live recommendation service |
| Practice ledger + manual tasks + recovery | APPROVED | BROWSER-LOCAL (HOME-STEP-C-REVIEW.md; practice integration P1–P3 accepted slices) |
| Personal notes | APPROVED core and current placement/Save contract; sync OPEN | BROWSER-LOCAL P4 implemented (62/62 author checks), with later final cross-screen UI acceptance; earlier process qualifications remain historical |
| Positive feedback / PBs / confetti | APPROVED | BROWSER-LOCAL accepted (mock-record-final-acceptance.md) + EMULATOR PB slices fm12–fm25 |
| Allowance: initial 3 | APPROVED | BROWSER-LOCAL rule + EMULATOR server-side usage counters accepted (mock-usage / quota slices; cumulative semantics proven in ui-cloud tests) |
| Paid: unlimited + 12/day UTC | APPROVED (supersedes 100-total) | BACKEND/EMULATOR accepted (backend-integration/paid-daily-backend-parent-acceptance.md; ui-cloud pd1–pd5 + final regression). NOT live, no billing |
| Upgrade entry / limit message | APPROVED | BROWSER-LOCAL + EMULATOR (upgrade-entry checkpoints; pd5 removed obsolete 100 copy) |
| Tutor funding, places, invitations, expiry | APPROVED requirements | NOT IMPLEMENTED (no auth/payment/funding surface; account-cloud-requirements-map.md E-list, deferred) |
| Educator dashboard | APPROVED requirements | NOT IMPLEMENTED |
| Sharing cards | DEFERRED feature request; details PROPOSED | NOT IMPLEMENTED |
| AI features | PROPOSED pipeline; evaluation DEFERRED | NONE; synthetic pack only, zero model calls (ai-evaluation/gemini-first-decision.md) |
| Deletion/export/2FA | APPROVED requirements; retention OPEN | NOT IMPLEMENTED |
| Security/accessibility certification | APPROVED targets | Partial EVIDENCE per 18.2; no ASVS/WCAG certification, no screen-reader/zoom/cross-browser pass |

Stale-record warnings (resolutions applied in this document): backend-integration/current-stage.md's "ACTIVE worker" text and building-current-brief.md's 2026-10-24 worker status are historical; no active workers are claimed. MASTER-BUILD-BRIEF.md predates the latest paid daily-limit direction and review-stage corrections; limit-upgrade-flow.md and the review-session contract govern those areas. Do not attribute later 12/day or 100-total wording to the older master if absent there.

## 20. AI scope and boundaries

- REQ-20.1 (APPROVED boundary) AI is never required to save, review or use analytics; deterministic calculations, catalogue matching and manual paths must fully work with AI unavailable; never fabricate suggestions while claiming live AI. (MASTER §4, §6; progress default 6)
- REQ-20.2 (PROPOSED pipeline) AI scope if ever enabled: bounded reflection-based label suggestions and concise evidence-grounded advice from approved catalogue entries — never scoring/arithmetic, access control or original UCAT question generation. (ai-model-commercial-review.md)
- REQ-20.3 (PROPOSED candidate) GPT-6 Luna was recommended as the affordability-first evaluation candidate ($0.10/$0.50 per M-token rates as recorded at retrieval time; rates/models require re-verification before any use). Gemini-first decision (Joseph 1559843567227379784): adult-operated INTERNAL evaluation, synthetic cases only, free tier, never student-facing, never UK/EEA user-facing on the free Developer API (its terms bar under-18-likely access) — which collides with Joseph's later "under-18 users allowed" statement (1563159246164598885) and remains an unresolved launch-gate decision. Later Luna swap requires re-running the same held-out evaluation.
- REQ-20.4 (EVIDENCE / status) Prepared evaluation pack: 22 synthetic cases (16 extraction, 6 advice; 5 development / 17 held-out) at ai-evaluation/; ZERO model calls made, no key created, no billing, no quality/cost verdict. Blocker: no credential; key handling stays out of chat/project files. (ai-evaluation/gemini-first-decision.md; ai-model-commercial-review.md)
- REQ-20.5 (APPROVED safeguards) Separate AI allowance/spending caps distinct from mock logging (17.2.6); minimal authorised data only; caching per evidence version; retries bounded; provider/privacy/youth eligibility rechecked before any student-facing AI.

## 21. Deferred features

- DEFERRED-1 Downloadable score-sharing cards (Joseph 1561626577979047979, below core functions): a polished progress/analytics card (trend line, exact scores, averages, subsection breakdowns) and a single-mock card offered after logging/from its results, intended for students to post themselves for advice/celebration and organic awareness (user observation, not researched conversion evidence). The downloadable progress card with trend graph, exact scores, averages and subsection breakdowns, plus a single-mock card, are Joseph's DEFERRED feature requests. Specific placement, extra entry points, privacy defaults, branding, graph calculation (individual points versus rolling average, window, filters, rounding), format and dimensions remain PROPOSED or OPEN; do not relabel the requested graph/download capability itself as merely Edith's suggestion. NOT part of any current contract; no automatic publication, no social integration; must label raw vs estimated values truthfully and keep identity/reflections/notes/tutor content off exports by default.
- DEFERRED-2 Single-section mocks (future beyond first version) — REQ-1.1.3.
- DEFERRED-3 Numerical SJT analytics averaging pending comparable-format definition — REQ-9.5.
- DEFERRED-4 Email/push tutor notifications; multi-tutor; organisation/staff access; provider question import — each recorded as explicitly outside first version.

## 22. Rejected and superseded decisions (appendix summary)

Full list with governing records in Appendix A. Headlines: unrestricted free trial; required completion date; 400-char limits; Guess hiding reflections; compulsory qualitative gates; single "Recommended" practice label; 12-month pass; fixed 20 tutor places; simultaneous tutors; 100-total paid cap; rolling-24h daily window; smoothing; preserve-old-versions recalculation policy; whole-mock-reflection omission; editable saved mocks; "None" resource option; the rejected old clinical preview and old app.

## 23. Open decisions register (product decisions for Joseph)

| # | Open decision | Source boundary |
| --- | --- | --- |
| O-1 | Whole-mock note editability after save; typo-correction process (no replacement path) | accounts-settings-decisions.md quota-pending; mock-logging-decisions.md |
| O-2 | Account-recreation / anti-abuse retention policy consistent with deletion policy | accounts §fast-track 5 + quota pending; explicitly UNSETTLED |
| O-3 | Access-expiry exact time/timezone; contingency extensions; indefinite pending-request retention | accounts §testing-cycle, §pending requests |
| O-4 | Prices, currency sign-off, top-up/renewal pricing, refunds, plan naming, fair-use wording, Terms publication | accounts §pricing; limit-upgrade naming; commercial-review (proposals only) |
| O-5 | Funded access's future feature coverage beyond mock logging; sponsored exceptions to daily rate (none decided) | accounts §funded; limit-upgrade |
| O-6 | Personal-note cloud sync and any tutor-sharing permission; reminders remain outside current scope. Save/Cancel and note-entry/Home-preview placement are settled | Later personal-notes-p4-implementation-contract.md overrides older pending wording |
| O-7 | Guided+free-text combination policy and future automated-suggestion default/refresh behaviour, if introduced. Existing manual label editor and SJT no-error-reasons rule are settled | question-review-decisions.md, with later review-editor acceptance overriding old UX-pending language |
| O-8 | Half-value tie display policy if not settled by a later consumer contract. Unsupported maxima already require honest unavailable/separate treatment; annual official-date checks are an operational dependency, not a reopened product choice | mock-logging/analytics records; frozen-model acceptance |
| O-9 | AI provider choice & youth-eligibility collision; when/if to run evaluation | ai-evaluation records |
| O-10 | Educator verification evidence checklist (pre-launch) | educator batch 6 |
| O-11 | Sharing-card specifics (all proposed, section 21) | share-cards-deferred-feature.md |

ENGINEERING tasks (parent-owned, not new user policy): reuse already accepted emulator auth/session, stable-ID idempotency, transactional quota, client receipts and review-version controls. Remaining work includes live sign-in/recovery wiring, profile/draft/practice/personal-note cloud persistence where scoped, account-connected analytics, educator/funding services and deployment-specific rules/recovery. The older E1–E6 map is discovery history, not proof that every mechanism is still missing. Recommendation key encoding and failure wording follow their accepted implementation contracts.

EXTERNAL setup (not build work): Firebase live project/credentials and security rules deployment; Google login/Stripe-or-other merchant setup; tax/consumer-terms assessment; screen-reader/cross-browser validation; anything requiring spend or publishing. Routine in-scope development continues without repeated chat approval; genuine tool-enforced gates remain binding.

## 24. Roadmap (agreed ordering only — no invented phases)

1. BROWSER-LOCAL core product complete (done per section 19 matrix) — including the accepted final cross-screen UI gate (93 functional checks; 18 audit tests/141 states; zero axe violations with retained supplemented contrast incompletes) — final-cross-screen-ui-acceptance.md.
2. Connected persistence slices (in progress at requirements-to-acceptance boundaries): auth/account foundation, catalogue HTTP/client (accepted gate 197: 116/116 emulator), account save/review editor (accepted at emulator level), paid daily limit (accepted backend + UI slices). Remaining in this band: profile/draft/practice/personal-note cloud persistence and account-connected analytics (each requires a bounded scope and permission model), plus live-service enablement. Explicit untested editor lifecycle combinations are documented limitations, not an automatic task queue after accepted risk-based closure.
3. Tutor funding/place/invitation entitlements + educator dashboard front/back, each with its own settled scope first (section 14).
4. Commercial checkout only after pricing/refunds/Terms decisions and legal/tax checks (section 17.4).
5. AI evaluation (section 20) then AI features, gated on youth/provider/cost decisions.
6. Deferred features (section 21) below the core functions.
7. Public launch only through its own explicit gate: security/accessibility/privacy/recovery evidence per section 18; no certification claim before then.

## Appendix A — Superseded decisions (kept for audit)

| Old decision (record) | Now |
| --- | --- |
| Optional post-save review sequence (analytics-advice-practice-decisions.md revised journey; mock-logging older journey) | SUPERSEDED by required review stage, mock-review-session-current-contract.md 1562374206312681483 |
| Correct-but-guessed eligible for review | SUPERSEDED — excluded from first version (same record) |
| "100 mock logs" paid offer (1563151529966436424; total-including-3 1564626903984251011) | SUPERSEDED/withdrawn — unlimited + 12/day UTC (1564641524543922318, 1564641886596235417) |
| 12-month rolling pass | SUPERSEDED by cycle-end pass (1559835130787270677) |
| Fixed 20 students/tutor; multiple simultaneous tutors | SUPERSEDED — variable paid quantity (1559834397685850155); one-at-a-time, disconnect-first |
| Editable saved mocks incl. recalculation after raw-score edits; paid editing exception | SUPERSEDED — immutability (1559833584485793793); no exception |
| Editable mock completion date requirement; None resource option; 400-char limit; Guess-hides-reflections; mandatory reflection+label gate; manual-labels-only first version; single Recommended practice item; automatic assignment of suggestions | REJECTED as recorded |
| Preserve old conversion versions per record | REJECTED — recalculation policy agreed (mock-logging) |
| Clinical/Study Ledger visual preview; old product PDF as authority; discarded original app | REJECTED — full remake (1559863331634946151, 1559863468843339817); REDESIGN-DIRECTION override of brief authority |
| Rolling-24h daily window question | CLOSED — calendar 00:00 UTC |
| MASTER-BUILD-BRIEF stale statements (three-log-only cap without daily rule, old journey, "no seams" style maps, pre-review-edit permissions) | Historical consolidation; narrower records govern |

## Appendix B — Source register and coverage map

Machine-readable version: source-coverage-register.json. Paths relative to /opt/data/deltascore/ unless shown. "Governs" = the record this PRD treats as authoritative for the cited area.

| Source file | Status | Governs / contributes |
| --- | --- | --- |
| MASTER-BUILD-BRIEF.md | OLD; overridden in key areas | §1, 2, 13, 18, 19 framing; superseded where sections 4–6, 17 differ |
| mock-logging-decisions.md | Governs logging/scaling rules | §4, 7, 8 |
| question-review-decisions.md | Governs review content (older journey statements superseded) | §6 |
| label-catalogue.md | Governs exact catalogues | §6.2, 6.3 |
| mock-review-session-current-contract.md | LATEST review-session/counts/confirmation | §5, 6.4 |
| mock-logging-positive-feedback-requirement.md; mock-record-final-acceptance.md | PB policy + evidence | §16, 19 |
| estimated-score-model-acceptance.md; estimated-overview-final-acceptance.md | Frozen model + overview evidence | §8, 7 |
| scaling-research.md; scaling-recovered-evidence/ | Provenance of midpoint; limitations | §8 |
| analytics-advice-practice-decisions.md | Analytics/advice baseline | §9, 10, 3 (resource list) |
| practice-selection-proposal.md; practice-catalogue-researched.md; DeltaScore-Practice-Catalogue.docx | Agreed ranking rules; content baseline (37 entries / 56 routines / 30 sources; SJT excluded) | §10, 11 |
| progress-implementation-decisions.md | Six approved defaults (windows, ties, sparse, Add, duplicate keys, deterministic) | §10.7 |
| accounts-settings-decisions.md; accounts-settings-fast-track-proposals.md (accepted parts) | Auth, settings, entitlements, invitations | §2, 3, 13, 17 |
| limit-upgrade-flow.md | LATEST paid policy; upgrade entry | §17.2 |
| terms-and-conditions-draft.md | Internal draft clause only | §17.2.8 |
| onboarding-confirmed-rules-and-resources.md; onboarding-resource-ui-correction.md | LATEST onboarding controls/prefill | §3 |
| personal-notes-decisions.md; personal-notes-p4-implementation-contract.md; personal-notes-p4-implementation-result.md; personal-notes-style-revision.md; personal-notes-style-v2-result.md | Notes requirement/contract/evidence/style | §12 |
| educator-dashboard-decisions.md (+ handoff) | Educator batches 1–6 | §14 |
| share-cards-deferred-feature.md; current-build-scope.md deferral note | Deferred feature | §21 |
| commercial-review.md; ai-model-commercial-review.md; ai-evaluation/gemini-first-decision.md and evaluation pack | Proposals only / evaluation boundary | §17.4, 20 |
| visual-design-approval.md; REDESIGN-DIRECTION.md; landing-final-approval.md; landing-analytics-revision.md; combined-ui-rules-conflicts.md | Visual authority chain | §1.4 |
| mock-logging-ui-correction-and-final-audit.md; score-fixed-maximum evidence | Fixed maxima + UI gate criteria | §4.3, 18.2 |
| final-cross-screen-ui-acceptance.md/.json | Final browser-local UI gate | §19, 24 |
| mock-review-session-final-acceptance.md; mock-first-save-ack-final-acceptance.md | Review-session/first-save evidence | §5, 6 |
| HOME-STEP-C-REVIEW.md; home-integration-p3-* | Home/practice evidence | §11 |
| onboarding-frontend-step-a/d-review.md | Onboarding evidence | §3 |
| backend-integration/* (current-stage.md stale-activity note; catalogue-http-client-acceptance.md; paid-daily-backend-parent-acceptance.md; mock/auth/account foundation acceptances; account-cloud-requirements-map.md; request-rate-protection-acceptance.md; upgrade-safeguards-inventory.md) | Backend emulator evidence + requirement mapping | §17.2.7, 19, E-tasks |
| ui-cloud-integration/* (current-account-save-state.md; account-review-final-connected-parent-acceptance.md; paid-daily-current.md; paid-daily-final-parent-acceptance.md; pd1–pd5 and fm/ad/lc/wb checkpoints) | Connected-slice evidence (emulator/browser) | §6.4, 16, 17, 19 |
| frontend-completion-ledger.md; frontend-delivery-sequence.md; current-build-scope.md; continuous-delivery-authorization.md; development-workflow.md | Delivery state/authority context | §19, 24 |
| settings-profile-p5b-* series | Settings transactional evidence | §13 |
| practice-integration-p1/p2/p3 records | Practice/notes candidate evidence | §11, 12 |
| PDR_-_DeltaScore_1.pdf (via label-catalogue.md extraction) | Label source only | §6 |

Excluded as non-requirements: raw incident/test-runner logs, worker transcripts, credential or server-access details, private fixture tokens. Technical process deviations are summarized only where they bound the strength of an evidence claim (section 19), never as product requirements.
