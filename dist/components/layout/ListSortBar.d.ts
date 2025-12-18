/**
 * List sort bar component module.
 *
 * @remarks
 * This module contains the ListSortBar component responsible for rendering
 * a sort control interface with a dropdown for selecting sortable fields
 * and a toggle button for changing sort direction.
 *
 * @packageDocumentation
 * @internal
 */
import React from "react";
import type { SortBarProps } from "../../types";
/**
 * Renders a sort control bar for list tables.
 *
 * @remarks
 * This component provides a minimal sort interface with a dropdown to select
 * sortable fields and a direction toggle button. It only renders if the onChangeSort
 * callback is provided and there are sortable fields available. The component
 * automatically filters fields to show only those marked as sortable.
 *
 * @param props - The component props
 * @returns A sort bar with field selector and direction toggle, or null if sorting is not available
 *
 * @internal
 */
export declare const ListSortBar: React.FC<SortBarProps>;
export default ListSortBar;
//# sourceMappingURL=ListSortBar.d.ts.map