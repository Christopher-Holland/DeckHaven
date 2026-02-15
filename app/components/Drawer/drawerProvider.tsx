"use client";

import React, { createContext, useContext, useMemo, useReducer } from "react";

export type DrawerType =
    | null
    | "CARD_VIEW"
    | "BINDER_CARD_VIEW"
    | "EDIT_BINDER"
    | "NEW_BINDER"
    | "EDIT_DECK"
    | "CREATE_DECK"
    | "FILTERS"
    | "CONFIRM";

export type DrawerPayload = Record<string, any> | null;

type DrawerState = {
    type: DrawerType;
    payload: DrawerPayload;
};

type DrawerAction =
    | { type: "OPEN"; drawerType: Exclude<DrawerType, null>; payload?: DrawerPayload }
    | { type: "CLOSE" }
    | { type: "SET_PAYLOAD"; payload: DrawerPayload };

const initialState: DrawerState = { type: null, payload: null };

function reducer(state: DrawerState, action: DrawerAction): DrawerState {
    switch (action.type) {
        case "OPEN":
            return { type: action.drawerType, payload: action.payload ?? null };
        case "CLOSE":
            return { type: null, payload: null };
        case "SET_PAYLOAD":
            return { ...state, payload: action.payload };
        default:
            return state;
    }
}

const DrawerContext = createContext<{
    state: DrawerState;
    open: (drawerType: Exclude<DrawerType, null>, payload?: DrawerPayload) => void;
    close: () => void;
    setPayload: (payload: DrawerPayload) => void;
} | null>(null);

export function DrawerProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const api = useMemo(
        () => ({
            state,
            open: (drawerType: Exclude<DrawerType, null>, payload?: DrawerPayload) =>
                dispatch({ type: "OPEN", drawerType, payload }),
            close: () => dispatch({ type: "CLOSE" }),
            setPayload: (payload: DrawerPayload) => dispatch({ type: "SET_PAYLOAD", payload }),
        }),
        [state]
    );

    return <DrawerContext.Provider value={api}>{children}</DrawerContext.Provider>;
}

export function useDrawer() {
    const ctx = useContext(DrawerContext);
    if (!ctx) throw new Error("useDrawer must be used within DrawerProvider");
    return ctx;
}