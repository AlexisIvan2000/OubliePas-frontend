export const MAX_LIST_HEIGHT = 240;

export function opensUpward(box, viewport) {
  const below = viewport - box.bottom;
  return below < MAX_LIST_HEIGHT && box.top > below;
}
