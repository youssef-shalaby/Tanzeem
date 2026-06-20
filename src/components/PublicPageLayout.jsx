import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Check, Menu, X } from "lucide-react";
import Logo from "../assets/TanzeemGreen.svg";

const navItems = [
  { label: "About", to: "/about" },
  { label: "Features", to: "/features" },
  { label: "Pricing", to: "/pricing" },
];

/* ─── Shared logo — SVG mark + DM Serif wordmark ─────────────── */
const TanzeemNavLogo = () => (
  <Link
    to="/"
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      textDecoration: "none",
    }}
  >
    <img
      src={Logo}
      alt="Tanzeem"
      style={{
        width: "110px",
        height: "auto",
        display: "block",
      }}
    />
  </Link>
);

/* ─── Nav ────────────────────────────────────────────────────── */
export function PublicNav() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="relative z-20 border-b border-[rgba(30,50,30,0.08)] bg-[#fbfcfa]/88 px-6 py-4 backdrop-blur-md md:px-8">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-6">
        <TanzeemNavLogo />

        <nav className="hidden items-center gap-1 rounded-full border border-[rgba(30,50,30,0.08)] bg-white/70 p-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-full px-4 py-2 text-[14px] font-semibold transition-colors ${
                location.pathname === item.to
                  ? "bg-[#eaf5ee] text-[#0a6b45]"
                  : "text-[#66736d] hover:bg-[#f5f7f4] hover:text-[#1a1a18]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(26,26,24,0.14)] text-[#1a1a18] transition hover:border-[#0f8c5a] hover:text-[#0f8c5a] lg:hidden"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((current) => !current)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link
            to="/signin"
            className="db-secondary-btn hidden sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-[#0f8c5a] px-[18px] py-2 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(15,140,90,.22)] transition hover:-translate-y-0.5 hover:bg-[#0a6b45]"
          >
            Get started
          </Link>
        </div>
      </div>
      {isOpen && (
        <nav className="mx-auto mt-4 grid max-w-[1320px] gap-2 rounded-2xl border border-[rgba(30,50,30,0.08)] bg-white p-2 shadow-sm lg:hidden">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                location.pathname === item.to
                  ? "bg-[#eaf5ee] text-[#0a6b45]"
                  : "text-[#565f59] hover:bg-[#f5f6f3] hover:text-[#1a1a18]"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/signin"
            onClick={() => setIsOpen(false)}
            className="rounded-xl px-4 py-3 text-sm font-medium text-[#565f59] hover:bg-[#f5f6f3] hover:text-[#1a1a18] sm:hidden"
          >
            Sign in
          </Link>
        </nav>
      )}
    </header>
  );
}

/* ─── Feature bullet ─────────────────────────────────────────── */
export function FeatureBullet({ children }) {
  return (
    <div className="flex items-center gap-3 text-base font-medium text-[#364153]">
      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#0f8c5a]/15">
        <span className="h-2 w-2 rounded-full bg-[#0f8c5a]" />
      </span>
      {children}
    </div>
  );
}

/* ─── Screenshot card ────────────────────────────────────────── */
export function ScreenshotCard({ src, alt, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-b from-[#0f8c5a]/8 to-[#0f8c5a]/4 blur-3xl" />
      <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      </div>
    </div>
  );
}

/* ─── Check list ─────────────────────────────────────────────── */
export function CheckList({ items, muted = false }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item}
          className={`flex items-center gap-3 text-sm ${muted ? "text-[#5c5c5c]" : "text-[#212123]"}`}
        >
          <span
            className={`flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full ${
              muted ? "bg-[#8f8f8f]" : "bg-[#0f8c5a]"
            } text-white`}
          >
            <Check className="h-3.5 w-3.5" />
          </span>
          {item}
        </div>
      ))}
    </div>
  );
}
