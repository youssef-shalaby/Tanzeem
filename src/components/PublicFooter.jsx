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
    <footer className="public-root relative z-10 border-t border-[rgba(30,50,30,0.08)] bg-[#f9faf7] text-[#1a1a18]">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-12">
        <div className="flex items-center">
          <img src={Logo} alt="Tanzeem" className="h-auto w-[108px]" />
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-[#555]">
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
