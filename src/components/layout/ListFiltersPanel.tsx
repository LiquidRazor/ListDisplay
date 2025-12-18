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
import type {FiltersPanelProps} from "../../types";

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
export const ListFiltersPanel: React.FC<FiltersPanelProps> = ({
                                                                state,
                                                                fields,
                                                                onChangeFilters,
                                                              }) => {
  if (!onChangeFilters || fields.length === 0) {
    return null;
  }

    const handleReset = () => {
    onChangeFilters({});
  };

  return (
      <div className="ld-list__filters">
        <div className="ld-list__filters-header">
          <span className="ld-list__filters-title">Filters</span>
          <button
              type="button"
              className="ld-list__filters-reset"
              onClick={handleReset}
              disabled={state.status === "loading"}
          >
            Reset
          </button>
        </div>
        <div className="ld-list__filters-content">
        <span className="ld-list__filters-placeholder">
          Filter UI not configured. Provide a custom FiltersPanel via slots.
        </span>
        </div>
      </div>
  );
};

export default ListFiltersPanel;
