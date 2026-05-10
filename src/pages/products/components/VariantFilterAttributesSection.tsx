import AddOutlined from '@mui/icons-material/AddOutlined'
import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { ErrorAlert } from '../../../components/common/ErrorAlert'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import type { CatalogueAttribute } from '../../../redux/services/attributesService'
import { fetchAttributesList } from '../../../redux/services/attributesService'
import {
  fetchProductVariantAttributeMaps,
  type ProductVariantAttributeMapDto,
} from '../../../redux/services/productsService'
import {
  emptyVariantFilterAttributeRow,
  type VariantFilterAttributeFormRow,
} from '../productsTypes'
import {
  syncVariantFilterAttributes,
  type VariantFilterAttributeInitialSnapshot,
} from '../utils/syncVariantFilterAttributes'

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(t)
  }, [value, delayMs])
  return debounced
}

function rowsFromMaps(maps: ProductVariantAttributeMapDto[]): VariantFilterAttributeFormRow[] {
  return maps.map((m) => ({
    mapId: m.id,
    attributeId: m.attribute_id,
    attributeName: m.attribute.name,
    attributeValueId: m.attribute_value_id,
    value: m.attribute_value.value,
  }))
}

function snapshotFromRows(
  rows: VariantFilterAttributeFormRow[],
): Map<number, VariantFilterAttributeInitialSnapshot> {
  const m = new Map<number, VariantFilterAttributeInitialSnapshot>()
  for (const r of rows) {
    if (
      r.mapId != null &&
      r.attributeId != null &&
      r.attributeId >= 1 &&
      r.attributeValueId != null &&
      r.attributeValueId >= 1
    ) {
      m.set(r.mapId, {
        attributeId: r.attributeId,
        attributeValueId: r.attributeValueId,
        value: r.value,
      })
    }
  }
  return m
}

type FilterFormValues = {
  filterRows: VariantFilterAttributeFormRow[]
}

