import {ListFeatureWithUI} from "../../core/contracts/listFeatureWithUI";
import {CoreListState} from "../../core/store/coreState";
import {getFeatureSlice, setFeatureSlice} from "../../core/store/featureState";

/**
 * Defines the selection mode for a list.
 *
 * @remarks
 * - "none": Selection is disabled, no rows can be selected
 * - "single": Only one row can be selected at a time
 * - "multiple": Multiple rows can be selected simultaneously
 *
 * @public
 */
export type SelectionMode = "none" | "single" | "multiple";

/**
 * Internal state slice for the selection feature.
 *
 * @remarks
 * This type represents the portion of the feature state that is managed by
 * the selection feature. It is stored in the global list state under the
 * feature's ID.
 *
 * @typeParam TRowId - The type of row identifier
 *
 * @public
 */
export type SelectionSlice<TRowId = any> = {
    /**
     * The current selection mode.
     */
    mode: SelectionMode;

    /**
     * The array of currently selected row IDs.
     */
    selectedIds: ReadonlyArray<TRowId>;
};

/**
 * API interface for managing row selection in a list.
 *
 * @remarks
 * This interface provides methods to query and modify the selection state.
 * It is returned by the selection feature and can be used by UI components
 * or other features to interact with the selection.
 *
 * @typeParam TRow - The type of row data
 * @typeParam TRowId - The type of row identifier
 *
 * @public
 */
export type SelectionApi<TRow = any, TRowId = any> = {
    /**
     * Retrieves the current selection state.
     *
     * @returns The current selection slice containing mode and selected IDs
     */
    getSelection: () => SelectionSlice<TRowId>;

    /**
     * Checks if a specific row is currently selected.
     *
     * @param rowId - The ID of the row to check
     * @returns True if the row is selected, false otherwise
     */
    isSelected: (rowId: TRowId) => boolean;

    /**
     * Adds a row to the selection.
     *
     * @remarks
     * In "single" mode, this replaces the current selection.
     * In "multiple" mode, this adds to the current selection.
     * In "none" mode, this is a no-op.
     *
     * @param rowId - The ID of the row to select
     */
    select: (rowId: TRowId) => void;

    /**
     * Removes a row from the selection.
     *
     * @remarks
     * In "none" mode, this is a no-op.
     *
     * @param rowId - The ID of the row to deselect
     */
    deselect: (rowId: TRowId) => void;

    /**
     * Toggles the selection state of a row.
     *
     * @remarks
     * If the row is currently selected, it will be deselected.
     * If the row is not selected, it will be selected.
     * In "single" mode, selecting a new row replaces the current selection.
     * In "none" mode, this is a no-op.
     *
     * @param rowId - The ID of the row to toggle
     */
    toggle: (rowId: TRowId) => void;

    /**
     * Clears all selected rows.
     *
     * @remarks
     * This sets the selectedIds array to empty.
     */
    clear: () => void;

    /**
     * Replaces the current selection with a new set of row IDs.
     *
     * @remarks
     * In "single" mode, only the first ID is kept.
     * In "multiple" mode, all provided IDs are selected (duplicates are removed).
     * In "none" mode, the selection remains empty.
     *
     * @param ids - The array of row IDs to select
     */
    setSelected: (ids: ReadonlyArray<TRowId>) => void;

    /**
     * Selects all currently visible rows in the list.
     *
     * @remarks
     * This operates on the rows array from ctx.stateRef.current.rows.
     * In "none" mode, this is a no-op.
     * In "single" mode, only the first visible row is selected.
     * In "multiple" mode, all visible rows are selected.
     */
    selectAllVisible: () => void;
};

/**
 * Configuration options for the selection feature.
 *
 * @remarks
 * These options define the selection behavior and initial state.
 *
 * @typeParam TRowId - The type of row identifier
 *
 * @public
 */
export type SelectionFeatureOptions<TRowId = any> = {
    /**
     * The selection mode to use.
     *
     * @remarks
     * If not provided, defaults to "none".
     */
    mode?: SelectionMode;

    /**
     * The initial set of selected row IDs.
     *
     * @remarks
     * If not provided, defaults to an empty array.
     * In "single" mode, only the first ID will be used.
     */
    initialSelectedIds?: ReadonlyArray<TRowId>;
};

const FEATURE_ID = "selection";

function uniq<T>(arr: ReadonlyArray<T>): T[] {
    return Array.from(new Set(arr));
}

