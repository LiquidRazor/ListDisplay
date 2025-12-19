import type {ModalDescriptor, ModalResult} from "../modals";
import {ListFeatureContext} from "../../core/context/listFeatureContext";
import {ListFeatureWithUI} from "../../core/contracts/listFeatureWithUI";
import {CoreListState} from "../../core/store/coreState";
import {getFeatureSlice, setFeatureSlice} from "../../core/store/featureState";

const FEATURE_ID = "generalActions";

/**
 * Context object provided to general action handlers containing list state and utility methods.
 *
 * @public
 * @typeParam TRow - The row data type
 */
export type GeneralActionHandlerContext<TRow = any> = {
    /**
     * Visible rows after all transformations (filtering, sorting, pagination) have been applied.
     */
    rowsVisible: readonly TRow[];

    /**
     * Raw rows before any derive pipeline transformations.
     */
    rowsAll: readonly TRow[];

    /**
     * Optional selection snapshot if the selection feature is registered.
     * The shape depends on the selection feature implementation.
     */
    selection?: unknown;

    /**
     * Safely updates the raw rows by providing an updater function.
     *
     * @param updater - Function that receives current rows and returns updated rows
     */
    updateRows: (updater: (current: TRow[]) => TRow[]) => void;

    /**
     * Triggers a refresh of the list data.
     *
     * @returns Promise that resolves when refresh is complete
     */
    refresh: () => Promise<void>;

    /**
     * Exports the current state of the list.
     *
     * @returns The exported state object
     */
    exportState: () => unknown;

    /**
     * Registry of all registered feature APIs.
     */
    features: Record<string, unknown>;

    /**
     * Metadata about the list configuration.
     */
    meta: {
        /**
         * The property name used as unique identifier for rows.
         */
        idKey: string;

        /**
         * Optional field definitions or schema.
         */
        fields?: unknown;
    };
};

/**
 * Defines a general action that can be triggered on the list.
 *
 * @public
 */
export type GeneralAction = {
    /**
     * Unique identifier for the action.
     */
    id: string;

    /**
     * Optional human-readable label for the action.
     */
    label?: string;

    /**
     * Optional predicate to determine if the action is currently enabled.
     *
     * @param ctx - Read-only context without updateRows capability
     * @returns True if the action should be enabled, false otherwise
     */
    isEnabled?: (ctx: Omit<GeneralActionHandlerContext<any>, "updateRows">) => boolean;

    /**
     * Optional modal request factory. If defined, triggering the action will open a modal.
     * The scope and actionId are automatically injected by the feature.
     *
     * @param ctx - Read-only context without updateRows capability
     * @returns Modal request configuration with optional metadata
     */
    modal?: (ctx: Omit<GeneralActionHandlerContext<any>, "updateRows">) => {
        /**
         * Optional metadata to pass to the modal.
         */
        meta?: Record<string, unknown>;
    };

    /**
     * The action handler function that executes the action logic.
     *
     * @param ctx - Full action context including updateRows capability
     * @param payload - Optional payload data, typically from modal confirmation
     * @returns Optional promise for async operations
     */
    handler: (ctx: GeneralActionHandlerContext<any>, payload?: unknown) => void | Promise<void>;
};

/**
 * Represents a general action that is pending modal confirmation.
 *
 * @internal
 */
type PendingGeneralAction = {
    /**
     * The ID of the action awaiting modal resolution.
     */
    actionId: string;
};

/**
 * State slice stored in the feature state for tracking pending actions.
 *
 * @internal
 */
type GeneralActionsSlice = {
    /**
     * The currently pending action awaiting modal confirmation, if any.
     */
    pending?: PendingGeneralAction;
};

/**
 * Public API exposed by the general actions feature.
 *
 * @public
 */
export type GeneralActionsApi = {
    /**
     * Retrieves all registered general actions.
     *
     * @returns Read-only array of all general actions
     */
    getActions: () => ReadonlyArray<GeneralAction>;

    /**
     * Triggers a general action by its ID.
     *
     * @param actionId - The unique identifier of the action to trigger
     * @returns Promise that resolves when the action completes or modal opens
     */
    trigger: (actionId: string) => Promise<void>;
};

/**
 * Performs a runtime check to determine if the modals feature is registered and retrieves its API.
 *
 * @param ctx - The list feature context
 * @returns The modals API if available and valid, null otherwise
 * @internal
 */
function getModalsApi(ctx: ListFeatureContext<any, any, any, any>) {
    const api = (ctx.features as any)?.modals;
    if (!api) return null;

    const has =
        typeof api.open === "function" &&
        typeof api.onResolve === "function";

    return has
        ? (api as {
            open: (d: ModalDescriptor<any>) => void;
            onResolve: (l: (r: ModalResult<any>) => void) => () => void;
        })
        : null;
}

