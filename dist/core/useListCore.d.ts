import type { FieldSchema, GeneralAction, ListConfig, ListSnapshot, ListState, RowAction, RowId } from "../types";
export interface UseListCoreResult<TRow = any, TRowId extends RowId = RowId> {
    state: ListState<TRow>;
    fields: Array<FieldSchema<TRow>>;
    generalActions?: Array<GeneralAction<TRow, TRowId>>;
    rowActions?: Array<RowAction<TRow, TRowId>>;
    setFilters: (updater: (prev: ListState<TRow>["filters"]) => ListState<TRow>["filters"]) => void;
    setSort: (sort: ListState<TRow>["sort"] | undefined) => void;
    setPageIndex: (pageIndex: number) => void;
    setPageSize: (pageSize: number) => void;
    clearSelection: () => void;
    selectAllVisible: () => void;
    triggerGeneralAction: (actionId: string) => Promise<void>;
    triggerRowAction: (actionId: string, rowIndex: number) => Promise<void>;
    confirmActiveAction: (payload?: unknown) => Promise<void>;
    cancelActiveAction: () => void;
    exportState: () => ListSnapshot<TRow, TRowId>;
    refresh: () => Promise<void>;
}
export declare const useListCore: <TRow = any, TRowId extends RowId = RowId>(config: ListConfig<TRow, TRowId>) => UseListCoreResult<TRow, TRowId>;
//# sourceMappingURL=useListCore.d.ts.map