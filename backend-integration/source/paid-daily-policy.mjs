// Paid-daily-limit pure policy helpers — paid-daily-limit-contract.md.
// Trusted-internal ONLY: callers pass server-side snapshot data and a trusted
// clock value. Nothing here reads request input; no request can reach these.
const CANONICAL_ISO=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const CANONICAL_DAY=/^\d{4}-\d{2}-\d{2}$/;
function bad(message){throw Object.assign(new Error(message),{code:'invalid_entitlement_state'})}
// Grant lives at account/entitlements/mock-logs: {ownerUid,kind:'self-paid-daily12',expiresAt canonical ISO UTC}.
// Contract: valid only while clock()<expiresAt (exact instant is expired); MISSING or
// EXPIRED falls back to the initial allowance; MALFORMED record or FOREIGN owner fails
// closed as a storage-level refusal — a corrupt record must never silently grant or be
// treated as absent.
export function grantActive(snapshot,uid,nowMs){
  if(!snapshot.exists)return {active:false,expiresAt:null};
  const g=snapshot.data();
  if(!g||typeof g!=='object'||Array.isArray(g))bad('Entitlement record is malformed');
  if(g.kind!=='self-paid-daily12'||typeof g.ownerUid!=='string')bad('Entitlement record is malformed');
  if(g.ownerUid!==uid)bad('Entitlement ownership is inconsistent');
  if(typeof g.expiresAt!=='string'||!CANONICAL_ISO.test(g.expiresAt)||!Number.isFinite(nowMs))bad('Entitlement expiry is malformed');
  const expiry=Date.parse(g.expiresAt);
  if(!Number.isFinite(expiry)||new Date(expiry).toISOString()!==g.expiresAt)bad('Entitlement expiry is malformed');
  return {active:nowMs<expiry,expiresAt:g.expiresAt};
}
// Calendar-day UTC daily counter fields on the trusted ledger.
// Both absent => zero used today (explicit DEV baseline migration; no live accounts exist).
// Exactly one present, or malformed/out-of-range/corrupt values, or a FUTURE day => fail closed.
// A valid PAST day counts as zero for the new day. never resets cumulative used.
export function dailyLedger(ledgerData,todayIso,nowMs){
  if(!Number.isFinite(nowMs)||!CANONICAL_DAY.test(todayIso))bad('Trusted clock value is invalid');
  const hasDate=Object.hasOwn(ledgerData,'dailyLogDate'),hasCount=Object.hasOwn(ledgerData,'dailyLogsUsed');
  if(!hasDate&&!hasCount)return 0;
  if(hasDate!==hasCount)bad('Daily allowance ledger is half-populated');
  const date=ledgerData.dailyLogDate,count=ledgerData.dailyLogsUsed;
  if(typeof date!=='string'||!CANONICAL_DAY.test(date))bad('Daily allowance date is malformed');
  const parsed=Date.parse(date+'T00:00:00.000Z');
  if(!Number.isFinite(parsed)||new Date(parsed).toISOString().slice(0,10)!==date)bad('Daily allowance date is not a real UTC day');
  if(!Number.isSafeInteger(count)||count<0||count>12)bad('Daily allowance count is corrupt');
  if(date>todayIso)bad('Daily allowance date is in the future');
  return date===todayIso?count:0;
}
export function nextUtcMidnightIso(nowMs){
  if(!Number.isFinite(nowMs))bad('Trusted clock value is invalid');
  const d=new Date(nowMs);
  return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()+1,0,0,0,0)).toISOString();
}
