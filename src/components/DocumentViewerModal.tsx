import React, { useState, useEffect } from "react";
import { FileItem } from "../types";
import { api } from "../lib/api";
import {
  X,
  Download,
  FileText,
  Smartphone,
  Laptop,
  Maximize2,
  ExternalLink,
  Edit2,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { DynamicFileIcon, FileExtensionBadge } from "../services/fileIconService";

interface DocumentViewerModalProps {
  file: FileItem | null;
  onClose: () => void;
  onDownload: (file: FileItem) => void;
  onRename?: (file: FileItem) => void;
  onDelete?: (file: FileItem) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  file,
  onClose,
  onDownload,
  onRename,
  onDelete,
}) => {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [file?.id]);

  const fileId = file?.id;
  const fileName = file?.file_name;
  const fileType = file?.file_type;
  const mimeType = file?.mime_type;

  const isText = Boolean(
    fileName &&
      (fileName.toLowerCase().endsWith(".txt") ||
        fileName.toLowerCase().endsWith(".md") ||
        fileName.toLowerCase().endsWith(".csv") ||
        fileName.toLowerCase().endsWith(".json") ||
        (mimeType && mimeType.includes("text")))
  );

  useEffect(() => {
    if (!fileId || !isText) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const previewUrl = api.getFilePreviewUrl(fileId);
    fetch(previewUrl, {
      headers: { Authorization: `Bearer ${localStorage.getItem("trh_auth_token") || ""}` },
    })
      .then((res) => res.text())
      .then((text) => {
        setTextContent(text);
        setLoading(false);
      })
      .catch(() => {
        setTextContent("Unable to load document text preview.");
        setLoading(false);
      });
  }, [fileId, isText]);

  if (!file) return null;

  const previewUrl = api.getFilePreviewUrl(file.id);
  const isImage = file.file_type === "image";
  const isPdf = file.file_name.toLowerCase().endsWith(".pdf") || file.mime_type.includes("pdf");

  const sizeMB = (file.file_size / (1024 * 1024)).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 md:p-6 animate-in fade-in">
      <div className="relative flex flex-col w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3 truncate pr-4">
            <DynamicFileIcon
              fileName={file.file_name}
              fileType={file.file_type}
              size="md"
              showBadge={true}
            />
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 truncate">{file.file_name}</h2>
                <FileExtensionBadge fileName={file.file_name} fileType={file.file_type} />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>{sizeMB} MB</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  {file.device.includes("Mobile") ? <Smartphone className="h-3 w-3 text-indigo-600" /> : <Laptop className="h-3 w-3 text-blue-600" />}
                  {file.device}
                </span>
                <span>•</span>
                <span>Owner: {file.owner_name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onRename && (
              <button
                onClick={() => {
                  onClose();
                  onRename(file);
                }}
                className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Rename</span>
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => {
                  onClose();
                  onDelete(file);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition"
                title="Move to Trash"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}

            <button
              onClick={() => onDownload(file)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-auto bg-slate-100 flex items-center justify-center p-4">
          {isImage && !imageError ? (
            <div className="max-h-full max-w-full flex items-center justify-center">
              <img
                src={previewUrl}
                alt={file.file_name}
                onError={() => setImageError(true)}
                className="max-h-[75vh] max-w-full rounded-lg object-contain shadow-md"
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={previewUrl}
              title={file.file_name}
              className="w-full h-full rounded-xl border border-slate-300 bg-white shadow-sm"
            />
          ) : isText ? (
            <div className="w-full h-full max-w-3xl overflow-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <pre className="font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                {textContent}
              </pre>
            </div>
          ) : (
            <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-md border border-slate-200">
              <FileText className="mx-auto h-16 w-16 text-blue-500" />
              <h3 className="mt-4 text-base font-bold text-slate-900">{file.file_name}</h3>
              <p className="mt-1 text-xs text-slate-500">
                This document ({file.mime_type}) is ready for download and editing in your desktop or mobile office suite.
              </p>
              <button
                onClick={() => onDownload(file)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                <span>Download {file.file_name}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
