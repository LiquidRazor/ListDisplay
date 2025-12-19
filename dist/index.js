import { createContext, useRef, useMemo, useSyncExternalStore, useEffect, useCallback } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';

// src/ListDisplay.tsx
function useListEngine(args) {
  const { store, dataSource, applyPatch } = args;
  const refresh = useCallback(async () => {
    store.setState((prev) => ({ ...prev, status: "loading", error: void 0 }));
    try {
      const result = await dataSource.init();
      store.setState((prev) => ({
        ...prev,
        rawRows: result.rows ?? [],
        status: result.status ?? "ready",
        error: void 0
      }));
    } catch (err) {
      store.setState((prev) => ({ ...prev, status: "error", error: err }));
    }
  }, [dataSource, store]);
  useEffect(() => {
    refresh();
    if (!dataSource.subscribe) return;
    const unsub = dataSource.subscribe((patch) => {
      if (!applyPatch) return;
      store.setState((prev) => ({
        ...prev,
        rawRows: applyPatch(prev.rawRows, patch)
      }));
    });
    return () => {
      if (typeof unsub === "function") unsub();
      dataSource.destroy?.();
    };
  }, [dataSource, applyPatch, refresh, store]);
  return { refresh };
}

// src/core/store/listStore.ts
function createListStore(initialState) {
  let state = initialState;
  const listeners = /* @__PURE__ */ new Set();
  return {
    getState() {
      return state;
    },
    setState(updater) {
      const next = updater(state);
      if (Object.is(next, state)) return;
      state = next;
      for (const l of listeners) l();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }
  };
}

// src/core/registry/compiledFeaturePlan.ts
function createRuntimePlan(ctx, compiled) {
  const derivePipeline = Object.freeze([...compiled.derivePipeline]);
  const onInit = Object.freeze([...compiled.onInit]);
  const onDestroy = Object.freeze([...compiled.onDestroy]);
  const onRefresh = Object.freeze([...compiled.onRefresh]);
  Object.assign(ctx.features, compiled.featureApis);
  const derive = (rows) => {
    let out = rows;
    for (const step of derivePipeline) {
      out = step(out, ctx);
    }
    return out;
  };
  const init = async () => {
    for (const fn of onInit) {
      await fn(ctx);
    }
  };
  const refresh = async () => {
    for (const fn of onRefresh) {
      await fn(ctx);
    }
  };
  const destroy = () => {
    for (const fn of onDestroy) {
      try {
        fn(ctx);
      } catch {
      }
    }
  };
  return {
    ctx,
    features: ctx.features,
    derive,
    init,
    refresh,
    destroy,
    uiContracts: compiled.uiContracts
  };
}

// src/core/context/createListRuntime.ts
function createListRuntime(args) {
  const { registry, stateRef, setState, refreshImpl, exportStateImpl, meta } = args;
  const ctx = {
    state: stateRef.current,
    stateRef,
    setState,
    refresh: refreshImpl,
    exportState: exportStateImpl,
    features: /* @__PURE__ */ Object.create(null),
    meta
  };
  const compiled = registry.compile(ctx);
  return createRuntimePlan(ctx, compiled);
}

