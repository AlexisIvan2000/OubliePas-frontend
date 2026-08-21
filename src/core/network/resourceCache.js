const store = new Map();
let generation = 0;

export function resourceGeneration() {
  return generation;
}

export function readResource(key) {
  const entry = store.get(key);
  return entry && entry.generation === generation ? entry.value : undefined;
}

export function writeResource(key, value, from) {
  if (from !== undefined && from !== generation) {
    return false;
  }
  store.set(key, { generation, value });
  return true;
}

export function clearResources() {
  generation += 1;
  store.clear();
}
