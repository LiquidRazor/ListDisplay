# ListDisplay

**ListDisplay** is a headless-first, feature-driven list rendering system for React.

It is designed to handle complex data presentation use cases such as filtering, sorting, pagination, selection, and actions — **without forcing UI, CSS, or layout decisions on the consumer**.

You bring:
- your data source
- your schema
- the features you want
- the UI you want

ListDisplay wires everything together and stays out of your way.

---

## Why ListDisplay exists

Most list/table components make the same assumptions:
- features are always enabled
- UI and logic are tightly coupled
- customization means fighting CSS
- “headless” stops being headless the moment things get complex

ListDisplay takes the opposite approach:

- **All features are opt-in**
- **All features are pluggable**
- **UI is entirely replaceable**
- **State and rendering are decoupled**
- **The parent component does not re-render**

You only pay for what you explicitly enable.

---

## Core principles

### Feature-first architecture
Filtering, sorting, pagination, selection, actions, modals, and custom behavior are implemented as **independent plugins**.

Nothing is active unless registered.

### Stable runtime, isolated re-renders
All state mutations and updates happen inside the ListDisplay runtime.
The parent component remains untouched by internal re-renders.

### Headless by default
ListDisplay ships with **abstract UI contracts**, not opinions.
Default UI implementations exist, but they are optional and replaceable.

### Explicit wiring
If a feature needs a handler or UI surface, it must be provided.
Missing wiring fails early and predictably.

---

## High-level architecture

At runtime, ListDisplay is composed of:

- **Core engine**  
  Manages state, feature lifecycle, and execution order

- **Feature registry**  
  Registers and resolves feature plugins

- **Feature context**  
  The single source of truth exposed to UI slots

- **UI slots**  
  Pure render surfaces that consume the context

---

## Who this is for

ListDisplay is built for:
- applications with non-trivial list behavior
- teams that care about long-term maintainability
- developers who want control instead of presets

It is not optimized for:
- drop-in tables with no customization
- “one prop does everything” components

---

## Where to go next

- 📘 **Guide** – how to use ListDisplay step by step
- 🧩 **Features** – filtering, sorting, pagination, selection, actions, modals
- 🧠 **Core API** – runtime, context, registry, store
- 🎨 **UI slots** – table, toolbar, pagination, modal outlet

