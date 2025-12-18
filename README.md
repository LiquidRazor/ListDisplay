# @liquidrazor/list-display

ListDisplay is a React component and hook combo that delivers filtering, sorting, pagination, selection, and action handling out of the box while remaining slot-based and customizable.

- 🚀 **Headless-friendly**: bring your own styling and override any slot component.
- 🔄 **Data-source agnostic**: plug in REST, GraphQL, websockets, or static data through a simple adapter.
- 🧰 **Action-ready**: toolbar and row actions with optional confirmation/custom modals.

## Documentation

Full usage, configuration guidance, and examples live in [`docs/index.md`](docs/index.md).

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

## Development

Build the distributable bundle and type declarations:

```bash
npm run build
```

## Publishing

The package is configured for public publishing to the npm registry:

1. Bump the version in `package.json` following semantic versioning.
2. Ensure dependencies are installed and the tree is clean.
3. Run the publish workflow, which cleans and rebuilds the `dist` output automatically:

   ```bash
   npm publish --access public
   ```

The published package includes only the compiled `dist` artifacts along with type declarations and source maps for consumers.
