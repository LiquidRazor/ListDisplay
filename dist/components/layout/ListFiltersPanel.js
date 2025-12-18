import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export const ListFiltersPanel = ({ state, fields, onChangeFilters, }) => {
    if (!onChangeFilters || fields.length === 0) {
        return null;
    }
    const handleReset = () => {
        onChangeFilters({});
    };
    return (_jsxs("div", { className: "ld-list__filters", children: [_jsxs("div", { className: "ld-list__filters-header", children: [_jsx("span", { className: "ld-list__filters-title", children: "Filters" }), _jsx("button", { type: "button", className: "ld-list__filters-reset", onClick: handleReset, disabled: state.status === "loading", children: "Reset" })] }), _jsx("div", { className: "ld-list__filters-content", children: _jsx("span", { className: "ld-list__filters-placeholder", children: "Filter UI not configured. Provide a custom FiltersPanel via slots." }) })] }));
};
export default ListFiltersPanel;
//# sourceMappingURL=ListFiltersPanel.js.map