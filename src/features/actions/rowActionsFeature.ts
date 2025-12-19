import type { ModalDescriptor, ModalResult } from "../modals";
import {ListFeatureContext} from "../../core/context/listFeatureContext";
import {ListFeatureWithUI} from "../../core/contracts/listFeatureWithUI";
import {CoreListState} from "../../core/store/coreState";
import {getFeatureSlice, setFeatureSlice} from "../../core/store/featureState";

const FEATURE_ID = "rowActions";

/**
 * Represents a modal request configuration for row actions.
 *
 * @public
 */
export type ModalRequest = {
    /**
     * Optional metadata to be passed to the modal.
     */
    meta?: Record<string, unknown>;
};

/**
 * The handler context passed to a row action when it is executed.
 * Provides access to the current row, visible and raw row data, selection state,
 * state mutation methods, and feature APIs.
 *
 * @typeParam TRow - The type of row data objects
 * @typeParam TRowId - The type of row identifier values
 *
 * @public
 */
export type RowActionHandlerContext<TRow = any, TRowId = any> = {
    /**
     * The current row data object being acted upon.
     */
    row: TRow;

    /**
     * The unique identifier of the current row.
     */
    rowId: TRowId;

    /**
     * The zero-based index of the current row within the visible rows array.
     */
    rowIndex: number;

    /**
     * All visible rows after filtering, sorting, and pagination have been applied.
     */
    rowsVisible: readonly TRow[];

    /**
     * All raw rows before any derive pipeline transformations have been applied.
     */
    rowsAll: readonly TRow[];

    /**
     * Optional selection feature snapshot, populated if the selection plugin is registered.
     */
    selection?: unknown;

    /**
     * Safely updates the raw rows state using an updater function.
     *
     * @param updater - A function that receives the current raw rows array and returns the updated array
     */
    updateRows: (updater: (current: TRow[]) => TRow[]) => void;

    /**
     * Triggers a refresh of the list data.
     *
     * @returns A promise that resolves when the refresh is complete
     */
    refresh: () => Promise<void>;

    /**
     * Exports the current list state.
     *
     * @returns The exported state object
     */
    exportState: () => unknown;

    /**
     * Namespace containing all registered feature APIs.
     */
    features: Record<string, unknown>;

    /**
     * Metadata about the list configuration.
     */
    meta: {
        /**
         * The property name used as the unique identifier for rows.
         */
        idKey: string;

        /**
         * Optional field definitions or metadata.
         */
        fields?: unknown;
    };
};

/**
 * Defines a row action that can be executed on individual rows within the list.
 * Actions can optionally present a modal for user confirmation before execution.
 *
 * @typeParam TRow - The type of row data objects
 * @typeParam TRowId - The type of row identifier values
 *
 * @public
 */
export type RowAction<TRow = any, TRowId = any> = {
    /**
     * Unique identifier for the row action.
     */
    id: string;

    /**
     * Optional human-readable label for the action.
     */
    label?: string;

    /**
     * Optional availability guard that determines if the action should be enabled for a given row.
     *
     * @param ctx - The row action context without the updateRows method
     * @returns `true` if the action should be enabled, `false` otherwise
     */
    isEnabled?: (ctx: Omit<RowActionHandlerContext<TRow, TRowId>, "updateRows">) => boolean;

    /**
     * Optional modal descriptor factory. If provided, the action will open a modal for user confirmation
     * before executing the handler. The modal's confirmation payload will be passed to the handler.
     *
     * @param ctx - The row action context without the updateRows method
     * @returns A modal request configuration
     */
    modal?: (
        ctx: Omit<RowActionHandlerContext<TRow, TRowId>, "updateRows">
    ) => ModalRequest;

    /**
     * The actual action handler that performs the row action logic.
     * If a modal is configured, this handler runs only after user confirmation.
     *
     * @param ctx - The complete row action handler context
     * @param payload - Optional payload data, typically from modal confirmation
     * @returns A promise if the action is asynchronous, or void for synchronous actions
     */
    handler: (ctx: RowActionHandlerContext<TRow, TRowId>, payload?: unknown) => void | Promise<void>;
};

type PendingRowAction<TRowId = any> = {
    actionId: string;
    rowId: TRowId;
};

type RowActionsSlice<TRowId = any> = {
    pending?: PendingRowAction<TRowId>;
};

