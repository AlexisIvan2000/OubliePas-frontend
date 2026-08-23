export const MAX_AVATAR_BYTES = 9 * 1024 * 1024;

export const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png"];

export const ACCEPTED_AVATAR_TYPES = ALLOWED_AVATAR_TYPES.join(",");

export function avatarFileError(file) {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return "settings.photoWrongType";
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return "settings.photoTooLarge";
  }
  if (file.size === 0) {
    return "settings.photoEmpty";
  }
  return null;
}
