/**
 * List modal outlet component module.
 *
 * @remarks
 * This module contains the ListModalOutlet component which provides default modal rendering
 * functionality for list actions. It supports confirm modals out of the box and provides
 * fallback handling for custom modals that require consumer implementation.
 *
 * @packageDocumentation
 * @public
 */
import React from "react";
import type { ModalOutletProps } from "../../types";
/**
 * Default modal outlet component for rendering action-triggered modals.
 *
 * @remarks
 * This component provides default modal rendering functionality for list actions.
 * It supports:
 * - Confirm modals (ModalConfig.type === "confirm") with customizable titles, descriptions, and button labels
 * - Fallback handling for missing action configurations
 * - Custom modal placeholders with instructions for consumer implementation
 *
 * For custom modals (ModalConfig.type === "custom"), consumers are expected to override
 * this component via the "ModalOutlet" slot in the list configuration and handle rendering themselves.
 *
 * @param props - The component props containing state, actions, and callbacks {@link ModalOutletProps}
 * @returns A modal component based on the active action configuration, or null if no modal is open
 *
 * @public
 */
export declare const ListModalOutlet: React.FC<ModalOutletProps>;
export default ListModalOutlet;
//# sourceMappingURL=ListModalOutlet.d.ts.map