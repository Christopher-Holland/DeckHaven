"use client";

import { useState, useEffect } from "react";
import { User, Palette, Shield, Bell, Info, Edit2, X, Check } from "lucide-react";
import { useUser } from "@stackframe/stack";
import { useToast } from "@/app/components/ToastContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useDeckHavenTheme } from "@/app/components/ThemeContext";
import { baseThemes, accentColors, type BaseThemeId, type AccentColorId } from "@/app/lib/themes";

type Tab = "account" | "appearance" | "security" | "notifications" | "about";

function AppearancePanel() {
    const { baseTheme, accentColor, setBaseTheme, setAccentColor } = useDeckHavenTheme();
    const { showToast } = useToast();

    const handleBaseThemeChange = (themeId: BaseThemeId) => {
        setBaseTheme(themeId);
        showToast(`Theme changed to ${baseThemes[themeId].name}`, "success");
    };

    const handleAccentChange = (colorId: AccentColorId) => {
        setAccentColor(colorId);
        showToast(`Accent color changed to ${accentColors[colorId].name}`, "success");
    };

    return (
        <div>
            <div className="mb-5">
                <h3 className="text-lg font-semibold">Appearance</h3>
                <p className="text-sm opacity-70 mt-1">Choose your DeckHaven theme and visual preferences.</p>
            </div>

            <div className="space-y-6">
                {/* Theme Selection */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold opacity-90">Theme</h4>
                    <p className="text-xs opacity-70">Select a theme preset (Emerald Night, Parchment, etc.).</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.values(baseThemes).map((theme) => {
                            const isSelected = baseTheme === theme.id;
                            return (
                                <button
                                    key={theme.id}
                                    onClick={() => handleBaseThemeChange(theme.id)}
                                    className={`
                                        relative rounded-md border-2 p-4 text-left
                                        transition-all duration-200
                                        ${isSelected
                                            ? "border-[var(--theme-accent)] bg-[var(--theme-accent)]/10"
                                            : "border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/10 hover:border-[var(--theme-accent)]/50"
                                        }
                                    `}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${isSelected ? "text-[var(--theme-accent)]" : ""}`}>
                                                {theme.name}
                                            </p>
                                            <p className="text-xs opacity-70 mt-1">{theme.description}</p>
                                        </div>
                                        {isSelected && (
                                            <Check className="w-5 h-5 text-[var(--theme-accent)] flex-shrink-0" />
                                        )}
                                    </div>
                                    {/* Color Preview */}
                                    <div className="mt-3 flex gap-2">
                                        <div
                                            className="w-6 h-6 rounded border border-black/10 dark:border-white/10"
                                            style={{ backgroundColor: theme.colors.background }}
                                            title="Background"
                                        />
                                        <div
                                            className="w-6 h-6 rounded border border-black/10 dark:border-white/10"
                                            style={{ backgroundColor: theme.colors.sidebar }}
                                            title="Sidebar"
                                        />
                                        <div
                                            className="w-6 h-6 rounded border border-black/10 dark:border-white/10"
                                            style={{ backgroundColor: theme.colors.card }}
                                            title="Card"
                                        />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Accent Color Selection */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold opacity-90">Accent</h4>
                    <p className="text-xs opacity-70">Choose your accent color (Bronze, Emerald, etc.).</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Object.values(accentColors).map((accent) => {
                            const isSelected = accentColor === accent.id;
                            return (
                                <button
                                    key={accent.id}
                                    onClick={() => handleAccentChange(accent.id)}
                                    className={`
                                        relative rounded-md border-2 p-4 text-left
                                        transition-all duration-200
                                        ${isSelected
                                            ? "border-[var(--theme-accent)] bg-[var(--theme-accent)]/10"
                                            : "border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/10 hover:border-[var(--theme-accent)]/50"
                                        }
                                    `}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${isSelected ? "text-[var(--theme-accent)]" : ""}`}>
                                                {accent.name}
                                            </p>
                                            <p className="text-xs opacity-70 mt-1">{accent.description}</p>
                                        </div>
                                        {isSelected && (
                                            <Check className="w-4 h-4 text-[var(--theme-accent)] flex-shrink-0" />
                                        )}
                                    </div>
                                    {/* Accent Color Preview */}
                                    <div className="mt-3 flex justify-center">
                                        <div
                                            className="w-full h-8 rounded border border-black/10 dark:border-white/10"
                                            style={{ backgroundColor: accent.color }}
                                            title={accent.name}
                                        />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Reduced Motion (placeholder for future feature) */}
                <div className="rounded-md border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/10 p-4 opacity-60">
                    <p className="text-sm font-medium">Reduced motion</p>
                    <p className="text-xs opacity-70 mt-1">Turn off animations like page flips. (THIS FEATURE IS NOT AVAILABLE AT THIS TIME)</p>
                </div>
            </div>
        </div>
    );
}

function SecurityPanel({ user, showToast }: { user: ReturnType<typeof useUser>; showToast: (message: string, type?: "success" | "error" | "warning") => void }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [step, setStep] = useState<"request" | "reset">("request");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [sending, setSending] = useState(false);
    const [resetting, setResetting] = useState(false);

    // Initialize email from user if available
    useEffect(() => {
        if (user?.primaryEmail) {
            setEmail(user.primaryEmail);
        }
    }, [user]);

    // Check for reset code in URL parameters (from email link)
    useEffect(() => {
        // Stack Auth might use different parameter names for the code
        const resetCode = searchParams.get("code") || 
                         searchParams.get("reset_code") || 
                         searchParams.get("token") ||
                         searchParams.get("reset_token");
        const resetParam = searchParams.get("reset");
        
        // Log all params for debugging
        console.log("SecurityPanel - URL params:", {
            code: searchParams.get("code"),
            reset_code: searchParams.get("reset_code"),
            token: searchParams.get("token"),
            reset_token: searchParams.get("reset_token"),
            reset: searchParams.get("reset"),
            allParams: Object.fromEntries(searchParams.entries()),
        });
        
        if (resetCode) {
            setCode(resetCode);
            setStep("reset");
            // Remove the code from URL to keep it clean
            const newSearchParams = new URLSearchParams(searchParams.toString());
            newSearchParams.delete("code");
            newSearchParams.delete("reset_code");
            newSearchParams.delete("token");
            newSearchParams.delete("reset_token");
            if (newSearchParams.get("reset")) {
                newSearchParams.delete("reset");
            }
            const newUrl = newSearchParams.toString() 
                ? `${window.location.pathname}?${newSearchParams.toString()}`
                : window.location.pathname;
            router.replace(newUrl);
        } else if (resetParam === "true") {
            // User came from email link but no code yet - show reset form so they can enter it manually
            setStep("reset");
        }
    }, [searchParams, router]);

    const handleSendResetCode = async () => {
        if (!email) {
            showToast("Please enter your email address", "error");
            return;
        }

        setSending(true);
        try {
            const response = await fetch("/api/auth/password/send-reset-code", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || errorData.message || `Failed to send reset code (${response.status})`;
                throw new Error(errorMessage);
            }

            const result = await response.json();
            if (result.success) {
                showToast("Password reset code sent to your email", "success");
                setStep("reset");
            } else {
                throw new Error("Failed to send reset code");
            }
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Failed to send reset code", "error");
        } finally {
            setSending(false);
        }
    };

    const handleResetPassword = async () => {
        if (!code || !newPassword) {
            showToast("Please fill in all fields", "error");
            return;
        }

        if (newPassword.length < 8) {
            showToast("New password must be at least 8 characters long", "error");
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast("New passwords do not match", "error");
            return;
        }

        setResetting(true);
        try {
            const response = await fetch("/api/auth/password/reset", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    password: newPassword,
                    code,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || errorData.message || `Failed to reset password (${response.status})`;
                throw new Error(errorMessage);
            }

            const result = await response.json();
            if (result.success) {
                showToast("Password reset successfully", "success");
                setStep("request");
                setCode("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                throw new Error("Password reset failed");
            }
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Failed to reset password", "error");
        } finally {
            setResetting(false);
        }
    };

    if (!user) {
        return (
            <Panel
                title="Security"
                description="Please sign in to manage your security settings."
            />
        );
    }

    return (
        <div>
            <div className="mb-5">
                <h3 className="text-lg font-semibold">Security</h3>
                <p className="text-sm opacity-70 mt-1">Manage password and account security preferences.</p>
            </div>

            <div className="space-y-3">
                {/* Reset Password */}
                <div className="rounded-md border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/10 p-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Reset password</p>
                        <p className="text-xs opacity-70 mt-1">
                            {step === "request" 
                                ? "We'll send a reset code to your email address."
                                : "Enter the code from your email and your new password."}
                        </p>
                        
                        {step === "request" ? (
                            <div className="mt-4 space-y-3">
                                <div>
                                    <label className="block text-xs font-medium opacity-80 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={sending}
                                        className="w-full rounded-md px-3 py-2 text-sm bg-[var(--theme-card)]/70 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] disabled:opacity-50"
                                        placeholder="Enter your email address"
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleSendResetCode}
                                        disabled={sending || !email}
                                        className="px-4 py-2 text-sm font-medium bg-[var(--theme-accent)] text-white rounded-md hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {sending ? "Sending..." : "Send Reset Code"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                <div>
                                    <label className="block text-xs font-medium opacity-80 mb-1">
                                        Reset Code
                                    </label>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        disabled={resetting}
                                        className="w-full rounded-md px-3 py-2 text-sm bg-[var(--theme-card)]/70 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] disabled:opacity-50"
                                        placeholder="Enter code from email"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium opacity-80 mb-1">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        disabled={resetting}
                                        className="w-full rounded-md px-3 py-2 text-sm bg-[var(--theme-card)]/70 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] disabled:opacity-50"
                                        placeholder="Enter new password (min 8 characters)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium opacity-80 mb-1">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={resetting}
                                        className="w-full rounded-md px-3 py-2 text-sm bg-[var(--theme-card)]/70 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] disabled:opacity-50"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleResetPassword}
                                        disabled={resetting || !code || !newPassword || !confirmPassword}
                                        className="px-4 py-2 text-sm font-medium bg-[var(--theme-accent)] text-white rounded-md hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {resetting ? "Resetting..." : "Reset Password"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setStep("request");
                                            setCode("");
                                            setNewPassword("");
                                            setConfirmPassword("");
                                        }}
                                        disabled={resetting}
                                        className="px-4 py-2 text-sm font-medium bg-black/5 dark:bg-white/5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Two-factor authentication */}
                <div className="rounded-md border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/10 p-4 opacity-60">
                    <p className="text-sm font-medium">Two-factor authentication</p>
                    <p className="text-xs opacity-70 mt-1">Enable 2FA (THIS FEATURE IS NOT AVAILABLE AT THIS TIME).</p>
                </div>

                {/* Active sessions */}
                <div className="rounded-md border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/10 p-4 opacity-60">
                    <p className="text-sm font-medium">Active sessions</p>
                    <p className="text-xs opacity-70 mt-1">Review devices signed into your account. (THIS FEATURE IS NOT AVAILABLE AT THIS TIME)</p>
                </div>
            </div>
        </div>
    );
}

function AccountPanel({ user, showToast, router }: { user: ReturnType<typeof useUser>; showToast: (message: string, type?: "success" | "error" | "warning") => void; router: ReturnType<typeof useRouter> }) {
    const [editingUsername, setEditingUsername] = useState(false);
    const [editingEmail, setEditingEmail] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Initialize form values from user
    useEffect(() => {
        if (user) {
            setUsername(user.displayName || "");
            setEmail(user.primaryEmail || "");
        }
    }, [user]);

    const handleUpdateUsername = async () => {
        if (!user || !username.trim()) {
            showToast("Username cannot be empty", "error");
            return;
        }

        if (username === user.displayName) {
            setEditingUsername(false);
            return;
        }

        setSaving(true);
        try {
            const response = await fetch("/api/user", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    display_name: username.trim(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || errorData.message || `Failed to update username (${response.status})`;
                throw new Error(errorMessage);
            }

            const result = await response.json();
            showToast("Username updated successfully", "success");
            setEditingUsername(false);
            // Reload page to refresh user data
            window.location.reload();
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Failed to update username", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateEmail = async () => {
        if (!user || !email.trim()) {
            showToast("Email cannot be empty", "error");
            return;
        }

        if (email === user.primaryEmail) {
            setEditingEmail(false);
            return;
        }

        setSaving(true);
        try {
            const response = await fetch("/api/user", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    primary_email: email.trim(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || errorData.message || `Failed to update email (${response.status})`;
                throw new Error(errorMessage);
            }

            const result = await response.json();
            showToast("Email updated successfully. Please verify your new email.", "success");
            setEditingEmail(false);
            // Reload page to refresh user data
            window.location.reload();
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Failed to update email", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;

        setDeleting(true);
        try {
            const response = await fetch("/api/user", {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to delete account");
            }

            showToast("Account deleted successfully", "success");
            // Redirect to home page after deletion
            setTimeout(() => {
                router.push("/");
            }, 1000);
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Failed to delete account", "error");
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (!user) {
        return (
            <Panel
                title="Account"
                description="Please sign in to manage your account settings."
            />
        );
    }

    return (
        <div>
            <div className="mb-5">
                <h3 className="text-lg font-semibold">Account</h3>
                <p className="text-sm opacity-70 mt-1">Manage your account settings and profile information.</p>
            </div>

            <div className="space-y-3">
                {/* Username */}
                <div className="rounded-md border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/10 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">Username</p>
                            <p className="text-xs opacity-70 mt-1">Change how your name appears in DeckHaven.</p>
                            {editingUsername ? (
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={saving}
                                    className="mt-2 w-full rounded-md px-3 py-2 text-sm bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#42c99c] dark:focus:ring-[#82664e] disabled:opacity-50"
                                    placeholder="Enter username"
                                />
                            ) : (
                                <p className="text-sm mt-2 opacity-90">{user.displayName || "Not set"}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {editingUsername ? (
                                <>
                                    <button
                                        onClick={handleUpdateUsername}
                                        disabled={saving}
                                        className="p-2 rounded-md bg-[var(--theme-accent)] text-white hover:opacity-95 transition-opacity disabled:opacity-50"
                                        aria-label="Save username"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingUsername(false);
                                            setUsername(user.displayName || "");
                                        }}
                                        disabled={saving}
                                        className="p-2 rounded-md bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                                        aria-label="Cancel"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setEditingUsername(true)}
                                    className="p-2 rounded-md bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                    aria-label="Edit username"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Email */}
                <div className="rounded-md border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/10 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-xs opacity-70 mt-1">View or manage your email address.</p>
                            {editingEmail ? (
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={saving}
                                    className="mt-2 w-full rounded-md px-3 py-2 text-sm bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#42c99c] dark:focus:ring-[#82664e] disabled:opacity-50"
                                    placeholder="Enter email"
                                />
                            ) : (
                                <div className="mt-2">
                                    <p className="text-sm opacity-90">{user.primaryEmail || "Not set"}</p>
                                    {user.primaryEmailVerified && (
                                        <p className="text-xs opacity-60 mt-1">✓ Verified</p>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {editingEmail ? (
                                <>
                                    <button
                                        onClick={handleUpdateEmail}
                                        disabled={saving}
                                        className="p-2 rounded-md bg-[var(--theme-accent)] text-white hover:opacity-95 transition-opacity disabled:opacity-50"
                                        aria-label="Save email"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingEmail(false);
                                            setEmail(user.primaryEmail || "");
                                        }}
                                        disabled={saving}
                                        className="p-2 rounded-md bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                                        aria-label="Cancel"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setEditingEmail(true)}
                                    className="p-2 rounded-md bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                    aria-label="Edit email"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Delete Account */}
                <div className="rounded-md border border-red-500/30 dark:border-red-500/40 bg-red-500/5 dark:bg-red-500/10 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-red-700 dark:text-red-300">Delete account</p>
                            <p className="text-xs opacity-70 mt-1 text-red-700/80 dark:text-red-200/80">
                                Permanently delete your account and data.
                            </p>
                            {showDeleteConfirm && (
                                <div className="mt-3 space-y-2">
                                    <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                                        Are you sure? This action cannot be undone.
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={deleting}
                                            className="px-3 py-1.5 text-xs font-medium bg-red-600 dark:bg-red-700 text-white rounded-md hover:opacity-95 transition-opacity disabled:opacity-50"
                                        >
                                            {deleting ? "Deleting..." : "Confirm Delete"}
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            disabled={deleting}
                                            className="px-3 py-1.5 text-xs font-medium bg-black/5 dark:bg-white/5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        {!showDeleteConfirm && (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-3 py-1.5 text-xs font-medium bg-red-600/20 dark:bg-red-700/20 text-red-700 dark:text-red-300 rounded-md hover:bg-red-600/30 dark:hover:bg-red-700/30 transition-colors"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const searchParams = useSearchParams();
    const [tab, setTab] = useState<Tab>("account");
    const user = useUser();
    const { showToast } = useToast();
    const router = useRouter();

    // Auto-switch to security tab if reset parameter is present
    useEffect(() => {
        const resetParam = searchParams.get("reset");
        const codeParam = searchParams.get("code");
        if (resetParam === "true" || codeParam) {
            setTab("security");
        }
    }, [searchParams]);

    return (
        <main
            className="
        min-h-[calc(100vh-8rem)]
        bg-[var(--theme-bg)]
        px-6 py-6
        text-[var(--theme-fg)]
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
                        <AccountPanel user={user} showToast={showToast} router={router} />
                    )}

                    {tab === "appearance" && (
                        <AppearancePanel />
                    )}

                    {tab === "security" && (
                        <SecurityPanel user={user} showToast={showToast} />
                    )}

                    {tab === "notifications" && (
                        <Panel
                            title="Notifications"
                            description="Control in-app alerts and notifications. (THIS FEATURE IS NOT AVAILABLE AT THIS TIME)"
                            rows={[
                                { label: "Success toasts", hint: "Show confirmations for successful actions. (THIS FEATURE IS NOT AVAILABLE AT THIS TIME)" },
                                { label: "Error toasts", hint: "Show alerts when something fails. (THIS FEATURE IS NOT AVAILABLE AT THIS TIME)" },
                                { label: "Warning toasts", hint: "Show warnings for risky actions. (THIS FEATURE IS NOT AVAILABLE AT THIS TIME)" },
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
                    ? "bg-[var(--theme-accent)]/15 border border-[var(--theme-accent)]/30"
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