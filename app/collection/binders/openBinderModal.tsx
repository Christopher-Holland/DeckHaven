"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Trash, X, ChevronLeft, ChevronRight } from "lucide-react";
import EditBinderModal from "./editBinderModal";
import type { ScryfallCard } from "@/app/lib/scryfall";
import AddToBinderModal from "./addToBinderModal";

type Binder = {
    id: string;
    game?: string | null; // "mtg" | "pokemon" | "yugioh" | null
    name: string;
    description?: string | null;
    color?: string | null; // Cover color (hex)
    spineColor?: string | null; // Spine color (hex)
    pageColor?: string | null; // Page background color (hex)
    size?: string | null; // "2x2" | "3x3" | "4x4"
    _count?: { binderCards: number };
};

type BinderCard = {
    id: string;
    cardId: string; // Scryfall card ID
    imageUrl?: string | null; // optional for later
    title?: string | null;    // optional for tooltip
    isInCollection?: boolean; // whether card is in user's collection
};

type Props = {
    open: boolean;
    binder: Binder | null;
    cards?: BinderCard[]; // optional (can be empty); used to fill pockets
    onClose: () => void;
    onSuccess?: () => void;
};

export default function OpenBinderModal({ open, binder, cards = [], onClose, onSuccess }: Props) {
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isFlipping, setIsFlipping] = useState(false);
    const [binderCards, setBinderCards] = useState<Array<{
        id: string;
        cardId: string;
        slotIndex?: number | null;
        pageNumber?: number | null;
    }>>([]);
    const [cardDetails, setCardDetails] = useState<Map<string, ScryfallCard>>(new Map());
    const [loadingCards, setLoadingCards] = useState(false);
    const [addToBinderModalOpen, setAddToBinderModalOpen] = useState(false);
    const [pendingSlotIndex, setPendingSlotIndex] = useState<number | null>(null);
    const [pendingPageNumber, setPendingPageNumber] = useState<number | null>(null);
    const [collectionCardIds, setCollectionCardIds] = useState<Set<string>>(new Set());

    // Fetch binder cards when modal opens
    useEffect(() => {
        if (!open || !binder) {
            setBinderCards([]);
            setCardDetails(new Map());
            setCurrentPage(1);
            return;
        }

        async function fetchBinderCards() {
            if (!binder) return;

            try {
                setLoadingCards(true);
                
                // Fetch binder cards
                const response = await fetch(`/api/binders/${binder.id}`);
                if (!response.ok) throw new Error("Failed to fetch binder cards");

                const data = await response.json();
                const cards = data.binder?.binderCards || [];
                setBinderCards(cards);

                // Fetch user's collection to check ownership
                try {
                    const collectionResponse = await fetch(`/api/collection?page=1&limit=10000`);
                    if (collectionResponse.ok) {
                        const collectionData = await collectionResponse.json();
                        const cardIds = new Set<string>(collectionData.items?.map((item: { cardId: string }) => item.cardId) || []);
                        setCollectionCardIds(cardIds);
                    }
                } catch (err) {
                    console.warn("Failed to fetch collection:", err);
                }

                // Fetch card details from Scryfall
                const detailsMap = new Map<string, ScryfallCard>();
                for (const bc of cards) {
                    try {
                        const cardResponse = await fetch(`/api/scryfall/card/${bc.cardId}`);
                        if (cardResponse.ok) {
                            const cardData = await cardResponse.json();
                            detailsMap.set(bc.cardId, cardData);
                        }
                    } catch (err) {
                        console.warn(`Failed to fetch card ${bc.cardId}:`, err);
                    }
                }
                setCardDetails(detailsMap);
            } catch (err) {
                console.error("Error fetching binder cards:", err);
            } finally {
                setLoadingCards(false);
            }
        }

        fetchBinderCards();
    }, [open, binder]);

    // Reset to page 1 when modal closes
    useEffect(() => {
        if (!open) {
            setCurrentPage(1);
            setIsFlipping(false);
        }
    }, [open]);

    // Use hex colors from database, with fallbacks
    const coverColor = useMemo(() => binder?.color || "#ffffff", [binder?.color]);
    const spineColor = useMemo(() => binder?.spineColor || "#1f2937", [binder?.spineColor]);
    const pageColor = useMemo(() => binder?.pageColor || "#f6ead6", [binder?.pageColor]);

    // Determine grid size from binder size (default to 3x3 if not set)
    const gridSize = useMemo(() => {
        const size = binder?.size || "3x3";
        if (size === "2x2") return { cols: 2, total: 4 };
        if (size === "4x4") return { cols: 4, total: 16 };
        return { cols: 3, total: 9 }; // default 3x3
    }, [binder?.size]);

    // Calculate total pages - always allow up to 20 pages for navigation
    const totalPages = useMemo(() => {
        return 20; // Always allow navigation through 20 pages
    }, []);

    // Fill slots for a page based on slotIndex and pageNumber
    const getPageSlots = (page: number) => {
        // Filter cards for this page
        const pageCards = binderCards.filter(bc => 
            bc.pageNumber === page || (!bc.pageNumber && page === 1)
        );
        
        // Create a map of slotIndex -> card
        const slotMap = new Map<number, typeof binderCards[0]>();
        pageCards.forEach(card => {
            if (card.slotIndex !== null && card.slotIndex !== undefined) {
                slotMap.set(card.slotIndex, card);
            }
        });
        
        // Fill slots array
        const slots = Array.from({ length: gridSize.total }, (_, i) => {
            const card = slotMap.get(i);
            if (!card) return null;
            const cardDetail = cardDetails.get(card.cardId);
            const isInCollection = collectionCardIds.has(card.cardId);
            return {
                id: card.id,
                cardId: card.cardId,
                imageUrl: cardDetail?.image_uris?.small || cardDetail?.image_uris?.normal || null,
                title: cardDetail?.name || null,
                isInCollection,
            };
        });
        return slots;
    };

    // Handle page change with animation
    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages || isFlipping) return;

        setIsFlipping(true);
        setTimeout(() => {
            setCurrentPage(newPage);
            setTimeout(() => {
                setIsFlipping(false);
            }, 50); // Small delay to ensure state update
        }, 300); // Half of animation duration
    };

    // Escape to close and keyboard navigation
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !editModalOpen && !deleting) onClose();
            // Arrow keys for navigation
            if (e.key === "ArrowLeft" && currentPage > 1 && !isFlipping) {
                handlePageChange(currentPage - 1);
            }
            if (e.key === "ArrowRight" && currentPage < totalPages && !isFlipping) {
                handlePageChange(currentPage + 1);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose, editModalOpen, deleting, currentPage, totalPages, isFlipping]);

    // Left page: Page N (or cover if page 1)
    // Page 1: Cover | Page 1
    // Page 2: Page 2 | Page 3
    // Page 3: Page 4 | Page 5
    // So when viewing page N: Left = Page N, Right = Page N+1 (or Page 1 if N=1)
    const leftPageSlots = useMemo(() => {
        if (currentPage === 1) return null; // Will show cover
        return getPageSlots(currentPage); // Show current page on left
    }, [currentPage, binderCards, cardDetails, gridSize.total, collectionCardIds]);
    
    // Right page: Page N+1 (or Page 1 if viewing page 1)
    const rightPageSlots = useMemo(() => {
        if (currentPage === 1) return getPageSlots(1); // Page 1 shows Page 1 on right
        if (currentPage >= totalPages) {
            // On last page, show empty page on right
            return Array.from({ length: gridSize.total }, () => null);
        }
        return getPageSlots(currentPage + 1); // Show next page
    }, [currentPage, binderCards, cardDetails, gridSize.total, totalPages, collectionCardIds]);

    // Render a single page component
    const renderPage = (slots: (BinderCard | null)[], pageNumber: number) => (
        <div
            className="
                relative rounded-2xl
                border border-black/10 dark:border-white/10
                shadow-xl
                overflow-hidden
                w-full h-full
                min-h-[400px]
            "
            style={{ backgroundColor: pageColor }}
        >
            {/* paper grain */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.10] dark:opacity-[0.12]"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(0deg, currentColor 0px, transparent 1px, transparent 6px)",
                }}
            />

            <div className="relative p-4 sm:p-5">
                {/* pocket grid */}
                <div
                    className={`grid gap-3 sm:gap-4 ${gridSize.cols === 2 ? "grid-cols-2" :
                        gridSize.cols === 4 ? "grid-cols-4" :
                            "grid-cols-3"
                        }`}
                >
                    {slots.map((slot, idx) => (
                        <div
                            key={idx}
                            className="
                                aspect-[2.5/3.5]
                                rounded-lg
                                border border-black/10 dark:border-white/10
                                bg-black/5 dark:bg-white/5
                                overflow-hidden
                                relative
                                shadow-sm
                            "
                            title={slot?.title ?? (slot ? "Card" : "Empty slot")}
                        >
                            {/* pocket "lip" */}
                            <div className="absolute inset-x-0 top-0 h-3 bg-white/25 dark:bg-black/20" />

                            {slot?.imageUrl ? (
                                <img
                                    src={slot.imageUrl}
                                    alt={slot.title ?? "Card"}
                                    className={`h-full w-full object-cover ${slot.isInCollection === false ? "opacity-60 grayscale" : ""}`}
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                    <div
                                        className="
                                            w-[84%] h-[86%]
                                            rounded-md
                                            border border-black/15 dark:border-white/15
                                            bg-white/40 dark:bg-black/15
                                            shadow-inner
                                            flex items-center justify-center
                                        "
                                    >
                                        <div className="text-xs opacity-60 px-2 text-center leading-snug">
                                            {slot ? (
                                                "Card"
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPendingSlotIndex(idx);
                                                        setPendingPageNumber(pageNumber);
                                                        setAddToBinderModalOpen(true);
                                                    }}
                                                    className="flex flex-col items-center justify-center gap-1 hover:opacity-90 transition-opacity cursor-pointer text-black/60 dark:text-white/60 border border-black/15 dark:border-white/15 rounded-md p-2"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span>Add Card</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // Render the cover component
    const renderCover = () => (
        <div
            className="
                relative rounded-2xl
                border border-black/10 dark:border-white/10
                shadow-xl
                overflow-hidden
                w-full h-full
                min-h-[400px]
            "
            style={{ backgroundColor: coverColor }}
        >
            {/* cover shine */}
            <div
                aria-hidden="true"
                className="absolute inset-0 opacity-5"
                style={{
                    background:
                        "linear-gradient(120deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 35%, rgba(0,0,0,0.10) 100%)",
                }}
            />

            {/* faux "stitched" edge */}
            <div
                aria-hidden="true"
                className="absolute inset-0 rounded-2xl"
                style={{
                    boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.12)",
                }}
            />

            {/* label plate */}
            <div className="absolute left-5 top-5 right-5">
                <div
                    className="
                        rounded-xl
                        border border-black/15
                        bg-white/80
                        backdrop-blur
                        px-4 py-3
                        text-[#193f44]
                        shadow-md
                    "
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wider opacity-90">
                                DeckHaven Binder
                            </p>
                            <p className="text-lg font-semibold truncate">{binder?.name}</p>
                            {binder?.description?.trim() ? (
                                <p className="text-sm opacity-75 line-clamp-2 mt-0.5">{binder.description}</p>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!open || !binder) return null;

    return (
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center"
            aria-modal="true"
            role="dialog"
            aria-label="Open Binder"
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" onMouseDown={onClose} />

            {/* Modal Shell */}
            <div
                className="
          relative w-[min(1100px,96vw)] max-h-[92vh]
          overflow-hidden
          rounded-2xl
          border border-[#42c99c] dark:border-[#82664e]
          bg-[#f6ead6] dark:bg-[#0f2a2c]
          text-[#193f44] dark:text-[#e8d5b8]
          shadow-2xl
        "
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 p-4 border-b border-black/10 dark:border-white/10">
                    <div className="min-w-0">
                        <h3 className="text-lg font-semibold truncate">{binder.name}</h3>
                        <p className="text-sm opacity-70 truncate">
                            {binder.description?.trim()
                                ? binder.description
                                : `${binder._count?.binderCards ?? binderCards.length} cards`}
                        </p>

                    </div>
                    <button
                        className="
                            inline-flex items-center gap-2
                            px-3 py-2 rounded-md text-sm
                            bg-black/5 dark:bg-white/5
                            hover:bg-black/10 dark:hover:bg-white/10
                            border border-black/10 dark:border-white/10
                            flex-shrink-0
                            transition-colors
                            "
                        type="button"
                        onClick={() => setEditModalOpen(true)}
                    >
                        <Edit className="w-5 h-5" />
                        <span className="text-sm">Edit Binder</span>
                    </button>
                    <button
                        className="
                            inline-flex items-center gap-2
                            px-3 py-2 rounded-md text-sm
                            bg-red-500/10 dark:bg-red-500/20
                            hover:bg-red-500/20 dark:hover:bg-red-500/30
                            border border-red-500/30 dark:border-red-500/40
                            text-red-600 dark:text-red-400
                            flex-shrink-0
                            transition-colors
                            disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        type="button"
                        onClick={async () => {
                            if (!binder || !confirm(`Are you sure you want to delete "${binder.name}"? This action cannot be undone.`)) {
                                return;
                            }
                            setDeleting(true);
                            try {
                                const response = await fetch(`/api/binders/${binder.id}`, {
                                    method: "DELETE",
                                });
                                if (!response.ok) {
                                    throw new Error("Failed to delete binder");
                                }
                                onClose();
                                if (onSuccess) {
                                    onSuccess();
                                }
                            } catch (err) {
                                alert(err instanceof Error ? err.message : "Failed to delete binder");
                            } finally {
                                setDeleting(false);
                            }
                        }}
                        disabled={deleting}
                    >
                        <Trash className="w-5 h-5" />
                        <span className="text-sm">{deleting ? "Deleting..." : "Delete Binder"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="
              p-2 rounded-md
              bg-black/5 dark:bg-white/5
              hover:bg-black/10 dark:hover:bg-white/10
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-[#42c99c]
              dark:focus:ring-[#82664e]
            "
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Binder Scene */}
                <div className="p-4 sm:p-6">
                    {/* “Table” surface */}
                    <div
                        className="
              relative
              rounded-2xl
              border border-black/10 dark:border-white/10
              bg-[#e8d5b8] dark:bg-[#173c3f]
              p-4 sm:p-6
              overflow-hidden
            "
                    >
                        {/* subtle diagonal texture */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 opacity-[0.08] dark:opacity-[0.10]"
                            style={{
                                backgroundImage:
                                    "repeating-linear-gradient(135deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 12px)",
                            }}
                        />

                        {/* Binder open layout */}
                        {loadingCards ? (
                            <div className="flex items-center justify-center min-h-[400px]">
                                <div className="text-center">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#42c99c] dark:border-[#82664e] mb-4"></div>
                                    <p className="text-sm opacity-70">Loading binder cards...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_70px_1fr] items-stretch">
                                {/* LEFT SIDE - Cover on page 1, current page on page 2+ */}
                                <div className="relative w-full h-full">
                                    {currentPage === 1 ? (
                                        <div
                                            className={`
                                                relative w-full h-full
                                                transition-all duration-500 ease-in-out
                                                ${isFlipping ? "opacity-0 scale-95" : "opacity-100 scale-100"}
                                            `}
                                        >
                                            {renderCover()}
                                        </div>
                                    ) : leftPageSlots ? (
                                        <div
                                            className={`
                                                relative w-full h-full
                                                transition-all duration-500 ease-in-out
                                                ${isFlipping ? "opacity-0 scale-95" : "opacity-100 scale-100"}
                                            `}
                                        >
                                            {renderPage(leftPageSlots, currentPage)}
                                        </div>
                                    ) : (
                                        <div className="relative w-full h-full">
                                            {renderPage(getPageSlots(currentPage), currentPage)}
                                        </div>
                                    )}
                                </div>

                                {/* RINGS / SPINE */}
                                <div className="relative flex items-center justify-center">
                                    <div
                                        className="
                                            relative h-full w-full
                                            rounded-2xl
                                            border border-black/10 dark:border-white/10
                                            overflow-hidden
                                        "
                                        style={{ backgroundColor: spineColor }}
                                    >
                                        {/* spine highlight */}
                                        <div
                                            aria-hidden="true"
                                            className="absolute inset-0 opacity-40"
                                            style={{
                                                background:
                                                    "linear-gradient(90deg, rgba(255,255,255,0.22), rgba(255,255,255,0.06), rgba(0,0,0,0.10))",
                                            }}
                                        />

                                        {/* inner "hinge" line */}
                                        <div className="absolute inset-y-0 left-1/2 w-px bg-black/15 dark:bg-white/15" />
                                    </div>
                                </div>

                                {/* RIGHT PAGE - Next page (or current page if page 1) */}
                                <div className="relative w-full h-full">
                                    <div
                                        className={`
                                            relative w-full h-full
                                            transition-all duration-500 ease-in-out
                                            ${isFlipping ? "opacity-0 scale-95" : "opacity-100 scale-100"}
                                        `}
                                    >
                                        {rightPageSlots ? renderPage(rightPageSlots, currentPage === 1 ? 1 : currentPage + 1) : renderPage(getPageSlots(currentPage), currentPage)}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {!loadingCards && (
                            <div className="mt-6 flex items-center justify-between px-4">
                                <button
                                    type="button"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || isFlipping}
                                    className="
                                        flex items-center gap-2
                                        px-4 py-2 rounded-md
                                        bg-[#e8d5b8] dark:bg-[#173c3f]
                                        border border-[#42c99c] dark:border-[#82664e]
                                        text-[#193f44] dark:text-[#e8d5b8]
                                        hover:bg-black/10 dark:hover:bg-white/10
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        transition-colors
                                        focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                                        dark:focus:ring-[#82664e]
                                    "
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </button>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm opacity-70">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                            let pageNum: number;
                                            if (totalPages <= 7) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 4) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 3) {
                                                pageNum = totalPages - 6 + i;
                                            } else {
                                                pageNum = currentPage - 3 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    type="button"
                                                    onClick={() => handlePageChange(pageNum)}
                                                    disabled={isFlipping}
                                                    className={`
                                                        px-3 py-1.5 rounded-md text-sm
                                                        transition-colors
                                                        focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                                                        dark:focus:ring-[#82664e]
                                                        disabled:opacity-50 disabled:cursor-not-allowed
                                                        ${currentPage === pageNum
                                                            ? "bg-[#42c99c] dark:bg-[#82664e] text-white font-semibold"
                                                            : "bg-[#e8d5b8] dark:bg-[#173c3f] text-[#193f44] dark:text-[#e8d5b8] border border-[#42c99c] dark:border-[#82664e] hover:bg-black/10 dark:hover:bg-white/10"
                                                        }
                                                    `}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= totalPages || isFlipping}
                                    className="
                                        flex items-center gap-2
                                        px-4 py-2 rounded-md
                                        bg-[#e8d5b8] dark:bg-[#173c3f]
                                        border border-[#42c99c] dark:border-[#82664e]
                                        text-[#193f44] dark:text-[#e8d5b8]
                                        hover:bg-black/10 dark:hover:bg-white/10
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        transition-colors
                                        focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                                        dark:focus:ring-[#82664e]
                                    "
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* bottom shadow to “lift” binder off table */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-10 bottom-4 h-10 blur-2xl opacity-25"
                            style={{ background: "radial-gradient(closest-side, rgba(0,0,0,0.55), transparent)" }}
                        />
                    </div>
                </div>
            </div>

            {/* Edit Binder Modal */}
            <EditBinderModal
                open={editModalOpen}
                binder={binder}
                onClose={() => setEditModalOpen(false)}
                onSuccess={() => {
                    setEditModalOpen(false);
                    if (onSuccess) {
                        onSuccess();
                    }
                }}
            />

            {/* Add to Binder Modal */}
            <AddToBinderModal
                open={addToBinderModalOpen}
                binderId={binder.id}
                binderGame={binder.game ?? "mtg"}
                currentPage={pendingPageNumber ?? currentPage}
                cardsPerPage={gridSize.total}
                pendingSlotIndex={pendingSlotIndex}
                    onClose={() => {
                        setAddToBinderModalOpen(false);
                        setPendingSlotIndex(null);
                        setPendingPageNumber(null);
                    }}
                onAdded={async () => {
                    // Refresh binder cards after adding
                    const response = await fetch(`/api/binders/${binder.id}`);
                    if (response.ok) {
                        const data = await response.json();
                        setBinderCards(data.binder?.binderCards || []);
                        
                        // Refetch card details for new cards
                        const newCards = data.binder?.binderCards || [];
                        const detailsMap = new Map<string, ScryfallCard>();
                        for (const bc of newCards) {
                            if (!cardDetails.has(bc.cardId)) {
                                try {
                                    const cardResponse = await fetch(`/api/scryfall/card/${bc.cardId}`);
                                    if (cardResponse.ok) {
                                        const cardData = await cardResponse.json();
                                        detailsMap.set(bc.cardId, cardData);
                                    }
                                } catch (err) {
                                    console.warn(`Failed to fetch card ${bc.cardId}:`, err);
                                }
                            }
                        }
                        setCardDetails(prev => new Map([...prev, ...detailsMap]));
                    }
                }}
            />
        </div>
    );
}