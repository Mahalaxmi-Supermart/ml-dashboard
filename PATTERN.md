# E-Commerce Dashboard — Cursor Rules
> Stack: React + Vite · Material UI v6 · Redux Toolkit (createSlice) + Redux-Saga · React Hook Form v7

---

## Brand colour
Dark Green: #21622A
Green: #3A9A48
Orange: #F37326

## Project Structure (key folders)
```
src/
├── app/              # store.ts, rootReducer.ts, rootSaga.ts
├── components/
│   ├── common/       # DataTable, ConfirmDialog, StatusChip, PageLoader, FormDialog, ErrorAlert
│   └── layout/       # AppLayout.tsx, Sidebar.tsx, TopBar.tsx
├── pages/<n>/
│   ├── components/   # page-scoped UI
│   ├── hooks/        # page-scoped hooks
│   ├── <n>Page.tsx
│   └── <n>Types.ts   # domain types + slice State interface
├── redux/
│   ├── reducers/     # <n>Slice.ts
│   ├── sagas/        # <n>Saga.ts
│   └── services/     # <n>Service.ts  (pure axios, NO Redux imports)
├── hooks/            # useAppDispatch, useAppSelector
├── routes/           # AppRouter.tsx, PrivateRoute.tsx
├── services/         # axiosInstance.ts
├── theme/            # theme.ts
└── types/            # common.ts  → AsyncState<T>
```

---

## Naming Conventions
| Item | Convention | Example |
|---|---|---|
| Page components | PascalCase + `Page` suffix | `OrdersPage.tsx` |
| Hooks | camelCase + `use` prefix | `useOrderFilters.ts` |
| Slices | camelCase + `Slice` suffix | `ordersSlice.ts` |
| Sagas | camelCase + `Saga` suffix | `ordersSaga.ts` |
| Services | camelCase + `Service` suffix | `ordersService.ts` |
| Types files | camelCase + `Types` suffix | `ordersTypes.ts` |
| Redux actions | `sliceName/verbNoun` | `orders/fetchListRequest` |

---

## AsyncState — Core Pattern
Defined once in `src/types/common.ts`, reused everywhere:
```ts
export interface AsyncState<T> {
  pending: boolean;
  data: T;
  error: string | null;
}
export function asyncState<T>(initial: T): AsyncState<T> {
  return { pending: false, data: initial, error: null };
}
```

**One `AsyncState<T>` per API call. Never share `pending`/`error` across operations.**

State key naming:
- Fetch list → `<noun>List` (e.g. `ordersList: AsyncState<Order[]>`)
- Fetch count → `<noun>Count` (e.g. `ordersCount: AsyncState<number>`)
- Fetch one → `selected<Noun>` (e.g. `selectedOrder: AsyncState<Order | null>`)
- Create → `create<Noun>` (e.g. `createOrder: AsyncState<Order | null>`)
- Update → `update<Noun>` (e.g. `updateOrder: AsyncState<Order | null>`)
- Delete → `delete<Noun>` (e.g. `deleteOrder: AsyncState<string | null>`)

---

## Slice Rules
- Use `createSlice` always — never `createReducer` or plain reducers
- Each operation gets 3 actions: `*Request`, `*Success`, `*Failure`
- Non-async UI state (pagination, filters) lives flat on the slice, not in `AsyncState`
- Provide `clear*` actions for all mutation states (`clearCreateOrder`, etc.)
- Type all action payloads with `PayloadAction<T>` — never use `any`

---

## Saga Rules
- One worker function per action
- Workers use `call` for service functions, `put` for dispatching results
- Watcher uses `takeLatest` for fetches/mutations
- Catch blocks always dispatch `*Failure` with `err?.message ?? 'fallback message'`
- Never `console.log` errors — dispatch the failure action
- Export one `*Watcher` function per saga file; register it in `app/rootSaga.ts`

---

## Service Layer Rules
- Pure async functions only — no Redux imports
- All axios calls go through `axiosInstance` from `services/axiosInstance.ts`
- Return typed data, not raw axios response

---

## Forms (React Hook Form v7)
- Always use `Controller` with MUI inputs — never `register` directly
- `defaultValues` passed via props
- `loading` prop maps to `createOrder.pending` / `updateOrder.pending`
- Errors rendered with `<ErrorAlert>` near the relevant section

---

## Redux Hooks
Always use typed hooks — never raw `useDispatch` / `useSelector`:
```ts
// hooks/reduxHooks.ts
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

## Error & Loading Rules
1. Pass `<key>.pending` directly to the button/table that triggered the operation
2. Render `<ErrorAlert error={...} />` near the UI element that owns the operation
3. On dialog close → dispatch `clear*` to reset stale mutation state
4. Never leave stale `data`/`error` in state across re-opens

---

## Checklist — New Page / Feature
- [ ] `pages/<n>/` with `components/`, `hooks/`, `<n>Page.tsx`, `<n>Types.ts`
- [ ] `redux/reducers/<n>Slice.ts` — one `AsyncState<T>` per API operation
- [ ] `redux/sagas/<n>Saga.ts` — one worker per action, watcher exported
- [ ] `redux/services/<n>Service.ts` — pure async, no Redux imports
- [ ] Add reducer to `app/rootReducer.ts`
- [ ] Add watcher to `app/rootSaga.ts`
- [ ] Add route to `routes/AppRouter.tsx`
- [ ] Add nav item to `components/layout/Sidebar.tsx`
- [ ] All forms use `Controller` — no uncontrolled inputs
- [ ] All hooks use `useAppDispatch` / `useAppSelector`
- [ ] Dispatch `clear*` on dialog/form close
- [ ] Types live in `pages/<n>/<n>Types.ts` — no inline types in components

---

## DO / DON'T
| ✅ DO | ❌ DON'T |
|---|---|
| One `AsyncState<T>` per API call | Share `pending`/`error` across operations |
| Name keys after the data (`ordersList`) | Use generic names like `data`, `loading` |
| Slices in `redux/reducers/` | Put slices inside `pages/` |
| Sagas in `redux/sagas/` | Put sagas inside `pages/` |
| API calls in `redux/services/` | Put axios calls in sagas or components |
| Domain types in `pages/<n>/<n>Types.ts` | Define types inline in components |
| `takeLatest` for all watchers | Use `takeEvery` for API calls |
| `Controller` from RHF with MUI | Use `register` directly with MUI inputs |
| MUI `sx` prop for one-off styles | Mix `style={{}}` with `sx` |
| Theme tokens (`primary.main`) | Hard-coded hex colors in components |
| Dispatch `clear*` on dialog close | Leave stale mutation state |
| `PayloadAction<T>` on all actions | Use `any` in action payloads |
