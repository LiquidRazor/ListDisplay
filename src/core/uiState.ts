import type { ListUiState, RowId } from "../types";

/**
 * Creates the initial UI state for a list component with no active actions
 * or open modals.
 *
 * @returns A fresh {@link ListUiState} instance with default values.
 * @internal
 */
export const createInitialUiState = (): ListUiState => ({
  activeAction: undefined,
  modal: {
    isOpen: false,
  },
});

/**
 * Opens a modal for a specific action by updating the UI state to mark both
 * the active action and the modal state as open.
 *
 * @param prev - The previous UI state to update.
 * @param actionId - Unique identifier of the action triggering the modal.
 * @param type - Whether the action is "general" (list-level) or "row" (row-specific).
 * @param rowId - Optional row identifier, required when type is "row".
 * @returns Updated {@link ListUiState} with the modal open and action metadata set.
 * @internal
 */
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

/**
 * Closes the currently open modal by resetting the modal state while
 * preserving the rest of the UI state.
 *
 * @param prev - The previous UI state to update.
 * @returns Updated {@link ListUiState} with the modal closed.
 * @internal
 */
export const closeModal = (prev: ListUiState): ListUiState => ({
  ...prev,
  modal: {
    isOpen: false,
  },
});

/**
 * Clears the active action metadata from the UI state, typically called
 * after an action has been completed or cancelled.
 *
 * @param prev - The previous UI state to update.
 * @returns Updated {@link ListUiState} with no active action.
 * @internal
 */
export const clearActiveAction = (prev: ListUiState): ListUiState => ({
  ...prev,
  activeAction: undefined,
});
