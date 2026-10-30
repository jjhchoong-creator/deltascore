#!/bin/bash
# uic-history-list-run.sh — serialized emulator/browser run for the derived
# account-history LIST vertical harness
# (ui-cloud-account-history-list.test.mjs = adapted harness with documented
# inverse-proven substitutions + marked append; see
# uic-history-list-harness-receipt.json). Same proven pattern as
# lifecycle-regress-run.sh / green-full-adapted-run.sh (firebase emulators:exec,
# project demo-deltascore-fresh, JAVA_HOME from remote java-home.txt, single
# lock owned by the harness itself). Refuses if the shared lock or stale
# emulator processes exist. No new harness family.
#
# Usage: uic-history-list-run.sh EVIDENCE_DIR PHASE APP_PIN ACCESS_PIN HISTORY_PIN SERVER_PIN TEST_PIN HARNESS_PIN PATTERN [HARNESS_FILE]
#   (positional args per actual lines below; the historical comment omitted arg8)
#   PHASE: RED|GREEN
#   HISTORY_PIN: sha256 of account-history.js (required at GREEN; pass '-' at RED)
#   PATTERN: node --test --test-name-pattern (pass 'ALL' to run every test)
#   HARNESS_FILE: optional derived-harness filename (narrow r2 parameterization;
#     default ui-cloud-account-history-list.test.mjs = immutable r1 bytes)
set -u
EVIDENCE_DIR="$1"
PHASE="$2"
APP_PIN="$3"
ACCESS_PIN="$4"
HISTORY_PIN="$5"
SERVER_PIN="$6"
TEST_PIN="$7"          # ui-cloud-account-usage.test.mjs (original, immutable)
HARNESS_PIN="$8"       # derived list harness file (r1 or r2)
PATTERN="$9"
HARNESS_FILE="${10:-ui-cloud-account-history-list.test.mjs}"
SAVE_PIN="${11:--}"   # account-save vertical: sha256 of account-save.js, or '-' to omit (behavioural RED convention)
PROGRESS_PIN="${12:--}"  # account-progress vertical: sha256 of account-progress.js, or '-' when not owned/registered (RED convention)
PV_PIN="${13:--}"          # account-progress vertical: sha256 of the owned progress-view.js slot change, or '-' when unchanged
case "$HARNESS_FILE" in
  ui-cloud-account-history-list.test.mjs|ui-cloud-account-history-list-r2.test.mjs) ;;
  # Detail vertical narrow allowlist extension (d1): the derived detail harness
  # (immutable r2 list bytes + exact marked append; see
  # uic-history-detail-harness-receipt.json). Defaults r1/r2 unchanged.
  # NOTE: the detail behavioral RED runs with PHASE=GREEN and the accepted
  # list-baseline HISTORY_PIN — the RED-phase module-absence guard below is
  # for the historical LIST work only; the fresh evidence dir name records
  # the behavioral failure intent.
  ui-cloud-account-history-detail.test.mjs) ;;
  # Detail-repair vertical narrow allowlist extension (x1–x5): the derived
  # repair harness (immutable detail-harness bytes + exact marked append;
  # simple byte-equality prefix proof, no generator/inverse-script/new-map
  # family). Same PHASE=GREEN behavioral-RED convention as d1.
  ui-cloud-account-history-detail-repair.test.mjs) ;;
  # Current-backend bridge narrow allowlist extension (cb1): derived harness =
  # immutable detail harness (325d2d65…) + 3 documented current-backend pin
  # substitutions + marked EOF append (see
  # uic-current-backend-detail-harness-receipt.json). Same PHASE=GREEN
  # behavioral convention: the limiter-pin RED tests fail against the
  # unchanged integration-server seam, not a module-absence guard.
  ui-cloud-current-backend-detail.test.mjs) ;;
  # Account-save first vertical narrow allowlist extension (s1–s5): derived
  # harness = immutable bridge harness (2a428c55…) + 2 documented optional
  # account-save pin-registration substitutions + marked EOF append (see
  # uic-account-save-harness-receipt.json). Behavioral RED convention: run
  # PHASE=GREEN with the STARTING app/history/server pins and NO
  # account-save.js pin — the module route is absent, and the s1 primary
  # assertion fails as the missing real /api/mocks/commit, not an import error.
  ui-cloud-account-save.test.mjs|ui-cloud-account-save-r2.test.mjs) ;;
  # Account-save truthful-recovery narrow allowlist extension (r1–r3): derived
  # harness = immutable ui-cloud-account-save.test.mjs (ac52c683…) + 1
  # documented copy-only occurrence-counted supersession + marked EOF append
  # (see uic-account-save-recovery-harness-receipt.json). Behavioral RED
  # convention: run PHASE=GREEN with the CURRENT app/history/server pins and
  # the CURRENT account-save.js pin — the module is live and the truthful
  # cannot-confirm/already-saved copy assertions fail against the current
  # controller's definite not-saved relabelling, not an import error.
  ui-cloud-account-save-recovery.test.mjs) ;;
  # Recovery-proof-repair r2 narrow filename registration ONLY (same runner;
  # derived harness = immutable 1ed20c3a… recovery harness + 20 occurrence-
  # counted inverse-verified proof-repair substitutions, receipt
  # uic-account-save-recovery-r2-harness-receipt.json). The three renamed
  # “account save recovery p:” tests are CURRENT-source proof RECHECKS —
  # readback-before-replacement ordering, error-state screenshots before
  # Retry, and ack retention via the existing mount seam. No production or
  # behavioural policy change; same GREEN pins as the recovery harness.
  ui-cloud-account-save-recovery-r2.test.mjs) ;;
  # Cleanup-copy seam repair narrow filename registration ONLY (same runner;
  # derived harness = immutable 99d4fdcc… recovery-r2 harness bytes + ONE
  # marked EOF append with ONE new “account save recovery c:” test — exact
  # prefix proof, no generator/wrapper-family/source-map). Behavioral RED
  # convention: run PHASE=GREEN with the CURRENT app/history/server/save
  # pins; the generic allowance-not-consumed banner assertion fails against
  # the unchanged app persist() seam, not an import error.
  ui-cloud-account-save-recovery-cleanup-copy.test.mjs) ;;
  # Account-save boundaries narrow filename registration ONLY (same runner;
  # derived harness = immutable bdff8ef3… cleanup-copy harness bytes + exact
  # marked EOF appends with the new “account save recovery b1:/b2:” tests —
  # straightforward byte append, prefix-equality proof, no generator/wrapper/
  # source-map family). Historical append files untouched. Proof RECHECK
  # convention: run PHASE=GREEN with the CURRENT app/history/server/save pins.
  ui-cloud-account-save-boundaries.test.mjs) ;;
  # Submitted-draft read-only lock narrow filename registration ONLY (same
  # runner; derived harness = immutable 878e696c… boundaries harness bytes +
  # ONE marked EOF append with the new "account save readonly ro1:" test —
  # exact prefix proof, no generator/wrapper/source-map family). Behavioral
  # RED convention: run PHASE=GREEN with the CURRENT app/save pins; the
  # read-only lock presentation assertions fail against the unchanged
  # production app, not an import error.
  ui-cloud-account-save-readonly.test.mjs) ;;
  # Review-Retry lock-gap narrow filename registration ONLY (same runner;
  # derived harness = immutable c54e61a5… read-only harness bytes + ONE
  # marked EOF append with the new "account save readonly review-retry: rr1"
  # test — exact prefix proof, no generator/wrapper/source-map family).
  # Behavioral RED convention: run PHASE=GREEN with the CURRENT app/save
  # pins; the stale legacy review Retry disabled-state assertion fails
  # against the unchanged locked app (retry-review missing from the
  # lock-blocked actset), not an import error.
  ui-cloud-account-save-readonly-review-retry.test.mjs) ;;
  # Account-save lifecycle narrow filename registration ONLY (same runner;
  # derived harness = immutable 8016f1b7… review-retry harness bytes + ONE
  # marked EOF append with the new "account save lifecycle: lc1" test —
  # exact prefix proof, no generator/wrapper/source-map family). Behavioral
  # RED convention: run PHASE=GREEN with the CURRENT app/save pins; the
  # resumed-acknowledged-draft read-only/recovery assertions fail against
  # the unchanged production controller (silent route-mismatch drop), not
  # an import error.
  ui-cloud-account-save-lifecycle.test.mjs) ;;
  # Ack-retention focused proof narrow filename registration ONLY (same
  # runner; derived harness = immutable 1b9d77f0… lc1 harness bytes + ONE
  # marked EOF append with the new "account save lifecycle ack: lc2ack"
  # test — exact prefix proof, no generator/wrapper/source-map family).
  # Focused RECHECK convention: run PHASE=GREEN with the CURRENT app/save
  # pins; asserts the retained original true-created ack reaches the
  # recovered seam.apply exactly once through the existing mount-seam
  # observer, with one POST and one debit.
  ui-cloud-account-save-lifecycle-ack.test.mjs) ;;
  # Locked-selection helper copy focused case narrow filename registration
  # ONLY (same runner; derived harness = immutable 736b8ec9… lc2ack harness
  # bytes + ONE marked EOF append with the new "account save lifecycle ack
  # copy: lc3copy" test — exact prefix proof, no generator/wrapper/source-map
  # family). Behavioral RED convention: run PHASE=GREEN with the CURRENT
  # app/save pins; the locked-helper false-editable-promise assertion fails
  # against the unchanged production copy strings, not an import error.
  ui-cloud-account-save-lifecycle-ack-copy.test.mjs) ;;
  # Account-save session-boundary focused safety proof narrow filename
  # registration ONLY (same runner; derived harness = immutable b054bbe9…
  # lc3copy harness bytes + ONE marked EOF append with the new "account save
  # session boundary: lc4sessb" test — straightforward byte append,
  # prefix-equality proof, no generator/wrapper/source-map family). Proof
  # RECHECK convention: run PHASE=GREEN with the CURRENT app/save pins; the
  # test exercises sign-out/same-UID-ABA suppression of a held acknowledged
  # receipt through the real session API.
  ui-cloud-account-save-lifecycle-ack-copy-session-boundary.test.mjs) ;;
  # Cross-account late-save-receipt boundary narrow filename registration
  # ONLY (same runner; derived harness = immutable d0cb9655… session-boundary
  # harness bytes + ONE marked EOF append with the new "account save
  # cross-account boundary: lc5crossacct" test — exact prefix-byte proof, no
  # generator/wrapper/source-map family, base untouched). Proof RECHECK
  # convention: run PHASE=GREEN with the CURRENT app/save pins; the test
  # exercises direct A→B same-session switch suppression of a held
  # acknowledged accountA receipt through the real session API and real
  # emulator accounts, with B-side zero-debit/404 isolation readbacks.
  ui-cloud-account-save-lifecycle-ack-copy-session-boundary-cross-account.test.mjs) ;;
  # Deleted-after-ack missing-record recovery narrow filename registration
  # ONLY (same runner; derived harness = immutable 642787e8… cross-account
  # harness bytes + ONE marked EOF append with the new "account save missing
  # record recovery: lc6missing" test — exact prefix-byte proof, no
  # generator/wrapper/source-map family, base untouched). Proof RECHECK
  # convention: run PHASE=GREEN with the CURRENT app/save pins; the test
  # exercises a real acknowledged 201 commit whose record is ACTUALLY
  # deleted over the existing accepted backend DELETE seam before the first
  # held browser detail GET is released (route.continue → REAL same-origin
  # 404), with a GET-only native Retry landing on a second real 404 and the
  # draft/ack retained under the existing guardrails.
  ui-cloud-account-save-lifecycle-ack-copy-session-boundary-cross-account-missing-record.test.mjs) ;;
  # Missing-record RESOLUTION narrow filename registration ONLY (same runner;
  # derived harness = immutable c2ec8fcb… missing-record recovery harness bytes
  # + ONE marked EOF append with the new "account save missing record
  # resolution: rd1missing" test — exact prefix-byte proof, no generator/
  # wrapper/source-map family, base untouched). Behavioral RED convention: run
  # PHASE=GREEN with the CURRENT app/save pins; the acknowledged-record-missing
  # phase, truthful resolution copy and Discard-local-draft control assertions
  # fail against the unchanged production controller/app, not an import error.
  ui-cloud-account-save-lifecycle-ack-copy-session-boundary-cross-account-missing-record-resolution.test.mjs) ;;
  # Uncertain-at-cap safeguard narrow filename registration ONLY (same runner;
  # derived harness = immutable e8b11a75… allowance-denial-editable harness bytes
  # + ONE marked EOF append with the new "account save uncertainty at cap:
  # ad3uncertainatcap" adversarial real-uncertainty proof — exact prefix-byte
  # proof, no generator/wrapper/source-map family, base untouched. Proof RECHECK
  # convention: run PHASE=GREEN with the CURRENT app/save pins.
  ui-cloud-account-save-lifecycle-ack-copy-session-boundary-cross-account-missing-record-resolution-allowance-denial-editable-uncertain-at-cap.test.mjs) ;;
  # Prior-uncertain injected-403 coverage narrow filename registration ONLY
  # (same runner; derived harness = immutable 20039bf3... uncertain-at-cap
  # harness bytes + ONE marked EOF append with the new "account save
  # prior-uncertain injected denial: ad4injected403" case, whose typed 403 is
  # an explicitly labelled CONTROLLED ADVERSARIAL harness substitution recorded
  # AFTER the real route.fetch replay 200 was observed, never backend
  # behaviour). Existing-correct proof convention: run PHASE=GREEN with the
  # CURRENT app/save pins; the controller guard must hold on first run - no
  # manufactured RED, no generator/wrapper/source-map family, base untouched.
  ui-cloud-account-save-lifecycle-ack-copy-session-boundary-cross-account-missing-record-resolution-allowance-denial-editable-uncertain-at-cap-injected-denial.test.mjs) ;;
  # Late-valid-receipt vs TEST-ONLY-replaced-draft narrow filename registration
  # ONLY (same runner; derived harness = immutable 5a64f621... injected-denial
  # harness bytes + ONE marked EOF append with the new "account save late receipt
  # draft replacement: dr1draftrepl" existing-correct proof — the late valid held
  # original detail receipt meeting an explicitly labelled TEST-ONLY hook
  # replacement of the owned draft (ordinary typing is intentionally blocked by
  # the pinned read-only lock, so the genuine-UI b2 path no longer reaches this
  # seam), staged only through a prefix-verified instrumented app.js page
  # response; exact prefix-byte proof, no generator/wrapper/source-map family,
  # base untouched. Existing-correct proof convention: run PHASE=GREEN with the
  # CURRENT app/save pins; the controller changed-draft drop guard must hold on
  # the first run - no manufactured RED.
  ui-cloud-account-save-lifecycle-ack-copy-session-boundary-cross-account-missing-record-resolution-allowance-denial-editable-uncertain-at-cap-injected-denial-draft-replacement.test.mjs) ;;
  # Late-receipt ownership VARIANTS narrow filename registration ONLY (same
  # runner; ONE derived harness = immutable 48a17e5a... draft-replacement
  # harness bytes + ONE marked EOF append with the new "account save late
  # receipt deleted draft: dd1deleteddraft" existing-correct proof (a TEST-ONLY
  # hook DELETION of the owned draft staged through the proven
  # accountSaveDiscard state shape while the acknowledged original detail
  # receipt is held; the supported UI cannot delete a pending locked draft, so
  # this is a labelled test-only manipulation, not a user journey; existing
  # drop semantics only - no resurrection/recreation/apply/success/detail/
  # navigation/stale lock, no new product policy; exact prefix-byte proof, no
  # generator/wrapper/source-map family, base untouched). The file will receive
  # a SECOND marked EOF append (new-ID replacement dr2) only AFTER dd1 GREEN is
  # accepted; each append keeps the prior bytes as an exact prefix.
  # Existing-correct proof convention: run PHASE=GREEN with the CURRENT app/
  # save pins; the controller deleted-draft drop guard must hold on first run.
  ui-cloud-account-save-late-receipt-ownership-variants.test.mjs) ;;
  # Allowance-denied-editable narrow filename registration ONLY (same runner;
  # derived harness = immutable a006fb28… allowance-denial harness bytes + ONE
  # marked EOF append with the new "account save allowance denial editable:
  # ad2deniededitable" existing-correct proof (authoritative editability after
  # the definite refusal) — exact prefix-byte proof, no generator/wrapper/
  # source-map family, base untouched. Proof RECHECK convention: run PHASE=GREEN
  # with the CURRENT app/save pins; the assertions must pass against the repaired
  # production bytes on the first run (no manufactured RED for this case).
  ui-cloud-account-save-lifecycle-ack-copy-session-boundary-cross-account-missing-record-resolution-allowance-denial-editable.test.mjs) ;;
  # Allowance-denial narrow filename registration ONLY (same runner;
  # derived harness = immutable 2fd5f2c2… resolution harness bytes + ONE
  # marked EOF append with the new "account save allowance denial:
  # ad1allowancedenied" TEST-ONLY journey — exact prefix-byte proof, no
  # generator/wrapper/source-map family, base untouched. Behavioral RED
  # convention: run PHASE=GREEN with the CURRENT app/save pins; the explicit
  # exhausted-allowance denial-copy assertion fails against the unchanged
  # production controller (generic uncertain wording for the known 403),
  # not an import error.
  ui-cloud-account-save-lifecycle-ack-copy-session-boundary-cross-account-missing-record-resolution-allowance-denial.test.mjs) ;;
  # First-milestone feedback narrow filename registration ONLY (same runner;
  # derived harness = immutable 37d3e972... late-receipt-ownership-variants
  # bytes as FULL prefix + ONE marked EOF append with the new "account save
  # first milestone feedback: fm1firstmilestone" behavioral RED (the unchanged
  # estimated-score.js mockSaveFeedback first-save acknowledgement leaf is
  # never rendered by the account-save path); exact prefix-byte inverse proof,
  # no generator/wrapper/source-map family, base untouched). Behavioral RED
  # convention: run PHASE=GREEN with the CURRENT app/save pins; the final
  # missing-feedback assertion fails against the unchanged production bytes,
  # not an import/selector/setup error.
  ui-cloud-account-save-first-milestone-feedback.test.mjs) ;;
  # First-milestone NO-REPLAY narrow filename registration ONLY (same runner;
  # derived harness = immutable fd582e2c... first-milestone-feedback bytes as
  # FULL prefix + ONE marked EOF append with the new "account save fm2 no
  # replay: fm2firstacknoreplay" focused safeguard (the consumed first
  # acknowledgement never replays through the supported Home/History re-reads,
  # the same-record Open at unchanged usage 1, or a second created:true used:2
  # save); exact prefix-byte inverse proof, no generator/wrapper/source-map
  # family, base untouched). GREEN-convention: run PHASE=GREEN with the
  # REPAIRED app.js pin (2387e0d2...) and the CURRENT save/helper pins; the
  # safeguard must pass on the first run against the implemented bytes.
  ui-cloud-account-save-first-milestone-no-replay.test.mjs) ;;
  # First-milestone LOST-ACK first-silence narrow filename registration ONLY
  # (same runner; derived harness = immutable 6c25f44a... first-milestone-no-
  # replay bytes as FULL prefix + ONE marked EOF append with the new "account
  # save fm3 lost ack: fm3lostackfirstsilence" existing-correct proof — exact
  # prefix-byte inverse proof, no generator/wrapper/source-map family, base
  # untouched). Existing-correct proof convention (source-only test append on
  # unchanged accepted production bytes; no manufactured RED): run PHASE=GREEN
  # with the REPAIRED app.js pin (2387e0d2...), the CURRENT save/helper pins,
  # and PATTERN selecting only fm3lostackfirstsilence; the no-first-leaf-during-
  # uncertainty and created:false-retry silence assertions must pass on the
  # first run against the implemented bytes.
  ui-cloud-account-save-first-milestone-lost-ack.test.mjs) ;;
  # First-milestone DENIED-CLEANUP retained-ack first-feedback narrow filename
  # registration ONLY (same runner; derived harness = immutable bc99d5d1... lost-
  # ack bytes as FULL prefix + ONE marked EOF append with the new "account save fm4
  # denied cleanup: fm4cleanupdeniedfirstleaf" existing-correct proof - exact
  # prefix-byte inverse proof, no generator/wrapper/source-map family, base
  # untouched). Existing-correct proof convention (source-only test append on
  # unchanged accepted production bytes; no manufactured RED): run PHASE=GREEN
  # with the accepted app.js pin (2387e0d2...), the CURRENT save/helper pins,
  # and PATTERN selecting only fm4cleanupdeniedfirstleaf; the no-leaf-during-
  # cleanup-denial and released-retry first-leaf-once assertions must pass on
  # the first run against the implemented bytes.
  ui-cloud-account-save-first-milestone-denied-cleanup.test.mjs) ;;
  # First-milestone RELOAD no-carryover narrow filename registration ONLY
  # (same runner; derived harness = immutable d3dde7e1... fm4 denied-cleanup
  # bytes as FULL prefix + ONE marked EOF append with the new "account save fm5
  # reload: fm5reloadnocarryover" existing-correct proof - exact prefix-byte
  # inverse proof, no generator/wrapper/source-map family, base untouched).
  # Existing-correct proof convention: run PHASE=GREEN with the accepted
  # app.js pin (2387e0d2...), CURRENT save/helper pins, PATTERN selecting only
  # fm5reloadnocarryover, AFTER fm4 GREEN.
  ui-cloud-account-save-first-milestone-reload.test.mjs) ;;
  # Second-milestone feedback narrow filename registration ONLY (same runner;
  # derived harness = immutable 8511710c... first-milestone-reload bytes as
  # FULL prefix + ONE marked EOF append with the new "account save fm6 second
  # milestone: fm6secondmilestone" behavioral RED (the unchanged estimated-
  # score.js mockSaveFeedback SECOND-milestone acknowledgement is never
  # recorded or rendered by the current FIRST-only app gate; equal supported
  # scores keep the helper-derived kind 'second' with no PB involved); exact
  # prefix-byte inverse proof (a7b9258c...), no generator/wrapper/source-map
  # family, base untouched). Behavioral RED convention: run PHASE=GREEN with
  # the CURRENT accepted app/save pins; the final missing-second-leaf
  # assertion fails against the unchanged production bytes, not an import/
  # selector/setup error.
  ui-cloud-account-save-second-milestone-feedback.test.mjs) ;;
  # Prior-collector hardening narrow filename registration ONLY (same runner;
  # derived harness = immutable a7b9258c... second-milestone-feedback bytes as
  # FULL prefix + ONE marked EOF append with the new "account save fm7pc
  # collector:" tests (precommit prior-catalogue collector hardening: bounded
  # multi-step cursor-cycle refusal, conservative cross-page duplicate-ID
  # refusal, deep-immutable complete snapshot, list-failure-no-POST + Retry
  # recovery, all through the accepted browser/intent/client path with
  # LABELLED browser page fixtures; collector-level RED->GREEN evidence lives
  # in the bounded pure pc-pure harness); exact prefix-byte inverse proof, no
  # generator/wrapper/source-map family, base untouched. Existing-correct
  # proof convention: run PHASE=GREEN with the CURRENT accepted app/save
  # pins; the assertions must pass against the hardened production bytes.
  ui-cloud-account-save-prior-collector-hardening.test.mjs) ;;
  # Stale-account precommit prior-list switch narrow filename registration
  # ONLY (same runner; derived harness = immutable 0fe1c151... fm7pc
  # prior-collector-hardening bytes as FULL prefix + ONE marked EOF append
  # with the new "account save fm9 stale collector:" tests (stale-account
  # interruption DURING the precommit prior catalogue read: the real limit=20
  # first page is fetched upstream via the accepted route.fetch passthrough
  # HOLD, its actual 200 accountA contents/cursor proven BEFORE the boundary,
  # then the SUPPORTED session API switches accounts while the exact original
  # page stays held; zero commit POSTs at every stage, the late release
  # settles as the real stale_account rejection through the untouched
  # session/intent guards, silent drop - no stale failure/success, no revived
  # queue/lock/retained capture, uncommitted browser-local draft
  # byte-unchanged, real-HTTP usage/404 isolation readbacks; LABELLED
  # browser-layer page capture, never a backend-outage claim; existing-
  # correct proof convention - the guards were reviewed as correct at fm7pc,
  # so a first-run pass is labelled coverage, not a manufactured RED). Exact
  # prefix-byte inverse proof, no generator/wrapper/source-map family, base
  # untouched.
  ui-cloud-account-save-prior-collector-stale-account.test.mjs) ;;
  # Second-save recovery safeguards narrow filename registration ONLY
  # (same runner; derived harness = immutable 933ff6c0... fm9 stale-account
  # bytes as FULL prefix + ONE marked EOF append with the new "account save
  # fm10 second recovery: fm10secondcleanupdenied" existing-correct proof -
  # second-save denied-cleanup retained-ack/snapshot recovery: truthful
  # saved-but-cleanup-pending warning with NO feedback leaf of any kind while
  # the key-scoped cleanup denial is armed, two repeated failed keyboard
  # Retries (Enter/Space) with no commit recurrence, no prior-list
  # recollection, no further debit and the SAME retained true-created ack and
  # frozen prior snapshot object reference, then release + explicit Retry
  # renders the exact unchanged-helper-derived second leaf ONCE with exactly
  # two total commit POSTs and no browser history merge, no replay across
  # Home/History/reopen/actual reload; exact prefix-byte inverse proof, no
  # generator/wrapper/source-map family, base untouched). Existing-correct
  # proof convention: run PHASE=GREEN with the CURRENT accepted app/save
  # pins; the assertions must pass against the implemented bytes on the first
  # run - no manufactured RED.
  ui-cloud-account-save-second-recovery-safeguards.test.mjs) ;;
  # Second-save lost-ack second-silence narrow filename registration ONLY
  # (same runner; derived harness = immutable 56ba7568... fm10
  # second-recovery-safeguards bytes as FULL prefix + ONE marked EOF append
  # with the new "account save fm11 second lost ack: fm11secondlostack"
  # existing-correct proof - the ACTUAL second 201 created:true used:2 ack
  # and direct item+usage HTTP readbacks validated BEFORE a controlled
  # malformed 503 replacement (labelled browser-layer fixture, never a
  # backend-outage claim); while uncertain no leaf of any kind, only the
  # truthful cannot-confirm copy with the retained stable ID; the explicit
  # keyboard Retry re-sends the byte-identical POST, receives the REAL
  # idempotent 200 created:false used:2 replay, completes detail+cleanup,
  # and the second-milestone leaf stays ABSENT (created:false never
  # celebrates); usage stays 2, no duplicate record, cached prior never
  # recollected, local slices untouched; exact prefix-byte inverse proof, no
  # generator/wrapper/source-map family, base untouched). Existing-correct
  # proof convention: run PHASE=GREEN with the CURRENT accepted app/save
  # pins; the assertions must pass against the implemented bytes on the
  # first run - no manufactured RED.
  ui-cloud-account-save-second-recovery-lost-ack.test.mjs) ;;
  # fm2 first-ack no-replay KIND-FIRST SUPERSESSION adapter narrow filename
  # registration ONLY (same runner; derived harness = immutable a7ed508c...
  # second-recovery-lost-ack bytes with EXACTLY ONE occurrence-counted
  # statement replacement - the obsolete fm2 second-save ANY-leaf-absent
  # assertion superseded, per the accepted second-milestone-feedback +
  # fm10/fm11 checkpoints, by the kind-first absence assertion (the new
  # second leaf is now valid product behavior); reverse replacement
  # reproduces the a7ed baseline byte-exact, inverseExact proof in
  # fm2sup-build-adapter.py). No append, no generator/wrapper/source-map
  # family, all other inherited assertions untouched. Existing-correct
  # proof convention: run PHASE=GREEN with the CURRENT accepted app/save
  # pins; the adapted fm2 safeguard must pass against the implemented bytes
  # on the first run - no manufactured RED.
  ui-cloud-account-save-second-recovery-lost-ack-fm2sup.test.mjs) ;;
  # s1 primary-confirmed-save TIMING-ONLY adapter narrow filename
  # registration ONLY (same runner; derived harness = immutable d958e79e...
  # fm2sup bytes with EXACTLY ONE occurrence-counted statement INSERTION -
  # a bounded event-driven waitForResponse dispatch await before the
  # UNCHANGED commitCount==1 assertion, because the accepted async
  # precommit prior-collector list (fm7pc) may legitimately delay the
  # commit POST past the confirm click's resolution; reverse removal
  # reproduces the d958 baseline byte-exact, inverseExact proof in
  # fm2supt-build-adapter.py). No assertion weakened, no append, no
  # generator/wrapper/source-map family. Existing-correct proof
  # convention: run PHASE=GREEN with the CURRENT accepted app/save
  # pins; the adapted s1 safeguard must pass against the implemented
  # bytes on the first run - no manufactured RED.
  ui-cloud-account-save-second-recovery-lost-ack-fm2sup-t1.test.mjs) ;;
  # PB-milestone overall-acknowledgement behavioral RED narrow filename
  # registration ONLY (same runner; derived harness = immutable a6b45407...
  # fm2sup-t1 bytes as FULL prefix + ONE marked EOF append with the new
  # "account save fm12 pb milestone: fm12overallpb" behavioral RED (the
  # unchanged estimated-score.js mockSaveFeedback OVERALL personal-best
  # acknowledgement is never recorded or rendered: the current app used===2
  # branch stores ONLY kind 'second' and the renderer accepts only
  # first/second; a REAL backend-seeded lower-score prior record plus a
  # higher-score real UI second save makes the unchanged helper derive kind
  # 'overall' with record:true; exact prefix-byte inverse proof, no
  # generator/wrapper/source-map family, base untouched). Behavioral RED
  # convention: run PHASE=GREEN with the CURRENT accepted app/save pins; the
  # final missing-PB-leaf assertion fails against the unchanged production
  # bytes, not an import/selector/fixture/timing error.
  ui-cloud-account-save-pb-milestone-fm12.test.mjs) ;;
  # Section-only-PB behavioral RED narrow filename registration ONLY (same
  # runner; derived harness = immutable 82cf1191... fm12 bytes as FULL prefix
  # + ONE marked EOF append with the new "account save fm13 section pb:
  # fm13sectionpb" behavioral RED (the unchanged estimated-score.js
  # mockSaveFeedback SECTION-ONLY personal-best acknowledgement is never
  # recorded or rendered: the current app used===2 branch accepts only kinds
  # 'second' and 'overall'; a REAL backend-seeded higher-total prior record
  # whose QR is the one lower section, plus a real UI second save with one
  # strictly higher section and a LOWER total, makes the unchanged helper
  # derive kind 'sections' with record:true; exact prefix-byte inverse proof,
  # no generator/wrapper/source-map family, base untouched). Behavioral RED
  # convention: run PHASE=GREEN with the CURRENT accepted app/save pins; the
  # final missing-PB-leaf assertion fails against the unchanged production
  # bytes, not an import/selector/fixture/timing error.
  ui-cloud-account-save-section-pb-fm13.test.mjs) ;;
  # Third-save OVERALL-PB behavioral RED narrow filename registration ONLY
  # (same runner; derived harness = immutable 4cd144e5... fm13 bytes as FULL
  # prefix + ONE marked EOF append with the new "account save fm14 third pb:
  # fm14thirdpb" behavioral RED (the unchanged estimated-score.js
  # mockSaveFeedback THIRD-save OVERALL personal-best acknowledgement is
  # never recorded or rendered: the current app gates PB presentation on
  # ack.used===2 only; TWO REAL backend-seeded lower-total prior records plus
  # a real UI third save with a total strictly higher than BOTH makes the
  # unchanged helper derive kind 'overall' with record:true and the tied DM
  # section excluded; exact prefix-byte inverse proof, no
  # generator/wrapper/source-map family, base untouched). Behavioral RED
  # convention: run PHASE=GREEN with the CURRENT accepted app/save pins; the
  # final missing-PB-leaf assertion fails against the unchanged production
  # bytes, not an import/selector/fixture/timing error.
  ui-cloud-account-save-third-pb-fm14.test.mjs) ;;
  # Third-save SECTION-ONLY-PB existing-correct boundary proof narrow
  # filename registration ONLY (same runner; derived harness = immutable
  # 73bbf148... fm14 bytes as FULL prefix + ONE marked EOF append with the
  # new "account save fm15 third section pb: fm15thirdsectionpb" boundary
  # proof (the accepted used>=2 gate already presents the unchanged
  # estimated-score.js mockSaveFeedback SECTION-ONLY personal-best kind on a
  # THIRD save whose total beats only the latest prior yet stays lower than
  # the maximum across BOTH priors; exactly one strict section improvement
  # against the per-section maximum, the VR tie and non-improving DM
  # excluded by the frozen strict policy; SJT null everywhere, no SJT change
  # claimed; exact prefix-byte inverse proof, no generator/wrapper/
  # source-map family, base untouched). Existing-correct GREEN convention:
  # run PHASE=GREEN with the CURRENT accepted app/save pins; the assertions
  # must pass against the implemented bytes on the first run - no
  # manufactured RED.
  ui-cloud-account-save-third-section-pb-fm15.test.mjs) ;;
  # Third-save EXACT-TIE silence existing-correct boundary proof narrow
  # filename registration ONLY (same runner; derived harness = immutable
  # d152c3ae... fm15 bytes as FULL prefix + ONE marked EOF append with the
  # new "account save fm16 third tie silence: fm16thirdtiesilence" boundary
  # proof (on a fresh account, TWO real backend-seeded priors one of which
  # carries the EXACT current cognitive scores of the accepted UI save; the
  # third save ties overall AND every cognitive section against the maximum
  # across both priors, so the unchanged helper derives only the generic
  # kind 'saved' with record:false — a derived non-null object, not null —
  # and the accepted 'second|overall|sections' filter renders NO leaf of any
  # kind while the save itself fully succeeds with exactly one additional
  # debit; SJT null everywhere, no SJT difference forced, no SJT change
  # claimed; exact prefix-byte inverse proof, no generator/wrapper/source-map
  # family, base untouched). Existing-correct GREEN convention: run
  # PHASE=GREEN with the CURRENT accepted app/save pins; the assertions must
  # pass against the implemented bytes on the first run - no manufactured
  # RED.
  ui-cloud-account-save-third-tie-silence-fm16.test.mjs) ;;
  # Third-save OVERALL-PB denied-cleanup retry + replay-once existing-correct
  # recovery proof narrow filename registration ONLY (same runner; derived
  # harness = immutable bda661cc... fm16 bytes as FULL prefix + ONE marked EOF
  # append with the new "account save fm17 third pb denied cleanup:
  # fm17thirdpbcleanupdenied" boundary proof (the two seeded priors
  # put usage 2; the real third save that strictly beats BOTH seeded
  # priors derives the helper's overall record:true, but its post-commit
  # draft-cleanup persist denied by the documented browser-local key-scoped
  # Storage shim shows ONLY the truthful saved-but-cleanup-pending warning
  # with zero leaves and no PB text/status at retained usage 3; two explicit
  # keyboard Retries while denied add zero commits, zero recollection, zero
  # debit and keep the same cached prior snapshot object reference; release +
  # one explicit Retry renders the exact helper-derived overall PB leaf ONCE
  # with the actual detail and cleared draft, exactly ONE total commit
  # POST, and no replay across Home/History/reopen/actual reload with the
  # labelled fixture reattachment; exact prefix-byte inverse proof, no
  # generator/wrapper/source-map family, base untouched). Existing-correct
  # GREEN convention: run PHASE=GREEN with the CURRENT accepted app/save
  # pins; the assertions must pass against the implemented bytes on the first
  # run - no manufactured RED.
  ui-cloud-account-save-third-pb-denied-cleanup-fm17.test.mjs) ;;
  # Third-save LOST-ACK -> real idempotent retry + PB silence existing-correct
  # recovery proof narrow filename registration ONLY (same runner; derived
  # harness = immutable 62581e7b... fm17 bytes as FULL prefix + ONE marked EOF
  # append with the new "account save fm18 third lost ack pb silence:
  # fm18thirdlostack" boundary proof (two direct backend seeds put usage 2;
  # the PB-worthy real UI third save actually commits - the fixture awaits the
  # real 201 created:true used:3 plus direct item/usage HTTP readbacks and
  # only THEN replaces the acknowledgement with a controlled malformed 503
  # (labelled browser-layer fixture, never a backend outage claim); while
  # uncertain only the truthful cannot-confirm copy with the exact locked
  # payload, zero leaves, no done/detail/PB text or generic saved status
  # encouragement, error screenshot before Retry; the explicit keyboard Retry
  # re-sends the byte-identical POST, the REAL backend answers its existing
  # idempotent 200 created:false used:3 delivered unchanged, completion shows
  # done + actual third detail while ZERO acknowledgement leaves EVER render
  # (the derived overall PB the save earned is never presented on a
  # created:false replay); usage stays exactly 3 with exactly three distinct
  # stored records, the frozen prior snapshot is never recollected, local
  # slices untouched, and intercepted requests, browser-layer requests and
  # passthrough observer acknowledgements are distinguished exactly; exact
  # prefix-byte inverse proof, no generator/wrapper/source-map family, base
  # untouched). Existing-correct GREEN convention: run PHASE=GREEN with the
  # CURRENT accepted app/save pins; the assertions must pass against the
  # implemented bytes on the first run - no manufactured RED.
  ui-cloud-account-save-third-lost-ack-pb-silence-fm18.test.mjs) ;;
  # Third-save PB-worthy LATE-RECEIPT cross-account leak-safety existing-
  # correct proof narrow filename registration ONLY (same runner; derived
  # harness = immutable aff78c01... fm18 bytes as FULL prefix + ONE marked EOF
  # append with the new "account save fm19 third pb cross-account leak:
  # fm19thirdleak" boundary proof (two direct backend seeds put accountA at
  # usage 2; the PB-worthy real UI third save receives its REAL 201
  # created:true used:3 passthrough acknowledgement UNCHANGED and the ACTUAL
  # original getMock detail receipt is transparently held - status 200, the
  # literal id, original note + thinking and the strong review ETag validated
  # from the capture plus direct HTTP usage 3 and item readbacks BEFORE the
  # boundary; the same live session switches DIRECTLY to fresh real accountB
  # while the hold remains and the EXACT captured 200 body/status/headers is
  # released LAST; the ACTUAL client receipt settles rejected stale_account
  # through the untouched guards via the transparent forwarder (real promise
  # settlement, not merely no-pending); under B nothing applies EVER, zero
  # leaves of any kind at every checkpoint AND zero continuous additions by a
  # labelled TEST-ONLY DOM observer, no done/detail/Retry/navigation/status
  # revival, no PB/score-comparison text or distinctive A private numeric
  # tokens in the visible account UI, the intentionally retained browser-local
  # draft stays byte-unchanged and is not conflated with account-data leakage;
  # B usage 0 + empty catalogue + A id 404 under B while A durably keeps
  # usage 3 with the ORIGINAL record unchanged (suppression is not rollback);
  # PB-worthiness derived READ-ONLY from the ACTUAL captured precommit
  # limit=20 prior page + the ACTUAL third detail via the UNCHANGED helper;
  # exact prefix-byte inverse proof, no generator/wrapper/source-map family,
  # base untouched). Existing-correct GREEN convention: run PHASE=GREEN with
  # the CURRENT accepted app/save pins; the assertions must pass against the
  # implemented bytes on the first run - no manufactured RED.
  ui-cloud-account-save-third-pb-cross-account-leak-fm19.test.mjs) ;;
  # Third-save OVERALL-PB record-confetti normal-motion behavioral RED\n  # narrow filename registration ONLY (same runner; derived harness =\n  # immutable 9efc5b89... fm19 bytes as FULL prefix + ONE marked EOF append\n  # with the new "account save fm20 third pb record confetti:\n  # fm20thirdpbconfetti" RED (contract16 requires the account-save\n  # record-confetti for a successful genuine PB respecting reduced motion;\n  # the accepted accountSaveFeedback seam renders the helper-derived PB leaf\n  # via textContent but never calls the existing playMockRecordConfetti\n  # helper (app.js 605-610); the test explicitly emulates reducedMotion\n  # no-preference over the inherited reduce default, proves the page-side\n  # prefers-reduced-motion reduce matchMedia query FALSE through the same\n  # query the helper uses, reuses the accepted two direct seeds (usage 2)\n  # plus the saveJourneys real UI third save (2300 strictly over BOTH, usage\n  # 3, one real 201 created:true passthrough, one browser POST, one\n  # collector dispatch, one seam apply, done line, ACTUAL detail, cleared\n  # draft, untouched local slices), asserts the accepted visible PB leaf\n  # text as passing proof FIRST, then requires the ephemeral .mock-confetti\n  # layer under #mock-acknowledgement, aria-hidden, twelve i particles, via\n  # a TEST-ONLY non-mutating DOM observer of attachment that survives the\n  # existing 2s removal without freezing timers; receipt + screenshot\n  # written before the missing-behavior assertion; exact prefix-byte inverse\n  # proof, no generator/wrapper/source-map family, base untouched).\n  # Behavioral RED convention: run PHASE=GREEN with the CURRENT accepted\n  # app/save pins; the final missing-confetti assertion fails against the\n  # unchanged production bytes, not an import/selector/fixture/timing error.\n  ui-cloud-account-save-third-pb-record-confetti-fm20.test.mjs) ;;\n  *) echo "REFUSE: unexpected harness filename: $HARNESS_FILE"; exit 2 ;;
  # Third-save OVERALL-PB record-confetti GREEN dedup-observer adapter
  # narrow filename registration ONLY (same runner; derived harness =
  # immutable be6a8639... fm20 RED bytes with EXACTLY ONE occurrence-
  # counted TEST-ONLY observer statement replacement: the
  # installTestOnlyConfettiWatch note() gains a WeakSet<Element> so a
  # physically-single .mock-confetti layer cannot be double-counted
  # (the observer fires for the added PB parent, whose subtree already
  # contains the layer at callback time, AND for the later-added layer
  # itself). Distinct-physical-layer semantics; every behavioural
  # assertion, expected value, message and title stays byte-unchanged;
  # reverse replacement reproduces be6a8639 byte-exact (proof:
  # fm20green-build-adapter.py). GREEN convention: run PHASE=GREEN
  # with the REPAIRED app.js pin (3d2f6757...) and the CURRENT save/
  # helper pins; the fm20 behavioural assertions must pass against the
  # repaired bytes on the first run - exactly ONE physical confetti
  # layer under #mock-acknowledgement, aria-hidden, twelve i
  # particles, the existing 2s removal timer observed un-frozen.
  ui-cloud-account-save-third-pb-record-confetti-fm20-dedup.test.mjs) ;;
  # Third-save OVERALL-PB record-confetti REDUCED-MOTION existing-
  # correct proof narrow filename registration ONLY (same runner;
  # derived harness = immutable fd66d289... fm20-dedup bytes as FULL
  # prefix + ONE marked EOF append with the new 'account save fm21
  # third pb reduced motion: fm21thirdmotion' proof - the inherited
  # reduce emulation plus the page-side helper-query matchMedia TRUE
  # gate, the unchanged helper early-return (app.js 606), the SAME
  # TEST-ONLY WeakSet-deduplicated non-mutating distinct-physical-
  # layer observer over a REAL un-frozen 2300ms wait beyond the
  # normal-motion 2s removal window, then ZERO attachments, empty
  # attach log and zero live layers; exact prefix-byte inverse proof
  # in build-fm21thirdmotion-harness.py; no generator/wrapper/
  # source-map family, base untouched). Existing-correct GREEN
  # convention: run PHASE=GREEN with the CURRENT accepted app/save
  # pins (3d2f6757...); the assertions must pass against the
  # implemented bytes on the first run - no manufactured RED.
  ui-cloud-account-save-third-pb-reduced-motion-fm21.test.mjs) ;;
  # Normal-motion record-confetti helper TIMER-REMOVAL supplementary
  # browser evidence narrow filename registration ONLY (same runner;
  # derived harness = immutable 38a7a4ba... fm21 bytes as FULL prefix
  # + ONE marked EOF append with the new 'account save fm22 confetti
  # timer removal: fm22confettitimer' case - replays the accepted fm20
  # normal-motion THIRD-save OVERALL-PB journey on the SAME final app
  # pin 3d2f6757..., then waits a REAL un-frozen 2600ms beyond the
  # existing helper two-second removal window (app.js 610 UNCHANGED)
  # and requires exactly ONE distinct physical attachment EVER via the
  # SAME TEST-ONLY WeakSet-deduplicated non-mutating observer, the
  # aria-hidden twelve-i attachment-time record and ZERO live layers
  # post-wait; supplementary evidence, never a fm20 replacement;
  # exact prefix-byte inverse proof in
  # build-fm22confettitimer-harness.py; no generator/wrapper/
  # source-map family, base untouched). Existing-correct GREEN
  # convention: run PHASE=GREEN with the CURRENT accepted app/save
  # pins (3d2f6757...); the assertions must pass against the
  # implemented bytes on the first run - no manufactured RED.
  ui-cloud-account-save-confetti-timer-removal-fm22.test.mjs) ;;
  # Normal-motion record-confetti GUARD (record:false silence +
  # sections record:true celebration) narrow filename registration
  # ONLY (same runner; derived harness = immutable b60dcc0e... fm22
  # bytes as FULL prefix + ONE marked EOF append with the new
  # 'account save fm23 normal motion confetti guard: fm23nmguard'
  # test - TWO block-scoped journeys on the SAME final app pin
  # 3d2f6757...: A real first commit + equal-score second UI save
  # (201 used:1/used:2, exact helper-derived first/second leaves
  # record:false) attach ZERO physical confetti layers EVER across
  # a REAL un-frozen 2600ms no-preference window; B the accepted
  # fm15 two-seed section-only third save (kind sections
  # record:true, QR-only 710 over 670) attaches EXACTLY ONE
  # aria-hidden twelve-i layer inside #mock-acknowledgement in
  # normal motion; exact prefix-byte inverse proof in
  # build-fm23nmguard-harness.py; no generator/wrapper/source-map
  # family, base untouched). Existing-correct GREEN convention:
  # run PHASE=GREEN with the CURRENT accepted app/save pins; the
  # assertions must pass against the implemented bytes on the
  # first run - no manufactured RED.
  ui-cloud-account-save-normal-motion-confetti-guard-fm23.test.mjs) ;;
  # Sections-kind record:true acknowledgement under EXPLICIT
  # reduced motion: direct attach-ZERO browser proof narrow filename
  # registration ONLY (same runner; derived harness = immutable
  # a15ecdb9... fm23 bytes as FULL prefix + ONE marked EOF append
  # with the new 'account save fm24 sections reduced motion
  # confetti silence: fm24sectionsreduced' test - the accepted fm23B
  # fixture re-run (2320 max / 2180 latest seeds, third UI save
  # 2300, kind sections record:true, exact QR-only leaf once) under
  # the inherited reduce default PLUS explicit emulateMedia reduce
  # (page-side helper-query matchMedia TRUE) must attach ZERO
  # distinct physical .mock-confetti layers EVER across a REAL
  # un-frozen 2600ms window via the SAME TEST-ONLY WeakSet-
  # deduplicated non-mutating observer; closes the first disclosed
  # fm22/fm23 gap (sections-kind reduced-motion silence was only
  # derived by construction); exact prefix-byte inverse proof in
  # build-fm24sectionsreduced-harness.py; no generator/wrapper/
  # source-map family, base untouched). Existing-correct GREEN
  # convention: run PHASE=GREEN with the CURRENT accepted app/save
  # pins; the assertions must pass against the implemented bytes on
  # the first run - no manufactured RED.
  ui-cloud-account-save-sections-reduced-motion-confetti-fm24.test.mjs) ;;
  # Normal-motion record:true confetti lifecycle across reachable
  # navigation and an ACTUAL reload narrow filename registration
  # ONLY (same runner; derived harness = immutable fm24 harness
  # bytes as FULL prefix + ONE marked EOF append with the new
  # 'account save fm25 normal motion confetti no replay:
  # fm25nmnoreplay' test - the accepted fm22 fixture re-run
  # (2170/2100 seeds, third UI save 2300, kind overall record:true)
  # under explicit no-preference motion: ONE distinct physical
  # aria-hidden twelve-i layer attached on the genuine original
  # save (in-window live 1), REMOVED by the existing unmodified
  # helper timer after a REAL un-frozen 2600ms window (attachAdds
  # still 1 EVER, live 0), then ZERO leaf/done/confetti replay and
  # ZERO NEW attachments across Home departure, History re-entry,
  # same-list reopen and an actual reload (reinstalled post-reload
  # observer records ZERO attachments EVER across a second real
  # 2600ms window; usage pinned at 3, one commit POST the whole
  # journey; closes the second disclosed fm22/fm23 gap - fm17
  # proved TEXT non-replay only); exact prefix-byte inverse proof
  # in build-fm25nmnoreplay-harness.py; no generator/wrapper/
  # source-map family, base untouched). Existing-correct GREEN
  # convention: run PHASE=GREEN with the CURRENT accepted app/save
  # pins; the assertions must pass against the implemented bytes on
  # the first run - no manufactured RED.
  ui-cloud-account-save-normal-motion-confetti-no-replay-fm25.test.mjs) ;;
  ui-cloud-account-save-work-budget-denied-wb1.test.mjs) ;;
  # Paid-daily pd1 narrow filename registration ONLY (same runner; derived
  # harness = immutable wb1 85d979f9… bytes + six occurrence-counted exact-inverse
  # pin/clock substitutions + ONE marked EOF append; see pd-build-harness.py.
  # Behavioral RED convention: run PHASE=GREEN with the CURRENT app/save pins; the
  # final missing-behavior phase assertion fails against the unchanged controller,
  # not an import/selector/fixture error. No other runner logic changed.) ;;
  ui-cloud-account-save-paid-daily-denied-pd1.test.mjs) ;;
  # Paid-daily pd2 narrow filename registration ONLY (same runner;
  # derived harness = immutable pd1 2414fc64… bytes + ONE marked EOF append with the
  # new "account save paid daily uncertain guard: pd2prioruncertain429" existing-
  # correct proof — the definite daily-limit branch is already gated on !priorUncertain
  # in the accepted controller 2ee264d1…, so a first-run pass is labelled coverage, not
  # a manufactured RED; exact prefix-byte inverse proof, no generator/wrapper/source-map
  # family, base untouched). Existing-correct proof convention: run PHASE=GREEN with the
  # CURRENT accepted app/save pins.
  ui-cloud-account-save-paid-daily-uncertain-pd2.test.mjs) ;;
  # Paid-daily pd3 narrow filename registration ONLY (same runner; derived harness =
  # immutable pd2 bytes + ONE marked EOF append with the new "account save paid daily
  # midnight reset: pd3midnightadvanceexplicit201" proof RECHECK — the accepted store
  # policy (dailyLedger: a valid PAST day counts as zero for the new day; cumulative
  # never resets) is re-proven at the trusted fixture clock advanced to the EXACT next
  # UTC midnight with an explicit Save earning a real 201 and zero requests at the
  # clock move; exact prefix-byte inverse proof, no generator/wrapper/source-map
  # family, base untouched). Proof RECHECK convention: run PHASE=GREEN with the CURRENT
  # accepted app/save pins.
  ui-cloud-account-save-paid-daily-midnight-pd3.test.mjs) ;;
  # Paid-daily pd4 narrow filename registration ONLY (same runner; derived harness =
  # immutable pd3 81cc40cd\xe2\x80\xa6 bytes + ONE marked EOF append with the new "account save paid
  # daily usage row: pd4paidusage" behavioral case (the ACTIVE paid projection must render the
  # \xc2\xa73 approved paid daily row byte-exact via textContent, the unpaid initial row stays
  # byte-unchanged, the trusted-clock midnight advance changes only the daily figure, and a
  # labelled browser-layer malformed partial paid response fails closed to the sanitized error).
  # Behavioral RED convention: run PHASE=GREEN with the CURRENT app/access pins; the paid-row
  # assertion fails against the unchanged account-access initial-framing, not an import error;
  # exact prefix-byte inverse proof, no generator/wrapper/source-map family, base untouched.
  ui-cloud-account-save-paid-daily-usage-row-pd4.test.mjs) ;;
  # Paid-daily pd5 narrow filename registration ONLY (same runner; derived harness =
  # immutable pd4 bytes + ONE marked EOF append with the new "account save paid daily offer
  # copy: pd5offer" behavioral case (the obsolete 100-mock-log offer and total-versus-
  # additional clauses are superseded by the \xc2\xa74 approved neutral paid copy on the Upgrade
  # and Plans & pricing screens; headings, unconfigured-price/grants-nothing disclosures and
  # every action stay byte-unchanged; browser-local presentation-only, zero network).
  # Behavioral RED convention: run PHASE=GREEN with the CURRENT app/access pins; the absent-
  # old-copy assertion fails against the unchanged app.js offer clauses, not an import error;
  # exact prefix-byte inverse proof, no generator/wrapper/source-map family, base untouched.
  ui-cloud-account-save-paid-daily-offer-copy-pd5.test.mjs) ;;
  # Saved-mock score-row narrow filename registration ONLY (same runner;
  # derived harness = immutable r2 list bytes 848ecdda... as full prefix +
  # five occurrence-counted exact-inverse substitutions (two UICLOUD_SCORE_ROW_
  # STYLES styles-pin overrides + three current-backend GATE197 pin updates
  # matching the accepted pd5 backend bytes) + ONE marked EOF append with the
  # new "history score:" local/account cases (build-savedmock-score-row-
  # harness.py, per-testfix pin e9da7fd1...; held pre-fix f854ac58 bytes
  # preserved under evidence/score-row-preserved/). Behavioral RED convention:
  # run PHASE=GREEN with the CURRENT app/history/access pins and the pre-
  # score-row styles.css pin c97743a0 via UICLOUD_SCORE_ROW_STYLES unset
  # (baseline ui-baseline styles match the current file); the missing-score
  # assertion fails against the unchanged app.js historyRows, not an import
  # error. No other runner logic changed.
  ui-cloud-account-history-list-score-row.test.mjs) ;;
  # Final-pin affected-regression narrow filename registrations ONLY (same
  # runner, same guards, no other logic change). Each derived harness =
  # immutable accepted harness bytes + ONLY occurrence-counted exact-inverse
  # current-pin binding substitutions (GATE197 rebased to CURRENT accepted
  # backend mock-client 4f3b3a36 / auth-boundary dd2b451a / mock-store
  # afc0ad17 + inserted paid-daily-policy e9a2f3ed pin line, plus two
  # UICLOUD_FINAL_STYLES styles-pin override registrations; inverse receipt
  # final-pin-build-adapters.py). No assertion, title, expected value or
  # fixture semantics changed. wb-fp keeps the wb test-only server import and
  # the designated lowered mutationWorkBudget{maxReviewDocumentWork:1,
  # maxTransactionAttempts:3} constructor argument byte-unchanged (NOT the
  # paid default 256); accepted paid policy stays intact. Existing-correct
  # proof RECHECK convention: run PHASE=GREEN with the CURRENT final
  # app/history/access/server/save pins and UICLOUD_FINAL_STYLES=316ba012…
  ui-cloud-account-save-ad2-fp.test.mjs) ;;
  ui-cloud-account-save-wb-fp.test.mjs) ;;
  ui-cloud-account-save-lc2ack-fp.test.mjs) ;;
  ui-cloud-account-save-fm3-lost-ack-fp.test.mjs) ;;
  # primary signed-in save + named controller-served + served-source binding
  # (s1/t1 chain, same substitution recipe).
  ui-cloud-account-save-primary-signedin-t1-fp.test.mjs) ;;
  # History empty-caption focused case narrow filename registration ONLY
  # (same runner, same guards, no other logic change; derived harness =
  # immutable 902d92db... t1-fp bytes as FULL prefix + ONE marked EOF append
  # with the two new "history empty caption: hc1/hc2" cases — exact prefix
  # byte proof, no generator/wrapper/source-map family, base untouched.
  # Behavioral RED convention: run PHASE=GREEN with the CURRENT accepted
  # app/save/history/server pins and UICLOUD_FINAL_STYLES=316ba012...; hc1's
  # scoped-footer assertion fails against the unchanged generic copy string,
  # not an import/selector/fixture error; hc2 is an existing-correct
  # boundary proof.)
  ui-cloud-history-empty-caption-fp.test.mjs) ;;
  # h1 scoped-caption current-bound adapter narrow filename registration ONLY
  # (same runner; derived harness = immutable 902d92db... t1-fp bytes with
  # EXACTLY ONE occurrence-counted inverse-verified statement substitution —
  # the inherited h1 browser-local copy expectation updated from the superseded
  # generic copy to the new scoped copy; reverse replacement reproduces
  # 902d92db byte-exact; no append, no wrapper family, base untouched.
  # Proof RECHECK convention: run PHASE=GREEN with the REPAIRED app pin
  # 8ddf3b9d... and UICLOUD_FINAL_STYLES=316ba012...; the h1 account-list,
  # empty-local-visibility, populated-row and loading/error assertions must
  # pass against the repaired bytes on the first run.)
  ui-cloud-history-list-scoped-caption-fp.test.mjs) ;;
  # Account-review-edit first vertical narrow filename registration ONLY
  # (same runner, same guards, no other logic change; derived harness =
  # immutable 4c8b26e3... empty-caption chain bytes as FULL prefix + ONE
  # marked EOF append with the two new "review edit: re1/re2" cases — exact
  # prefix byte inverse proof via build-review-edit-harness.py, no
  # generator/wrapper/source-map family, base untouched). Behavioral RED
  # convention: run PHASE=GREEN with the STARTING accepted app/history/
  # access/save/server pins and UICLOUD_FINAL_STYLES=316ba012...; re1's
  # Edit question reviews assertion fails against the unchanged read-only
  # account-history.js, not an import/selector/fixture error. After the
  # owned account-history.js repair, re1 GREEN reuses the same selection;
  # re2 is authored after that GREEN and asserts cancel-safety on the
  # repaired bytes (existing-correct coverage, not a manufactured RED).
  ui-cloud-account-review-edit-fp.test.mjs) ;;
  # Account-review-edit SAFETY slice narrow filename registration ONLY
  # (same runner family, same guards, no other logic change; derived harness =
  # immutable c175b6d6... review-edit first-vertical bytes as FULL prefix +
  # marked EOF appends re3 (stale detached editor-control ownership) then
  # re4 (real competing-writer 412 + cancel-safe reload) — exact prefix byte
  # inverse proof via build-review-edit-safety-harness.py, no generator/
  # wrapper/source-map family, base untouched). Behavioral RED convention:
  # run PHASE=GREEN with the CURRENT accepted app/history/access/save/server
  # pins and UICLOUD_FINAL_STYLES=316ba012...; each case's missing-behavior
  # assertion fails against the unchanged production bytes, not an import/
  # selector/fixture error. Each case is authored after the prior case's
  # GREEN on the repaired bytes.
  ui-cloud-account-review-edit-safety-fp.test.mjs) ;;
  # Account-progress analytics first tracer narrow filename registration ONLY
  # (same runner, same guards, no other logic change; derived harness =
  # immutable 664d4f57... safety bytes as FULL prefix + occurrence-counted
  # exact-inverse pin-binding substitutions + ONE marked EOF append with the
  # new "account progress: aa1" case — exact prefix-byte inverse proof via
  # build-account-progress-harness.py, no generator/wrapper/source-map family,
  # base untouched). Behavioral RED convention: run PHASE=GREEN with the
  # CURRENT accepted app/history/access/save/server pins, NO account-progress
  # pin (arg 12 '-') and NO progress-view pin (arg 13 '-'); the missing-block
  # visibility assertion fails against the unchanged production bytes (module
  # route not served), not an import/selector/fixture error. GREEN reuses the
  # same selection with the owned new-module/app/server/pv pins.
  # UICLOUD_FINAL_STYLES stays embedded in every launch command.
  # Generation 2 (aa2 lifecycle/error proof authored after aa1 GREEN): the
  # aa1-generation bytes stay an exact FULL prefix + ONE marked EOF append;
  # prefix-truncation inverse proof in the same build receipt.
  ui-cloud-account-progress-analytics-fp.test.mjs|ui-cloud-account-progress-analytics2-fp.test.mjs) ;;
  # Guard-restoration repair: the pinned 88b93b79 bytes contain ONE physically
  # single line (original line 561) whose intended multi-line fm20 registration
  # was written with LITERAL \n escape text inside a leading '#' comment, so
  # BOTH the fm20 registration AND the '*) REFUSE unexpected harness filename'
  # default guard were inert (demonstrated: an unregistered filename fell
  # through with no refusal). This clause restores the exact intended guard
  # semantics verbatim for every non-allowlisted filename. The fm20 harness
  # itself is NOT invoked by this task and stays unregistered (the dead
  # original one-liner text is left untouched for byte-history). See
  # paid-daily-final-regression-checkpoint.md disclosure.
  *) echo "REFUSE: unexpected harness filename: $HARNESS_FILE"; exit 2 ;;
