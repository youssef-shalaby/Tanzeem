import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Check, Compass, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const TOUR_STORAGE_KEY = "tanzeem_guided_tour_v1";

const TOUR_STEPS = [
  {
    id: "welcome",
    path: "/dashboard",
    selector: "[data-tour='page-content']",
    feature: "dashboard",
    title: "Welcome to Tanzeem",
    body: "This quick tour shows where daily inventory work happens: dashboard, stock, orders, alerts, analytics, settings, and your profile.",
    placement: "center",
  },
  {
    id: "dashboard",
    path: "/dashboard",
    selector: "[data-tour='nav-dashboard']",
    feature: "dashboard",
    title: "Start from the dashboard",
    body: "Your dashboard summarizes stock value, low-stock risk, dead stock, expiry warnings, and AI demand insights.",
  },
  {
    id: "inventory",
    path: "/inventory",
    selector: "[data-tour='nav-inventory']",
    feature: "inventory",
    title: "Manage inventory",
    body: "Use Inventory to review live stock, then stock in or stock out items as movement happens.",
  },
  {
    id: "products",
    path: "/products",
    selector: "[data-tour='nav-products']",
    feature: "products",
    title: "Keep products organized",
    body: "Products is your item catalog: names, SKUs, categories, pricing, and product-level details.",
  },
  {
    id: "alerts",
    path: "/alerts",
    selector: "[data-tour='nav-alerts']",
    feature: "alerts",
    title: "React to alerts",
    body: "Alerts surface low stock, expiry warnings, pending order updates, and dead-stock signals before they become expensive.",
  },
  {
    id: "orders",
    path: "/orders",
    selector: "[data-tour='nav-orders']",
    feature: "orders",
    title: "Track orders",
    body: "Orders helps you create purchase requests, review order progress, and confirm deliveries.",
  },
  {
    id: "suppliers",
    path: "/suppliers",
    selector: "[data-tour='nav-suppliers']",
    feature: "suppliers",
    title: "Work with suppliers",
    body: "Suppliers keeps vendor details, contacts, and supplier records close to your ordering workflow.",
  },
  {
    id: "analytics",
    path: "/analytics",
    selector: "[data-tour='nav-analytics']",
    feature: "analytics",
    title: "Forecast demand",
    body: "Analytics turns historical movement into forecasting views so teams can restock with more confidence.",
  },
  {
    id: "delivery-issues",
    path: "/delivery-issues",
    selector: "[data-tour='nav-delivery-issues']",
    feature: "delivery-issues",
    title: "Resolve delivery issues",
    body: "Delivery Issues tracks damaged, missing, incorrect, or defective received items so supplier problems do not disappear inside order history.",
  },
  {
    id: "notifications",
    path: "/dashboard",
    selector: "[data-tour='header-notifications']",
    title: "Check notifications",
    body: "The bell opens recent notifications and unread alerts from anywhere in the app.",
  },
  {
    id: "role",
    path: "/dashboard",
    selector: "[data-tour='header-role']",
    title: "Know your access level",
    body: "This badge shows your current role. Admins, managers, and staff see different areas based on permissions.",
  },
  {
    id: "profile-menu",
    path: "/dashboard",
    selector: "[data-tour='header-profile']",
    title: "Open your account menu",
    body: "Use the avatar menu to jump to your profile, revisit this tour, or sign out when you are done working.",
  },
  {
    id: "settings",
    path: "/settings",
    selector: "[data-tour='nav-settings']",
    feature: "settings",
    title: "Configure the workspace",
    body: "Settings is where admins manage users, branches, alerts, AI configuration, audit logs, and account security.",
  },
  {
    id: "profile",
    path: "/profile",
    selector: "[data-tour='nav-profile']",
    feature: "profile",
    title: "Update your profile",
    body: "Profile is your personal account space for contact information and recent activity.",
  },
];

