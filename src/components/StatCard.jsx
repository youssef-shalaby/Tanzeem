function inferIconTone(iconColor = "", iconBg = "") {
  const value = `${iconColor} ${iconBg}`.toLowerCase();
  if (value.includes("ef4444") || value.includes("dc2626") || value.includes("red")) return "red";
  if (value.includes("f59e0b") || value.includes("eab308") || value.includes("f97316") || value.includes("yellow") || value.includes("orange") || value.includes("amber")) return "amber";
  if (value.includes("3b82f6") || value.includes("2563eb") || value.includes("blue")) return "blue";
  if (value.includes("8b5cf6") || value.includes("7c3aed") || value.includes("purple")) return "purple";
  if (value.includes("66706a") || value.includes("gray")) return "gray";
  return "green";
}

export function StatCard({
  title,
  value,
  change,
  sub,
  subColor,
  icon,
  iconColor = "#0f8c5a",
  iconBgColor = "bg-[#0f8c5a]/10",
  iconBg,
  loading = false,
  className = "",
  style,
}) {
  const hasChange = typeof change === "number";
  const isPositive = change >= 0;
  const Icon = icon;
  const resolvedIconBg = iconBg || iconBgColor;
  const isInlineBg = typeof resolvedIconBg === "string"
    && /^(#|rgb|hsl|oklch|lab|color-mix|var\()/i.test(resolvedIconBg.trim());
  const iconTone = inferIconTone(iconColor, resolvedIconBg);

  return (
    <div className={`app-card app-stat-card ${className}`} style={style}>
      <div className="app-stat-head">
        <div>
          <div className="app-stat-label">{title}</div>
          {hasChange && (
            <div className={`app-stat-change ${isPositive ? "positive" : "negative"}`}>
              <span>{isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div
          className={`app-stat-icon ${isInlineBg ? "" : resolvedIconBg}`}
          data-tone={iconTone}
          style={{
            ...(isInlineBg ? { background: resolvedIconBg } : {}),
            color: iconColor,
          }}
        >
          {Icon && <Icon className="w-5 h-5" aria-hidden="true" />}
        </div>
      </div>

      {loading ? (
        <div className="app-skeleton h-8 w-20 mb-2" />
      ) : (
        <div className="app-stat-value">{value}</div>
      )}
      {sub && <div className="app-stat-sub" style={{ color: subColor }}>{sub}</div>}
    </div>
  );
}
