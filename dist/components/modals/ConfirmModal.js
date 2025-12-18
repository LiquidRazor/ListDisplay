import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Very small, unstyled confirm modal.
 * Styling is left to consumer via CSS classes.
 */
export const ConfirmModal = ({ title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", onConfirm, onCancel, }) => {
    const handleConfirm = () => {
        onConfirm();
    };
    const handleCancel = () => {
        onCancel();
    };
    return (_jsx("div", { className: "ld-modal ld-modal--backdrop", children: _jsxs("div", { className: "ld-modal__dialog ld-modal__dialog--confirm", children: [_jsx("div", { className: "ld-modal__header", children: _jsx("h2", { className: "ld-modal__title", children: title }) }), description && (_jsx("div", { className: "ld-modal__body", children: typeof description === "string" ? (_jsx("p", { children: description })) : (description) })), _jsxs("div", { className: "ld-modal__footer", children: [_jsx("button", { type: "button", className: "ld-modal__button ld-modal__button--cancel", onClick: handleCancel, children: cancelLabel }), _jsx("button", { type: "button", className: "ld-modal__button ld-modal__button--confirm", onClick: handleConfirm, children: confirmLabel })] })] }) }));
};
export default ConfirmModal;
//# sourceMappingURL=ConfirmModal.js.map