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
  const isInlineBg = typeof resolvedIconBg === "string" && resolvedIconBg.startsWith("#");

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
          style={{
            ...(isInlineBg ? { background: resolvedIconBg } : {}),
            color: iconColor,
          }}
        >
          {Icon && <Icon className="w-5 h-5" />}
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
