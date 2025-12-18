/**
 * List body component module.
 *
 * @remarks
 * This module contains the ListBody component responsible for rendering
 * the tbody element of a list table, including rows and empty state handling.
 *
 * @packageDocumentation
 * @internal
 */
import React from "react";
import type { ListState, FieldSchema, RowAction } from "../../types";
/**
 * Props for the ListBody component.
 *
 * @internal
 */
export interface ListBodyProps {
    /** The current state of the list including rows and metadata */
    state: ListState<any>;
    /** Array of field schemas defining the columns to display */
    fields: Array<FieldSchema<any>>;
    /** The key used to uniquely identify each row */
    idKey: string;
    /** Optional array of actions available for each row */
    rowActions?: Array<RowAction<any, any>>;
    /** Optional callback function triggered when a row action is clicked */
    onRowActionClick?: (actionId: string, rowIndex: number) => void;
}
/**
 * Renders the body section of a list table.
 *
 * @remarks
 * This component renders the tbody element containing all data rows or an empty state
 * when no data is available. It delegates individual row rendering to the ListRow component.
 *
 * @param props - The component props
 * @returns A tbody element with rows or empty state
 *
 * @internal
 */
export declare const ListBody: React.FC<ListBodyProps>;
export default ListBody;
//# sourceMappingURL=ListBody.d.ts.map