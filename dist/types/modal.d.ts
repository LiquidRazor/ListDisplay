import type { ReactNode } from "react";
import type { GeneralActionContext } from "./actionContext";
/**
 * Configuration for the built-in confirmation modal used by actions that need
 * a simple yes/no flow.
 */
export interface ConfirmModalConfig {
    /** Discriminator indicating a confirm modal. */
    type: "confirm";
    /** Title displayed at the top of the modal. */
    title: string;
    /** Optional descriptive text rendered under the title. */
    description?: ReactNode;
    /** Label for the confirm button. Defaults are provided by the UI layer. */
    confirmLabel?: string;
    /** Label for the cancel button. Defaults are provided by the UI layer. */
    cancelLabel?: string;
}
/**
 * Context provided to a custom modal renderer.
 * Extends general context and optionally carries row info.
 */
export interface CustomModalRenderContext<TRow = any, TRowId = string | number> extends GeneralActionContext<TRow, TRowId> {
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
/**
 * Configuration for a user-supplied modal renderer, allowing bespoke flows
 * while still participating in the ListDisplay action lifecycle.
 */
export interface CustomModalConfig<TRow = any, TRowId = string | number> {
    /** Discriminator indicating a custom modal. */
    type: "custom";
    /**
     * Render function that returns any React node to display. The provided
     * context contains helpers to close or submit the modal.
     */
    render: (ctx: CustomModalRenderContext<TRow, TRowId>) => ReactNode;
}
/**
 * Union describing the supported modal configurations for actions.
 */
export type ModalConfig<TRow = any, TRowId = string | number> = ConfirmModalConfig | CustomModalConfig<TRow, TRowId>;
//# sourceMappingURL=modal.d.ts.map