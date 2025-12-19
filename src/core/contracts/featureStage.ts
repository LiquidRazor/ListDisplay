/**
 * Union type defining the execution stages of features in the list feature pipeline.
 *
 * @remarks
 * This type lists the four distinct stages through which features are processed during
 * list compilation and execution. Each stage represents a specific phase in the feature
 * lifecycle with a designated purpose in the processing pipeline.
 *
 * Stage execution order and purposes:
 *
 * 1. **derive** - Data derivation and transformation stage
 *    - Features compute additional properties from row data
 *    - Features transform or enrich existing row data
 *    - Executes before event handlers, lifecycle hooks, and UI rendering
 *    - Ensures all derived data is available for later stages
 *
 * 2. **handlers** - Event handler registration stage
 *    - Features register event listeners for user interactions
 *    - Features attach callbacks to system events
 *    - Executes after data derivation but before UI rendering
 *    - Enables features to respond to interactions with derived data
 *
 * 3. **lifecycle** - Lifecycle management stage
 *    - Features execute initialization logic via onInit hooks
 *    - Features perform cleanup operations via onDestroy hooks
 *    - Features handle data refresh operations via onRefresh hooks
 *    - Manages feature state throughout the component lifetime
 *    - Executes at specific lifecycle transition points
 *
 * 4. **ui** - User interface rendering stage
 *    - Features contribute visual components to the list
 *    - Features provide rendering templates and elements
 *    - Features modify the rendering pipeline
 *    - Executes last to ensure all data and handlers are ready
 *
 * The sequential processing order (derive → handlers → lifecycle → ui) guarantees proper
 * feature initialization and maintains a consistent data flow through the system. This ordering
 * prevents race conditions and ensures that each stage has access to the outputs of previous stages.
 *
 * Features are resolved and ordered within each stage using topological dependency resolution
 * (see {@link resolveFeatureOrder}) and then compiled into an optimized execution plan
 * (see {@link CompiledFeaturePlan}) that coordinates execution across all stages.
 *
 * @see {@link ListFeatureContext} for the context object passed to features during execution
 *
 * @internal
 */
export type FeatureStage =
  | "derive"
  | "handlers"
  | "lifecycle"
  | "ui";
