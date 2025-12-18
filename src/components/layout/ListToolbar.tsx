/**
 * List toolbar component module.
 *
 * @remarks
 * This module contains the ListToolbar component responsible for rendering
 * a toolbar with general action buttons for list operations.
 *
 * @packageDocumentation
 * @internal
 */

import React from "react";
import type {ToolbarProps} from "../../types";

/**
 * Renders a toolbar with general action buttons for list operations.
 *
 * @remarks
 * This component displays a horizontal toolbar containing action buttons based on
 * the provided generalActions array. Each action is rendered as a button with optional
 * icon and label. Buttons are disabled during loading or streaming states.
 * Returns null if no general actions are provided.
 *
 * @param props - The component props conforming to ToolbarProps interface
 * @returns A toolbar div element with action buttons, or null if no actions are provided
 *
 * @internal
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
