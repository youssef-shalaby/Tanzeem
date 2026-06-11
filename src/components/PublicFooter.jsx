import { Link } from "react-router";
import Logo from "../assets/TanzeemGreen.svg";

const footerLinks = [
  { label: "About", to: "/about" },
  { label: "Features", to: "/features" },
  { label: "Pricing", to: "/pricing" },
  { label: "Sign in", to: "/signin" },
];

export function PublicFooter() {
  return (
    <footer className="public-root relative z-10 border-t border-[rgba(30,50,30,0.08)] bg-white/75 text-[#1a1a18] backdrop-blur">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-12">
        <div className="flex flex-col gap-2">
          <img src={Logo} alt="Tanzeem" className="h-auto w-[108px]" />
          <span className="text-sm text-[#66736d]">Inventory work, kept orderly.</span>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#555]">
          {footerLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="transition-colors hover:text-[#0f8c5a]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <p className="text-sm text-[#777]">
          © {new Date().getFullYear()} Tanzeem
        </p>
      </div>
    </footer>
  );
}
