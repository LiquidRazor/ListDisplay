import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/modals/ConfirmModal.tsx
import React from "react";
/**
 * Very small, unstyled confirm modal.
 * Styling is left to consumer via CSS classes.
 */
export var ConfirmModal = function (_a) {
    var title = _a.title, description = _a.description, _b = _a.confirmLabel, confirmLabel = _b === void 0 ? "Confirm" : _b, _c = _a.cancelLabel, cancelLabel = _c === void 0 ? "Cancel" : _c, onConfirm = _a.onConfirm, onCancel = _a.onCancel;
    var handleConfirm = function () {
        onConfirm();
    };
    var handleCancel = function () {
        onCancel();
    };
    return (_jsx("div", { className: "ld-modal ld-modal--backdrop", children: _jsxs("div", { className: "ld-modal__dialog ld-modal__dialog--confirm", children: [_jsx("div", { className: "ld-modal__header", children: _jsx("h2", { className: "ld-modal__title", children: title }) }), description && (_jsx("div", { className: "ld-modal__body", children: typeof description === "string" ? (_jsx("p", { children: description })) : (description) })), _jsxs("div", { className: "ld-modal__footer", children: [_jsx("button", { type: "button", className: "ld-modal__button ld-modal__button--cancel", onClick: handleCancel, children: cancelLabel }), _jsx("button", { type: "button", className: "ld-modal__button ld-modal__button--confirm", onClick: handleConfirm, children: confirmLabel })] })] }) }));
};
export default ConfirmModal;
//# sourceMappingURL=ConfirmModal.js.map