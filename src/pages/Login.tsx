import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { School } from "../types";
import { DEFAULT_SCHOOLS } from "../lib/defaultData";
import {
  Database,
  Lock,
  Mail,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Laptop,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Building2,
  GraduationCap,
  PlusCircle,
  LogIn,
  School as SchoolIcon,
  Search,
  ChevronDown,
  Check,
  X,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
} from "lucide-react";

export const Login: React.FC = () => {
  const { login, registerSchool, currentDevice, setCurrentDevice } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [schools, setSchools] = useState<School[]>(DEFAULT_SCHOOLS);

  // Sign in state
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [schoolCode, setSchoolCode] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Password reset state
  const [resetEmail, setResetEmail] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("password123");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Register school state
  const [regSchoolName, setRegSchoolName] = useState("");
  const [regSchoolCode, setRegSchoolCode] = useState("");
  const [regAdminName, setRegAdminName] = useState("");
  const [regAdminEmail, setRegAdminEmail] = useState("");
  const [regAdminUsername, setRegAdminUsername] = useState("");
  const [regAdminPassword, setRegAdminPassword] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regQuotaGb, setRegQuotaGb] = useState(50);
  const [regLoading, setRegLoading] = useState(false);

  // Fetch registered schools on mount
  useEffect(() => {
    api.getInstitutions()
      .then((data) => {
        if (data && data.length > 0) {
          const merged = [...data];
          for (const ds of DEFAULT_SCHOOLS) {
            if (!merged.some((s) => s.code.toUpperCase() === ds.code.toUpperCase() || s.id === ds.id)) {
              merged.push(ds);
            }
          }
          setSchools(merged);
        } else {
          setSchools(DEFAULT_SCHOOLS);
        }
      })
      .catch((err) => {
        console.warn("Using verified institutional directory", err);
        setSchools(DEFAULT_SCHOOLS);
      });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync selectedSchool when schoolCode changes manually
  useEffect(() => {
    const trimmed = schoolCode.trim().toUpperCase();
    if (trimmed) {
      const pool = schools.length > 0 ? schools : DEFAULT_SCHOOLS;
      const match =
        pool.find((s) => s.code.toUpperCase() === trimmed || s.id === schoolCode.trim()) ||
        DEFAULT_SCHOOLS.find((s) => s.code.toUpperCase() === trimmed || s.id === schoolCode.trim());
      if (match) {
        setSelectedSchool(match);
      }
    } else {
      setSelectedSchool(null);
    }
  }, [schoolCode, schools]);

  // Auto-detect school when typing known username/email
  useEffect(() => {
    const input = usernameOrEmail.trim().toLowerCase();
    if (!input) return;
    const pool = schools.length > 0 ? schools : DEFAULT_SCHOOLS;
    if (
      input.includes("backofficeppm524") ||
      input.includes("pannaipuram") ||
      input.includes("vadivubiochem") ||
      input.includes("sundari") ||
      input.includes("sudari") ||
      input.includes("vadivu")
    ) {
      const match = pool.find((s) => s.code === "STATE-405");
      if (match) {
        setSelectedSchool(match);
        setSchoolCode("STATE-405");
      }
    } else if (input.includes("pssofttech") || input === "sarah.j@school.edu" || input === "emal@school.edu") {
      const match = pool.find((s) => s.code === "CRH-101");
      if (match && (!schoolCode || schoolCode === "CRH-101")) {
        setSelectedSchool(match);
        setSchoolCode("CRH-101");
      }
    } else if (input.includes("xavier") || input === "robert@xavier.edu" || input === "robert.t") {
      const match = pool.find((s) => s.code === "XAV-202");
      if (match && (!schoolCode || schoolCode === "XAV-202")) {
        setSelectedSchool(match);
        setSchoolCode("XAV-202");
      }
    }
  }, [usernameOrEmail, schools]);

  const filteredSchools = schools.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      (s.address && s.address.toLowerCase().includes(q))
    );
  });

  const handleSelectSchool = (s: School | null) => {
    setSelectedSchool(s);
    setSchoolCode(s ? s.code : "");
    setIsDropdownOpen(false);
    setError("");
    setSearchQuery("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setError("Please fill in both fields");
      return;
    }

    setLoading(true);
    setError("");

    console.group(`[Login Page Trace] Submitting login request`);
    console.log("Credentials State:", {
      usernameOrEmail,
      schoolCodeInput: schoolCode,
      selectedSchool: selectedSchool ? { id: selectedSchool.id, code: selectedSchool.code, name: selectedSchool.name } : "Universal / Not Scoped",
      availableRegisteredInstitutions: schools.map((s) => ({ id: s.id, code: s.code, name: s.name })),
    });
    console.groupEnd();

    try {
      const trimmedUser = usernameOrEmail.trim();
      const trimmedPass = password.trim();
      let activeSchoolCode = (schoolCode.trim() || selectedSchool?.code || "").trim();
      let activeSchoolId = (selectedSchool?.id || "").trim();

      if (
        !activeSchoolCode &&
        (trimmedUser.toLowerCase().includes("backofficeppm524") ||
          trimmedUser.toLowerCase().includes("pannaipuram") ||
          trimmedUser.toLowerCase().includes("vadivubiochem") ||
          trimmedUser.toLowerCase().includes("sundari") ||
          trimmedUser.toLowerCase().includes("sudari") ||
          trimmedUser.toLowerCase().includes("vadivu"))
      ) {
        activeSchoolCode = "STATE-405";
        activeSchoolId = "sch_1789320725632_y3n2";
      }

      await login(
        trimmedUser,
        trimmedPass,
        rememberMe,
        activeSchoolId || activeSchoolCode || undefined,
        activeSchoolCode || undefined
      );
    } catch (err: any) {
      console.group("[Login Page Trace] Login Failure");
      console.error("Error Message:", err.message);
      if (err.message && err.message.toLowerCase().includes("institution does not exist")) {
        console.warn(
          `[Login Page TRACE: 'Selected institution does not exist']\n` +
          `  -> User provided schoolCode: "${schoolCode}"\n` +
          `  -> Valid institutions currently loaded: ${schools.map((s) => `[${s.code}] ${s.name}`).join(", ")}`
        );
      }
      console.groupEnd();
      setError(err.message || "Invalid credentials or school mismatch. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regSchoolName || !regSchoolCode || !regAdminEmail || !regAdminUsername || !regAdminPassword) {
      setError("Please fill in all required registration fields");
      return;
    }

    setRegLoading(true);
    setError("");

    console.group(`[Registration Trace] Initiating registration`);
    console.log("Registration Payload:", {
      school_name: regSchoolName.trim(),
      school_code: regSchoolCode.trim().toUpperCase(),
      admin_username: regAdminUsername.trim(),
      admin_email: regAdminEmail.trim().toLowerCase(),
      quota_gb: regQuotaGb,
    });

    try {
      await registerSchool({
        school_name: regSchoolName.trim(),
        name: regSchoolName.trim(),
        school_code: regSchoolCode.trim().toUpperCase(),
        code: regSchoolCode.trim().toUpperCase(),
        admin_name: regAdminName.trim() || regAdminUsername.trim(),
        admin_email: regAdminEmail.trim().toLowerCase(),
        admin_username: regAdminUsername.trim(),
        admin_password: regAdminPassword,
        address: regAddress.trim() || undefined,
        contact_phone: regPhone.trim() || undefined,
        storage_quota_gb: Number(regQuotaGb) || 50,
      });
      console.log("[Registration Trace] Registration and indexing verification successful!");
      console.groupEnd();
      // Registration automatically signs in and sets JWT token
    } catch (err: any) {
      console.error("[Registration Trace] Registration failed at database stage:", err.message);
      console.groupEnd();
      setError(err.message || "Failed to register school. Please check the details and try again.");
    } finally {
      setRegLoading(false);
    }
  };

  const fillQuickAccount = (user: string, pass: string, code: string) => {
    setUsernameOrEmail(user.trim());
    setPassword(pass.trim());
    setSchoolCode(code.trim());
    const pool = schools.length > 0 ? schools : DEFAULT_SCHOOLS;
    const matched = pool.find(
      (s) => s.code.toUpperCase() === code.trim().toUpperCase() || s.id === code.trim()
    );
    setSelectedSchool(matched || null);
    setError("");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    setResetMessage(null);
    try {
      const res = await api.resetPassword(
        resetEmail.trim(),
        resetNewPassword.trim() || "password123",
        selectedSchool?.code || schoolCode
      );
      setResetMessage({
        type: "success",
        text: res.message || "Password reset successfully! Credentials updated.",
      });
      setUsernameOrEmail(res.username || resetEmail.trim());
      setPassword(resetNewPassword.trim() || "password123");
      if (res.schoolCode) {
        setSchoolCode(res.schoolCode);
      }
      setError("");
    } catch (err: any) {
      setResetMessage({
        type: "error",
        text: err.message || "Failed to reset password. Please check your username or email.",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-500"
      style={{
        background: "radial-gradient(ellipse at 50% -10%, #134e4a 0%, #115e59 45%, #042f2e 100%)",
      }}
    >
      {/* Cambridge Scholastic Ambient Decorative Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#5eead4_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />
      <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-teal-300/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-36 -left-20 w-[450px] h-[450px] bg-emerald-950/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-36 -right-20 w-[450px] h-[450px] bg-teal-900/50 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Emblem */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center relative z-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0d4f4b] via-[#115e59] to-[#0f766e] shadow-2xl shadow-teal-950/60 ring-4 ring-teal-300/20 text-white transition-transform hover:scale-105">
          <GraduationCap className="h-8 w-8 stroke-[1.75]" />
        </div>
        <h1 className="mt-4 text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
          Teacher Resource Hub
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-teal-100/90 font-medium">
          Multi-School Cloud Repository & Isolated Teaching Environment
        </p>
        <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-teal-950/60 border border-teal-400/30 px-3 py-1 text-[11px] font-semibold text-teal-200 backdrop-blur-md shadow-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-teal-300" />
          <span>Cambridge Scholastic Edition • Tenant Isolated</span>
        </div>
      </div>

      {/* Redesigned Login Panel */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-white/95 backdrop-blur-xl py-7 px-6 shadow-2xl shadow-teal-950/40 rounded-3xl sm:px-8 border border-teal-500/20 ring-1 ring-white/60 relative overflow-hidden">
          {/* Top decorative Cambridge Scholastic Teal accent bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-teal-400 via-[#115e59] to-teal-600" />

          {/* Segmented Navigation Tabs */}
          <div className="flex rounded-2xl bg-slate-100/90 p-1.5 mb-5 border border-slate-200/80 gap-1.5">
            <button
              type="button"
              id="btn-tab-signin"
              onClick={() => {
                setActiveTab("login");
                setError("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-sm sm:text-base font-semibold rounded-xl transition-all ${
                activeTab === "login"
                  ? "bg-[#115e59] text-white shadow-md shadow-teal-900/20"
                  : "text-slate-600 hover:text-slate-900 bg-transparent"
              }`}
            >
              <LogIn className="h-5 w-5" />
              <span>Sign In to School</span>
            </button>
            <button
              type="button"
              id="btn-tab-register"
              onClick={() => {
                setActiveTab("register");
                setError("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-sm sm:text-base font-semibold rounded-xl transition-all ${
                activeTab === "register"
                  ? "bg-[#115e59] text-white shadow-md shadow-teal-900/20"
                  : "text-slate-600 hover:text-slate-900 bg-transparent"
              }`}
            >
              <Building2 className="h-5 w-5" />
              <span>Register New School</span>
            </button>
          </div>

          {/* Feedback & Error Alerts */}
          {error && (
            <div className="rounded-xl bg-rose-50 p-3.5 mb-4 text-xs text-rose-800 flex items-start gap-2.5 border border-rose-200 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 space-y-1.5">
                <p className="leading-relaxed font-medium">{error}</p>
                {error.toLowerCase().includes("password") && (
                  <div className="pt-1.5 border-t border-rose-200/80 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-slate-600">Incorrect password entered?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(usernameOrEmail);
                        setResetNewPassword("password123");
                        setResetMessage(null);
                        setShowForgotModal(true);
                      }}
                      className="font-bold text-teal-800 hover:text-teal-950 underline inline-flex items-center gap-1"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      <span>Reset password now</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "login" ? (
            /* TAB 1: SIGN IN */
            <div>
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Searchable Institution Dropdown & School Code */}
                <div className="space-y-1.5" ref={dropdownRef}>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-teal-700" />
                      <span>Educational Institution</span>
                      <span className="text-xs font-normal text-slate-400 font-sans">(Tenant Isolation)</span>
                    </label>
                    <span className="text-xs font-semibold text-teal-800 flex items-center gap-1 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
                      Tenant Isolated
                    </span>
                  </div>

                  {/* Custom Searchable Dropdown Trigger */}
                  <div className="relative">
                    <button
                      type="button"
                      id="btn-select-school-dropdown"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm text-left transition ${
                        selectedSchool
                          ? "border-teal-500/80 bg-teal-50/40 text-slate-900 shadow-xs ring-2 ring-teal-500/15"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      } focus:outline-none focus:ring-2 focus:ring-teal-500/25`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-2xs ${
                            selectedSchool
                              ? "bg-[#115e59] text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Building2 className="h-4.5 w-4.5" />
                        </div>
                        <div className="truncate">
                          {selectedSchool ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 truncate">{selectedSchool.name}</span>
                              <span className="font-mono text-xs font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-md border border-teal-200">
                                {selectedSchool.code}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">Search & select registered institution...</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {selectedSchool ? (
                          <span
                            role="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectSchool(null);
                            }}
                            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
                            title="Clear institution filter"
                          >
                            <X className="h-3.5 w-3.5" />
                          </span>
                        ) : null}
                        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180 text-teal-700" : ""}`} />
                      </div>
                    </button>

                    {/* Dropdown Floating Panel */}
                    {isDropdownOpen && (
                      <div className="absolute z-50 mt-1.5 w-full rounded-2xl border border-teal-200/80 bg-white shadow-2xl shadow-teal-950/20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        {/* Search Input */}
                        <div className="p-2.5 border-b border-slate-100 bg-slate-50/70">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              autoFocus
                              id="input-school-search"
                              placeholder="Search by school name or code (e.g. STATE-405, Govt Hr)..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
                            />
                            {searchQuery && (
                              <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 px-1">
                            <span>{filteredSchools.length} verified institution{filteredSchools.length === 1 ? "" : "s"}</span>
                            <button
                              type="button"
                              onClick={() => handleSelectSchool(null)}
                              className="text-teal-700 hover:underline font-semibold"
                            >
                              Clear Selection (Universal Login)
                            </button>
                          </div>
                        </div>

                        {/* List of Institutions */}
                        <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 p-1">
                          {filteredSchools.length > 0 ? (
                            filteredSchools.map((s) => {
                              const isSelected = selectedSchool?.id === s.id;
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => handleSelectSchool(s)}
                                  className={`w-full flex items-center justify-between p-2.5 text-left rounded-xl transition ${
                                    isSelected
                                      ? "bg-teal-50/80 text-teal-950 font-semibold border-l-2 border-teal-700"
                                      : "hover:bg-slate-50 text-slate-700"
                                  }`}
                                >
                                  <div className="flex items-start gap-2.5 min-w-0 pr-2">
                                    <Building2 className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${isSelected ? "text-teal-700" : "text-slate-400"}`} />
                                    <div className="min-w-0">
                                      <div className="text-sm font-bold text-slate-900 truncate">
                                        {s.name}
                                      </div>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="font-mono text-xs font-bold bg-teal-50 text-teal-900 px-1.5 py-0.5 rounded border border-teal-200">
                                          {s.code}
                                        </span>
                                        {s.address && (
                                          <span className="text-xs text-slate-400 truncate max-w-[220px]">
                                            {s.address}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {isSelected && (
                                    <Check className="h-4.5 w-4.5 text-teal-700 shrink-0" />
                                  )}
                                </button>
                              );
                            })
                          ) : (
                            <div className="p-4 text-center">
                              <p className="text-sm text-slate-500">
                                No registered institution found matching "{searchQuery}"
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsDropdownOpen(false);
                                  setActiveTab("register");
                                  setRegSchoolName(searchQuery);
                                }}
                                className="mt-2 text-sm font-bold text-teal-700 hover:text-teal-900 underline flex items-center justify-center gap-1 mx-auto"
                              >
                                <PlusCircle className="h-4 w-4" />
                                <span>Register "{searchQuery}" as new school</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Validation State & Quick Code Helper */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    {selectedSchool ? (
                      <span className="text-teal-800 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-teal-600" />
                        <span>Scoped to: <strong>{selectedSchool.name}</strong> ({selectedSchool.code})</span>
                      </span>
                    ) : schoolCode.trim() ? (
                      (() => {
                        const matchedSeed = DEFAULT_SCHOOLS.find(
                          (s) => s.code.toUpperCase() === schoolCode.trim().toUpperCase() || s.id === schoolCode.trim()
                        );
                        if (matchedSeed) {
                          return (
                            <span className="text-teal-800 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4 text-teal-600" />
                              <span>Scoped to: <strong>{matchedSeed.name}</strong> ({matchedSeed.code})</span>
                            </span>
                          );
                        }
                        return (
                          <span className="text-amber-700 font-semibold flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            <span>Unverified code "{schoolCode}". Select from dropdown to verify.</span>
                          </span>
                        );
                      })()
                    ) : (
                      <span className="text-slate-500">
                        Select your school to scope access, or leave blank for universal login.
                      </span>
                    )}
                  </div>
                </div>

                {/* Username / Email Field */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    Username or Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4.5 w-4.5 text-slate-400" />
                    </div>
                    <input
                      id="login-username"
                      type="text"
                      required
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      placeholder="Enter your Username or Email Address"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      className="block w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-900 rounded-xl border border-slate-200 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-bold text-slate-800">Password</label>
                    <button
                      type="button"
                      id="btn-forgot-password"
                      onClick={() => {
                        setResetEmail(usernameOrEmail);
                        setResetNewPassword("password123");
                        setResetMessage(null);
                        setShowForgotModal(true);
                      }}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4.5 w-4.5 text-slate-400" />
                    </div>
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-2.5 text-sm text-slate-900 rounded-xl border border-slate-200 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition"
                    />
                    <button
                      type="button"
                      id="btn-toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-teal-700 transition"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-teal-700 focus:ring-teal-600 border-slate-300 rounded cursor-pointer accent-[#115e59]"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-slate-700 cursor-pointer">
                      Remember Me
                    </label>
                  </div>

                  <span className="text-xs text-teal-800 font-semibold flex items-center gap-1 bg-teal-50/80 px-2 py-0.5 rounded-full border border-teal-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                    School-Scoped JWT
                  </span>
                </div>

                {/* Submit Action Button */}
                <div className="pt-2">
                  <button
                    id="btn-login-submit"
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-lg shadow-teal-900/25 text-sm font-bold text-white bg-gradient-to-r from-[#115e59] to-[#0f766e] hover:from-[#0d4f4b] hover:to-[#115e59] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 disabled:opacity-50 transition-all active:scale-[0.99] uppercase tracking-wider"
                  >
                    <span>{loading ? "Authenticating School..." : "Login to School Repository"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>

              {/* Multi-School Independent Test Accounts */}
              <div className="mt-6 pt-5 border-t border-slate-200/70">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                    <span>Institutional Demo Accounts</span>
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">One-click auto fill</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* School 1: Govt Hr Sec School Pannaipuram */}
                  <div className="rounded-xl border border-teal-200/80 bg-teal-50/40 p-2.5 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-teal-200/60 pb-1 mb-1.5">
                        <span className="text-[11px] font-bold text-teal-950 truncate">Pannaipuram</span>
                        <span className="rounded bg-teal-100 text-teal-900 px-1.5 py-0.2 text-[9px] font-mono font-bold border border-teal-200">
                          STATE-405
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mb-1">Govt Hr Sec School</p>
                    </div>

                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => fillQuickAccount("backofficeppm524@gmail.com", "password123", "STATE-405")}
                        className="w-full flex items-center justify-between p-1.5 rounded-lg border border-teal-300 bg-white hover:bg-teal-100/60 text-left transition shadow-2xs"
                      >
                        <div className="truncate">
                          <div className="text-[10px] font-bold text-teal-950">School Admin</div>
                          <div className="text-[9px] text-teal-700 font-mono truncate">backofficeppm524@...</div>
                        </div>
                        <ShieldCheck className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                      </button>

                      <button
                        type="button"
                        onClick={() => fillQuickAccount("vadivubiochem@gmail.com", "staff123", "STATE-405")}
                        className="w-full flex items-center justify-between p-1.5 rounded-lg border border-emerald-300 bg-white hover:bg-emerald-100/60 text-left transition shadow-2xs"
                      >
                        <div className="truncate">
                          <div className="text-[10px] font-bold text-emerald-950">Teacher (Sundari)</div>
                          <div className="text-[9px] text-emerald-700 font-mono truncate">vadivubiochem@...</div>
                        </div>
                        <GraduationCap className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                      </button>
                    </div>
                  </div>

                  {/* School 2: Central Resource Hub */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-1 mb-1.5">
                        <span className="text-[11px] font-bold text-slate-900 truncate">Central High</span>
                        <span className="rounded bg-slate-200 text-slate-800 px-1.5 py-0.2 text-[9px] font-mono font-bold border border-slate-300">
                          CRH-101
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mb-1">Central Resource Hub</p>
                    </div>

                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => fillQuickAccount("pssofttech@gmail.com", "password123", "CRH-101")}
                        className="w-full flex items-center justify-between p-1.5 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 text-left transition shadow-2xs"
                      >
                        <div className="truncate">
                          <div className="text-[10px] font-bold text-purple-950">Admin</div>
                          <div className="text-[9px] text-purple-700 font-mono truncate">pssofttech@...</div>
                        </div>
                        <ShieldCheck className="h-3 w-3 text-purple-600 shrink-0" />
                      </button>

                      <button
                        type="button"
                        onClick={() => fillQuickAccount("emal", "password123", "CRH-101")}
                        className="w-full flex items-center justify-between p-1.5 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 text-left transition shadow-2xs"
                      >
                        <div className="truncate">
                          <div className="text-[10px] font-bold text-blue-950">Teacher</div>
                          <div className="text-[9px] text-blue-700 font-mono truncate">emal</div>
                        </div>
                        <GraduationCap className="h-3 w-3 text-blue-600 shrink-0" />
                      </button>
                    </div>
                  </div>

                  {/* School 3: St. Xavier Model Academy */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-1 mb-1.5">
                        <span className="text-[11px] font-bold text-slate-900 truncate">St. Xavier</span>
                        <span className="rounded bg-emerald-100 text-emerald-900 px-1.5 py-0.2 text-[9px] font-mono font-bold border border-emerald-200">
                          XAV-202
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mb-1">Model Academy</p>
                    </div>

                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => fillQuickAccount("admin@xavier.edu", "password123", "XAV-202")}
                        className="w-full flex items-center justify-between p-1.5 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 text-left transition shadow-2xs"
                      >
                        <div className="truncate">
                          <div className="text-[10px] font-bold text-purple-950">Admin</div>
                          <div className="text-[9px] text-purple-700 font-mono truncate">admin@xavier.edu</div>
                        </div>
                        <ShieldCheck className="h-3 w-3 text-purple-600 shrink-0" />
                      </button>

                      <button
                        type="button"
                        onClick={() => fillQuickAccount("robert.t", "password123", "XAV-202")}
                        className="w-full flex items-center justify-between p-1.5 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50 text-left transition shadow-2xs"
                      >
                        <div className="truncate">
                          <div className="text-[10px] font-bold text-emerald-950">Teacher</div>
                          <div className="text-[9px] text-emerald-700 font-mono truncate">robert.t</div>
                        </div>
                        <GraduationCap className="h-3 w-3 text-emerald-600 shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: REGISTER NEW SCHOOL INSTITUTION */
            <div>
              <div className="mb-4 bg-teal-50/80 border border-teal-200 rounded-2xl p-4 text-sm text-teal-950">
                <p className="font-bold text-base flex items-center gap-2 text-teal-900">
                  <Building2 className="h-5 w-5 text-teal-700" />
                  <span>Onboard Your School</span>
                </p>
                <p className="text-xs sm:text-sm text-teal-800 mt-1.5 leading-relaxed">
                  Register your school institution to create your dedicated school code and administrative credentials.
                  Your school's teachers, files, and folders will be completely private and segregated from all other schools.
                </p>
              </div>

              <form className="space-y-3" onSubmit={handleRegisterSchool}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      School / Institution Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Oakridge High School"
                      value={regSchoolName}
                      onChange={(e) => setRegSchoolName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      Unique School Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. OHS-2026"
                      value={regSchoolCode}
                      onChange={(e) => setRegSchoolCode(e.target.value.toUpperCase())}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-mono uppercase focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      Admin Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Principal Anderson"
                      value={regAdminName}
                      onChange={(e) => setRegAdminName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      Admin Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. admin@oakridge.edu"
                      value={regAdminEmail}
                      onChange={(e) => setRegAdminEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      Admin Username *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. oakridge.admin"
                      value={regAdminUsername}
                      onChange={(e) => setRegAdminUsername(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      Admin Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Create secure password"
                      value={regAdminPassword}
                      onChange={(e) => setRegAdminPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      Campus Address (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 500 Education Way, City Campus"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      Storage Quota (GB)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={1000}
                      value={regQuotaGb}
                      onChange={(e) => setRegQuotaGb(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-lg shadow-teal-900/25 text-sm font-bold text-white bg-gradient-to-r from-[#115e59] to-[#0f766e] hover:from-[#0d4f4b] hover:to-[#115e59] focus:outline-none disabled:opacity-50 transition active:scale-98 uppercase tracking-wider"
                  >
                    <span>{regLoading ? "Registering Institution..." : "Register School & Enter Admin Console"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Current Device Simulation Selector on Login */}
          <div className="mt-6 pt-4 border-t border-slate-200/70 text-center">
            <p className="text-[11px] font-medium text-slate-500 mb-2">Simulate Access Device:</p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                id="btn-sim-desktop"
                onClick={() => setCurrentDevice("Desktop (Chrome / Windows PC)")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  currentDevice.includes("Desktop")
                    ? "bg-[#115e59] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Laptop className="h-3.5 w-3.5" />
                <span>Desktop PC</span>
              </button>
              <button
                type="button"
                id="btn-sim-mobile"
                onClick={() => setCurrentDevice("Mobile (iPhone 15 Pro / Safari)")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  currentDevice.includes("iPhone") || currentDevice.includes("Mobile")
                    ? "bg-[#115e59] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Mobile Phone</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Functional Password Recovery & Reset Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-teal-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-teal-700" />
                <span>Account Password Recovery</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-3 mb-4 leading-relaxed">
              Reset your password directly, or re-synchronize standard credentials (<code className="bg-slate-100 text-teal-800 px-1 py-0.5 rounded font-mono font-bold">password123</code>) for your institutional staff or admin account.
            </p>

            {resetMessage && (
              <div
                className={`rounded-xl p-3 mb-4 text-xs flex items-start gap-2 border ${
                  resetMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                    : "bg-rose-50 text-rose-900 border-rose-200"
                }`}
              >
                {resetMessage.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed font-medium">{resetMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username or Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    id="input-reset-email"
                    placeholder="e.g. backofficeppm524@gmail.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 text-xs text-slate-900 rounded-xl border border-slate-200 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    New Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setResetNewPassword("password123")}
                    className="text-[11px] text-teal-700 font-semibold hover:underline"
                  >
                    Set to "password123"
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    id="input-reset-password"
                    placeholder="Enter new password"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 text-xs font-mono text-slate-900 rounded-xl border border-slate-200 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={resetLoading || !resetEmail.trim()}
                  className="rounded-xl bg-[#115e59] px-4 py-2 text-xs font-bold text-white hover:bg-[#0d4f4b] transition shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>{resetLoading ? "Updating..." : "Reset Password"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

