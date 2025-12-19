import type { CoreListState } from "./coreState";

/**
 * Retrieves a feature-specific state slice from the core list state, initializing it if not present.
 *
 * @remarks
 * This function provides type-safe access to feature-specific state stored within the shared
 * `featureState` registry of the core list state. Each feature can store its own state slice
 * identified by a unique feature ID, enabling feature isolation and modularity.
 *
 * The function follows a lazy initialization pattern: if the requested feature slice does not
 * exist in the state registry, the provided initializer function is called to create the default
 * state. This approach ensures that feature state is only created when needed and that features
 * can safely access their state without explicit initialization checks.
 *
 * This function is typically called during feature compilation or execution to retrieve the
 * current state slice for a specific feature, which can then be read or updated by feature logic.
 *
 * @typeParam TSlice - The type of the feature-specific state slice being retrieved
 *
 * @param state - The core list state object containing the feature state registry
 * @param featureId - Unique identifier for the feature whose state slice is being retrieved
 * @param init - Initializer function that creates the default state slice if not found
 *
 * @returns The existing feature state slice if present, otherwise the result of calling the init function
 *
 * @internal
 */
export function getFeatureSlice<TSlice>(
  state: CoreListState<any>,
  featureId: string,
  init: () => TSlice
): TSlice {
  const bag = state.featureState;
  const existing = bag[featureId];
  if (existing !== undefined) {
    return existing as TSlice;
  }
  return init();
}

/**
 * Creates a new state object with an updated feature-specific state slice, maintaining immutability.
 *
 * @remarks
 * This function performs an immutable update operation on the core list state by creating a new
 * state object with an updated feature slice. It preserves all existing state properties while
 * updating only the specified feature's state slice within the `featureState` registry.
 *
 * The function uses object spreading to ensure immutability, which is essential for:
 * - Reactive state management systems that rely on reference equality checks
 * - State change detection in frameworks like React
 * - Enabling proper state history and time-travel debugging
 * - Preventing unintended side effects from shared state mutations
 *
 * Features use this function during state updates to modify their isolated state slice without
 * affecting other features' state or the core list state properties. The updated state is typically
 * passed to the `setState` function from the {@link ListFeatureContext} to trigger re-renders.
 *
 * @typeParam TState - The type of the core list state object, must extend CoreListState
 * @typeParam TSlice - The type of the feature-specific state slice being set
 *
 * @param state - The current core list state object to be updated
 * @param featureId - Unique identifier for the feature whose state slice is being updated
 * @param slice - The new state slice value to store for the specified feature
 *
 * @returns A new state object with the updated feature slice, preserving all other state properties
 *
 * @internal
 */
export function setFeatureSlice<TState extends CoreListState<any>, TSlice>(
  state: TState,
  featureId: string,
  slice: TSlice
): TState {
  return {
    ...state,
    featureState: {
      ...state.featureState,
      [featureId]: slice,
    },
  };
}
