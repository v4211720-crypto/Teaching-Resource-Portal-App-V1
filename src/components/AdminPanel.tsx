import React, { useState, useEffect } from "react";
import { User, ActivityLog, FileItem } from "../types";
import { api } from "../lib/api";
import {
  Users,
  HardDrive,
  BarChart3,
  ShieldCheck,
  UserPlus,
  KeyRound,
  Trash2,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Lock,
  Building2,
  Save,
  CheckCircle2,
  Sparkles,
  School as SchoolIcon,
  GraduationCap,
  PlusCircle,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { DynamicFileIcon, FileExtensionBadge } from "../services/fileIconService";
import { School } from "../types";
import { useAuth } from "../context/AuthContext";

export type AdminTab = "institution" | "users" | "storage" | "reports" | "security";

interface AdminPanelProps {
  initialTab?: AdminTab;
  onPreviewFile?: (file: FileItem) => void;
  onDownloadFile?: (file: FileItem) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  initialTab = "users",
  onPreviewFile,
  onDownloadFile,
}) => {
  const { user, logout, addNotification } = useAuth();
  const isAdmin = user?.role === "admin";

  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [systemFiles, setSystemFiles] = useState<FileItem[]>([]);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [schoolAnalytics, setSchoolAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState("");

  // School profile form state
  const [schoolCode, setSchoolCode] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [schoolPhone, setSchoolPhone] = useState("");
  const [schoolQuotaGb, setSchoolQuotaGb] = useState(50);
  const [schoolSaving, setSchoolSaving] = useState(false);
  const [schoolSaveSuccess, setSchoolSaveSuccess] = useState("");

  // Sync activeTab when initialTab changes (e.g. from Sidebar click)
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // New user form state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"teacher" | "admin">("teacher");

  // Reset password modal state
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [resetNewPass, setResetNewPass] = useState("");

  // Sister school / New institution registration state
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [showRegisterSchoolModal, setShowRegisterSchoolModal] = useState(false);
  const [regSchoolName, setRegSchoolName] = useState("");
  const [regSchoolCode, setRegSchoolCode] = useState("");
  const [regAdminUsername, setRegAdminUsername] = useState("");
  const [regAdminEmail, setRegAdminEmail] = useState("");
  const [regAdminPassword, setRegAdminPassword] = useState("");
  const [regAdminName, setRegAdminName] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regQuotaGb, setRegQuotaGb] = useState(100);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  // Delete registered institution modal state (Admin only)
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);
  const [deleteConfirmCode, setDeleteConfirmCode] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Delete Teacher Account state
  const [teacherToDelete, setTeacherToDelete] = useState<User | null>(null);
  const [isDeletingTeacher, setIsDeletingTeacher] = useState(false);
  const [teacherDeleteError, setTeacherDeleteError] = useState("");

  const resetRegForm = () => {
    setRegSchoolName("");
    setRegSchoolCode("");
    setRegAdminUsername("");
    setRegAdminEmail("");
    setRegAdminPassword("");
    setRegAdminName("");
    setRegAddress("");
    setRegPhone("");
    setRegQuotaGb(100);
    setRegError("");
  };

  const handleDeleteInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setDeleteError("Administrator permissions required to delete institutions.");
      return;
    }
    if (!schoolToDelete) return;

    if (allSchools.length <= 1) {
      setDeleteError("Cannot delete the only registered institution in the system. The platform requires at least one registered educational institution.");
      return;
    }

    if (deleteConfirmCode.trim().toUpperCase() !== schoolToDelete.code.trim().toUpperCase()) {
      setDeleteError(`Please type the exact institution code "${schoolToDelete.code}" to confirm deletion.`);
      return;
    }

    setDeleteLoading(true);
    setDeleteError("");
    try {
      const res = await api.deleteSchool(schoolToDelete.id);
      if (res.isCurrent) {
        addNotification(
          "Institution Deleted",
          `Active institution "${schoolToDelete.name}" (${schoolToDelete.code}) was deleted. Logging out...`,
          "info"
        );
        setSchoolToDelete(null);
        logout();
        return;
      }

      addNotification(
        "Institution Deleted",
        res.message || `Educational institution "${schoolToDelete.name}" (${schoolToDelete.code}) was deleted successfully.`,
        "success"
      );
      setRegSuccess(res.message || `Institution "${schoolToDelete.name}" (${schoolToDelete.code}) was deleted successfully.`);
      setTimeout(() => setRegSuccess(""), 6000);
      setSchoolToDelete(null);
      setDeleteConfirmCode("");
      await loadData();
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete registered institution");
    } finally {
      setDeleteLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [uData, lData, fData, sData, aData, schData] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminLogs(),
        api.getFiles({ is_trash: false }),
        api.getCurrentSchool().catch(() => null),
        api.getSchoolAnalytics().catch(() => null),
        api.getInstitutions().catch(() => []),
      ]);
      setUsers(uData);
      setLogs(lData);
      setSystemFiles(fData);
      setAllSchools(schData);
      if (sData) {
        setCurrentSchool(sData);
        setSchoolCode(sData.code || "");
        setSchoolName(sData.name || "");
        setSchoolAddress(sData.address || "");
        setSchoolPhone(sData.contact_phone || "");
        setSchoolQuotaGb(sData.storage_quota_gb || 50);
      }
      if (aData) {
        setSchoolAnalytics(aData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterNewSchoolFromAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError("");
    setRegSuccess("");

    const cleanCode = regSchoolCode.trim().toUpperCase();
    console.group(`[AdminPanel Registration] Registering institution "${regSchoolName}"`);
    console.log("Verification step 1: Pre-checking institutional code conflict in registered directory:", cleanCode);

    // Pre-verification step on client before sending to database write stage
    const existingMatch = allSchools.find((s) => s.code.toUpperCase() === cleanCode);
    if (existingMatch) {
      console.warn(`[AdminPanel Registration Warning] Code conflict detected: "${cleanCode}" is held by "${existingMatch.name}"`);
      setRegError(`Institutional code conflict: Code "${cleanCode}" is already assigned to "${existingMatch.name}". Please use a unique school code.`);
      setRegLoading(false);
      console.groupEnd();
      return;
    }

    try {
      console.log("Executing verified registration with write-stage enforcement...");
      const res = await api.registerSchool({
        school_name: regSchoolName.trim(),
        name: regSchoolName.trim(),
        school_code: cleanCode,
        code: cleanCode,
        admin_name: regAdminName.trim() || regAdminUsername.trim(),
        admin_email: regAdminEmail.trim().toLowerCase(),
        admin_username: regAdminUsername.trim(),
        admin_password: regAdminPassword,
        address: regAddress.trim() || undefined,
        contact_phone: regPhone.trim() || undefined,
        storage_quota_gb: Number(regQuotaGb) || 100,
      });

      console.log("[AdminPanel Registration Success] Institutional document verified and queryable in repository:", res);
      console.groupEnd();

      setRegSuccess(`Institution "${regSchoolName}" (${cleanCode}) registered and verified successfully! Initial administrator: ${regAdminUsername}`);
      resetRegForm();
      setShowRegisterSchoolModal(false);
      loadData();
      setTimeout(() => setRegSuccess(""), 6000);
    } catch (err: any) {
      console.error("[AdminPanel Registration Error at Database Write Stage]:", err);
      console.groupEnd();
      setRegError(err.message || "Database write stage failure: Could not complete institutional registration.");
    } finally {
      setRegLoading(false);
    }
  };

  const handleUpdateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setSchoolSaving(true);
    setSchoolSaveSuccess("");
    try {
      const updated = await api.updateCurrentSchool({
        code: schoolCode.trim().toUpperCase(),
        name: schoolName.trim(),
        address: schoolAddress.trim(),
        contact_phone: schoolPhone.trim(),
        storage_quota_gb: Number(schoolQuotaGb),
      });
      setCurrentSchool(updated);
      setSchoolSaveSuccess("Institutional settings and school code updated successfully!");
      setTimeout(() => setSchoolSaveSuccess(""), 4000);
      const aData = await api.getSchoolAnalytics().catch(() => null);
      if (aData) setSchoolAnalytics(aData);
    } catch (err: any) {
      alert(err.message || "Failed to update institutional settings");
    } finally {
      setSchoolSaving(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTeacher({
        username: newUsername,
        email: newEmail,
        password: newPassword,
        name: newName,
        role: newRole,
      });
      setShowAddUserModal(false);
      setNewUsername("");
      setNewEmail("");
      setNewPassword("");
      setNewName("");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to create teacher");
    }
  };

  const handleToggleStatus = async (user: User) => {
    const nextStatus = user.status === "active" ? "inactive" : "active";
    if (confirm(`Are you sure you want to change ${user.name}'s status to ${nextStatus}?`)) {
      await api.updateTeacher(user.id, { status: nextStatus });
      loadData();
    }
  };

  const handleToggleRole = async (user: User) => {
    const nextRole = user.role === "admin" ? "teacher" : "admin";
    if (confirm(`Change ${user.name}'s role to ${nextRole}?`)) {
      await api.updateTeacher(user.id, { role: nextRole });
      loadData();
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser || !resetNewPass) return;
    try {
      await api.adminResetPassword(resettingUser.id, resetNewPass);
      alert(`Password updated for ${resettingUser.name}`);
      setResettingUser(null);
      setResetNewPass("");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to reset password");
    }
  };

  const handleDeleteTeacher = async () => {
    if (!teacherToDelete) return;
    if (teacherToDelete.id === user?.id) {
      setTeacherDeleteError("Cannot delete your own active administrator account.");
      return;
    }

    setIsDeletingTeacher(true);
    setTeacherDeleteError("");
    try {
      await api.deleteAdminUser(teacherToDelete.id);
      addNotification(
        "Teacher Account Deleted",
        `Faculty member "${teacherToDelete.name}" (@${teacherToDelete.username}) was successfully removed.`,
        "success"
      );
      setUsers((prev) => prev.filter((u) => u.id !== teacherToDelete.id));
      setTeacherToDelete(null);
      await loadData();
    } catch (err: any) {
      setTeacherDeleteError(err.message || "Failed to delete teacher account");
    } finally {
      setIsDeletingTeacher(false);
    }
  };

  const handleDeleteInappropriateFile = async (file: FileItem) => {
    if (confirm(`ADMIN ACTION: Permanently remove file "${file.file_name}" from central cloud storage?`)) {
      await api.permanentDeleteFile(file.id);
      loadData();
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.username.toLowerCase().includes(searchUser.toLowerCase())
  );

  const totalStorageBytes = users.reduce((acc, u) => acc + (u.storage_used || 0), 0);
  const totalStorageMB = (totalStorageBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-purple-600" />
            <h1 className="text-xl font-black text-slate-900">Administrator Console</h1>
            <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800">
              HIGH PRIVILEGE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage teachers, central storage allocation, security policies, and audit logs.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold overflow-x-auto">
        {[
          { id: "institution", label: "Institutional Profile & Quota", icon: Building2 },
          { id: "users", label: "Teacher Accounts", icon: Users },
          { id: "storage", label: "Central Storage & Content", icon: HardDrive },
          { id: "reports", label: "System Reports", icon: BarChart3 },
          { id: "security", label: "Security & Audit Logs", icon: ShieldCheck },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
                isActive
                  ? "border-purple-600 text-purple-700 bg-purple-50/50 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 0: INSTITUTIONAL MANAGEMENT */}
      {activeTab === "institution" && (
        <div className="space-y-6">
          {/* Institutional Header Banner */}
          <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/50 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-black text-slate-900">
                      {currentSchool?.name || "Educational Institution"}
                    </h2>
                    <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-mono font-bold text-purple-800 border border-purple-200">
                      Code: {currentSchool?.code || "UNASSIGNED"}
                    </span>
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Isolated Tenant
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Manage your institution's registration details, official school code, allocated cloud quota, and access isolation rules.
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tenant Identification</span>
                <span className="text-xs font-mono font-semibold text-slate-700">{currentSchool?.id}</span>
              </div>
            </div>
          </div>

          {/* School Profile Edit Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Edit2 className="h-4 w-4 text-purple-600" />
                  <span>Institutional Settings & School Code</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your school code or administrative institutional contact data.
                </p>
              </div>

              {schoolSaveSuccess && (
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{schoolSaveSuccess}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleUpdateSchool} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Institution / School Name
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                    placeholder="e.g. Central Resource Hub High School"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Official School Code (Used for staff login scoping)
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolCode}
                    onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono uppercase text-slate-800 focus:outline-none focus:border-purple-500"
                    placeholder="e.g. CRH-101"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Institutional Cloud Quota (GB)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={2000}
                    value={schoolQuotaGb}
                    onChange={(e) => setSchoolQuotaGb(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={schoolPhone}
                    onChange={(e) => setSchoolPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                    placeholder="+1 (555) 019-2831"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Campus Address
                  </label>
                  <input
                    type="text"
                    value={schoolAddress}
                    onChange={(e) => setSchoolAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                    placeholder="100 Academic Way, Metro Campus"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={schoolSaving}
                  className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 font-bold text-white shadow-xs hover:bg-purple-700 disabled:opacity-50 transition"
                >
                  <Save className="h-4 w-4" />
                  <span>{schoolSaving ? "Saving Settings..." : "Save Institutional Profile"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Institutional Storage Analytics (Scoped to this School) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <span>Institutional Storage & Capacity Analytics</span>
            </h3>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Allocated Quota</span>
                  <HardDrive className="h-4 w-4 text-purple-600" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">
                    {schoolAnalytics ? (schoolAnalytics.storageUsedBytes / (1024 * 1024)).toFixed(1) : totalStorageMB}
                  </span>
                  <span className="text-xs font-bold text-slate-500">MB</span>
                  <span className="text-xs text-slate-400 ml-1">
                    / {currentSchool?.storage_quota_gb || 100} GB
                  </span>
                </div>
                <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        schoolAnalytics?.storageUsedPercent ?? 0
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {schoolAnalytics?.storageUsedPercent ?? 0}% quota consumed
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>School Teachers</span>
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">
                    {schoolAnalytics?.totalTeachers ?? users.length}
                  </span>
                  <span className="text-xs text-slate-500">staff accounts</span>
                </div>
                <p className="mt-3 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{schoolAnalytics?.activeTeachers ?? users.filter(u => u.status === "active").length} active accounts</span>
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Total Resources</span>
                  <FileText className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">
                    {schoolAnalytics?.totalFiles ?? systemFiles.length}
                  </span>
                  <span className="text-xs text-slate-500">teaching files</span>
                </div>
                <p className="mt-3 text-[11px] text-slate-500">
                  Across syllabus, class folders & media
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Tenant Isolation</span>
                  <ShieldCheck className="h-4 w-4 text-purple-600" />
                </div>
                <div className="mt-2">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Strict Scoping
                  </span>
                </div>
                <p className="mt-3 text-[11px] text-slate-500">
                  Zero visibility from external schools
                </p>
              </div>
            </div>

            {/* Category Breakdown & Teacher Ranking */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Category Breakdown */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Resource Storage Breakdown by Type
                </h4>
                <div className="space-y-2.5">
                  {Object.entries(schoolAnalytics?.categoryBreakdown || {}).map(([type, bytes]: [string, any]) => {
                    const mb = (bytes / (1024 * 1024)).toFixed(1);
                    const totalBytes = schoolAnalytics?.storageUsedBytes || 1;
                    const pct = Math.round((bytes / totalBytes) * 100);
                    return (
                      <div key={type} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="capitalize text-slate-700">{type} Files</span>
                          <span className="text-slate-500 font-mono">{mb} MB ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              type === "video"
                                ? "bg-purple-500"
                                : type === "document"
                                ? "bg-blue-500"
                                : type === "audio"
                                ? "bg-rose-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Faculty Storage Ranking */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Faculty Storage Usage within {currentSchool?.name || "School"}
                </h4>
                <div className="overflow-y-auto max-h-56 space-y-2">
                  {(schoolAnalytics?.teacherUsage || users).map((t: any) => {
                    const usedMb = ((t.storage_used || 0) / (1024 * 1024)).toFixed(1);
                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-800 truncate">{t.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono truncate">{t.username} • {t.department || "General"}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-slate-900">{usedMb} MB</span>
                          <span className="block text-[10px] text-slate-400">{t.files_count ?? 0} files</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Registered Institutions & Sister Campuses Directory */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-600" />
                    <span>Registered Educational Institutions ({allSchools.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified repository of tenant-isolated schools and administrative contacts with unique school code indexing.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetRegForm();
                      setShowRegisterSchoolModal(true);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-purple-700 transition"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Register New School</span>
                  </button>
                </div>
              </div>

              {regSuccess && (
                <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {allSchools.map((s) => {
                  const isCurrent = s.id === currentSchool?.id;
                  return (
                    <div
                      key={s.id}
                      className={`p-3.5 rounded-xl border transition ${
                        isCurrent
                          ? "border-purple-300 bg-purple-50/40 shadow-xs"
                          : "border-slate-200 bg-slate-50/40 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 truncate">{s.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded border border-purple-200">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 font-mono truncate">
                            Admin: {s.admin_email}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-mono text-xs font-bold bg-white text-purple-700 px-2 py-0.5 rounded-lg border border-purple-200">
                            {s.code}
                          </span>
                          {isAdmin && (
                            <button
                              type="button"
                              id={`btn-delete-institution-${s.code.toLowerCase()}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSchoolToDelete(s);
                                setDeleteConfirmCode("");
                                setDeleteError("");
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-200"
                              title={`Delete educational institution: ${s.name} (${s.code})`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Quota: {s.storage_quota_gb || 100} GB</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-emerald-600 font-semibold flex items-center gap-1">
                            <Check className="h-3 w-3" /> Indexed
                          </span>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSchoolToDelete(s);
                                setDeleteConfirmCode("");
                                setDeleteError("");
                              }}
                              className="font-semibold text-rose-500 hover:text-rose-700 hover:underline flex items-center gap-0.5 transition"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: USERS */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Institutional Banner for Teacher Accounts */}
          <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-purple-900">
            <div>
              <span className="font-bold">Faculty Staff Directory:</span>
              <span className="ml-1 text-purple-800 font-semibold">
                {currentSchool ? `${currentSchool.name} (${currentSchool.code})` : "Current Institution"}
              </span>
              <p className="text-[11px] text-purple-700 mt-0.5">
                Strict School Isolation: Only staff belonging to this school are displayed. Other schools cannot see these accounts.
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="rounded-full bg-purple-200 px-2.5 py-0.5 text-[10px] font-bold text-purple-800 font-mono">
                {users.length} Registered Staff
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search teachers by name or email..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <button
              id="btn-admin-add-teacher"
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-purple-700 transition"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add New Teacher</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="py-3 px-4">Teacher / Name</th>
                  <th className="py-3 px-4">Username / Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Storage Used</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const usedMb = ((u.storage_used || 0) / (1024 * 1024)).toFixed(1);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-xs">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[10px] text-slate-400">ID: {u.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800">@{u.username}</p>
                        <p className="text-[11px] text-slate-500">{u.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleRole(u)}
                          className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          }`}
                          title="Click to toggle role"
                        >
                          {u.role.toUpperCase()}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{usedMb} MB</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${
                            u.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {u.status === "active" ? <CheckCircle className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-slate-400" />}
                          <span className="capitalize">{u.status}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setResettingUser(u);
                              setResetNewPass("");
                            }}
                            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition"
                            title="Reset Password"
                          >
                            <KeyRound className="h-3.5 w-3.5 text-purple-600" />
                            <span>Reset Pass</span>
                          </button>

                          <button
                            type="button"
                            id={`btn-delete-teacher-${u.id}`}
                            onClick={() => {
                              setTeacherToDelete(u);
                              setTeacherDeleteError("");
                            }}
                            disabled={u.id === user?.id}
                            className={`rounded-lg p-1.5 transition ${
                              u.id === user?.id
                                ? "text-slate-300 cursor-not-allowed bg-slate-50"
                                : "text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200"
                            }`}
                            title={
                              u.id === user?.id
                                ? "Cannot delete your own active administrator account"
                                : `Delete teacher account ${u.name}`
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: STORAGE & ALL CONTENT */}
      {activeTab === "storage" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <span className="text-xs font-bold text-slate-500 uppercase">System Storage Used</span>
              <p className="mt-1 text-2xl font-black text-slate-900">{totalStorageMB} MB</p>
              <p className="text-[11px] text-slate-400 mt-1">Across all registered teachers</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <span className="text-xs font-bold text-slate-500 uppercase">Total Files in Repository</span>
              <p className="mt-1 text-2xl font-black text-slate-900">{systemFiles.length}</p>
              <p className="text-[11px] text-slate-400 mt-1">Centralized file storage</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <span className="text-xs font-bold text-slate-500 uppercase">Active Teachers</span>
              <p className="mt-1 text-2xl font-black text-purple-600">{users.filter((u) => u.status === "active").length}</p>
              <p className="text-[11px] text-slate-400 mt-1">Out of {users.length} registered</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900">
              All Files Across Entire School (Admin Inappropriate File Deletion)
            </h2>
            <p className="text-xs text-slate-500">
              As an administrator, you have permission to review any uploaded file and purge inappropriate or copyright-infringing resources.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Filename</th>
                    <th className="py-2.5 px-3">Teacher</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Device</th>
                    <th className="py-2.5 px-3 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {systemFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 truncate max-w-xs">
                        <div className="flex items-center gap-2">
                          <DynamicFileIcon
                            fileName={file.file_name}
                            fileType={file.file_type}
                            size="xs"
                            showBadge={false}
                          />
                          <span className="truncate">{file.file_name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">{file.owner_name}</td>
                      <td className="py-2.5 px-3">
                        <FileExtensionBadge fileName={file.file_name} fileType={file.file_type} />
                      </td>
                      <td className="py-2.5 px-3">{((file.file_size || 0) / (1024 * 1024)).toFixed(1)} MB</td>
                      <td className="py-2.5 px-3">{file.device}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleDeleteInappropriateFile(file)}
                          className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                        >
                          Delete Inappropriate File
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM REPORTS */}
      {activeTab === "reports" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-bold text-slate-900 mb-2">Resource Type Distribution</h2>
              <div className="space-y-2 text-xs">
                {["video", "audio", "document", "image", "other"].map((cat) => {
                  const count = systemFiles.filter((f) => f.file_type === cat).length;
                  const pct = systemFiles.length > 0 ? Math.round((count / systemFiles.length) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between font-medium text-slate-700 capitalize">
                        <span>{cat} files</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-bold text-slate-900 mb-2">Storage Usage by Teacher</h2>
              <div className="space-y-2 text-xs">
                {users.slice(0, 5).map((u) => {
                  const mb = ((u.storage_used || 0) / (1024 * 1024)).toFixed(1);
                  return (
                    <div key={u.id} className="flex items-center justify-between border-b border-slate-50 py-1.5">
                      <div>
                        <p className="font-bold text-slate-800">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                      </div>
                      <span className="font-mono font-semibold text-slate-700">{mb} MB</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & AUDIT LOGS */}
      {activeTab === "security" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Security & Activity Audit Trail</h2>
            <span className="text-xs text-slate-400">{logs.length} recorded events</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Details</th>
                  <th className="py-2.5 px-3">Device / IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{log.user_name || "System"}</td>
                    <td className="py-2.5 px-3 font-bold text-purple-700 uppercase">{log.action}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">{log.details}</td>
                    <td className="py-2.5 px-3 text-slate-400">{log.ip_address || "Client"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-purple-600" />
              <span>Register New Faculty for {currentSchool?.name || "School"}</span>
            </h3>
            <div className="mb-4 rounded-xl bg-purple-50 p-2.5 text-[11px] text-purple-900 border border-purple-100 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-700 shrink-0" />
              <span>
                School Code: <strong>{currentSchool?.code || "Current School"}</strong>. Account will be strictly bound to this institution.
              </span>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jane Smith"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. janesmith"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. jane@school.edu"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter temporary password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">System Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none"
                >
                  <option value="teacher">Teacher (Upload, organize, download)</option>
                  <option value="admin">Admin (Full administrative privileges)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-4 py-2 font-bold text-white hover:bg-purple-700"
                >
                  Create Teacher Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-purple-600" />
              <span>Reset Password for {resettingUser.name}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter a new secure password. Never stored in plain text.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={resetNewPass}
                  onChange={(e) => setResetNewPass(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-4 py-2 font-bold text-white hover:bg-purple-700"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Teacher Account Confirmation Modal */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <div className="rounded-full bg-rose-100 p-1.5 text-rose-600">
                  <Trash2 className="h-4 w-4" />
                </div>
                <span>Delete Teacher Account</span>
              </div>
              <button
                type="button"
                onClick={() => setTeacherToDelete(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition"
                disabled={isDeletingTeacher}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <p>
                Are you sure you want to permanently delete the faculty account for{" "}
                <strong className="text-slate-900">{teacherToDelete.name}</strong> (@
                <span className="font-mono text-purple-700">{teacherToDelete.username}</span>)?
              </p>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Email:</span>
                  <span className="font-semibold text-slate-900">{teacherToDelete.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Assigned Role:</span>
                  <span className="font-semibold capitalize text-slate-900">{teacherToDelete.role}</span>
                </div>
                {teacherToDelete.department && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Department:</span>
                    <span className="font-semibold text-slate-900">{teacherToDelete.department}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Account ID:</span>
                  <span className="font-mono text-[11px] text-slate-500">{teacherToDelete.id}</span>
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-2.5 text-[11px] text-amber-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  This will revoke their access to the school repository. Existing files uploaded by this teacher will remain safely stored in the institution library.
                </span>
              </div>

              {teacherDeleteError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{teacherDeleteError}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setTeacherToDelete(null)}
                disabled={isDeletingTeacher}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-delete-teacher"
                onClick={handleDeleteTeacher}
                disabled={isDeletingTeacher}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 transition shadow-xs"
              >
                {isDeletingTeacher ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting Teacher...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Sister School / Branch Modal */}
      {showRegisterSchoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-sm">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Register Sister Institution or Campus
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Multi-stage verified provisioning with index validation
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowRegisterSchoolModal(false);
                  resetRegForm();
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {regError && (
              <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Registration Halted:</p>
                  <p>{regError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleRegisterNewSchoolFromAdmin} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Institution / School Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Govt Hr Sec School Pannaipuram"
                    value={regSchoolName}
                    onChange={(e) => setRegSchoolName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Unique School Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STATE-405"
                    value={regSchoolCode}
                    onChange={(e) => setRegSchoolCode(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono uppercase text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-3">
                <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
                  <span>Assigned Institution Administrator Account</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Admin Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. AdminBO"
                      value={regAdminName}
                      onChange={(e) => setRegAdminName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Admin Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. backofficeppm524@gmail.com"
                      value={regAdminEmail}
                      onChange={(e) => setRegAdminEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Admin Username *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. backofficeppm524"
                      value={regAdminUsername}
                      onChange={(e) => setRegAdminUsername(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Admin Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={regAdminPassword}
                      onChange={(e) => setRegAdminPassword(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Campus Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Pannaipuram, Theni Dist"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Allocated Quota (GB)</label>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    value={regQuotaGb}
                    onChange={(e) => setRegQuotaGb(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-2.5 text-[11px] text-purple-900 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Transaction Verification:</strong> The system writes to the <code>institutions</code> collection, executes an index query verification for <code>{regSchoolCode || "CODE"}</code>, and then provisions the admin account with tenant scope.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterSchoolModal(false);
                    resetRegForm();
                  }}
                  className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={regLoading}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-5 py-2 font-bold text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {regLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Verifying & Provisioning...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-4 w-4" />
                      <span>Provision Institution</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE REGISTERED INSTITUTION (ADMIN ONLY) */}
      {isAdmin && schoolToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Delete Educational Institution</h3>
                  <p className="text-xs text-slate-500">Administrator Authorization Required</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSchoolToDelete(null);
                  setDeleteConfirmCode("");
                  setDeleteError("");
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleDeleteInstitution} className="mt-4 space-y-4">
              {/* Institution Details Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Institution Name:</span>
                  <span className="font-bold text-slate-900">{schoolToDelete.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Institution Code:</span>
                  <span className="font-mono font-bold bg-white text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                    {schoolToDelete.code}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Admin Email:</span>
                  <span className="font-mono text-slate-700">{schoolToDelete.admin_email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Storage Quota:</span>
                  <span className="text-slate-700 font-medium">{schoolToDelete.storage_quota_gb || 100} GB</span>
                </div>
              </div>

              {/* Single remaining school warning */}
              {allSchools.length <= 1 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block mb-0.5">Cannot Delete Sole Institution:</strong>
                    This is currently the only registered institution in the system. The platform requires at least one registered educational institution to function.
                  </div>
                </div>
              ) : (
                <>
                  {/* Current Active Tenant Warning */}
                  {schoolToDelete.id === currentSchool?.id && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900 flex items-start gap-2.5">
                      <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold block mb-0.5">Active Tenant Warning:</strong>
                        You are currently signed into this institution. Deleting it will permanently remove all associated folders, files, and staff accounts, and your active session will be terminated immediately.
                      </div>
                    </div>
                  )}

                  {/* Cascade deletion warning */}
                  <div className="rounded-xl border border-slate-200 bg-slate-100/80 p-3 text-xs text-slate-700">
                    <p>
                      <strong>Cascade Purge Notice:</strong> Deleting this educational institution will permanently delete all associated user profiles, faculty accounts, resource folders, files, and audit logs belonging to code <strong>{schoolToDelete.code}</strong>. This operation cannot be undone.
                    </p>
                  </div>

                  {/* Confirmation Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      To confirm deletion, please type the institution code{" "}
                      <span className="font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        {schoolToDelete.code}
                      </span>:
                    </label>
                    <input
                      type="text"
                      id="input-confirm-delete-code"
                      placeholder={`Type ${schoolToDelete.code} to confirm`}
                      value={deleteConfirmCode}
                      onChange={(e) => setDeleteConfirmCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      autoFocus
                    />
                  </div>
                </>
              )}

              {/* Error Banner */}
              {deleteError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              {/* Footer buttons */}
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSchoolToDelete(null);
                    setDeleteConfirmCode("");
                    setDeleteError("");
                  }}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-delete-institution"
                  disabled={
                    deleteLoading ||
                    allSchools.length <= 1 ||
                    deleteConfirmCode.trim().toUpperCase() !== schoolToDelete.code.trim().toUpperCase()
                  }
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs"
                >
                  {deleteLoading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Deleting Institution...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Permanently Delete Institution</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
