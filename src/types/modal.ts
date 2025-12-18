// src/types/modal.ts

import type {ReactNode} from "react";
import type {GeneralActionContext,} from "./actionContext";

export interface ConfirmModalConfig {
    type: "confirm";
    title: string;
    description?: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
}

/**
 * Context provided to a custom modal renderer.
 * Extends general context and optionally carries row info.
 */
export interface CustomModalRenderContext<
    TRow = any,
    TRowId = string | number,
> extends GeneralActionContext<TRow, TRowId> {
    row?: TRow;
    rowIndex?: number;

    /**
     * Close the modal without necessarily performing the action.
     */
    close: () => void;

    /**
     * Complete the modal interaction and optionally pass a payload
     * to the action handler.
     */
    submit: (payload?: unknown) => void;
}

export interface CustomModalConfig<TRow = any, TRowId = string | number> {
    type: "custom";
    render: (ctx: CustomModalRenderContext<TRow, TRowId>) => ReactNode;
}

export type ModalConfig<TRow = any, TRowId = string | number> =
    | ConfirmModalConfig
    | CustomModalConfig<TRow, TRowId>;
