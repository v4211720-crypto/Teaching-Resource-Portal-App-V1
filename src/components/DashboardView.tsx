import React from "react";
import { useAuth } from "../context/AuthContext";
import { DashboardStats, FileItem, Folder } from "../types";
import { DEFAULT_BRAND_COLOR, isDarkColor } from "../lib/theme";
import {
  FolderTree,
  FileText,
  Music,
  Film,
  Image as ImageIcon,
  Files,
  HardDrive,
  UploadCloud,
  Smartphone,
  Laptop,
  ArrowRight,
  Download,
  Play,
  Eye,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import { DynamicFileIcon, FileExtensionBadge } from "../services/fileIconService";

interface DashboardViewProps {
  stats: DashboardStats | null;
  recentFiles: FileItem[];
  folders: Folder[];
  onOpenUpload: () => void;
  onSelectFolder: (folderId: string) => void;
  onPreviewFile: (file: FileItem) => void;
  onDownloadFile: (file: FileItem) => void;
  onToggleFavorite: (file: FileItem) => void;
  onNavigateToView: (view: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  recentFiles,
  folders,
  onOpenUpload,
  onSelectFolder,
  onPreviewFile,
  onDownloadFile,
  onToggleFavorite,
  onNavigateToView,
}) => {
  const { user, currentDevice } = useAuth();

  const usedMB = stats ? (stats.storageUsed / (1024 * 1024)).toFixed(1) : "0";
  const limitGB = stats ? (stats.storageLimit / (1024 * 1024 * 1024)).toFixed(0) : "15";
  const percentage = stats
    ? Math.min(100, Math.round((stats.storageUsed / (stats.storageLimit || 1)) * 100))
    : 0;

  const statCards = [
    {
      title: "Total Folders",
      count: stats?.totalFolders ?? 0,
      icon: FolderTree,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      view: "folders",
    },
    {
      title: "Documents",
      count: stats?.documents ?? 0,
      icon: FileText,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      view: "documents",
    },
    {
      title: "Videos",
      count: stats?.videos ?? 0,
      icon: Film,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      view: "videos",
    },
    {
      title: "Audio",
      count: stats?.audio ?? 0,
      icon: Music,
      color: "text-rose-600 bg-rose-50 border-rose-200",
      view: "audio",
    },
    {
      title: "Images",
      count: stats?.images ?? 0,
      icon: ImageIcon,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      view: "images",
    },
    {
      title: "Other Files",
      count: stats?.otherFiles ?? 0,
      icon: Files,
      color: "text-slate-600 bg-slate-100 border-slate-200",
      view: "resources",
    },
  ];

  const brandColor = user?.school?.brand_color || DEFAULT_BRAND_COLOR;

  return (
    <div className="space-y-6">
      {/* Welcome Banner matching exact prompt spec with Cambridge Scholastic Teal styling */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 md:p-8 text-white shadow-xl transition-all duration-500"
        style={{
          background: `linear-gradient(135deg, ${brandColor} 0%, #0f766e 45%, #042f2e 100%)`,
        }}
      >
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/20">
            {user?.role === "admin" ? (
              <ShieldCheck className="h-3.5 w-3.5 text-teal-200" />
            ) : (
              <GraduationCap className="h-3.5 w-3.5 text-teal-200" />
            )}
            <span>Multi-Device Cloud Repository</span>
            {user?.school && (
              <span className="hidden sm:inline-block bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold">
                {user.school.code}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-xs">
              Welcome back, {user?.name || "Teacher"}!
            </h1>
            {user?.role === "admin" ? (
              <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider bg-white/20 text-white border border-white/30 px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
                Admin Account
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider bg-white/20 text-white border border-white/30 px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs">
                <GraduationCap className="h-3.5 w-3.5 text-white" />
                Teacher Account
              </span>
            )}
          </div>

          <p className="text-sm md:text-base font-normal text-teal-50/95 leading-relaxed drop-shadow-xs">
            Manage all your teaching resources from one secure place.
            <br />
            Upload from your computer or mobile and access your resources anywhere.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              id="btn-dash-upload"
              onClick={onOpenUpload}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-teal-950 shadow-md transition hover:bg-teal-50 active:scale-98"
            >
              <UploadCloud className="h-4 w-4 text-teal-700" />
              <span>Upload Resources</span>
            </button>

            <button
              id="btn-dash-browse-folders"
              onClick={() => onNavigateToView("folders")}
              className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md border border-white/25 transition hover:bg-white/25 active:scale-98"
            >
              <FolderTree className="h-4 w-4 text-white" />
              <span>Browse Folder Hierarchy</span>
            </button>
          </div>
        </div>

        {/* Decorative background visual */}
        <div className="absolute -right-8 -bottom-8 opacity-20 md:opacity-30 pointer-events-none">
          <div className="flex items-center gap-4 text-white">
            <Smartphone className="h-48 w-48 stroke-[1]" />
            <ArrowRight className="h-20 w-20" />
            <Laptop className="h-48 w-48 stroke-[1]" />
          </div>
        </div>
      </div>

      {/* Cross-Device Live Sync Explainer Banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-blue-950">
                Centralized Server Storage Active (Cross-Device Sync Enabled)
              </h2>
              <p className="text-xs text-blue-700">
                Files uploaded from your mobile phone are stored centrally in the cloud database and are instantly available on your desktop browser.
                Currently interacting as: <span className="font-semibold underline">{currentDevice}</span>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-Time Server Sync
            </span>
          </div>
        </div>
      </div>

      {/* Numerical Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.title}
              onClick={() => onNavigateToView(c.view)}
              className="flex flex-col items-start rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:shadow-md group"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${c.color} transition group-hover:scale-105`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="mt-3 text-2xl font-black tracking-tight text-slate-900">
                {c.count}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {c.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Two Column Section: Quick Folders & Storage Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Folders (2 Cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-sm">Organized Subject Folders</h2>
            </div>
            <button
              onClick={() => onNavigateToView("folders")}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {folders.slice(0, 6).map((f) => (
              <div
                key={f.id}
                onClick={() => onSelectFolder(f.id)}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer transition"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                    <FolderTree className="h-4 w-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 truncate">{f.folder_name}</p>
                    <p className="text-[11px] text-slate-400">Class Folder</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Storage Widget (1 Col) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <HardDrive className="h-5 w-5 text-indigo-600" />
                <span>Storage Overview</span>
              </div>
              <span className="text-xs font-bold text-indigo-600">{percentage}% Used</span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Allocated Capacity</span>
                <span className="font-semibold text-slate-900">{usedMB} MB / {limitGB} GB</span>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(percentage, 3)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Unlimited cloud file streaming enabled. Automatic cross-device synchronization active.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={onOpenUpload}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white py-2.5 text-xs font-bold hover:bg-slate-800 transition"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload New File Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Files Table / Cards */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <h2 className="font-bold text-slate-900 text-sm">Recent Uploads & Shared Resources</h2>
          </div>
          <button
            onClick={() => onNavigateToView("recent")}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>View All Recent</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {recentFiles.length === 0 ? (
          <div className="py-12 text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-2 text-sm font-semibold text-slate-800">No resources uploaded yet</h3>
            <p className="mt-1 text-xs text-slate-500">
              Upload documents, videos, or audio lectures to start building your repository.
            </p>
            <button
              onClick={onOpenUpload}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload First File</span>
            </button>
          </div>
        ) : (
          <div className="mt-3 divide-y divide-slate-100">
            {recentFiles.slice(0, 6).map((file) => {
              const isVid = file.file_type === "video";
              const isAud = file.file_type === "audio";
              const sizeMB = (file.file_size / (1024 * 1024)).toFixed(1);

              return (
                <div
                  key={file.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <DynamicFileIcon
                      fileName={file.file_name}
                      fileType={file.file_type}
                      size="md"
                      showBadge={true}
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 truncate">{file.file_name}</p>
                        <FileExtensionBadge fileName={file.file_name} fileType={file.file_type} />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-700">{sizeMB} MB</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
                          {file.device.includes("Mobile") || file.device.includes("iPhone") || file.device.includes("Android") ? (
                            <Smartphone className="h-3 w-3 text-indigo-600" />
                          ) : (
                            <Laptop className="h-3 w-3 text-blue-600" />
                          )}
                          {file.device}
                        </span>
                        <span>•</span>
                        <span>Owner: {file.owner_name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => onToggleFavorite(file)}
                      title={file.is_favorite ? "Starred" : "Star"}
                      className={`p-2 rounded-lg text-xs transition ${
                        file.is_favorite ? "text-amber-500 bg-amber-50" : "text-slate-400 hover:bg-slate-100"
                      }`}
                    >
                      <Star className="h-4 w-4 fill-current" />
                    </button>

                    <button
                      onClick={() => onPreviewFile(file)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      {isVid || isAud ? <Play className="h-3.5 w-3.5 text-blue-600" /> : <Eye className="h-3.5 w-3.5 text-blue-600" />}
                      <span>{isVid || isAud ? "Play" : "Preview"}</span>
                    </button>

                    <button
                      onClick={() => onDownloadFile(file)}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
