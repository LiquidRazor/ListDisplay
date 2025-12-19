import {ListFeatureWithUI} from "../contracts/listFeatureWithUI";
import {FeatureNode} from "./featureNode";

/**
 * Resolves and orders features based on their dependencies and order constraints using topological sorting.
 *
 * @remarks
 * This function implements Kahn's algorithm for topological sorting to determine the correct
 * initialization order for features in the list feature pipeline. It processes three types of
 * ordering constraints to build a directed acyclic graph (DAG) and then produces a linear
 * ordering that satisfies all constraints:
 *
 * 1. **Direct dependencies** (`dependsOn`): Features declare explicit dependencies that must be
 *    initialized before them. These form the base edges of the dependency graph.
 *
 * 2. **After constraints** (`order.after`): Features can request to be initialized after specific
 *    other features without declaring them as hard dependencies. This is useful for optional
 *    coordination between features.
 *
 * 3. **Before constraints** (`order.before`): Features can request to be initialized before
 *    specific other features, effectively adding themselves as dependencies to those targets.
 *    This provides inverse control over ordering.
 *
 * **Algorithm Overview:**
 *
 * The function operates in four phases:
 *
 * 1. **Graph Construction**: Creates a `FeatureNode` for each feature with its direct dependencies
 *    from the `dependsOn` property. This establishes the initial dependency graph structure.
 *
 * 2. **Constraint Application**: Processes `order.after` and `order.before` constraints by adding
 *    additional edges to the graph. Validates that all referenced features exist in the registry.
 *
 * 3. **Topological Sort**: Applies Kahn's algorithm to produce a linear ordering:
 *    - Identifies nodes with no dependencies (in-degree = 0) as ready for processing
 *    - Repeatedly selects ready nodes, adds them to the result, and removes them from the graph
 *    - Updates remaining nodes' in-degrees and identifies newly ready nodes
 *    - Continues until all nodes are processed or a cycle is detected
 *
 * 4. **Cycle Detection**: Verifies that all nodes were processed. Any remaining nodes indicate
 *    a dependency cycle, which is reported with a descriptive error message.
 *
 * **Guarantees:**
 *
 * - Features are initialized only after all their dependencies are ready
 * - All explicit order constraints (`before`/`after`) are respected in the final ordering
 * - Cyclic dependencies are detected and reported with clear error messages
 * - The algorithm runs in O(V + E) time where V is the number of features and E is the total
 *   number of dependency edges
 *
 * **Error Handling:**
 *
 * The function throws errors in two scenarios:
 * - When a feature references a non-existent target via `order.before` (configuration error)
 * - When a circular dependency is detected, making valid ordering impossible (constraint conflict)
 *
 * These errors are thrown during the resolution phase to fail fast and provide clear diagnostics
 * before feature initialization begins.
 *
 * @param features - Array of features to be ordered based on their dependencies and constraints.
 *                   Each feature must have a unique `id` property and may optionally declare
 *                   `dependsOn` dependencies and `order.after`/`order.before` constraints.
 *
 * @returns An ordered array of features where all dependencies are satisfied and order constraints
 *          are applied. Features appear in the array after all their dependencies and before any
 *          features that depend on them. The ordering is deterministic for a given input but may
 *          vary between equivalent valid orderings when multiple features have no mutual constraints.
 *
 * @throws {@link Error}
 * Thrown when a feature declares `order.before` targeting a feature that is not registered in
 * the input array. The error message includes the declaring feature's ID and the missing target ID.
 *
 * @throws {@link Error}
 * Thrown when a circular dependency is detected among features, preventing valid ordering.
 * The error message includes a chain of feature IDs involved in the cycle, formatted with arrow
 * separators (→) for easy identification.
 *
 * @example
 * ```typescript
 * const features = [
 *   { id: 'base', dependsOn: [] },
 *   { id: 'sorting', dependsOn: ['base'], order: { before: ['filtering'] } },
 *   { id: 'filtering', dependsOn: ['base'] },
 * ];
 * const ordered = resolveFeatureOrder(features);
 * // Result: [base, sorting, filtering]
 * ```
 *
 * @internal
 */
export function resolveFeatureOrder(
    features: ListFeatureWithUI<any, any, any, any>[]
): ListFeatureWithUI<any, any, any, any>[] {
  const nodes = new Map<string, FeatureNode>();

  for (const f of features) {
    nodes.set(f.id, {
      id: f.id,
      feature: f,
      deps: new Set(f.dependsOn ?? []),
    });
  }

  for (const f of features) {
    const node = nodes.get(f.id)!;
    const order = f.order;

    if (order?.after) {
      for (const dep of order.after) {
        node.deps.add(dep);
      }
    }

    if (order?.before) {
      for (const target of order.before) {
        const targetNode = nodes.get(target);
        if (!targetNode) {
          throw new Error(
              `Feature '${f.id}' declares order.before '${target}' which is not registered`
          );
        }
        targetNode.deps.add(f.id);
      }
    }
  }

  const result: ListFeatureWithUI<any, any>[] = [];
  const ready = [...nodes.values()].filter((n) => n.deps.size === 0);

  while (ready.length) {
    const node = ready.shift()!;
    result.push(node.feature);
    nodes.delete(node.id);

    for (const other of nodes.values()) {
      if (other.deps.delete(node.id) && other.deps.size === 0) {
        ready.push(other);
      }
    }
  }

  if (nodes.size > 0) {
    const cycle = [...nodes.keys()].join(" → ");
    throw new Error(`Feature dependency cycle detected: ${cycle}`);
  }

  return result;
}
