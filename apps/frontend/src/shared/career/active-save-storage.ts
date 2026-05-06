const ACTIVE_SAVE_STORAGE_KEY = 'bm-active-save-id';

export function readActiveSaveId() {
  return window.localStorage.getItem(ACTIVE_SAVE_STORAGE_KEY);
}

export function writeActiveSaveId(saveId: string) {
  window.localStorage.setItem(ACTIVE_SAVE_STORAGE_KEY, saveId);
}

export function clearActiveSaveId() {
  window.localStorage.removeItem(ACTIVE_SAVE_STORAGE_KEY);
}