// src/core/contracts/validateUiWiring.ts
function hasAnySlot(components, slots) {
  if (!slots || slots.length === 0) return false;
  for (const s of slots) {
    if (components[s]) return true;
  }
  return false;
}
function isFunction(value) {
  return typeof value === "function";
}
function validateUiWiring(runtime, components, options = {}) {
  const { mode = "throw", enabled = true } = options;
  if (!enabled) return;
  const uiContracts = runtime.uiContracts;
  if (!uiContracts) return;
  const errors = [];
  for (const [featureId, contract] of Object.entries(uiContracts)) {
    if (!contract) continue;
    const uiActive = hasAnySlot(components, contract.slots);
    if (!uiActive) continue;
    const api = runtime.features?.[featureId];
    if (!api) {
      errors.push(
        `Feature '${featureId}' declares UI slots [${(contract.slots ?? []).join(", ")}] but no API was created (ctx.features['${featureId}'] is missing).`
      );
      continue;
    }
    for (const handlerName of contract.requiredHandlers ?? []) {
      const candidate = api[handlerName];
      if (!isFunction(candidate)) {
        errors.push(
          `Feature '${featureId}' UI requires handler '${handlerName}', but ctx.features['${featureId}'].${handlerName} is missing or not a function.`
        );
      }
    }
  }
  if (errors.length === 0) return;
  const message = `ListDisplay UI wiring is invalid:
` + errors.map((e) => `- ${e}`).join("\n");
  if (mode === "warn") {
    console.warn(message);
    return;
  }
  throw new Error(message);
}
var ListContext = createContext(null);
function ListContextProvider(props) {
  return /* @__PURE__ */ jsx(ListContext.Provider, { value: props.value, children: props.children });
}
var DEFAULT_STATE = {
  rawRows: [],
  rows: [],
  status: "idle",
  featureState: /* @__PURE__ */ Object.create(null),
  error: void 0
};
function ListDisplay(props) {
  const {
    idKey,
    fields,
    dataSource,
    applyPatch,
    registry,
    components = {},
    componentsProps = {},
    validationMode = "throw",
    initialRows
  } = props;
  const storeRef = useRef(
    createListStore({
      ...DEFAULT_STATE,
      rawRows: initialRows ?? [],
      rows: [],
      status: initialRows ? "ready" : "idle"
    })
  );
  const store = storeRef.current;
  const stateRef = useRef(store.getState());
  const runtimeRef = useRef(null);
  const exportStateImpl = useMemo(() => {
    return () => {
      return stateRef.current;
    };
  }, []);
  const refreshRef = useRef(async () => {
  });
  const setState = (updater) => store.setState(updater);
  if (!runtimeRef.current) {
    runtimeRef.current = createListRuntime({
      registry,
      stateRef,
      setState,
      refreshImpl: () => refreshRef.current(),
      exportStateImpl,
      meta: { idKey, fields }
    });
  }
  const runtime = runtimeRef.current;
  const { refresh } = useListEngine({
    store,
    dataSource,
    applyPatch
  });
  refreshRef.current = refresh;
  const coreState = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState
  );
  const derivedRows = runtime.derive(coreState.rawRows);
  stateRef.current = {
    ...coreState,
    rows: derivedRows
  };
  useEffect(() => {
    runtime.init();
    validateUiWiring(runtime, components, { mode: validationMode, enabled: true });
    return () => {
      runtime.destroy();
    };
  }, []);
  const LoadingState = components.LoadingState;
  const ErrorState = components.ErrorState;
  const EmptyState = components.EmptyState;
  const Table = components.Table;
  const Toolbar = components.Toolbar;
  const FiltersPanel = components.FiltersPanel;
  const SortBar = components.SortBar;
  const Pagination = components.Pagination;
  const ModalOutlet = components.ModalOutlet;
  if (coreState.status === "loading" && LoadingState) {
    return /* @__PURE__ */ jsx(ListContextProvider, { value: runtime.ctx, children: /* @__PURE__ */ jsx(LoadingState, { ...componentsProps.LoadingState }) });
  }
  if (coreState.status === "error" && ErrorState) {
    return /* @__PURE__ */ jsx(ListContextProvider, { value: runtime.ctx, children: /* @__PURE__ */ jsx(ErrorState, { ...componentsProps.ErrorState }) });
  }
  if (coreState.status === "ready" && derivedRows.length === 0 && EmptyState) {
    return /* @__PURE__ */ jsx(ListContextProvider, { value: runtime.ctx, children: /* @__PURE__ */ jsx(EmptyState, { ...componentsProps.EmptyState }) });
  }
  return /* @__PURE__ */ jsxs(ListContextProvider, { value: runtime.ctx, children: [
    Toolbar ? /* @__PURE__ */ jsx(Toolbar, { ...componentsProps.Toolbar }) : null,
    FiltersPanel ? /* @__PURE__ */ jsx(FiltersPanel, { ...componentsProps.FiltersPanel }) : null,
    SortBar ? /* @__PURE__ */ jsx(SortBar, { ...componentsProps.SortBar }) : null,
    Table ? /* @__PURE__ */ jsx(Table, { ...componentsProps.Table }) : null,
    Pagination ? /* @__PURE__ */ jsx(Pagination, { ...componentsProps.Pagination }) : null,
    ModalOutlet ? /* @__PURE__ */ jsx(ModalOutlet, { ...componentsProps.ModalOutlet }) : null
  ] });
}

