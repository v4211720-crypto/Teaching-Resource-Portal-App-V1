import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User } from "../types";
import { api, getSavedDevice, setSavedDevice } from "../lib/api";

const TOKEN_STORAGE_KEY = "teacher_hub_auth_token";
const USER_STORAGE_KEY = "teacher_hub_auth_user";
const REMEMBER_STORAGE_KEY = "teacher_hub_remember_me";

// Safe in-memory fallback for environments where both localStorage & sessionStorage are blocked
let memoryToken: string | null = null;
let memoryUser: User | null = null;

/**
 * Robust token retrieval:
 * 1. Checks localStorage first (persists across tab closes, mobile reloads, and PWAs)
 * 2. Falls back to sessionStorage (tab-scoped fallback)
 * 3. Falls back to in-memory cache
 * Safely handles DOMExceptions (iOS Safari private browsing, QuotaExceededError, iframe security)
 */
export const getStoredAuthToken = (): string | null => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token && token.trim()) return token.trim();
    }
  } catch (e) {
    console.warn("[AuthContext] localStorage read failed:", e);
  }

  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      const token = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
      if (token && token.trim()) return token.trim();
    }
  } catch (e) {
    console.warn("[AuthContext] sessionStorage read failed:", e);
  }

  return memoryToken;
};

/**
 * Robust token persistence:
 * Always writes to localStorage with dual-write to sessionStorage.
 * This guarantees mobile browsers survive unexpected tab teardowns and page reloads.
 */
export const setStoredAuthToken = (token: string, remember: boolean = true) => {
  memoryToken = token;

  // Primary: localStorage
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
      if (remember) {
        window.localStorage.setItem(REMEMBER_STORAGE_KEY, "true");
      }
    }
  } catch (e) {
    console.warn("[AuthContext] localStorage write failed, relying on sessionStorage:", e);
  }

  // Dual-write fallback: sessionStorage
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
  } catch (e) {
    console.warn("[AuthContext] sessionStorage write failed:", e);
  }
};

/**
 * Cleanly wipe authentication credentials from all storage layers
 */
export const clearStoredAuthToken = () => {
  memoryToken = null;

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.localStorage.removeItem(REMEMBER_STORAGE_KEY);
    }
  } catch {}

  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {}
};

