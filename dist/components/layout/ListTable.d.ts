/**
 * List table component module.
 *
 * @remarks
 * This module contains the ListTable component responsible for rendering
 * the main table structure of a list, including the table wrapper, header, and body.
 *
 * @packageDocumentation
 * @internal
 */
import React from "react";
import type { TableProps } from "../../types";
/**
 * Renders the main table structure for a list view.
 *
 * @remarks
 * This component serves as the default table layout, wrapping the table structure
 * and coordinating the rendering of the header and body sections. It automatically
 * determines if row actions should be displayed based on the provided rowActions prop.
 *
 * @param props - The component props conforming to TableProps interface
 * @returns A div wrapper containing the complete table structure
 *
 * @internal
 */
export declare const ListTable: React.FC<TableProps>;
export default ListTable;
//# sourceMappingURL=ListTable.d.ts.map