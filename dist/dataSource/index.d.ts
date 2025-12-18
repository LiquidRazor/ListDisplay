/**
 * Data source utilities for the list-display component.
 *
 * This module provides factory functions to create different types of data sources:
 * - Static sources for pre-loaded data arrays
 * - Query sources for paginated/filtered server requests
 * - Stream sources for real-time data updates
 * - Patches for incremental data modifications
 *
 * @packageDocumentation
 * @public
 */
/**
 * Factory function for creating query-based data sources.
 * @public
 */
export * from './createQuerySource';
/**
 * Factory function for creating static data sources from arrays.
 * @public
 */
export * from './createStaticSource';
/**
 * Factory function for creating stream-based data sources.
 * @public
 */
export * from './createStreamSource';
/**
 * Utilities for applying incremental patches to data sources.
 * @internal
 */
export * from './patches';
//# sourceMappingURL=index.d.ts.map