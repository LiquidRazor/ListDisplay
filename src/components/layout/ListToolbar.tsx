// src/components/layout/ListToolbar.tsx

import React from "react";
import type { ToolbarProps } from "../../types";

/**
 * Default toolbar: renders general actions as buttons.
 */
export const ListToolbar: React.FC<ToolbarProps> = ({
                                                      state,
                                                      generalActions,
                                                      onActionClick,
                                                    }) => {
  if (!generalActions || generalActions.length === 0) {
    return null;
  }

  return (
      <div className="ld-list__toolbar">
        {generalActions.map((action) => (
            <button
                key={action.id}
                type="button"
                className={`ld-list__toolbar-button ld-list__toolbar-button--${
                    action.kind ?? "default"
                }`}
                onClick={() => onActionClick?.(action.id)}
                disabled={state.status === "loading" || state.status === "streaming"}
            >
              {action.icon && (
                  <span className="ld-list__toolbar-button-icon">
              {action.icon}
            </span>
              )}
              <span className="ld-list__toolbar-button-label">
            {action.label}
          </span>
            </button>
        ))}
      </div>
  );
};

export default ListToolbar;
