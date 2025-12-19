# Guide

This guide explains how to use ListDisplay in real applications.

It focuses on **concepts and wiring**, not API exhaustiveness.
For detailed type definitions, see the API Reference.

---

## Mental model

Think of ListDisplay as three layers:

1. **Data**
2. **Features**
3. **UI**

Each layer is independent.

You decide:
- which data source to use
- which features to enable
- which UI components to render

---

## Minimal usage

At its simplest, ListDisplay needs:

- a data source
- a field schema
- a table UI slot

Everything else is optional.

Features such as filtering, sorting, or pagination **do nothing unless registered**.

---

## Enabling features

Features are registered explicitly via the feature registry.

Each feature may contribute:
- state
- handlers
- context helpers
- UI contracts

If a feature exposes UI, you must also provide the corresponding slot component.

There is no hidden wiring.

---

## UI slots

ListDisplay renders nothing by default.

Instead, it exposes **slots**:
- Table
- Toolbar
- FiltersPanel
- Pagination
- ModalOutlet
- Status states

Each slot:
- receives the same ListContext
- can be fully replaced
- can ignore features it doesn’t care about

You can mix default slots with custom ones.

---

## Re-renders and performance

All state updates occur inside the ListDisplay runtime.

- Parent components do **not** re-render
- Slot components re-render only when the runtime updates
- Feature state updates are isolated

This makes ListDisplay safe to use in complex, high-frequency update scenarios.

---

## Modals and actions

Row actions and general actions may optionally trigger modal flows.

Modal handling is implemented as a feature and exposed through the ModalOutlet slot.

This allows:
- custom confirmation dialogs
- custom modal rendering
- async flows without leaking state upward

---

## Styling

ListDisplay does not ship with CSS.

Default UI components expose className hooks and structure only.

You are expected to:
- style via your own CSS
- or replace default components entirely

This is intentional.

---

## Next steps

- Explore individual features in the **Features** section
- Review slot contracts in the **UI** section
- Dive into internals via the **Core API** if needed