export const getStoredUser = (): User | null => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const raw = window.localStorage.getItem(USER_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {}

  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      const raw = window.sessionStorage.getItem(USER_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {}

  return memoryUser;
};

export const setStoredUser = (user: User | null) => {
  memoryUser = user;
  if (!user) {
    try {
      window?.localStorage?.removeItem(USER_STORAGE_KEY);
      window?.sessionStorage?.removeItem(USER_STORAGE_KEY);
    } catch {}
    return;
  }

  const str = JSON.stringify(user);
  try {
    window?.localStorage?.setItem(USER_STORAGE_KEY, str);
  } catch {}
  try {
    window?.sessionStorage?.setItem(USER_STORAGE_KEY, str);
  } catch {}
};

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string, remember?: boolean, schoolId?: string, schoolCode?: string) => Promise<void>;
  registerSchool: (data: {
    school_name?: string;
    school_code?: string;
    name?: string;
    code?: string;
    admin_username: string;
    admin_email: string;
    admin_password: string;
    admin_name?: string;
    address?: string;
    contact_phone?: string;
    storage_quota_gb?: number;
  }) => Promise<void>;
  logout: () => void;
  currentDevice: string;
  setCurrentDevice: (device: string) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  addNotification: (title: string, message: string, type?: NotificationItem["type"]) => void;
  refreshUser: () => Promise<void>;
  updateSchoolBrandColor: (color: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [loading, setLoading] = useState(true);
  const [currentDevice, setCurrentDeviceState] = useState<string>(getSavedDevice());
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif_1",
      title: "Cross-Device Sync Active",
      message: "Centralized server storage is online. Files uploaded from mobile will immediately sync with computer.",
      timestamp: "Just now",
      type: "success",
      read: false,
    },
    {
      id: "notif_2",
      title: "Storage Policy",
      message: "Teacher quota is 15GB. Video lectures and audio notes are automatically backed up.",
      timestamp: "10 mins ago",
      type: "info",
      read: true,
    },
  ]);

  const setCurrentDevice = (device: string) => {
    setSavedDevice(device);
    setCurrentDeviceState(device);
  };

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await api.getCurrentUser();
      if (currentUser) {
        setStoredUser(currentUser);
        setUser((prev) => {
          if (!prev) return currentUser;
          if (
            prev.id === currentUser.id &&
            prev.storage_used === currentUser.storage_used &&
            prev.storage_limit === currentUser.storage_limit &&
            prev.name === currentUser.name &&
            prev.role === currentUser.role &&
            prev.status === currentUser.status &&
            prev.school?.brand_color === currentUser.school?.brand_color &&
            prev.school?.name === currentUser.school?.name
          ) {
            return prev;
          }
          return currentUser;
        });
      }
    } catch {
      // Keep existing session on transient verification network error
    }
  }, []);

  // Periodic background check to keep institutional brand color synchronized for all active users
  useEffect(() => {
    if (!user?.schoolId) return;
    const interval = setInterval(async () => {
      try {
        const currentSchool = await api.getCurrentSchool();
        setUser((prev) => {
          if (!prev || !prev.school) return prev;
          if (
            prev.school.brand_color !== currentSchool.brand_color ||
            prev.school.name !== currentSchool.name
          ) {
            const updated = { ...prev, school: currentSchool };
            setStoredUser(updated);
            return updated;
          }
          return prev;
        });
      } catch {
        // silent sync fallback
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [user?.schoolId]);

  const updateSchoolBrandColor = async (color: string) => {
    const cleanColor = color.trim();
    // Optimistically update local user school state for instantaneous UI feedback
    setUser((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        school: prev.school ? { ...prev.school, brand_color: cleanColor } : undefined,
      };
      setStoredUser(updated);
      return updated;
    });

    try {
      const updatedSchool = await api.updateSchoolTheme(cleanColor);
      setUser((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          school: updatedSchool,
        };
        setStoredUser(updated);
        return updated;
      });
      addNotification("Theme Saved", `Institutional brand color updated to ${cleanColor}!`, "success");
    } catch (err: any) {
      console.error("Failed to update school brand color:", err);
      addNotification("Theme Update Error", err.message || "Failed to update theme", "error");
      throw err;
    }
  };

  // Session Initialization on mount and page reloads
  useEffect(() => {
    const init = async () => {
      // 1. Immediately hydrate with cached user session to guarantee zero screen flashing or logout on mobile reload
      const cached = getStoredUser();
      if (cached) {
        setUser(cached);
      }

      // 2. Validate token from localStorage (fallback to sessionStorage)
      const token = getStoredAuthToken();
      if (token) {
        try {
          const u = await api.getCurrentUser();
          if (u) {
            setUser(u);
            setStoredUser(u);
          } else if (!cached) {
            clearStoredAuthToken();
            setStoredUser(null);
            setUser(null);
          }
        } catch (err: any) {
          // On mobile networks or static hosting, transient errors should NEVER log out the user
          const isExplicitUnauthorized =
            err?.status === 401 ||
            err?.statusCode === 401 ||
            (err?.message && err.message.toLowerCase().includes("unauthorized"));

          if (isExplicitUnauthorized) {
            clearStoredAuthToken();
            setStoredUser(null);
            setUser(null);
          } else if (cached) {
            console.warn("[AuthContext:init] Retaining authenticated mobile session despite network check failure:", err.message);
            setUser(cached);
          }
        }
      } else {
        setUser(null);
        setStoredUser(null);
      }
      setLoading(false);
    };

    init();
  }, []);

  const login = async (
    username: string,
    password: string,
    remember: boolean = false,
    schoolId?: string,
    schoolCode?: string
  ) => {
    // 1. Sanitize, trim, and normalize inputs to resolve mobile keyboard auto-capitalization & trailing space anomalies
    const rawUser = (username || "").trim();
    const rawPass = (password || "").trim();
    const rawSchool = (schoolCode || schoolId || "").trim();

    // Mobile keyboards often capitalize the first letter of email addresses (e.g., "Vadivubiochem@gmail.com")
    // Normalize emails to lowercase while preserving trimmed username format
    const cleanUsername = rawUser.includes("@") ? rawUser.toLowerCase() : rawUser;
    const cleanPassword = rawPass;
    const cleanSchoolCode = rawSchool.toUpperCase();

    console.group(`[AuthContext:login] Starting login attempt for user: "${cleanUsername}"`);
    console.log("Input Parameters (Normalized):", {
      username: cleanUsername,
      rawUsername: rawUser,
      providedSchoolId: schoolId,
      providedSchoolCode: schoolCode,
      normalizedIdentifier: cleanSchoolCode || "None (Universal)",
      device: currentDevice,
    });

    try {
      const data = await api.login(cleanUsername, cleanPassword, currentDevice, schoolId, cleanSchoolCode);
      console.log("[AuthContext:login] Authentication successful! Scoped session established:", {
        userId: data.user.id,
        username: data.user.username,
        role: data.user.role,
        schoolId: data.user.schoolId,
        institutionName: data.user.school?.name,
        institutionCode: data.user.school?.code,
      });
      console.groupEnd();

      // Persist token in localStorage with fallback to sessionStorage
      setStoredAuthToken(data.token, remember);
      setStoredUser(data.user);
      setUser(data.user);
      addNotification("Logged In", `Welcome back, ${data.user.name || data.user.username}!`, "success");
    } catch (err: any) {
      console.error("[AuthContext:login] Authentication rejected:", err.message);
      if (err.message && err.message.toLowerCase().includes("institution does not exist")) {
        console.warn(
          `[AuthContext:login TRACE: 'Selected institution does not exist']\n` +
          `  -> Queried identifier: "${cleanSchoolCode}"\n` +
          `  -> Please verify the institution is registered and active in the database.`
        );
      }
      console.groupEnd();
      throw err;
    }
  };

  const registerSchool = async (data: {
    school_name?: string;
    school_code?: string;
    name?: string;
    code?: string;
    admin_username: string;
    admin_email: string;
    admin_password: string;
    admin_name?: string;
    address?: string;
    contact_phone?: string;
    storage_quota_gb?: number;
  }) => {
    const res = await api.registerSchool(data);
    setStoredAuthToken(res.token, true);
    setStoredUser(res.user);
    setUser(res.user);
    addNotification("Institution Registered", `Successfully registered ${res.user.school?.name || "school"}!`, "success");
  };

  const logout = () => {
    clearStoredAuthToken();
    setStoredUser(null);
    setUser(null);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const addNotification = (title: string, message: string, type: NotificationItem["type"] = "info") => {
    setNotifications((prev) => [
      {
        id: "notif_" + Date.now(),
        title,
        message,
        timestamp: "Just now",
        type,
        read: false,
      },
      ...prev.slice(0, 19),
    ]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        registerSchool,
        logout,
        currentDevice,
        setCurrentDevice,
        notifications,
        markNotificationRead,
        clearNotifications,
        addNotification,
        refreshUser,
        updateSchoolBrandColor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
