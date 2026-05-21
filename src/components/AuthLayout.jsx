import { Link } from "react-router";

const steps = [
  "Sign up your account",
  "Tell us about your company",
  "Set up your first branch",
];

export function AuthLayout({ activeStep = 1, children }) {
  return (
    <main className="min-h-screen bg-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <section className="min-h-[360px] flex-1 p-3 lg:min-h-screen">
          <div className="relative flex h-full min-h-[360px] overflow-hidden rounded-[32px] bg-[linear-gradient(142deg,#15aaad_0%,#000_100%)] p-9 text-white lg:p-12">
            <div className="absolute -left-36 top-24 h-[720px] w-[720px] rounded-full border border-white/10" />
            <div className="absolute -bottom-44 right-0 h-[520px] w-[520px] rounded-full bg-white/10 blur-3xl" />
            <div className="relative z-10 flex w-full flex-col justify-between">
              <Link to="/" className="inline-flex">
                <img src="/logo.svg" alt="Tanzeem" className="h-10 w-auto" />
              </Link>
              <div className="max-w-[520px]">
                <div className="mb-5 grid gap-5 sm:grid-cols-[1fr_220px] sm:items-end xl:mb-8">
                  <h1 className="text-4xl font-medium leading-tight md:text-[40px]">Get Started with Us</h1>
                  <p className="text-lg leading-7 text-white/80">Complete these easy steps to register your account.</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-3">
                  {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === activeStep;
                    const isComplete = stepNumber < activeStep;
                    return (
                      <div
                        key={step}
                        className={`rounded-2xl p-4 backdrop-blur xl:p-5 ${
                          isActive
                            ? "border border-white/30 bg-white text-[#111]"
                            : "bg-white/12 text-white/80"
                        }`}
                      >
                        <div
                          className={`mb-4 flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium xl:mb-6 ${
                            isActive ? "bg-black text-white" : "bg-white/16 text-white"
                          }`}
                        >
                          {isComplete ? "✓" : stepNumber}
                        </div>
                        <p className="text-sm leading-6">{step}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="flex w-full items-center justify-center px-6 py-10 lg:w-[628px] lg:px-20 lg:py-10 xl:px-24 xl:py-16">
          <div className="w-full max-w-[436px]">{children}</div>
        </section>
      </div>
    </main>
  );
}

export function AuthHeader({ title, copy }) {
  return (
    <div className="mb-8 text-center xl:mb-10">
      <h2 className="text-[28px] font-medium leading-10 text-[#111]">{title}</h2>
      <p className="mt-2 text-base leading-6 text-[#4b4b4b]">{copy}</p>
    </div>
  );
}

export function AuthInput({ label, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2.5 block text-base font-medium leading-6 text-[#111]">{label}</span>
      <input
        className="w-full rounded-xl bg-[#f5f5f5] px-5 py-3.5 text-base leading-6 text-[#111] outline-none transition placeholder:text-[#6b6b6b] focus:bg-white focus:ring-2 focus:ring-[#15aaad]/35 xl:py-4"
        {...props}
      />
    </label>
  );
}

export function AuthButton({ children, className = "", ...props }) {
  return (
    <button
      className={`w-full rounded-xl bg-[#111] p-4 text-base font-semibold leading-6 text-white transition hover:bg-[#252525] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
