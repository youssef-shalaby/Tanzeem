import { Link } from "react-router";

const steps = [
  "Sign up your account",
  "Tell us about your company",
  "Set up your first branch",
];

const AUTH_FONT = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .auth-root { font-family: 'DM Sans', sans-serif; }
`;

// Named export for AuthLayout
// showSteps: pass false on pages that aren't multi-step (e.g. SigninPage)
export function AuthLayout({ activeStep = 1, showSteps = true, children, logo }) {
  return (
    <main className="auth-root min-h-screen">
      <style>{AUTH_FONT}</style>
      <div className="flex min-h-screen flex-col lg:flex-row">

        {/* Left panel (gradient) */}
        <section className="min-h-[360px] flex-1 p-3 lg:min-h-screen">
          <div className="relative flex h-full min-h-[360px] overflow-hidden rounded-[32px] bg-[linear-gradient(142deg,#0f8c5a_0%,#111614_100%)] p-9 text-white lg:p-12">
            <div className="absolute -left-36 top-24 h-[720px] w-[720px] rounded-full border border-white/10" />
            <div className="absolute -bottom-44 right-0 h-[520px] w-[520px] rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10 flex w-full flex-col justify-between">
              {logo || (
                <Link to="/" className="inline-flex items-center gap-3">
                  <svg width="34" height="32" viewBox="0 0 47 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M36.0427 19.4379C36.0427 18.789 36.3807 18.187 36.9348 17.8492C38.1746 17.0934 39.7638 17.9858 39.7638 19.4379V23.2598C39.7638 23.9087 39.4257 24.5107 38.8716 24.8485C37.6318 25.6043 36.0427 24.7119 36.0427 23.2598V19.4379Z" fill="white" fillOpacity="0.9"/>
                  </svg>
                  <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#fff", letterSpacing: "-0.2px" }}>
                    Tanzeem
                  </span>
                </Link>
              )}

              <div className="max-w-[520px]">
                {showSteps ? (
                  <>
                    <div className="mb-5 grid gap-5 sm:grid-cols-[1fr_220px] sm:items-end xl:mb-8">
                      <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-4xl font-medium leading-tight md:text-[40px]">
                        Get Started with Us
                      </h1>
                      <p className="text-lg leading-7 text-white/80">Complete these easy steps to register your account.</p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {steps.map((step, index) => {
                        const stepNumber = index + 1;
                        const isActive   = stepNumber === activeStep;
                        const isComplete = stepNumber < activeStep;
                        return (
                          <div
                            key={step}
                            className={`rounded-2xl p-4 backdrop-blur xl:p-5 ${
                              isActive
                                ? "border border-white/30 bg-white text-[#1a1a18] shadow-md"
                                : "bg-white/10 text-white/70"
                            }`}
                          >
                            <div
                              className={`mb-4 flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium xl:mb-6 ${
                                isActive   ? "bg-[#0f8c5a] text-white" :
                                isComplete ? "bg-[#0f8c5a]/25 text-[#0f8c5a]" :
                                             "bg-white/15 text-white"
                              }`}
                            >
                              {isComplete ? "✓" : stepNumber}
                            </div>
                            <p className="text-sm leading-6">{step}</p>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div>
                    <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-4xl font-medium leading-tight md:text-[40px]">
                      Welcome back
                    </h1>
                    <p className="mt-4 text-lg leading-7 text-white/80">Sign in to your Tanzeem workspace.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Right panel — matches landing page background */}
        <section className="flex w-full items-center justify-center bg-[#f9faf7] px-6 py-10 lg:w-[628px] lg:px-20 lg:py-10 xl:px-24 xl:py-16">
          <div className="w-full max-w-[436px]">{children}</div>
        </section>
      </div>
    </main>
  );
}

// Optional: if you need these, keep them as named exports too
export function AuthHeader({ title, copy }) {
  return (
    <div className="mb-8 text-center xl:mb-10">
      <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-[28px] font-medium leading-10 text-[#1a1a18]">
        {title}
      </h2>
      <p className="mt-2 text-base leading-6 text-[#4b4b4b]">{copy}</p>
    </div>
  );
}

export function AuthInput({ label, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2.5 block text-base font-medium leading-6 text-[#1a1a18]">{label}</span>
      <input
        className="w-full rounded-xl bg-[#f5f5f5] px-5 py-3.5 text-base leading-6 text-[#1a1a18] outline-none transition placeholder:text-[#6b6b6b] focus:bg-white focus:ring-2 focus:ring-[#0f8c5a]/25 xl:py-4"
        {...props}
      />
    </label>
  );
}

export function AuthButton({ children, className = "", ...props }) {
  return (
    <button
      className={`w-full rounded-xl bg-[#0f8c5a] p-4 text-base font-semibold leading-6 text-white transition hover:bg-[#0a6b45] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}