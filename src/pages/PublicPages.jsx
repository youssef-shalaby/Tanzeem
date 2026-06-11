import { Link, useLocation } from "react-router";
import {
  ArrowRight,
  Zap,
  Bell,
  BarChart2,
} from "lucide-react";
import { PublicFooter } from "../components/PublicFooter";
import { useAuth } from "../contexts/AuthContext";
import {
  CheckList,
  FeatureBullet,
  PublicNav,
  ScreenshotCard,
} from "../components/PublicPageLayout";
import {
  aboutAnalyticsImage,
  featureRows,
  valueCards,
} from "../data/publicPageData";

// ============================
// Shared design system styles (green accent)
// ============================
const PUBLIC_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .public-root { font-family: 'DM Sans', sans-serif; }
  .public-btn-primary {
    background: #0f8c5a; color: white; border: none;
    border-radius: 100px; padding: 14px 28px; font-size: 15px; font-weight: 500;
    display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
    transition: background .2s, transform .15s;
    text-decoration: none;
    box-shadow: 0 14px 34px rgba(15,140,90,.22), inset 0 1px 0 rgba(255,255,255,.18);
  }
  .public-btn-primary:hover { background: #0a6b45; transform: translateY(-1px); }
  .public-btn-secondary {
    background: rgba(255,255,255,.68); border: 1px solid rgba(26,26,24,.16); color: #343a36;
    border-radius: 100px; padding: 14px 28px; font-size: 15px; font-weight: 500;
    display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
    transition: background .15s, border-color .15s, color .15s, transform .15s; text-decoration: none;
  }
  .public-btn-secondary:hover { background: #fff; border-color: rgba(15,140,90,.28); color: #0a6b45; transform: translateY(-1px); }
  .public-card {
    background: #fff; border: 1px solid rgba(0,0,0,.08); border-radius: 16px;
    padding: 20px; transition: box-shadow .2s;
  }
  .public-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,.05); }
  .db-section-title { font-family: 'DM Serif Display', serif; font-size: 44px; font-weight: 600; color: #1a1a18; letter-spacing: 0; }
  @media (max-width: 768px) { .db-section-title { font-size: 32px; } }

  /* Shared hero classes — defined here so all pages have them without relying on LandingPage rendering first */
  .hero-h1 { font-family:'DM Serif Display',serif; font-size:68px; line-height:1.08; letter-spacing:0; color:#1a1a18; max-width:640px; animation:fadeSlideDown .55s .05s ease both; }
  .hero-h1 em { font-style:italic; color:#0f8c5a; }
  .hero-p { margin-top:22px; max-width:520px; font-size:17px; line-height:1.65; color:#555; font-weight:300; animation:fadeSlideDown .55s .1s ease both; }

  /* Shared section heading — use instead of raw Tailwind text-4xl on About / Features */
  .section-title { font-family:'DM Serif Display',serif; font-size:40px; line-height:1.12; letter-spacing:0; color:#1a1a18; font-weight:400; }
  .section-subtitle { font-size:17px; line-height:1.65; color:#555; font-weight:300; margin-top:16px; }
  .public-wash-panel {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(15,140,90,.12);
    border-radius: 28px;
    background:
      linear-gradient(135deg, rgba(15,140,90,.085), rgba(255,255,255,0) 58%),
      rgba(255,255,255,.82);
    box-shadow: 0 22px 60px rgba(15,23,42,.07);
  }
  .public-wash-panel::after {
    content:"";
    position:absolute;
    right:28px;
    bottom:0;
    width:180px;
    height:3px;
    border-radius:999px;
    background:linear-gradient(90deg,rgba(15,140,90,0),rgba(15,140,90,.34));
  }
  .public-wash-panel > * { position:relative; z-index:1; }
  .public-step-card {
    background: rgba(255,255,255,.78);
    border: 1px solid rgba(15,140,90,.12);
    border-radius: 16px;
    padding: 18px;
    box-shadow: 0 8px 26px rgba(15,23,42,.04);
  }

  @keyframes fadeSlideDown { from{opacity:0;transform:translateY(-14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeSlideUp   { from{opacity:0;transform:translateY(20px)}  to{opacity:1;transform:translateY(0)} }
`;

// Reusable component for injecting styles
export function PublicStyle() {
  return <style>{PUBLIC_STYLES}</style>;
}

export function LandingPage() {
  const stockItems = [
    {
      initials: "PR",
      name: "Printer Cartridge",
      sku: "SKU-0042",
      qty: 240,
      status: "In stock",
      iconClass: "si-green",
      statusClass: "ss-ok",
    },
    {
      initials: "KB",
      name: "Wireless Keyboard",
      sku: "SKU-0089",
      qty: 12,
      status: "Low stock",
      iconClass: "si-amber",
      statusClass: "ss-low",
    },
    {
      initials: "MN",
      name: 'Monitor 24"',
      sku: "SKU-0117",
      qty: 0,
      status: "Out",
      iconClass: "si-red",
      statusClass: "ss-out",
    },
  ];
  const bars = [45, 62, 38, 71, 55, 88, 67];
  const barDays = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <main
      className="public-root"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#f9faf7",
        color: "#1a1a18",
        minHeight: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <PublicStyle />
      <style>{`
        .lp-blob-1{position:absolute;bottom:-110px;left:0;right:0;margin:auto;width:min(900px,100%);height:500px;background:radial-gradient(ellipse,#c8f5e0 0%,#d4f0e8 55%,transparent 82%);filter:blur(44px);opacity:.58;pointer-events:none;}
        .lp-blob-2{position:absolute;top:-80px;right:0;width:min(420px,72vw);height:420px;background:radial-gradient(circle,#e0faf0 0%,transparent 70%);filter:blur(54px);opacity:.42;pointer-events:none;}
        .dashboard-wrap{animation:fadeSlideUp .65s .2s ease both;}
        .dashboard-card{background:#fff;border-radius:20px;border:1px solid rgba(0,0,0,.1);box-shadow:0 2px 40px rgba(0,0,0,.08);overflow:hidden;}
        .dash-sidebar-icon{width:30px;height:30px;border-radius:8px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.5);font-size:14px;cursor:pointer;}
        .dash-sidebar-icon.active{background:#0f8c5a;color:#fff;}
        .metric-badge{display:inline-flex;align-items:center;font-size:9px;font-weight:500;padding:2px 6px;border-radius:100px;margin-top:3px;}
        .badge-green{background:#d6f5e8;color:#0a6b45;}
        .badge-red{background:#fde8e8;color:#9b1c1c;}
        .bar{flex:1;border-radius:4px 4px 0 0;background:#e0f5ec;}
        .bar.highlight{background:#0f8c5a;}
        .stock-icon{width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;}
        .si-green{background:#c8f5e0;color:#0a6b45;}
        .si-amber{background:#fef3c7;color:#8b5e00;}
        .si-red{background:#fde8e8;color:#9b1c1c;}
        .stock-status{font-size:9px;padding:2px 7px;border-radius:100px;font-weight:500;}
        .ss-ok{background:#d6f5e8;color:#0a6b45;}
        .ss-low{background:#fef3c7;color:#8b5e00;}
        .ss-out{background:#fde8e8;color:#9b1c1c;}
        .feature-card{background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:8px;padding:20px;}
        .feature-icon{width:36px;height:36px;background:#d6f5e8;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:17px;color:#0f8c5a;margin-bottom:14px;}
        @media (max-width: 860px){
          .landing-dashboard-main{height:auto !important;}
          .landing-metrics{grid-template-columns:repeat(2,1fr) !important;}
          .landing-dashboard-grid{grid-template-columns:1fr !important;}
          .landing-features{grid-template-columns:1fr !important;}
        }
        @media (max-width: 560px){
          .hero-h1{font-size:48px !important;}
          .hero-p{font-size:16px !important;}
          .landing-metrics{grid-template-columns:1fr !important;}
          .dashboard-wrap{padding:0 14px !important;}
        }
      `}</style>

      <div className="lp-blob-1" />
      <div className="lp-blob-2" />

      <PublicNav />

      <section
        style={{
          position: "relative",
          zIndex: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "52px 24px 0",
        }}
      >
        <h1 className="hero-h1">
          Stock Smarter,
          <br />
          <em>Not Harder</em>
        </h1>
        <p className="hero-p">
          Tanzeem keeps every item at your fingertips, streamlines your
          workflow, and helps your business stay ahead before problems even
          appear.
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 36,
            animation: "fadeSlideDown .55s .15s ease both",
          }}
        >
          <Link to="/signup" className="public-btn-primary">
            Get started free <span>→</span>
          </Link>
        </div>
      </section>

      <div
        className="dashboard-wrap"
        style={{
          position: "relative",
          zIndex: 5,
          width: "100%",
          maxWidth: 920,
          margin: "36px auto 0",
          padding: "0 24px",
        }}
      >
        <div className="dashboard-card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 16px",
              background: "#f5f6f3",
              borderBottom: "1px solid rgba(0,0,0,.07)",
            }}
          >
            {[["#ff5f57"], ["#febc2e"], ["#28c840"]].map(([bg], i) => (
              <div
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: bg,
                }}
              />
            ))}
            <div
              style={{
                flex: 1,
                background: "rgba(0,0,0,.05)",
                borderRadius: 6,
                height: 24,
                margin: "0 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                color: "#888",
                fontFamily: "monospace",
              }}
            >
              tanzeem.runasp.net/dashboard
            </div>
          </div>

          <div className="landing-dashboard-main" style={{ display: "flex", height: 340 }}>
            <div
              style={{
                width: 52,
                background: "#111614",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "14px 0",
                gap: 18,
              }}
            >
              <svg
                width="22"
                height="20"
                viewBox="0 0 47 44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginBottom: 2 }}
              >
                <path
                  d="M36.0427 19.4379C36.0427 18.789 36.3807 18.187 36.9348 17.8492C38.1746 17.0934 39.7638 17.9858 39.7638 19.4379V23.2598C39.7638 23.9087 39.4257 24.5107 38.8716 24.8485C37.6318 25.6043 36.0427 24.7119 36.0427 23.2598V19.4379ZM10.9007 13.5712C10.9007 14.1284 10.449 14.5802 9.89182 14.5802H3.64233C3.46185 14.5802 3.31091 14.6494 3.18294 14.781C3.05496 14.9161 2.99262 15.0788 2.99262 15.2693C2.99262 15.4563 3.05496 15.6191 3.18294 15.7542C3.31091 15.8858 3.46185 15.955 3.64233 15.955H9.91548C10.4596 15.955 10.9007 16.3961 10.9007 16.9403C10.9007 17.4844 10.4596 17.9256 9.91548 17.9256H5.7982C5.621 17.9256 5.46678 17.9913 5.3388 18.1264C5.21083 18.2615 5.14848 18.4208 5.14848 18.6113C5.14848 18.8017 5.21083 18.961 5.3388 19.0961C5.46678 19.2312 5.621 19.297 5.7982 19.297H9.91548C10.4596 19.297 10.9007 19.7381 10.9007 20.2822C10.9007 20.8264 10.4596 21.2675 9.91548 21.2675H3.02215C2.84167 21.2675 2.68745 21.3333 2.56276 21.4683C2.43478 21.6034 2.37244 21.7662 2.37244 21.9532C2.37244 22.1437 2.43478 22.3064 2.56276 22.4415C2.68745 22.5731 2.84167 22.6423 3.02215 22.6423H9.91721C10.4604 22.6423 10.9007 23.0827 10.9007 23.6259C10.9007 24.1691 10.4604 24.6094 9.91721 24.6094H5.7982C5.621 24.6094 5.46678 24.6787 5.3388 24.8103C5.21083 24.9453 5.14848 25.1081 5.14848 25.2951C5.14848 25.4856 5.21083 25.6484 5.3388 25.7834C5.46678 25.915 5.621 25.9843 5.7982 25.9843H9.91721C10.4604 25.9843 10.9007 26.4246 10.9007 26.9678C10.9007 27.511 10.4604 27.9513 9.91721 27.9513H3.64233C3.46185 27.9513 3.31091 28.0206 3.18294 28.1557C3.05496 28.2873 2.99262 28.45 2.99262 28.6405C2.99262 28.8275 3.05496 28.9903 3.18294 29.1253C3.31091 29.2604 3.46185 29.3262 3.64233 29.3262H8.5966C9.86914 29.3262 10.9007 30.3578 10.9007 31.6303C10.9007 32.434 11.3195 33.1796 12.0058 33.5979L19.9016 38.41L24.2704 41.0714C26.016 42.1348 28.2527 40.8783 28.2527 38.8344V23.8193C28.2527 22.9056 27.7765 22.0578 26.9962 21.5824L12.4346 12.7097C11.7623 12.3 10.9007 12.7839 10.9007 13.5712Z"
                  fill="#0F8C5A"
                />
              </svg>
              {[true, false, false, false, false].map((active, i) => (
                <div
                  key={i}
                  className={`dash-sidebar-icon${active ? " active" : ""}`}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      background: "currentColor",
                      opacity: active ? 1 : 0.4,
                    }}
                  />
                </div>
              ))}
            </div>

            <div
              style={{
                flex: 1,
                background: "#f9faf7",
                padding: 16,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a18" }}>
                    Overview
                  </div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                    Last 30 days
                  </div>
                </div>
                <button
                  style={{
                    background: "#1a1a18",
                    color: "#fff",
                    border: "none",
                    borderRadius: 100,
                    padding: "5px 12px",
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  + Add item
                </button>
              </div>

              <div
                className="landing-metrics"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                {[
                  { l: "Total SKUs", v: "1,284", b: "↑ 12%", bc: "badge-green" },
                  { l: "In stock", v: "94%", b: "↑ 3%", bc: "badge-green" },
                  { l: "Low stock", v: "38", b: "↑ 7", bc: "badge-red" },
                  { l: "Orders today", v: "52", b: "↑ 18%", bc: "badge-green" },
                ].map((m) => (
                  <div
                    key={m.l}
                    style={{
                      background: "#fff",
                      border: "1px solid rgba(0,0,0,.07)",
                      borderRadius: 8,
                      padding: "10px 12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: "#888",
                        marginBottom: 4,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {m.l}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: "#1a1a18" }}>
                      {m.v}
                    </div>
                    <div className={`metric-badge ${m.bc}`}>{m.b}</div>
                  </div>
                ))}
              </div>

              <div
                className="landing-dashboard-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,.07)",
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 500, color: "#444", marginBottom: 10 }}>
                    Stock movement — this week
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                    {bars.map((h, i) => (
                      <div
                        key={i}
                        className={`bar${h === 88 ? " highlight" : ""}`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    {barDays.map((d, i) => (
                      <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 8, color: "#bbb" }}>
                        {d}
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,.07)",
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 500, color: "#444", marginBottom: 10 }}>
                    Recent items
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {stockItems.map((item) => (
                      <div
                        key={item.sku}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "7px 10px",
                          background: "#f5f6f3",
                          borderRadius: 8,
                        }}
                      >
                        <div className={`stock-icon ${item.iconClass}`}>
                          {item.initials}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, fontWeight: 500, color: "#1a1a18" }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: 9, color: "#888" }}>{item.sku}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a18" }}>
                            {item.qty}
                          </div>
                          <div className={`stock-status ${item.statusClass}`}>
                            {item.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 5,
          padding: "56px 24px 40px",
          maxWidth: 920,
          margin: "0 auto",
        }}
      >
        <div
          className="landing-features"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 16,
          }}
        >
          {[
            {
              Icon: Zap,
              title: "Real-time tracking",
              body: "Every movement synced instantly. Know exactly what's on the shelf before you even check.",
            },
            {
              Icon: Bell,
              title: "Smart alerts",
              body: "Get notified before stock runs dry. Automatic reorder thresholds built in.",
            },
            {
              Icon: BarChart2,
              title: "Deep analytics",
              body: "Turn your inventory data into decisions. Spot trends and fast movers at a glance.",
            },
          ].map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">
                <f.Icon size={18} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a18", marginBottom: 6 }}>
                {f.title}
              </div>
              <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6, fontWeight: 300 }}>
                {f.body}
              </div>
            </div>
          ))}
        </div>
      </div>

      <PublicFooter />
    </main>
  );
}

export function AboutPage() {
  return (
    <main
      className="public-root"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#f9faf7",
        color: "#1a1a18",
        minHeight: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <PublicStyle />
      {/* Background blobs (same as LandingPage) */}
      <style>{`
        .lp-blob-1{position:absolute;bottom:-100px;left:50%;transform:translateX(-50%);width:900px;height:500px;background:radial-gradient(ellipse,#c8f5e0 0%,#c8eee0 40%,#d4f0e8 65%,transparent 80%);filter:blur(40px);opacity:.7;pointer-events:none;}
        .lp-blob-2{position:absolute;top:-60px;right:-120px;width:400px;height:400px;background:radial-gradient(circle,#e0faf0 0%,transparent 70%);filter:blur(50px);opacity:.5;pointer-events:none;}
      `}</style>
      <div className="lp-blob-1" />
      <div className="lp-blob-2" />

      <PublicNav />

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h1 className="hero-h1" style={{ fontSize: 52, maxWidth: 580 }}>
              Organizing
              <br />
              the World's <span className="text-[#0f8c5a]">Inventory</span>
            </h1>
            <p className="hero-p" style={{ maxWidth: 520, marginTop: 28 }}>
              Tanzeem was born out of a simple observation: modern businesses
              are moving faster than ever, but their inventory systems are stuck
              in the past. We built a platform that combines designer-grade
              aesthetics with powerful, intuitive logistics.
            </p>
            <div className="mt-12 grid max-w-[480px] grid-cols-2 gap-8">
              <div>
                <p className="text-4xl font-bold" style={{ color: "#1a1a18" }}>500k+</p>
                <p className="mt-2 text-base" style={{ color: "#555" }}>
                  Items Managed Daily
                </p>
              </div>
              <div>
                <p className="text-4xl font-bold" style={{ color: "#1a1a18" }}>99.9%</p>
                <p className="mt-2 text-base" style={{ color: "#555" }}>Stock Accuracy</p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[540px]">
            <ScreenshotCard
              src={aboutAnalyticsImage}
              alt="Tanzeem analytics preview"
              className="absolute right-0 top-8 w-full max-w-[610px] rotate-3"
            />
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16 text-center">
        <h2 className="section-title text-center">Our Core Values</h2>
        <p className="section-subtitle text-center" style={{ maxWidth: 560, margin: "16px auto 0" }}>
          These principles guide every feature we build and every update we
          ship.
        </p>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {valueCards.map((card) => (
            <article
              key={card.title}
              className="public-card text-left"
              style={{
                background: "#fff",
                border: "1px solid rgba(0,0,0,.08)",
                borderRadius: 24,
              }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f8c5a]/10 text-[#0f8c5a]">
                <card.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold" style={{ color: "#1a1a18" }}>
                {card.title}
              </h3>
              <p className="mt-3 text-base leading-[1.6]" style={{ color: "#555" }}>
                {card.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

export function FeaturesPage() {
  return (
    <main
      className="public-root"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#f9faf7",
        color: "#1a1a18",
        minHeight: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <PublicStyle />
      {/* Background blobs (same as LandingPage) */}
      <style>{`
        .lp-blob-1{position:absolute;bottom:-100px;left:50%;transform:translateX(-50%);width:900px;height:500px;background:radial-gradient(ellipse,#c8f5e0 0%,#c8eee0 40%,#d4f0e8 65%,transparent 80%);filter:blur(40px);opacity:.7;pointer-events:none;}
        .lp-blob-2{position:absolute;top:-60px;right:-120px;width:400px;height:400px;background:radial-gradient(circle,#e0faf0 0%,transparent 70%);filter:blur(50px);opacity:.5;pointer-events:none;}
      `}</style>
      <div className="lp-blob-1" />
      <div className="lp-blob-2" />

      <PublicNav />

      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-16 text-center">
        <h1
          className="hero-h1"
          style={{
            fontSize: 52,
            maxWidth: 740,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Everything You Need to <span className="text-[#0f8c5a]">Scale</span>
        </h1>
        <p
          className="hero-p"
          style={{
            maxWidth: 740,
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: 24,
          }}
        >
          From smart tracking to advanced analytics, Tanzeem provides a complete
          toolkit designed for modern inventory management teams.
        </p>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 mt-24 space-y-28">
        {featureRows.map((row) => (
          <div
            key={row.title}
            className={`grid items-center gap-14 lg:grid-cols-2 ${row.reverse ? "lg:[&>*:first-child]:order-2" : ""}`}
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d6f5e8] text-[#0f8c5a]">
                <row.icon className="h-6 w-6" />
              </div>
              <h2 className="mt-6 text-3xl font-bold lg:text-4xl" style={{ fontFamily: "'DM Serif Display', serif", color: "#1a1a18", letterSpacing: "-0.02em", fontWeight: 400 }}>
                {row.title}
              </h2>
              <p className="mt-5 max-w-[500px] text-lg leading-[1.62]" style={{ color: "#555", fontWeight: 300 }}>
                {row.copy}
              </p>
              <div className="mt-8 space-y-4">
                {row.bullets.map((bullet) => (
                  <FeatureBullet key={bullet}>{bullet}</FeatureBullet>
                ))}
              </div>
            </div>
            <ScreenshotCard
              src={row.image}
              alt={`${row.title} preview`}
              className="max-w-[520px]"
            />
          </div>
        ))}
      </section>

      <section className="relative z-10 mx-auto mb-16 mt-28 max-w-6xl px-6">
        <div className="public-wash-panel px-8 py-12 md:px-14">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="section-title">Start with the inventory work that matters.</h2>
              <p className="section-subtitle max-w-[620px]">
                Create products, record stock movement, review orders, and keep alerts visible from the first day your workspace opens.
              </p>
            </div>
            <Link to="/signup" className="public-btn-primary justify-center">
              Create workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

const pricingPlans = [
  {
    name: "Starter",
    price: "0 LE",
    note: "Free forever",
    description: "For a team that wants to start tracking products, stock, and basic movement right away.",
    tags: ["Start now", "First branch"],
    button: "Create workspace",
    to: "/signup",
    highlighted: false,
    includes: [
      "Basic inventory management",
      "Add and manage items",
      "Track stock levels",
      "Use the core dashboard",
    ],
  },
  {
    name: "Pro Plan",
    price: "999 LE",
    note: "Per year",
    description: "For growing teams that need more access, support, and workflow flexibility.",
    tags: ["Growing teams", "Admin support"],
    banner: "Optional upgrade",
    button: "View Pro details",
    to: "/payment",
    highlighted: true,
    includes: [
      "Unlimited users",
      "API access",
      "Custom workflows",
      "Dedicated support manager",
      "On-site onboarding",
    ],
  },
];

export function PricingPage() {
  return (
    <main
      className="public-root"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#f9faf7",
        color: "#1a1a18",
        minHeight: "100vh",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PublicStyle />
      <style>{`
        .lp-blob-1{position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:min(900px,90vw);height:500px;background:radial-gradient(ellipse,#c8f5e0 0%,#c8eee0 42%,#d4f0e8 64%,transparent 80%);filter:blur(44px);opacity:.58;pointer-events:none;}
        .lp-blob-2{position:absolute;top:-60px;right:-120px;width:400px;height:400px;background:radial-gradient(circle,#e0faf0 0%,transparent 70%);filter:blur(50px);opacity:.5;pointer-events:none;}
        .pricing-card {
          background: rgba(255,255,255,.9);
          border: 1px solid rgba(26,26,24,.1);
          border-radius: 18px;
          padding: 28px;
          height: 100%;
          transition: border-color .2s ease, transform .2s ease, box-shadow .2s ease;
        }
        .pricing-card.is-highlighted {
          border-color: rgba(15,140,90,.42);
          box-shadow: 0 18px 50px rgba(15,140,90,.11);
        }
        .pricing-card:hover {
          transform: translateY(-2px);
          border-color: rgba(15,140,90,.24);
        }
        .pricing-badge {
          display: inline-flex;
          align-items: center;
          background: rgba(15,140,90,.1);
          border: 1px solid rgba(15,140,90,.2);
          border-radius: 100px;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 500;
          color: #0a6b45;
        }
        .pricing-price {
          font-size: clamp(42px, 5vw, 64px);
          line-height: .95;
          letter-spacing: -0.02em;
          color: #111827;
          font-weight: 700;
        }
        .pricing-card-copy {
          color: #66736d;
          line-height: 1.65;
          font-size: 15px;
        }
      `}</style>
      <div className="lp-blob-1" />
      <div className="lp-blob-2" />

      <PublicNav />

      <section className="relative z-10 mx-auto w-full max-w-[1120px] flex-1 px-6 py-16 text-center">
        <h1 className="hero-h1" style={{ fontSize: 52, maxWidth: "none" }}>
          Plans for every inventory team
        </h1>
        <p
          className="hero-p"
          style={{ maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}
        >
          Start with the free workspace. When the team needs more support or integrations, review the Pro details before upgrading.
        </p>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`pricing-card text-left flex flex-col h-full relative ${plan.highlighted ? "is-highlighted" : ""}`}
            >
              <div className="flex flex-wrap gap-2 mb-5 pr-0">
                {plan.banner && <span className="pricing-badge">{plan.banner}</span>}
                {plan.tags.map((tag) => (
                  <span
                    key={tag}
                    className="pricing-badge bg-white/70 border-black/10 text-black/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
              <p className="pricing-card-copy mt-3">{plan.description}</p>
              <div className="mt-8 flex items-end gap-2 min-h-[72px]">
                <span className="pricing-price">{plan.price}</span>
                <span className="pb-2 text-gray-500">{plan.note === "Free forever" ? "/month" : "/year"}</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">{plan.note}</p>
              <div className="my-6 h-px bg-gray-200" />
              <p className="mb-3 text-sm font-semibold text-gray-900">
                Includes:
              </p>
              <CheckList items={plan.includes} />
              <div className="mt-auto pt-8">
                <Link
                  to={plan.to}
                  className={plan.highlighted ? "public-btn-primary w-full justify-center" : "public-btn-secondary w-full justify-center"}
                >
                  {plan.button}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </section>

      <PublicFooter />
    </main>
  );
}

export function PaymentPage() {
  return (
    <main
      className="public-root"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#f9faf7",
        color: "#1a1a18",
        minHeight: "100vh",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PublicStyle />
      <style>{`
        .lp-blob-1{position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:min(900px,90vw);height:500px;background:radial-gradient(ellipse,#c8f5e0 0%,#c8eee0 42%,#d4f0e8 64%,transparent 80%);filter:blur(44px);opacity:.58;pointer-events:none;}
        .lp-blob-2{position:absolute;top:-60px;right:-120px;width:400px;height:400px;background:radial-gradient(circle,#e0faf0 0%,transparent 70%);filter:blur(50px);opacity:.5;pointer-events:none;}
      `}</style>
      <div className="lp-blob-1" />
      <div className="lp-blob-2" />

      <PublicNav />

      <section className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-6 py-20">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe7d9] bg-white/75 px-4 py-2 text-sm font-semibold text-[#0a6b45]">
              <Zap className="h-4 w-4" />
              Pro plan details
            </div>
            <h1 className="hero-h1 mt-6" style={{ fontSize: 56 }}>
              Review Pro before you grow
            </h1>
            <p className="hero-p" style={{ maxWidth: 560 }}>
              Tanzeem does not collect payment here. Use this page to understand the Pro plan, then create a workspace when you are ready.
            </p>
          </div>

          <div className="rounded-2xl border border-[#dfe8e2] bg-white/80 p-5">
            <div className="text-sm font-semibold text-[#555]">Online charge today</div>
            <div className="mt-2 text-4xl font-semibold tracking-tight text-[#111827]">0 LE</div>
            <div className="mt-2 text-sm leading-6 text-[#66736d]">
              No card form is shown because checkout is not required.
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="public-card p-8">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-[#111827]">Pro Plan</h2>
                <p className="mt-2 text-sm leading-6 text-[#66736d]">
                  For growing teams that need more control, support, and API access.
                </p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-5xl font-semibold tracking-tight text-[#111827]">999 LE</div>
                <div className="mt-1 text-sm text-[#66736d]">per year</div>
              </div>
            </div>

            <div className="mt-8 h-px bg-[#e6ebe7]" />

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <CheckList
                items={[
                  "Unlimited users",
                  "API access",
                  "Custom workflows",
                  "Dedicated support manager",
                ]}
              />
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="public-btn-primary justify-center">
                Create workspace <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/pricing" className="public-btn-secondary justify-center">
                Back to pricing
              </Link>
            </div>
          </div>

          <aside className="public-card p-8">
            <h2 className="text-xl font-semibold text-[#111827]">Plan status</h2>
            <div className="mt-6 space-y-5">
              {[
                { label: "Payment form", value: "Not required" },
                { label: "Card collection", value: "Not shown" },
                { label: "Next step", value: "Create workspace" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-6 border-b border-[#edf1ee] pb-5 last:border-b-0 last:pb-0">
                  <span className="text-sm text-[#66736d]">{row.label}</span>
                  <span className="text-sm font-semibold text-[#1a1a18]">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl bg-[#eef8f2] p-4 text-sm leading-6 text-[#0a6b45]">
              If paid checkout is added later, this can become a provider-hosted checkout without changing the plan page.
            </div>
          </aside>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function getStoredWelcomeName() {
  try {
    return sessionStorage.getItem("tanzeem_welcome_name");
  } catch {
    return null;
  }
}

function getWelcomeName(currentUser, fallbackName) {
  const rawName = fallbackName || currentUser?.name || "there";
  const withoutEmailDomain = String(rawName).split("@")[0];
  const cleaned = withoutEmailDomain
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "there";

  return cleaned
    .split(" ")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function WelcomePage() {
  const location = useLocation();
  const { currentUser, getDefaultRoute } = useAuth();
  const name = getWelcomeName(currentUser, location.state?.name || getStoredWelcomeName());
  const startPath = currentUser ? getDefaultRoute() : "/signin";
  const firstName = String(name).split(" ")[0] || "there";
  return (
    <main
      className="public-root"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#f9faf7",
        color: "#1a1a18",
        minHeight: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <PublicStyle />
      <style>{`
        .welcome-bg{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,#f9faf7 0%,#f6fbf8 48%,#eef8f2 100%);}
        .welcome-wash{position:absolute;left:50%;top:104px;transform:translateX(-50%);width:min(840px,88vw);height:520px;border-radius:999px;background:radial-gradient(ellipse,rgba(15,140,90,.16),rgba(15,140,90,.055) 50%,transparent 74%);filter:blur(36px);pointer-events:none;}
        .welcome-shell{position:relative;z-index:10;min-height:calc(100vh - 82px);display:grid;align-items:start;padding:clamp(138px,18vh,218px) 24px 96px;}
        .welcome-panel{width:min(560px,100%);margin:0 auto;}
        .welcome-hero{position:relative;}
        .welcome-title{font-family:'DM Serif Display',serif;font-size:58px;line-height:1.02;letter-spacing:0;color:#1a1a18;max-width:560px;}
        .welcome-copy{margin-top:20px;max-width:520px;color:#59615c;font-size:17px;line-height:1.72;font-weight:300;}
        .welcome-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:34px;}
        @media (max-width:900px){.welcome-wash{top:90px;height:420px}.welcome-shell{padding-top:88px}.welcome-title{font-size:44px}.welcome-copy{font-size:16px}}
      `}</style>
      <div className="welcome-bg" />
      <div className="welcome-wash" />

      <PublicNav />

      <section className="welcome-shell">
        <div className="welcome-panel">
          <div className="welcome-hero">
            <h1 className="welcome-title">Welcome, {firstName}.</h1>
            <p className="welcome-copy">
              Your Tanzeem workspace is ready. Start from the area your role can access, then finish the setup work that makes daily inventory operations reliable.
            </p>
            <div className="welcome-actions">
              <Link to={startPath} className="public-btn-primary">
                Open workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to={currentUser ? "/settings" : "/signin"} className="public-btn-secondary">
                Review setup
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
