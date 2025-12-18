import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Minimal filters panel (placeholder).
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