function getStoredTourStatus() {
  try {
    return localStorage.getItem(TOUR_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredTourStatus(value) {
  try {
    localStorage.setItem(TOUR_STORAGE_KEY, value);
  } catch {
    // Ignore storage errors; the tour still works for the current session.
  }
}

function getRect(selector) {
  const target = document.querySelector(selector);
  if (!target) return null;
  const rect = target.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getPopoverPosition(rect, placement) {
  const width = 360;
  const gutter = 18;
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  if (!rect || placement === "center") {
    return {
      top: Math.max(32, Math.round(viewportH / 2 - 170)),
      left: Math.round((viewportW - width) / 2),
      width,
    };
  }

  const preferRight = rect.left + rect.width + width + gutter < viewportW;
  const preferLeft = rect.left - width - gutter > 0;
  const top = clamp(rect.top + rect.height / 2 - 150, 24, viewportH - 330);

  if (preferRight) {
    return { top: Math.round(top), left: Math.round(rect.left + rect.width + gutter), width };
  }

  if (preferLeft) {
    return { top: Math.round(top), left: Math.round(rect.left - width - gutter), width };
  }

  return {
    top: Math.round(clamp(rect.top + rect.height + gutter, 24, viewportH - 330)),
    left: Math.round(clamp(rect.left, 16, viewportW - width - 16)),
    width,
  };
}

export function GuidedTour() {
  const { currentUser, isFeatureAllowed } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  const steps = useMemo(
    () => TOUR_STEPS.filter((tourStep) => !tourStep.feature || isFeatureAllowed(tourStep.feature)),
    [isFeatureAllowed],
  );
  const activeIndex = steps.length > 0 ? Math.min(index, steps.length - 1) : 0;
  const step = steps[activeIndex];
  const isLast = activeIndex === steps.length - 1;

  const shouldRun = useMemo(() => {
    if (!currentUser) return false;
    return getStoredTourStatus() !== "complete";
  }, [currentUser]);

  useEffect(() => {
    if (shouldRun) {
      const startTimer = window.setTimeout(() => setIsOpen(true), 600);
      return () => window.clearTimeout(startTimer);
    }
  }, [shouldRun]);

  useEffect(() => {
    const startTour = () => {
      setIndex(0);
      setStoredTourStatus("started");
      setIsOpen(true);
    };
    window.addEventListener("tanzeem:start-tour", startTour);
    return () => window.removeEventListener("tanzeem:start-tour", startTour);
  }, []);

  useEffect(() => {
    if (!isOpen || !step) return;
    if (location.pathname !== step.path) {
      navigate(step.path);
    }
  }, [isOpen, location.pathname, navigate, step]);

  useEffect(() => {
    if (!isOpen || !step || location.pathname !== step.path) return;

    let frame = 0;
    let attempts = 0;

    const updateRect = () => {
      attempts += 1;
      const nextRect = step.selector ? getRect(step.selector) : null;
      setTargetRect(nextRect);
      if (!nextRect && attempts < 25) {
        frame = window.setTimeout(updateRect, 120);
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.clearTimeout(frame);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [isOpen, location.pathname, step]);

  if (!isOpen || !step || !currentUser) return null;

  const popover = getPopoverPosition(targetRect, step.placement);

  const finish = () => {
    setStoredTourStatus("complete");
    setIsOpen(false);
  };

  const skip = () => finish();
  const next = () => {
    if (isLast) finish();
    else setIndex((current) => current + 1);
  };
  const previous = () => setIndex((current) => Math.max(0, current - 1));

  return (
    <div className="tour-root" aria-live="polite">
      <style>{`
        .tour-root { font-family:'DM Sans',sans-serif; position:fixed; inset:0; z-index:80; pointer-events:none; }
        .tour-scrim { position:absolute; inset:0; pointer-events:auto; }
        .tour-scrim.is-full { background:rgba(17,22,20,.52); }
        .tour-scrim.has-target { background:transparent; }
        .tour-spotlight {
          position:absolute; border-radius:14px; box-shadow:0 0 0 9999px rgba(17,22,20,.52), 0 16px 42px rgba(0,0,0,.22);
          border:2px solid rgba(93,224,165,.95); pointer-events:none; transition:all .2s ease;
        }
        .tour-card {
          position:absolute; background:var(--app-panel); border:1px solid var(--app-line); border-radius:16px;
          box-shadow:0 24px 70px rgba(0,0,0,.22); padding:18px; pointer-events:auto; transition:all .2s ease;
        }
        .tour-kicker { display:inline-flex; align-items:center; gap:7px; font-size:11px; font-weight:600; color:var(--app-success-text); background:var(--app-success-bg); border-radius:100px; padding:5px 9px; }
        .tour-title { font-family:'DM Serif Display',serif; color:var(--app-ink); font-size:24px; line-height:1.1; margin-top:14px; }
        .tour-copy { color:var(--app-muted); font-size:13px; line-height:1.6; margin-top:9px; }
        .tour-progress { display:flex; gap:4px; margin-top:16px; }
        .tour-dot { height:4px; flex:1; border-radius:100px; background:var(--app-line-strong); }
        .tour-dot.active { background:var(--app-green); }
        .tour-actions { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:18px; }
        .tour-btn { border:none; border-radius:100px; padding:9px 14px; font-size:13px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:7px; font-family:'DM Sans',sans-serif; }
        .tour-btn.primary { background:var(--app-green); color:#fff; }
        .tour-btn.primary:hover { background:var(--app-green-dark); }
        .tour-btn.secondary { background:var(--app-soft); color:var(--app-ink); }
        .tour-btn.ghost { background:transparent; color:var(--app-muted); padding:8px; }
        .tour-btn:disabled { opacity:.45; cursor:not-allowed; }
        :root[data-theme="dark"] .tour-scrim.is-full {
          background: rgba(0,0,0,.58);
        }
        :root[data-theme="dark"] .tour-scrim.has-target {
          background: transparent;
        }
        :root[data-theme="dark"] .tour-spotlight {
          box-shadow: 0 0 0 9999px rgba(0,0,0,.58), 0 16px 42px rgba(0,0,0,.36);
          border-color: rgba(99,230,170,.9);
        }
        :root[data-theme="dark"] .tour-card {
          background: var(--app-panel-raised);
          box-shadow: 0 24px 80px rgba(0,0,0,.44);
        }
        @media (max-width: 760px) {
          .tour-card { left:16px !important; right:16px; top:auto !important; bottom:16px; width:auto !important; }
        }
      `}</style>
      <div className={`tour-scrim ${targetRect ? "has-target" : "is-full"}`} />
      {targetRect && (
        <div
          className="tour-spotlight"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}
      <section className="tour-card" style={popover} role="dialog" aria-label="Guided tour">
        <div className="flex items-start justify-between gap-3">
          <span className="tour-kicker">
            <Compass className="w-3.5 h-3.5" />
            Step {activeIndex + 1} of {steps.length}
          </span>
          <button className="tour-btn ghost" onClick={skip} aria-label="Skip tour">
            <X className="w-4 h-4" />
          </button>
        </div>
        <h2 className="tour-title">{step.title}</h2>
        <p className="tour-copy">{step.body}</p>
        <div className="tour-progress" aria-hidden="true">
          {steps.map((tourStep, dotIndex) => (
            <span key={tourStep.id} className={`tour-dot ${dotIndex <= activeIndex ? "active" : ""}`} />
          ))}
        </div>
        <div className="tour-actions">
          <button className="tour-btn secondary" onClick={previous} disabled={activeIndex === 0}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <button className="tour-btn ghost" onClick={skip}>Skip</button>
            <button className="tour-btn primary" onClick={next}>
              {isLast ? (
                <>
                  Finish <Check className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
