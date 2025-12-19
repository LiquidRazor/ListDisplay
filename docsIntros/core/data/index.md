# Data

The data layer defines how ListDisplay interacts with data sources.

It supports:
- static data
- query-based loading
- streaming / patch-based updates

This includes:
- data source contracts
- patch application
- refresh semantics
- lifecycle hooks

Features and UI slots do not directly manipulate data sources.
All interaction goes through the runtime.