// src/core/store/featureState.ts
function getFeatureSlice(state, featureId, init) {
  const bag = state.featureState;
  const existing = bag[featureId];
  if (existing !== void 0) {
    return existing;
  }
  return init();
}
function setFeatureSlice(state, featureId, slice) {
  return {
    ...state,
    featureState: {
      ...state.featureState,
      [featureId]: slice
    }
  };
}

// src/features/actions/generalActionsFeature.ts
var FEATURE_ID = "generalActions";
function getModalsApi(ctx) {
  const api = ctx.features?.modals;
  if (!api) return null;
  const has = typeof api.open === "function" && typeof api.onResolve === "function";
  return has ? api : null;
}
function generalActionsFeature(options) {
  if (!options?.actions) {
    throw new Error("generalActionsFeature requires { actions }.");
  }
  return {
    id: FEATURE_ID,
    ui: {
      slots: ["Toolbar"],
      requiredHandlers: ["trigger"]
    },
    create(ctx) {
      const idKey = ctx.meta?.idKey;
      if (!idKey) {
        throw new Error("generalActionsFeature requires ctx.meta.idKey (string).");
      }
      const modals = getModalsApi(ctx);
      const readSlice = () => {
        const state = ctx.stateRef.current;
        return getFeatureSlice(state, FEATURE_ID, () => ({
          pending: void 0
        }));
      };
      const writeSlice = (slice) => {
        ctx.setState((prev) => setFeatureSlice(prev, FEATURE_ID, slice));
      };
      const buildBaseCtx = () => {
        const state = ctx.stateRef.current;
        const selectionApi = ctx.features?.selection;
        const selection = selectionApi && typeof selectionApi.getSelection === "function" ? selectionApi.getSelection() : void 0;
        return {
          rowsVisible: state.rows ?? [],
          rowsAll: state.rawRows ?? [],
          selection,
          refresh: ctx.refresh,
          exportState: ctx.exportState,
          features: ctx.features,
          meta: {
            idKey,
            fields: ctx.meta?.fields
          }
        };
      };
      const buildFullCtx = () => {
        const base = buildBaseCtx();
        const updateRows = (updater) => {
          ctx.setState((prev) => ({
            ...prev,
            rawRows: updater(prev.rawRows)
          }));
        };
        return { ...base, updateRows };
      };
      const runAction = async (action, payload) => {
        const base = buildBaseCtx();
        if (action.isEnabled && action.isEnabled(base) === false) {
          return;
        }
        if (action.modal) {
          if (!modals) {
            throw new Error(
              `General action '${action.id}' requested a modal, but modals feature is not registered.`
            );
          }
          const request = action.modal(base);
          modals.open({
            scope: "general-action",
            actionId: action.id,
            meta: request?.meta
          });
          writeSlice({ pending: { actionId: action.id } });
          return;
        }
        await action.handler(buildFullCtx(), payload);
      };
      let unsubscribe = null;
      if (modals) {
        unsubscribe = modals.onResolve(async (result) => {
          if (result.status !== "confirmed") return;
          if (result.descriptor.scope !== "general-action") return;
          const pending = readSlice().pending;
          if (!pending) return;
          if (result.descriptor.actionId !== pending.actionId) return;
          writeSlice({ pending: void 0 });
          const action = options.actions.find((a) => a.id === pending.actionId);
          if (!action) return;
          await action.handler(buildFullCtx(), result.payload);
        });
      }
      ctx.features.__generalActionsUnsub = unsubscribe;
      const api = {
        getActions: () => options.actions,
        trigger: async (actionId) => {
          const action = options.actions.find((a) => a.id === actionId);
          if (!action) return;
          await runAction(action);
        }
      };
      return api;
    },
    onDestroy(ctx) {
      const unsub = ctx.features.__generalActionsUnsub;
      if (typeof unsub === "function") {
        try {
          unsub();
        } catch {
        }
      }
      delete ctx.features.__generalActionsUnsub;
    }
  };
}

