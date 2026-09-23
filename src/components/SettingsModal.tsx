import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import {
  INSTITUTIONAL_THEME_PRESETS,
  DEFAULT_BRAND_COLOR,
  isDarkColor,
  adjustColor,
} from "../lib/theme";
import {
  X,
  Settings,
  Palette,
  Check,
  Building2,
  Sparkles,
  KeyRound,
  Smartphone,
  Laptop,
  ShieldCheck,
  GraduationCap,
  RefreshCw,
  Eye,
  Info,
  BookOpen,
  Phone,
  Copy,
  MessageCircle,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = "branding" | "profile" | "security" | "about";

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, currentDevice, setCurrentDevice, updateSchoolBrandColor } = useAuth();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>("branding");
  const [phoneCopied, setPhoneCopied] = useState(false);

  // Institution Branding State
  const schoolColor = user?.school?.brand_color || DEFAULT_BRAND_COLOR;
  const [selectedColor, setSelectedColor] = useState<string>(schoolColor);
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeFeedback, setThemeFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Sync selectedColor if user school changes
  useEffect(() => {
    if (user?.school?.brand_color) {
      setSelectedColor(user.school.brand_color);
    }
  }, [user?.school?.brand_color]);

  // Security / Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  if (!isOpen || !user) return null;

  const handleSaveBrandColor = async (colorToSave: string) => {
    const color = (colorToSave || selectedColor).trim();
    if (!/^#([0-9a-fA-F]{3}){1,2}$/.test(color)) {
      setThemeFeedback({ text: "Please enter a valid hexadecimal color (e.g. #115e59)", type: "error" });
      return;
    }

    setThemeSaving(true);
    setThemeFeedback(null);
    try {
      await updateSchoolBrandColor(color);
      setSelectedColor(color);
      setThemeFeedback({
        text: `Successfully applied new brand color (${color}) to ${user.school?.name || "your institution"}! Navbar and sidebar backgrounds have been updated for all school users.`,
        type: "success",
      });
    } catch (err: any) {
      setThemeFeedback({
        text: err?.message || "Failed to update institution theme. Please try again.",
        type: "error",
      });
    } finally {
      setThemeSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: "New passwords do not match", type: "error" });
      return;
    }
    setPasswordLoading(true);
    setPasswordMessage(null);
    try {
      await api.changePassword(currentPassword, newPassword);
      setPasswordMessage({ text: "Password successfully updated!", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMessage({ text: err.message || "Failed to update password", type: "error" });
    } finally {
      setPasswordLoading(false);
    }
  };

  const usedMB = ((user.storage_used || 0) / (1024 * 1024)).toFixed(1);
  const limitGB = ((user.storage_limit || 15 * 1024 * 1024 * 1024) / (1024 * 1024 * 1024)).toFixed(0);

  const isColorDark = isDarkColor(selectedColor);
  const previewTextColor = isColorDark ? "text-white" : "text-slate-900";
  const previewBorderColor = isColorDark ? "border-white/20" : "border-slate-300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <Settings className="h-5 w-5 text-blue-600" />
            <span>Institution Settings & Preferences</span>
          </div>
          <button
            id="btn-close-settings-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 gap-2">
          <button
            id="tab-branding-theme"
            onClick={() => setActiveTab("branding")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === "branding"
                ? "border-blue-600 text-blue-600 bg-white shadow-2xs rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Palette className="h-4 w-4" />
            <span>Institution Theme & Brand Color</span>
          </button>

          <button
            id="tab-account-profile"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === "profile"
                ? "border-blue-600 text-blue-600 bg-white shadow-2xs rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Profile & Connected Device</span>
          </button>

          <button
            id="tab-security"
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === "security"
                ? "border-blue-600 text-blue-600 bg-white shadow-2xs rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <KeyRound className="h-4 w-4" />
            <span>Security & Password</span>
          </button>

          <button
            id="tab-about-developer"
            onClick={() => setActiveTab("about")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === "about"
                ? "border-amber-500 text-amber-600 bg-white shadow-2xs rounded-t-lg font-bold"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Info className="h-4 w-4 text-amber-500" />
            <span>About Developer</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* TAB 1: INSTITUTION THEME & BRAND COLOR */}
          {activeTab === "branding" && (
            <div className="space-y-6">
              {/* Institution Context Header */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-xs text-white border border-white/30"
                    style={{ backgroundColor: selectedColor }}
                  >
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-slate-900 text-sm">{user.school?.name || "School Institution"}</h2>
                      <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                        {user.school?.code || "SCH-001"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Multi-tenant brand customization • Applied dynamically to Navbar & Sidebar
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded-full border border-slate-300 shadow-2xs"
                    style={{ backgroundColor: selectedColor }}
                    title={`Current color: ${selectedColor}`}
                  />
                  <span className="font-mono text-xs font-bold text-slate-700 uppercase">
                    {selectedColor}
                  </span>
                </div>
              </div>

              {/* Feedback Alert */}
              {themeFeedback && (
                <div
                  className={`rounded-xl p-3 text-xs font-medium border flex items-start gap-2 ${
                    themeFeedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-rose-50 text-rose-800 border-rose-200"
                  }`}
                >
                  <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="flex-1">{themeFeedback.text}</div>
                </div>
              )}

              {/* Live Preview Box */}
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-900/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Eye className="h-4 w-4 text-blue-600" />
                    Live Theme Preview (Navbar & Sidebar)
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Simulated School Environment
                  </span>
                </div>

                {/* Mockup Frame */}
                <div className="rounded-xl overflow-hidden border border-slate-300 shadow-md bg-white">
                  {/* Mock Navbar */}
                  <div
                    className={`px-3 py-2 flex items-center justify-between border-b transition-colors duration-300 ${previewBorderColor}`}
                    style={{ backgroundColor: selectedColor }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-white/20 flex items-center justify-center text-white">
                        <GraduationCap className="h-3.5 w-3.5" />
                      </div>
                      <span className={`text-xs font-bold ${previewTextColor}`}>
                        {user.school?.name || "Central Resource Hub High School"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-white/15 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                        {user.school?.code || "CRH-101"}
                      </span>
                      <div className="h-5 w-5 rounded bg-white/20 flex items-center justify-center text-white text-[10px]">
                        🔔
                      </div>
                    </div>
                  </div>

                  {/* Mock Sidebar and Content */}
                  <div className="flex h-24">
                    {/* Mock Sidebar Strip */}
                    <div
                      className={`w-40 p-2 space-y-1.5 border-r transition-colors duration-300 ${previewBorderColor}`}
                      style={{ backgroundColor: selectedColor }}
                    >
                      <div className="rounded bg-white/25 px-2 py-1 text-[10px] font-bold text-white flex items-center justify-between">
                        <span>Dashboard</span>
                        <span>•</span>
                      </div>
                      <div className="rounded px-2 py-1 text-[10px] text-white/80 font-medium flex items-center gap-1">
                        <span>Teaching Resources</span>
                      </div>
                      <div className="rounded px-2 py-1 text-[10px] text-white/80 font-medium flex items-center gap-1">
                        <span>Upload Center</span>
                      </div>
                    </div>

                    {/* Mock Content */}
                    <div className="flex-1 p-3 bg-slate-50 flex items-center justify-center text-center">
                      <p className="text-[11px] text-slate-500 font-medium">
                        Content area with dynamic contrast styling for all school members
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preset Swatches */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Palette className="h-3.5 w-3.5 text-blue-600" />
                    Curated Institutional Palettes
                  </label>
                  <span className="text-[11px] text-slate-400">Click any preset to preview</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {INSTITUTIONAL_THEME_PRESETS.map((preset) => {
                    const isSelected = selectedColor.toLowerCase() === preset.hex.toLowerCase();
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        id={`btn-preset-${preset.id}`}
                        onClick={() => setSelectedColor(preset.hex)}
                        className={`group relative flex flex-col justify-between rounded-xl border p-3 text-left transition ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/40 shadow-xs ring-2 ring-indigo-500/30"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <div
                            className="h-8 w-8 rounded-lg shadow-xs flex items-center justify-center text-white border border-black/10"
                            style={{ backgroundColor: preset.hex }}
                          >
                            {isSelected && <Check className="h-4 w-4 stroke-[3]" />}
                          </div>
                          <span className="font-mono text-[11px] text-slate-400 font-medium">
                            {preset.hex}
                          </span>
                        </div>
                        <div className="min-w-0 w-full space-y-0.5">
                          <p className="font-bold text-xs text-slate-900 leading-tight">
                            {preset.name}
                          </p>
                          <p className="truncate text-[10px] text-slate-400 font-normal" title={preset.description}>
                            {preset.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Hex Color Picker */}
              <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
                <label className="block font-bold text-xs text-slate-800">
                  Custom Hexadecimal Brand Color
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      id="input-school-brand-color-picker"
                      value={selectedColor.startsWith("#") && selectedColor.length === 7 ? selectedColor : "#115e59"}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded-xl border border-slate-200 p-1 bg-white"
                      title="Choose custom color"
                    />
                  </div>

                  <input
                    type="text"
                    id="input-school-brand-color-hex"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    placeholder="#115e59"
                    maxLength={7}
                    className="w-32 rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs font-bold uppercase text-slate-800 focus:border-blue-500 focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setSelectedColor(DEFAULT_BRAND_COLOR)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Reset to Classic Navy
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="btn-save-school-theme"
                  disabled={themeSaving}
                  onClick={() => handleSaveBrandColor(selectedColor)}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50 transition active:scale-98"
                >
                  {themeSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Saving Theme...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Apply Brand Color to School</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE & CONNECTED DEVICE */}
          {activeTab === "profile" && (
            <div className="space-y-5">
              {/* User Profile Card */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-xs ${
                    user.role === "admin" ? "bg-purple-600" : "bg-blue-600"
                  }`}
                >
                  {user.role === "admin" ? (
                    <ShieldCheck className="h-6 w-6 text-white" />
                  ) : (
                    <GraduationCap className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">{user.name}</h2>
                  <p className="text-xs text-slate-500">
                    @{user.username} • {user.email}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase flex items-center gap-1 ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.role === "admin" ? (
                        <>
                          <ShieldCheck className="h-3 w-3" />
                          ADMINISTRATOR
                        </>
                      ) : (
                        <>
                          <GraduationCap className="h-3 w-3" />
                          TEACHER
                        </>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Storage: {usedMB} MB / {limitGB} GB
                    </span>
                  </div>
                </div>
              </div>

              {/* Device Sync Simulation */}
              <div className="rounded-2xl border border-slate-200 p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                  <Smartphone className="h-4 w-4 text-indigo-600" />
                  <span>Active Connected Device Simulator</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Simulate uploading from a mobile phone or desktop computer to test cross-device cloud sync:
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setCurrentDevice("Desktop (Chrome / Windows PC)")}
                    className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold border transition ${
                      currentDevice.includes("Desktop")
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Laptop className="h-4 w-4" />
                    <span>Desktop Computer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentDevice("Mobile (iPhone 15 Pro / Safari)")}
                    className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold border transition ${
                      currentDevice.includes("iPhone") || currentDevice.includes("Mobile")
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>Mobile Phone</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY & PASSWORD */}
          {activeTab === "security" && (
            <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                <KeyRound className="h-4 w-4 text-blue-600" />
                <span>Change Security Password</span>
              </div>

              {passwordMessage && (
                <div
                  className={`rounded-xl p-2.5 text-xs font-medium ${
                    passwordMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {passwordMessage.text}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition"
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: ABOUT APP & DEVELOPER INFO */}
          {activeTab === "about" && (
            <div className="space-y-6">
              <div className="relative rounded-3xl bg-[#050b14] p-6 sm:p-8 text-white overflow-hidden shadow-xl border border-slate-800">
                {/* Ambient glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Glowing Emblem */}
                  <div className="relative mb-4">
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl blur-md opacity-60 pointer-events-none" />
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/40 ring-4 ring-amber-300/30">
                      <GraduationCap className="h-9 w-9 stroke-[2.2]" />
                    </div>
                  </div>

                  <h3 className="font-serif text-2xl font-bold tracking-tight text-[#facc15]">
                    App Developer Info
                  </h3>

                  {/* Main Developer Card */}
                  <div className="mt-6 w-full rounded-2xl border border-sky-950/80 bg-[#0b1528] p-5 sm:p-6 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-[#38bdf8] uppercase">
                        DEVELOPED BY
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-950 border border-blue-800/60 px-2 py-0.5 text-[9px] font-semibold text-sky-300">
                        <Sparkles className="h-3 w-3 text-amber-400" />
                        Creator & Lead Architect
                      </span>
                    </div>

                    <div className="mt-3.5 flex items-start gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-700/60 bg-[#0d1e38] text-sky-400">
                        <BookOpen className="h-6 w-6 stroke-[1.8]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-xl font-black text-white tracking-wide">
                          P. SIVA
                        </h4>
                        <p className="mt-0.5 text-xs font-bold text-[#f59e0b]">
                          M.Sc., B.Ed., M.Phil., MCA.
                        </p>
                        <p className="text-xs font-medium text-slate-300">
                          PG Computer Science Teacher
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#fcd34d]">
                          <Building2 className="h-3.5 w-3.5 text-[#f59e0b] shrink-0" />
                          <span>Govt Hr Sec School, Pannaipuram</span>
                        </div>
                      </div>
                    </div>

                    <div className="my-5 border-t border-slate-800" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-[#12233f] text-amber-400">
                          <Phone className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="block text-[9px] font-mono font-bold tracking-widest text-[#38bdf8] uppercase">
                            CELL NO
                          </span>
                          <a
                            href="tel:7603930445"
                            className="text-base font-bold font-mono text-white hover:text-amber-400 transition"
                          >
                            7603930445
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              if (navigator?.clipboard?.writeText) {
                                await navigator.clipboard.writeText("7603930445");
                              }
                              setPhoneCopied(true);
                              setTimeout(() => setPhoneCopied(false), 2000);
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-blue-700/70 bg-[#0d2244] hover:bg-[#122a52] px-3 py-1.5 text-xs font-semibold text-white transition active:scale-95"
                        >
                          {phoneCopied ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-emerald-300">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 text-slate-300" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <a
                          href={`https://wa.me/917603930445?text=${encodeURIComponent(
                            "Hello P. Siva Sir, contacting you regarding Teacher Resource Hub."
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-950/40 transition active:scale-95"
                        >
                          <MessageCircle className="h-3.5 w-3.5 fill-white" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Portal Description */}
                  <div className="mt-4 w-full rounded-xl border border-blue-950/80 bg-[#081326]/80 p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#38bdf8]">
                      <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
                      <span>Teacher Resource Hub • Cloud Repository Portal</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                      Dedicated digital learning and teaching resource infrastructure designed to facilitate seamless
                      curriculum file sharing, offline study material delivery, and institutional governance across schools.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
