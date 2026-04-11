"use client";

import React from "react";
import Link from "next/link";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "tile";
export type ButtonSize = "sm" | "md" | "icon";

type CommonProps = {
    href?: string;
    children: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
    /** Stretch to full width of container */
    fullWidth?: boolean;
};

export type ButtonProps = CommonProps &
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children" | "ref">;

function cn(...parts: Array<string | false | undefined>) {
    return parts.filter(Boolean).join(" ");
}

function baseClasses() {
    return cn(
        "inline-flex gap-2 font-medium transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)]",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-bg)]",
        "disabled:pointer-events-none disabled:opacity-50"
    );
}

function sizeClasses(size: ButtonSize, variant: ButtonVariant): string {
    if (variant === "tile") {
        return "min-h-0 h-auto w-full items-start justify-start rounded-lg px-4 py-4 text-left text-sm font-normal";
    }
    switch (size) {
        case "sm":
            return "min-h-9 items-center justify-center rounded-lg px-3 py-2 text-sm";
        case "icon":
            return "h-10 w-10 min-h-0 shrink-0 items-center justify-center rounded-lg p-0";
        case "md":
        default:
            return "min-h-[44px] items-center justify-center rounded-xl px-4 py-3 text-sm";
    }
}

function variantClasses(variant: ButtonVariant): string {
    switch (variant) {
        case "primary":
            return "bg-[var(--theme-accent)] text-white hover:opacity-90";
        case "secondary":
            return cn(
                "border border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-fg)]",
                "hover:bg-black/10 dark:hover:bg-white/10"
            );
        case "ghost":
            return cn(
                "border border-transparent text-[var(--theme-fg)]",
                "hover:bg-black/10 dark:hover:bg-white/10"
            );
        case "danger":
            return "bg-red-600 text-white hover:bg-red-700";
        case "tile":
            return cn(
                "border border-[var(--theme-border)] bg-[var(--theme-sidebar)] text-[var(--theme-fg)]",
                "hover:bg-black/10 dark:hover:bg-white/10"
            );
        default:
            return "bg-[var(--theme-accent)] text-white hover:opacity-90";
    }
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    {
        href,
        children,
        variant = "primary",
        size = "md",
        className = "",
        fullWidth = false,
        type = "button",
        disabled = false,
        ...rest
    },
    ref
) {
    const classes = cn(
        baseClasses(),
        sizeClasses(size, variant),
        variantClasses(variant),
        fullWidth && "w-full",
        className
    );

    const isExternal =
        href?.startsWith("http") || href?.startsWith("mailto:") || href?.startsWith("tel:");

    if (href && isExternal) {
        return (
            <a
                href={href}
                className={classes}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
                {children}
            </a>
        );
    }

    if (href) {
        return (
            <Link href={href} className={classes}>
                {children}
            </Link>
        );
    }

    return (
        <button ref={ref} type={type} disabled={disabled} className={classes} {...rest}>
            {children}
        </button>
    );
});

Button.displayName = "Button";
