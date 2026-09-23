import React from "react";
import { useAuth } from "../context/AuthContext";
import { DEFAULT_BRAND_COLOR, isDarkColor } from "../lib/theme";
import {
  Home,
  FolderOpen,
  Film,
  Music,
  FileText,
  Image as ImageIcon,
  FolderTree,
  UploadCloud,
  Share2,
  Star,
  Clock,
  Trash2,
  Settings,
  Users,
  HardDrive,
  BarChart3,
  ShieldCheck,
  Plus,
  X,
  Database,
  Building2,
  Info,
} from "lucide-react";

export type NavView =
  | "dashboard"
  | "resources"
  | "videos"
  | "audio"
  | "documents"
  | "images"
  | "folders"
  | "upload"
  | "shared"
  | "favorites"
  | "recent"
  | "trash"
  | "settings"
  | "about"
  | "admin_institution"
  | "admin_users"
  | "admin_storage"
  | "admin_reports"
  | "admin_security";

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenUpload: () => void;
  storageUsedBytes: number;
  storageLimitBytes: number;
  trashCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpen,
  onClose,
  onOpenUpload,
  storageUsedBytes,
  storageLimitBytes,
  trashCount = 0,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, badge: null },
    { id: "resources", label: "My Resources", icon: FolderOpen, badge: null },
    { id: "videos", label: "Videos", icon: Film, badge: null },
    { id: "audio", label: "Audio", icon: Music, badge: null },
    { id: "documents", label: "Documents", icon: FileText, badge: null },
    { id: "images", label: "Images", icon: ImageIcon, badge: null },
    { id: "folders", label: "Folders", icon: FolderTree, badge: null },
    { id: "upload", label: "Upload Center", icon: UploadCloud, badge: null },
    { id: "shared", label: "Shared With Me", icon: Share2, badge: null },
    { id: "favorites", label: "Favorites", icon: Star, badge: null },
    { id: "recent", label: "Recent", icon: Clock, badge: null },
    { id: "trash", label: "Trash", icon: Trash2, badge: trashCount > 0 ? String(trashCount) : null },
    { id: "settings", label: "Settings", icon: Settings, badge: null },
    { id: "about", label: "About", icon: Info, badge: null },
  ];

  const adminNavItems = [
    { id: "admin_institution", label: "Institutional Hub", icon: Building2 },
    { id: "admin_users", label: "Teacher Accounts", icon: Users },
    { id: "admin_storage", label: "Storage Management", icon: HardDrive },
    { id: "admin_reports", label: "System Reports", icon: BarChart3 },
    { id: "admin_security", label: "Security & Audit", icon: ShieldCheck },
  ];

  const brandColor = user?.school?.brand_color || DEFAULT_BRAND_COLOR;
  const isDark = isDarkColor(brandColor);

  const usedMB = (storageUsedBytes / (1024 * 1024)).toFixed(1);
  const limitGB = (storageLimitBytes / (1024 * 1024 * 1024)).toFixed(0);
  const percentage = Math.min(100, Math.round((storageUsedBytes / (storageLimitBytes || 1)) * 100));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col transition-all duration-300 md:static md:z-20 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isDark ? "border-r border-white/10 text-white" : "border-r border-slate-200 bg-white text-slate-800"}`}
        style={{ backgroundColor: brandColor }}
      >
        {/* Mobile Header in Sidebar */}
        <div
          className={`flex items-center justify-between border-b p-4 md:hidden ${
            isDark ? "border-white/15 text-white" : "border-slate-200 text-slate-800"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            <Database className={`h-5 w-5 ${isDark ? "text-white" : "text-blue-600"}`} />
            <span>Teacher Hub Menu</span>
          </div>
          <button
            onClick={onClose}
            className={`rounded-lg p-1.5 transition ${
              isDark ? "text-white/70 hover:bg-white/10 text-white" : "text-slate-400 hover:bg-slate-100"
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Upload Action */}
        <div className="p-4">
          <button
            id="btn-sidebar-quick-upload"
            onClick={() => {
              onOpenUpload();
              onClose();
            }}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-bold transition active:scale-98 shadow-md ${
              isDark
                ? "bg-white text-slate-900 hover:bg-white/90 shadow-black/20"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20"
            }`}
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Upload New Resource</span>
          </button>
        </div>

        {/* Scrollable Nav List (Scrollbar hidden) */}
        <div className="flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-3 py-1 space-y-5">
          {/* Institutional Context Badge */}
          {user?.school && (
            <div
              className={`rounded-xl border p-2.5 shadow-2xs transition ${
                isDark
                  ? "border-white/20 bg-white/10 text-white backdrop-blur-xs"
                  : "border-purple-200/80 bg-gradient-to-br from-purple-50/80 to-indigo-50/50 text-slate-800"
              }`}
            >
              <div
                className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? "text-white/80" : "text-purple-700"
                }`}
              >
                <Building2 className={`h-3 w-3 shrink-0 ${isDark ? "text-white" : "text-purple-600"}`} />
                <span className="truncate">School Tenant</span>
              </div>
              <p className={`mt-1 text-xs font-bold truncate ${isDark ? "text-white" : "text-slate-800"}`} title={user.school.name}>
                {user.school.name}
              </p>
              <div className={`mt-1 flex items-center justify-between text-[10px] ${isDark ? "text-white/70" : "text-slate-500"}`}>
                <span>Code: <strong className={`font-mono ${isDark ? "text-white" : "text-purple-800"}`}>{user.school.code}</strong></span>
                <span className={`font-semibold ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>Isolated</span>
              </div>
            </div>
          )}

          <div>
            <div
              className={`px-3 pb-2 text-[11px] font-bold tracking-wider uppercase ${
                isDark ? "text-white/60" : "text-slate-400"
              }`}
            >
              Teaching Workspace
            </div>
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const isActive = currentView === item.id;
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => {
                      onNavigate(item.id as NavView);
                      onClose();
                    }}
                    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs transition ${
                      isActive
                        ? isDark
                          ? "bg-white/20 text-white font-bold shadow-2xs border border-white/20"
                          : "bg-blue-50 text-blue-700 font-semibold"
                        : isDark
                        ? "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                    }`}
                  >
                    <IconComponent
                      className={`h-4 w-4 shrink-0 transition ${
                        isActive
                          ? isDark ? "text-white" : "text-blue-600"
                          : isDark ? "text-white/70 group-hover:text-white" : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    <span className="truncate flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 transition ${
                          isActive
                            ? isDark
                              ? "bg-white text-slate-900"
                              : "bg-blue-600 text-white"
                            : isDark
                            ? "bg-white/20 text-white"
                            : "bg-slate-200 text-slate-700 group-hover:bg-slate-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Admin Section */}
          {isAdmin && (
            <div className={`pt-2 border-t ${isDark ? "border-white/15" : "border-slate-100"}`}>
              <div className="flex items-center justify-between px-3 pb-2">
                <span
                  className={`text-[11px] font-bold tracking-wider uppercase ${
                    isDark ? "text-white/80" : "text-purple-600"
                  }`}
                >
                  Administration
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                    isDark ? "bg-white/20 text-white" : "bg-purple-100 text-purple-700"
                  }`}
                >
                  ADMIN
                </span>
              </div>
              <nav className="space-y-0.5">
                {adminNavItems.map((item) => {
                  const isActive = currentView === item.id;
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      id={`nav-${item.id}`}
                      onClick={() => {
                        onNavigate(item.id as NavView);
                        onClose();
                      }}
                      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs transition ${
                        isActive
                          ? isDark
                            ? "bg-white/20 text-white font-bold shadow-2xs border border-white/20"
                            : "bg-purple-50 text-purple-800 font-semibold"
                          : isDark
                          ? "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                      }`}
                    >
                      <IconComponent
                        className={`h-4 w-4 shrink-0 transition ${
                          isActive
                            ? isDark ? "text-white" : "text-purple-600"
                            : isDark ? "text-white/70 group-hover:text-white" : "text-slate-400 group-hover:text-slate-600"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Bottom Storage Meter Card */}
        <div
          className={`border-t p-4 transition ${
            isDark ? "border-white/15 bg-black/20 text-white" : "border-slate-200 bg-slate-50/70 text-slate-700"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <HardDrive className={`h-3.5 w-3.5 ${isDark ? "text-white" : "text-blue-600"}`} />
              <span>Storage Used</span>
            </span>
            <span className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{percentage}%</span>
          </div>

          <div className={`mt-2 h-2 w-full overflow-hidden rounded-full ${isDark ? "bg-white/20" : "bg-slate-200"}`}>
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                percentage > 85 ? "bg-rose-500" : percentage > 60 ? "bg-amber-500" : isDark ? "bg-white" : "bg-blue-600"
              }`}
              style={{ width: `${Math.max(percentage, 3)}%` }}
            />
          </div>

          <div className={`mt-2 flex items-center justify-between text-[11px] ${isDark ? "text-white/70" : "text-slate-500"}`}>
            <span>{usedMB} MB used</span>
            <span>{limitGB} GB quota</span>
          </div>
        </div>
      </aside>
    </>
  );
};
