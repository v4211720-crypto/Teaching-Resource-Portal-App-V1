import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User } from "../types";
import { api, getAuthToken, setAuthToken, removeAuthToken, getSavedDevice, setSavedDevice } from "../lib/api";

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
  const [user, setUser] = useState<User | null>(null);
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
    } catch {
      setUser(null);
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
            return {
              ...prev,
              school: currentSchool,
            };
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
      return {
        ...prev,
        school: prev.school ? { ...prev.school, brand_color: cleanColor } : undefined,
      };
    });

    try {
      const updatedSchool = await api.updateSchoolTheme(cleanColor);
      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          school: updatedSchool,
        };
      });
      addNotification("Theme Saved", `Institutional brand color updated to ${cleanColor}!`, "success");
    } catch (err: any) {
      console.error("Failed to update school brand color:", err);
      addNotification("Theme Update Error", err.message || "Failed to update theme", "error");
      throw err;
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const u = await api.getCurrentUser();
          setUser(u);
        } catch {
          removeAuthToken();
          setUser(null);
        }
      } else {
        setUser(null);
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
    const code = (schoolCode || schoolId || "").trim();
    console.group(`[AuthContext:login] Starting login attempt for user: "${username}"`);
    console.log("Input Parameters:", {
      username,
      providedSchoolId: schoolId,
      providedSchoolCode: schoolCode,
      normalizedIdentifier: code || "None (Universal)",
      device: currentDevice,
    });

    try {
      const data = await api.login(username, password, currentDevice, schoolId, code);
      console.log("[AuthContext:login] Authentication successful! Scoped session established:", {
        userId: data.user.id,
        username: data.user.username,
        role: data.user.role,
        schoolId: data.user.schoolId,
        institutionName: data.user.school?.name,
        institutionCode: data.user.school?.code,
      });
      console.groupEnd();
      setAuthToken(data.token, remember);
      setUser(data.user);
      addNotification("Logged In", `Welcome back, ${data.user.name || data.user.username}!`, "success");
    } catch (err: any) {
      console.error("[AuthContext:login] Authentication rejected:", err.message);
      if (err.message && err.message.toLowerCase().includes("institution does not exist")) {
        console.warn(
          `[AuthContext:login TRACE: 'Selected institution does not exist']\n` +
          `  -> Queried identifier: "${code}"\n` +
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
    setAuthToken(res.token, true);
    setUser(res.user);
    addNotification("Institution Registered", `Successfully registered ${res.user.school?.name || "school"}!`, "success");
  };

  const logout = () => {
    removeAuthToken();
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
