import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
// src/components/layout/ListPagination.tsx
import React from "react";
/**
 * Basic pagination controls.
 */
export var ListPagination = function (_a) {
    var state = _a.state, onChangePage = _a.onChangePage, onChangePageSize = _a.onChangePageSize;
    var pagination = state.pagination;
    var pageIndex = pagination.pageIndex, pageSize = pagination.pageSize, _b = pagination.totalItems, totalItems = _b === void 0 ? 0 : _b, _c = pagination.totalPages, totalPages = _c === void 0 ? 1 : _c;
    var canPrev = pageIndex > 0;
    var canNext = pageIndex < totalPages - 1;
    var handlePrev = function () {
        if (!canPrev || !onChangePage)
            return;
        onChangePage(pageIndex - 1);
    };
    var handleNext = function () {
        if (!canNext || !onChangePage)
            return;
        onChangePage(pageIndex + 1);
    };
    var handlePageSizeChange = function (event) {
        var value = Number(event.target.value);
        if (!Number.isFinite(value) || value <= 0)
            return;
        onChangePageSize === null || onChangePageSize === void 0 ? void 0 : onChangePageSize(value);
    };
    return (_jsxs("div", { className: "ld-list__pagination", children: [_jsxs("div", { className: "ld-list__pagination-info", children: [_jsxs("span", { children: ["Page ", pageIndex + 1, " of ", totalPages] }), _jsxs("span", { className: "ld-list__pagination-total", children: [totalItems, " items"] })] }), _jsxs("div", { className: "ld-list__pagination-controls", children: [_jsx("button", { type: "button", className: "ld-list__pagination-button", onClick: handlePrev, disabled: !canPrev, children: "Prev" }), _jsx("button", { type: "button", className: "ld-list__pagination-button", onClick: handleNext, disabled: !canNext, children: "Next" }), _jsxs("label", { className: "ld-list__pagination-pagesize", children: [_jsx("span", { children: "Rows per page" }), _jsx("select", { className: "ld-list__pagination-pagesize-select", value: pageSize, onChange: handlePageSizeChange, children: [10, 25, 50, 100].map(function (size) { return (_jsx("option", { value: size, children: size }, size)); }) })] })] })] }));
};
export default ListPagination;
//# sourceMappingURL=ListPagination.js.map