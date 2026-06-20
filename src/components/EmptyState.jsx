import { createElement } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ToneIcon } from "./ToneIcon";

export function EmptyState({
  icon,
  tone = "green",
  title,
  message,
  actions = [],
  compact = false,
  className = "",
}) {
  return (
    <div className={`app-empty-state ${compact ? "app-empty-state--compact" : ""} ${className}`.trim()}>
      {icon && <ToneIcon icon={icon} tone={tone} size={compact ? "md" : "lg"} />}
      <div className="app-empty-state__body">
        <h2 className="app-empty-state__title">{title}</h2>
        {message && <p className="app-empty-state__message">{message}</p>}
      </div>
      {actions.length > 0 && (
        <div className="app-empty-state__actions">
          {actions.map((action) => {
            const Icon = action.icon;
            const className = action.variant === "secondary" ? "db-secondary-btn" : "db-primary-btn";
            const content = (
              <>
                {Icon ? createElement(Icon, { className: "w-4 h-4", "aria-hidden": true }) : null}
                {action.label}
                {action.trailingIcon !== false && action.variant === "link" ? (
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                ) : null}
              </>
            );

            if (action.to) {
              return (
                <Link key={action.label} to={action.to} state={action.state} className={className}>
                  {content}
                </Link>
              );
            }

            return (
              <button key={action.label} type="button" onClick={action.onClick} className={className}>
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