function AttributeSearchAutocomplete({
  disabled,
  attributeName,
  attributeId,
  onCommit,
  onBlurSide,
}: {
  disabled: boolean
  attributeName: string
  attributeId: number | null
  onCommit: (name: string, id: number | null) => void
  onBlurSide?: () => void
}) {
  const [options, setOptions] = useState<CatalogueAttribute[]>([])
  const [inputValue, setInputValue] = useState(attributeName)
  const debouncedSearch = useDebouncedValue(inputValue, 320)

  useEffect(() => {
    setInputValue(attributeName)
  }, [attributeName])

  useEffect(() => {
    let cancelled = false
    const q = debouncedSearch.trim()
    if (!q) {
      setOptions([])
      return
    }
    void (async () => {
      try {
        const list = await fetchAttributesList({
          page_no: 1,
          page_size: 100,
          sort_by: 'created_at',
          sort_order: 'desc',
          search: q,
        })
        if (!cancelled) setOptions(list)
      } catch {
        if (!cancelled) setOptions([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [debouncedSearch])

  const comboValue = useMemo((): CatalogueAttribute | string | null => {
    if (attributeId != null && attributeName.trim() !== '') {
      return { id: attributeId, name: attributeName, description: '' }
    }
    if (attributeName.trim() !== '') return attributeName
    return null
  }, [attributeId, attributeName])

  return (
    <Autocomplete<CatalogueAttribute | string, false, false, true>
      freeSolo
      disabled={disabled}
      options={options}
      filterOptions={(x) => x}
      getOptionLabel={(o) => (typeof o === 'string' ? o : o.name)}
      isOptionEqualToValue={(a, b) => {
        if (typeof a === 'string' || typeof b === 'string') return a === b
        return a.id === b.id
      }}
      value={comboValue}
      inputValue={inputValue}
      onInputChange={(_, v) => setInputValue(v)}
      onChange={(_, v) => {
        if (typeof v === 'string') {
          onCommit(v, null)
          setInputValue(v)
        } else if (v && typeof v !== 'string') {
          onCommit(v.name, v.id)
          setInputValue(v.name)
        } else {
          onCommit('', null)
          setInputValue('')
        }
      }}
      onBlur={() => {
        const trimmed = inputValue.trim()
        const matched = options.find((a) => a.name.trim().toLowerCase() === trimmed.toLowerCase())
        if (matched) onCommit(matched.name, matched.id)
        else onCommit(trimmed, null)
        onBlurSide?.()
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          margin="none"
          fullWidth
          label="Attribute"
          required
          autoComplete="off"
          placeholder="Search or type a new attribute"
          helperText=" "
          slotProps={{
            ...params.slotProps,
            formHelperText: {
              sx: { minHeight: '1.25rem', m: 0 },
            },
          }}
        />
      )}
    />
  )
}

export type VariantFilterAttributesSectionHandle = {
  getRows: () => VariantFilterAttributeFormRow[]
  getInitialSnapshot: () => ReadonlyMap<number, VariantFilterAttributeInitialSnapshot>
  reload: () => Promise<void>
  /** Refetch maps for a variant (e.g. after create or a partial save) so row `mapId`s match the server. */
  hydrateFromVariant: (variantId: string) => Promise<void>
  validate: () => Promise<boolean>
}

export type VariantFilterAttributesSectionProps = {
  mode: 'edit' | 'create'
  productId: string
  /** Edit: route variant id. Create: omit until the variant exists. */
  variantId?: string
  /** After a variant is created, use its id so filters can load and save independently. */
  persistedVariantId?: string | null
  disabled?: boolean
  /** Called after a successful standalone filter save (e.g. refetch variant detail). */
  onFiltersSaved?: () => void
}

export const VariantFilterAttributesSection = forwardRef<
  VariantFilterAttributesSectionHandle,
  VariantFilterAttributesSectionProps
>(function VariantFilterAttributesSection(
  {
    mode,
    productId,
    variantId,
    persistedVariantId = null,
    disabled = false,
    onFiltersSaved,
  },
  ref,
) {
  const initialSnapshotRef = useRef(new Map<number, VariantFilterAttributeInitialSnapshot>())
  const resolvedVariantId = useMemo(() => {
    if (mode === 'edit') {
      const v = variantId?.trim()
      return v && v.length > 0 ? v : undefined
    }
    const v = persistedVariantId?.trim()
    return v && v.length > 0 ? v : undefined
  }, [mode, variantId, persistedVariantId])

  const [mapsLoading, setMapsLoading] = useState(false)
  const [filterSavePending, setFilterSavePending] = useState(false)
  const [filterSaveError, setFilterSaveError] = useState<string | null>(null)

  const { control, reset, getValues, trigger } = useForm<FilterFormValues>({
    defaultValues: { filterRows: [] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'filterRows' })

  const applyMaps = useCallback((maps: ProductVariantAttributeMapDto[]) => {
    const rows = rowsFromMaps(maps)
    initialSnapshotRef.current = snapshotFromRows(rows)
    reset({ filterRows: rows.length > 0 ? rows : [] })
  }, [reset])

  const reload = useCallback(async () => {
    if (!productId || !resolvedVariantId) {
      initialSnapshotRef.current = new Map()
      reset({ filterRows: [] })
      return
    }
    setMapsLoading(true)
    try {
      const maps = await fetchProductVariantAttributeMaps(productId, resolvedVariantId)
      applyMaps(maps)
    } finally {
      setMapsLoading(false)
    }
  }, [applyMaps, productId, resolvedVariantId, reset])

  const hydrateFromVariant = useCallback(
    async (vid: string) => {
      if (!productId) return
      setMapsLoading(true)
      try {
        const maps = await fetchProductVariantAttributeMaps(productId, vid)
        applyMaps(maps)
      } finally {
        setMapsLoading(false)
      }
    },
    [applyMaps, productId],
  )

  useEffect(() => {
    if (!productId || !resolvedVariantId) {
      setMapsLoading(false)
      initialSnapshotRef.current = new Map()
      reset({ filterRows: [] })
      return
    }
    let cancelled = false
    setMapsLoading(true)
    void (async () => {
      try {
        const maps = await fetchProductVariantAttributeMaps(productId, resolvedVariantId)
        if (cancelled) return
        applyMaps(maps)
      } finally {
        if (!cancelled) setMapsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [productId, resolvedVariantId, applyMaps, reset])

  const handleSaveFilters = useCallback(async () => {
    if (!productId || !resolvedVariantId) return
    const ok = await trigger('filterRows')
    if (!ok) return
    setFilterSaveError(null)
    setFilterSavePending(true)
    try {
      const rows = getValues('filterRows') ?? []
      await syncVariantFilterAttributes(
        productId,
        resolvedVariantId,
        rows,
        initialSnapshotRef.current,
      )
      await hydrateFromVariant(resolvedVariantId)
      onFiltersSaved?.()
    } catch (e: unknown) {
      try {
        await hydrateFromVariant(resolvedVariantId)
      } catch {
        // ignore
      }
      setFilterSaveError(
        e instanceof Error ? e.message : 'Could not save filter attributes',
      )
    } finally {
      setFilterSavePending(false)
    }
  }, [getValues, hydrateFromVariant, onFiltersSaved, productId, resolvedVariantId, trigger])

  useEffect(() => {
    setFilterSaveError(null)
  }, [resolvedVariantId])

  useImperativeHandle(
    ref,
    () => ({
      getRows: () => getValues('filterRows') ?? [],
      getInitialSnapshot: () => initialSnapshotRef.current,
      reload,
      hydrateFromVariant,
      validate: () => trigger('filterRows'),
    }),
    [getValues, hydrateFromVariant, reload, trigger],
  )

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 4,
        p: { xs: 2.5, sm: 3.5 },
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
        Filter attributes
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 720 }}>
        Search catalogue attributes or type a new name. When this variant exists on the server, use{' '}
        <strong>Save filter attributes</strong> to persist catalogue mappings (independent of the
        main variant form save).
      </Typography>

      {mapsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} color="primary" />
        </Box>
      ) : (
        <Stack spacing={2}>
          {fields.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No filter attributes yet. Add a row to link this variant to catalogue filters.
            </Typography>
          ) : null}
          {fields.map((row, index) => (
            <Grid container spacing={1.5} key={row.id} sx={{ alignItems: 'flex-start' }}>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <Controller
                    name={`filterRows.${index}.attributeName`}
                    control={control}
                    rules={{
                      validate: (v) => {
                        const rows = getValues('filterRows') ?? []
                        const row = rows[index]
                        const name = String(v ?? '').trim()
                        const val = String(row?.value ?? '').trim()
                        if (!name && !val) return true
                        if (!name && val) return 'Attribute is required'
                        return true
                      },
                    }}
                    render={({ field: nameField, fieldState }) => (
                      <Controller
                        name={`filterRows.${index}.attributeId`}
                        control={control}
                        render={({ field: idField }) => (
                          <Box>
                            <AttributeSearchAutocomplete
                              disabled={disabled || filterSavePending}
                              attributeName={nameField.value}
                              attributeId={idField.value}
                              onCommit={(name, id) => {
                                nameField.onChange(name)
                                idField.onChange(id)
                              }}
                              onBlurSide={nameField.onBlur}
                            />
                            {fieldState.error?.message ? (
                              <Typography variant="caption" color="error" sx={{ display: 'block' }}>
                                {fieldState.error.message}
                              </Typography>
                            ) : null}
                          </Box>
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <Controller
                    name={`filterRows.${index}.value`}
                    control={control}
                    rules={{
                      validate: (v) => {
                        const rows = getValues('filterRows') ?? []
                        const row = rows[index]
                        const name = String(row?.attributeName ?? '').trim()
                        const val = String(v ?? '').trim()
                        if (!name && !val) return true
                        if (name && !val) return 'Value is required'
                        return true
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        margin="none"
                        fullWidth
                        label="Value"
                        autoComplete="off"
                        disabled={disabled || filterSavePending}
                        error={Boolean(fieldState.error)}
                        helperText={fieldState.error?.message ?? ' '}
                        slotProps={{
                          formHelperText: { sx: { minHeight: '1.25rem', m: 0 } },
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }} sx={{ pt: { sm: 0.5 } }}>
                  <IconButton
                    aria-label="Remove filter attribute row"
                    onClick={() => remove(index)}
                    disabled={disabled || filterSavePending}
                    size="small"
                  >
                    <DeleteOutlined />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
          <Box>
            <Button
              type="button"
              variant="outlined"
              size="small"
              startIcon={<AddOutlined />}
              onClick={() => append(emptyVariantFilterAttributeRow())}
              disabled={disabled || filterSavePending}
              sx={{ textTransform: 'none' }}
            >
              Add filter attribute
            </Button>
          </Box>
          {resolvedVariantId ? (
            <Stack spacing={1.5} sx={{ pt: 0.5 }}>
              <ErrorAlert error={filterSaveError} />
              <Box>
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  onClick={() => void handleSaveFilters()}
                  disabled={disabled || filterSavePending || mapsLoading}
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    boxShadow: 'none',
                    textTransform: 'none',
                  }}
                >
                  {filterSavePending ? 'Saving…' : 'Save filter attributes'}
                </Button>
              </Box>
            </Stack>
          ) : null}
        </Stack>
      )}
    </Paper>
  )
})
