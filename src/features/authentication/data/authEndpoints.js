export const AUTH_ENDPOINTS = {
  register: "/auth/register",
  login: "/auth/login",
  verifyEmail: "/auth/verify-email",
  resendVerification: "/auth/resend-verification",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  refresh: "/auth/refresh",
  logout: "/auth/logout",
  me: "/auth/me",
  googleStart: "/auth/google/start",
  google: "/auth/google",
};

export const USER_ENDPOINTS = {
  me: "/users/me",
  avatar: "/users/me/avatar",
  deleteAccount: "/users/me/delete",
  changePassword: "/users/me/change-password",
  setPassword: "/users/me/set-password",
  changeEmail: "/users/me/change-email",
  confirmEmailChange: "/users/me/confirm-email-change",
  resendEmailChange: "/users/me/resend-email-change",
};
