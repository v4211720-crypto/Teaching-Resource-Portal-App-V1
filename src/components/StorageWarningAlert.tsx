import React, { useState } from "react";
import { AlertTriangle, AlertOctagon, Trash2, ArrowRight, X, HardDrive, Sparkles } from "lucide-react";

interface StorageWarningAlertProps {
  storageUsedBytes: number;
  storageLimitBytes: number;
  onOpenTrash: () => void;
  onReviewLargeFiles: () => void;
  trashCount?: number;
}

export const StorageWarningAlert: React.FC<StorageWarningAlertProps> = ({
  storageUsedBytes,
  storageLimitBytes,
  onOpenTrash,
  onReviewLargeFiles,
  trashCount = 0,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !storageLimitBytes || storageLimitBytes <= 0) return null;

  const usedPercent = Math.min(100, Math.round((storageUsedBytes / storageLimitBytes) * 100));

  // Only trigger at 80% or above
  if (usedPercent < 80) return null;

  const isCritical = usedPercent >= 90;

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  };

  return (
    <div
      id="storage-warning-alert"
      className={`mb-6 rounded-2xl border p-4 shadow-sm transition-all duration-300 ${
        isCritical
          ? "border-rose-300 bg-rose-50 text-rose-950"
          : "border-amber-300 bg-amber-50 text-amber-950"
      }`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Warning Information */}
        <div className="flex items-start gap-3.5">
          <div
            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs ${
              isCritical ? "bg-rose-600 text-white animate-pulse" : "bg-amber-500 text-white"
            }`}
          >
            {isCritical ? (
              <AlertOctagon className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold tracking-tight">
                {isCritical ? "Critical Storage Alert" : "Storage Capacity Warning"}:{" "}
                <span className={isCritical ? "text-rose-700 underline" : "text-amber-700 font-extrabold"}>
                  {usedPercent}% Used
                </span>
              </h4>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide uppercase ${
                  isCritical ? "bg-rose-200 text-rose-900" : "bg-amber-200 text-amber-900"
                }`}
              >
                {formatBytes(storageUsedBytes)} of {formatBytes(storageLimitBytes)}
              </span>
            </div>

            <p className="text-xs leading-relaxed opacity-90 max-w-2xl">
              {isCritical
                ? "Your teaching repository has nearly reached its allocated storage threshold. Incoming file uploads from mobile and desktop devices will soon be blocked. Please delete or purge unneeded files immediately."
                : "You are approaching your school storage allocation limit. We recommend cleaning up old teaching videos, duplicates, or emptying the recycle bin."}
            </p>

            {/* Visual Mini Progress Bar */}
            <div className="pt-1.5 max-w-md">
              <div className="h-2 w-full overflow-hidden rounded-full bg-black/10">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isCritical ? "bg-rose-600" : "bg-amber-500"
                  }`}
                  style={{ width: `${usedPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
          <button
            id="btn-storage-clean-trash"
            type="button"
            onClick={onOpenTrash}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold shadow-xs transition active:scale-95 ${
              isCritical
                ? "bg-rose-600 text-white hover:bg-rose-700"
                : "bg-amber-600 text-white hover:bg-amber-700"
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Manage Trash {trashCount > 0 ? `(${trashCount})` : ""}</span>
          </button>

          <button
            id="btn-storage-review-large"
            type="button"
            onClick={onReviewLargeFiles}
            className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 transition active:scale-95"
          >
            <HardDrive className="h-3.5 w-3.5 text-blue-600" />
            <span>Filter Large Media</span>
          </button>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            title="Dismiss notification"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-black/5 hover:text-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
