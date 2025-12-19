import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useMemo, useState, useCallback, useEffect } from 'react';

// src/components/layout/ListCell.tsx
var ListCell = ({
  row,
  rowIndex,
  field,
  isSelected
}) => {
  const value = row[field.id];
  const style = field.cellStyle ? field.cellStyle(row, value) : void 0;
  let content = value;
  if (field.cellRenderer) {
    content = field.cellRenderer(row, value, {
      rowIndex,
      isSelected
    });
  }
  return /* @__PURE__ */ jsx(
    "td",
    {
      className: `ld-list__cell ld-list__cell--${String(field.id)}`,
      style,
      children: content
    }
  );
};
var isSelectedRow = (row, selection, idKey) => {
  const id = row[idKey];
  return selection.selectedIds.includes(id);
};
var ListRow = ({
  row,
  rowIndex,
  fields,
  state,
  idKey,
  rowActions,
  onRowActionClick
}) => {
  const selected = isSelectedRow(row, state.selection, idKey);
  return /* @__PURE__ */ jsxs(
    "tr",
    {
      className: selected ? "ld-list__row ld-list__row--selected" : "ld-list__row",
      children: [
        fields.map((field) => /* @__PURE__ */ jsx(
          ListCell,
          {
            row,
            rowIndex,
            field,
            isSelected: selected
          },
          String(field.id)
        )),
        rowActions && rowActions.length > 0 && /* @__PURE__ */ jsx("td", { className: "ld-list__cell ld-list__cell--actions", children: /* @__PURE__ */ jsx("div", { className: "ld-list__row-actions", children: rowActions.map((action) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: `ld-list__row-action ld-list__row-action--${action.kind ?? "default"}`,
            onClick: () => onRowActionClick?.(action.id, rowIndex),
            children: [
              action.icon && /* @__PURE__ */ jsx("span", { className: "ld-list__row-action-icon", children: action.icon }),
              /* @__PURE__ */ jsx("span", { className: "ld-list__row-action-label", children: action.label })
            ]
          },
          action.id
        )) }) })
      ]
    }
  );
};
var ListBody = ({
  state,
  fields,
  idKey,
  rowActions,
  onRowActionClick
}) => {
  if (!state.rows || state.rows.length === 0) {
    return /* @__PURE__ */ jsx("tbody", { className: "ld-list__body ld-list__body--empty", children: /* @__PURE__ */ jsx("tr", { className: "ld-list__row ld-list__row--empty", children: /* @__PURE__ */ jsx(
      "td",
      {
        className: "ld-list__cell ld-list__cell--empty",
        colSpan: fields.length + (rowActions && rowActions.length > 0 ? 1 : 0)
      }
    ) }) });
  }
  return /* @__PURE__ */ jsx("tbody", { className: "ld-list__body", children: state.rows.map((row, index) => /* @__PURE__ */ jsx(
    ListRow,
    {
      row,
      rowIndex: index,
      fields,
      state,
      idKey,
      rowActions,
      onRowActionClick
    },
    String(row[idKey])
  )) });
};
var ListContainer = ({
  className,
  children
}) => {
  return /* @__PURE__ */ jsx("div", { className: className ?? "ld-list", children });
};
var ListFiltersPanel = ({
  state,
  fields,
  onChangeFilters
}) => {
  if (!onChangeFilters || fields.length === 0) {
    return null;
  }
  const handleReset = () => {
    onChangeFilters({});
  };
  return /* @__PURE__ */ jsxs("div", { className: "ld-list__filters", children: [
    /* @__PURE__ */ jsxs("div", { className: "ld-list__filters-header", children: [
      /* @__PURE__ */ jsx("span", { className: "ld-list__filters-title", children: "Filters" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "ld-list__filters-reset",
          onClick: handleReset,
          disabled: state.status === "loading",
          children: "Reset"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "ld-list__filters-content", children: /* @__PURE__ */ jsx("span", { className: "ld-list__filters-placeholder", children: "Filter UI not configured. Provide a custom FiltersPanel via slots." }) })
  ] });
};
var ListHeader = ({
  fields,
  hasRowActions
}) => {
  return /* @__PURE__ */ jsx("thead", { className: "ld-list__head", children: /* @__PURE__ */ jsxs("tr", { className: "ld-list__head-row", children: [
    fields.map((field) => /* @__PURE__ */ jsx(
      "th",
      {
        className: `ld-list__head-cell ld-list__head-cell--${field.id}`,
        style: field.headerStyle,
        children: field.label
      },
      field.id
    )),
    hasRowActions && /* @__PURE__ */ jsx("th", { className: "ld-list__head-cell ld-list__head-cell--actions" })
  ] }) });
};
var ListPagination = ({
  state,
  onChangePage,
  onChangePageSize
}) => {
  const { pagination } = state;
  const {
    pageIndex,
    pageSize,
    totalItems = 0,
    totalPages = 1
  } = pagination;
  const canPrev = pageIndex > 0;
  const canNext = pageIndex < totalPages - 1;
  const handlePrev = () => {
    if (!canPrev || !onChangePage) return;
    onChangePage(pageIndex - 1);
  };
  const handleNext = () => {
    if (!canNext || !onChangePage) return;
    onChangePage(pageIndex + 1);
  };
  const handlePageSizeChange = (event) => {
    const value = Number(event.target.value);
    if (!Number.isFinite(value) || value <= 0) return;
    onChangePageSize?.(value);
  };
  return /* @__PURE__ */ jsxs("div", { className: "ld-list__pagination", children: [
    /* @__PURE__ */ jsxs("div", { className: "ld-list__pagination-info", children: [
      /* @__PURE__ */ jsxs("span", { children: [
        "Page ",
        pageIndex + 1,
        " of ",
        totalPages
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "ld-list__pagination-total", children: [
        totalItems,
        " items"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "ld-list__pagination-controls", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "ld-list__pagination-button",
          onClick: handlePrev,
          disabled: !canPrev,
          children: "Prev"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "ld-list__pagination-button",
          onClick: handleNext,
          disabled: !canNext,
          children: "Next"
        }
      ),
      /* @__PURE__ */ jsxs("label", { className: "ld-list__pagination-pagesize", children: [
        /* @__PURE__ */ jsx("span", { children: "Rows per page" }),
        /* @__PURE__ */ jsx(
          "select",
          {
            className: "ld-list__pagination-pagesize-select",
            value: pageSize,
            onChange: handlePageSizeChange,
            children: [10, 25, 50, 100].map((size) => /* @__PURE__ */ jsx("option", { value: size, children: size }, size))
          }
        )
      ] })
    ] })
  ] });
};
var ListSortBar = ({
  state,
  fields,
  onChangeSort
}) => {
  if (!onChangeSort) {
    return null;
  }
  const sortableFields = fields.filter((f) => f.sortable);
  if (sortableFields.length === 0) {
    return null;
  }
  const currentFieldId = state.sort?.field ?? "";
  const currentDirection = state.sort?.direction ?? "asc";
  const handleFieldChange = (event) => {
    const fieldId = event.target.value;
    if (!fieldId) {
      onChangeSort("");
      return;
    }
    onChangeSort(fieldId);
  };
  const handleDirectionToggle = () => {
    if (!state.sort) {
      return;
    }
    onChangeSort(state.sort.field);
  };
  return /* @__PURE__ */ jsxs("div", { className: "ld-list__sortbar", children: [
    /* @__PURE__ */ jsxs("label", { className: "ld-list__sortbar-field", children: [
      /* @__PURE__ */ jsx("span", { className: "ld-list__sortbar-label", children: "Sort by" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          className: "ld-list__sortbar-select",
          value: currentFieldId,
          onChange: handleFieldChange,
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "None" }),
            sortableFields.map((field) => /* @__PURE__ */ jsx("option", { value: String(field.id), children: field.label }, String(field.id)))
          ]
        }
      )
    ] }),
    currentFieldId && /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: `ld-list__sortbar-direction ld-list__sortbar-direction--${currentDirection}`,
        onClick: handleDirectionToggle,
        children: currentDirection === "asc" ? "\u2191" : "\u2193"
      }
    )
  ] });
};
var ListTable = ({
  state,
  fields,
  idKey,
  rowActions,
  onRowActionClick
}) => {
  const hasRowActions = Boolean(rowActions && rowActions.length > 0);
  return /* @__PURE__ */ jsx("div", { className: "ld-list__table-wrapper", children: /* @__PURE__ */ jsxs("table", { className: "ld-list__table", children: [
    /* @__PURE__ */ jsx(ListHeader, { fields, hasRowActions }),
    /* @__PURE__ */ jsx(
      ListBody,
      {
        state,
        fields,
        idKey,
        rowActions,
        onRowActionClick
      }
    )
  ] }) });
};
var ListToolbar = ({
  state,
  generalActions,
  onActionClick
}) => {
  if (!generalActions || generalActions.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsx("div", { className: "ld-list__toolbar", children: generalActions.map((action) => /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      className: `ld-list__toolbar-button ld-list__toolbar-button--${action.kind ?? "default"}`,
      onClick: () => onActionClick?.(action.id),
      disabled: state.status === "loading" || state.status === "streaming",
      children: [
        action.icon && /* @__PURE__ */ jsx("span", { className: "ld-list__toolbar-button-icon", children: action.icon }),
        /* @__PURE__ */ jsx("span", { className: "ld-list__toolbar-button-label", children: action.label })
      ]
    },
    action.id
  )) });
};
var ConfirmModal = ({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel
}) => {
  const handleConfirm = () => {
    onConfirm();
  };
  const handleCancel = () => {
    onCancel();
  };
  return /* @__PURE__ */ jsx("div", { className: "ld-modal ld-modal--backdrop", children: /* @__PURE__ */ jsxs("div", { className: "ld-modal__dialog ld-modal__dialog--confirm", children: [
    /* @__PURE__ */ jsx("div", { className: "ld-modal__header", children: /* @__PURE__ */ jsx("h2", { className: "ld-modal__title", children: title }) }),
    description && /* @__PURE__ */ jsx("div", { className: "ld-modal__body", children: typeof description === "string" ? /* @__PURE__ */ jsx("p", { children: description }) : description }),
    /* @__PURE__ */ jsxs("div", { className: "ld-modal__footer", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "ld-modal__button ld-modal__button--cancel",
          onClick: handleCancel,
          children: cancelLabel
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "ld-modal__button ld-modal__button--confirm",
          onClick: handleConfirm,
          children: confirmLabel
        }
      )
    ] })
  ] }) });
};
var ListModalOutlet = ({
  state,
  generalActions,
  rowActions,
  onConfirm,
  onCancel
}) => {
  const { ui } = state;
  const { modal, activeAction } = ui;
  if (!modal || !modal.isOpen || !modal.actionId) {
    return null;
  }
  const actionType = activeAction?.type ?? (modal.rowId != null ? "row" : "general");
  const { action, modalConfig } = useMemo(() => {
    let act;
    let config;
    if (actionType === "general") {
      act = (generalActions ?? []).find((a) => a.id === modal.actionId);
    } else if (actionType === "row") {
      act = (rowActions ?? []).find((a) => a.id === modal.actionId);
    }
    if (act && act.modal) {
      config = act.modal;
    }
    return { action: act, modalConfig: config };
  }, [actionType, modal.actionId, generalActions, rowActions]);
  if (!action || !modalConfig) {
    return /* @__PURE__ */ jsx(
      ConfirmModal,
      {
        title: "Confirm action",
        description: /* @__PURE__ */ jsx("span", { children: "Are you sure you want to execute this action?" }),
        onConfirm: () => onConfirm(),
        onCancel
      }
    );
  }
  if (modalConfig.type === "confirm") {
    return /* @__PURE__ */ jsx(
      ConfirmModal,
      {
        title: modalConfig.title,
        description: modalConfig.description,
        confirmLabel: modalConfig.confirmLabel,
        cancelLabel: modalConfig.cancelLabel,
        onConfirm: () => onConfirm(),
        onCancel
      }
    );
  }
  if (modalConfig.type === "custom") {
    return /* @__PURE__ */ jsx("div", { className: "ld-modal ld-modal--backdrop", children: /* @__PURE__ */ jsxs("div", { className: "ld-modal__dialog ld-modal__dialog--custom-unsupported", children: [
      /* @__PURE__ */ jsx("div", { className: "ld-modal__header", children: /* @__PURE__ */ jsx("h2", { className: "ld-modal__title", children: "Custom modal not handled by default ModalOutlet" }) }),
      /* @__PURE__ */ jsx("div", { className: "ld-modal__body", children: /* @__PURE__ */ jsxs("p", { children: [
        "The current action uses a custom modal configuration. Provide a custom ",
        /* @__PURE__ */ jsx("code", { children: "ModalOutlet" }),
        " component via the list's ",
        /* @__PURE__ */ jsx("code", { children: "components" }),
        " configuration to render it."
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "ld-modal__footer", children: /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "ld-modal__button ld-modal__button--cancel",
          onClick: onCancel,
          children: "Close"
        }
      ) })
    ] }) });
  }
  return null;
};
var ListEmptyState = ({ message }) => {
  return /* @__PURE__ */ jsx("div", { className: "ld-list-state ld-list-state--empty", children: /* @__PURE__ */ jsx("p", { className: "ld-list-state__message", children: message ?? "No data to display." }) });
};
var ListErrorState = ({ message }) => {
  return /* @__PURE__ */ jsx("div", { className: "ld-list-state ld-list-state--error", children: /* @__PURE__ */ jsx("p", { className: "ld-list-state__message", children: message ?? "An error occurred while loading the data." }) });
};
var ListLoadingState = ({ message }) => {
  return /* @__PURE__ */ jsxs("div", { className: "ld-list-state ld-list-state--loading", children: [
    /* @__PURE__ */ jsx("div", { className: "ld-list-state__spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ jsx("p", { className: "ld-list-state__message", children: message ?? "Loading data..." })
  ] });
};

// src/core/filters.ts
var resolveFilterValue = (rawValue, defaultType) => {
  if (rawValue == null) {
    return null;
  }
  if (typeof rawValue === "object") {
    const obj = rawValue;
    if (obj.operator && "value" in obj) {
      return {
        operator: obj.operator,
        value: obj.value
      };
    }
    if ("from" in obj || "to" in obj) {
      return {
        operator: "between",
        value: obj.from,
        valueTo: obj.to
      };
    }
  }
  switch (defaultType) {
    case "text":
      return { operator: "contains", value: rawValue };
    case "number":
    case "date":
      return { operator: "equals", value: rawValue };
    case "boolean":
      return { operator: "equals", value: rawValue };
    default:
      return { operator: "equals", value: rawValue };
  }
};
var getFieldFilterConfig = (field) => {
  return field.filter;
};
var buildResolvedFilters = (filters, fields) => {
  const resolved = [];
  for (const [fieldId, rawValue] of Object.entries(filters)) {
    const field = fields.find((f) => f.id === fieldId);
    if (!field || rawValue == null) continue;
    const filterConfig = getFieldFilterConfig(field);
    const type = filterConfig?.type ?? "text";
    const resolvedValue = resolveFilterValue(rawValue, type);
    if (!resolvedValue) continue;
    resolved.push({
      fieldId,
      type,
      operator: resolvedValue.operator,
      value: resolvedValue.value,
      valueTo: resolvedValue.valueTo,
      config: filterConfig
    });
  }
  return resolved;
};
var normalizeValue = (value, row, config) => {
  if (config?.normalize) {
    return config.normalize(value, row);
  }
  return value;
};
var toComparable = (value) => {
  if (value instanceof Date) {
    return value.getTime();
  }
  return value;
};
var applyOperator = (operator, normalizedValue, filterValue, filterValueTo) => {
  const v = toComparable(normalizedValue);
  const fv = toComparable(filterValue);
  const fv2 = toComparable(filterValueTo);
  switch (operator) {
    case "equals":
      return v === fv;
    case "notEquals":
      return v !== fv;
    case "contains":
      return typeof v === "string" && typeof fv === "string" && v.toLowerCase().includes(fv.toLowerCase());
    case "startsWith":
      return typeof v === "string" && typeof fv === "string" && v.toLowerCase().startsWith(fv.toLowerCase());
    case "endsWith":
      return typeof v === "string" && typeof fv === "string" && v.toLowerCase().endsWith(fv.toLowerCase());
    case "in":
      return Array.isArray(filterValue) && filterValue.includes(v);
    case "gt":
      return v > fv;
    case "gte":
      return v >= fv;
    case "lt":
      return v < fv;
    case "lte":
      return v <= fv;
    case "between":
      if (fv == null || fv2 == null) return false;
      return v >= fv && v <= fv2;
    default:
      return true;
  }
};
var buildFilterPredicate = (ctx) => {
  const { filters, fields } = ctx;
  const resolved = buildResolvedFilters(filters, fields);
  if (resolved.length === 0) {
    return () => true;
  }
  return (row) => {
    for (const filter of resolved) {
      const field = fields.find((f) => f.id === filter.fieldId);
      if (!field) continue;
      const value = row[field.id];
      const normalized = normalizeValue(value, row, filter.config);
      const ok = applyOperator(
        filter.operator,
        normalized,
        filter.value,
        filter.valueTo
      );
      if (!ok) return false;
    }
    return true;
  };
};
var applyFilters = (rows, ctx) => {
  const predicate = buildFilterPredicate(ctx);
  return rows.filter(predicate);
};

// src/core/pagination.ts
var updatePaginationMeta = (pagination, totalItems) => {
  const pageSize = pagination.pageSize > 0 ? pagination.pageSize : 10;
  const totalPages = totalItems === 0 ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));
  let pageIndex = pagination.pageIndex;
  if (pageIndex < 0) pageIndex = 0;
  if (pageIndex >= totalPages) pageIndex = totalPages - 1;
  return {
    ...pagination,
    pageIndex,
    totalItems,
    totalPages
  };
};
var applyPagination = (rows, pagination) => {
  const { pageIndex, pageSize } = pagination;
  if (pageSize <= 0) {
    return rows;
  }
  const start = pageIndex * pageSize;
  const end = start + pageSize;
  return rows.slice(start, end);
};

// src/core/selection.ts
var createSelectionState = (mode = "none") => ({
  mode,
  selectedIds: []
});
var isRowSelected = (row, selection, ctx) => {
  const id = row[ctx.idKey];
  return selection.selectedIds.includes(id);
};
var toggleRowSelection = (row, selection, ctx) => {
  const { mode } = ctx;
  const id = row[ctx.idKey];
  if (mode === "none") {
    return selection;
  }
  if (mode === "single") {
    const isSelected = selection.selectedIds.includes(id);
    return {
      ...selection,
      selectedIds: isSelected ? [] : [id]
    };
  }
  const exists = selection.selectedIds.includes(id);
  if (exists) {
    return {
      ...selection,
      selectedIds: selection.selectedIds.filter((x) => x !== id)
    };
  }
  return {
    ...selection,
    selectedIds: [...selection.selectedIds, id]
  };
};
var clearSelection = (selection) => ({
  ...selection,
  selectedIds: []
});
var selectAllVisible = (visibleRows, selection, ctx) => {
  if (ctx.mode === "none") {
    return selection;
  }
  const newIds = visibleRows.map(
    (row) => row[ctx.idKey]
  );
  if (ctx.mode === "single") {
    return {
      ...selection,
      selectedIds: newIds.length > 0 ? [newIds[0]] : []
    };
  }
  return {
    ...selection,
    selectedIds: newIds
  };
};

// src/core/snapshots.ts
var buildSnapshot = (state) => {
  return {
    rowsAll: [...state.rawRows],
    rowsVisible: [...state.rows],
    filters: { ...state.filters },
    sort: state.sort ? { ...state.sort } : void 0,
    pagination: { ...state.pagination },
    selection: {
      mode: state.selection.mode,
      selectedIds: [...state.selection.selectedIds]
    }
  };
};

// src/core/sorting.ts
var compareValues = (a, b) => {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }
  const sa = String(a).toLowerCase();
  const sb = String(b).toLowerCase();
  if (sa < sb) return -1;
  if (sa > sb) return 1;
  return 0;
};
var applySorting = (rows, ctx) => {
  const { sort } = ctx;
  if (!sort) {
    return rows;
  }
  const { field, direction } = sort;
  return [...rows].sort((a, b) => {
    const va = a[field];
    const vb = b[field];
    const cmp = compareValues(va, vb);
    return direction === "asc" ? cmp : -cmp;
  });
};

