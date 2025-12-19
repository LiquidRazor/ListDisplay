/**
 * Function type for updating state immutably using an updater function pattern.
 *
 * @remarks
 * This function type accepts an updater function that receives the previous state
 * and returns the next state. This pattern ensures immutable state updates and is
 * commonly used in React-style state management to prevent direct state mutations.
 *
 * @typeParam TState - The type of the state object being updated
 *
 * @param updater - Function that receives the previous state and returns the new state
 *
 * @internal
 */
export type SetStateFn<TState> = (updater: (prev: TState) => TState) => void;

/**
 * Core context interface that provides shared state, features, and utility methods for list management.
 *
 * @remarks
 * This interface defines the contract for the list feature context object that is passed to all
 * features during compilation and execution. It serves as the central coordination point for:
 * - State management (reactive and non-reactive access)
 * - Feature registration and API access
 * - Data refresh operations
 * - State serialization/export
 * - Metadata configuration
 *
 * The context object remains stable by reference across renders, with state mutations tracked
 * through the `stateRef.current` property to optimize rendering performance.
 *
 * @typeParam TRow - The type of individual row data objects in the list
 * @typeParam TRowId - The type used for unique row identifiers (typically string or number)
 * @typeParam TState - The shape of the internal list state object
 * @typeParam TSnapshot - The type of the exported/serialized state snapshot
 *
 * @internal
 */
export interface ListFeatureContext<
    TRow = any,
    TRowId = any,
    TState = unknown,
    TSnapshot = unknown
> {
  /**
   * The current state object for reactive access.
   *
   * @remarks
   * This property provides direct access to the current state and is intended for use
   * in reactive contexts where changes should trigger re-renders. When accessed from
   * React components, updates to this property will cause the component to re-render.
   */
  readonly state: TState;

  /**
   * Mutable reference object containing the current state for non-reactive access.
   *
   * @remarks
   * This reference provides access to the current state without triggering re-renders.
   * It is useful for scenarios where the latest state is needed but updates should not
   * cause component re-renders, such as in event handlers or effect cleanup functions.
   * The `.current` property is updated synchronously with state changes.
   */
  readonly stateRef: { current: TState };

  /**
   * Function to update the state immutably using an updater pattern.
   *
   * @remarks
   * This function accepts an updater function that receives the previous state and returns
   * the next state. It ensures immutable state updates and triggers re-renders in reactive
   * contexts. The updater function should not mutate the previous state directly but instead
   * return a new state object with the desired changes.
   */
  readonly setState: SetStateFn<TState>;

  /**
   * Asynchronous function that refreshes or refetches the list data.
   *
   * @remarks
   * This method triggers a complete data refresh operation, typically by refetching data
   * from a data source or recalculating derived state. The implementation is provided by
   * the list runtime creator and may involve network requests, cache invalidation, or
   * other asynchronous operations.
   *
   * @returns A promise that resolves when the refresh operation is complete
   */
  readonly refresh: () => Promise<void>;

  /**
   * Function that exports the current state as a serializable snapshot.
   *
   * @remarks
   * This method creates a snapshot of the current state suitable for serialization,
   * persistence, or transmission. The snapshot format is defined by the TSnapshot type
   * parameter and is implementation-specific, potentially excluding non-serializable
   * values or including additional metadata.
   *
   * @returns A snapshot representation of the current state
   */
  readonly exportState: () => TSnapshot;

  /**
   * Registry object storing feature-specific APIs and state.
   *
   * @remarks
   * This object serves as a registry where each compiled feature can store its public API
   * and expose feature-specific functionality to other features or components. Each feature
   * is identified by a string key and can store any value type. The registry is created with
   * a null prototype to avoid prototype chain pollution.
   */
  readonly features: Record<string, unknown>;

  /**
   * Optional metadata object containing configuration information for the list.
   *
   * @remarks
   * This property provides access to optional metadata that may be used by features or
   * components for configuration purposes. Common metadata includes:
   * - `idKey`: The property name used as the unique identifier for rows
   * - `fields`: Field definitions or schema information for the list data
   *
   * The structure and content of metadata are not strictly defined and may vary based
   * on the specific list implementation and feature requirements.
   */
  readonly meta?: {
    idKey?: string;
    fields?: unknown;
  };
}
