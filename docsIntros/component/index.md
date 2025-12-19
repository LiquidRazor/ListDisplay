# Component

This section documents the public **ListDisplay** component and its configuration.

The ListDisplay component is the runtime boundary:
- it owns state and feature execution
- it exposes context to UI slots
- it isolates re-renders from parent components

Most consumers only need this surface, combined with features and slots.

See:
- `ListDisplay`
- `ListDisplayProps`
