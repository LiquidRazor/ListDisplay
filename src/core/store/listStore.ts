/**
 * Function type for state change notification callbacks.
 *
 * @remarks
 * This function type represents a listener callback that is invoked whenever the state
 * in a {@link ListStore} changes. Listeners receive no parameters and return no value,
 * making them simple notification callbacks that trigger reactive updates in response
 * to state mutations.
 *
 * Listeners are registered via the {@link ListStore.subscribe} method and are called
 * synchronously after each state change. They are typically used to trigger re-renders
 * in UI frameworks or to propagate state changes to dependent systems.
 *
 * @public
 */
export type Listener = () => void;

/**
 * Simple reactive state store interface with subscription-based change notification.
 *
 * @remarks
 * This interface defines a lightweight state management container that provides:
 * - Direct state access via {@link ListStore.getState}
 * - Immutable state updates via {@link ListStore.setState}
 * - Change notification via {@link ListStore.subscribe}
 *
 * The store follows a publish-subscribe pattern where state mutations trigger notifications
 * to all registered listeners. State updates use an updater function pattern to ensure
 * immutability and prevent accidental direct mutations.
 *
 * The store performs reference equality checks using `Object.is()` to avoid unnecessary
 * notifications when the new state is identical to the previous state. This optimization
 * helps prevent redundant reactive updates in connected systems.
 *
 * Implementations are created via the {@link createListStore} factory function.
 *
 * @typeParam TState - The type of the state object managed by the store
 *
 * @public
 */
export interface ListStore<TState> {
    /**
     * Retrieves the current state snapshot.
     *
     * @remarks
     * This method returns the current state object stored in the store. The returned
     * state should be treated as immutable and should not be modified directly.
     * To update the state, use the {@link ListStore.setState} method instead.
     *
     * @returns The current state object
     */
    getState(): TState;

    /**
     * Updates the state immutably using an updater function pattern.
     *
     * @remarks
     * This method accepts an updater function that receives the previous state and returns
     * the next state. The updater function should not mutate the previous state directly but
     * instead return a new state object with the desired changes.
     *
     * After computing the new state, the method performs a reference equality check using
     * `Object.is()`. If the new state is referentially identical to the previous state,
     * no listeners are notified and the method returns early. This optimization prevents
     * unnecessary reactive updates when the state hasn't actually changed.
     *
     * If the state has changed, all registered listeners are notified synchronously by
     * invoking their callback functions in the order they were registered.
     *
     * @param updater - Function that receives the previous state and returns the new state
     */
    setState(updater: (prev: TState) => TState): void;

    /**
     * Registers a listener for state change notifications.
     *
     * @remarks
     * This method adds a listener function to the store's subscription set. The listener
     * will be invoked synchronously whenever the state changes via {@link ListStore.setState}.
     * Listeners receive no parameters and are expected to retrieve the current state via
     * {@link ListStore.getState} if needed.
     *
     * The method returns an unsubscribe function that removes the listener from the subscription
     * set when called. It is safe to call the unsubscribe function multiple times; subsequent
     * calls have no effect.
     *
     * @param listener - The callback function to invoke on state changes
     * @returns A function that unsubscribes the listener when called
     */
    subscribe(listener: Listener): () => void;
}

/**
 * Creates a new reactive state store with the given initial state.
 *
 * @remarks
 * This factory function creates a {@link ListStore} instance initialized with the provided
 * initial state. The returned store is a lightweight reactive container that manages state
 * using a simple publish-subscribe pattern.
 *
 * The store implementation uses:
 * - A closure-captured `state` variable to hold the current state
 * - A `Set` to maintain registered listeners for efficient subscription management
 * - `Object.is()` for reference equality checks to optimize notification performance
 *
 * The store performs reference equality optimization, meaning that if a state update
 * produces a referentially identical state object, no listeners will be notified. This
 * behavior encourages immutable update patterns and prevents unnecessary reactive updates.
 *
 * Example usage:
 * ```typescript
 * interface AppState {
 *   count: number;
 *   items: string[];
 * }
 *
 * const store = createListStore<AppState>({ count: 0, items: [] });
 *
 * // Subscribe to changes
 * const unsubscribe = store.subscribe(() => {
 *   console.log('State changed:', store.getState());
 * });
 *
 * // Update state immutably
 * store.setState(prev => ({ ...prev, count: prev.count + 1 }));
 *
 * // Clean up
 * unsubscribe();
 * ```
 *
 * @typeParam TState - The type of the state object managed by the store
 * @param initialState - The initial state value for the store
 * @returns A new ListStore instance initialized with the provided state
 *
 * @public
 */
export function createListStore<TState>(initialState: TState): ListStore<TState> {
    let state = initialState;
    const listeners = new Set<Listener>();

    return {
        getState() {
            return state;
        },

        setState(updater) {
            const next = updater(state);
            if (Object.is(next, state)) return;
            state = next;
            for (const l of listeners) l();
        },

        subscribe(listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
    };
}
