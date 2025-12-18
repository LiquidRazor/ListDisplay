/**
 * Main list display component module.
 *
 * @remarks
 * This module provides the primary {@link ListDisplay} component which renders
 * a complete data list experience with filtering, sorting, pagination, and
 * action support. It leverages a ListCore for state management and
 * exposes a slot-based architecture for customization.
 *
 * @packageDocumentation
 * @public
 */
import React from "react";
import type { ListConfig } from "../types";
/**
 * Props forwarded to {@link ListDisplay}. They mirror {@link ListConfig}
 * and therefore describe the full data, schema, and action configuration for
 * the list.
 *
 * @remarks
 * This type is a direct alias to {@link ListConfig} with generic parameters
 * set to `any`. It allows the list to work with any row type and row ID type.
 * Consumers should provide appropriate configuration including data source,
 * field schemas, actions, and optional component overrides.
 *
 * @public
 */
export type ListDisplayProps = ListConfig<any, any>;
/**
 * High-level component that renders the entire ListDisplay experience using
 * the core hook for state management and a set of slot-based components for
 * the UI. Consumers can override any slot via the {@link ListConfig.components}
 * map while still benefiting from the built-in behaviours.
 *
 * @remarks
 * This component orchestrates the complete list UI including:
 * - Toolbar with general actions
 * - Filters panel for data filtering
 * - Sort bar for column sorting
 * - Table with rows and row actions
 * - Pagination controls
 * - Modal outlet for action confirmations
 * - Loading, empty, and error states
 *
 * All sub-components can be replaced via the `components` prop while maintaining
 * full integration with the core state management layer.
 *
 * @param props - Configuration object containing data source, fields, actions, and UI customization options. See {@link ListDisplayProps}.
 * @returns A complete list UI with all interactive features enabled.
 *
 * @public
 */
export declare const ListDisplay: React.FC<ListDisplayProps>;
export default ListDisplay;
//# sourceMappingURL=listDisplay.d.ts.map