esac
LOCK=/workspace/.mock-overview-frontend-test.lock
if [ "$PHASE" != "RED" ] && [ "$PHASE" != "GREEN" ]; then echo "REFUSE: bad PHASE $PHASE"; exit 2; fi
if [ -e "$LOCK" ]; then echo "REFUSE: shared lock present: $LOCK"; exit 2; fi
if pgrep -f 'firebase|emulator|java' >/dev/null 2>&1; then echo "REFUSE: firebase/java processes already running"; pgrep -af 'firebase|java' | head; exit 2; fi
cd /workspace/ui-cloud-integration || exit 2
HARNESS="$HARNESS_FILE"
ACTUAL_HARNESS=$(sha256sum "$HARNESS" | cut -d" " -f1)
if [ "$ACTUAL_HARNESS" != "$HARNESS_PIN" ]; then echo "REFUSE: list harness hash mismatch: $ACTUAL_HARNESS != $HARNESS_PIN"; exit 2; fi
ACTUAL_ORIG=$(sha256sum ui-cloud-account-usage.test.mjs | cut -d" " -f1)
if [ "$ACTUAL_ORIG" != "$TEST_PIN" ]; then echo "REFUSE: original harness hash mismatch: $ACTUAL_ORIG != $TEST_PIN"; exit 2; fi
ACTUAL_SERVER=$(sha256sum integration-server.js | cut -d" " -f1)
if [ "$ACTUAL_SERVER" != "$SERVER_PIN" ]; then echo "REFUSE: integration-server hash mismatch: $ACTUAL_SERVER != $SERVER_PIN"; exit 2; fi
ACTUAL_APP=$(sha256sum app.js | cut -d" " -f1)
if [ "$ACTUAL_APP" != "$APP_PIN" ]; then echo "REFUSE: app.js hash mismatch: $ACTUAL_APP != $APP_PIN"; exit 2; fi
if [ "$PHASE" = "GREEN" ]; then
  ACTUAL_HIST=$(sha256sum account-history.js | cut -d" " -f1)
  if [ "$ACTUAL_HIST" != "$HISTORY_PIN" ]; then echo "REFUSE: account-history.js hash mismatch: $ACTUAL_HIST != $HISTORY_PIN"; exit 2; fi
