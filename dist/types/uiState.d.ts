import type { RowId } from "./selection";
/**
 * Status values representing the lifecycle of the list data layer.
 * @internal
 */
export type ListStatus = "idle" | "loading" | "ready" | "streaming" | "error";
/**
 * Tracks which action is currently active in the UI, optionally tied to a row.
 * @internal
 */
export interface ActiveActionState {
    /**
     * Whether the active action targets the entire list or a single row.
     */
    type: "general" | "row";
    /**
     * Identifier of the action as defined in the configuration.
     */
    actionId: string;
    /**
     * Identifier of the row associated with the action, when applicable.
     */
    rowId?: RowId;
}
/**
 * State for the modal experience tied to actions.
 * @internal
 */
export interface ModalState {
    /**
     * Whether a modal is currently shown.
     */
    isOpen: boolean;
    /**
     * Identifier of the action owning the modal.
     */
    actionId?: string;
    /**
     * Identifier of the row associated with the modal, if any.
     */
    rowId?: RowId;
}
/**
 * UI-specific state (separate from data state), managing active actions and modal visibility.
 * @internal
 */
export interface ListUiState {
    /**
     * The currently active action in the UI, if any.
     * {@link ActiveActionState}
     */
    activeAction?: ActiveActionState;
    /**
     * The current modal state, if a modal is open or configured.
     * {@link ModalState}
     */
    modal?: ModalState;
}
//# sourceMappingURL=uiState.d.ts.map