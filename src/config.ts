import * as path from 'path';
import * as os from 'os';

export const BOOT_ROOT = path.join(os.homedir(), '.skillsboot');
export const TEMPLATES_STORE = path.join(BOOT_ROOT, 'templates');
export const VARIANTS_STORE = path.join(BOOT_ROOT, 'variants');

export const SYNC_DEBOUNCE_MS = 500;
export const SYNC_LOCK_TIMEOUT_MS = 1000;
