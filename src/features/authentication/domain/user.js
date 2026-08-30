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
    hasCustomAvatar: Boolean(dto.has_custom_avatar),
    hasPassword: Boolean(dto.has_password),
    currency: dto.currency ?? "CAD",
    reminderEmailEnabled: dto.reminder_email_enabled ?? true,
    reminderPushEnabled: dto.reminder_push_enabled ?? false,
    reminderNoticeEnabled: dto.reminder_notice_enabled ?? true,
    reminderOverdueEnabled: dto.reminder_overdue_enabled ?? true,
    reminderActionEnabled: dto.reminder_action_enabled ?? true,
    reminderWeeklyEnabled: dto.reminder_weekly_enabled ?? false,
    defaultReminderDays: dto.default_reminder_days ?? 3,
    locale: dto.locale ?? "fr",
    // Sans valeur du serveur on ne devine pas un plafond : l'indicateur se tait
    // plutot que d'en annoncer un qui n'est peut-etre plus le bon.
    commitmentLimit: dto.commitment_limit ?? null,
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
