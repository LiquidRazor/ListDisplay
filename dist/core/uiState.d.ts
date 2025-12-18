import type { ListUiState, RowId } from "../types";
export declare const createInitialUiState: () => ListUiState;
export declare const openModalForAction: (prev: ListUiState, actionId: string, type: "general" | "row", rowId?: RowId) => ListUiState;
export declare const closeModal: (prev: ListUiState) => ListUiState;
export declare const clearActiveAction: (prev: ListUiState) => ListUiState;
//# sourceMappingURL=uiState.d.ts.map