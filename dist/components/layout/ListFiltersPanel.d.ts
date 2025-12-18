/**
 * List filters panel component module.
 *
 * @remarks
 * This module contains the ListFiltersPanel component responsible for rendering
 * a placeholder filters panel with reset functionality. It displays a message
 * prompting users to provide a custom FiltersPanel via slots.
 *
 * @packageDocumentation
 * @internal
 */
import React from "react";
import type { FiltersPanelProps } from "../../types";
/**
 * Renders a placeholder filters panel for list views.
 *
 * @remarks
 * This component provides a minimal filters panel UI that displays a placeholder
 * message when no custom filters panel is configured. It includes a reset button
 * to clear all active filters and is disabled during loading states.
 *
 * @param props - The component props conforming to FiltersPanelProps interface
 * @returns A filters panel element or null if onChangeFilters is not provided or no fields exist
 *
 * @internal
 */
export declare const ListFiltersPanel: React.FC<FiltersPanelProps>;
export default ListFiltersPanel;
//# sourceMappingURL=ListFiltersPanel.d.ts.map