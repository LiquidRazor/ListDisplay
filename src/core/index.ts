/**
 * Core functionality module for the list display system.
 *
 * @remarks
 * This module exports all the core state management utilities, hooks, and types
 * that power the list display component. It includes filtering, pagination,
 * selection, sorting, snapshots, UI state management, and the main list core hook.
 *
 * @packageDocumentation
 * @internal
 */

/**
 * Re-exports all filter-related types, utilities, and hooks
 * @internal
 */
export * from "./filters"

/**
 * Re-exports all pagination-related types, state, and utilities
 * @internal
 */
export * from "./pagination"

/**
 * Re-exports all selection-related types, state, and utilities
 * @internal
 */
export * from "./selection"

/**
 * Re-exports snapshot functionality for capturing and restoring list state
 * @internal
 */
export * from "./snapshots"

/**
 * Re-exports all sorting-related types, descriptors, and utilities
 * @internal
 */
export * from "./sorting"

/**
 * Re-exports UI state management types and utilities
 * @internal
 */
export * from "./uiState"

/**
 * Re-exports the main useListCore hook that orchestrates all list functionality
 * @internal
 */
export * from "./useListCore"