/**
 * Creates a general actions feature that enables triggering custom actions on the list.
 *
 * This feature allows defining actions that can be executed on the entire list,
 * with optional modal confirmation dialogs. Actions can access list state, modify rows,
 * and integrate with other features like selection.
 *
 * @public
 * @typeParam TRow - The row data type
 * @param options - Configuration options for the feature
 * @returns A list feature with UI slots and action trigger capabilities
 * @throws Error if actions array is not provided or if idKey is missing from context metadata
 *
 * @example
 * ```typescript
 * const feature = generalActionsFeature({
 *   actions: [
 *     {
 *       id: 'delete-all',
 *       label: 'Delete All',
 *       modal: () => ({ meta: { title: 'Confirm Delete' } }),
 *       handler: async (ctx) => {
 *         ctx.updateRows(() => []);
 *       }
 *     }
 *   ]
 * });
 * ```
 */
export function generalActionsFeature<TRow = any>(
    options: { actions: Array<GeneralAction> }
): ListFeatureWithUI<TRow, any, CoreListState<TRow>, unknown, GeneralActionsApi> {
    if (!options?.actions) {
        throw new Error("generalActionsFeature requires { actions }.");
    }

    return {
        id: FEATURE_ID,

        ui: {
            slots: ["Toolbar"],
            requiredHandlers: ["trigger"],
        },

        create(ctx) {
            const idKey = ctx.meta?.idKey;
            if (!idKey) {
                throw new Error("generalActionsFeature requires ctx.meta.idKey (string).");
            }

            const modals = getModalsApi(ctx);

            const readSlice = (): GeneralActionsSlice => {
                const state = ctx.stateRef.current as CoreListState<TRow>;
                return getFeatureSlice<GeneralActionsSlice>(state, FEATURE_ID, () => ({
                    pending: undefined,
                }));
            };

            const writeSlice = (slice: GeneralActionsSlice) => {
                ctx.setState((prev: CoreListState<TRow>) => setFeatureSlice(prev, FEATURE_ID, slice));
            };

            const buildBaseCtx = (): Omit<GeneralActionHandlerContext<TRow>, "updateRows"> => {
                const state = ctx.stateRef.current as CoreListState<TRow>;

                const selectionApi = (ctx.features as any)?.selection;
                const selection =
                    selectionApi && typeof selectionApi.getSelection === "function"
                        ? selectionApi.getSelection()
                        : undefined;

                return {
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

            const buildFullCtx = (): GeneralActionHandlerContext<TRow> => {
                const base = buildBaseCtx();

                const updateRows = (updater: (current: TRow[]) => TRow[]) => {
                    ctx.setState((prev: CoreListState<TRow>) => ({
                        ...prev,
                        rawRows: updater(prev.rawRows),
                    }));
                };

                return {...base, updateRows};
            };

            const runAction = async (action: GeneralAction, payload?: unknown) => {
                const base = buildBaseCtx();

                if (action.isEnabled && action.isEnabled(base) === false) {
                    return;
                }

                if (action.modal) {
                    if (!modals) {
                        throw new Error(
                            `General action '${action.id}' requested a modal, but modals feature is not registered.`
                        );
                    }

                    const request = action.modal(base);
                    modals.open({
                        scope: "general-action",
                        actionId: action.id,
                        meta: request?.meta,
                    });

                    writeSlice({pending: {actionId: action.id}});
                    return;
                }

                await action.handler(buildFullCtx(), payload);
            };

            // Listen for modal confirms related to general actions
            let unsubscribe: null | (() => void) = null;
            if (modals) {
                unsubscribe = modals.onResolve(async (result) => {
                    if (result.status !== "confirmed") return;
                    if (result.descriptor.scope !== "general-action") return;

                    const pending = readSlice().pending;
                    if (!pending) return;

                    if (result.descriptor.actionId !== pending.actionId) return;

                    writeSlice({pending: undefined});

                    const action = options.actions.find((a) => a.id === pending.actionId);
                    if (!action) return;

                    await action.handler(buildFullCtx(), (result as any).payload);
                });
            }

            (ctx.features as any).__generalActionsUnsub = unsubscribe;

            const api: GeneralActionsApi = {
                getActions: () => options.actions,

                trigger: async (actionId) => {
                    const action = options.actions.find((a) => a.id === actionId);
                    if (!action) return;
                    await runAction(action);
                },
            };

            return api;
        },

        onDestroy(ctx) {
            const unsub = (ctx.features as any).__generalActionsUnsub;
            if (typeof unsub === "function") {
                try {
                    unsub();
                } catch {
                }
            }
            delete (ctx.features as any).__generalActionsUnsub;
        },
    };
}
