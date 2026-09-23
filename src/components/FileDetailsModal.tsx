import React, { useState, useEffect } from "react";
import { FileItem } from "../types";
import {
  X,
  Info,
  Smartphone,
  Laptop,
  Share2,
  Download,
  Tag,
  Plus,
  Check,
  Loader2,
  Bookmark,
  Hash,
} from "lucide-react";
import { DynamicFileIcon, FileExtensionBadge } from "../services/fileIconService";
import { api } from "../lib/api";

interface FileDetailsModalProps {
  file: FileItem | null;
  onClose: () => void;
  onDownload: (file: FileItem) => void;
  onOpenShare: (file: FileItem) => void;
  onFileUpdated?: (updatedFile: FileItem) => void;
}

const SUGGESTED_TAGS = [
  "Lesson-Plan",
  "Exam-Prep",
  "Curriculum",
  "Grade-10",
  "Grade-11",
  "Grade-12",
  "STEM",
  "Lab-Manual",
  "Homework",
  "Revision",
  "Worksheet",
  "Video-Lecture",
  "Audio-Lesson",
];

export const FileDetailsModal: React.FC<FileDetailsModalProps> = ({
  file,
  onClose,
  onDownload,
  onOpenShare,
  onFileUpdated,
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [isSavingTags, setIsSavingTags] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Synchronize local tags when file changes
  useEffect(() => {
    if (file) {
      setTags(file.tags || []);
      setNewTagInput("");
      setSaveFeedback(null);
    }
  }, [file]);

  if (!file) return null;

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const isMobile =
    file.device.includes("Mobile") ||
    file.device.includes("iPhone") ||
    file.device.includes("Android");

  // Save tags helper to server and notify parent
  const handlePersistTags = async (updatedTags: string[], feedbackText: string) => {
    setIsSavingTags(true);
    setSaveFeedback(null);
    try {
      const updated = await api.updateFile(file.id, { tags: updatedTags });
      const finalTags = updated.tags || updatedTags;
      setTags(finalTags);
      if (onFileUpdated) {
        onFileUpdated({
          ...file,
          ...updated,
          tags: finalTags,
        });
      }
      setSaveFeedback(feedbackText);
      setTimeout(() => setSaveFeedback(null), 2500);
    } catch (err: any) {
      console.error("Failed to update tags:", err);
      setSaveFeedback("Failed to save tag changes");
    } finally {
      setIsSavingTags(false);
    }
  };

  const handleAddTag = (tagToAdd: string) => {
    const sanitized = tagToAdd
      .trim()
      .replace(/^#+/, "")
      .replace(/\s+/g, "-");

    if (!sanitized) return;

    // Check if tag already exists (case-insensitive)
    if (tags.some((t) => t.toLowerCase() === sanitized.toLowerCase())) {
      setNewTagInput("");
      return;
    }

    const nextTags = [...tags, sanitized];
    setNewTagInput("");
    handlePersistTags(nextTags, `Added #${sanitized}`);
  };

  const handleAddTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagInput.trim()) {
      handleAddTag(newTagInput);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const nextTags = tags.filter((t) => t !== tagToRemove);
    handlePersistTags(nextTags, `Removed #${tagToRemove}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Info className="h-4 w-4 text-blue-600" />
            <span>File Information & Resource Properties</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable details list */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* File identity header */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 flex items-start gap-3">
            <DynamicFileIcon
              fileName={file.file_name}
              fileType={file.file_type}
              size="lg"
              showBadge={true}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm break-all">{file.file_name}</h3>
                <FileExtensionBadge fileName={file.file_name} fileType={file.file_type} />
              </div>
              {file.description && (
                <p className="mt-1 text-xs text-slate-500">{file.description}</p>
              )}
            </div>
          </div>

          {/* CUSTOM USER-DEFINED TAGS SECTION */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Tag className="h-4 w-4 text-blue-600" />
                <span>Custom Resource Tags</span>
              </div>
              <div className="flex items-center gap-2">
                {isSavingTags && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Saving...</span>
                  </span>
                )}
                {saveFeedback && !isSavingTags && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 animate-in fade-in">
                    <Check className="h-3 w-3" />
                    <span>{saveFeedback}</span>
                  </span>
                )}
                <span className="text-[11px] text-slate-400 font-medium">
                  {tags.length} {tags.length === 1 ? "tag" : "tags"}
                </span>
              </div>
            </div>

            {/* Active Tags Badge List */}
            <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center p-2 rounded-xl bg-white border border-slate-200/80">
              {tags.length === 0 ? (
                <span className="text-xs text-slate-400 italic flex items-center gap-1">
                  <Hash className="h-3 w-3 text-slate-300" />
                  <span>No custom tags assigned. Add tags below for quick categorization.</span>
                </span>
              ) : (
                tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold bg-blue-50/80 border border-blue-200/80 text-blue-900 shadow-2xs transition"
                  >
                    <span className="text-blue-500 font-bold select-none">#</span>
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      disabled={isSavingTags}
                      className="ml-0.5 rounded p-0.5 text-blue-400 hover:bg-blue-200/60 hover:text-rose-600 transition disabled:opacity-50"
                      title={`Remove tag #${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Input to add new tag */}
            <form onSubmit={handleAddTagSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold select-none">
                  #
                </span>
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Enter custom tag (e.g. Physics-Term1, Quiz-Prep)..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-7 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden transition"
                  disabled={isSavingTags}
                />
              </div>
              <button
                type="submit"
                disabled={!newTagInput.trim() || isSavingTags}
                className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Tag</span>
              </button>
            </form>

            {/* Quick Suggested Tags */}
            <div className="pt-1">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                <Bookmark className="h-3 w-3" />
                <span>Suggested Educational Categories</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {SUGGESTED_TAGS.filter(
                  (t) => !tags.some((active) => active.toLowerCase() === t.toLowerCase())
                )
                  .slice(0, 8)
                  .map((sTag) => (
                    <button
                      key={sTag}
                      type="button"
                      onClick={() => handleAddTag(sTag)}
                      disabled={isSavingTags}
                      className="text-[11px] font-medium rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50/60 px-2 py-0.5 text-slate-600 transition shadow-2xs"
                    >
                      + #{sTag}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-100 p-3 bg-white">
              <span className="text-[10px] font-bold text-slate-400 uppercase">File Type</span>
              <p className="font-semibold text-slate-800 capitalize mt-0.5">{file.file_type}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{file.mime_type}</p>
            </div>

            <div className="rounded-xl border border-slate-100 p-3 bg-white">
              <span className="text-[10px] font-bold text-slate-400 uppercase">File Size</span>
              <p className="font-semibold text-slate-800 mt-0.5">{formatBytes(file.file_size)}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                {file.file_size.toLocaleString()} bytes
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 p-3 bg-white">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                {isMobile ? (
                  <Smartphone className="h-3 w-3 text-indigo-600" />
                ) : (
                  <Laptop className="h-3 w-3 text-blue-600" />
                )}
                <span>Uploaded From</span>
              </span>
              <p className="font-semibold text-slate-800 mt-0.5">{file.device}</p>
              <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Central Cloud Synced</p>
            </div>

            <div className="rounded-xl border border-slate-100 p-3 bg-white">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Owner</span>
              <p className="font-semibold text-slate-800 mt-0.5">{file.owner_name}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{file.owner_email || "Teacher Account"}</p>
            </div>
          </div>

          {/* Details table */}
          <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
            <div className="flex justify-between py-1 border-b border-slate-50 text-slate-600">
              <span className="font-medium">Uploaded Date</span>
              <span className="text-slate-900">{formatDate(file.uploaded_at)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 text-slate-600">
              <span className="font-medium">Sharing Status</span>
              <span className="capitalize font-semibold text-blue-700">
                {file.sharing_visibility.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between py-1 text-slate-600">
              <span className="font-medium">Storage Path</span>
              <span className="font-mono text-[10px] text-slate-500 truncate max-w-[200px]">
                /server_storage/files/{file.storage_path}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenShare(file);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Sharing Settings</span>
            </button>
            <button
              onClick={() => onDownload(file)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
