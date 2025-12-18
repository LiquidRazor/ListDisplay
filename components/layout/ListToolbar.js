import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Default toolbar: renders general actions as buttons.
 */
export const ListToolbar = ({ state, generalActions, onActionClick, }) => {
    if (!generalActions || generalActions.length === 0) {
        return null;
    }
    return (_jsx("div", { className: "ld-list__toolbar", children: generalActions.map((action) => (_jsxs("button", { type: "button", className: `ld-list__toolbar-button ld-list__toolbar-button--${action.kind ?? "default"}`, onClick: () => onActionClick?.(action.id), disabled: state.status === "loading" || state.status === "streaming", children: [action.icon && (_jsx("span", { className: "ld-list__toolbar-button-icon", children: action.icon })), _jsx("span", { className: "ld-list__toolbar-button-label", children: action.label })] }, action.id))) }));
};
export default ListToolbar;
