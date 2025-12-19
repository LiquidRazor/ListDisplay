import {ListFeatureWithUI} from "../../core/contracts/listFeatureWithUI";
import {CoreListState} from "../../core/store/coreState";
import {getFeatureSlice, setFeatureSlice} from "../../core/store/featureState";

const FEATURE_ID = "modals";

/**
 * Defines the context in which a modal was opened.
 *
 * @remarks
 * This type categorizes modal origins to maintain generic modal implementations
 * while still supporting specific action contexts. The scope helps other features
 * (like actions) understand how to handle modal results.
 *
 * - `row-action`: Modal opened from an action on a specific row
 * - `general-action`: Modal opened from a general action not tied to a specific row
 * - `custom`: Modal opened from custom application logic
 *
 * @public
 */
export type ModalScope = "row-action" | "general-action" | "custom";

/**
 * Describes a modal's configuration and context.
 *
 * @remarks
 * This descriptor contains all information needed to display and track a modal.
 * It intentionally keeps the modal system generic by using a flexible metadata
 * structure while providing optional correlation identifiers.
 *
 * @typeParam TRowId - The type of row identifier used in the list
 *
 * @public
 */
export type ModalDescriptor<TRowId = any> = {
  /**
   * The context in which the modal was opened.
   */
  scope: ModalScope;

  /**
   * Optional identifier for the action that triggered the modal.
   *
   * @remarks
   * This allows features like the actions plugin to correlate modal results
   * back to the originating action.
   */
  actionId?: string;

  /**
   * Optional identifier for the row associated with the modal.
   *
   * @remarks
   * Relevant when scope is "row-action", allowing the modal to reference
   * the specific row being acted upon.
   */
  rowId?: TRowId;

  /**
   * Flexible metadata for the modal implementation.
   *
   * @remarks
   * Consumers can provide any data needed by their ModalOutlet UI component,
   * such as title, message, form schema, validation rules, etc. The structure
   * is intentionally open-ended to support various modal types.
   */
  meta?: Record<string, unknown>;
};

/**
 * Represents the result of a modal interaction.
 *
 * @remarks
 * This discriminated union type captures the outcome of a modal, either confirmed
 * with optional payload data or cancelled. The descriptor is included in both cases
 * to maintain context about which modal was resolved.
 *
 * @typeParam TRowId - The type of row identifier used in the list
 *
 * @public
 */
export type ModalResult<TRowId = any> =
    | {
  /**
   * Indicates the modal was confirmed by the user.
   */
  status: "confirmed";
  /**
   * The original modal descriptor that was resolved.
   */
  descriptor: ModalDescriptor<TRowId>;
  /**
   * Optional data returned from the modal (e.g., form values, user selections).
   */
  payload?: unknown;
}
    | {
  /**
   * Indicates the modal was cancelled by the user.
   */
  status: "cancelled";
  /**
   * The original modal descriptor that was resolved.
   */
  descriptor: ModalDescriptor<TRowId>;
    };

/**
 * Internal state slice for the modals feature.
 *
 * @remarks
 * This type represents the portion of the feature state that is managed by
 * the modals feature. It is stored in the global list state under the
 * feature's ID and tracks the currently active modal, resolution history,
 * and state changes.
 *
 * @typeParam TRowId - The type of row identifier used in the list
 *
 * @internal
 */
type ModalsSlice<TRowId = any> = {
  /**
   * The currently active modal descriptor, if any.
   *
   * @remarks
   * When undefined, no modal is currently open. Only one modal can be
   * active at a time.
   */
  active?: ModalDescriptor<TRowId>;

  /**
   * Incrementing counter to detect state changes.
   *
   * @remarks
   * This version number increases with each modal operation (open, close, confirm, cancel)
   * making it easy to detect resolution edges and state transitions in UI components.
   */
  version: number;

  /**
   * The most recent modal resolution result.
   *
   * @remarks
   * This stores the last confirmed or cancelled result and is cleared when
   * a new modal opens. Useful for debugging or implementing undo functionality.
   */
  lastResult?: ModalResult<TRowId>;
};

/**
 * API interface for managing modals in a list.
 *
 * @remarks
 * This interface provides methods to open, close, and resolve modals, as well as
 * subscribe to resolution events. It is returned by the modals feature and can be
 * used by UI components or other features to interact with modal state.
 *
 * @typeParam TRowId - The type of row identifier used in the list
 *
 * @public
 */
export type ModalsApi<TRowId = any> = {
  /**
   * Retrieves the currently active modal descriptor.
   *
   * @returns The active modal descriptor, or undefined if no modal is open
   */
  getActive: () => ModalDescriptor<TRowId> | undefined;

  /**
   * Opens a modal with the specified descriptor.
   *
   * @remarks
   * By default, this replaces any currently open modal. If strictSingle mode
   * is enabled in feature options, attempting to open a modal while one is
   * active will throw an error.
   *
   * @param descriptor - The modal descriptor containing configuration and context
   *
   * @throws Error if strictSingle is enabled and a modal is already active
   */
  open: (descriptor: ModalDescriptor<TRowId>) => void;

  /**
   * Closes the current modal without resolving it.
   *
   * @remarks
   * This is rarely needed but useful for edge cases like navigation away from
   * the list or programmatic dismissal. Does nothing if no modal is active.
   * Subscribers will not be notified as this is not a resolution.
   */
  close: () => void;

  /**
   * Resolves the current modal as confirmed with optional payload.
   *
   * @remarks
   * This closes the modal, stores the confirmation result, and notifies all
   * subscribers. Does nothing if no modal is active.
   *
   * @param payload - Optional data to include with the confirmation result
   */
  confirm: (payload?: unknown) => void;

  /**
   * Resolves the current modal as cancelled.
   *
   * @remarks
   * This closes the modal, stores the cancellation result, and notifies all
   * subscribers. Does nothing if no modal is active.
   */
  cancel: () => void;

  /**
   * Subscribes to modal resolution events.
   *
   * @remarks
   * The listener will be called whenever a modal is confirmed or cancelled
   * (but not when closed without resolution). This is useful for features
   * like actions that need to respond to modal outcomes.
   *
   * @param listener - Function to call when a modal is resolved
   *
   * @returns A function that unsubscribes the listener when called
   */
  onResolve: (listener: (result: ModalResult<TRowId>) => void) => () => void;
};

