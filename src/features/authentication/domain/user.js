export function mapUser(dto) {
  if (!dto) {
    return null;
  }
  return {
    id: dto.id,
    firstName: dto.first_name,
    lastName: dto.last_name ?? null,
    email: dto.email,
    isVerified: dto.is_verified,
    role: dto.role,
    avatarUrl: dto.avatar_url ?? null,
    currency: dto.currency ?? "CAD",
  };
}

export function fullName(user) {
  if (!user) {
    return "";
  }
  return [user.firstName, user.lastName].filter(Boolean).join(" ");
}

export function initials(user) {
  if (!user) {
    return "";
  }
  const letters = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((part) => part.trim().charAt(0).toUpperCase());
  return letters.join("") || user.email.charAt(0).toUpperCase();
}

export function isAdmin(user) {
  return user?.role === "admin" || user?.role === "super_admin";
}