else
  if [ -f account-history.js ]; then echo "REFUSE: account-history.js must not exist at RED"; exit 2; fi
fi
export JAVA_HOME="$(cat /workspace/backend-integration/java-home.txt)"
export PATH="$JAVA_HOME/bin:$PATH"
export JAVA_TOOL_OPTIONS="-Xmx384m -XX:ActiveProcessorCount=1"
export FIREBASE_CLI_DISABLE_TELEMETRY=1 CI=1
export PLAYWRIGHT_BROWSERS_PATH=/workspace/design-preview/.browsers
export LD_LIBRARY_PATH=/workspace/design-preview/.system-deps/root/usr/lib/x86_64-linux-gnu:/workspace/design-preview/.system-deps/root/lib/x86_64-linux-gnu
export UICLOUD_PHASE="$PHASE"
export UICLOUD_EVIDENCE_DIR="$EVIDENCE_DIR"
if [ "$PHASE" = "GREEN" ]; then
  export UICLOUD_FINAL_HASHES="{\"app.js\":\"$APP_PIN\"}"
  export UICLOUD_STAGE_HASHES="{\"account-access.js\":\"$ACCESS_PIN\",\"account-history.js\":\"$HISTORY_PIN\",\"integration-server.js\":\"$SERVER_PIN\",\"ui-cloud-account-usage.test.mjs\":\"$TEST_PIN\"}"
  if [ "$SAVE_PIN" != "-" ]; then
    ACTUAL_SAVE=$(sha256sum account-save.js | cut -d" " -f1)
    if [ "$ACTUAL_SAVE" != "$SAVE_PIN" ]; then echo "REFUSE: account-save.js hash mismatch: $ACTUAL_SAVE != $SAVE_PIN"; exit 2; fi
    export UICLOUD_STAGE_HASHES="{\"account-access.js\":\"$ACCESS_PIN\",\"account-history.js\":\"$HISTORY_PIN\",\"account-save.js\":\"$SAVE_PIN\",\"integration-server.js\":\"$SERVER_PIN\",\"ui-cloud-account-usage.test.mjs\":\"$TEST_PIN\"}"
  fi
  # account-progress vertical: optional pinned new module + owned pv override
  # (exact conditional stage-hash append pattern, inverse-verified; unpinned =
  # route not served).
  if [ "$PROGRESS_PIN" != "-" ]; then
    ACTUAL_AP=$(sha256sum account-progress.js | cut -d" " -f1)
    if [ "$ACTUAL_AP" != "$PROGRESS_PIN" ]; then echo "REFUSE: account-progress.js hash mismatch: $ACTUAL_AP != $PROGRESS_PIN"; exit 2; fi
    if [ "$SAVE_PIN" != "-" ]; then
      export UICLOUD_STAGE_HASHES="{\"account-access.js\":\"$ACCESS_PIN\",\"account-history.js\":\"$HISTORY_PIN\",\"account-save.js\":\"$SAVE_PIN\",\"account-progress.js\":\"$PROGRESS_PIN\",\"integration-server.js\":\"$SERVER_PIN\",\"ui-cloud-account-usage.test.mjs\":\"$TEST_PIN\"}"
    else
      export UICLOUD_STAGE_HASHES="{\"account-access.js\":\"$ACCESS_PIN\",\"account-history.js\":\"$HISTORY_PIN\",\"account-progress.js\":\"$PROGRESS_PIN\",\"integration-server.js\":\"$SERVER_PIN\",\"ui-cloud-account-usage.test.mjs\":\"$TEST_PIN\"}"
    fi
  fi
  if [ "$PV_PIN" != "-" ]; then
    ACTUAL_PV=$(sha256sum progress-view.js | cut -d" " -f1)
    if [ "$ACTUAL_PV" != "$PV_PIN" ]; then echo "REFUSE: progress-view.js hash mismatch: $ACTUAL_PV != $PV_PIN"; exit 2; fi
    export UICLOUD_PROGRESS_VIEW="$PV_PIN"
  fi
else
  # RED: harness pins its own BASELINE_APP internally (current starting app);
  # FINAL_HASHES intentionally unset for app.js.
  export UICLOUD_STAGE_HASHES="{\"account-access.js\":\"$ACCESS_PIN\",\"integration-server.js\":\"$SERVER_PIN\",\"ui-cloud-account-usage.test.mjs\":\"$TEST_PIN\"}"
fi
if [ "$PATTERN" = "ALL" ]; then
  CHILD_CMD="node --test --test-reporter=tap $HARNESS"
else
  CHILD_CMD="node --test --test-reporter=tap --test-name-pattern=\"$PATTERN\" $HARNESS"
fi
/workspace/backend-integration/node_modules/.bin/firebase emulators:exec \
  --project demo-deltascore-fresh \
  --config /workspace/backend-integration/firebase-all.json \
  --only auth,firestore \
  "$CHILD_CMD"
echo "EMU_EXEC_EXIT=$?"
