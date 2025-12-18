/**
 * List pagination component module.
 *
 * @remarks
 * This module contains the ListPagination component responsible for rendering
 * pagination controls including page navigation, page size selection, and display
 * of current pagination state information.
 *
 * @packageDocumentation
 * @internal
 */
import React from "react";
import type { PaginationProps } from "../../types";
/**
 * Renders pagination controls for navigating through list pages.
 *
 * @remarks
 * This component provides a complete pagination UI including:
 * - Current page and total pages display
 * - Total items count
 * - Previous/Next navigation buttons with disabled states
 * - Page size selector dropdown with preset options (10, 25, 50, 100)
 *
 * The component uses the pagination state from the provided ListState and
 * triggers callbacks when users interact with page navigation or page size controls.
 *
 * @param props - The component props
 * @returns A div element containing pagination information and controls
 *
 * @internal
 */
export declare const ListPagination: React.FC<PaginationProps>;
export default ListPagination;
//# sourceMappingURL=ListPagination.d.ts.map