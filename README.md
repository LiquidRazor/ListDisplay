# @liquidrazor/list-display

**ListDisplay** is a highly modular, feature-driven React list engine designed for complex, data-heavy applications.

It is **not** a drop-in table component.  
It is a **composable list runtime** that you *configure*, *extend*, and *wire explicitly*.

If you are looking for something you can install and style in 5 minutes, this is **not** that library.

---

## What this library is

ListDisplay provides:

- A **stable list runtime** with a single source of truth
- A **pluggable feature system** (filtering, sorting, pagination, selection, actions, modals, etc.)
- A **slot-based UI architecture** where *all UI is optional*
- A **headless-first design** that does not assume styling, layout, or visual components

You decide:
- which features exist
- how they interact
- which UI components render them
- how state flows through your application

---

## What this library is NOT

ListDisplay is **not**:

- ❌ a styled table component  
- ❌ a Material / Ant / Bootstrap replacement  
- ❌ a low-config CRUD helper  
- ❌ beginner-friendly by default  

This library is aimed at **senior frontend engineers**, **design-system authors**, and **teams building reusable internal tooling**.

---

## Core concepts (important)

Before using this library, you should be comfortable with:

- React 18
- Controlled vs uncontrolled state
- Composition over configuration
- Headless component patterns
- Explicit wiring instead of “magic defaults”

If those terms feel vague or annoying, pause here.

---

## Architecture overview

At a high level:

- **ListDisplay** owns a runtime and context
- **Features** register themselves into the runtime
- **UI slots** consume runtime state and feature APIs
- **Re-renders happen only inside ListDisplay**, never in the parent

Everything is explicit.  
Nothing is enabled unless you wire it.

---

## Status & maturity

⚠️ **Important**

This library is currently:

- Actively evolving
- API-stable at the core level, but
- Still refining feature ergonomics and documentation

It is already used internally, but **you should expect to read the docs carefully** and understand the architecture before adopting it.

If you need something “safe and boring”, this may not be the right choice *yet*.

---

## Documentation

Full documentation (API reference + guides) is available here:

👉 **https://liquidrazor.github.io/ListDisplay/**

Start with:
- **Guide**: architectural concepts and feature wiring  
- **Reference**: generated API documentation  

Do not skip the guide.

---

## Installation

```bash
npm install @liquidrazor/list-display react react-dom
```

## Minimal example (intentional minimalism)

```tsx
import { ListDisplay, DefaultTable } from "@liquidrazor/list-display";

<ListDisplay
  idKey="id"
  dataSource={{
    meta: { kind: "static" },
    init: async () => ({ rows: [] }),
  }}
  fields={[
    { id: "id", label: "ID" },
  ]}
  components={{Table: DefaultTable}}
/>
```

### This renders nothing fancy by design.

From here, you explicitly add:

- features (filtering, sorting, pagination, actions, etc.)
- UI components for those features
- custom styling and layout

## Who should use this

You should consider ListDisplay if:
- You are building internal admin tools
- You need long-lived, extensible list views
- You want full control over behavior and UI
- You dislike “smart” components that hide logic

**You should not use it if:**
- You want instant visual results
- You don’t want to think about architecture
- You expect defaults to do everything


## Before you open an issue

Please make sure that:

- You have read the Guide section of the documentation
- You understand that features are opt-in
- You are not expecting default UI or styling
- Your question is not “how do I build a table UI?”

Good issues include:

- clear reproduction cases
- architectural questions
- feature extension discussions
- documentation gaps

**_Issues asking for “simpler defaults” or “automatic behavior” may be closed without discussion._**

## Final note

ListDisplay is opinionated about **control**, **clarity**, and **explicitness**.

It will reward careful configuration.
It will punish assumptions.

If that sounds appealing, welcome.
