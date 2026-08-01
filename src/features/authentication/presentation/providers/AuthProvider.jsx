import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { onSessionExpired } from "../../../../core/network/httpClient";
import {
  clearTokens,
  getRefreshToken,
  hasSession,
  setTokens,
  watchCrossTabChanges,
} from "../../../../core/network/tokenStorage";
import * as authApi from "../../data/authApi";
import { installSessionRefresh } from "../../data/sessionBootstrap";
import * as userApi from "../../data/userApi";
import { mapUser } from "../../domain/user";
import { AuthContext } from "./AuthContext";

installSessionRefresh();

const STATUS = {
  loading: "loading",
  authenticated: "authenticated",
  anonymous: "anonymous",
};

export function AuthProvider({ children }) {
  const [status, setStatus] = useState(() =>
    hasSession() ? STATUS.loading : STATUS.anonymous,
  );
  const [user, setUser] = useState(null);
  const [sessionNotice, setSessionNotice] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const applyAnonymous = useCallback((notice = null) => {
    clearTokens();
    setUser(null);
    setStatus(STATUS.anonymous);
    setSessionNotice(notice);
  }, []);

  const loadUser = useCallback(async () => {
    const dto = await authApi.fetchCurrentUser();
    const mapped = mapUser(dto);
    if (mounted.current) {
      setUser(mapped);
      setStatus(STATUS.authenticated);
    }
    return mapped;
  }, []);

  useEffect(() => {
    if (!hasSession()) {
      return;
    }
    loadUser().catch(() => {
      if (mounted.current) {
        applyAnonymous();
      }
    });
  }, [applyAnonymous, loadUser]);

  useEffect(() => onSessionExpired((code) => applyAnonymous(code)), [applyAnonymous]);

  useEffect(
    () =>
      watchCrossTabChanges(({ refreshToken }) => {
        if (!refreshToken) {
          setUser(null);
          setStatus(STATUS.anonymous);
        }
      }),
    [],
  );

  const startSession = useCallback(
    async (tokens) => {
      setTokens(tokens);
      setSessionNotice(null);
      return loadUser();
    },
    [loadUser],
  );

  const login = useCallback(
    async (credentials) => {
      const tokens = await authApi.login(credentials);
      return startSession(tokens);
    },
    [startSession],
  );

  const verifyEmail = useCallback(
    async (payload) => {
      const tokens = await authApi.verifyEmail(payload);
      return startSession(tokens);
    },
    [startSession],
  );

  const completeGoogleSignIn = useCallback(
    async (payload) => {
      const tokens = await authApi.completeGoogleSignIn(payload);
      return startSession(tokens);
    },
    [startSession],
  );

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout({ refreshToken });
      } catch {
        /* la session locale est purgee quoi qu'il arrive */
      }
    }
    applyAnonymous();
  }, [applyAnonymous]);

  const refreshUser = useCallback(async () => {
    const dto = await userApi.getProfile();
    const mapped = mapUser(dto);
    if (mounted.current) {
      setUser(mapped);
    }
    return mapped;
  }, []);

  const updateProfile = useCallback(
    async (fields) => {
      await userApi.updateProfile(fields);
      return refreshUser();
    },
    [refreshUser],
  );

  const uploadAvatar = useCallback(
    async (file) => {
      await userApi.uploadAvatar(file);
      return refreshUser();
    },
    [refreshUser],
  );

  const deleteAvatar = useCallback(async () => {
    await userApi.deleteAvatar();
    return refreshUser();
  }, [refreshUser]);

  const changePassword = useCallback(
    async (payload) => {
      const result = await userApi.changePassword(payload);
      applyAnonymous("PASSWORD_CHANGED");
      return result;
    },
    [applyAnonymous],
  );

  const setPassword = useCallback(async (payload) => userApi.setPassword(payload), []);

  const confirmEmailChange = useCallback(
    async (payload) => {
      const result = await userApi.confirmEmailChange(payload);
      await refreshUser();
      return result;
    },
    [refreshUser],
  );

  const value = useMemo(
    () => ({
      status,
      user,
      sessionNotice,
      isLoading: status === STATUS.loading,
      isAuthenticated: status === STATUS.authenticated,
      clearSessionNotice: () => setSessionNotice(null),
      register: authApi.register,
      resendVerification: authApi.resendVerification,
      forgotPassword: authApi.forgotPassword,
      resetPassword: authApi.resetPassword,
      requestEmailChange: userApi.requestEmailChange,
      resendEmailChange: userApi.resendEmailChange,
      login,
      verifyEmail,
      completeGoogleSignIn,
      logout,
      refreshUser,
      updateProfile,
      uploadAvatar,
      deleteAvatar,
      changePassword,
      setPassword,
      confirmEmailChange,
    }),
    [
      status,
      user,
      sessionNotice,
      login,
      verifyEmail,
      completeGoogleSignIn,
      logout,
      refreshUser,
      updateProfile,
      uploadAvatar,
      deleteAvatar,
      changePassword,
      setPassword,
      confirmEmailChange,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
