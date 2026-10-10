/* Historical on-device identities. Keep these addresses stable across AWJ upgrades. */
var AWJ_COMPAT=Object.freeze({
  appName:"AWJ",
  previousAppName:"Rep Gym Companion",
  stateKey:"rep-gym-companion-v1",
  stateDb:"health-os-state-v1",
  vaultDb:"rep-device-vault-v1",
  authKey:"rep-notion-pairing-key-v1",
  authChannel:"rep-auth-v1",
  snapshotAtKey:"rep-last-device-snapshot-at",
  errorLogKey:"rep-error-log-v1",
  uiKey:"rep-ui-preferences-v1",
  telemetryKey:"rep-rum-v1",
  syncSignaturesKey:"rep-sync-signatures-v1",
  handoffKey:"rep-pair-handoff-v1",
  mediaCache:"rep-exercise-media-v1",
  legacyCachePrefix:"rep-companion-",
  legacyMediaContractGlobal:"REP_MEDIA_CONTRACT",
  legacyBackupFormat:"rep-health-export/v5",
  backupFormat:"awj-export/v5"
});
globalThis.AWJ_COMPAT=AWJ_COMPAT;
