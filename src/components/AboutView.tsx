import React, { useState } from "react";
import {
  GraduationCap,
  BookOpen,
  Phone,
  Copy,
  Check,
  Building2,
  ShieldCheck,
  MessageCircle,
  ArrowLeft,
  ExternalLink,
  Mail,
  Sparkles,
  PhoneCall,
} from "lucide-react";

interface AboutViewProps {
  onBack?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onBack }) => {
  const [copied, setCopied] = useState(false);

  const phoneNumber = "7603930445";
  const whatsappUrl = `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(
    "Hello P. Siva Sir, contacting you regarding the Teacher Resource Hub platform."
  )}`;

  const handleCopyPhone = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(phoneNumber);
      } else {
        // Fallback for older contexts / iframe constraints
        const textArea = document.createElement("textarea");
        textArea.value = phoneNumber;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy phone number:", err);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] rounded-3xl bg-[#050b14] px-4 py-10 sm:px-6 sm:py-16 text-white overflow-hidden shadow-2xl border border-slate-800/80">
      {/* Ambient background glow matching screenshot */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-20 pointer-events-none" />
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-80 h-80 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top back navigation button if onBack provided */}
      {onBack && (
        <div className="relative z-10 max-w-2xl mx-auto mb-6">
          <button
            id="btn-about-back"
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700/70 bg-slate-900/60 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Workspace</span>
          </button>
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-2xl flex flex-col items-center text-center">
        {/* Glowing Academic Emblem */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 to-amber-500 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition duration-500 pointer-events-none" />
          <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-amber-400 text-slate-950 shadow-2xl shadow-amber-500/50 ring-4 ring-amber-300/30 transition-transform duration-300 hover:scale-105">
            <GraduationCap className="h-10 w-10 sm:h-12 sm:w-12 stroke-[2.2]" />
          </div>
        </div>

        {/* Serif Display Title */}
        <h1 className="mt-6 font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#facc15] drop-shadow-sm">
          App Developer Info
        </h1>

        {/* Main Developer Info Card */}
        <div className="mt-8 w-full rounded-2xl sm:rounded-3xl border border-sky-950/80 bg-[#0b1528]/95 p-6 sm:p-8 shadow-2xl shadow-black/60 backdrop-blur-xl text-left transition-all">
          {/* Section Header Tag */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-[#38bdf8] uppercase">
              DEVELOPED BY
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-950/80 border border-blue-800/50 px-2.5 py-0.5 text-[10px] font-semibold text-sky-300">
              <Sparkles className="h-3 w-3 text-amber-400" />
              Creator & Lead Architect
            </span>
          </div>

          {/* Profile Section */}
          <div className="mt-4 flex items-start gap-4 sm:gap-5">
            {/* Book/Education Icon Badge */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-700/60 bg-[#0d1e38] text-sky-400 shadow-inner">
              <BookOpen className="h-7 w-7 stroke-[1.8]" />
            </div>

            {/* Profile Bio Details */}
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                P. SIVA
              </h2>

              <p className="mt-1 text-xs sm:text-sm font-bold text-[#f59e0b] tracking-wide">
                M.Sc., B.Ed., M.Phil., MCA.
              </p>

              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-300">
                PG Computer Science Teacher
              </p>

              <div className="mt-2.5 flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#fcd34d]">
                <Building2 className="h-4 w-4 text-[#f59e0b] shrink-0" />
                <span>Govt Hr Sec School, Pannaipuram</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-slate-800/90" />

          {/* Contact / Phone Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* Phone Icon Box */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-[#12233f] text-amber-400 shadow-inner">
                <Phone className="h-5 w-5" />
              </div>

              <div>
                <span className="block text-[10px] font-mono font-bold tracking-widest text-[#38bdf8] uppercase">
                  CELL NO
                </span>
                <a
                  href={`tel:${phoneNumber}`}
                  className="text-lg sm:text-xl font-bold font-mono text-white tracking-wider hover:text-amber-400 transition"
                  title="Click to call"
                >
                  {phoneNumber}
                </a>
              </div>
            </div>

            {/* Action Buttons: Copy & WhatsApp */}
            <div className="flex items-center gap-2.5 sm:self-center">
              {/* Copy Button */}
              <button
                id="btn-copy-dev-phone"
                type="button"
                onClick={handleCopyPhone}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-700/70 bg-[#0d2244] hover:bg-[#122a52] px-4 py-2 text-xs font-semibold text-white shadow-xs transition active:scale-95"
                title="Copy phone number"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-300 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-slate-300" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {/* WhatsApp Button */}
              <a
                id="btn-whatsapp-dev"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-[#059669] hover:bg-[#047857] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 transition active:scale-95"
                title="Open WhatsApp chat"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Banner Card */}
        <div className="mt-6 w-full rounded-2xl border border-blue-950/80 bg-[#081326]/80 p-4 sm:p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-[#38bdf8]">
            <ShieldCheck className="h-4 w-4 text-sky-400 shrink-0" />
            <span>Teacher Resource Hub • Cloud Repository Portal</span>
          </div>

          <p className="mt-2 text-center text-[11px] sm:text-xs text-slate-400 leading-relaxed max-w-xl mx-auto">
            Dedicated digital learning and teaching resource infrastructure designed to facilitate seamless
            curriculum file sharing, offline study material delivery, and institutional governance across schools.
          </p>
        </div>
      </div>
    </div>
  );
};
