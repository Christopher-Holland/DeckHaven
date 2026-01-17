"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Trash, X, ChevronLeft, ChevronRight, Trash2, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import EditBinderModal from "../editBinderModal";
import type { ScryfallCard } from "@/app/lib/scryfall";
import AddToBinderModal from "../addToBinderModal";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@stackframe/stack";
import ConfirmDeleteModal from "@/app/components/confirmDeleteModal";

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
    slotNumber?: number | null; // Global slot number
    imageUrl?: string | null; // optional for later
    title?: string | null;    // optional for tooltip
    isInCollection?: boolean; // whether card is in user's collection
};

export default function BinderPage() {
    const router = useRouter();
    const params = useParams();
    const binderId = params?.binderId as string;
    const user = useUser();
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isFlipping, setIsFlipping] = useState(false);
    const [flipDirection, setFlipDirection] = useState<"forward" | "backward" | null>(null);
    const [targetPage, setTargetPage] = useState<number | null>(null); // Track target page during animation
    const [binder, setBinder] = useState<Binder | null>(null);
    const [binderCards, setBinderCards] = useState<Array<{
        id: string;
        cardId: string;
        slotNumber?: number | null;
    }>>([]);
    const [cardDetails, setCardDetails] = useState<Map<string, ScryfallCard>>(new Map());
    const [loadingCards, setLoadingCards] = useState(false);
    const [addToBinderModalOpen, setAddToBinderModalOpen] = useState(false);
    const [pendingSlotNumber, setPendingSlotNumber] = useState<number | null>(null);
    const [collectionCardQuantities, setCollectionCardQuantities] = useState<Map<string, number>>(new Map());
    const [draggedCard, setDraggedCard] = useState<{ id: string; cardId: string; slotNumber: number } | null>(null);
    const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
    const [dragOverTrash, setDragOverTrash] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
    const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
    const [addingToCollection, setAddingToCollection] = useState<string | null>(null);

    // Fetch binder data when page loads
    useEffect(() => {
        if (!binderId || !user) return;

        async function fetchBinderData() {
            try {
                setLoadingCards(true);

                // Fetch binder info
                const binderResponse = await fetch(`/api/binders/${binderId}`);
                if (!binderResponse.ok) {
                    if (binderResponse.status === 404) {
                        router.push("/collection/binders");
                        return;
                    }
                    throw new Error("Failed to fetch binder");
                }

                const binderData = await binderResponse.json();
                setBinder(binderData.binder);

                const cards = binderData.binder?.binderCards || [];
                setBinderCards(cards);

                // Fetch user's collection to check ownership and quantities
                try {
                    const collectionResponse = await fetch(`/api/collection?page=1&limit=10000`);
                    if (collectionResponse.ok) {
                        const collectionData = await collectionResponse.json();
                        const quantitiesMap = new Map<string, number>();
                        collectionData.items?.forEach((item: { cardId: string; quantity: number }) => {
                            const currentQty = quantitiesMap.get(item.cardId) || 0;
                            quantitiesMap.set(item.cardId, currentQty + item.quantity);
                        });
                        setCollectionCardQuantities(quantitiesMap);
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
                console.error("Error fetching binder data:", err);
            } finally {
                setLoadingCards(false);
            }
        }

        fetchBinderData();
    }, [binderId, user, router]);

    // Reset to page 1 when binder changes
    useEffect(() => {
        setCurrentPage(1);
        setIsFlipping(false);
    }, [binderId]);

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

    // Helper function to convert page and slot to global slot number
    const pageAndSlotToSlotNumber = (page: number, slot: number, cardsPerPage: number) => {
        return (page - 1) * cardsPerPage + slot;
    };

    // Calculate total pages - page 30 is the last left page, then back cover
    // View 1: Cover | Page 1
    // View 16: Page 30 | Back Cover
    const totalPages = useMemo(() => {
        return 16; // 15 views of content pages + 1 view with back cover
    }, []);

    // Fill slots for a page based on slotNumber
    const getPageSlots = (page: number) => {
        const cardsPerPage = gridSize.total;
        const startSlotNumber = (page - 1) * cardsPerPage;
        const endSlotNumber = startSlotNumber + cardsPerPage - 1;

        // Count instances of each cardId before this page
        const instancesBeforePage = new Map<string, number>();
        binderCards.forEach(card => {
            if (card.slotNumber !== null && card.slotNumber !== undefined && card.slotNumber < startSlotNumber) {
                const count = instancesBeforePage.get(card.cardId) || 0;
                instancesBeforePage.set(card.cardId, count + 1);
            }
        });

        // Filter and sort cards that belong to this page
        const pageCards = binderCards
            .filter(bc => {
                if (bc.slotNumber === null || bc.slotNumber === undefined) return false;
                return bc.slotNumber >= startSlotNumber && bc.slotNumber <= endSlotNumber;
            })
            .sort((a, b) => {
                const aSlot = a.slotNumber ?? Infinity;
                const bSlot = b.slotNumber ?? Infinity;
                return aSlot - bSlot;
            });

        // Create a map of slot index within page -> card
        const slotMap = new Map<number, typeof binderCards[0]>();
        pageCards.forEach(card => {
            if (card.slotNumber !== null && card.slotNumber !== undefined) {
                const slotInPage = card.slotNumber % cardsPerPage;
                slotMap.set(slotInPage, card);
            }
        });

        // Track instances within this page as we process in slot number order
        const instancesInPage = new Map<string, number>();
        
        // First pass: process cards in slot number order to track instances correctly
        const cardInstanceMap = new Map<number, { card: typeof binderCards[0]; isInCollection: boolean }>();
        pageCards.forEach(card => {
            if (card.slotNumber === null || card.slotNumber === undefined) return;
            
            const instancesBefore = instancesBeforePage.get(card.cardId) || 0;
            const instancesSoFarInPage = instancesInPage.get(card.cardId) || 0;
            const totalInstancesSeen = instancesBefore + instancesSoFarInPage;
            
            // Get collection quantity for this card
            const collectionQuantity = collectionCardQuantities.get(card.cardId) || 0;
            
            // Mark as in collection only if we haven't exceeded the collection quantity
            const isInCollection = totalInstancesSeen < collectionQuantity;
            
            // Store the result
            const slotInPage = card.slotNumber % cardsPerPage;
            cardInstanceMap.set(slotInPage, { card, isInCollection });
            
            // Increment the count for this card in this page
            instancesInPage.set(card.cardId, instancesSoFarInPage + 1);
        });

        // Fill slots array
        const slots = Array.from({ length: gridSize.total }, (_, i) => {
            const entry = cardInstanceMap.get(i);
            if (!entry) return null;
            
            const { card, isInCollection } = entry;
            const cardDetail = cardDetails.get(card.cardId);

            // Use higher resolution images for all grid sizes to prevent blurriness
            let imageUrl = null;
            if (cardDetail?.image_uris) {
                // All grid sizes: use large or png for better quality
                imageUrl = cardDetail.image_uris.large || cardDetail.image_uris.png || cardDetail.image_uris.normal || null;
            }

            return {
                id: card.id,
                cardId: card.cardId,
                slotNumber: card.slotNumber,
                imageUrl,
                title: cardDetail?.name || null,
                isInCollection,
            };
        });
        return slots;
    };

    // Handle page change with animation
    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages || isFlipping) return;

        const direction = newPage > currentPage ? "forward" : "backward";
        setFlipDirection(direction);
        setTargetPage(newPage); // Set target page immediately
        setIsFlipping(true);

        // After flip animation completes, update the current page
        setTimeout(() => {
            setCurrentPage(newPage);
            setTargetPage(null); // Clear target page
            setIsFlipping(false);
            setFlipDirection(null);
        }, 600); // Match animation duration
    };

    // Escape to close and keyboard navigation
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !editModalOpen && !deleting) router.push("/collection/binders");
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
    }, [editModalOpen, deleting, currentPage, totalPages, isFlipping, router]);

    // Calculate which physical pages to show based on view number
    // View 1: Cover | Page 1
    // View 2: Page 2 | Page 3
    // View 3: Page 4 | Page 5
    // View N: Page 2(N-1) | Page 2(N-1)+1 (or Cover | Page 1 if N=1)
    const getLeftPageNumber = (viewNumber: number) => {
        if (viewNumber === 1) return null; // Cover
        return 2 * (viewNumber - 1); // Page 2, 4, 6, etc.
    };

    const getRightPageNumber = (viewNumber: number) => {
        if (viewNumber === 1) return 1; // Page 1
        const leftPage = getLeftPageNumber(viewNumber);
        // When left page is 30, show back cover
        if (leftPage === 30) return null; // null means back cover
        return 2 * (viewNumber - 1) + 1; // Page 3, 5, 7, etc.
    };

    // Left page: Cover on view 1, then Page 2, 4, 6, etc.
    const leftPageSlots = useMemo(() => {
        // Use target page during animation to prevent flicker
        const displayView = targetPage ?? currentPage;
        const leftPageNum = getLeftPageNumber(displayView);

        if (leftPageNum === null) return null; // Will show cover

        // When flipping forward, the right page becomes the left page
        if (isFlipping && flipDirection === "forward" && targetPage !== null) {
            const newLeftPageNum = getLeftPageNumber(targetPage);
            if (newLeftPageNum === null) return null;
            return getPageSlots(newLeftPageNum);
        }

        return getPageSlots(leftPageNum);
    }, [currentPage, targetPage, binderCards, cardDetails, gridSize.total, collectionCardQuantities, isFlipping, flipDirection]);

    // Right page: Page 1 on view 1, then Page 3, 5, 7, etc., back cover on view 16
    const rightPageSlots = useMemo(() => {
        // Use target page during animation to prevent flicker
        const displayView = targetPage ?? currentPage;
        const rightPageNum = getRightPageNumber(displayView);

        // null means back cover
        if (rightPageNum === null) return null;

        if (rightPageNum > 30) {
            // Beyond max pages, show empty
            return Array.from({ length: gridSize.total }, () => null);
        }

        // When flipping forward, show the new page that will appear on the right
        if (isFlipping && flipDirection === "forward" && targetPage !== null) {
            const newRightPageNum = getRightPageNumber(targetPage);
            if (newRightPageNum === null) return null; // Back cover
            if (newRightPageNum > 30) {
                return Array.from({ length: gridSize.total }, () => null);
            }
            return getPageSlots(newRightPageNum);
        }

        return getPageSlots(rightPageNum);
    }, [currentPage, targetPage, binderCards, cardDetails, gridSize.total, totalPages, collectionCardQuantities, isFlipping, flipDirection]);

    // Handle moving a card to a new slot
    const handleMoveCard = async (binderCardId: string, newSlotNumber: number) => {
        if (!binder) return;

        try {
            const response = await fetch(`/api/binders/${binder.id}/cards/${binderCardId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newSlotNumber }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Failed to move card" }));
                throw new Error(errorData.error || "Failed to move card");
            }

            // Refresh binder cards
            const binderResponse = await fetch(`/api/binders/${binder.id}`);
            if (binderResponse.ok) {
                const data = await binderResponse.json();
                const cards = data.binder?.binderCards || [];
                setBinderCards(cards);
            }
        } catch (error) {
            console.error("Error moving card:", error);
            alert(error instanceof Error ? error.message : "Failed to move card");
        }
    };

    // Handle deleting a card from the binder
    const handleDeleteCard = async (binderCardId: string) => {
        if (!binder) return;

        try {
            const response = await fetch(`/api/binders/${binder.id}/cards/${binderCardId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Failed to delete card" }));
                throw new Error(errorData.error || "Failed to delete card");
            }

            // Refresh binder cards
            const binderResponse = await fetch(`/api/binders/${binder.id}`);
            if (binderResponse.ok) {
                const data = await binderResponse.json();
                const cards = data.binder?.binderCards || [];
                setBinderCards(cards);
            }
        } catch (error) {
            console.error("Error deleting card:", error);
            alert(error instanceof Error ? error.message : "Failed to delete card");
        }
    };

    // Handle adding a card to collection
    const handleAddToCollection = async (cardId: string) => {
        setAddingToCollection(cardId);
        const currentQuantity = collectionCardQuantities.get(cardId) || 0;
        const newQuantity = currentQuantity + 1;

        try {
            // Optimistically update UI
            setCollectionCardQuantities((prev) => {
                const next = new Map(prev);
                next.set(cardId, newQuantity);
                return next;
            });

            // Save to database
            const response = await fetch("/api/collection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cardId, quantity: newQuantity }),
            });

            if (!response.ok) {
                throw new Error("Failed to add card to collection");
            }
        } catch (error) {
            console.error("Error adding card to collection:", error);
            // Revert on error
            setCollectionCardQuantities((prev) => {
                const next = new Map(prev);
                if (currentQuantity === 0) {
                    next.delete(cardId);
                } else {
                    next.set(cardId, currentQuantity);
                }
                return next;
            });
            alert(error instanceof Error ? error.message : "Failed to add card to collection");
        } finally {
            setAddingToCollection(null);
        }
    };

    // Render a single page component
    const renderPage = (slots: (BinderCard | null)[], pageNumber: number) => (
        <div
            className="
                relative rounded-2xl
                border border-black/10 dark:border-white/10
                shadow-xl
                overflow-hidden
                w-full h-full
                min-h-[500px]
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

            <div className="relative p-3 sm:p-4">
                {/* pocket grid */}
                <div
                    className={`grid ${gridSize.cols === 2 ? "grid-cols-2 gap-2 sm:gap-3" :
                        gridSize.cols === 4 ? "grid-cols-4 gap-1.5 sm:gap-2" :
                            "grid-cols-3 gap-2 sm:gap-3"
                        }`}
                >
                    {slots.map((slot, idx) => {
                        const slotNumber = pageAndSlotToSlotNumber(pageNumber, idx, gridSize.total);
                        const isDragOver = dragOverSlot === slotNumber;

                        return (
                            <div
                                key={idx}
                                className={`
                                    aspect-[2.5/3.5]
                                    rounded-md
                                    border border-black/10 dark:border-white/10
                                    bg-black/5 dark:bg-white/5
                                    overflow-hidden
                                    relative
                                    shadow-sm
                                    ${isDragOver ? "ring-2 ring-[#42c99c] dark:ring-[#82664e] bg-[#42c99c]/20 dark:bg-[#82664e]/20" : ""}
                                `}
                                title={slot?.title ?? (slot ? "Card" : "Empty slot")}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragOverSlot(slotNumber);
                                }}
                                onDragLeave={() => {
                                    setDragOverSlot(null);
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragOverSlot(null);

                                    if (draggedCard) {
                                        handleMoveCard(draggedCard.id, slotNumber);
                                        setDraggedCard(null);
                                    }
                                }}
                            >
                                {/* pocket "lip" */}
                                <div className="absolute inset-x-0 top-0 h-3 bg-white/25 dark:bg-black/20" />

                                {slot?.imageUrl ? (
                                    <div
                                        className="relative h-full w-full group"
                                        onMouseEnter={() => slot.isInCollection === false && setHoveredCardId(slot.cardId)}
                                        onMouseLeave={() => setHoveredCardId(null)}
                                    >
                                        <img
                                            src={slot.imageUrl}
                                            alt={slot.title ?? "Card"}
                                            className={`h-full w-full object-cover cursor-move transition-opacity ${slot.isInCollection === false ? "opacity-60 grayscale" : ""}`}
                                            draggable
                                            onDragStart={(e) => {
                                                if (slot && slot.slotNumber !== null && slot.slotNumber !== undefined) {
                                                    setDraggedCard({
                                                        id: slot.id,
                                                        cardId: slot.cardId,
                                                        slotNumber: slot.slotNumber,
                                                    });
                                                    e.dataTransfer.effectAllowed = "move";
                                                }
                                            }}
                                            onDragEnd={() => {
                                                setDraggedCard(null);
                                                setDragOverSlot(null);
                                            }}
                                        />
                                        {/* Hover popup for cards not in collection */}
                                        {slot.isInCollection === false && hoveredCardId === slot.cardId && (
                                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                                <div className="bg-[#f6ead6] dark:bg-[#0f2a2c] border border-[#42c99c] dark:border-[#82664e] rounded-lg p-3 shadow-lg">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAddToCollection(slot.cardId);
                                                        }}
                                                        disabled={addingToCollection === slot.cardId}
                                                        className="
                                                            px-3 py-1.5 text-xs font-medium
                                                            bg-[#42c99c] dark:bg-[#82664e]
                                                            text-white
                                                            rounded-md
                                                            hover:bg-[#2fbf8f] dark:hover:bg-[#9b7a5f]
                                                            transition-colors
                                                            disabled:opacity-50 disabled:cursor-not-allowed
                                                        "
                                                    >
                                                        {addingToCollection === slot.cardId ? "Adding..." : "Add to Collection"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
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
                                            <div className="text-[10px] sm:text-xs opacity-60 px-1.5 sm:px-2 text-center leading-snug">
                                                {slot ? (
                                                    "Card"
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const slotNumber = pageAndSlotToSlotNumber(pageNumber, idx, gridSize.total);
                                                            setPendingSlotNumber(slotNumber);
                                                            setAddToBinderModalOpen(true);
                                                        }}
                                                        className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 hover:opacity-90 transition-opacity cursor-pointer text-black/60 dark:text-white/60 border border-black/15 dark:border-white/15 rounded p-1.5 sm:p-2"
                                                    >
                                                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        <span className="text-[10px] sm:text-xs">Add Card</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Page number at bottom - subtle, no border or padding */}
                <div className="text-center mt-0.5">
                    <span className="text-[9px] sm:text-[10px] opacity-40 text-black/50 dark:text-white/50">
                        {pageNumber}
                    </span>
                </div>
            </div>
        </div>
    );

    // Render the back cover component (same as front but without label plate)
    const renderBackCover = () => (
        <div
            className="
                relative rounded-2xl
                border border-black/10 dark:border-white/10
                shadow-xl
                overflow-hidden
                w-full h-full
                min-h-[500px]
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
                min-h-[500px]
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


    if (!binder) {
        return (
            <div className="min-h-screen bg-[#f6ead6] dark:bg-[#0f2a2c] flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#42c99c] dark:border-[#82664e] mb-4"></div>
                    <p className="text-sm opacity-70">Loading binder...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f6ead6] dark:bg-[#0f2a2c]">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-6 border-b border-black/10 dark:border-white/10 pb-4">
                    <div className="min-w-0">
                        <h1 className="text-2xl font-semibold truncate text-center justify-center text-[#193f44] dark:text-[#e8d5b8]">{binder.name}</h1>
                    </div>
                    <div className="flex items-center gap-2">
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
                            onClick={() => {
                                if (!binder) return;
                                setDeleteCardId(null); // Clear card ID to indicate binder deletion
                                setDeleteModalOpen(true);
                            }}
                            disabled={deleting}
                        >
                            <Trash className="w-5 h-5" />
                            <span className="text-sm">{deleting ? "Deleting..." : "Delete Binder"}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/collection/binders")}
                            className="
                                    p-2 rounded-md
                                    bg-black/5 dark:bg-white/5
                                    hover:bg-black/10 dark:hover:bg-white/10
                                    transition-colors
                                    focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                                    dark:focus:ring-[#82664e]
                                "
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Binder Scene */}
                <div className="p-4 sm:p-6">
                    {/* "Table" surface */}
                    <div
                        className="
                                relative
                                rounded-2xl
                                border border-black/10 dark:border-white/10
                                bg-[#e8d5b8] dark:bg-[#173c3f]
                                p-4 sm:p-6
                                overflow-visible
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
                            <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_70px_1fr] items-stretch" style={{ perspective: "2000px" }}>
                                {/* Previous Button - Positioned vertically in the middle on the left */}
                                {!loadingCards && currentPage > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={isFlipping}
                                        className="
                                                absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-20
                                                flex items-center justify-center
                                                w-10 h-10 rounded-full
                                                bg-[#e8d5b8] dark:bg-[#173c3f]
                                                border border-[#42c99c] dark:border-[#82664e]
                                                text-[#193f44] dark:text-[#e8d5b8]
                                                hover:bg-black/10 dark:hover:bg-white/10
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                transition-colors
                                                focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                                                dark:focus:ring-[#82664e]
                                                shadow-lg
                                            "
                                        aria-label="Previous page"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                )}

                                {/* Next Button - Positioned vertically in the middle on the right */}
                                {!loadingCards && currentPage < totalPages && (
                                    <button
                                        type="button"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={isFlipping}
                                        className="
                                                absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-20
                                                flex items-center justify-center
                                                w-10 h-10 rounded-full
                                                bg-[#e8d5b8] dark:bg-[#173c3f]
                                                border border-[#42c99c] dark:border-[#82664e]
                                                text-[#193f44] dark:text-[#e8d5b8]
                                                hover:bg-black/10 dark:hover:bg-white/10
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                transition-colors
                                                focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                                                dark:focus:ring-[#82664e]
                                                shadow-lg
                                            "
                                        aria-label="Next page"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                )}

                                {/* LEFT SIDE - Cover on page 1, current page on page 2+ */}
                                <div className="relative w-full h-full" style={{ transformStyle: "preserve-3d" }}>
                                    {(targetPage ?? currentPage) === 1 ? (
                                        <div
                                            className={`
                                                    relative w-full h-full
                                                    transition-opacity duration-600 ease-in-out
                                                    ${isFlipping && flipDirection === "backward" ? "opacity-0" : "opacity-100"}
                                                `}
                                        >
                                            {renderCover()}
                                        </div>
                                    ) : leftPageSlots ? (
                                        <div
                                            className={`
                                                    relative w-full h-full
                                                    transition-opacity duration-600 ease-in-out
                                                    ${isFlipping && flipDirection === "backward" ? "opacity-0" : "opacity-100"}
                                                `}
                                        >
                                            {renderPage(leftPageSlots, getLeftPageNumber(targetPage ?? currentPage) ?? 0)}
                                        </div>
                                    ) : (
                                        <div className="relative w-full h-full">
                                            {renderPage(getPageSlots(getLeftPageNumber(targetPage ?? currentPage) ?? 1), getLeftPageNumber(targetPage ?? currentPage) ?? 1)}
                                        </div>
                                    )}
                                </div>

                                {/* RINGS / SPINE */}
                                <div className="relative flex items-center justify-center z-10">
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
                                <div className="relative w-full h-full" style={{ transformStyle: "preserve-3d" }}>
                                    {/* Flipping page - shows back side during forward flip */}
                                    {isFlipping && flipDirection === "forward" && targetPage !== null && (
                                        <div
                                            className="absolute inset-0 w-full h-full"
                                            style={{
                                                transformOrigin: "left center",
                                                transform: "rotateY(-180deg)",
                                                transition: "transform 0.6s ease-in-out",
                                                backfaceVisibility: "hidden",
                                                zIndex: 20,
                                            }}
                                        >
                                            {/* Back of the page (next page content, flipped horizontally) */}
                                            <div
                                                className="relative w-full h-full"
                                                style={{
                                                    transform: "scaleX(-1)", // Flip horizontally to show back
                                                }}
                                            >
                                                {getRightPageNumber(targetPage) === null ? (
                                                    renderBackCover()
                                                ) : (
                                                    renderPage(
                                                        rightPageSlots || Array.from({ length: gridSize.total }, () => null),
                                                        getRightPageNumber(targetPage) ?? 0
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Current right page - flips to become left page */}
                                    <div
                                        className={`
                                                relative w-full h-full
                                                ${isFlipping && flipDirection === "forward"
                                                ? "transition-transform duration-600 ease-in-out transform rotateY(-180deg)"
                                                : isFlipping && flipDirection === "backward"
                                                    ? "transition-opacity duration-600 ease-in-out opacity-0"
                                                    : "transition-opacity duration-600 ease-in-out opacity-100"
                                            }
                                            `}
                                        style={{
                                            transformStyle: "preserve-3d",
                                            transformOrigin: "left center",
                                        }}
                                    >
                                        {rightPageSlots === null ? (
                                            // Show back cover when rightPageSlots is null
                                            renderBackCover()
                                        ) : rightPageSlots ? (
                                            renderPage(rightPageSlots, getRightPageNumber(targetPage ?? currentPage) ?? 0)
                                        ) : (
                                            renderPage(getPageSlots(getRightPageNumber(targetPage ?? currentPage) ?? 0), getRightPageNumber(targetPage ?? currentPage) ?? 0)
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* bottom shadow to "lift" binder off table */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-10 bottom-4 h-10 blur-2xl opacity-25"
                            style={{ background: "radial-gradient(closest-side, rgba(0,0,0,0.55), transparent)" }}
                        />
                    </div>

                    {/* Pagination Controls */}
                    {!loadingCards && (
                        <div
                            className="
                                sticky bottom-0 z-20
                                mt-4 px-4 py-3
                                flex items-center justify-between
                                border-t border-black/10 dark:border-white/10
                                bg-[#f6ead6]/95 dark:bg-[#0f2a2c]/95
                                backdrop-blur
                                "
                        >
                            <button
                                type="button"
                                onClick={() => handlePageChange(1)}
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
                                <SkipBack className="w-4 h-4" />
                                To Beginning
                            </button>

                            {/* Recycling Bin */}
                            <div
                                className={`
        flex items-center justify-center
        w-12 h-12 rounded-full
        border-2 border-dashed
        transition-all duration-200
        ${dragOverTrash
                                        ? "bg-red-500/20 border-red-500 scale-110"
                                        : "bg-[#e8d5b8]/50 dark:bg-[#173c3f]/50 border-[#42c99c] dark:border-[#82664e]"
                                    }
        ${draggedCard ? "opacity-100" : "opacity-50"}
      `}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragOverTrash(true);
                                }}
                                onDragLeave={() => {
                                    setDragOverTrash(false);
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragOverTrash(false);

                                    if (draggedCard) {
                                        setDeleteCardId(draggedCard.id);
                                        setDeleteModalOpen(true);
                                        setDraggedCard(null);
                                    }
                                }}
                                title="Drop card here to remove from binder"
                            >
                                <Trash2
                                    className={`
          w-5 h-5 transition-colors
          ${dragOverTrash ? "text-red-500" : "text-[#193f44] dark:text-[#e8d5b8]"}
        `}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => handlePageChange(totalPages)}
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
                                To End
                                <SkipForward className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Binder Modal */}
            <EditBinderModal
                open={editModalOpen}
                binder={binder}
                onClose={() => setEditModalOpen(false)}
                onSuccess={async () => {
                    setEditModalOpen(false);
                    // Refresh binder data
                    const response = await fetch(`/api/binders/${binderId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setBinder(data.binder);
                    }
                }}
            />

            {/* Add to Binder Modal */}
            <AddToBinderModal
                open={addToBinderModalOpen}
                binderId={binder.id}
                binderGame={binder.game ?? "mtg"}
                cardsPerPage={gridSize.total}
                pendingSlotNumber={pendingSlotNumber}
                onClose={() => {
                    setAddToBinderModalOpen(false);
                    setPendingSlotNumber(null);
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
            <ConfirmDeleteModal
                open={deleteModalOpen}
                title={deleteCardId ? "Remove Card from Binder" : "Delete Binder"}
                message={
                    deleteCardId
                        ? "Are you sure you want to remove this card from the binder? This action cannot be undone."
                        : `Are you sure you want to delete "${binder?.name}"? This cannot be undone.`
                }
                loading={deleting}
                onCancel={() => {
                    setDeleteModalOpen(false);
                    setDeleteCardId(null);
                }}
                onConfirm={async () => {
                    if (deleteCardId) {
                        // Delete card from binder
                        setDeleting(true);
                        try {
                            await handleDeleteCard(deleteCardId);
                            setDeleteModalOpen(false);
                            setDeleteCardId(null);
                        } catch (err) {
                            // Error is already handled in handleDeleteCard
                        } finally {
                            setDeleting(false);
                        }
                    } else {
                        // Delete entire binder
                        setDeleting(true);
                        try {
                            const response = await fetch(`/api/binders/${binder?.id}`, { method: "DELETE" });
                            if (!response.ok) {
                                throw new Error("Failed to delete binder");
                            }
                            router.push("/collection/binders");
                        } catch (err) {
                            alert(err instanceof Error ? err.message : "Failed to delete binder");
                        } finally {
                            setDeleting(false);
                            setDeleteModalOpen(false);
                        }
                    }
                }}
            />
        </div>
    );
}