/**
 * Configuration options for the modals feature.
 *
 * @remarks
 * These options control the behavior of the modals feature, including
 * how multiple modal requests are handled.
 *
 * @public
 */
export type ModalsFeatureOptions = {
  /**
   * Enforces strict single-modal behavior.
   *
   * @remarks
   * When enabled, attempting to open a modal while one is already active
   * will throw an error instead of replacing the existing modal. This can
   * help catch programming errors where multiple modals are unintentionally
   * triggered.
   *
   * @defaultValue false - By default, opening a new modal replaces any active modal
   */
  strictSingle?: boolean;
};

/**
 * Creates a modals feature for a list.
 *
 * @remarks
 * This function creates a list feature that adds modal management capabilities to a list.
 * It provides an API for opening, closing, and resolving modals, as well as subscribing
 * to modal resolution events. The feature includes UI slots for modal outlets and
 * requires specific handlers to be implemented by the UI layer.
 *
 * The modal system is intentionally generic, using flexible descriptors and metadata
 * to support various modal types while maintaining integration with other features
 * like actions through correlation identifiers.
 *
 * Only one modal can be active at a time, though this behavior can be made stricter
 * with the strictSingle option.
 *
 * @typeParam TRow - The type of row data in the list
 * @typeParam TRowId - The type of row identifier used in the list
 *
 * @param options - Configuration options for the modals feature
 *
 * @returns A list feature with UI support that provides modal management capabilities
 *
 * @example
 * ```typescript
 * const modals = modalsFeature({
 *   strictSingle: true
 * });
 *
 * // Later in your code
 * modals.open({
 *   scope: 'row-action',
 *   actionId: 'delete',
 *   rowId: '123',
 *   meta: {
 *     title: 'Confirm Delete',
 *     message: 'Are you sure you want to delete this item?'
 *   }
 * });
 *
 * modals.onResolve((result) => {
 *   if (result.status === 'confirmed') {
 *     // Handle confirmation
 *   }
 * });
 * ```
 *
 * @public
 */
export function modalsFeature<TRow = any, TRowId = any>(
  options: ModalsFeatureOptions = {}
): ListFeatureWithUI<TRow, TRowId, CoreListState<TRow>, unknown, ModalsApi<TRowId>> {
  const strictSingle = options.strictSingle ?? false;

  return {
    id: FEATURE_ID,

    ui: {
      slots: ["ModalOutlet"],
      requiredHandlers: ["getActive", "open", "confirm", "cancel", "close"],
    },

    create(ctx) {
      const listeners = new Set<(result: ModalResult<TRowId>) => void>();

      const readSlice = (): ModalsSlice<TRowId> => {
        const state = ctx.stateRef.current as CoreListState<TRow>;
        return getFeatureSlice<ModalsSlice<TRowId>>(state, FEATURE_ID, () => ({
          active: undefined,
          version: 0,
          lastResult: undefined,
        }));
      };

      const writeSlice = (slice: ModalsSlice<TRowId>) => {
        ctx.setState((prev: CoreListState<TRow>) => setFeatureSlice(prev, FEATURE_ID, slice));
      };

      const emit = (result: ModalResult<TRowId>) => {
        for (const l of listeners) {
          try {
            l(result);
          } catch {
            // swallow to keep other listeners alive
          }
        }
      };

      const api: ModalsApi<TRowId> = {
        getActive: () => readSlice().active,

        open: (descriptor) => {
          const s = readSlice();
          if (strictSingle && s.active) {
            throw new Error("A modal is already active. Close it before opening another.");
          }
          writeSlice({
            active: descriptor,
            version: s.version + 1,
            lastResult: undefined,
          });
        },

        close: () => {
          const s = readSlice();
          if (!s.active) return;
          writeSlice({
            ...s,
            active: undefined,
            version: s.version + 1,
          });
        },

        confirm: (payload) => {
          const s = readSlice();
          if (!s.active) return;

          const result: ModalResult<TRowId> = {
            status: "confirmed",
            descriptor: s.active,
            payload,
          };

          writeSlice({
            active: undefined,
            version: s.version + 1,
            lastResult: result,
          });

          emit(result);
        },

        cancel: () => {
          const s = readSlice();
          if (!s.active) return;

          const result: ModalResult<TRowId> = {
            status: "cancelled",
            descriptor: s.active,
          };

          writeSlice({
            active: undefined,
            version: s.version + 1,
            lastResult: result,
          });

          emit(result);
        },

        onResolve: (listener) => {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
      };

      return api;
    },
  };
}