// src/features/actions/rowActionsFeature.ts
var FEATURE_ID2 = "rowActions";
function getModalsApi2(ctx) {
  const api = ctx.features?.modals;
  if (!api) return null;
  const has = typeof api.open === "function" && typeof api.onResolve === "function";
  return has ? api : null;
}
function rowActionsFeature(options) {
  if (!options?.actions) {
    throw new Error("rowActionsFeature requires { actions }.");
  }
  return {
    id: FEATURE_ID2,
    ui: {
      slots: ["Table"],
      requiredHandlers: ["triggerAt", "triggerById"]
    },
    create(ctx) {
      const idKey = ctx.meta?.idKey;
      if (!idKey) {
        throw new Error("rowActionsFeature requires ctx.meta.idKey (string).");
      }
      const modals = getModalsApi2(ctx);
      const readSlice = () => {
        const state = ctx.stateRef.current;
        return getFeatureSlice(state, FEATURE_ID2, () => ({
          pending: void 0
        }));
      };
      const writeSlice = (slice) => {
        ctx.setState((prev) => setFeatureSlice(prev, FEATURE_ID2, slice));
      };
      const buildBaseCtx = (row, rowIndex) => {
        const state = ctx.stateRef.current;
        const rowId = row[idKey];
        const selectionApi = ctx.features?.selection;
        const selection = selectionApi && typeof selectionApi.getSelection === "function" ? selectionApi.getSelection() : void 0;
        return {
          row,
          rowId,
          rowIndex,
          rowsVisible: state.rows ?? [],
          rowsAll: state.rawRows ?? [],
          selection,
          refresh: ctx.refresh,
          exportState: ctx.exportState,
          features: ctx.features,
          meta: {
            idKey,
            fields: ctx.meta?.fields
          }
        };
      };
      const buildFullCtx = (row, rowIndex) => {
        const base = buildBaseCtx(row, rowIndex);
        const updateRows = (updater) => {
          ctx.setState((prev) => ({
            ...prev,
            rawRows: updater(prev.rawRows)
          }));
        };
        return { ...base, updateRows };
      };
      const findVisibleRowById = (rowId) => {
        const state = ctx.stateRef.current;
        const rows = state.rows ?? [];
        const idx = rows.findIndex((r) => r[idKey] === rowId);
        if (idx < 0) return null;
        return { row: rows[idx], rowIndex: idx };
      };
      const runAction = async (action, row, rowIndex, payload) => {
        const base = buildBaseCtx(row, rowIndex);
        if (action.isEnabled && action.isEnabled(base) === false) {
          return;
        }
        if (action.modal) {
          if (!modals) {
            throw new Error(
              `Row action '${action.id}' requested a modal, but modals feature is not registered.`
            );
          }
          const request = action.modal(base);
          modals.open({
            scope: "row-action",
            actionId: action.id,
            rowId: base.rowId,
            meta: request.meta
          });
          writeSlice({ pending: { actionId: action.id, rowId: base.rowId } });
          return;
        }
        await action.handler(buildFullCtx(row, rowIndex), payload);
      };
      let unsubscribe = null;
      if (modals) {
        unsubscribe = modals.onResolve(async (result) => {
          if (result.status !== "confirmed") return;
          if (result.descriptor.scope !== "row-action") return;
          const pending = readSlice().pending;
          if (!pending) return;
          if (result.descriptor.actionId !== pending.actionId) return;
          if (result.descriptor.rowId !== pending.rowId) return;
          writeSlice({ pending: void 0 });
          const action = options.actions.find((a) => a.id === pending.actionId);
          if (!action) return;
          const resolved = findVisibleRowById(pending.rowId);
          if (!resolved) return;
          await action.handler(buildFullCtx(resolved.row, resolved.rowIndex), result.payload);
        });
      }
      ctx.features.__rowActionsUnsub = unsubscribe;
      const api = {
        getActions: () => options.actions,
        triggerAt: async (actionId, rowIndex) => {
          const action = options.actions.find((a) => a.id === actionId);
          if (!action) return;
          const state = ctx.stateRef.current;
          const row = (state.rows ?? [])[rowIndex];
          if (!row) return;
          await runAction(action, row, rowIndex);
        },
        triggerById: async (actionId, rowId) => {
          const action = options.actions.find((a) => a.id === actionId);
          if (!action) return;
          const resolved = findVisibleRowById(rowId);
          if (!resolved) return;
          await runAction(action, resolved.row, resolved.rowIndex);
        }
      };
      return api;
    },
    onDestroy(ctx) {
      const unsub = ctx.features.__rowActionsUnsub;
      if (typeof unsub === "function") {
        try {
          unsub();
        } catch {
        }
      }
      delete ctx.features.__rowActionsUnsub;
    }
  };
}

