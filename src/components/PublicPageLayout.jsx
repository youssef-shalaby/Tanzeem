import { Link, useLocation } from "react-router";
import { Check } from "lucide-react";
import Logo from "../assets/TanzeemGreen.svg";

const navItems = [
  { label: "About", to: "/about" },
  { label: "Features", to: "/features" },
  { label: "Pricing", to: "/pricing" },
];

/* ─── Shell ──────────────────────────────────────────────────── */
export function MarketingShell({ children, className = "" }) {
  return (
    <main
      className={`min-h-screen overflow-hidden bg-[#f9faf7] text-[#1a1a18] ${className}`}
    >
      {children}
    </main>
  );
}

/* ─── Ambient background ─────────────────────────────────────── */
export function SoftBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-[#c8f5e0]/40 blur-[140px]" />
      <div className="absolute right-0 top-20 h-[500px] w-[500px] rounded-full bg-[#d4ede0]/30 blur-[120px]" />
      <div className="absolute bottom-[-80px] left-0 h-[400px] w-[700px] rounded-full bg-[#d0e8d8]/25 blur-[100px]" />
    </div>
  );
}

/* ─── Shared logo — SVG mark + DM Serif wordmark ─────────────── */
export const TanzeemNavLogo = () => (
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

  return (
    <header className="relative z-20 border-b border-[rgba(30,50,30,0.08)] bg-[#f9faf7]/80 px-6 py-5 backdrop-blur-md md:px-8">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-6">
        <TanzeemNavLogo />

        <nav className="hidden items-center gap-10 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`text-[15px] font-medium transition-colors ${
                location.pathname === item.to
                  ? "text-[#1a1a18]"
                  : "text-[#6b6b6b] hover:text-[#1a1a18]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            to="/signin"
            className="hidden rounded-full border border-[rgba(26,26,24,0.2)] px-[18px] py-2 text-[14px] font-medium text-[#1a1a18] transition-colors hover:border-[#0f8c5a] hover:text-[#0f8c5a] sm:block"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-[#1a1a18] px-[18px] py-2 text-[14px] font-medium text-[#f0faf5] transition-colors hover:bg-[#0f8c5a]"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─── Inner page frame ───────────────────────────────────────── */
export function PageFrame({ children, gray = true }) {
  return (
    <MarketingShell className={gray ? "bg-[#f9faf7]" : "bg-white"}>
      <div className="relative min-h-screen">
        <SoftBackground />
        <PublicNav />
        <div className="relative z-10 mx-auto max-w-[1320px] px-6 pb-20 pt-12 md:px-12">
          {children}
        </div>
      </div>
    </MarketingShell>
  );
}

/* ─── Accent badge (no teal) ─────────────────────────────────── */
export function AccentBadge({ children }) {
  return (
    <span className="inline-flex rounded-full border border-[#d4ead9] bg-[#eaf5ee] px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.06em] text-[#0a6b45]">
      {children}
    </span>
  );
}

/* ─── Icon container (green, not teal) ──────────────────────── */
export function TealIcon({ icon }) {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0f8c5a]/10 text-[#0f8c5a]">
      {icon}
    </div>
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
