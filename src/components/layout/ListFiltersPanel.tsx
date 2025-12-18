import React from "react";
import type { FiltersPanelProps } from "../../types";

/**
 * Minimal filters panel (placeholder).
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
