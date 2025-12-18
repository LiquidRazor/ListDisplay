import type { ReactNode } from "react";
import type { ModalConfig } from "./modal";
import type { GeneralActionContext, RowActionContext } from "./actionContext";
/**
 * Visual style variants available for list actions.
 *
 * @public
 */
export type ActionKind = "default" | "primary" | "secondary" | "danger" | "ghost";
/**
 * Base interface for all list actions, defining common properties like label, icon, and modal configuration.
 *
 * @public
 */
export interface ListActionBase<TRow = any, TRowId = string | number> {
    /**
     * Unique identifier for this action.
     */
    id: string;
    /**
     * Display label for the action.
     */
    label: string;
    /**
     * Optional icon element to display alongside the label.
     */
    icon?: ReactNode;
    /**
     * Visual style variant for the action button {@link ActionKind}.
     */
    kind?: ActionKind;
    /**
     * Whether this action conceptually owns a modal (confirm/custom).
     */
    opensModal?: boolean;
    /**
     * Modal configuration if the action requires one.
     */
    modal?: ModalConfig<TRow, TRowId>;
}
/**
 * Action that operates on the entire list or selected rows, not tied to a specific row.
 *
 * @public
 */
export interface GeneralAction<TRow = any, TRowId = string | number> extends ListActionBase<TRow, TRowId> {
    /**
     * Whether a non-empty selection is required for this action.
     */
    requiresSelection?: boolean;
    /**
     * Handler executed when the action is triggered (after any modal interaction, if applicable).
     */
    handler?: (ctx: GeneralActionContext<TRow, TRowId>) => void | Promise<void>;
}
/**
 * Action that operates on a specific row in the list.
 *
 * @public
 */
export interface RowAction<TRow = any, TRowId = string | number> extends ListActionBase<TRow, TRowId> {
    /**
     * Handler executed for a specific row.
     */
    handler?: (ctx: RowActionContext<TRow, TRowId>) => void | Promise<void>;
}
//# sourceMappingURL=actions.d.ts.map