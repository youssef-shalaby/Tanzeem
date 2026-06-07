import { Link, useLocation } from "react-router";
import { ArrowRight, Check, CircleX, Target } from "lucide-react";
import {
  AccentBadge,
  CheckList,
  FeatureBullet,
  PageFrame,
  PublicNav,
  ScreenshotCard,
  TanzeemNavLogo,
  TealIcon,
} from "../components/PublicPageLayout";
import {
  aboutAnalyticsImage,
  capabilityCards,
  featureRows,
  landingDashboardImage,
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
  }
  .public-btn-primary:hover { background: #0a6b45; transform: translateY(-1px); }
  .public-btn-secondary {
    background: transparent; border: 1px solid rgba(0,0,0,.12); color: #444;
    border-radius: 100px; padding: 14px 28px; font-size: 15px; font-weight: 500;
    display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
    transition: background .15s;
  }
  .public-btn-secondary:hover { background: #f5f6f3; }
  .public-card {
    background: #fff; border: 1px solid rgba(0,0,0,.08); border-radius: 16px;
    padding: 20px; transition: box-shadow .2s;
  }
  .public-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,.05); }
  .db-section-title { font-family: 'DM Serif Display', serif; font-size: 44px; font-weight: 600; color: #1a1a18; letter-spacing: -0.02em; }
  @media (max-width: 768px) { .db-section-title { font-size: 32px; } }
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
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#f9faf7",
        color: "#1a1a18",
        minHeight: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        .lp-blob-1{position:absolute;bottom:-100px;left:50%;transform:translateX(-50%);width:900px;height:500px;background:radial-gradient(ellipse,#c8f5e0 0%,#c8eee0 40%,#d4f0e8 65%,transparent 80%);filter:blur(40px);opacity:.7;pointer-events:none;}
        .lp-blob-2{position:absolute;top:-60px;right:-120px;width:400px;height:400px;background:radial-gradient(circle,#e0faf0 0%,transparent 70%);filter:blur(50px);opacity:.5;pointer-events:none;}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(15,140,90,.1);border:1px solid rgba(15,140,90,.2);border-radius:100px;padding:6px 14px;font-size:13px;font-weight:500;color:#0a6b45;margin-bottom:28px;animation:fadeSlideDown .5s ease both;}
        .badge-dot{width:7px;height:7px;background:#0f8c5a;border-radius:50%;}
        .hero-h1{font-family:'DM Serif Display',serif;font-size:68px;line-height:1.08;letter-spacing:-1.5px;color:#1a1a18;max-width:640px;animation:fadeSlideDown .55s .05s ease both;}
        .hero-h1 em{font-style:italic;color:#0f8c5a;}
        .hero-p{margin-top:22px;max-width:520px;font-size:17px;line-height:1.65;color:#555;font-weight:300;animation:fadeSlideDown .55s .1s ease both;}
        .btn-primary{background:#1a1a18;color:#f0faf5;padding:14px 28px;border-radius:100px;font-size:15px;font-weight:500;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:background .2s,transform .15s;border:none;cursor:pointer;}
        .btn-primary:hover{background:#0f8c5a;transform:translateY(-1px);}
        .dashboard-wrap{animation:fadeSlideUp .65s .2s ease both;}
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
        .feature-card{background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:16px;padding:20px;}
        .feature-icon{width:36px;height:36px;background:#d6f5e8;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;color:#0f8c5a;margin-bottom:14px;}
        @keyframes fadeSlideDown{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div className="lp-blob-1" />
      <div className="lp-blob-2" />

      {/* Nav — unified PublicNav with TanzeemNavLogo */}
      <PublicNav />

      {/* Hero */}
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
        <div className="hero-badge">
          <div className="badge-dot" />
          Inventory management, simplified
        </div>
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
          <Link to="/signup" className="btn-primary">
            Get started free <span>→</span>
          </Link>
        </div>
      </section>

      {/* Dashboard mockup */}
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
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            border: "1px solid rgba(0,0,0,.1)",
            boxShadow: "0 2px 40px rgba(0,0,0,.08)",
            overflow: "hidden",
          }}
        >
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
          <div style={{ display: "flex", height: 340 }}>
            {/* Mini sidebar with logo mark */}
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
                  <div
                    style={{ fontSize: 15, fontWeight: 600, color: "#1a1a18" }}
                  >
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
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                {[
                  {
                    l: "Total SKUs",
                    v: "1,284",
                    b: "↑ 12%",
                    bc: "badge-green",
                  },
                  { l: "In stock", v: "94%", b: "↑ 3%", bc: "badge-green" },
                  { l: "Low stock", v: "38", b: "↑ 7", bc: "badge-red" },
                  { l: "Orders today", v: "52", b: "↑ 18%", bc: "badge-green" },
                ].map((m) => (
                  <div
                    key={m.l}
                    style={{
                      background: "#fff",
                      border: "1px solid rgba(0,0,0,.07)",
                      borderRadius: 10,
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
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: "#1a1a18",
                      }}
                    >
                      {m.v}
                    </div>
                    <div className={`metric-badge ${m.bc}`}>{m.b}</div>
                  </div>
                ))}
              </div>
              <div
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
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#444",
                      marginBottom: 10,
                    }}
                  >
                    Stock movement — this week
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 6,
                      height: 80,
                    }}
                  >
                    {bars.map((h, i) => (
                      <div
                        key={i}
                        className={`bar${h === 88 ? " highlight" : ""}`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 4,
                    }}
                  >
                    {barDays.map((d, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          textAlign: "center",
                          fontSize: 8,
                          color: "#bbb",
                        }}
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,.07)",
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#444",
                      marginBottom: 10,
                    }}
                  >
                    Recent items
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
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
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 500,
                              color: "#1a1a18",
                            }}
                          >
                            {item.name}
                          </div>
                          <div style={{ fontSize: 9, color: "#888" }}>
                            {item.sku}
                          </div>
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#1a1a18",
                            }}
                          >
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

      {/* Features */}
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
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 16,
          }}
        >
          {[
            {
              icon: "ti-bolt",
              title: "Real-time tracking",
              body: "Every movement synced instantly. Know exactly what's on the shelf before you even check.",
            },
            {
              icon: "ti-bell",
              title: "Smart alerts",
              body: "Get notified before stock runs dry — not after. Automatic reorder thresholds built in.",
            },
            {
              icon: "ti-chart-line",
              title: "Deep analytics",
              body: "Turn your inventory data into decisions. Spot trends, dead stock, and fast movers at a glance.",
            },
          ].map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">
                <i className={`ti ${f.icon}`} />
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1a1a18",
                  marginBottom: 6,
                }}
              >
                {f.title}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#666",
                  lineHeight: 1.6,
                  fontWeight: 300,
                }}
              >
                {f.body}
              </div>
            </div>
          ))}
        </div>
      </div>
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
            <div className="hero-badge" style={{ display: "inline-flex", marginBottom: 24 }}>
              <div className="badge-dot" /> Our Story
            </div>
            <h1 className="hero-h1" style={{ fontSize: 52, maxWidth: 580 }}>
              Organizing
              <br />
              the World's <span className="text-[#0f8c5a]">Inventory</span>
            </h1>
            <p className="hero-p" style={{ maxWidth: 520, marginTop: 28 }}>
              Tanzeem was born out of a simple observation: modern businesses are
              moving faster than ever, but their inventory systems are stuck in
              the past. We built a platform that combines designer-grade
              aesthetics with powerful, intuitive logistics.
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
            <ScreenshotCard
              src={aboutAnalyticsImage}
              alt="Tanzeem analytics preview"
              className="absolute right-0 top-8 w-full max-w-[610px] rotate-3"
            />
            <div className="absolute bottom-0 left-0 w-[192px] rounded-2xl border border-white/80 bg-white/90 p-6 shadow-[0_20px_25px_rgba(0,0,0,0.1)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f8c5a]/10 text-[#0f8c5a]">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-base font-bold text-[#101828]">Mission Driven</h2>
              <p className="mt-1 text-xs leading-4 text-[#6a7282]">Empowering local & global businesses.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16 text-center">
        <h2 className="text-4xl font-bold text-[#101828]">Our Core Values</h2>
        <p className="mt-4 text-base text-[#6a7282]">
          These principles guide every feature we build and every update we ship.
        </p>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {valueCards.map((card) => (
            <article
              key={card.title}
              className="public-card text-left"
              style={{ background: "#fff", border: "1px solid rgba(0,0,0,.08)", borderRadius: 24 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f8c5a]/10 text-[#0f8c5a]">
                <card.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-[#101828]">{card.title}</h3>
              <p className="mt-3 text-base leading-[1.6] text-[#4a5565]">{card.copy}</p>
            </article>
          ))}
        </div>
      </section>
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
        <div className="hero-badge" style={{ display: "inline-flex", marginBottom: 24 }}>
          <div className="badge-dot" /> Powerful features
        </div>
        <h1 className="hero-h1" style={{ fontSize: 52, maxWidth: 740, marginLeft: "auto", marginRight: "auto" }}>
          Everything You Need to <span className="text-[#0f8c5a]">Scale</span>
        </h1>
        <p className="hero-p" style={{ maxWidth: 740, marginLeft: "auto", marginRight: "auto", marginTop: 24 }}>
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
              <h2 className="mt-6 text-3xl font-bold text-[#101828] lg:text-4xl">{row.title}</h2>
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

      <section className="relative z-10 mx-auto max-w-6xl mt-28 mb-16 overflow-hidden rounded-[48px] bg-[#111614] px-8 py-20 text-white md:px-20">
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
          <Link to="/signup" className="public-btn-primary mt-8 inline-flex">
            Get Started Now
          </Link>
        </div>
      </section>
    </main>
  );
}

const pricingPlans = [
  {
    name: "Free subscription",
    price: "0LE",
    note: "Free Plan",
    tags: ["Solo Designers", "Small Teams"],
    button: "Start free 30-day trial",
    buttonClass: "bg-[#0f8c5a] text-white",
    includes: [
      "Basic inventory management",
      "Add and manage items",
      "Track stock levels",
    ],
    excludes: [
      "Custom integrations",
      "Enterprise-level support",
      "Dedicated onboarding",
    ],
  },
  {
    name: "Pro Plan",
    price: "999LE",
    note: "Paid Yearly",
    tags: ["Business Plan"],
    banner: "Save 500LE",
    button: "Buy now",
    buttonClass: "bg-[#1a1a18] text-white",
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
      }}
    >
      <PublicStyle />
      {/* Background blobs (same as LandingPage) */}
      <style>{`
        .lp-blob-1{position:absolute;bottom:-100px;left:50%;transform:translateX(-50%);width:900px;height:500px;background:radial-gradient(ellipse,#c8f5e0 0%,#c8eee0 40%,#d4f0e8 65%,transparent 80%);filter:blur(40px);opacity:.7;pointer-events:none;}
        .lp-blob-2{position:absolute;top:-60px;right:-120px;width:400px;height:400px;background:radial-gradient(circle,#e0faf0 0%,transparent 70%);filter:blur(50px);opacity:.5;pointer-events:none;}
        .pricing-card {
          background: #fff;
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 24px;
          padding: 32px;
          transition: box-shadow 0.2s, transform 0.15s;
        }
        .pricing-card:hover {
          box-shadow: 0 20px 35px -12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
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
      `}</style>
      <div className="lp-blob-1" />
      <div className="lp-blob-2" />

      <PublicNav />

      <section className="relative z-10 mx-auto max-w-[1100px] px-6 py-16 text-center">
        <div
          className="hero-badge"
          style={{ display: "inline-flex", marginBottom: 24 }}
        >
          <div className="badge-dot" /> Simple pricing
        </div>
        <h1 className="hero-h1" style={{ fontSize: 52, maxWidth: "none" }}>
          Plans and Pricing
        </h1>
        <p
          className="hero-p"
          style={{ maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}
        >
          Receive unlimited credits when you pay yearly, and save on your plan.
        </p>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {pricingPlans.map((plan) => (
            <div key={plan.name} className="pricing-card text-left">
              {plan.banner && (
                <div className="mb-4">
                  <span className="pricing-badge">{plan.banner}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {plan.tags.map((tag) => (
                  <span
                    key={tag}
                    className="pricing-badge bg-black/5 border-black/10 text-black/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-gray-500">
                  /{plan.note === "Free Plan" ? "month" : "year"}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">{plan.note}</p>
              <div className="my-6 h-px bg-gray-200" />
              <p className="mb-3 text-sm font-semibold text-gray-900">
                Includes:
              </p>
              <CheckList items={plan.includes} />
              {plan.excludes && (
                <>
                  <p className="mb-3 mt-6 text-sm font-semibold text-gray-900">
                    Not included:
                  </p>
                  <div className="space-y-2">
                    {plan.excludes.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 text-sm text-gray-500"
                      >
                        <CircleX className="h-4 w-4 text-gray-400" />
                        {item}
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="mt-8">
                <Link
                  to={plan.name === "Pro Plan" ? "/payment" : "/signup"}
                  className={`inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors ${
                    plan.buttonClass === "bg-[#0f8c5a] text-white"
                      ? "public-btn-primary"
                      : "bg-[#1a1a18] text-white hover:bg-[#0f8c5a]"
                  }`}
                  style={
                    plan.buttonClass === "bg-[#1a1a18] text-white"
                      ? { background: "#1a1a18" }
                      : {}
                  }
                >
                  {plan.button}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
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

      <section className="relative z-10 mx-auto max-w-5xl px-6 py-16">
        <div className="text-center">
          <div className="hero-badge" style={{ display: "inline-flex", marginBottom: 24 }}>
            <div className="badge-dot" /> Secure payment
          </div>
          <h1 className="hero-h1" style={{ fontSize: 52 }}>Payment</h1>
          <p className="hero-p" style={{ maxWidth: 460, marginLeft: "auto", marginRight: "auto" }}>
            Finish your setup with a billing method for your Tanzeem workspace.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Billing Form Card */}
          <div className="public-card p-8">
            <h2 className="text-2xl font-semibold text-gray-900">Billing details</h2>
            <div className="mt-6 grid gap-5">
              {["Cardholder Name", "Card Number", "Expiry Date", "CVC"].map((label) => (
                <label key={label} className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">{label}</span>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#0f8c5a] focus:ring-1 focus:ring-[#0f8c5a]"
                    placeholder={label === "Card Number" ? "1234 5678 9012 3456" : ""}
                  />
                </label>
              ))}
            </div>
            <Link
              to="/signup"
              className="public-btn-primary mt-8 w-full justify-center"
            >
              Continue to signup
            </Link>
          </div>

          {/* Pro Plan Summary Card */}
          <div className="public-card p-8 bg-[#f9faf7] border-[#0f8c5a]/20">
            <h2 className="text-xl font-semibold text-gray-900">Pro Plan</h2>
            <p className="mt-4 text-4xl font-bold text-gray-900">999LE</p>
            <p className="mt-1 text-sm text-gray-500">Paid Yearly</p>
            <div className="mt-6 h-px bg-gray-200" />
            <div className="mt-6">
              <CheckList
                items={[
                  "Unlimited users",
                  "API access",
                  "Custom workflows",
                  "Dedicated support manager",
                ]}
              />
            </div>
            <div className="mt-6 rounded-lg bg-green-50 p-3 text-xs text-green-700">
              🔒 Your payment info is encrypted and secure.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export function WelcomePage() {
  const location = useLocation();
  const name = location.state?.name || "there";

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
        <div className="grid min-h-[620px] items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Left content */}
          <div>
            <div className="hero-badge" style={{ display: "inline-flex", marginBottom: 24 }}>
              <div className="badge-dot" /> Welcome
            </div>
            <h1 className="hero-h1" style={{ fontSize: 52, maxWidth: 620 }}>
              Welcome, <span className="text-[#0f8c5a]">{name}</span>
            </h1>
            <p className="hero-p" style={{ maxWidth: 560, marginTop: 28 }}>
              Your Tanzeem workspace is ready. Start from the dashboard, review
              your branch setup, and keep every item moving with clarity.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/dashboard"
                className="public-btn-primary"
              >
                Open dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/settings"
                className="public-btn-secondary"
              >
                Review settings
              </Link>
            </div>
          </div>

          {/* Right card - Next steps */}
          <div className="rounded-[32px] bg-[#111614] p-8 text-white shadow-xl lg:p-10">
            <h2 className="text-2xl font-bold lg:text-3xl">Next steps</h2>
            <div className="mt-8 grid gap-4">
              {[
                "Review your company profile",
                "Add or import products",
                "Invite managers and staff",
                "Tune alert thresholds",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 rounded-xl bg-white/10 p-4 transition hover:bg-white/15"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f8c5a]">
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
