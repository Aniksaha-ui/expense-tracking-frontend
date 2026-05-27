/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { APP_CONFIG } from "../services/config";
import {
  AUTH_SESSION_TIMEOUT_EVENT,
  AUTH_SESSION_TIMEOUT_MESSAGE,
  resetSessionTimeoutState,
} from "../services/apiClient";
import { useToast } from "../components/common/Toaster";
import { login as loginRequest } from "../features/auth/service/authService";
import { getAdminMenu } from "../features/menu/service/menuService";
import { normalizeStoredMenuState } from "../features/menu/utils/menuHelpers";

const AuthContext = createContext(null);

const defaultAuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const defaultMenuState = {
  mainMenuItems: [],
  bottomMenuItems: [],
  status: "idle",
  error: null,
  cachedAt: null,
};

const getPersistedAuthSession = () => {
  const rawValue = window.localStorage.getItem(APP_CONFIG.authStorageKey);

  if (!rawValue) {
    return defaultAuthState;
  }

  try {
    const parsedValue = JSON.parse(rawValue);

    return {
      user: parsedValue.user ?? null,
      token: parsedValue.token ?? null,
      isAuthenticated: Boolean(parsedValue.token),
    };
  } catch {
    return defaultAuthState;
  }
};

const getPersistedMenuState = () => {
  const rawValue = window.localStorage.getItem(APP_CONFIG.menuStorageKey);

  if (!rawValue) {
    return defaultMenuState;
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    const { mainMenuItems, bottomMenuItems } = normalizeStoredMenuState(parsedValue);
    const hasCachedMenu = mainMenuItems.length > 0 || bottomMenuItems.length > 0;

    return {
      mainMenuItems,
      bottomMenuItems,
      status: hasCachedMenu ? "succeeded" : "idle",
      error: null,
      cachedAt: parsedValue.cachedAt ?? null,
    };
  } catch {
    return defaultMenuState;
  }
};

const persistAuthSession = (session) => {
  window.localStorage.setItem(APP_CONFIG.authStorageKey, JSON.stringify(session));
};

const persistMenuState = (menuState) => {
  const hasMenu = menuState.mainMenuItems.length > 0 || menuState.bottomMenuItems.length > 0;

  if (!hasMenu) {
    window.localStorage.removeItem(APP_CONFIG.menuStorageKey);
    return;
  }

  window.localStorage.setItem(
    APP_CONFIG.menuStorageKey,
    JSON.stringify({
      mainMenuItems: menuState.mainMenuItems,
      bottomMenuItems: menuState.bottomMenuItems,
      cachedAt: menuState.cachedAt,
    })
  );
};

export function AuthProvider({ children }) {
  const toast = useToast();
  const [auth, setAuth] = useState(getPersistedAuthSession);
  const [menu, setMenu] = useState(getPersistedMenuState);
  const [loginState, setLoginState] = useState({ status: "idle", error: null });
  const [logoutState, setLogoutState] = useState({ status: "idle", error: null });
  const [sessionMessage, setSessionMessage] = useState("");

  const clearSession = useCallback(() => {
    window.localStorage.removeItem(APP_CONFIG.authStorageKey);
    window.localStorage.removeItem(APP_CONFIG.menuStorageKey);
    resetSessionTimeoutState();
    setAuth(defaultAuthState);
    setMenu(defaultMenuState);
  }, []);

  const loadMenu = useCallback(async ({ force = false } = {}) => {
    setMenu((currentMenu) => {
      if (!force && currentMenu.status === "loading") {
        return currentMenu;
      }

      return { ...currentMenu, status: "loading", error: null };
    });

    try {
      const menuItems = await getAdminMenu();
      const nextMenuState = {
        ...menuItems,
        status: "succeeded",
        error: null,
        cachedAt: Date.now(),
      };

      setMenu(nextMenuState);
      persistMenuState(nextMenuState);
      return nextMenuState;
    } catch (error) {
      const message = error.message || "Unable to load menu items.";
      setMenu((currentMenu) => ({
        ...currentMenu,
        status: "failed",
        error: message,
      }));
      toast.error(message);
      throw error;
    }
  }, [toast]);

  const login = useCallback(
    async (credentials) => {
      setLoginState({ status: "loading", error: null });

      try {
        const session = await loginRequest(credentials);
        resetSessionTimeoutState();
        persistAuthSession(session);
        setAuth({
          user: session.user,
          token: session.token,
          isAuthenticated: true,
        });
        setMenu(defaultMenuState);
        window.localStorage.removeItem(APP_CONFIG.menuStorageKey);
        await loadMenu({ force: true });
        setLoginState({ status: "succeeded", error: null });
        return session;
      } catch (error) {
        const message = error.message || "Unable to sign in.";
        setLoginState({
          status: "failed",
          error: message,
        });
        toast.error(message);
        throw error;
      }
    },
    [loadMenu, toast]
  );

  const logout = useCallback(async () => {
    setLogoutState({ status: "loading", error: null });

    clearSession();
    setSessionMessage("");
    setLoginState({ status: "idle", error: null });
    setLogoutState({ status: "succeeded", error: null });
    toast.success("Signed out successfully.");
  }, [clearSession, toast]);

  useEffect(() => {
    if (!auth.isAuthenticated || menu.status !== "idle") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      loadMenu().catch(() => {});
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [auth.isAuthenticated, loadMenu, menu.status]);

  useEffect(() => {
    const handleSessionTimeout = (event) => {
      const message = event.detail?.message || AUTH_SESSION_TIMEOUT_MESSAGE;
      setSessionMessage(message);
      toast.error(message);
      clearSession();
    };

    window.addEventListener(AUTH_SESSION_TIMEOUT_EVENT, handleSessionTimeout);

    return () => {
      window.removeEventListener(AUTH_SESSION_TIMEOUT_EVENT, handleSessionTimeout);
    };
  }, [clearSession, toast]);

  const value = useMemo(
    () => ({
      auth,
      menu,
      login,
      loginState,
      logout,
      logoutState,
      loadMenu,
      sessionMessage,
      clearSessionMessage: () => setSessionMessage(""),
    }),
    [auth, loadMenu, login, loginState, logout, logoutState, menu, sessionMessage]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider.");
  }

  return context;
}
