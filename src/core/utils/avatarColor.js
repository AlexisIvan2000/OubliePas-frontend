const PALETTE = ["#1e63de", "#3193c8", "#2f5f8f", "#4c7cc7", "#1f8a70", "#5a6e88"];

export function avatarColor(seed = "") {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 997;
  }
  return PALETTE[hash % PALETTE.length];
}
