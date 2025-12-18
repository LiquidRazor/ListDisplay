# @liquidrazor/list-display

ListDisplay is a React component and hook combo that delivers filtering, sorting, pagination, selection, and action handling out of the box while remaining slot-based and customizable.

- 🚀 **Headless-friendly**: bring your own styling and override any slot component.
- 🔄 **Data-source agnostic**: plug in REST, GraphQL, websockets, or pretty much any type of data through a simple adapter.
- 🧰 **Action-ready**: toolbar and row actions with optional confirmation/custom modals.

## Documentation

Quick guide available [here](docs/index.md)

Full API docs are available [here](docs/api/list-display.md)

## Getting started

Install the package alongside React 18:

```bash
npm install @liquidrazor/list-display react react-dom
```

Render your first list:

```tsx
import { ListDisplay } from "@liquidrazor/list-display";

<ListDisplay
  idKey="id"
  dataSource={{ meta: { kind: "static" }, init: async () => ({ rows: [] }) }}
  fields={[{ id: "id", label: "ID" }]}
/>
```

For advanced patterns (filters, actions, custom slots, streaming updates), see the [documentation](docs/index.md).

The published package includes only the compiled `dist` artifacts along with type declarations and source maps for consumers.
