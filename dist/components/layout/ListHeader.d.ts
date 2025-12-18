/**
 * List header component module.
 *
 * @remarks
 * This module contains the ListHeader component responsible for rendering
 * the thead element of a list table, including column headers and action column header.
 *
 * @packageDocumentation
 * @internal
 */
import type { FieldSchema } from "../../types";
/**
 * Props for the ListHeader component.
 *
 * @internal
 */
export interface ListHeaderProps<TRow = any> {
    /** Array of field schemas defining the columns to display */
    fields: Array<FieldSchema<TRow>>;
    /** Whether the list has row actions, which requires an additional action column header */
    hasRowActions: boolean;
}
/**
 * Renders the header section of a list table.
 *
 * @remarks
 * This component renders the thead element containing column headers based on field schemas.
 * If row actions are present, an additional empty header cell is rendered for the actions column.
 *
 * @param props - The component props
 * @returns A thead element with header row and cells
 *
 * @internal
 */
export declare const ListHeader: <TRow = any>({ fields, hasRowActions, }: ListHeaderProps<TRow>) => import("react/jsx-runtime").JSX.Element;
export default ListHeader;
//# sourceMappingURL=ListHeader.d.ts.map