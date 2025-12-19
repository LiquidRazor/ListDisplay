# Store

The store layer manages internal state for ListDisplay and its features.

It includes:
- core list state (rows, status, pagination)
- feature-owned state slices
- immutable update patterns
- snapshot generation

The store is not exposed directly to consumers.
It exists to guarantee predictable updates and isolated re-renders.
It is designed to be a single source of truth for ListDisplay's internal state.
