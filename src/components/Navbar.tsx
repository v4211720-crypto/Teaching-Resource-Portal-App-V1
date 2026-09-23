import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { SyncIndicator, SyncStatusType } from "./SyncIndicator";
import { PWAInstallButton } from "./PWAInstallButton";
import { DEFAULT_BRAND_COLOR, isDarkColor } from "../lib/theme";
import {
  GraduationCap,
  ShieldCheck,
  ChevronDown,
  Bell,
  Smartphone,
  Laptop,
  RefreshCw,
  LogOut,
  Settings,
  HardDrive,
  Menu,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Info,
} from "lucide-react";

interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenUpload: () => void;
  onOpenSettings: () => void;
  onOpenAbout?: () => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
  storageUsedBytes: number;
  storageLimitBytes: number;
  syncStatus?: SyncStatusType;
  lastSyncedAt?: Date | null;
  isOnline?: boolean;
  simulatedOffline?: boolean;
  onToggleSimulateOffline?: () => void;
  pendingCount?: number;
  onOpenTrash?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenUpload,
  onOpenSettings,
  onOpenAbout,
  onRefreshData,
  isRefreshing = false,
  storageUsedBytes,
  storageLimitBytes,
  syncStatus = "synced",
  lastSyncedAt = null,
  isOnline = true,
  simulatedOffline = false,
  onToggleSimulateOffline,
  pendingCount = 0,
  onOpenTrash,
}) => {
  const {
    user,
    logout,
    currentDevice,
    setCurrentDevice,
    notifications,
    markNotificationRead,
    clearNotifications,
  } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const brandColor = user?.school?.brand_color || DEFAULT_BRAND_COLOR;
  const isDark = isDarkColor(brandColor);

  const usedMB = (storageUsedBytes / (1024 * 1024)).toFixed(1);
  const limitGB = (storageLimitBytes / (1024 * 1024 * 1024)).toFixed(0);
  const percentage = Math.min(
    100,
    Math.round((storageUsedBytes / (storageLimitBytes || 1)) * 100)
  );

  const deviceOptions = [
    { label: "Mobile (iPhone)", icon: Smartphone, type: "Mobile (iPhone)" },
    { label: "Mobile (Android)", icon: Smartphone, type: "Mobile (Android)" },
    { label: "Desktop (Chrome / Windows)", icon: Laptop, type: "Desktop (Chrome / Windows)" },
    { label: "Desktop (Chrome / Mac)", icon: Laptop, type: "Desktop (Chrome / Mac)" },
  ];

  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-between border-b px-3 sm:px-4 py-2.5 backdrop-blur-md transition-colors duration-300 ${
        isDark ? "border-white/15 text-white shadow-sm" : "border-slate-200 bg-white/95 text-slate-900"
      }`}
      style={{ backgroundColor: brandColor }}
    >
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          id="btn-sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition md:hidden ${
            isDark
              ? "border-white/20 text-white hover:bg-white/10"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white/20 text-white shadow-xs backdrop-blur-xs border border-white/30">
            <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-bold tracking-tight text-sm sm:text-base md:text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                Teacher Resource Hub
              </span>
              {user?.school && (
                <span
                  className={`hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border transition ${
                    isDark
                      ? "bg-white/15 text-white border-white/25"
                      : "bg-purple-50 text-purple-800 border-purple-200"
                  }`}
                  title={user.school.name}
                >
                  <Building2 className={`h-3 w-3 shrink-0 ${isDark ? "text-white" : "text-purple-600"}`} />
                  <span className="truncate max-w-[130px]">{user.school.name}</span>
                  <span
                    className={`px-1 py-0.2 rounded font-mono text-[9px] ${
                      isDark ? "bg-white/25 text-white" : "bg-purple-200 text-purple-900"
                    }`}
                  >
                    {user.school.code}
                  </span>
                </span>
              )}
            </div>
            <p className={`text-[11px] hidden md:block ${isDark ? "text-white/70" : "text-slate-500"}`}>
              Centralized Cross-Device Teaching Repository
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls: Sync Indicator, Storage warning pill, Device, Notifications, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
        {/* Real-Time Central Cloud Database Sync Indicator */}
        <SyncIndicator
          status={syncStatus}
          lastSyncedAt={lastSyncedAt}
          onForceSync={onRefreshData || (() => {})}
          isOnline={isOnline}
          simulatedOffline={simulatedOffline}
          onToggleSimulateOffline={onToggleSimulateOffline}
          pendingCount={pendingCount}
        />

        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Storage Quick Alert Badge if >= 80% */}
        {percentage >= 80 && (
          <button
            onClick={onOpenTrash}
            title={`Storage warning: ${percentage}% quota used. Click to manage.`}
            className={`hidden lg:flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold border transition ${
              percentage >= 90
                ? "bg-rose-100 text-rose-800 border-rose-300 animate-pulse"
                : "bg-amber-100 text-amber-800 border-amber-300"
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            <span>{percentage}% Full</span>
          </button>
        )}

        {/* Device Switcher */}
        <div className="relative">
          <button
            id="btn-device-selector"
            onClick={() => setShowDeviceMenu(!showDeviceMenu)}
            title="Switch Simulated/Active Device"
            className={`flex items-center gap-1.5 rounded-lg border px-2 sm:px-2.5 py-1.5 text-xs font-medium transition ${
              isDark
                ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {currentDevice.toLowerCase().includes("mobile") ||
            currentDevice.toLowerCase().includes("phone") ? (
              <Smartphone className={`h-3.5 w-3.5 ${isDark ? "text-white" : "text-indigo-600"}`} />
            ) : (
              <Laptop className={`h-3.5 w-3.5 ${isDark ? "text-white" : "text-blue-600"}`} />
            )}
            <span className="hidden xl:inline">{currentDevice}</span>
            <span className={`text-[10px] ${isDark ? "text-white/60" : "text-slate-400"}`}>▼</span>
          </button>

          {showDeviceMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 text-slate-800">
              <div className="px-2 py-1.5 border-b border-slate-100 text-xs font-semibold text-slate-800">
                Active Upload Device Origin
                <p className="text-[11px] font-normal text-slate-500">
                  Tag files uploaded now to verify cross-device sync between phones and PCs.
                </p>
              </div>
              <div className="mt-1 space-y-1">
                {deviceOptions.map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => {
                      setCurrentDevice(opt.type);
                      setShowDeviceMenu(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition ${
                      currentDevice === opt.type
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <opt.icon className="h-4 w-4 shrink-0 text-slate-500" />
                    <span>{opt.label}</span>
                    {currentDevice === opt.type && (
                      <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            id="btn-notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border transition ${
              isDark
                ? "border-white/20 text-white hover:bg-white/10"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50 text-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">
                  Notifications ({notifications.length})
                </span>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-[11px] text-blue-600 hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 mt-2">
                {notifications.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">No new notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`cursor-pointer p-2 transition hover:bg-slate-50 ${
                        !n.read ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 leading-snug">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            id="btn-user-avatar"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 transition shadow-xs ${
              isDark
                ? "border-white/20 bg-white/10 hover:bg-white/20 text-white"
                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
            }`}
          >
            {user?.role === "admin" ? (
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 border border-purple-200 shadow-xs">
                <ShieldCheck className="h-4 w-4" />
              </div>
            ) : (
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 border border-blue-200 shadow-xs">
                <GraduationCap className="h-4 w-4" />
              </div>
            )}
            <div className="text-left">
              <p className={`text-xs font-bold leading-none ${isDark ? "text-white" : "text-slate-800"}`}>
                {user?.name || user?.username}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span
                  className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-1 ${
                    user?.role === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : isDark
                      ? "bg-white/20 text-white"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {user?.role === "admin" ? (
                    <>
                      <ShieldCheck className="h-2.5 w-2.5" />
                      <span>ADMIN</span>
                    </>
                  ) : (
                    <>
                      <GraduationCap className="h-2.5 w-2.5" />
                      <span>TEACHER</span>
                    </>
                  )}
                </span>
              </div>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 ml-0.5 ${isDark ? "text-white/70" : "text-slate-400"}`} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 text-slate-800">
              <div className="px-3 py-2.5 border-b border-slate-100 flex items-center gap-2.5">
                {user?.role === "admin" ? (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 border border-purple-200">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 border border-blue-200">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                )}
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="px-3 py-2 border-b border-slate-100 text-[11px] text-slate-600">
                <span className="font-semibold">Storage:</span> {usedMB} MB / {limitGB} GB ({percentage}%)
              </div>

              {user?.school && (
                <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/70 text-[11px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">School Institution</span>
                  <div className="flex items-center justify-between gap-1 text-slate-800 font-semibold">
                    <span className="truncate">{user.school.name}</span>
                    <span className="shrink-0 rounded bg-slate-200 px-1.5 py-0.2 text-[9px] font-mono font-bold text-slate-700">
                      {user.school.code}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-1 space-y-0.5">
                <button
                  id="btn-menu-settings"
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenSettings();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="h-4 w-4 text-slate-500" />
                  Settings & Profile
                </button>
                {onOpenAbout && (
                  <button
                    id="btn-menu-about"
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenAbout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Info className="h-4 w-4 text-amber-500" />
                    About Developer & App
                  </button>
                )}
                <button
                  id="btn-menu-upload"
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenUpload();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
                >
                  <HardDrive className="h-4 w-4" />
                  Upload Resource
                </button>
              </div>

              <div className="my-1 border-t border-slate-100" />

              <button
                id="btn-logout"
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