// src/features/filtering/filteringFeature.ts
var FEATURE_ID3 = "filters";
function filteringFeature(options) {
  if (!options?.apply) {
    throw new Error("filteringFeature requires an 'apply' function.");
  }
  return {
    id: FEATURE_ID3,
    ui: {
      slots: ["FiltersPanel"],
      requiredHandlers: ["setFilters"]
    },
    create(ctx) {
      const readSlice = () => {
        const state = ctx.stateRef.current;
        return getFeatureSlice(state, FEATURE_ID3, () => ({
          value: options.initial ?? {}
        }));
      };
      const writeSlice = (slice) => {
        ctx.setState((prev) => setFeatureSlice(prev, FEATURE_ID3, slice));
      };
      const api = {
        getFilters: () => readSlice().value,
        setFilters: (next) => {
          writeSlice({
            value: typeof next === "function" ? next(readSlice().value) : next
          });
        },
        clearFilters: () => {
          writeSlice({ value: options.initial ?? {} });
        }
      };
      return api;
    },
    derive(rows, ctx) {
      const state = ctx.stateRef.current;
      const slice = getFeatureSlice(state, FEATURE_ID3, () => ({
        value: options.initial ?? {}
      }));
      return options.apply(rows, slice.value, ctx);
    }
  };
}

// src/features/modals/modalsFeature.ts
var FEATURE_ID4 = "modals";
function modalsFeature(options = {}) {
  const strictSingle = options.strictSingle ?? false;
  return {
    id: FEATURE_ID4,
    ui: {
      slots: ["ModalOutlet"],
      requiredHandlers: ["getActive", "open", "confirm", "cancel", "close"]
    },
    create(ctx) {
      const listeners = /* @__PURE__ */ new Set();
      const readSlice = () => {
        const state = ctx.stateRef.current;
        return getFeatureSlice(state, FEATURE_ID4, () => ({
          active: void 0,
          version: 0,
          lastResult: void 0
        }));
      };
      const writeSlice = (slice) => {
        ctx.setState((prev) => setFeatureSlice(prev, FEATURE_ID4, slice));
      };
      const emit = (result) => {
        for (const l of listeners) {
          try {
            l(result);
          } catch {
          }
        }
      };
      const api = {
        getActive: () => readSlice().active,
        open: (descriptor) => {
          const s = readSlice();
          if (strictSingle && s.active) {
            throw new Error("A modal is already active. Close it before opening another.");
          }
          writeSlice({
            active: descriptor,
            version: s.version + 1,
            lastResult: void 0
          });
        },
        close: () => {
          const s = readSlice();
          if (!s.active) return;
          writeSlice({
            ...s,
            active: void 0,
            version: s.version + 1
          });
        },
        confirm: (payload) => {
          const s = readSlice();
          if (!s.active) return;
          const result = {
            status: "confirmed",
            descriptor: s.active,
            payload
          };
          writeSlice({
            active: void 0,
            version: s.version + 1,
            lastResult: result
          });
          emit(result);
        },
        cancel: () => {
          const s = readSlice();
          if (!s.active) return;
          const result = {
            status: "cancelled",
            descriptor: s.active
          };
          writeSlice({
            active: void 0,
            version: s.version + 1,
            lastResult: result
          });
          emit(result);
        },
        onResolve: (listener) => {
          listeners.add(listener);
          return () => listeners.delete(listener);
        }
      };
      return api;
    }
  };
}

