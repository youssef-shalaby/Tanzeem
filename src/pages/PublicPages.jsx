import { Link, useLocation } from "react-router";
import { ArrowRight, Check, CircleX, Target } from "lucide-react";
import {
  AccentBadge,
  CheckList,
  FeatureBullet,
  PageFrame,
  PublicNav,
  ScreenshotCard,
  TealIcon,
} from "../components/PublicPageLayout";
import {
  aboutAnalyticsImage,
  capabilityCards,
  featureRows,
  landingDashboardImage,
  valueCards,
} from "../data/publicPageData";

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-black">
      <div className="relative min-h-screen">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute bottom-[-240px] left-1/2 h-[760px] w-[1220px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#d8fff5_0%,#c6fff2_34%,#caedf6_62%,transparent_72%)] blur-[30px]" />
          <div className="absolute inset-x-0 bottom-0 h-[390px] bg-gradient-to-r from-[#d7f7ff] via-[#ddfff3] to-[#c8ffdf]" />
        </div>
        <PublicNav />
        <section className="relative z-10 mx-auto flex max-w-[1180px] flex-col items-center px-6 pt-20 text-center">
          <h1 className="max-w-[840px] text-[56px] font-bold leading-[1.18] tracking-normal text-black md:text-[76px]">
            Stock Smarter,
            <br />
            Not Harder
          </h1>
          <p className="mt-10 max-w-[800px] text-[22px] leading-[1.6] tracking-normal text-black">
            Tanzeem keeps every item at your fingertips, streamlines your workflow, and helps your business stay ahead before problems even appear.
          </p>
          <Link
            to="/signup"
            className="mt-8 rounded-full bg-[#f8f8f8] px-9 py-4 text-[18px] font-semibold text-black shadow-sm transition hover:bg-white"
          >
            Try Tanzeem for free
          </Link>
          <div className="relative mt-9 w-full max-w-[1040px]">
            <div className="overflow-hidden rounded-[32px] border-[8px] border-[#2b2828]/80 bg-[#f6f8fa] shadow-[0_5px_19px_rgba(0,0,0,0.08)]">
              <img src={landingDashboardImage} alt="Tanzeem dashboard preview" className="w-full object-cover" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export function AboutPage() {
  return (
    <PageFrame>
      <section className="grid items-center gap-12 pt-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <AccentBadge>Our Story</AccentBadge>
          <h1 className="mt-10 max-w-[580px] text-[48px] font-bold leading-[1.25] text-[#101828] md:text-[60px]">
            Organizing
            <br />
            the World’s <span className="text-[#15aaad]">Inventory</span>
          </h1>
          <p className="mt-8 max-w-[520px] text-[20px] leading-[1.62] text-[#4a5565]">
            Tanzeem was born out of a simple observation: modern businesses are moving faster than ever, but their inventory systems are stuck in the past. We built a platform that combines designer-grade aesthetics with powerful, intuitive logistics.
          </p>
          <div className="mt-12 grid max-w-[480px] grid-cols-2 gap-8">
            <div>
              <p className="text-4xl font-bold text-[#101828]">500k+</p>
              <p className="mt-2 text-base text-[#6a7282]">Items Managed Daily</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-[#101828]">99.9%</p>
              <p className="mt-2 text-base text-[#6a7282]">Stock Accuracy</p>
            </div>
          </div>
        </div>

        <div className="relative min-h-[540px]">
          <ScreenshotCard src={aboutAnalyticsImage} alt="Tanzeem analytics preview" className="absolute right-0 top-8 w-full max-w-[610px] rotate-3" />
          <div className="absolute bottom-0 left-0 w-[192px] rounded-2xl border border-white/80 bg-white/90 p-6 shadow-[0_20px_25px_rgba(0,0,0,0.1)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#15aaad]/10 text-[#15aaad]">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-base font-bold text-[#101828]">Mission Driven</h2>
            <p className="mt-1 text-xs leading-4 text-[#6a7282]">Empowering local & global businesses.</p>
          </div>
        </div>
      </section>

      <section className="pt-24 text-center">
        <h2 className="text-4xl font-bold text-[#101828]">Our Core Values</h2>
        <p className="mt-4 text-base text-[#6a7282]">These principles guide every feature we build and every update we ship.</p>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {valueCards.map((card) => (
            <article key={card.title} className="rounded-[24px] border border-white bg-white/50 p-8 text-left shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#15aaad]/10 text-[#15aaad]">
                <card.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-[#101828]">{card.title}</h3>
              <p className="mt-3 text-base leading-[1.6] text-[#4a5565]">{card.copy}</p>
            </article>
          ))}
        </div>
      </section>
    </PageFrame>
  );
}

export function FeaturesPage() {
  return (
    <PageFrame>
      <section className="pt-8 text-center">
        <h1 className="text-[44px] font-extrabold leading-tight text-[#1e2a32] md:text-[60px]">
          Everything You Need to <span className="text-[#15aaad]">Scale</span>
        </h1>
        <p className="mx-auto mt-5 max-w-[740px] text-[20px] leading-[1.6] text-[#4a5565]">
          From smart tracking to advanced analytics, Tanzeem provides a complete toolkit designed for modern inventory management teams.
        </p>
      </section>

      <section className="mt-24 space-y-28">
        {featureRows.map((row) => (
          <div key={row.title} className={`grid items-center gap-14 lg:grid-cols-2 ${row.reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
            <div>
              <TealIcon icon={<row.icon className="h-7 w-7" />} />
              <h2 className="mt-8 text-4xl font-bold text-[#101828]">{row.title}</h2>
              <p className="mt-5 max-w-[500px] text-lg leading-[1.62] text-[#4a5565]">{row.copy}</p>
              <div className="mt-8 space-y-4">
                {row.bullets.map((bullet) => (
                  <FeatureBullet key={bullet}>{bullet}</FeatureBullet>
                ))}
              </div>
            </div>
            <ScreenshotCard src={row.image} alt={`${row.title} preview`} className="max-w-[520px]" />
          </div>
        ))}
      </section>

      <section className="mt-28 overflow-hidden rounded-[48px] bg-[#1e2a32] px-8 py-20 text-white md:px-20">
        <div className="grid gap-10 md:grid-cols-4">
          {capabilityCards.map((card) => (
            <article key={card.title}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <card.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold">{card.title}</h3>
              <p className="mt-2 text-sm text-[#99a1af]">{card.copy}</p>
            </article>
          ))}
        </div>
        <div className="mx-auto mt-20 max-w-[880px] border-t border-white/10 pt-14 text-center">
          <h2 className="text-3xl font-bold">Ready to transform your warehouse?</h2>
          <Link to="/signup" className="mt-8 inline-flex rounded-2xl bg-[#15aaad] px-8 py-4 font-bold text-white shadow-[0_20px_25px_rgba(21,170,173,0.2)]">
            Get Started Now
          </Link>
        </div>
      </section>
    </PageFrame>
  );
}

const pricingPlans = [
  {
    name: "Free subscription",
    price: "0LE",
    note: "Free Plan",
    tags: ["Solo Designers", "Small Teams"],
    button: "Start free 30-day trial",
    buttonClass: "bg-[#15aaad] text-white",
    includes: ["Basic inventory management", "Add and manage items", "Track stock levels"],
    excludes: ["Custom integrations", "Enterprise-level support", "Dedicated onboarding"],
  },
  {
    name: "Pro Plan",
    price: "999LE",
    note: "Paid Yearly",
    tags: ["Business Plan"],
    banner: "Save 500LE",
    button: "Buy now",
    buttonClass: "bg-black text-white",
    includes: ["Unlimited users", "API access", "Custom workflows", "Dedicated support manager", "On-site onboarding"],
  },
];

export function PricingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#212123]">
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(21,170,173,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(21,170,173,0.06)_1px,transparent_1px)] bg-[size:96px_96px] opacity-70" />
        <PublicNav />
        <section className="relative z-10 mx-auto max-w-[980px] px-6 pb-16 pt-12 text-center">
          <h1 className="text-[52px] font-medium leading-tight text-[#0c0d0e]">Plans and Pricing</h1>
          <p className="mx-auto mt-4 max-w-[365px] text-base leading-6 text-[#667085]">
            Receive unlimited credits when you pay yearly, and save on your plan.
          </p>

          <div className="mt-14 grid gap-3 md:grid-cols-2">
            {pricingPlans.map((plan) => (
              <article key={plan.name} className="relative min-h-[670px] border border-[#15aaad] bg-white p-8 text-left shadow-[0_4px_7px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.08)]">
                {plan.banner && (
                  <div className="absolute -top-9 left-0 right-0 flex h-9 items-center justify-center rounded bg-black/5 text-sm font-medium">
                    Save <span className="ml-1 font-semibold text-[#15aaad]">500LE</span>
                    <span className="ml-4 h-3 w-3 rounded-full bg-[#15aaad] shadow-[0_0_0_4px_rgba(0,0,0,0.08)]" />
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {plan.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-black/10 px-2 py-1 text-[11px] font-semibold uppercase text-black/70">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="mt-5 text-[22px] font-semibold text-[#212123]">{plan.name}</h2>
                <p className="mt-4 text-[40px] font-bold tracking-normal text-[#212123]">{plan.price}</p>
                <p className="mt-2 text-[15px] text-[#212123]">{plan.note}</p>
                <div className="my-6 h-px bg-black/10" />
                <p className="mb-4 text-[15px] font-semibold">Includes:</p>
                <CheckList items={plan.includes} />
                {plan.excludes && (
                  <>
                    <p className="mb-4 mt-6 text-[15px] font-semibold">Not included in this plan:</p>
                    <div className="space-y-3">
                      {plan.excludes.map((item) => (
                        <div key={item} className="flex items-center gap-3 text-sm text-[#5c5c5c]">
                          <CircleX className="h-[22px] w-[22px] text-[#8f8f8f]" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <Link
                  to={plan.name === "Pro Plan" ? "/payment" : "/signup"}
                  className={`absolute bottom-9 left-8 right-8 flex h-11 items-center justify-center rounded-md text-[15px] font-semibold shadow-sm ${plan.buttonClass}`}
                >
                  {plan.button}
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export function PaymentPage() {
  return (
    <PageFrame>
      <section className="mx-auto max-w-5xl pt-10">
        <div className="text-center">
          <h1 className="text-[52px] font-medium text-[#0c0d0e]">Payment</h1>
          <p className="mx-auto mt-4 max-w-[460px] text-base leading-6 text-[#667085]">Finish your setup with a billing method for your Tanzeem workspace.</p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <form className="border border-[#15aaad]/40 bg-white p-8">
            <h2 className="text-2xl font-semibold">Billing details</h2>
            <div className="mt-6 grid gap-5">
              {["Cardholder Name", "Card Number", "Expiry Date", "CVC"].map((label) => (
                <label key={label} className="block">
                  <span className="mb-2 block text-sm font-medium">{label}</span>
                  <input className="w-full rounded-md border border-black/10 px-4 py-3 outline-none focus:border-[#15aaad]" />
                </label>
              ))}
            </div>
            <Link to="/signup" className="mt-8 flex h-11 items-center justify-center rounded-md bg-black font-semibold text-white">
              Continue to signup
            </Link>
          </form>
          <aside className="border border-[#15aaad]/40 bg-white p-8">
            <h2 className="text-xl font-semibold">Pro Plan</h2>
            <p className="mt-4 text-4xl font-bold">999LE</p>
            <p className="mt-2 text-sm text-[#667085]">Paid Yearly</p>
            <div className="mt-8">
              <CheckList items={["Unlimited users", "API access", "Custom workflows", "Dedicated support manager"]} />
            </div>
          </aside>
        </div>
      </section>
    </PageFrame>
  );
}

export function WelcomePage() {
  const location = useLocation();
  const name = location.state?.name || "there";

  return (
    <PageFrame>
      <section className="grid min-h-[740px] items-center gap-14 pt-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <AccentBadge>Welcome</AccentBadge>
          <h1 className="mt-8 max-w-[620px] text-[52px] font-bold leading-[1.15] text-[#101828] md:text-[68px]">
            Welcome, <span className="text-[#15aaad]">{name}</span>
          </h1>
          <p className="mt-7 max-w-[560px] text-xl leading-[1.65] text-[#4a5565]">
            Your Tanzeem workspace is ready. Start from the dashboard, review your branch setup, and keep every item moving with clarity.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-2xl bg-[#15aaad] px-7 py-4 font-bold text-white shadow-[0_20px_25px_rgba(21,170,173,0.2)]">
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/settings" className="inline-flex rounded-2xl border border-[#cad0d9] bg-white px-7 py-4 font-semibold text-[#2e3238]">
              Review settings
            </Link>
          </div>
        </div>
        <div className="rounded-[48px] bg-[#1e2a32] p-10 text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
          <h2 className="text-3xl font-bold">Next steps</h2>
          <div className="mt-8 grid gap-5">
            {["Review your company profile", "Add or import products", "Invite managers and staff", "Tune alert thresholds"].map((item) => (
              <div key={item} className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#15aaad]">
                  <Check className="h-4 w-4" />
                </span>
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