function removeOne<T>(arr: ReadonlyArray<T>, value: T): T[] {
    const out: T[] = [];
    for (const item of arr) {
        if (item !== value) out.push(item);
    }
    return out;
}

/**
 * Creates a selection feature for a list.
 *
 * @remarks
 * This function creates a list feature that adds row selection capabilities to a list.
 * It provides an API for managing selection state and supports three modes: none, single,
 * and multiple selection. The feature requires ctx.meta.idKey to be defined, which specifies
 * the property name used to extract row IDs.
 *
 * The selection state is automatically managed and persists across list updates.
 * Duplicate IDs are automatically removed, and in single mode, only one row can be
 * selected at a time.
 *
 * @typeParam TRow - The type of row data
 * @typeParam TRowId - The type of row identifier
 *
 * @param options - Configuration options for the selection feature
 *
 * @returns A list feature with UI support that provides selection capabilities
 *
 * @throws Error if ctx.meta.idKey is not provided during feature creation
 *
 * @example
 * ```typescript
 * const selection = selectionFeature({
 *   mode: 'multiple',
 *   initialSelectedIds: [1, 2, 3]
 * });
 * ```
 *
 * @public
 */
export function selectionFeature<TRow = any, TRowId = any>(
    options: SelectionFeatureOptions<TRowId> = {}
): ListFeatureWithUI<TRow, TRowId, CoreListState<TRow>, unknown, SelectionApi<TRow, TRowId>> {
    const mode: SelectionMode = options.mode ?? "none";
    const initialSelected = options.initialSelectedIds ?? [];

    return {
        id: FEATURE_ID,

        create(ctx) {
            const idKey = ctx.meta?.idKey;
            if (!idKey) {
                throw new Error("selectionFeature requires ctx.meta.idKey (string) to be provided.");
            }

            const readSlice = (): SelectionSlice<TRowId> => {
                const state = ctx.stateRef.current as CoreListState<TRow>;
                return getFeatureSlice<SelectionSlice<TRowId>>(state, FEATURE_ID, () => {
                    const ids = mode === "none" ? [] : uniq(initialSelected);
                    return {
                        mode,
                        selectedIds: mode === "single" ? ids.slice(0, 1) : ids,
                    };
                });
            };

            const writeSlice = (next: SelectionSlice<TRowId>) => {
                ctx.setState((prev: CoreListState<TRow>) => setFeatureSlice(prev, FEATURE_ID, next));
            };

            const coerce = (ids: ReadonlyArray<TRowId>): TRowId[] => {
                if (mode === "none") return [];
                const unique = uniq(ids);
                return mode === "single" ? unique.slice(0, 1) : unique;
            };

            const api: SelectionApi<TRow, TRowId> = {
                getSelection: () => readSlice(),

                isSelected: (rowId) => {
                    const {selectedIds} = readSlice();
                    return selectedIds.includes(rowId);
                },

                select: (rowId) => {
                    if (mode === "none") return;
                    const s = readSlice();
                    const next = coerce([...s.selectedIds, rowId]);
                    writeSlice({...s, selectedIds: next});
                },

                deselect: (rowId) => {
                    if (mode === "none") return;
                    const s = readSlice();
                    const next = removeOne(s.selectedIds, rowId);
                    writeSlice({...s, selectedIds: next});
                },

                toggle: (rowId) => {
                    if (mode === "none") return;
                    const s = readSlice();
                    const isOn = s.selectedIds.includes(rowId);
                    const next = isOn ? removeOne(s.selectedIds, rowId) : coerce([...s.selectedIds, rowId]);
                    writeSlice({...s, selectedIds: next});
                },

                clear: () => {
                    const s = readSlice();
                    if (s.selectedIds.length === 0) return;
                    writeSlice({...s, selectedIds: []});
                },

                setSelected: (ids) => {
                    const s = readSlice();
                    const next = coerce(ids);
                    writeSlice({...s, selectedIds: next});
                },

                selectAllVisible: () => {
                    if (mode === "none") return;

                    const s = readSlice();
                    const state = ctx.stateRef.current as CoreListState<TRow>;
                    const rows = state.rows ?? [];

                    const ids = rows
                        .map((r) => (r as any)[idKey] as TRowId)
                        .filter((v) => v != null);

                    const next = mode === "single" ? ids.slice(0, 1) : uniq(ids);
                    writeSlice({...s, selectedIds: next});
                },
            };

            return api;
        },
    };
}
