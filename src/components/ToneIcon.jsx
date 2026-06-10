import { createElement } from "react";

export function ToneIcon({
  icon: Icon,
  tone = "green",
  size = "md",
  className = "",
  iconClassName = "w-5 h-5",
  children,
}) {
  return (
    <span className={`tone-icon tone-icon-${size} ${className}`} data-tone={tone}>
      {Icon ? createElement(Icon, { className: iconClassName, "aria-hidden": true }) : children}
    </span>
  );
}
