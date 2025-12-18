import React from "react";
import type { ModalOutletProps } from "../../types";
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
export declare const ListModalOutlet: React.FC<ModalOutletProps>;
export default ListModalOutlet;
//# sourceMappingURL=ListModalOutlet.d.ts.map