/**
 * Defines the UI contract for features that render user interface components in the list feature system.
 *
 * @remarks
 * This contract specifies the UI integration requirements for features that participate in the rendering
 * layer during the "ui" stage of the feature pipeline. It provides a declarative interface for features to:
 * - Declare symbolic slot names where the feature expects to mount its components
 * - Specify required event handler or callback function identifiers that must be provided by consumers
 *
 * The UI contract is processed during feature compilation and used by the rendering system to:
 * - Validate that all required slots are available in the UI template
 * - Ensure all required handler functions are present in the rendering context
 * - Wire feature components to the correct mounting points in the component hierarchy
 * - Establish proper communication between features and their consuming applications
 *
 * Features declare their UI contract through this interface, and the list runtime validates and resolves
 * these requirements before rendering. This ensures a type-safe and predictable UI integration pattern
 * across all features in the system.
 *
 * @example
 * Basic UI contract for a feature with slots only:
 * ```typescript
 * const myFeature: ListFeature = {
 *   key: 'myFeature',
 *   ui: {
 *     slots: ['header', 'footer']
 *   }
 * };
 * ```
 *
 * @example
 * UI contract with both slots and required handlers:
 * ```typescript
 * const editableListFeature: ListFeature = {
 *   key: 'editableList',
 *   ui: {
 *     slots: ['actions', 'editor'],
 *     requiredHandlers: ['onSave', 'onCancel', 'onValidate']
 *   }
 * };
 * ```
 *
 * @see {@link FeatureStage} for information about the "ui" stage in the feature pipeline
 * @see {@link ListFeatureContext} for the context object available during UI rendering
 *
 * @public
 */
export interface FeatureUIContract {
  /**
   * Optional array of symbolic slot identifiers where this feature expects to render its components.
   *
   * @remarks
   * Slot names act as semantic placeholders in the UI rendering system where feature-specific components
   * can be mounted during the "ui" stage of feature execution. Each string in this array represents a
   * named mounting point in the UI template hierarchy.
   *
   * **Slot Resolution Process:**
   * 1. Features declare slot requirements during feature definition
   * 2. UI framework integration layer validates slot availability during compilation
   * 3. Runtime rendering system resolves slot names to actual DOM mounting points
   * 4. Feature components are rendered into their designated slots
   *
   * **Slot Naming Conventions:**
   * - Use kebab-case or camelCase for consistency (e.g., 'row-actions' or 'rowActions')
   * - Choose semantic names that describe the purpose rather than position (e.g., 'actions' not 'right-panel')
   * - Avoid generic names like 'slot1' or 'container' that don't convey intent
   * - Use hierarchical naming for nested slots (e.g., 'header-left', 'header-right')
   *
   * **Slot Availability:**
   * The actual slot implementation and resolution is handled by the UI framework integration layer
   * (e.g., React, Vue, Angular adapters). If a feature declares slots that are not available in the
   * consuming application's template, the behavior depends on the framework integration:
   * - Strict mode: Throws validation error during feature compilation
   * - Lenient mode: Silently ignores missing slots or logs warnings
   *
   * Slots provide loose coupling between features and their rendering contexts, allowing features
   * to be composed into different UI layouts without modification.
   *
   * @example
   * Simple slot declaration for a toolbar feature:
   * ```typescript
   * {
   *   slots: ['toolbar-left', 'toolbar-right']
   * }
   * ```
   *
   * @example
   * Multiple slots for a complex grid feature:
   * ```typescript
   * {
   *   slots: [
   *     'header',
   *     'filters',
   *     'actions',
   *     'row-expander',
   *     'footer',
   *     'pagination'
   *   ]
   * }
   * ```
   *
   * @example
   * Hierarchical slot names for nested components:
   * ```typescript
   * {
   *   slots: [
   *     'card-header-left',
   *     'card-header-right',
   *     'card-body',
   *     'card-footer-actions'
   *   ]
   * }
   * ```
   */
  slots?: string[];

  /**
   * Optional array of handler function identifiers that must be provided by the consuming application
   * when this feature's UI is rendered.
   *
   * @remarks
   * These handler names establish a strict contract between the feature and its consumers, ensuring
   * that all necessary callback functions or event handlers exist in the rendering context before
   * the feature UI is displayed. This validation mechanism prevents runtime errors from missing
   * handlers and makes feature integration requirements explicit and enforceable.
   *
   * **Handler Validation Process:**
   * 1. Feature declares required handlers during feature definition
   * 2. List runtime validates handler presence during feature compilation or initialization
   * 3. If validation fails, compilation throws an error with details about missing handlers
   * 4. If validation succeeds, feature can safely invoke handlers during execution
   *
   * **Handler Naming Conventions:**
   * - Use camelCase for consistency with JavaScript conventions (e.g., 'onRowSelect')
   * - Prefix event handlers with 'on' to indicate callback nature (e.g., 'onClick', 'onChange')
   * - Use descriptive names that convey the handler's purpose and timing
   * - Include the subject of the handler in the name (e.g., 'onRowClick' not 'onClick')
   *
   * **Handler Sources:**
   * Required handlers are typically provided through:
   * - Props passed to the list component from parent components
   * - Configuration objects provided during list initialization
   * - Context objects from the UI framework (React Context, Vue provide/inject, etc.)
   * - Feature-specific configuration during feature composition
   *
   * **Error Handling:**
   * When required handlers are missing:
   * - Development mode: Throws descriptive error with missing handler names
   * - Production mode: May throw error or use fallback no-op handlers depending on configuration
   * - Type systems (TypeScript): Can provide compile-time validation when properly typed
   *
   * **Best Practices:**
   * - Only declare handlers as required if they are essential for feature operation
   * - Document expected handler signatures in feature documentation
   * - Provide default or fallback handlers in the feature when possible to reduce requirements
   * - Consider making handlers optional and checking for existence before invocation for better flexibility
   *
   * Declaring required handlers ensures proper integration and prevents silent failures when features
   * expect interaction capabilities that are not provided by the consuming application.
   *
   * @example
   * Basic required handlers for a selectable list:
   * ```typescript
   * {
   *   requiredHandlers: ['onRowSelect', 'onRowDeselect']
   * }
   * ```
   *
   * @example
   * Comprehensive handlers for an editable data grid:
   * ```typescript
   * {
   *   requiredHandlers: [
   *     'onRowSelect',
   *     'onRowEdit',
   *     'onRowSave',
   *     'onRowCancel',
   *     'onRowDelete',
   *     'onValidate',
   *     'onError'
   *   ]
   * }
   * ```
   *
   * @example
   * Handlers for a filterable and sortable list:
   * ```typescript
   * {
   *   requiredHandlers: [
   *     'onFilterChange',
   *     'onSortChange',
   *     'onPageChange',
   *     'onRefresh'
   *   ]
   * }
   * ```
   *
   * @example
   * Handlers with specific event semantics:
   * ```typescript
   * {
   *   requiredHandlers: [
   *     'onBeforeRowSelect',  // Called before selection changes
   *     'onRowSelect',         // Called when selection changes
   *     'onAfterRowSelect',    // Called after selection is finalized
   *     'onRowSelectError'     // Called if selection fails validation
   *   ]
   * }
   * ```
   */
  requiredHandlers?: string[];
}
