/**
 * List row component module.
 *
 * @remarks
 * This module contains the ListRow component responsible for rendering
 * individual table rows within a list, including cell rendering, selection state,
 * and row-level actions.
 *
 * @packageDocumentation
 * @internal
 */
import React from "react";
import type { FieldSchema, ListState, RowAction } from "../../types";
/**
 * Props for the ListRow component.
 *
 * @internal
 */
export interface ListRowProps {
    /** The data object for the current row */
    row: any;
    /** The zero-based index of the row in the list */
    rowIndex: number;
    /** Array of field schemas defining the columns to display */
    fields: Array<FieldSchema<any>>;
    /** The current state of the list including selection and metadata */
    state: ListState<any>;
    /** The key used to uniquely identify this row */
    idKey: string;
    /** Optional array of actions available for this row */
    rowActions?: Array<RowAction<any, any>>;
    /** Optional callback function triggered when a row action is clicked */
    onRowActionClick?: (actionId: string, rowIndex: number) => void;
}
/**
 * Renders an individual row within a list table.
 *
 * @remarks
 * This component renders a tr element containing cells for each field and optional
 * row actions. It handles row selection state and applies appropriate styling classes.
 * Each cell is rendered using the ListCell component, and row actions are rendered
 * as buttons within a dedicated actions cell.
 *
 * @param props - The component props
 * @returns A tr element containing cells and optional action buttons
 *
 * @internal
 */
export declare const ListRow: React.FC<ListRowProps>;
export default ListRow;
//# sourceMappingURL=ListRow.d.ts.map