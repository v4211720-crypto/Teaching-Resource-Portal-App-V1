import React, { useState, useRef, useEffect } from "react";
import {
  Cloud,
  CloudCheck,
  CloudOff,
  CloudUpload,
  RefreshCw,
  Wifi,
  WifiOff,
  CheckCircle2,
  HardDrive,
  Database,
  ArrowUpDown,
} from "lucide-react";

export type SyncStatusType = "synced" | "syncing" | "offline" | "pending";

interface SyncIndicatorProps {
  status: SyncStatusType;
  lastSyncedAt: Date | null;
  onForceSync: () => void;
  isOnline: boolean;
  simulatedOffline?: boolean;
  onToggleSimulateOffline?: () => void;
  pendingCount?: number;
}

export const SyncIndicator: React.FC<SyncIndicatorProps> = ({
  status,
  lastSyncedAt,
  onForceSync,
  isOnline,
  simulatedOffline = false,
  onToggleSimulateOffline,
  pendingCount = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const formatLastSync = (date: Date | null) => {
    if (!date) return "Never";
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 5) return "Just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getStatusConfig = () => {
    if (!isOnline || status === "offline") {
      return {
        label: "Offline Mode",
        sublabel: "Using Workbox Cache",
        icon: CloudOff,
        textColor: "text-amber-700",
        badgeBg: "bg-amber-100",
        border: "border-amber-300",
        dotColor: "bg-amber-500",
      };
    }
    if (status === "syncing") {
      return {
        label: "Syncing...",
        sublabel: "Saving to Cloud DB",
        icon: RefreshCw,
        textColor: "text-blue-700",
        badgeBg: "bg-blue-100",
        border: "border-blue-300",
        dotColor: "bg-blue-500 animate-spin",
      };
    }
    if (status === "pending" || pendingCount > 0) {
      return {
        label: "Sync Pending",
        sublabel: `${pendingCount} item${pendingCount > 1 ? "s" : ""}`,
        icon: CloudUpload,
        textColor: "text-amber-700",
        badgeBg: "bg-amber-100",
        border: "border-amber-300",
        dotColor: "bg-amber-500",
      };
    }
    return {
      label: "Cloud Synced",
      sublabel: "Real-time Database",
      icon: CloudCheck,
      textColor: "text-emerald-800",
      badgeBg: "bg-emerald-50",
      border: "border-emerald-200",
      dotColor: "bg-emerald-500",
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="relative" ref={popoverRef}>
      {/* Visual Navbar Button */}
      <button
        id="btn-sync-indicator"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={`Database Sync Status: ${config.label} (${formatLastSync(lastSyncedAt)})`}
        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition hover:shadow-xs active:scale-98 ${config.badgeBg} ${config.textColor} ${config.border}`}
      >
        <span className="relative flex h-2 w-2">
          {status === "synced" && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          )}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${config.dotColor}`} />
        </span>

        <Icon className={`h-3.5 w-3.5 ${status === "syncing" ? "animate-spin" : ""}`} />
        <span className="hidden sm:inline">{config.label}</span>
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-xs">Cloud Database Sync</h3>
            </div>
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                isOnline ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}
            >
              {isOnline ? "ONLINE" : "OFFLINE"}
            </span>
          </div>

          <div className="py-3 space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Sync Status</span>
              <span className="font-bold text-slate-800 capitalize flex items-center gap-1">
                {status === "synced" ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Synchronized</span>
                  </>
                ) : status === "syncing" ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 text-blue-600 animate-spin" />
                    <span>Syncing with Cloud...</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="h-3.5 w-3.5 text-amber-600" />
                    <span>Offline (Cached)</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Last Synced</span>
              <span className="font-mono text-slate-800 font-medium">
                {formatLastSync(lastSyncedAt)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Service Worker</span>
              <span className="text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded">
                Workbox Caching Active
              </span>
            </div>

            <div className="rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-500 border border-slate-100 leading-snug">
              {isOnline
                ? "All teaching folders, files, and updates are synchronized in real-time with the central database and available across computer and mobile."
                : "Internet connection is disconnected or unstable. You can still access and view previously loaded teaching materials via local cache."}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={() => {
                onForceSync();
                setIsOpen(false);
              }}
              disabled={status === "syncing" || !isOnline}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${status === "syncing" ? "animate-spin" : ""}`} />
              <span>Sync with Cloud Database Now</span>
            </button>

            {onToggleSimulateOffline && (
              <button
                type="button"
                onClick={onToggleSimulateOffline}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                {simulatedOffline ? <Wifi className="h-3.5 w-3.5 text-emerald-600" /> : <WifiOff className="h-3.5 w-3.5 text-amber-600" />}
                <span>{simulatedOffline ? "Restore Online Connection" : "Simulate Offline Mode (Test Workbox Cache)"}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
