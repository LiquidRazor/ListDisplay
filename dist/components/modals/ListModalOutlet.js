import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/modals/ListModalOutlet.tsx
import React, { useMemo } from "react";
import { ConfirmModal } from "./ConfirmModal";
/**
 * Default modal outlet implementation.
 *
 * Supports:
 *  - Confirm modal (ModalConfig.type === "confirm")
 *
 * For custom modals (ModalConfig.type === "custom"), consumers are expected
 * to override this component via the "ModalOutlet" slot and handle rendering
 * themselves.
 */
export var ListModalOutlet = function (_a) {
    var _b;
    var state = _a.state, generalActions = _a.generalActions, rowActions = _a.rowActions, onConfirm = _a.onConfirm, onCancel = _a.onCancel;
    var ui = state.ui;
    var modal = ui.modal, activeAction = ui.activeAction;
    if (!modal || !modal.isOpen || !modal.actionId) {
        return null;
    }
    var actionType = (_b = activeAction === null || activeAction === void 0 ? void 0 : activeAction.type) !== null && _b !== void 0 ? _b : (modal.rowId != null ? "row" : "general");
    var _c = useMemo(function () {
        var act;
        var config;
        if (actionType === "general") {
            act = (generalActions !== null && generalActions !== void 0 ? generalActions : []).find(function (a) { return a.id === modal.actionId; });
        }
        else if (actionType === "row") {
            act = (rowActions !== null && rowActions !== void 0 ? rowActions : []).find(function (a) { return a.id === modal.actionId; });
        }
        if (act && act.modal) {
            config = act.modal;
        }
        return { action: act, modalConfig: config };
    }, [actionType, modal.actionId, generalActions, rowActions]), action = _c.action, modalConfig = _c.modalConfig;
    // Dacă nu găsim acțiunea sau nu are modal config, tot afișăm ceva minim.
    if (!action || !modalConfig) {
        return (_jsx(ConfirmModal, { title: "Confirm action", description: _jsx("span", { children: "Are you sure you want to execute this action?" }), onConfirm: function () { return onConfirm(); }, onCancel: onCancel }));
    }
    // Confirm modal config suportat fully aici.
    if (modalConfig.type === "confirm") {
        return (_jsx(ConfirmModal, { title: modalConfig.title, description: modalConfig.description, confirmLabel: modalConfig.confirmLabel, cancelLabel: modalConfig.cancelLabel, onConfirm: function () { return onConfirm(); }, onCancel: onCancel }));
    }
    // Custom modal NU este implementat by default în core.
    // Utilizatorul poate overrida ModalOutlet în config.components.ModalOutlet.
    if (modalConfig.type === "custom") {
        return (_jsx("div", { className: "ld-modal ld-modal--backdrop", children: _jsxs("div", { className: "ld-modal__dialog ld-modal__dialog--custom-unsupported", children: [_jsx("div", { className: "ld-modal__header", children: _jsx("h2", { className: "ld-modal__title", children: "Custom modal not handled by default ModalOutlet" }) }), _jsx("div", { className: "ld-modal__body", children: _jsxs("p", { children: ["The current action uses a custom modal configuration. Provide a custom ", _jsx("code", { children: "ModalOutlet" }), " component via the list's ", _jsx("code", { children: "components" }), " configuration to render it."] }) }), _jsx("div", { className: "ld-modal__footer", children: _jsx("button", { type: "button", className: "ld-modal__button ld-modal__button--cancel", onClick: onCancel, children: "Close" }) })] }) }));
    }
    // fallback absolut (în caz de tip necunoscut)
    return null;
};
export default ListModalOutlet;
//# sourceMappingURL=ListModalOutlet.js.map