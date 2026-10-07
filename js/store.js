// Family data lives only in this browser (localStorage). Nothing is sent anywhere.
const KEY = 'collegeprep.v1';

const empty = () => ({ version: 1, students: [], activeId: null, settings: { alerts: [7, 1] } });

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    return normalize(JSON.parse(raw));
  } catch {
    return empty();
  }
}

function normalize(data) {
  if (!data || !Array.isArray(data.students)) throw new Error('Not a College Prep backup');
  const base = empty();
  return {
    ...base,
    ...data,
    settings: { ...base.settings, ...(data.settings || {}) },
    students: data.students.map((s) => ({
      schools: {}, tasks: {}, customSchools: [], ...s,
    })),
  };
}

export function getState() {
  return state;
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Could not save', err);
  }
  listeners.forEach((fn) => fn(state));
}

export function update(fn) {
  fn(state);
  save();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function activeStudent() {
  return state.students.find((s) => s.id === state.activeId) || state.students[0] || null;
}

export const newId = () => Math.random().toString(36).slice(2, 10);

export function exportBackup() {
  return JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);
}

export function importBackup(text) {
  state = normalize(JSON.parse(text));
  save();
}

// Ask the browser not to evict our data under storage pressure.
export async function requestPersistence() {
  try {
    if (navigator.storage && navigator.storage.persist) return await navigator.storage.persist();
  } catch { /* not supported */ }
  return false;
}