/**
 * Public API for the row actions feature, providing methods to retrieve and trigger row actions.
 *
 * @typeParam TRow - The type of row data objects
 * @typeParam TRowId - The type of row identifier values
 *
 * @public
 */
export type RowActionsApi<TRow = any, TRowId = any> = {
    /**
     * Retrieves all registered row actions.
     *
     * @returns A read-only array of row actions
     */
    getActions: () => ReadonlyArray<RowAction<TRow, TRowId>>;

    /**
     * Triggers a row action using a visible row index.
     *
     * @param actionId - The unique identifier of the action to trigger
     * @param rowIndex - The zero-based index of the row within the visible rows array
     * @returns A promise that resolves when the action completes
     */
    triggerAt: (actionId: string, rowIndex: number) => Promise<void>;

    /**
     * Triggers a row action using a row identifier.
     * The row index will be resolved against the visible rows array.
     *
     * @param actionId - The unique identifier of the action to trigger
     * @param rowId - The unique identifier of the target row
     * @returns A promise that resolves when the action completes
     */
    triggerById: (actionId: string, rowId: TRowId) => Promise<void>;
};

/**
 * Configuration options for the row actions feature.
 *
 * @typeParam TRow - The type of row data objects
 * @typeParam TRowId - The type of row identifier values
 *
 * @public
 */
export type RowActionsFeatureOptions<TRow = any, TRowId = any> = {
    /**
     * Array of row actions to be registered with the feature.
     */
    actions: Array<RowAction<TRow, TRowId>>;
};

/**
 * Performs a runtime check to determine if the modals feature is registered and provides its API.
 *
 * @param ctx - The list feature context
 * @returns The modals API object if available and valid, or `null` otherwise
 *
 * @internal
 */
function getModalsApi(ctx: ListFeatureContext<any, any, any, any>) {
    const api = (ctx.features as any)?.modals;
    if (!api) return null;

    const has =
        typeof api.open === "function" &&
        typeof api.onResolve === "function";

    return has ? (api as {
        open: (d: ModalDescriptor<any>) => void;
        onResolve: (l: (r: ModalResult<any>) => void) => () => void;
    }) : null;
}

/**
 * Creates a row actions feature that enables defining and executing actions on individual rows.
 * Row actions can optionally integrate with the modals feature for user confirmation dialogs.
 * The feature provides methods to trigger actions by row index or row ID, and automatically
 * manages action availability, modal workflows, and state updates.
 *
 * @remarks
 * This feature requires:
 * - `ctx.meta.idKey` to be defined as a string property name for row identification
 * - The modals feature to be registered if any actions use the `modal` option
 *
 * The feature automatically subscribes to modal resolution events and cleans up subscriptions
 * during destruction.
 *
 * @typeParam TRow - The type of row data objects
 * @typeParam TRowId - The type of row identifier values
 *
 * @param options - Configuration options including the array of row actions
 * @returns A list feature with UI integration and row actions API
 *
 * @throws Error if options.actions is not provided
 * @throws Error if ctx.meta.idKey is not defined during feature creation
 * @throws Error if an action requests a modal but the modals feature is not registered
 *
 * @public
 */
