import React, {createContext, useContext} from "react";
import type {ListFeatureContext} from "./listFeatureContext";

/**
 * Core context type used by all list component slots for accessing shared list state and features.
 *
 * @remarks
 * This type is an alias for {@link ListFeatureContext} and represents the stable context reference
 * passed through React Context. The context itself remains stable by reference across renders,
 * while the actual state mutations are tracked via the `stateRef.current` property to avoid
 * unnecessary re-renders.
 *
 * @typeParam TRow - The type of individual row data objects in the list
 * @typeParam TRowId - The type used for unique row identifiers (typically string or number)
 * @typeParam TState - The shape of the internal list state object
 * @typeParam TSnapshot - The type of the exported/serialized state snapshot
 *
 * @public
 */
export type ListCtx<
    TRow = any, TRowId = any, TState = any, TSnapshot = any
> =
    ListFeatureContext<TRow, TRowId, TState, TSnapshot>;

const ListContext = createContext<ListCtx<any, any, any, any> | null>(null);

/**
 * Provider component that supplies the list context to all descendant components.
 *
 * @remarks
 * This component wraps the React Context Provider for {@link ListCtx}. All list-related
 * components and hooks must be rendered within this provider to access the list context.
 * The provider accepts a single context value that is stable by reference and shares
 * state, features, and utility methods with all consuming components.
 *
 * @param props - Component props
 * @param props.value - The list context object containing state, features, and methods
 * @param props.children - React children to be rendered within the provider
 *
 * @returns The context provider with children
 *
 * @example
 * ```tsx
 * <ListContextProvider value={listContext}>
 *   <DefaultTable />
 * </ListContextProvider>
 * ```
 *
 * @public
 */
export function ListContextProvider(props: {
    value: ListCtx<any, any, any, any>;
    children: React.ReactNode;
}) {
    return <ListContext.Provider value={props.value}>{props.children}</ListContext.Provider>;
}

/**
 * React hook that retrieves the current list context.
 *
 * @remarks
 * This hook provides access to the list context object which includes the current state,
 * state reference, state setter, refresh function, export function, features registry,
 * and metadata. The hook must be called within a component that is a descendant of
 * {@link ListContextProvider}, otherwise it will throw an error.
 *
 * The returned context object is stable by reference, but its `stateRef.current` property
 * may change between renders. Components should access state through the context's `state`
 * property for reactive updates or `stateRef.current` for non-reactive access.
 *
 * @typeParam TRow - The type of individual row data objects in the list
 * @typeParam TRowId - The type used for unique row identifiers
 * @typeParam TState - The shape of the internal list state object
 * @typeParam TSnapshot - The type of the exported/serialized state snapshot
 *
 * @returns The current list context object
 *
 * @throws {@link Error}
 * Throws an error if called outside of a {@link ListContextProvider}
 *
 * @example
 * ```tsx
 * function MyListComponent() {
 *   const ctx = useListCtx();
 *   const rows = ctx.state.rows;
 *   return <div>{rows.length} items</div>;
 * }
 * ```
 *
 * @public
 */
export function useListCtx<
    TRow = any,
    TRowId = any,
    TState = any,
    TSnapshot = any
>(): ListCtx<TRow, TRowId, TState, TSnapshot> {
    const ctx = useContext(ListContext);
    if (!ctx) {
        throw new Error("useListCtx() must be used inside <ListContextProvider>.");
    }
    return ctx as any;
}
