"use client";

import { useState } from "react";
import { User, Palette, Shield, Bell, Info } from "lucide-react";

type Tab = "account" | "appearance" | "security" | "notifications" | "about";

export default function SettingsPage() {
    const [tab, setTab] = useState<Tab>("account");

    return (
        <main
            className="
        min-h-[calc(100vh-8rem)]
        bg-[#f6ead6] dark:bg-[#0f2a2c]
        px-6 py-6
        text-[#193f44] dark:text-[#e8d5b8]
        transition-all duration-300
      "
        >
            {/* Header */}
            <section className="mb-6">
                <h2 className="text-2xl font-semibold">Settings</h2>
                <p className="text-sm opacity-70 mt-1">
                    Manage your account, appearance, and DeckHaven preferences.
                </p>
                <h3 className="text-3xl font-semibold opacity-70 mt-1 text-center">
                    <span className="text-red-500">SOME FEATURES MAY BE UNAVAILABLE AT THIS TIME.</span>
                </h3>
            </section>

            {/* Layout */}
            <section className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
                {/* Left Nav */}
                <aside
                    className="
            rounded-lg border border-black/10 dark:border-white/10
            bg-white/70 dark:bg-white/5 backdrop-blur
            p-2 h-fit
          "
                >
                    <NavItem icon={<User className="w-4 h-4" />} label="Account" active={tab === "account"} onClick={() => setTab("account")} />
                    <NavItem icon={<Palette className="w-4 h-4" />} label="Appearance" active={tab === "appearance"} onClick={() => setTab("appearance")} />
                    <NavItem icon={<Shield className="w-4 h-4" />} label="Security" active={tab === "security"} onClick={() => setTab("security")} />
                    <NavItem icon={<Bell className="w-4 h-4" />} label="Notifications" active={tab === "notifications"} onClick={() => setTab("notifications")} />
                    <NavItem icon={<Info className="w-4 h-4" />} label="About" active={tab === "about"} onClick={() => setTab("about")} />
                </aside>

                {/* Right Panel */}
                <div
                    className="
            rounded-lg border border-black/10 dark:border-white/10
            bg-white/70 dark:bg-white/5 backdrop-blur
            p-4 sm:p-6
          "
                >
                    {tab === "account" && (
                        <Panel
                            title="Account"
                            description="Manage your account settings and profile information."
                            rows={[
                                { label: "Username", hint: "Change how your name appears in DeckHaven." },
                                { label: "Email", hint: "View or manage your email address." },
                                { label: "Delete account", hint: "Permanently delete your account and data.", danger: true },
                            ]}
                        />
                    )}

                    {tab === "appearance" && (
                        <Panel
                            title="Appearance"
                            description="Choose your DeckHaven theme and visual preferences."
                            rows={[
                                { label: "Theme", hint: "Select a theme preset (Emerald Night, Parchment, etc.)." },
                                { label: "Accent", hint: "Choose your accent color (Bronze, Emerald, etc.)." },
                                { label: "Reduced motion", hint: "Turn off animations like page flips." },
                            ]}
                        />
                    )}

                    {tab === "security" && (
                        <Panel
                            title="Security"
                            description="Manage password and account security preferences."
                            rows={[
                                { label: "Change password", hint: "Update your password." },
                                { label: "Two-factor authentication", hint: "Enable 2FA (optional for later)." },
                                { label: "Active sessions", hint: "Review devices signed into your account." },
                            ]}
                        />
                    )}

                    {tab === "notifications" && (
                        <Panel
                            title="Notifications"
                            description="Control in-app alerts and notifications."
                            rows={[
                                { label: "Success toasts", hint: "Show confirmations for successful actions." },
                                { label: "Error toasts", hint: "Show alerts when something fails." },
                                { label: "Warning toasts", hint: "Show warnings for risky actions." },
                            ]}
                        />
                    )}

                    {tab === "about" && (
                        <Panel
                            title="About"
                            description="Version info, credits, and links."
                        >
                            {/* Story block */}
                            <div className="mb-6 space-y-3 text-sm leading-relaxed opacity-90">
                                <p>
                                    <span className="font-semibold">DeckHaven</span> is a fantasy-inspired card
                                    collection and deck-building companion designed to make organizing your
                                    cards feel as satisfying as playing the game itself.
                                </p>

                                <p>
                                    Built with collectors in mind, DeckHaven uses binder-style layouts and
                                    flexible deck tools to reflect how cards are actually tracked, stored,
                                    and upgraded over time — whether you’re completing sets or building
                                    the next meta deck.
                                </p>
                            </div>

                            {/* Existing info rows */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-2">
                                    <span className="font-medium text-sm">Version</span>
                                    <span className="text-xs opacity-70">v1.0.0</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-2">
                                    <span className="font-medium text-sm">Credits</span>
                                    <a
                                        href="https://christopher-holland.github.io/portfolio/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs opacity-70 hover:underline"
                                    >
                                        Created by Chris Holland
                                    </a>
                                </div>
                                <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-2">
                                    <span className="font-medium text-sm">Scryfall</span>
                                    <a
                                        href="https://scryfall.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs opacity-70 hover:underline"
                                    >
                                        Magic: The Gathering card data powered by Scryfall
                                    </a>
                                </div>
                            </div>
                        </Panel>
                    )}
                </div>
            </section>

            {/* Mobile fallback: your original cards (optional) */}
            {/* If you prefer, you can keep your 2x2 grid for md and below and only show the left-nav layout on lg+ */}
        </main>
    );
}

function NavItem({
    icon,
    label,
    active,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
        w-full flex items-center gap-2
        px-3 py-2 rounded-md text-sm
        transition-colors
        ${active
                    ? "bg-[#42c99c]/15 dark:bg-[#82664e]/20 border border-[#42c99c]/30 dark:border-[#82664e]/30"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                }
      `}
        >
            {icon}
            <span className="truncate">{label}</span>
        </button>
    );
}

function Panel({
    title,
    description,
    rows,
    children,
}: {
    title: string;
    description: string;
    rows?: Array<{ label: string; hint: string; danger?: boolean; link?: string }>;
    children?: React.ReactNode;
}) {
    return (
        <div>
            <div className="mb-5">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm opacity-70 mt-1">{description}</p>
            </div>

            {children ? (
                children
            ) : (
                <div className="space-y-3">
                    {rows?.map((row) => {
                    const content = (
                        <div
                            className={`
                              rounded-md border p-4
                              ${row.link ? "cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors" : ""}
                              ${row.danger
                                    ? "border-red-500/30 dark:border-red-500/40 bg-red-500/5 dark:bg-red-500/10"
                                    : "border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/10"
                                }
                            `}
                        >
                            <p className={`text-sm font-medium ${row.danger ? "text-red-700 dark:text-red-300" : ""}`}>
                                {row.label}
                            </p>
                            <p className={`text-xs opacity-70 mt-1 ${row.danger ? "text-red-700/80 dark:text-red-200/80" : ""}`}>
                                {row.hint}
                            </p>
                        </div>
                    );

                    if (row.link) {
                        return (
                            <a
                                key={row.label}
                                href={row.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                            >
                                {content}
                            </a>
                        );
                    }

                    return <div key={row.label}>{content}</div>;
                    })}
                </div>
            )}
        </div>
    );
}