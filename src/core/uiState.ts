import type { ListUiState, RowId } from "../types";

export const createInitialUiState = (): ListUiState => ({
  activeAction: undefined,
  modal: {
    isOpen: false,
  },
});

export const openModalForAction = (
  prev: ListUiState,
  actionId: string,
  type: "general" | "row",
  rowId?: RowId
): ListUiState => ({
  ...prev,
  activeAction: {
    type,
    actionId,
    rowId,
  },
  modal: {
    isOpen: true,
    actionId,
    rowId,
  },
});

export const closeModal = (prev: ListUiState): ListUiState => ({
  ...prev,
  modal: {
    isOpen: false,
  },
});

export const clearActiveAction = (prev: ListUiState): ListUiState => ({
  ...prev,
  activeAction: undefined,
});