// src/core/uiState.ts
var createInitialUiState = () => ({
  activeAction: void 0,
  modal: {
    isOpen: false
  }
});
var openModalForAction = (prev, actionId, type, rowId) => ({
  ...prev,
  activeAction: {
    type,
    actionId,
    rowId
  },
  modal: {
    isOpen: true,
    actionId,
    rowId
  }
});
var closeModal = (prev) => ({
  ...prev,
  modal: {
    isOpen: false
  }
});
var clearActiveAction = (prev) => ({
  ...prev,
  activeAction: void 0
});

// src/dataSource/createQuerySource.ts
var createQuerySource = (options) => {
  const { load, label } = options;
  const init = async () => {
    const result = await Promise.resolve(load());
    return {
      rows: [...result.rows],
      totalCount: result.totalCount
    };
  };
  const refresh = async () => {
    await load();
  };
  return {
    meta: {
      kind: "query",
      label: label ?? "query"
    },
    init,
    refresh
  };
};

// src/dataSource/createStaticSource.ts
var createStaticSource = (options = {}) => {
  const { initialRows = [], getRows } = options;
  const init = async () => {
    const rows = getRows ? getRows() : initialRows;
    return {
      rows: [...rows]
    };
  };
  return {
    meta: {
      kind: "static",
      label: "static"
    },
    init
  };
};