// src/features/pagination/paginationFeature.ts
var FEATURE_ID5 = "pagination";
var DEFAULT_PAGE_SIZE = 25;
function paginationFeature(options = {}) {
  const initialPageIndex = options.initialPageIndex ?? 0;
  const initialPageSize = options.initialPageSize ?? DEFAULT_PAGE_SIZE;
  return {
    id: FEATURE_ID5,
    order: {
      after: ["filters", "sorting"]
    },
    ui: {
      slots: ["Pagination"],
      requiredHandlers: ["setPageIndex", "setPageSize"]
    },
    create(ctx) {
      const readSlice = () => {
        const state = ctx.stateRef.current;
        return getFeatureSlice(state, FEATURE_ID5, () => ({
          pageIndex: initialPageIndex,
          pageSize: initialPageSize,
          totalItems: 0,
          totalPages: 0
        }));
      };
      const writeSlice = (slice) => {
        ctx.setState(
          (prev) => setFeatureSlice(prev, FEATURE_ID5, slice)
        );
      };
      const api = {
        getPagination: () => readSlice(),
        setPageIndex: (pageIndex) => {
          const s = readSlice();
          writeSlice({
            ...s,
            pageIndex: Math.max(0, Math.min(pageIndex, s.totalPages - 1))
          });
        },
        setPageSize: (pageSize) => {
          const s = readSlice();
          writeSlice({
            ...s,
            pageSize: Math.max(1, pageSize),
            pageIndex: 0
            // reset page on size change
          });
        },
        reset: () => {
          writeSlice({
            pageIndex: initialPageIndex,
            pageSize: initialPageSize,
            totalItems: 0,
            totalPages: 0
          });
        }
      };
      return api;
    },
    derive(rows, ctx) {
      const state = ctx.stateRef.current;
      const slice = getFeatureSlice(state, FEATURE_ID5, () => ({
        pageIndex: initialPageIndex,
        pageSize: initialPageSize,
        totalItems: 0,
        totalPages: 0
      }));
      const totalItems = rows.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / slice.pageSize));
      const safePageIndex = Math.min(slice.pageIndex, totalPages - 1);
      const start = safePageIndex * slice.pageSize;
      const end = start + slice.pageSize;
      if (slice.totalItems !== totalItems || slice.totalPages !== totalPages || slice.pageIndex !== safePageIndex) {
        ctx.setState(
          (prev) => setFeatureSlice(prev, FEATURE_ID5, {
            ...slice,
            pageIndex: safePageIndex,
            totalItems,
            totalPages
          })
        );
      }
      return rows.slice(start, end);
    }
  };
}

