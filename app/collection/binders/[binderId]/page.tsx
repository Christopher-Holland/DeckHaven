"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Trash, X, ChevronLeft, ChevronRight, SkipBack, SkipForward, GripVertical } from "lucide-react";
import type { ScryfallCard } from "@/app/lib/scryfall";
import { isLightHex, paddedMaterialStyle } from "@/app/lib/binderMaterial";
import AddToBinderModal from "../addToBinderModal";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@stackframe/stack";
import ConfirmDeleteModal from "@/app/components/confirmDeleteModal";
import { useDrawer } from "@/app/components/Drawer/drawerProvider";
import { useToast } from "@/app/components/ToastContext";

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
    const { open } = useDrawer();
    const { showToast } = useToast();
    const [rearranging, setRearranging] = useState(false);
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
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
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
                    // Failed to fetch collection
                }

                // Fetch card details from Scryfall (batch API to avoid N+1)
                const cardIds = [...new Set(cards.map((bc: { cardId: string }) => bc.cardId).filter(Boolean))];
                const detailsMap = new Map<string, ScryfallCard>();
                if (cardIds.length > 0) {
                    try {
                        const batchResponse = await fetch("/api/scryfall/cards/batch", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ids: cardIds }),
                        });
                        if (batchResponse.ok) {
                            const batchData = await batchResponse.json();
                            const cardsObj = batchData.cards || {};
                            Object.entries(cardsObj).forEach(([id, card]) => {
                                detailsMap.set(id, card as ScryfallCard);
                            });
                        }
                    } catch (err) {
                        // Failed to fetch cards
                    }
                }
                setCardDetails(detailsMap);
            } catch (err) {
                // Error fetching binder data
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
    const coverColor = useMemo(() => binder?.color || "#1a1a1a", [binder?.color]);
    const spineColor = useMemo(() => binder?.spineColor || "#111111", [binder?.spineColor]);
    const pageColor = useMemo(() => binder?.pageColor || "#0d0d0d", [binder?.pageColor]);
    const pageIsLight = useMemo(() => isLightHex(pageColor), [pageColor]);

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
            if (e.key === "Escape" && !deleting) router.push("/collection/binders");
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
    }, [deleting, currentPage, totalPages, isFlipping, router]);

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
            showToast("Card moved.", "success");
        } catch (error) {
            showToast(error instanceof Error ? error.message : "Failed to move card", "error");
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
            showToast("Card removed from binder.", "success");
        } catch (error) {
            showToast(error instanceof Error ? error.message : "Failed to delete card", "error");
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
            showToast("Card added to collection.", "success");
        } catch (error) {
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
            showToast(error instanceof Error ? error.message : "Failed to add card to collection", "error");
        } finally {
            setAddingToCollection(null);
        }
    };

    // Handle removing a card from collection (keeps it in binder, card becomes grayed out)
    const handleRemoveFromCollection = async (cardId: string) => {
        const currentQuantity = collectionCardQuantities.get(cardId) || 0;
        if (currentQuantity <= 0) return;

        const newQuantity = currentQuantity - 1;

        try {
            // Optimistically update UI
            setCollectionCardQuantities((prev) => {
                const next = new Map(prev);
                if (newQuantity === 0) {
                    next.delete(cardId);
                } else {
                    next.set(cardId, newQuantity);
                }
                return next;
            });

            // Save to database
            const response = await fetch("/api/collection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cardId, quantity: newQuantity }),
            });

            if (!response.ok) {
                throw new Error("Failed to remove card from collection");
            }
            showToast("Card removed from collection.", "success");
        } catch (error) {
            // Revert on error
            setCollectionCardQuantities((prev) => {
                const next = new Map(prev);
                next.set(cardId, currentQuantity);
                return next;
            });
            showToast(error instanceof Error ? error.message : "Failed to remove card from collection", "error");
        }
    };

    // Render a single page — clear side-loading pocket sheet over padded backing
    const renderPage = (slots: (BinderCard | null)[], pageNumber: number, side: "left" | "right" = "right") => {
        // Side-loading: openings face the outer edge of the binder (away from spine)
        const loadFromLeft = side === "left";

        return (
            <div
                className="
                    relative rounded-sm
                    overflow-hidden
                    w-full h-full
                    min-h-[360px] sm:min-h-[440px] lg:min-h-[500px]
                    shadow-[inset_0_0_40px_rgba(0,0,0,0.35),0_8px_24px_rgba(0,0,0,0.35)]
                "
                style={{ backgroundColor: pageColor }}
            >
                {/* Padded page core */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-40"
                    style={{
                        backgroundImage:
                            "linear-gradient(180deg, rgba(255,255,255,0.06), transparent 30%, rgba(0,0,0,0.2))",
                    }}
                />

                {/* Clear vinyl pocket sheet */}
                <div
                    className="relative h-full p-2.5 sm:p-3.5"
                    style={{
                        background:
                            "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 40%, rgba(255,255,255,0.08) 100%)",
                    }}
                >
                    <div
                        className={`
                            grid h-full
                            ${gridSize.cols === 2 ? "grid-cols-2 gap-1.5 sm:gap-2" :
                                gridSize.cols === 4 ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 sm:gap-1.5" :
                                    "grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2"
                            }
                        `}
                    >
                        {slots.map((slot, idx) => {
                            const slotNumber = pageAndSlotToSlotNumber(pageNumber, idx, gridSize.total);
                            const isDragOver = dragOverSlot === slotNumber;
                            const muted = pageIsLight ? "text-black/50" : "text-white/55";
                            const mutedHover = pageIsLight ? "hover:text-black/80" : "hover:text-white/85";
                            const dashBorder = pageIsLight
                                ? "border-black/25 hover:border-black/45"
                                : "border-white/25 hover:border-white/45";
                            const pocketBg = pageIsLight ? "bg-black/10" : "bg-black/25";
                            const pocketRing = pageIsLight ? "ring-black/20" : "ring-white/25";
                            const seamBorder = pageIsLight ? "border-black/20" : "border-white/30";

                            return (
                                <div
                                    key={idx}
                                    className={`
                                        aspect-[2.5/3.5]
                                        relative overflow-hidden
                                        ${pocketBg}
                                        shadow-[inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-2px_6px_rgba(0,0,0,0.25)]
                                        ring-1 ${pocketRing}
                                        ${isDragOver ? "ring-2 ring-[var(--theme-accent)] bg-[var(--theme-accent)]/25" : ""}
                                    `}
                                    title={slot?.title ?? (slot ? "Card" : "Empty slot")}
                                    onDragOver={(e) => {
                                        if (rearranging) {
                                            e.preventDefault();
                                            setDragOverSlot(slotNumber);
                                        }
                                    }}
                                    onDragLeave={() => {
                                        setDragOverSlot(null);
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setDragOverSlot(null);

                                        if (rearranging && draggedCard) {
                                            handleMoveCard(draggedCard.id, slotNumber);
                                            setDraggedCard(null);
                                        }
                                    }}
                                >
                                    {/* Pocket weld / seam edges */}
                                    <div
                                        aria-hidden="true"
                                        className={`pointer-events-none absolute inset-0 border ${seamBorder}`}
                                        style={{
                                            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)",
                                        }}
                                    />

                                    {/* Side-loading opening (clear slit on outer edge) */}
                                    <div
                                        aria-hidden="true"
                                        className={`
                                            pointer-events-none absolute top-1 bottom-1 w-[3px] sm:w-1
                                            bg-gradient-to-b from-white/50 via-white/15 to-white/40
                                            ${loadFromLeft ? "left-0 rounded-r-sm" : "right-0 rounded-l-sm"}
                                        `}
                                        style={{
                                            boxShadow: loadFromLeft
                                                ? "2px 0 4px rgba(0,0,0,0.2)"
                                                : "-2px 0 4px rgba(0,0,0,0.2)",
                                        }}
                                    />

                                    {/* Gloss across pocket face */}
                                    <div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-0 opacity-30"
                                        style={{
                                            background:
                                                "linear-gradient(115deg, rgba(255,255,255,0.35) 0%, transparent 38%, transparent 62%, rgba(255,255,255,0.12) 100%)",
                                        }}
                                    />

                                    {slot?.imageUrl ? (
                                        <div
                                            className={`relative h-full w-full ${!rearranging ? "cursor-pointer" : ""}`}
                                            onClick={() => {
                                                if (!rearranging && slot) {
                                                    const cardDetail = cardDetails.get(slot.cardId) ?? { name: slot.title ?? "Unknown Card", image_uris: null };
                                                    open("BINDER_CARD_VIEW", {
                                                        card: cardDetail,
                                                        binderCardId: slot.id,
                                                        cardId: slot.cardId,
                                                        isInCollection: slot.isInCollection ?? false,
                                                        onRemove: async () => {
                                                            await handleDeleteCard(slot.id);
                                                            const response = await fetch(`/api/binders/${binder?.id}`);
                                                            if (response.ok) {
                                                                const data = await response.json();
                                                                setBinderCards(data.binder?.binderCards || []);
                                                            }
                                                        },
                                                        onAddToCollection: async () => {
                                                            await handleAddToCollection(slot.cardId);
                                                        },
                                                        onRemoveFromCollection: async () => {
                                                            await handleRemoveFromCollection(slot.cardId);
                                                        },
                                                    });
                                                }
                                            }}
                                        >
                                            <img
                                                src={slot.imageUrl}
                                                alt={slot.title ?? "Card"}
                                                className={`h-full w-full object-cover transition-opacity ${rearranging ? "cursor-move" : ""} ${slot.isInCollection === false ? "opacity-60 grayscale" : ""}`}
                                                draggable={rearranging}
                                                onDragStart={(e) => {
                                                    if (rearranging && slot && slot.slotNumber !== null && slot.slotNumber !== undefined) {
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
                                                onClick={(e) => rearranging && e.stopPropagation()}
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            {slot ? (
                                                <span className={`text-[10px] opacity-50 ${muted}`}>Card</span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const slotNumber = pageAndSlotToSlotNumber(pageNumber, idx, gridSize.total);
                                                        setPendingSlotNumber(slotNumber);
                                                        setAddToBinderModalOpen(true);
                                                    }}
                                                    className={`
                                                        flex flex-col items-center justify-center gap-0.5
                                                        ${muted} ${mutedHover}
                                                        border border-dashed ${dashBorder}
                                                        rounded-sm px-2 py-2
                                                        transition-colors cursor-pointer
                                                    `}
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] tracking-wide uppercase">Add</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="absolute bottom-1 inset-x-0 text-center pointer-events-none">
                        <span className={`text-[9px] tracking-[0.2em] uppercase ${pageIsLight ? "text-black/35" : "text-white/35"}`}>
                            {pageNumber}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    // Zipper tooth strip used on cover outer edges
    const zipperEdge = (edge: "top" | "right" | "bottom" | "left") => {
        const isHorizontal = edge === "top" || edge === "bottom";
        return (
            <div
                aria-hidden="true"
                className={`
                    pointer-events-none absolute z-20
                    ${edge === "top" ? "top-0 inset-x-3 h-2" : ""}
                    ${edge === "bottom" ? "bottom-0 inset-x-3 h-2" : ""}
                    ${edge === "left" ? "left-0 inset-y-3 w-2" : ""}
                    ${edge === "right" ? "right-0 inset-y-3 w-2" : ""}
                `}
                style={{
                    backgroundImage: isHorizontal
                        ? "repeating-linear-gradient(90deg, #2a2a2a 0 4px, #6b6b6b 4px 5px, #1a1a1a 5px 9px, #8a8a8a 9px 10px)"
                        : "repeating-linear-gradient(180deg, #2a2a2a 0 4px, #6b6b6b 4px 5px, #1a1a1a 5px 9px, #8a8a8a 9px 10px)",
                    opacity: 0.85,
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.35)",
                }}
            />
        );
    };

    const renderBackCover = () => (
        <div
            className="
                relative rounded-sm
                overflow-hidden
                w-full h-full
                min-h-[360px] sm:min-h-[440px] lg:min-h-[500px]
                shadow-[0_12px_28px_rgba(0,0,0,0.45)]
            "
            style={paddedMaterialStyle(coverColor)}
        >
            {/* Soft padding bevel */}
            <div
                aria-hidden="true"
                className="absolute inset-[6px] rounded-sm pointer-events-none"
                style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12), inset 0 0 24px rgba(0,0,0,0.25)" }}
            />
            {zipperEdge("top")}
            {zipperEdge("right")}
            {zipperEdge("bottom")}
        </div>
    );

    const renderCover = () => {
        const light = isLightHex(coverColor);
        const plateFg = light ? "rgba(20,20,20,0.92)" : "rgba(245,245,245,0.95)";
        const plateMuted = light ? "rgba(20,20,20,0.55)" : "rgba(245,245,245,0.55)";
        const plateBorder = light ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.22)";
        const plateBg = light ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.28)";

        return (
            <div
                className="
                    relative rounded-sm
                    overflow-hidden
                    w-full h-full
                    min-h-[360px] sm:min-h-[440px] lg:min-h-[500px]
                    shadow-[0_12px_28px_rgba(0,0,0,0.45)]
                "
                style={paddedMaterialStyle(coverColor)}
            >
                <div
                    aria-hidden="true"
                    className="absolute inset-[6px] rounded-sm pointer-events-none"
                    style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12), inset 0 0 24px rgba(0,0,0,0.25)" }}
                />
                {zipperEdge("top")}
                {zipperEdge("left")}
                {zipperEdge("bottom")}

                {/* Embossed nameplate (printed Exo-Tec style, not a UI card) */}
                <div className="absolute left-6 top-7 right-6 sm:left-8 sm:top-9 sm:right-8">
                    <div
                        className="rounded-sm px-4 py-3.5 sm:px-5 sm:py-4"
                        style={{
                            color: plateFg,
                            background: plateBg,
                            border: `1px solid ${plateBorder}`,
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.2)",
                            backdropFilter: "blur(2px)",
                        }}
                    >
                        <p
                            className="text-[10px] sm:text-xs uppercase tracking-[0.28em] mb-1"
                            style={{ color: plateMuted }}
                        >
                            DeckHaven
                        </p>
                        <p className="text-xl sm:text-2xl font-semibold tracking-tight truncate leading-tight">
                            {binder?.name}
                        </p>
                        {binder?.description?.trim() ? (
                            <p className="text-sm mt-1.5 line-clamp-2 leading-snug" style={{ color: plateMuted }}>
                                {binder.description}
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    };


    if (!binder) {
        return (
            <div className="min-h-screen bg-[var(--theme-bg)] flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-accent)] mb-4"></div>
                    <p className="text-sm opacity-70">Loading binder...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--theme-bg)]">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex flex-col gap-3 mb-4 sm:mb-6 border-b border-black/10 dark:border-white/10 pb-4">
                    <div className="flex items-center justify-between gap-3 min-w-0">
                        <h1 className="text-xl sm:text-2xl font-semibold truncate text-[var(--theme-fg)]">{binder.name}</h1>
                        <button
                            type="button"
                            onClick={() => router.push("/collection/binders")}
                            className="
                                    p-2 rounded-md shrink-0
                                    bg-black/5 dark:bg-white/5
                                    hover:bg-black/10 dark:hover:bg-white/10
                                    transition-colors
                                    focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                                "
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            className={`
                                    inline-flex items-center gap-2
                                    px-2.5 sm:px-3 py-2 rounded-md text-sm
                                    flex-shrink-0
                                    transition-colors
                                    border
                                    ${rearranging
                                    ? "bg-[var(--theme-accent)]/20 border-[var(--theme-accent)] text-[var(--theme-fg)]"
                                    : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border-black/10 dark:border-white/10"
                                }
                                    `}
                            type="button"
                            onClick={() => setRearranging((prev) => !prev)}
                            aria-label={rearranging ? "Done rearranging" : "Rearrange"}
                        >
                            <GripVertical className="w-5 h-5" />
                            <span className="text-sm hidden sm:inline">{rearranging ? "Done Rearranging" : "Rearrange"}</span>
                        </button>
                        <button
                            className="
                                    inline-flex items-center gap-2
                                    px-2.5 sm:px-3 py-2 rounded-md text-sm
                                    bg-black/5 dark:bg-white/5
                                    hover:bg-black/10 dark:hover:bg-white/10
                                    border border-black/10 dark:border-white/10
                                    flex-shrink-0
                                    transition-colors
                                    "
                            type="button"
                            aria-label="Edit binder"
                            onClick={() => open("EDIT_BINDER", {
                                binder,
                                onSuccess: async () => {
                                    // Refresh binder data
                                    const response = await fetch(`/api/binders/${binderId}`);
                                    if (response.ok) {
                                        const data = await response.json();
                                        setBinder(data.binder);
                                    }
                                }
                            })}
                        >
                            <Edit className="w-5 h-5" />
                            <span className="text-sm hidden sm:inline">Edit Binder</span>
                        </button>
                        <button
                            type="button"
                            disabled
                            title="Coming soon"
                            className="
                                        hidden md:inline-flex px-3 py-2 rounded-md text-sm font-medium
                                        bg-black/5 dark:bg-white/5
                                        border border-[var(--theme-border)]
                                        opacity-60 cursor-not-allowed
                                        "
                        >
                            Export Deck
                        </button>
                        <button
                            className="
                                    inline-flex items-center gap-2
                                    px-2.5 sm:px-3 py-2 rounded-md text-sm
                                    bg-red-500/10 dark:bg-red-500/20
                                    hover:bg-red-500/20 dark:hover:bg-red-500/30
                                    border border-red-500/30 dark:border-red-500/40
                                    text-red-600 dark:text-red-400
                                    flex-shrink-0
                                    transition-colors
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    "
                            type="button"
                            aria-label="Delete binder"
                            onClick={() => {
                                if (!binder) return;
                                setDeleteModalOpen(true);
                            }}
                            disabled={deleting}
                        >
                            <Trash className="w-5 h-5" />
                            <span className="text-sm hidden sm:inline">{deleting ? "Deleting..." : "Delete Binder"}</span>
                        </button>
                    </div>
                </div>

                {/* Binder Scene — felt table + zippered binder shell */}
                <div className="py-2 sm:py-4 sm:px-4 lg:p-6">
                    <div
                        className="
                                relative
                                rounded-lg
                                border border-black/40
                                p-3 sm:p-5 lg:p-8
                                overflow-visible
                            "
                        style={{
                            background:
                                "radial-gradient(ellipse at center, #3a4540 0%, #1c2420 70%, #121816 100%)",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 50px rgba(0,0,0,0.45)",
                        }}
                    >
                        {/* felt nap */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 opacity-[0.14] rounded-lg"
                            style={{
                                backgroundImage:
                                    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
                            }}
                        />

                        {/* Binder open layout */}
                        {loadingCards ? (
                            <div className="flex items-center justify-center min-h-[400px]">
                                <div className="text-center">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-accent)] mb-4"></div>
                                    <p className="text-sm opacity-70">Loading binder cards...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_56px_1fr] items-stretch gap-3 lg:gap-0" style={{ perspective: "2000px" }}>
                                {/* Previous Button — desktop only; mobile uses footer */}
                                {!loadingCards && currentPage > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={isFlipping}
                                        className="
                                                hidden lg:flex
                                                absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-20
                                                items-center justify-center
                                                w-10 h-10 rounded-full
                                bg-[var(--theme-sidebar)]
                                border border-[var(--theme-border)]
                                text-[var(--theme-fg)]
                                hover:bg-black/10 dark:hover:bg-white/10
                                disabled:opacity-50 disabled:cursor-not-allowed
                                transition-colors
                                focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                                                shadow-lg
                                            "
                                        aria-label="Previous page"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                )}

                                {/* Next Button — desktop only; mobile uses footer */}
                                {!loadingCards && currentPage < totalPages && (
                                    <button
                                        type="button"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={isFlipping}
                                        className="
                                                hidden lg:flex
                                                absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-20
                                                items-center justify-center
                                                w-10 h-10 rounded-full
                                bg-[var(--theme-sidebar)]
                                border border-[var(--theme-border)]
                                text-[var(--theme-fg)]
                                hover:bg-black/10 dark:hover:bg-white/10
                                disabled:opacity-50 disabled:cursor-not-allowed
                                transition-colors
                                focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
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
                                            {renderPage(leftPageSlots, getLeftPageNumber(targetPage ?? currentPage) ?? 0, "left")}
                                        </div>
                                    ) : (
                                        <div className="relative w-full h-full">
                                            {renderPage(getPageSlots(getLeftPageNumber(targetPage ?? currentPage) ?? 1), getLeftPageNumber(targetPage ?? currentPage) ?? 1, "left")}
                                        </div>
                                    )}
                                </div>

                                {/* PADDED ZIP SPINE — desktop open-book only */}
                                <div className="relative hidden lg:flex items-center justify-center z-10 px-0.5">
                                    <div
                                        className="
                                                relative h-full w-full min-w-[52px]
                                                rounded-sm
                                                overflow-hidden
                                                shadow-[0_8px_20px_rgba(0,0,0,0.4)]
                                            "
                                        style={paddedMaterialStyle(spineColor)}
                                    >
                                        {/* Quilting / stitch channels */}
                                        <div
                                            aria-hidden="true"
                                            className="absolute inset-y-4 left-1/2 -translate-x-1/2 w-[2px]"
                                            style={{
                                                background:
                                                    "repeating-linear-gradient(180deg, rgba(255,255,255,0.35) 0 3px, transparent 3px 8px)",
                                                opacity: 0.5,
                                            }}
                                        />
                                        <div
                                            aria-hidden="true"
                                            className="absolute inset-y-3 left-[30%] w-px bg-black/25"
                                        />
                                        <div
                                            aria-hidden="true"
                                            className="absolute inset-y-3 right-[30%] w-px bg-black/25"
                                        />
                                        {/* Zipper pull suggestion at top of spine */}
                                        <div
                                            aria-hidden="true"
                                            className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-5 rounded-[2px]"
                                            style={{
                                                background: "linear-gradient(180deg, #c0c0c0, #6a6a6a)",
                                                boxShadow: "0 1px 3px rgba(0,0,0,0.5)",
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* RIGHT PAGE - Next page (or current page if page 1) */}
                                <div className="relative w-full h-full" style={{ transformStyle: "preserve-3d" }}>
                                    {/* Flipping page - shows back side during forward flip (desktop) */}
                                    {isFlipping && flipDirection === "forward" && targetPage !== null && (
                                        <div
                                            className="absolute inset-0 w-full h-full hidden lg:block"
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
                                                        getRightPageNumber(targetPage) ?? 0,
                                                        "right"
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
                                                ? "lg:transition-transform lg:duration-600 lg:ease-in-out lg:transform lg:rotateY(-180deg)"
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
                                            renderPage(rightPageSlots, getRightPageNumber(targetPage ?? currentPage) ?? 0, "right")
                                        ) : (
                                            renderPage(getPageSlots(getRightPageNumber(targetPage ?? currentPage) ?? 0), getRightPageNumber(targetPage ?? currentPage) ?? 0, "right")
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
                                mt-4 px-2 sm:px-4 py-3
                                flex items-center justify-between gap-2
                                border-t border-black/10 dark:border-white/10
                                bg-[var(--theme-bg)]/95
                                backdrop-blur
                                "
                        >
                            <button
                                type="button"
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1 || isFlipping}
                                className="
        flex items-center gap-1 sm:gap-2
        px-2.5 sm:px-4 py-2 rounded-md text-sm
                                bg-[var(--theme-sidebar)]
                                border border-[var(--theme-border)]
                                text-[var(--theme-fg)]
                                hover:bg-black/10 dark:hover:bg-white/10
                                disabled:opacity-50 disabled:cursor-not-allowed
                                transition-colors
                                focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
      "
                                aria-label="To beginning"
                            >
                                <SkipBack className="w-4 h-4" />
                                <span className="hidden sm:inline">To Beginning</span>
                            </button>

                            <div className="flex items-center gap-2 lg:hidden">
                                <button
                                    type="button"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage <= 1 || isFlipping}
                                    className="
                                        flex items-center justify-center
                                        w-10 h-10 rounded-full
                                        bg-[var(--theme-sidebar)]
                                        border border-[var(--theme-border)]
                                        text-[var(--theme-fg)]
                                        hover:bg-black/10 dark:hover:bg-white/10
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        transition-colors
                                        focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                                    "
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= totalPages || isFlipping}
                                    className="
                                        flex items-center justify-center
                                        w-10 h-10 rounded-full
                                        bg-[var(--theme-sidebar)]
                                        border border-[var(--theme-border)]
                                        text-[var(--theme-fg)]
                                        hover:bg-black/10 dark:hover:bg-white/10
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        transition-colors
                                        focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                                    "
                                    aria-label="Next page"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage >= totalPages || isFlipping}
                                className="
        flex items-center gap-1 sm:gap-2
        px-2.5 sm:px-4 py-2 rounded-md text-sm
                                bg-[var(--theme-sidebar)]
                                border border-[var(--theme-border)]
                                text-[var(--theme-fg)]
                                hover:bg-black/10 dark:hover:bg-white/10
                                disabled:opacity-50 disabled:cursor-not-allowed
                                transition-colors
                                focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
      "
                                aria-label="To end"
                            >
                                <span className="hidden sm:inline">To End</span>
                                <SkipForward className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

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

                        // Refetch card details for new cards (batch to avoid N+1)
                        const newCards = data.binder?.binderCards || [];
                        const idsToFetch = newCards
                            .map((bc: { cardId: string }) => bc.cardId)
                            .filter((id: string) => id && !cardDetails.has(id));
                        if (idsToFetch.length > 0) {
                            try {
                                const batchResponse = await fetch("/api/scryfall/cards/batch", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ ids: idsToFetch }),
                                });
                                if (batchResponse.ok) {
                                    const batchData = await batchResponse.json();
                                    const cardsObj = batchData.cards || {};
                                    setCardDetails((prev) => {
                                        const next = new Map(prev);
                                        Object.entries(cardsObj).forEach(([id, card]) => {
                                            next.set(id, card as ScryfallCard);
                                        });
                                        return next;
                                    });
                                }
                            } catch (err) {
                                // Failed to fetch cards
                            }
                        }
                    }
                }}
            />
            <ConfirmDeleteModal
                open={deleteModalOpen}
                title="Delete Binder"
                message={`Are you sure you want to delete "${binder?.name}"? This cannot be undone.`}
                loading={deleting}
                onCancel={() => setDeleteModalOpen(false)}
                onConfirm={async () => {
                    setDeleting(true);
                    try {
                        const response = await fetch(`/api/binders/${binder?.id}`, { method: "DELETE" });
                        if (!response.ok) {
                            throw new Error("Failed to delete binder");
                        }
                        router.push("/collection/binders");
                    } catch (err) {
                        showToast(err instanceof Error ? err.message : "Failed to delete binder", "error");
                    } finally {
                        setDeleting(false);
                        setDeleteModalOpen(false);
                    }
                }}
            />
        </div>
    );
}