// src/dataSource/createStreamSource.ts
var createStreamSource = (options) => {
  const { bootstrap, subscribe, refresh, destroy, label } = options;
  const init = async () => {
    if (!bootstrap) {
      return { rows: [] };
    }
    const result = await Promise.resolve(bootstrap());
    return {
      rows: result.initialRows ? [...result.initialRows] : [],
      totalCount: result.totalCount
    };
  };
  let unsubscribe;
  return {
    meta: {
      kind: "stream",
      label: label ?? "stream"
    },
    init,
    subscribe: (listener) => {
      const maybeUnsub = subscribe(listener);
      if (typeof maybeUnsub === "function") {
        unsubscribe = maybeUnsub;
      }
      return () => {
        if (unsubscribe) {
          unsubscribe();
          unsubscribe = void 0;
        }
      };
    },
    refresh,
    destroy: () => {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = void 0;
      }
      destroy?.();
    }
  };
};

// src/dataSource/patches.ts
var getRowId = (row, idKey) => {
  return row[idKey];
};
var applyPatch = (rows, patch, idKey) => {
  switch (patch.type) {
    case "replaceAll":
      return [...patch.rows];
    case "append":
      return [...rows, patch.row];
    case "update": {
      const targetId = getRowId(patch.row, idKey);
      let changed = false;
      const next = rows.map((row) => {
        const rowId = getRowId(row, idKey);
        if (rowId === targetId) {
          changed = true;
          return patch.row;
        }
        return row;
      });
      return changed ? next : next;
    }
    case "remove": {
      let changed = false;
      const next = rows.filter((row) => {
        const rowId = getRowId(row, idKey);
        if (rowId === patch.id) {
          changed = true;
          return false;
        }
        return true;
      });
      return changed ? next : next;
    }
    default:
      return rows;
  }
};
var applyPatches = (rows, patches, idKey) => {
  return patches.reduce(
    (current, patch) => applyPatch(current, patch, idKey),
    rows
  );
};

