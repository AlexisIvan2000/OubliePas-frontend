const store = new Map();
const listeners = new Map();
let generation = 0;

// Le cache etait partage mais muet : deux composants sur la meme cle gardaient
// chacun sa copie dans un useState, et l'ecriture de l'un n'atteignait jamais
// l'autre. La pastille de la barre laterale restait sur son ancien compte
// jusqu'a la navigation suivante.
export function subscribeResource(key, listener) {
  const abonnes = listeners.get(key) ?? new Set();
  abonnes.add(listener);
  listeners.set(key, abonnes);

  return () => {
    abonnes.delete(listener);
    if (!abonnes.size) {
      listeners.delete(key);
    }
  };
}

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
  listeners.get(key)?.forEach((listener) => listener(value));
  return true;
}

export async function refreshResource(key, fetcher) {
  const from = generation;
  try {
    writeResource(key, await fetcher(), from);
  } catch {
    // Une lecture derivee qui echoue ne doit pas faire echouer l'ecriture qui
    // l'a declenchee : le paiement est passe, et la valeur en place se
    // corrigera au prochain chargement.
  }
}

export function clearResources() {
  generation += 1;
  store.clear();
}