export function rowActionsFeature<TRow = any, TRowId = any>(
    options: RowActionsFeatureOptions<TRow, TRowId>
): ListFeatureWithUI<TRow, TRowId, CoreListState<TRow>, unknown, RowActionsApi<TRow, TRowId>> {
    if (!options?.actions) {
        throw new Error("rowActionsFeature requires { actions }.");
    }

    return {
        id: FEATURE_ID,

        ui: {
            slots: ["Table"],
            requiredHandlers: ["triggerAt", "triggerById"],
        },

        create(ctx) {
            const idKey = ctx.meta?.idKey;
            if (!idKey) {
                throw new Error("rowActionsFeature requires ctx.meta.idKey (string).");
            }

            const modals = getModalsApi(ctx);

            const readSlice = (): RowActionsSlice<TRowId> => {
                const state = ctx.stateRef.current as CoreListState<TRow>;
                return getFeatureSlice<RowActionsSlice<TRowId>>(state, FEATURE_ID, () => ({
                    pending: undefined,
                }));
            };

            const writeSlice = (slice: RowActionsSlice<TRowId>) => {
                ctx.setState((prev: CoreListState<TRow>) => setFeatureSlice(prev, FEATURE_ID, slice));
            };

            const buildBaseCtx = (row: TRow, rowIndex: number): Omit<RowActionHandlerContext<TRow, TRowId>, "updateRows"> => {
                const state = ctx.stateRef.current as CoreListState<TRow>;
                const rowId = (row as any)[idKey] as TRowId;

                // optional selection snapshot if selection feature exists
                const selectionApi = (ctx.features as any)?.selection;
                const selection =
                    selectionApi && typeof selectionApi.getSelection === "function"
                        ? selectionApi.getSelection()
                        : undefined;

                return {
                    row,
                    rowId,
                    rowIndex,
                    rowsVisible: state.rows ?? [],
                    rowsAll: state.rawRows ?? [],
                    selection,
                    refresh: ctx.refresh,
                    exportState: ctx.exportState,
                    features: ctx.features,
                    meta: {
                        idKey,
                        fields: ctx.meta?.fields,
                    },
                };
            };

            const buildFullCtx = (row: TRow, rowIndex: number): RowActionHandlerContext<TRow, TRowId> => {
                const base = buildBaseCtx(row, rowIndex);

                const updateRows = (updater: (current: TRow[]) => TRow[]) => {
                    ctx.setState((prev: CoreListState<TRow>) => ({
                        ...prev,
                        rawRows: updater(prev.rawRows),
                    }));
                };

                return { ...base, updateRows };
            };

            const findVisibleRowById = (rowId: TRowId): { row: TRow; rowIndex: number } | null => {
                const state = ctx.stateRef.current as CoreListState<TRow>;
                const rows = state.rows ?? [];
                const idx = rows.findIndex((r) => ((r as any)[idKey] as TRowId) === rowId);
                if (idx < 0) return null;
                return { row: rows[idx] as TRow, rowIndex: idx };
            };

            const runAction = async (action: RowAction<TRow, TRowId>, row: TRow, rowIndex: number, payload?: unknown) => {
                const base = buildBaseCtx(row, rowIndex);

                if (action.isEnabled && action.isEnabled(base) === false) {
                    return;
                }

                // modal flow
                if (action.modal) {
                    if (!modals) {
                        throw new Error(
                            `Row action '${action.id}' requested a modal, but modals feature is not registered.`
                        );
                    }

                    const request = action.modal(base);
                    modals.open({
                        scope: "row-action",
                        actionId: action.id,
                        rowId: base.rowId,
                        meta: request.meta,
                    });

                    writeSlice({pending: {actionId: action.id, rowId: base.rowId}});
                    return;
                }

                await action.handler(buildFullCtx(row, rowIndex), payload);
            };

            let unsubscribe: null | (() => void) = null;
            if (modals) {
                unsubscribe = modals.onResolve(async (result) => {
                    if (result.status !== "confirmed") return;
                    if (result.descriptor.scope !== "row-action") return;

                    const pending = readSlice().pending;
                    if (!pending) return;

                    if (result.descriptor.actionId !== pending.actionId) return;
                    if ((result.descriptor.rowId as any) !== (pending.rowId as any)) return;

                    writeSlice({ pending: undefined });

                    const action = options.actions.find((a) => a.id === pending.actionId);
                    if (!action) return;

                    const resolved = findVisibleRowById(pending.rowId);
                    if (!resolved) return;

                    await action.handler(buildFullCtx(resolved.row, resolved.rowIndex), (result as any).payload);
                });
            }

            (ctx.features as any).__rowActionsUnsub = unsubscribe;

            const api: RowActionsApi<TRow, TRowId> = {
                getActions: () => options.actions,

                triggerAt: async (actionId, rowIndex) => {
                    const action = options.actions.find((a) => a.id === actionId);
                    if (!action) return;

                    const state = ctx.stateRef.current as CoreListState<TRow>;
                    const row = (state.rows ?? [])[rowIndex] as TRow | undefined;
                    if (!row) return;

                    await runAction(action, row, rowIndex);
                },

                triggerById: async (actionId, rowId) => {
                    const action = options.actions.find((a) => a.id === actionId);
                    if (!action) return;

                    const resolved = findVisibleRowById(rowId);
                    if (!resolved) return;

                    await runAction(action, resolved.row, resolved.rowIndex);
                },
            };

            return api;
        },

        onDestroy(ctx) {
            const unsub = (ctx.features as any).__rowActionsUnsub;
            if (typeof unsub === "function") {
                try { unsub(); } catch {}
            }
            delete (ctx.features as any).__rowActionsUnsub;
        },
    };
}
