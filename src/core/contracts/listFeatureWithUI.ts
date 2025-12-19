import {ListFeature} from "./listFeature";

/**
 * Type alias for list features that include user interface rendering capabilities.
 *
 * @remarks
 * This type alias serves as a semantic marker for {@link ListFeature} implementations that
 * participate in the "ui" stage of the feature pipeline. While it is structurally identical
 * to the base {@link ListFeature} type, it provides improved code documentation and intent
 * clarity by explicitly indicating that the feature contributes visual components or rendering
 * logic to the list.
 *
 * Features typed as ListFeatureWithUI are expected to:
 * - Implement rendering logic in the "ui" stage (see {@link FeatureStage})
 * - Provide visual components, templates, or rendering modifications
 * - Execute after the "derive", "handlers", and "lifecycle" stages to ensure all data
 *   and event handlers are properly initialized before rendering
 *
 * The type alias does not enforce any additional runtime constraints or structural differences
 * beyond the base {@link ListFeature} interface. The distinction exists purely at the type level
 * to improve developer experience and code maintainability by making feature capabilities
 * explicit in type signatures.
 *
 * Common use cases include:
 * - Features that render custom UI elements or controls
 * - Features that modify the rendering pipeline or template structure
 * - Features that contribute visual feedback or decorations to list items
 * - Features that provide interactive UI components for data manipulation
 *
 * @typeParam TRow - The type of individual row data objects in the list
 * @typeParam TRowId - The type used for unique row identifiers (typically string or number)
 * @typeParam TState - The shape of the feature's internal state object stored in {@link ListFeatureContext}
 * @typeParam TSnapshot - The type of the feature's serialized state representation for export/persistence
 * @typeParam TApi - The type of the public API object exposed by this feature to other features via the context's features registry
 *
 * @see {@link ListFeature} for the base feature interface definition
 * @see {@link ListFeatureContext} for the context object passed to features during execution
 * @see {@link FeatureStage} for information about the feature execution pipeline stages
 *
 * @internal
 */
export type ListFeatureWithUI<
    TRow = any,
    TRowId = any,
    TState = unknown,
    TSnapshot = unknown,
    TApi = unknown
> = ListFeature<TRow, TRowId, TState, TSnapshot, TApi>;

