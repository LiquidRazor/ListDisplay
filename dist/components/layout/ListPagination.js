import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * Basic pagination controls.
 */
export const ListPagination = ({ state, onChangePage, onChangePageSize, }) => {
    const { pagination } = state;
    const { pageIndex, pageSize, totalItems = 0, totalPages = 1, } = pagination;
    const canPrev = pageIndex > 0;
    const canNext = pageIndex < totalPages - 1;
    const handlePrev = () => {
        if (!canPrev || !onChangePage)
            return;
        onChangePage(pageIndex - 1);
    };
    const handleNext = () => {
        if (!canNext || !onChangePage)
            return;
        onChangePage(pageIndex + 1);
    };
    const handlePageSizeChange = (event) => {
        const value = Number(event.target.value);
        if (!Number.isFinite(value) || value <= 0)
            return;
        onChangePageSize?.(value);
    };
    return (_jsxs("div", { className: "ld-list__pagination", children: [_jsxs("div", { className: "ld-list__pagination-info", children: [_jsxs("span", { children: ["Page ", pageIndex + 1, " of ", totalPages] }), _jsxs("span", { className: "ld-list__pagination-total", children: [totalItems, " items"] })] }), _jsxs("div", { className: "ld-list__pagination-controls", children: [_jsx("button", { type: "button", className: "ld-list__pagination-button", onClick: handlePrev, disabled: !canPrev, children: "Prev" }), _jsx("button", { type: "button", className: "ld-list__pagination-button", onClick: handleNext, disabled: !canNext, children: "Next" }), _jsxs("label", { className: "ld-list__pagination-pagesize", children: [_jsx("span", { children: "Rows per page" }), _jsx("select", { className: "ld-list__pagination-pagesize-select", value: pageSize, onChange: handlePageSizeChange, children: [10, 25, 50, 100].map((size) => (_jsx("option", { value: size, children: size }, size))) })] })] })] }));
};
export default ListPagination;
//# sourceMappingURL=ListPagination.js.map