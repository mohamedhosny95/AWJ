export function createSettingsScreen(){
  const mount=()=>{window.REP_ENHANCEMENTS_UI.settings(state.settingsSection);window.AWJ_LOCALE?.apply();};
  return {mount,update:mount,destroy(){}};
}
