"use client";

import { useEffect, useState, useMemo } from "react";
import { X } from "lucide-react";
import type { ScryfallCard } from "@/app/lib/scryfall";

type CommanderModalProps = {
    open: boolean;
    deckCards: Array<{
        id: string;
        cardId: string;
        quantity: number;
    }>;
    cardDetails: Map<string, ScryfallCard>;
    currentCommanderId: string | null;
    onClose: () => void;
    onSelect: (cardId: string) => Promise<void>;
};

export default function CommanderModal({
    open,
    deckCards,
    cardDetails,
    currentCommanderId,
    onClose,
    onSelect,
}: CommanderModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter eligible commanders
    const eligibleCommanders = useMemo(() => {
        const eligible: Array<{ deckCardId: string; cardId: string; scryfallCard: ScryfallCard }> = [];

        // Get unique card IDs from deck (exclude commander cards and duplicates)
        const uniqueCardIds = new Set<string>();
        deckCards.forEach((dc) => {
            // Exclude cards that are already commanders (c: prefix)
            if (!dc.cardId.startsWith("c:")) {
                uniqueCardIds.add(dc.cardId);
            }
        });

        uniqueCardIds.forEach((cardId) => {
            const scryfallCard = cardDetails.get(cardId);
            if (!scryfallCard) return;

            const typeLine = scryfallCard.type_line?.toLowerCase() || "";
            const oracleText = scryfallCard.oracle_text?.toLowerCase() || "";
            const allText = (typeLine + " " + oracleText).toLowerCase();

            // Check if it's a Legendary Creature
            const isLegendaryCreature = typeLine.includes("legendary") && typeLine.includes("creature");

            // Check if it specifically says it can be a commander
            const canBeCommander = allText.includes("can be your commander") || 
                                   allText.includes("can serve as your commander");

            if (isLegendaryCreature || canBeCommander) {
                const deckCard = deckCards.find((dc) => dc.cardId === cardId);
                if (deckCard) {
                    eligible.push({
                        deckCardId: deckCard.id,
                        cardId: cardId,
                        scryfallCard,
                    });
                }
            }
        });

        // Sort alphabetically by card name
        eligible.sort((a, b) => {
            const nameA = a.scryfallCard.name || "";
            const nameB = b.scryfallCard.name || "";
            return nameA.localeCompare(nameB);
        });

        return eligible;
    }, [deckCards, cardDetails]);

    const handleSelect = async (cardId: string) => {
        try {
            setLoading(true);
            setError(null);
            await onSelect(cardId);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to set commander");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100]">
            {/* Backdrop */}
            <button
                aria-label="Close modal"
                onClick={onClose}
                disabled={loading}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />

            {/* Modal */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Select Commander"
                    className="
                        w-full max-w-4xl
                        max-h-[90vh]
                        overflow-hidden
                        rounded-2xl border
                        bg-[var(--theme-bg)]
                        border-black/10 dark:border-white/10
                        text-[var(--theme-fg)]
                        shadow-[0_30px_80px_-35px_rgba(0,0,0,0.60)]
                        flex flex-col
                    "
                >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 p-4">
                        <div className="min-w-0">
                            <h3 className="text-base font-semibold truncate">Select Commander</h3>
                            <p className="text-xs opacity-70 truncate">
                                Choose a Legendary Creature or a card that can be your commander.
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="
                                rounded-md px-3 py-1.5 text-sm font-medium
                                bg-black/5 dark:bg-white/5
                                hover:bg-[var(--theme-accent)]
                                border border-[var(--theme-border)]
                                transition-colors
                                focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                            aria-label="Close"
                            title="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-4 overflow-y-auto flex-1">
                        {error && (
                            <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/50 px-4 py-3">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {eligibleCommanders.length === 0 ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <p className="text-sm opacity-70 mb-2">No eligible commanders found</p>
                                    <p className="text-xs opacity-60">Add Legendary Creatures to your deck to select a commander.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {eligibleCommanders.map(({ cardId, scryfallCard }) => {
                                    const cardImage = scryfallCard.image_uris?.normal ||
                                        scryfallCard.image_uris?.large ||
                                        scryfallCard.image_uris?.small ||
                                        scryfallCard.card_faces?.[0]?.image_uris?.normal ||
                                        "/images/DeckHaven-Shield.png";
                                    
                                    const isCurrentCommander = currentCommanderId === `c:${cardId}`;

                                    return (
                                        <button
                                            key={cardId}
                                            onClick={() => handleSelect(cardId)}
                                            disabled={loading || isCurrentCommander}
                                            className={`
                                                text-left rounded-lg border p-3
                                                transition-all duration-200
                                                ${isCurrentCommander
                                                    ? "border-[var(--theme-accent)] bg-[var(--theme-accent)]/20"
                                                    : "border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10"
                                                }
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                ${loading ? "cursor-wait" : ""}
                                            `}
                                        >
                                            <img
                                                src={cardImage}
                                                alt={scryfallCard.name}
                                                className="w-full h-auto rounded-md mb-2"
                                            />
                                            <div className="text-sm font-medium truncate">
                                                {scryfallCard.name}
                                            </div>
                                            {isCurrentCommander && (
                                                <div className="text-xs opacity-70 mt-1">
                                                    Current Commander
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 border-t border-black/10 dark:border-white/10 p-4">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="
                                rounded-md px-4 py-2 text-sm font-medium
                                bg-black/5 dark:bg-white/5
                                hover:bg-black/10 dark:hover:bg-white/10
                                border border-black/10 dark:border-white/10
                                transition-colors
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
