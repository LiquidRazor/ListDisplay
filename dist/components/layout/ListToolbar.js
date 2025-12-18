import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export const ListToolbar = ({ state, generalActions, onActionClick, }) => {
    if (!generalActions || generalActions.length === 0) {
        return null;
    }
    return (_jsx("div", { className: "ld-list__toolbar", children: generalActions.map((action) => (_jsxs("button", { type: "button", className: `ld-list__toolbar-button ld-list__toolbar-button--${action.kind ?? "default"}`, onClick: () => onActionClick?.(action.id), disabled: state.status === "loading" || state.status === "streaming", children: [action.icon && (_jsx("span", { className: "ld-list__toolbar-button-icon", children: action.icon })), _jsx("span", { className: "ld-list__toolbar-button-label", children: action.label })] }, action.id))) }));
};
export default ListToolbar;
//# sourceMappingURL=ListToolbar.js.map