// src/core/useListCore.ts
var DEFAULT_PAGE_SIZE = 25;
var initSelection = (mode) => createSelectionState(mode ?? "none");
var recomputeDerived = (prevState, fields, rawRowsOverride) => {
  const rawRows = rawRowsOverride ?? prevState.rawRows;
  const filtered = applyFilters(rawRows, {
    filters: prevState.filters,
    fields
  });
  const sorted = applySorting(filtered, {
    sort: prevState.sort});
  const nextPagination = updatePaginationMeta(
    prevState.pagination,
    sorted.length
  );
  const paged = applyPagination(sorted, nextPagination);
  return {
    ...prevState,
    rawRows,
    rows: paged,
    pagination: nextPagination
  };
};
var useListCore = (config) => {
  const {
    dataSource,
    fields,
    idKey,
    generalActions,
    rowActions,
    initialFilters,
    initialPagination,
    initialSort,
    selectionMode
  } = config;
  const [state, setState] = useState(() => ({
    rawRows: [],
    rows: [],
    filters: initialFilters ?? {},
    sort: initialSort,
    pagination: {
      pageIndex: initialPagination?.pageIndex ?? 0,
      pageSize: initialPagination?.pageSize ?? DEFAULT_PAGE_SIZE,
      totalItems: initialPagination?.totalItems,
      totalPages: initialPagination?.totalPages
    },
    selection: initSelection(selectionMode),
    status: "idle",
    error: void 0,
    ui: createInitialUiState()
  }));
  const loadInitial = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      status: "loading",
      error: void 0
    }));
    try {
      const result = await dataSource.init();
      setState(
        (prev) => recomputeDerived(
          {
            ...prev,
            rawRows: result.rows ?? [],
            status: result.status ?? "ready",
            error: void 0,
            pagination: {
              ...prev.pagination
              // totalItems & totalPages will be recalculated
            }
          },
          fields
        )
      );
    } catch (err) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: err
      }));
    }
  }, [dataSource, fields]);
  useEffect(() => {
    loadInitial();
  }, [loadInitial]);
  useEffect(() => {
    if (!dataSource.subscribe) {
      return;
    }
    const unsubscribe = dataSource.subscribe(
      (patch) => {
        setState((prev) => {
          const nextRaw = applyPatch(
            prev.rawRows,
            patch,
            idKey
          );
          return recomputeDerived(prev, fields, nextRaw);
        });
      }
    );
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (dataSource.destroy) {
        dataSource.destroy();
      }
    };
  }, [dataSource, fields, idKey]);
  const refresh = useCallback(async () => {
    await loadInitial();
  }, [loadInitial]);
  const exportState = useCallback(
    () => buildSnapshot(state),
    [state]
  );
  const setFilters = useCallback(
    (updater) => {
      setState((prev) => {
        const nextFilters = updater(prev.filters);
        return recomputeDerived(
          {
            ...prev,
            filters: nextFilters
          },
          fields
        );
      });
    },
    [fields]
  );
  const setSort = useCallback(
    (sort) => {
      setState(
        (prev) => recomputeDerived(
          {
            ...prev,
            sort
          },
          fields
        )
      );
    },
    [fields]
  );
  const setPageIndex = useCallback((pageIndex) => {
    setState(
      (prev) => recomputeDerived(
        {
          ...prev,
          pagination: {
            ...prev.pagination,
            pageIndex
          }
        },
        fields
      )
    );
  }, [fields]);
  const setPageSize = useCallback((pageSize) => {
    setState(
      (prev) => recomputeDerived(
        {
          ...prev,
          pagination: {
            ...prev.pagination,
            pageSize,
            pageIndex: 0
            // reset to first page when pageSize changes
          }
        },
        fields
      )
    );
  }, [fields]);
  const doClearSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selection: clearSelection(prev.selection)
    }));
  }, []);
  const doSelectAllVisible = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selection: selectAllVisible(
        prev.rows,
        prev.selection,
        {
          mode: prev.selection.mode,
          idKey
        }
      )
    }));
  }, [idKey]);
  const runGeneralActionHandler = useCallback(
    async (action) => {
      if (!action.handler) {
        return;
      }
      const snapshot = exportState();
      const updateRows = (updater) => {
        setState((prev) => {
          const nextRaw = updater(prev.rawRows);
          return recomputeDerived(prev, fields, nextRaw);
        });
      };
      const ctx = {
        rows: snapshot.rowsAll,
        visibleRows: snapshot.rowsVisible,
        selection: snapshot.selection,
        filters: snapshot.filters,
        sort: snapshot.sort,
        pagination: snapshot.pagination,
        updateRows,
        exportState,
        refresh
      };
      await action.handler(ctx);
    },
    [exportState, fields, refresh]
  );
  const runRowActionHandler = useCallback(
    async (action, rowIndex) => {
      if (!action.handler) {
        return;
      }
      const snapshot = exportState();
      const row = snapshot.rowsVisible[rowIndex];
      if (!row) {
        return;
      }
      const updateRows = (updater) => {
        setState((prev) => {
          const nextRaw = updater(prev.rawRows);
          return recomputeDerived(prev, fields, nextRaw);
        });
      };
      const ctx = {
        rows: snapshot.rowsAll,
        visibleRows: snapshot.rowsVisible,
        selection: snapshot.selection,
        filters: snapshot.filters,
        sort: snapshot.sort,
        pagination: snapshot.pagination,
        updateRows,
        exportState,
        refresh,
        row,
        rowIndex
      };
      await action.handler(ctx);
    },
    [exportState, fields, refresh]
  );
  const triggerGeneralAction = useCallback(
    async (actionId) => {
      const action = (generalActions ?? []).find(
        (a) => a.id === actionId
      );
      if (!action) {
        return;
      }
      if (action.opensModal && action.modal) {
        setState((prev) => ({
          ...prev,
          ui: openModalForAction(prev.ui, action.id, "general")
        }));
        return;
      }
      await runGeneralActionHandler(action);
    },
    [generalActions, runGeneralActionHandler]
  );
  const triggerRowAction = useCallback(
    async (actionId, rowIndex) => {
      const action = (rowActions ?? []).find(
        (a) => a.id === actionId
      );
      if (!action) {
        return;
      }
      if (action.opensModal && action.modal) {
        const row = state.rows[rowIndex];
        const rowId = row ? row[idKey] : void 0;
        setState((prev) => ({
          ...prev,
          ui: openModalForAction(
            prev.ui,
            action.id,
            "row",
            rowId
          )
        }));
        return;
      }
      await runRowActionHandler(action, rowIndex);
    },
    [rowActions, runRowActionHandler, state.rows, idKey]
  );
  const confirmActiveAction = useCallback(
    async (payload) => {
      const { ui } = state;
      const active = ui.activeAction;
      if (!active) {
        return;
      }
      if (active.type === "general") {
        const action = (generalActions ?? []).find(
          (a) => a.id === active.actionId
        );
        if (action) {
          await runGeneralActionHandler(action);
        }
      } else {
        const action = (rowActions ?? []).find(
          (a) => a.id === active.actionId
        );
        if (action) {
          const rowId = active.rowId;
          let rowIndex = -1;
          if (rowId != null) {
            rowIndex = state.rows.findIndex(
              (r) => r[idKey] === rowId
            );
          }
          if (rowIndex >= 0) {
            await runRowActionHandler(action, rowIndex);
          }
        }
      }
      setState((prev) => ({
        ...prev,
        ui: clearActiveAction(closeModal(prev.ui))
      }));
    },
    [
      state,
      generalActions,
      rowActions,
      runGeneralActionHandler,
      runRowActionHandler,
      idKey
    ]
  );
  const cancelActiveAction = useCallback(() => {
    setState((prev) => ({
      ...prev,
      ui: clearActiveAction(closeModal(prev.ui))
    }));
  }, []);
  return useMemo(
    () => ({
      state,
      fields,
      generalActions,
      rowActions,
      setFilters,
      setSort,
      setPageIndex,
      setPageSize,
      clearSelection: doClearSelection,
      selectAllVisible: doSelectAllVisible,
      triggerGeneralAction,
      triggerRowAction,
      confirmActiveAction,
      cancelActiveAction,
      exportState,
      refresh
    }),
    [
      state,
      fields,
      generalActions,
      rowActions,
      setFilters,
      setSort,
      setPageIndex,
      setPageSize,
      doClearSelection,
      doSelectAllVisible,
      triggerGeneralAction,
      triggerRowAction,
      confirmActiveAction,
      cancelActiveAction,
      exportState,
      refresh
    ]
  );
};
var ListDisplay = (props) => {
  const {
    components,
    componentsProps,
    idKey,
    ...coreConfig
  } = props;
  const {
    state,
    fields,
    generalActions,
    rowActions,
    setFilters,
    setSort,
    setPageIndex,
    setPageSize,
    clearSelection: clearSelection2,
    selectAllVisible: selectAllVisible2,
    triggerGeneralAction,
    triggerRowAction,
    confirmActiveAction,
    cancelActiveAction,
    exportState,
    refresh
  } = useListCore({
    ...coreConfig,
    idKey
  });
  const {
    Toolbar: ToolbarSlot,
    FiltersPanel: FiltersPanelSlot,
    SortBar: SortBarSlot,
    Table: TableSlot,
    Pagination: PaginationSlot,
    ModalOutlet: ModalOutletSlot,
    LoadingState: LoadingStateSlot,
    EmptyState: EmptyStateSlot,
    ErrorState: ErrorStateSlot
  } = components ?? {};
  const compProps = componentsProps ?? {};
  const ToolbarComponent = ToolbarSlot ?? ListToolbar;
  const FiltersPanelComponent = FiltersPanelSlot ?? ListFiltersPanel;
  const SortBarComponent = SortBarSlot ?? ListSortBar;
  const TableComponent = TableSlot ?? ListTable;
  const PaginationComponent = PaginationSlot ?? ListPagination;
  const ModalOutletComponent = ModalOutletSlot ?? ListModalOutlet;
  const LoadingStateComponent = LoadingStateSlot ?? ListLoadingState;
  const EmptyStateComponent = EmptyStateSlot ?? ListEmptyState;
  const ErrorStateComponent = ErrorStateSlot ?? ListErrorState;
  const handleChangeFilters = (next) => {
    const filters = next ?? {};
    setFilters(() => filters);
  };
  const handleChangeSort = (fieldId) => {
    if (!fieldId) {
      setSort(void 0);
      return;
    }
    const current = state.sort;
    if (current && current.field === fieldId) {
      const nextDirection = current.direction === "asc" ? "desc" : "asc";
      setSort({
        field: current.field,
        direction: nextDirection
      });
    } else {
      setSort({
        field: fieldId,
        direction: "asc"
      });
    }
  };
  const handlePageChange = (pageIndex) => {
    setPageIndex(pageIndex);
  };
  const handlePageSizeChange = (pageSize) => {
    setPageSize(pageSize);
  };
  const handleToolbarActionClick = (actionId) => {
    void triggerGeneralAction(actionId);
  };
  const handleRowActionClick = (actionId, rowIndex) => {
    void triggerRowAction(actionId, rowIndex);
  };
  const handleModalConfirm = (payload) => {
    void confirmActiveAction(payload);
  };
  const handleModalCancel = () => {
    cancelActiveAction();
  };
  const isLoading = state.status === "loading" && (!state.rows || state.rows.length === 0);
  const hasError = state.status === "error";
  const isEmpty = state.status === "ready" && state.rows && state.rows.length === 0;
  const loadingMessage = "Loading data...";
  const emptyMessage = "No data available.";
  const errorMessage = "An error occurred while loading data.";
  useMemo(() => exportState(), [exportState]);
  return /* @__PURE__ */ jsxs(ListContainer, { className: "ld-list", children: [
    /* @__PURE__ */ jsx(
      ToolbarComponent,
      {
        ...compProps.Toolbar,
        state,
        generalActions,
        onActionClick: handleToolbarActionClick
      }
    ),
    /* @__PURE__ */ jsx(
      FiltersPanelComponent,
      {
        ...compProps.FiltersPanel,
        state,
        fields,
        onChangeFilters: handleChangeFilters
      }
    ),
    /* @__PURE__ */ jsx(
      SortBarComponent,
      {
        ...compProps.SortBar,
        state,
        fields,
        onChangeSort: handleChangeSort
      }
    ),
    isLoading && /* @__PURE__ */ jsx(
      LoadingStateComponent,
      {
        ...compProps.LoadingState,
        message: loadingMessage
      }
    ),
    hasError && !isLoading && /* @__PURE__ */ jsx(
      ErrorStateComponent,
      {
        ...compProps.ErrorState,
        message: errorMessage
      }
    ),
    isEmpty && !isLoading && !hasError && /* @__PURE__ */ jsx(
      EmptyStateComponent,
      {
        ...compProps.EmptyState,
        message: emptyMessage
      }
    ),
    !isLoading && !hasError && state.rows && state.rows.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        TableComponent,
        {
          ...compProps.Table,
          state,
          fields,
          idKey,
          rowActions,
          onRowActionClick: handleRowActionClick
        }
      ),
      /* @__PURE__ */ jsx(
        PaginationComponent,
        {
          ...compProps.Pagination,
          state,
          onChangePage: handlePageChange,
          onChangePageSize: handlePageSizeChange
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      ModalOutletComponent,
      {
        ...compProps.ModalOutlet,
        state,
        generalActions,
        rowActions,
        onConfirm: handleModalConfirm,
        onCancel: handleModalCancel
      }
    )
  ] });
};

export { ConfirmModal, ListBody, ListCell, ListContainer, ListDisplay, ListEmptyState, ListErrorState, ListFiltersPanel, ListHeader, ListLoadingState, ListModalOutlet, ListPagination, ListRow, ListSortBar, ListTable, ListToolbar, applyFilters, applyPagination, applyPatch, applyPatches, applySorting, buildFilterPredicate, buildSnapshot, clearActiveAction, clearSelection, closeModal, createInitialUiState, createQuerySource, createSelectionState, createStaticSource, createStreamSource, getRowId, isRowSelected, openModalForAction, selectAllVisible, toggleRowSelection, updatePaginationMeta, useListCore };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map