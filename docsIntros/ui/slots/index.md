# UI Slots

UI slots are pure render surfaces that consume ListContext.

Slots include:
- Table
- Toolbar
- FiltersPanel
- Pagination
- ModalOutlet
- Status states

Slots:
- receive no direct props from ListDisplay
- read everything from context
- may ignore features they don’t care about

Default implementations exist but are optional.
