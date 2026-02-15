"use client";

import React from "react";
import { Drawer } from "./Drawer";
import { useDrawer } from "./drawerProvider";

// Drawer content components
import { EditBinderDrawer } from "./EditBinderDrawer";
import { NewBinderDrawer } from "./NewBinderDrawer";
import { EditDeckDrawer } from "./EditDeckDrawer";
import { CreateDeckDrawer } from "./CreateDeckDrawer";
import { BinderCardDrawer } from "./BinderCardDrawer";

export function DrawerHost() {
    const { state } = useDrawer();

    if (!state.type) return null;

    switch (state.type) {
        case "CARD_VIEW":
            return (
                <Drawer title="Card View">
                    <div className="text-sm opacity-80">Card view drawer not yet implemented</div>
                </Drawer>
            );

        case "BINDER_CARD_VIEW":
            return (
                <Drawer title="">
                    <BinderCardDrawer />
                </Drawer>
            );

        case "EDIT_BINDER":
            return (
                <Drawer title="Edit Binder">
                    <EditBinderDrawer />
                </Drawer>
            );

        case "NEW_BINDER":
            return (
                <Drawer title="New Binder">
                    <NewBinderDrawer />
                </Drawer>
            );

        case "EDIT_DECK":
            return (
                <Drawer title="Edit Deck">
                    <EditDeckDrawer />
                </Drawer>
            );

        case "CREATE_DECK":
            return (
                <Drawer title="Create Deck">
                    <CreateDeckDrawer />
                </Drawer>
            );

        default:
            return (
                <Drawer title="Drawer">
                    <div className="text-sm opacity-80">Unknown drawer type: {state.type}</div>
                </Drawer>
            );
    }
}
