import type { RowId } from "./selection";

/**
 * Status values representing the lifecycle of the list data layer.
 */
export type ListStatus = "idle" | "loading" | "ready" | "streaming" | "error";

/**
 * Tracks which action is currently active in the UI, optionally tied to a row.
 */
export interface ActiveActionState {
  /** Whether the active action targets the entire list or a single row. */
  type: "general" | "row";

  /** Identifier of the action as defined in the configuration. */
  actionId: string;

  /** Identifier of the row associated with the action, when applicable. */
  rowId?: RowId;
}

/**
 * State for the modal experience tied to actions.
 */
export interface ModalState {
  /** Whether a modal is currently shown. */
  isOpen: boolean;

  /** Identifier of the action owning the modal. */
  actionId?: string;

  /** Identifier of the row associated with the modal, if any. */
  rowId?: RowId;
}

/**
 * UI-specific state (separate from data state).
 */
export interface ListUiState {
  activeAction?: ActiveActionState;
  modal?: ModalState;
}