// src/features/selection/selectionFeature.ts
var FEATURE_ID6 = "selection";
function uniq(arr) {
  return Array.from(new Set(arr));
}
function removeOne(arr, value) {
  const out = [];
  for (const item of arr) {
    if (item !== value) out.push(item);
  }
  return out;
}
function selectionFeature(options = {}) {
  const mode = options.mode ?? "none";
  const initialSelected = options.initialSelectedIds ?? [];
  return {
    id: FEATURE_ID6,
    create(ctx) {
      const idKey = ctx.meta?.idKey;
      if (!idKey) {
        throw new Error("selectionFeature requires ctx.meta.idKey (string) to be provided.");
      }
      const readSlice = () => {
        const state = ctx.stateRef.current;
        return getFeatureSlice(state, FEATURE_ID6, () => {
          const ids = mode === "none" ? [] : uniq(initialSelected);
          return {
            mode,
            selectedIds: mode === "single" ? ids.slice(0, 1) : ids
          };
        });
      };
      const writeSlice = (next) => {
        ctx.setState((prev) => setFeatureSlice(prev, FEATURE_ID6, next));
      };
      const coerce = (ids) => {
        if (mode === "none") return [];
        const unique = uniq(ids);
        return mode === "single" ? unique.slice(0, 1) : unique;
      };
      const api = {
        getSelection: () => readSlice(),
        isSelected: (rowId) => {
          const { selectedIds } = readSlice();
          return selectedIds.includes(rowId);
        },
        select: (rowId) => {
          if (mode === "none") return;
          const s = readSlice();
          const next = coerce([...s.selectedIds, rowId]);
          writeSlice({ ...s, selectedIds: next });
        },
        deselect: (rowId) => {
          if (mode === "none") return;
          const s = readSlice();
          const next = removeOne(s.selectedIds, rowId);
          writeSlice({ ...s, selectedIds: next });
        },
        toggle: (rowId) => {
          if (mode === "none") return;
          const s = readSlice();
          const isOn = s.selectedIds.includes(rowId);
          const next = isOn ? removeOne(s.selectedIds, rowId) : coerce([...s.selectedIds, rowId]);
          writeSlice({ ...s, selectedIds: next });
        },
        clear: () => {
          const s = readSlice();
          if (s.selectedIds.length === 0) return;
          writeSlice({ ...s, selectedIds: [] });
        },
        setSelected: (ids) => {
          const s = readSlice();
          const next = coerce(ids);
          writeSlice({ ...s, selectedIds: next });
        },
        selectAllVisible: () => {
          if (mode === "none") return;
          const s = readSlice();
          const state = ctx.stateRef.current;
          const rows = state.rows ?? [];
          const ids = rows.map((r) => r[idKey]).filter((v) => v != null);
          const next = mode === "single" ? ids.slice(0, 1) : uniq(ids);
          writeSlice({ ...s, selectedIds: next });
        }
      };
      return api;
    }
  };
}

// src/features/sorting/sortingFeature.ts
var FEATURE_ID7 = "sorting";
function normalizeSort(value) {
  if (!value) return null;
  const direction = value.direction ?? "asc";
  return { fieldId: value.fieldId, direction };
}
function sortingFeature(options) {
  if (!options) {
    throw new Error("sortingFeature requires options.");
  }
  const hasApply = options.apply != null;
  const hasCompare = options.compare != null;
  if (!hasApply && !hasCompare) {
    throw new Error("sortingFeature requires either an 'apply' or 'compare' function.");
  }
  return {
    id: FEATURE_ID7,
    order: {
      after: ["filters"]
    },
    ui: {
      slots: ["SortBar"],
      requiredHandlers: ["setSort"]
    },
    create(ctx) {
      const readSlice = () => {
        const state = ctx.stateRef.current;
        return getFeatureSlice(state, FEATURE_ID7, () => ({
          value: normalizeSort(options.initial ?? null)
        }));
      };
      const writeSlice = (slice) => {
        ctx.setState((prev) => setFeatureSlice(prev, FEATURE_ID7, slice));
      };
      const api = {
        getSort: () => readSlice().value,
        setSort: (next) => {
          const prevValue = readSlice().value;
          const resolved = typeof next === "function" ? next(prevValue) : next;
          writeSlice({ value: normalizeSort(resolved) });
        },
        clearSort: () => {
          writeSlice({ value: normalizeSort(options.initial ?? null) });
        }
      };
      return api;
    },
    derive(rows, ctx) {
      const state = ctx.stateRef.current;
      const slice = getFeatureSlice(state, FEATURE_ID7, () => ({
        value: normalizeSort(options.initial ?? null)
      }));
      const sort = slice.value;
      if (!sort) return rows;
      if (!sort) return rows;
      if (options.mode === "apply") {
        return options.apply(rows, sort, ctx);
      }
      const out = [...rows];
      out.sort((a, b) => {
        const base = options.compare(a, b, sort, ctx);
        return sort.direction === "desc" ? -base : base;
      });
      return out;
    }
  };
}

export { ListDisplay, filteringFeature, generalActionsFeature, modalsFeature, paginationFeature, rowActionsFeature, selectionFeature, sortingFeature };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map