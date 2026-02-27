import type { CartItem } from '../types';

export type Draft = {
  id: string;
  created_at: string; // ISO
  customer_name?: string;
  discount: number;
  payment_method?: string;
  items: CartItem[];
  subtotal: number;
  total: number;
};

const STORAGE_KEY = 'pos_drafts_v1';
const AUTO_DELETE_KEY = 'drafts_autodelete_24h';

function readDrafts(): Draft[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: Draft[] = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeDrafts(drafts: Draft[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    // ignore
  }
}

export function setAutoDelete24h(enabled: boolean) {
  try {
    window.localStorage.setItem(AUTO_DELETE_KEY, enabled ? 'true' : 'false');
  } catch {}
}

export function getAutoDelete24h(): boolean {
  try {
    return window.localStorage.getItem(AUTO_DELETE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function purgeOld(maxAgeHours = 24) {
  const drafts = readDrafts();
  const cutoff = Date.now() - maxAgeHours * 60 * 60 * 1000;
  const filtered = drafts.filter(d => new Date(d.created_at).getTime() >= cutoff);
  if (filtered.length !== drafts.length) writeDrafts(filtered);
}

export function listDrafts(): Draft[] {
  if (getAutoDelete24h()) purgeOld(24);
  return readDrafts().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getDraft(id: string): Draft | undefined {
  return readDrafts().find(d => d.id === id);
}

export function upsertDraft(draft: Draft) {
  const drafts = readDrafts();
  const idx = drafts.findIndex(d => d.id === draft.id);
  if (idx >= 0) drafts[idx] = draft; else drafts.unshift(draft);
  writeDrafts(drafts);
}

export function deleteDraft(id: string) {
  const drafts = readDrafts().filter(d => d.id !== id);
  writeDrafts(drafts);
}
