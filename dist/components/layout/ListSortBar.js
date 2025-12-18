import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Minimal sort bar: renders a dropdown of sortable fields.
 */
export const ListSortBar = ({ state, fields, onChangeSort, }) => {
    if (!onChangeSort) {
        return null;
    }
    const sortableFields = fields.filter((f) => f.sortable);
    if (sortableFields.length === 0) {
        return null;
    }
    const currentFieldId = state.sort?.field ?? "";
    const currentDirection = state.sort?.direction ?? "asc";
    const handleFieldChange = (event) => {
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
        onChangeSort(state.sort.field);
    };
    return (_jsxs("div", { className: "ld-list__sortbar", children: [_jsxs("label", { className: "ld-list__sortbar-field", children: [_jsx("span", { className: "ld-list__sortbar-label", children: "Sort by" }), _jsxs("select", { className: "ld-list__sortbar-select", value: currentFieldId, onChange: handleFieldChange, children: [_jsx("option", { value: "", children: "None" }), sortableFields.map((field) => (_jsx("option", { value: String(field.id), children: field.label }, String(field.id))))] })] }), currentFieldId && (_jsx("button", { type: "button", className: `ld-list__sortbar-direction ld-list__sortbar-direction--${currentDirection}`, onClick: handleDirectionToggle, children: currentDirection === "asc" ? "↑" : "↓" }))] }));
};
export default ListSortBar;
//# sourceMappingURL=ListSortBar.js.map