// src/types/uiState.ts

import type { RowId } from "./selection";

export type ListStatus = "idle" | "loading" | "ready" | "streaming" | "error";

export interface ActiveActionState {
  type: "general" | "row";
  actionId: string;
  rowId?: RowId;
}

export interface ModalState {
  isOpen: boolean;
  actionId?: string;
  rowId?: RowId;
}

/**
 * UI-specific state (separate from data state).
 */
export interface ListUiState {
  activeAction?: ActiveActionState;
  modal?: ModalState;
}
