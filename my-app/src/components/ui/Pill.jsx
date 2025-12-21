import React, { forwardRef } from "react";

const VARIANTS = {
  neutral: "#6b7280",
  success: "#28a745",
  warning: "#ffd700",
  danger: "#ff4d4f",
  info: "#3b82f6",
};

const SIZES = {
  sm: { padding: "2px 6px", fontSize: 11, radius: 6 },
  md: { padding: "4px 8px", fontSize: 12, radius: 8 },
  lg: { padding: "6px 10px", fontSize: 14, radius: 10 },
};

const Pill = forwardRef(function Pill(
  {
    children,
    bg,
    color = "#fff",
    variant = "neutral",
    size = "md",
    className,
    style,
    as,
    onClick,
    leftIcon,
    rightIcon,
    ...rest
  },
  ref
) {
  const tone = bg || VARIANTS[variant] || VARIANTS.neutral;
  const sz = SIZES[size] || SIZES.md;
  const Element = as || (onClick ? "button" : "span");
  const isButton = Element === "button";
  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    backgroundColor: tone,
    color,
    borderRadius: sz.radius,
    padding: sz.padding,
    fontWeight: 600,
    fontSize: sz.fontSize,
    lineHeight: 1,
    border: isButton ? "none" : undefined,
    cursor: onClick ? "pointer" : "default",
  };

  return (
    <Element ref={ref} className={className} style={{ ...baseStyle, ...style }} onClick={onClick} type={isButton ? "button" : undefined} {...rest}>
      {leftIcon && <span style={{ display: "inline-flex", alignItems: "center" }}>{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span style={{ display: "inline-flex", alignItems: "center" }}>{rightIcon}</span>}
    </Element>
  );
});

export default Pill;
