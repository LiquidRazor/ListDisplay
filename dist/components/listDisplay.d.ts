import React from "react";
import type { ListConfig } from "../types";
/**
 * Props forwarded to {@link ListDisplay}. They mirror {@link ListConfig}
 * and therefore describe the full data, schema, and action configuration for
 * the list.
 */
export type ListDisplayProps = ListConfig<any, any>;
/**
 * High-level component that renders the entire ListDisplay experience using
 * the core hook for state management and a set of slot-based components for
 * the UI. Consumers can override any slot via the {@link ListConfig.components}
 * map while still benefiting from the built-in behaviours.
 */
export declare const ListDisplay: React.FC<ListDisplayProps>;
export default ListDisplay;
//# sourceMappingURL=listDisplay.d.ts.map