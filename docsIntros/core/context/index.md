# Context

The context layer defines the **runtime contract** between ListDisplay,
features, and UI slots.

It exposes:
- current state (via refs)
- feature APIs
- runtime helpers
- metadata such as idKey and field definitions

All UI slots consume the same context instance.
State changes occur internally and do not trigger parent re-renders.

This layer should be considered read-only for UI code.
