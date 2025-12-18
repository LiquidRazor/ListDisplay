import React from "react";
import type { SortBarProps } from "../../types";

/**
 * Minimal sort bar: renders a dropdown of sortable fields.
 */
export const ListSortBar: React.FC<SortBarProps> = ({
                                                      state,
                                                      fields,
                                                      onChangeSort,
                                                    }) => {
  if (!onChangeSort) {
    return null;
  }

  const sortableFields = fields.filter((f) => f.sortable);
  if (sortableFields.length === 0) {
    return null;
  }

  const currentFieldId = (state.sort?.field as string) ?? "";
  const currentDirection = state.sort?.direction ?? "asc";

  const handleFieldChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const fieldId = event.target.value;
    if (!fieldId) {
      onChangeSort("");
      return;
    }
    onChangeSort(fieldId);
  };

  const handleDirectionToggle = () => {
    if (!state.sort) {
      return;
    }
    onChangeSort(state.sort.field as string);
  };

  return (
      <div className="ld-list__sortbar">
        <label className="ld-list__sortbar-field">
          <span className="ld-list__sortbar-label">Sort by</span>
          <select
              className="ld-list__sortbar-select"
              value={currentFieldId}
              onChange={handleFieldChange}
          >
            <option value="">None</option>
            {sortableFields.map((field) => (
                <option key={String(field.id)} value={String(field.id)}>
                  {field.label}
                </option>
            ))}
          </select>
        </label>

        {currentFieldId && (
            <button
                type="button"
                className={`ld-list__sortbar-direction ld-list__sortbar-direction--${currentDirection}`}
                onClick={handleDirectionToggle}
            >
              {currentDirection === "asc" ? "↑" : "↓"}
            </button>
        )}
      </div>
  );
};

export default ListSortBar;
