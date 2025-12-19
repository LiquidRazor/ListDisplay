import React, { useEffect, useMemo, useRef } from "react";
import { useSyncExternalStore } from "react";
import {FeatureRegistry} from "./core/registry/featureRegistryType";
import {ApplyPatchFn, DataSource, useListEngine} from "./core/engine/useListEngine";
import {ListSlots} from "./core/contracts/listSlots";
import {CoreListState} from "./core/store/coreState";
import {createListStore} from "./core/store/listStore";
import {ListRuntimePlan} from "./core/registry/compiledFeaturePlan";
import {createListRuntime} from "./core/context/createListRuntime";
import {validateUiWiring} from "./core/contracts/validateUiWiring";
import {ListContextProvider} from "./core/context/listContext";
import {SetStateFn} from "./core/context/listFeatureContext";


/**
 * Props interface for the ListDisplay component.
 *
 * @remarks
 * This is the main configuration interface for the ListDisplay component, which is the
 * central component of the library. It defines all necessary properties including data
 * management, feature registry, UI components, and optional optimizations.
 *
 * @typeParam TRow - The type of row data being displayed in the list
 * @typeParam TRowId - The type of the unique identifier for each row
 * @typeParam TPatch - The type of patch data used for optimistic updates
 *
 * @public
 */
export type ListDisplayProps<TRow = any, TRowId = any, TPatch = unknown> = {
    /**
     * The key name used to uniquely identify each row in the data.
     *
     * @remarks
     * This property specifies which field in your row data serves as the unique identifier.
     * It's used internally for efficient row tracking and updates.
     *
     * @example
     * ```typescript
     * idKey: "id"
     * idKey: "userId"
     * ```
     */
    idKey: string;

    /**
     * The field schema definition for the list columns.
     *
     * @remarks
     * This property defines the structure and metadata of the fields/columns in your list.
     * The exact type will be tightened to FieldSchema<TRow>[] in future versions.
     * Currently accepts any field definition structure.
     */
    fields: unknown;

    /**
     * The data source provider for fetching and managing list data.
     *
     * @remarks
     * This is a required function or object that defines how the list fetches its data.
     * It handles initial data loading, refreshes, and any server communication.
     * The data source is the primary input for the list's data pipeline.
     */
    dataSource: DataSource<TRow, TPatch>;

    /**
     * Optional function to apply optimistic patch updates to rows.
     *
     * @remarks
     * When provided, this function enables optimistic updates by applying patch data
     * to existing rows before the server confirms the changes. This improves perceived
     * performance by immediately reflecting user actions in the UI.
     */
    applyPatch?: ApplyPatchFn<TRow, TPatch>;

    /**
     * The feature registry containing all registered list features.
     *
     * @remarks
     * This is the core registry that defines what capabilities your list has, such as
     * filtering, sorting, pagination, etc. The registry must be created and configured
     * before being passed to ListDisplay.
     *
     * @see {@link ./features/registeringExample.ts} for an example of how to register features
     */
    registry: FeatureRegistry<TRow, TRowId>;

    /**
     * Optional UI component slots to customize the list's appearance.
     *
     * @remarks
     * Provide custom React components for various parts of the list UI such as
     * Table, Toolbar, FiltersPanel, Pagination, etc. Any slot not provided will
     * simply not be rendered, allowing for flexible layouts.
     */
    components?: ListSlots;

    /**
     * Optional props to pass to each component slot.
     *
     * @remarks
     * This object allows you to pass additional props to your custom components.
     * Keys should match the component slot names (e.g., "Table", "Toolbar").
     */
    componentsProps?: Record<string, unknown>;

    /**
     * UI wiring validation behavior mode.
     *
     * @remarks
     * Controls how the library validates that required UI handlers are properly wired.
     * - "throw": Throws an error if validation fails (recommended for development)
     * - "warn": Logs a warning if validation fails (recommended for production)
     *
     * @defaultValue "throw"
     */
    validationMode?: "throw" | "warn";

    /**
     * Optional initial rows for instant first paint optimization.
     *
     * @remarks
     * When provided, these rows will be displayed immediately without waiting for
     * the data source to load. This is useful for server-side rendering or when
     * you already have data available. The list status will be set to "ready"
     * instead of "idle" when initial rows are provided.
     */
    initialRows?: TRow[];
};

const DEFAULT_STATE: CoreListState<any> = {
    rawRows: [],
    rows: [],
    status: "idle",
    featureState: Object.create(null),
    error: undefined,
};

/**
 * The main component of the library where all functionality comes together.
 *
 * @remarks
 * ListDisplay is the central orchestrator component that integrates all parts of the list
 * management system. It manages:
 * - Internal state store creation and subscription
 * - Feature registry compilation and runtime initialization
 * - Data source connection and patch application
 * - Lifecycle management (init/destroy) for all features
 * - Derivation pipeline execution (filtering, sorting, pagination, etc.)
 * - UI rendering with customizable component slots
 * - Development-time validation of UI wiring
 *
 * This component creates an isolated list instance with its own internal state management.
 * Parent components remain unaffected by internal state changes. All list features are
 * executed in the correct order as defined by the feature registry, and their APIs are
 * made available through the ListContext to child components.
 *
 * The component handles different loading states automatically and renders appropriate
 * UI based on the current status (loading, error, empty, or ready with data).
 *
 * @typeParam TRow - The type of row data being displayed
 * @typeParam TRowId - The type of the unique identifier for each row
 * @typeParam TPatch - The type of patch data for optimistic updates
 *
 * @param props - Configuration props for the list display
 *
 * @returns A React component that renders the complete list UI
 *
 * @example
 * Basic usage with features:
 * ```typescript
 * import { ListDisplay } from './ListDisplay';
 * import { createRegistry } from './core/registry';
 * import { filteringFeature } from './features/filtering';
 *
 * const registry = createRegistry<User, string>();
 * registry.register(filteringFeature({ apply: myFilterFn }));
 *
 * function MyList() {
 *   return (
 *     <ListDisplay
 *       idKey="id"
 *       fields={fields}
 *       dataSource={fetchUsers}
 *       registry={registry}
 *       components={{ Table: MyTable, Toolbar: MyToolbar }}
 *     />
 *   );
 * }
 * ```
 *
 * @see {@link ./features/registeringExample.ts} for a complete example of feature registration
 *
 * @public
 */
