/**
 * Confirm modal component module.
 *
 * @remarks
 * This module contains the ConfirmModal component and related props interface
 * for displaying confirmation dialogs with customizable content and actions.
 *
 * @packageDocumentation
 * @public
 */
import React from "react";
/**
 * Props for the ConfirmModal component.
 *
 * @public
 */
export interface ConfirmModalProps {
    /** The title text displayed in the modal header */
    title: string;
    /** Optional description content displayed in the modal body, can be a string or React node */
    description?: React.ReactNode;
    /** Optional label for the confirm button, defaults to "Confirm" */
    confirmLabel?: string;
    /** Optional label for the cancel button, defaults to "Cancel" */
    cancelLabel?: string;
    /** Callback function triggered when the confirm button is clicked, can be synchronous or asynchronous */
    onConfirm: () => void | Promise<void>;
    /** Callback function triggered when the cancel button is clicked */
    onCancel: () => void;
}
/**
 * Renders a confirmation modal dialog with customizable content and actions.
 *
 * @remarks
 * This component provides a very small, unstyled confirm modal.
 * Styling is left to consumer via CSS classes. The modal includes a header,
 * optional body content, and footer with cancel and confirm action buttons.
 *
 * @param props - The component props
 * @returns A modal dialog element with backdrop
 *
 * @public
 */
export declare const ConfirmModal: React.FC<ConfirmModalProps>;
export default ConfirmModal;
//# sourceMappingURL=ConfirmModal.d.ts.map