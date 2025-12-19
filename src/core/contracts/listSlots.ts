import type { ComponentType } from "react";

/**
 * Type definition for the slots registry that maps slot names to React component types.
 *
 * @remarks
 * This type represents a flexible registry for list UI component slots, allowing features
 * to register and access React components dynamically. Each slot is identified by a string
 * key and contains either a React component or undefined if the slot is not populated.
 *
 * The record structure supports:
 * - Built-in slot names (see {@link BuiltInSlotNames}) for standard list UI elements
 * - Custom arbitrary slot names defined by features or implementations
 * - Optional slots (undefined values) for conditional UI elements
 *
 * Slots are typically populated during the "ui" feature stage (see {@link FeatureStage})
 * and consumed by rendering components to compose the complete list interface. Features
 * can register components for specific slots to extend or customize the list UI without
 * modifying core rendering logic.
 *
 * Common usage patterns:
 * - Features register components: `slots.Toolbar = MyToolbarComponent`
 * - Renderers consume components: `const Toolbar = slots.Toolbar`
 * - Conditional rendering: `{slots.LoadingState && <slots.LoadingState />}`
 *
 * @typeParam key - String identifier for the slot (supports both built-in and custom names)
 * @typeParam value - React component type accepting any props, or undefined for empty slots
 *
 * @see {@link BuiltInSlotNames} for standard slot name definitions
 * @see {@link FeatureStage} for the UI stage where slots are typically populated
 *
 * @internal
 */
export type ListSlots = Record<string, ComponentType<any> | undefined>;

/**
 * Union type defining the standard built-in slot names for list UI components.
 *
 * @remarks
 * This type lists the conventional slot names used by the list system for common
 * UI elements. While the {@link ListSlots} registry accepts arbitrary string keys, this
 * type provides type-safe references to standard slots that are commonly implemented
 * across list features and components.
 *
 * Standard slot definitions and purposes:
 *
 * - **Toolbar** - Top-level action bar for bulk operations, global actions, and controls
 * - **FiltersPanel** - UI for displaying and managing data filtering controls
 * - **SortBar** - Controls for sorting list data by various criteria
 * - **Table** - Main data display component (grid, table, or list view)
 * - **Pagination** - Navigation controls for paginated data sets
 * - **ModalOutlet** - Container for modal dialogs and overlays
 * - **LoadingState** - Component displayed during asynchronous data loading operations
 * - **EmptyState** - Component displayed when the list contains no data
 * - **ErrorState** - Component displayed when data loading or processing fails
 *
 * Features and implementations are not required to use these specific slot names, as the
 * {@link ListSlots} type accepts any string key. However, using these standard names promotes
 * consistency across implementations and enables interoperability between features.
 *
 * Custom slot names can be freely added to the registry alongside these built-in names,
 * allowing features to define additional UI extension points as needed.
 *
 * @see {@link ListSlots} for the complete slots registry type definition
 *
 * @internal
 */
export type BuiltInSlotNames =
  | "Toolbar"
  | "FiltersPanel"
  | "SortBar"
  | "Table"
  | "Pagination"
  | "ModalOutlet"
  | "LoadingState"
  | "EmptyState"
  | "ErrorState";
