import React, { useState } from "react";
import { FileItem, SharingVisibility } from "../types";
import { X, Share2, Globe, Lock, Users, ShieldAlert, Check } from "lucide-react";

interface ShareModalProps {
  file: FileItem | null;
  onClose: () => void;
  onSave: (fileId: string, visibility: SharingVisibility) => Promise<void>;
}

export const ShareModal: React.FC<ShareModalProps> = ({ file, onClose, onSave }) => {
  const [visibility, setVisibility] = useState<SharingVisibility>(
    file?.sharing_visibility || "all_teachers"
  );
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!file) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(file.id, visibility);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const shareOptions = [
    {
      id: "all_teachers" as SharingVisibility,
      title: "Shared With All Teachers",
      desc: "Any authenticated teacher in the school can view, preview, and download this resource.",
      icon: Globe,
      color: "text-blue-600 bg-blue-50",
    },
    {
      id: "private" as SharingVisibility,
      title: "Private (Only Me)",
      desc: "Only you (and administrators) can access this resource.",
      icon: Lock,
      color: "text-slate-600 bg-slate-100",
    },
    {
      id: "admin_only" as SharingVisibility,
      title: "Admin Only",
      desc: "Restricted to school administrators and IT staff.",
      icon: ShieldAlert,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  const shareLink = `${window.location.origin}/api/files/download/${file.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <Share2 className="h-4 w-4 text-blue-600" />
            <span>Resource Sharing & Permissions</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 truncate">{file.file_name}</h3>
            <p className="text-[11px] text-slate-500">Configure who can access this educational resource.</p>
          </div>

          {/* Visibility Options */}
          <div className="space-y-2">
            {shareOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = visibility === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setVisibility(opt.id)}
                  className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/40 ring-1 ring-blue-500"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${opt.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900">{opt.title}</p>
                    <p className="text-[11px] text-slate-500 leading-snug">{opt.desc}</p>
                  </div>
                  <input
                    type="radio"
                    checked={isSelected}
                    onChange={() => setVisibility(opt.id)}
                    className="mt-1 accent-blue-600"
                  />
                </div>
              );
            })}
          </div>

          {/* Share Link */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Central Cloud Link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 font-mono"
              />
              <button
                onClick={copyLink}
                className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : null}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Save Permissions"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
