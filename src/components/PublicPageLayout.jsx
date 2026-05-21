import { Link, useLocation } from "react-router";
import { Check } from "lucide-react";

const navItems = [
  { label: "About", to: "/about" },
  { label: "Features", to: "/features" },
  { label: "Pricing", to: "/pricing" },
];

export function MarketingShell({ children, className = "" }) {
  return (
    <main className={`min-h-screen overflow-hidden bg-white text-[#101828] ${className}`}>
      {children}
    </main>
  );
}

export function SoftBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-[460px] top-[220px] h-[1100px] w-[1100px] rounded-full border border-[#15aaad]/10" />
      <div className="absolute right-[-260px] top-[150px] h-[920px] w-[920px] rounded-full border border-[#15aaad]/10" />
      <div className="absolute bottom-[-160px] left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-[#15aaad]/10 blur-[120px]" />
    </div>
  );
}

export function PublicNav() {
  const location = useLocation();

  return (
    <header className="relative z-20 px-6 py-8 md:px-8">
      <div className="mx-auto flex max-w-[1376px] items-center justify-between gap-6">
        <Link to="/" className="flex items-center">
          <img src="/logo.svg" alt="Tanzeem" className="h-[35px] w-auto" />
        </Link>

        <nav className="hidden items-center gap-[62px] text-[17px] font-medium tracking-normal text-black lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={location.pathname === item.to ? "text-black" : "text-black transition hover:text-[#15aaad]"}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/signin"
            className="hidden rounded-[15px] border border-[#cad0d9] bg-white px-[18px] py-[9px] text-[18px] font-medium text-[#2e3238] sm:block"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-[15px] border border-[#505967] bg-[#1e2a32] px-[18px] py-[10px] text-[18px] font-medium text-[#f3f4f6] shadow-[0_1px_0_rgba(80,89,103,0.3)]"
          >
            Start for free
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PageFrame({ children, gray = true }) {
  return (
    <MarketingShell className={gray ? "bg-[#f6f8fa]" : "bg-white"}>
      <div className="relative min-h-screen">
        <SoftBackground />
        <PublicNav />
        <div className="relative z-10 mx-auto max-w-[1320px] px-6 pb-16 pt-10 md:px-12">{children}</div>
      </div>
    </MarketingShell>
  );
}

export function AccentBadge({ children }) {
  return (
    <span className="inline-flex rounded-full bg-[#15aaad]/10 px-3 py-1 text-sm font-semibold uppercase tracking-[0.04em] text-[#15aaad]">
      {children}
    </span>
  );
}

export function TealIcon({ icon }) {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#15aaad] text-white shadow-[0_10px_18px_rgba(21,170,173,0.28)]">
      {icon}
    </div>
  );
}

export function FeatureBullet({ children }) {
  return (
    <div className="flex items-center gap-3 text-base font-medium text-[#364153]">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#dcfce7]">
        <span className="h-2 w-2 rounded-full bg-[#00c950]" />
      </span>
      {children}
    </div>
  );
}

export function ScreenshotCard({ src, alt, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-b from-[#15aaad]/10 to-[#10637d]/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      </div>
    </div>
  );
}

export function CheckList({ items, muted = false }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item} className={`flex items-center gap-3 text-sm ${muted ? "text-[#5c5c5c]" : "text-[#212123]"}`}>
          <span className={`flex h-[22px] w-[22px] items-center justify-center rounded-full ${muted ? "bg-[#8f8f8f]" : "bg-[#15aaad]"} text-white`}>
            <Check className="h-3.5 w-3.5" />
          </span>
          {item}
        </div>
      ))}
    </div>
  );
}
