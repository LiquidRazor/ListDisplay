var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
export var createInitialUiState = function () { return ({
    activeAction: undefined,
    modal: {
        isOpen: false,
    },
}); };
export var openModalForAction = function (prev, actionId, type, rowId) { return (__assign(__assign({}, prev), { activeAction: {
        type: type,
        actionId: actionId,
        rowId: rowId,
    }, modal: {
        isOpen: true,
        actionId: actionId,
        rowId: rowId,
    } })); };
export var closeModal = function (prev) { return (__assign(__assign({}, prev), { modal: {
        isOpen: false,
    } })); };
export var clearActiveAction = function (prev) { return (__assign(__assign({}, prev), { activeAction: undefined })); };
//# sourceMappingURL=uiState.js.map