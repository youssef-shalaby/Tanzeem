export function PageLoadingState({
  title = "Loading",
  detail = "Preparing this workspace.",
  className = "",
  variant = "page",
}) {
  const rows = variant === "detail" ? [92, 76, 84] : [100, 88, 94];

  return (
    <section className={`app-loading-state ${className}`} role="status" aria-live="polite">
      <div className="app-loading-state__header">
        <div>
          <div className="app-loading-kicker">Loading</div>
          <h1 className="app-loading-title">{title}</h1>
          <p className="app-loading-detail">{detail}</p>
        </div>
        <div className="app-loading-pulse" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="app-loading-grid" aria-hidden="true">
        <div className="app-loading-panel">
          <div className="app-skeleton app-loading-line is-short" />
          <div className="app-skeleton app-loading-line" />
          <div className="app-skeleton app-loading-line is-medium" />
        </div>
        <div className="app-loading-panel">
          {rows.map((width, index) => (
            <div className="app-loading-row" key={index}>
              <div className="app-skeleton app-loading-dot" />
              <div className="app-skeleton app-loading-line" style={{ width: `${width}%` }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TableLoadingState({ rows = 5, className = "" }) {
  return (
    <div className={`app-table-loading ${className}`} role="status" aria-label="Loading table rows">
      {Array.from({ length: rows }).map((_, index) => (
        <div className="app-table-loading__row" key={index}>
          <div className="app-skeleton app-loading-dot" />
          <div className="app-skeleton app-loading-line" />
          <div className="app-skeleton app-loading-line is-medium" />
          <div className="app-skeleton app-loading-line is-short" />
        </div>
      ))}
    </div>
  );
}
