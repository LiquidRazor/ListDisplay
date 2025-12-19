/**
 * Example demonstrating feature registry configuration and usage.
 *
 * @remarks
 * This file provides a comprehensive example of how to create and configure a feature registry
 * with multiple features including filtering, sorting, pagination, selection, modals, and actions.
 * It demonstrates the registration order, configuration patterns, and integration between features.
 *
 * This is a reference implementation showing common patterns and best practices for setting up
 * a feature-rich list component.
 *
 * @example
 * ```typescript
 * // Use this example as a template for creating your own registry
 * const myRegistry = createFeatureRegistry<MyRow, MyMeta, CoreListState<MyRow>, unknown>()
 *   .register(filteringFeature({ ... }))
 *   .register(sortingFeature({ ... }));
 * ```
 *
 * @public
 */

import {createFeatureRegistry} from "../core/registry/featureRegistry";
import {filteringFeature} from "./filtering";
import {sortingFeature} from "./sorting";
import {CoreListState} from "../core/store/coreState";
import {paginationFeature} from "./pagination";
import {selectionFeature} from "./selection";
import {modalsFeature} from "./modals";
import {rowActionsFeature} from "./actions";
import {generalActionsFeature} from "./actions";

/**
 * Example feature registry configuration demonstrating a fully-featured list setup.
 *
 * @remarks
 * This registry combines multiple features to create a complete list management system:
 * - Filtering: Custom filter application with empty initial state
 * - Sorting: Compare-based sorting with null-safe comparison logic
 * - Pagination: 25 items per page starting at index 0
 * - Selection: Multiple row selection support
 * - Modals: Confirmation dialogs for destructive actions
 * - Row Actions: Per-row operations (e.g., remove)
 * - General Actions: Bulk operations (e.g., remove selected)
 *
 * Features are registered in a specific order to ensure proper dependency handling
 * and data flow through the feature pipeline.
 *
 * @public
 */
const registry = createFeatureRegistry<any, any, CoreListState<any>, unknown>()
    .register(
        filteringFeature({
            apply: (rows) => rows,
            initial: {},
        })
    )
    .register(
        sortingFeature({
            mode: "compare",
            /**
             * Comparison function for sorting rows by field values.
             *
             * @remarks
             * This function implements a null-safe comparison strategy that handles both
             * numeric and string values:
             * - Null values are sorted before non-null values
             * - Numbers are compared numerically
             * - Other values are converted to strings and compared using locale-aware comparison
             *
             * This is a basic implementation suitable for most common use cases but can be
             * customized for specific data types or sorting requirements.
             *
             * @param a - First row to compare
             * @param b - Second row to compare
             * @param sort - Sort configuration containing the fieldId to sort by
             *
             * @returns Negative number if a comes before b, positive if b comes before a, 0 if equal
             */
            compare: (a: any, b: any, sort) => {
                const av = a?.[sort.fieldId];
                const bv = b?.[sort.fieldId];

                if (av == null && bv == null) return 0;
                if (av == null) return -1;
                if (bv == null) return 1;

                if (typeof av === "number" && typeof bv === "number") return av - bv;
                return String(av).localeCompare(String(bv));
            },
            initial: null,
        })
    )
    .register(paginationFeature({initialPageIndex: 0, initialPageSize: 25}))
    .register(selectionFeature({mode: "multiple"}))
    .register(modalsFeature())
    .register(
        rowActionsFeature({
            actions: [
                /**
                 * Row action for removing a single row from the list.
                 *
                 * @remarks
                 * This action demonstrates a typical delete operation with the following behavior:
                 * - Displays a confirmation modal before removing the row
                 * - Shows the row's name (or "this item" as fallback) in the confirmation message
                 * - Removes the row from the list by filtering it out based on the ID key
                 * - Uses the idKey from meta to identify which field contains the row's unique identifier
                 *
                 * The modal integration ensures users confirm destructive operations before they are executed.
                 *
                 * @example
                 * ```typescript
                 * // When triggered, shows modal: "Remove John Doe?"
                 * // On confirmation, filters out the row with matching ID
                 * ```
                 */
                {
                    id: "remove",
                    label: "Remove",
                    modal: ({ row }) => ({
                        meta: {
                            title: "Confirm remove",
                            message: `Remove ${(row as any).name ?? "this item"}?`,
                        },
                    }),
                    handler: async ({ rowId, updateRows, meta }) => {
                        const idKey = meta?.idKey as string;
                        updateRows((rows) => rows.filter((r: any) => r[idKey] !== rowId));
                    },
                },
            ],
        })
    )
    .register(
        generalActionsFeature({
            actions: [
                /**
                 * General action for bulk removal of selected rows from the list.
                 *
                 * @remarks
                 * This action demonstrates a typical bulk delete operation with the following behavior:
                 * - Only enabled when at least one row is selected
                 * - Displays a confirmation modal showing the count of items to be removed
                 * - Removes all selected rows by filtering them out based on their IDs
                 * - Uses the idKey from meta to identify which field contains row unique identifiers
                 * - Integrates with the selection feature to access selectedIds
                 *
                 * This pattern is common for batch operations where users need to perform the same
                 * action on multiple items at once with a single confirmation step.
                 *
                 * @example
                 * ```typescript
                 * // When 3 rows selected, shows modal: "Remove 3 selected items?"
                 * // On confirmation, filters out all rows with IDs in the selection
                 * ```
                 */
                {
                    id: "remove-selected",
                    label: "Remove selected",
                    isEnabled: ({ selection }) => {
                        const ids = (selection as any)?.selectedIds ?? [];
                        return ids.length > 0;
                    },
                    modal: ({ selection }) => ({
                        meta: {
                            title: "Confirm removal",
                            message: `Remove ${(selection as any)?.selectedIds?.length ?? 0} selected items?`,
                        },
                    }),
                    handler: async ({ updateRows, selection, meta }) => {
                        const ids: any[] = (selection as any)?.selectedIds ?? [];
                        const idKey = meta.idKey;

                        updateRows((rows) => rows.filter((r: any) => !ids.includes(r[idKey])));
                    },
                },
            ],
        })
    )
