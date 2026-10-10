/** Existing deployed identities and wire aliases, retained for installed clients. */
export const AWJ_COMPAT=Object.freeze({
  pairingSecretName:"REP_SYNC_KEY",
  syncHeader:"x-rep-sync-key",
  idempotencyHeader:"x-rep-idempotency-key",
  sessionCookie:"__Host-rep_session",
  tokenVersion:"rep1",
  notionSourceName:"Rep Gym Companion"
});

export function pairingSecret(environment:object):string{
  const values=environment as Record<string,unknown>;
  const value=values.AWJ_SYNC_KEY||values[AWJ_COMPAT.pairingSecretName];
  return typeof value==="string"?value:"";
}
