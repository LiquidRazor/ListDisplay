# ListDisplay Documentation

A lightweight, headless-friendly React list UI that combines filtering, sorting, pagination, selection, and action handling into a single component. This guide explains the core concepts, configuration, and patterns for integrating `ListDisplay` into an application.

## Installation

The package is published as `@liquidrazor/list-display` and expects React 18 as a peer dependency.

```bash
npm install @liquidrazor/list-display react react-dom
# or
pnpm add @liquidrazor/list-display react react-dom
```

## Quick start

1. Prepare a data source (see [Data sources](#data-sources)).
2. Describe your columns with `FieldSchema` entries.
3. Declare any toolbar or row-level actions.
4. Render the `ListDisplay` component.
{% raw %}
```tsx
import { ListDisplay } from "@liquidrazor/list-display";
import type { DataSource, FieldSchema, GeneralAction } from "@liquidrazor/list-display";

type User = { id: string; name: string; email: string; status: "active" | "pending" };

const dataSource: DataSource<User> = {
  meta: { kind: "query", label: "Users API" },
  init: async () => {
    const response = await fetch("/api/users");
    const rows = await response.json();
    return { rows };
  },
};

const fields: FieldSchema<User>[] = [
  { id: "name", label: "Name", sortable: true },
  { id: "email", label: "Email", sortable: true },
  { id: "status", label: "Status", filter: { type: "select", options: [
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
  ]}},
];

const actions: GeneralAction<User>[] = [
  {
    id: "refresh",
    label: "Refresh",
    kind: "secondary",
    handler: async ({ refresh }) => {
      await refresh();
    },
  },
];
export const UsersPage = () => (
  <ListDisplay
    idKey="id"
    dataSource={dataSource}
    fields={fields}
    generalActions={actions}
    selectionMode="multiple"
    initialPagination={{ pageIndex: 0, pageSize: 20 }}
  />
);
```
{% endraw %}

## Component overview

`ListDisplay` renders a fully-wired list UI using the core hook `useListCore`. It exposes default slots (toolbar, filters, sort bar, table, pagination, modal outlet, and loading/empty/error states) that can be overridden via the `components` prop while still relying on the shared state and handlers provided by the hook.

### Props

`ListDisplay` accepts the `ListConfig` interface, covering the data source, field definitions, actions, initial UI state, and optional slot overrides. See the [Configuration](#configuration) section for details.

## Data sources

ListDisplay does not fetch data directly; instead it consumes a `DataSource` abstraction that normalizes your backend or static data into the list's lifecycle.

- **Init:** required `init()` method that returns the first batch of rows (and optionally total count/status).
- **Subscribe:** optional `subscribe(listener)` to push patches (append/update/remove) into the list, useful for websockets or long polls.
- **Refresh:** optional `refresh()` for parent-controlled re-fetch logic, invoked by actions.
- **Destroy:** optional `destroy()` for cleanup when the list unmounts or subscriptions change.

{% raw %}

```ts
import type { DataSource } from "@liquidrazor/list-display";

type Row = { id: number; title: string; status: string };

const streamSource: DataSource<Row> = {
  meta: { kind: "stream", label: "Live feed" },
  init: async () => ({ rows: [] }),
  subscribe: (listener) => {
    const socket = connectToSocket();
    socket.onMessage((patch) => listener(patch));
    return () => socket.close();
  },
  destroy: () => console.log("closed"),
};
```
{% endraw %}

## Configuration

The `ListConfig` contract is the single source of truth for a list instance:

- `dataSource`: a `DataSource` adapter that handles fetching and optional live updates.
- `fields`: array of `FieldSchema` column descriptors (id, label, sorting and filtering capabilities, and optional renderers).
- `idKey`: string key on each row used for selection and patch matching.
- `generalActions` / `rowActions`: toolbar- or row-level actions, optionally paired with modals.
- `initialFilters`, `initialSort`, `initialPagination`: seed values for user-visible state.
- `selectionMode`: `"none" | "single" | "multiple"` depending on whether rows can be selected.
- `components`: optional slot overrides for the toolbar, filters, sort bar, table, pagination, modal outlet, and state placeholders.
- `componentsProps`: optional props forwarded to each slot component.

Example configuration with custom renderers and filters:

{% raw %}
```tsx
const fields: FieldSchema<User>[] = [
  {
    id: "name",
    label: "Name",
    sortable: true,
    cellRenderer: (row, value) => <strong>{value}</strong>,
  },
  {
    id: "status",
    label: "Status",
    filter: {
      type: "select",
      normalize: (value: User["status"]) => value,
      options: [
        { value: "active", label: "Active" },
        { value: "pending", label: "Pending" },
      ],
    },
  },
];
```
{% endraw %}

## Actions and modals

Actions let users trigger mutations or workflows from the toolbar or per-row menus. Define `GeneralAction` and `RowAction` entries with ids, labels, optional icons/kinds, and handlers. Mark `opensModal` and include a `modal` config when an action should require confirmation or custom input.

{% raw %}
```tsx
const actions: GeneralAction<User>[] = [
  {
    id: "bulk-delete",
    label: "Delete",
    kind: "danger",
    opensModal: true,
    modal: { type: "confirm", title: "Delete selected users?" },
    requiresSelection: true,
    handler: async ({ selection, updateRows }) => {
      const selected = new Set(selection.selectedIds);
      updateRows((rows) => rows.filter((row) => !selected.has(row.id)));
    },
  },
];
```
{% endraw %}

Row actions work the same way but receive the target row and index in the handler context.

## Selection

Enable row selection with `selectionMode`. Use `multiple` for bulk workflows; selection state is included in action contexts and in the exported snapshot for external consumers.

## Sorting, filtering, and pagination

- Toggle sorting by clicking headers; `ListDisplay` flips between ascending/descending when re-clicking the same field.
- Define filters per field; the list applies them before sorting and pagination.
- Pagination is derived automatically from `pageIndex` and `pageSize`, with helper handlers wired into the default pagination component.

## Exporting and refreshing state

`ListDisplay` builds snapshots of the current list state (raw rows, visible rows, filters, sort, pagination, selection). You can call the `exportState` method returned from `useListCore` inside action handlers to hand data to reporting, exports, or external caches. The `refresh` helper re-runs the data source `init()` method.

## Slot customization

Pass a `components` map to swap any UI piece while keeping core behaviors:

{% raw %}

```tsx
import { ListDisplay, ListToolbar } from "@liquidrazor/list-display";
import { CustomTable } from "./CustomTable";

<ListDisplay
  /* ...config */
  components={{
    Toolbar: (props) => (
      <ListToolbar {...props} title="Users" />
    ),
    Table: CustomTable,
  }}
  componentsProps={{
    Table: { stickyHeader: true },
  }}
/>
```
{% endraw %}

Slots receive the same state and callbacks used by the defaults, so replacements remain interoperable with filtering, sorting, pagination, selection, and actions.

## TypeScript helpers

The exported types help ensure configuration correctness:

- `FieldSchema`: column metadata with optional renderer/style hooks.
- `DataSource`, `DataPatch`, `DataSourceInitResult`: describe data flow into the list.
- `GeneralAction` / `RowAction`: action entries and their handler contexts.
- `ActiveFilterState`, `SortDescriptor`, `PaginationState`, `SelectionState`: reusable state models.
- `ListSnapshot`: shape returned by `exportState()` for downstream consumers.

## Full API documentation

you can always dig into the full api documentation [here](./api/)

## Troubleshooting

- Make sure `idKey` matches a stable unique value on each row; patches and selection rely on it.
- If a stream subscription updates rows but the UI does not change, confirm that the emitted patch matches one of the supported patch shapes (`replaceAll`, `append`, `update`, `remove`).
- Wrap async action handlers with error handling/logging appropriate to your app to avoid silent failures.