export function ListDisplay<TRow = any, TRowId = any, TPatch = unknown>(
    props: ListDisplayProps<TRow, TRowId, TPatch>
) {
    const {
        idKey,
        fields,
        dataSource,
        applyPatch,
        registry,
        components = {},
        componentsProps = {},
        validationMode = "throw",
        initialRows,
    } = props;

    // 1) store: created once (internal-only)
    const storeRef = useRef(
        createListStore<CoreListState<TRow>>({
            ...(DEFAULT_STATE as CoreListState<TRow>),
            rawRows: initialRows ?? [],
            rows: [],
            status: initialRows ? "ready" : "idle",
        })
    );
    const store = storeRef.current;

    // 2) stateRef used by ctx (stable object, mutable current)
    const stateRef = useRef<CoreListState<TRow>>(store.getState());

    // 3) runtime plan: compiled once
    const runtimeRef = useRef<ListRuntimePlan<TRow> | null>(null);

    // 4) exportState: for now, minimal (we’ll enhance later)
    const exportStateImpl = useMemo(() => {
        return () => {
            // Return whatever snapshot format you’ll standardize later.
            // For now: raw + derived + status.
            return stateRef.current;
        };
    }, []);

    // 5) engine refresh impl (wired after engine hook is created)
    const refreshRef = useRef<() => Promise<void>>(async () => {});

    const setState: SetStateFn<CoreListState<TRow>> = (updater) => store.setState(updater);

    // 6) compile runtime once (registry must be immutable for this instance)
    if (!runtimeRef.current) {
        runtimeRef.current = createListRuntime<TRow, TRowId, CoreListState<TRow>, unknown>({
            registry,
            stateRef: stateRef,
            setState,
            refreshImpl: () => refreshRef.current(),
            exportStateImpl,
            meta: { idKey, fields },
        }) as any;
    }

    const runtime = runtimeRef.current!;

    // 7) list engine: init + patches live inside ListDisplay only
    const { refresh } = useListEngine<TRow, TPatch>({
        store,
        dataSource,
        applyPatch,
    });

    // connect refresh to runtime ctx
    refreshRef.current = refresh;

    // 8) subscribe ListDisplay to store updates (parent remains unaffected)
    const coreState = useSyncExternalStore(
        store.subscribe,
        store.getState,
        store.getState
    );

    // 9) derive rows through the feature pipeline
    const derivedRows = runtime.derive(coreState.rawRows);

    // 10) update stateRef.current with latest composite state (stable ctx, mutable current)
    stateRef.current = {
        ...coreState,
        rows: derivedRows as any,
    };

    // 11) run lifecycle init once + validate UI wiring once
    useEffect(() => {
        // init features once
        runtime.init();

        // validate UI wiring once (dev-time safety)
        validateUiWiring(runtime as any, components, { mode: validationMode, enabled: true });

        return () => {
            runtime.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 12) render: only slots provided
    const LoadingState = components.LoadingState;
    const ErrorState = components.ErrorState;
    const EmptyState = components.EmptyState;

    const Table = components.Table;
    const Toolbar = components.Toolbar;
    const FiltersPanel = components.FiltersPanel;
    const SortBar = components.SortBar;
    const Pagination = components.Pagination;
    const ModalOutlet = components.ModalOutlet;

    // status routing (minimal)
    if (coreState.status === "loading" && LoadingState) {
        return (
            <ListContextProvider value={runtime.ctx as any}>
                <LoadingState {...(componentsProps.LoadingState as any)} />
            </ListContextProvider>
        );
    }

    if (coreState.status === "error" && ErrorState) {
        return (
            <ListContextProvider value={runtime.ctx as any}>
                <ErrorState {...(componentsProps.ErrorState as any)} />
            </ListContextProvider>
        );
    }

    if (coreState.status === "ready" && derivedRows.length === 0 && EmptyState) {
        return (
            <ListContextProvider value={runtime.ctx as any}>
                <EmptyState {...(componentsProps.EmptyState as any)} />
            </ListContextProvider>
        );
    }

    // main layout: render only what exists
    return (
        <ListContextProvider value={runtime.ctx as any}>
            {Toolbar ? <Toolbar {...(componentsProps.Toolbar as any)} /> : null}
            {FiltersPanel ? <FiltersPanel {...(componentsProps.FiltersPanel as any)} /> : null}
            {SortBar ? <SortBar {...(componentsProps.SortBar as any)} /> : null}
            {Table ? <Table {...(componentsProps.Table as any)} /> : null}
            {Pagination ? <Pagination {...(componentsProps.Pagination as any)} /> : null}
            {ModalOutlet ? <ModalOutlet {...(componentsProps.ModalOutlet as any)} /> : null}
        </ListContextProvider>
    );
}
