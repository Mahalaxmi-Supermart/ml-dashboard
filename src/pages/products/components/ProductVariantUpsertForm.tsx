import AddOutlined from '@mui/icons-material/AddOutlined'
import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import TuneOutlined from '@mui/icons-material/TuneOutlined'
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import type { ReactNode, SubmitEventHandler } from 'react'
import type { Control } from 'react-hook-form'
import { Controller, useFieldArray, useWatch } from 'react-hook-form'
import { Link as RouterLink } from 'react-router-dom'
import { ErrorAlert } from '../../../components/common/ErrorAlert'
import type { ProductVariantFormValues } from '../productsTypes'

const FORM_ID = 'product-variant-upsert-form'

export type ProductVariantUpsertFormProps = {
  heroTitle: string
  heroDescription: string
  loading?: boolean
  /** When false (edit variant), initial stock is managed via inventory adjustment instead. */
  showQuantityField?: boolean
  control: Control<ProductVariantFormValues>
  onSubmit: SubmitEventHandler<HTMLFormElement>
  pending: boolean
  error: string | null
  submitLabel: string
  pendingLabel: string
  cancelTo: string
  additionalFields?: ReactNode
}

export function ProductVariantUpsertForm({
  heroTitle,
  heroDescription,
  loading = false,
  showQuantityField = true,
  control,
  onSubmit,
  pending,
  error,
  submitLabel,
  pendingLabel,
  cancelTo,
  additionalFields,
}: ProductVariantUpsertFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'attributes',
  })
  const cartLimitEnabled = useWatch({ control, name: 'cart_allowed_quantity_enabled' })

  return (
    <Box>
      <Grid container spacing={{ xs: 3, md: 4 }} sx={{ alignItems: 'flex-start' }}>
        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{
            maxWidth: { md: 360 },
            flexShrink: 0,
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}
          >
            {heroTitle}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, lineHeight: 1.65, maxWidth: 340 }}
          >
            {heroDescription}
          </Typography>
          <TuneOutlined
            sx={{ fontSize: 44, color: 'action.disabled', opacity: 0.45 }}
            aria-hidden
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }} sx={{ minWidth: 0, flex: 1 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              border: 1,
              borderColor: 'divider',
              borderRadius: 3,
              bgcolor: 'background.paper',
            }}
          >
            {loading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 280,
                }}
              >
                <CircularProgress color="primary" size={40} />
              </Box>
            ) : (
              <>
                {/* <Alert severity="info" sx={{ mb: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75 }}>
                    Field examples (match your catalogue style)
                  </Typography>
                  <Typography variant="body2" component="div" sx={{ lineHeight: 1.6 }}>
                    <strong>Name</strong> — full variant title (e.g. &quot;Aashirvad Aata&quot;).
                    <br />
                    <strong>Display name</strong> — short label shoppers see for this pack size
                    (e.g. &quot;20 Kg&quot;).
                    <br />
                    <strong>SKU / barcode</strong> — unique codes, often the same for retail scan
                    (e.g. &quot;111-2&quot;).
                    <br />
                    <strong>Attributes</strong> — optional specs shown as key/value (e.g. weight →
                    &quot;20 kg&quot;).
                    <br />
                    <strong>Unit</strong> — measurement name and numeric amount (e.g. Kg + 20).
                    <br />
                    <strong>Prices</strong> — cost vs selling in account currency (e.g. 200 / 202).
                    <br />
                    <strong>Cart limit</strong> — optional; turn on to cap units per cart (e.g. 5).
                    Turn off to omit this rule from the request. <strong>Quantity</strong> is stock on
                    hand (e.g. 150).
                  </Typography>
                </Alert> */}

                <ErrorAlert error={error} sx={{ mb: 2 }} />

                <Box component="form" id={FORM_ID} onSubmit={onSubmit} noValidate>
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="name"
                        control={control}
                        rules={{ required: 'Name is required' }}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            margin="none"
                            fullWidth
                            label="Name"
                            required
                            autoComplete="off"
                            error={Boolean(fieldState.error)}
                            helperText={fieldState.error?.message ?? ' '}
                            slotProps={{
                              formHelperText: { sx: { minHeight: '1.25rem', m: 0 } },
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="display_name"
                        control={control}
                        rules={{ required: 'Display name is required' }}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            margin="none"
                            fullWidth
                            label="Display name"
                            required
                            autoComplete="off"
                            placeholder="20 Kg"
                            error={Boolean(fieldState.error)}
                            helperText={fieldState.error?.message ?? ' '}
                            slotProps={{
                              formHelperText: { sx: { minHeight: '1.25rem', m: 0 } },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Controller
                        name="description"
                        control={control}
                        rules={{ required: 'Description is required' }}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            margin="none"
                            fullWidth
                            label="Description"
                            multiline
                            minRows={2}
                            required
                            autoComplete="off"
                            error={Boolean(fieldState.error)}
                            helperText={fieldState.error?.message ?? ' '}
                            slotProps={{
                              formHelperText: { sx: { minHeight: '1.25rem', m: 0 } },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="sku"
                        control={control}
                        rules={{ required: 'SKU is required' }}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            margin="none"
                            fullWidth
                            label="SKU"
                            required
                            autoComplete="off"
                            placeholder="111-2"
                            error={Boolean(fieldState.error)}
                            helperText={fieldState.error?.message ?? ' '}
                            slotProps={{
                              formHelperText: { sx: { minHeight: '1.25rem', m: 0 } },
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="barcode"
                        control={control}
                        rules={{ required: 'Barcode is required' }}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            margin="none"
                            fullWidth
                            label="Barcode"
                            required
                            autoComplete="off"
                            placeholder="111-2"
                            error={Boolean(fieldState.error)}
                            helperText={fieldState.error?.message ?? ' '}
                            slotProps={{
                              formHelperText: { sx: { minHeight: '1.25rem', m: 0 } },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Attributes (optional)
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        Add any number of key/value rows. Keys must be non-empty to be saved. Example:
                        key <code>weight</code>, value <code>20 kg</code>.
                      </Typography>
                      {fields.map((row, index) => (
                        <Grid
                          container
                          spacing={1.5}
                          key={row.id}
                          sx={{ alignItems: 'flex-start' }}
                        >
                          <Grid size={{ xs: 12, sm: 5 }}>
                            <Controller
                              name={`attributes.${index}.key`}
                              control={control}
                              render={({ field, fieldState }) => (
                                <TextField
                                  {...field}
                                  margin="none"
                                  fullWidth
                                  label="Key"
                                  autoComplete="off"
                                  placeholder="weight"
                                  error={Boolean(fieldState.error)}
                                  helperText={fieldState.error?.message ?? ' '}
                                  slotProps={{
                                    formHelperText: { sx: { minHeight: '1.25rem', m: 0 } },
                                  }}
                                />
                              )}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 5 }}>
                            <Controller
                              name={`attributes.${index}.value`}
                              control={control}
                              render={({ field, fieldState }) => (
                                <TextField
                                  {...field}
                                  margin="none"
                                  fullWidth
                                  label="Value"
                                  autoComplete="off"
                                  placeholder="20 kg"
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
                              aria-label="Remove attribute row"
                              onClick={() => remove(index)}
                              disabled={fields.length <= 1 || pending}
                              size="small"
                            >
                              <DeleteOutlined />
                            </IconButton>
                          </Grid>
                        </Grid>
                      ))}
                      <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        startIcon={<AddOutlined />}
                        onClick={() => append({ key: '', value: '' })}
                        disabled={pending}
                        sx={{ textTransform: 'none', mb: 3 }}
                      >
                        Add attribute
                      </Button>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="unit_number"
                        control={control}
                        rules={{
                          required: 'Unit number is required',
                          validate: (v) =>
                            typeof v === 'number' &&
                              !Number.isNaN(v) &&
                              v >= 0 &&
                              Number.isFinite(v)
                              ? true
                              : 'Enter zero or a positive number',
                        }}
                        render={({ field, fieldState }) => (
                          <TextField
                            margin="none"
                            fullWidth
                            label="Unit number"
                            type="number"
                            required
                            autoComplete="off"
                            placeholder="20"
                            value={field.value}
                            onChange={(e) => {
                              const x = e.target.value
                              field.onChange(x === '' ? 0 : Number(x))
                            }}
                            error={Boolean(fieldState.error)}
                            helperText={fieldState.error?.message ?? ' '}
                            slotProps={{
                              htmlInput: { min: 0, step: 'any' },
                              formHelperText: { sx: { minHeight: '1.25rem', m: 0 } },
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="unit_of_measurement"
                        control={control}
                        rules={{ required: 'Unit of measurement is required' }}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            margin="none"
                            fullWidth
                            label="Unit of measurement"
                            required
                            autoComplete="off"
                            placeholder="Kg"
                            error={Boolean(fieldState.error)}
                            helperText={fieldState.error?.message ?? ' '}
                            slotProps={{
                              formHelperText: { sx: { minHeight: '1.25rem', m: 0 } },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="cost_price"
                        control={control}
                        rules={{
                          required: 'Cost price is required',
                          validate: (v) =>
                            typeof v === 'number' && !Number.isNaN(v) && v >= 0
                              ? true
                              : 'Enter a valid amount',
                        }}
                        render={({ field, fieldState }) => (
                          <TextField
                            margin="none"
                            fullWidth
                            label="Cost price"
                            type="number"
                            required
                            autoComplete="off"
                            placeholder="200"
                            value={field.value}
                            onChange={(e) => {
                              const x = e.target.value
                              field.onChange(x === '' ? 0 : Number(x))
                            }}
                            error={Boolean(fieldState.error)}
                            helperText={fieldState.error?.message ?? ' '}
                            slotProps={{
                              htmlInput: { min: 0, step: 0.01 },
                              formHelperText: { sx: { minHeight: '1.25rem', m: 0 } },
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="selling_price"
                        control={control}
                        rules={{
                          required: 'Selling price is required',
                          validate: (v) =>
                            typeof v === 'number' && !Number.isNaN(v) && v >= 0
                              ? true
                              : 'Enter a valid amount',
                        }}
                        render={({ field, fieldState }) => (
                          <TextField
                            margin="none"
                            fullWidth
                            label="Selling price"
                            type="number"
                            required
                            autoComplete="off"
                            placeholder="202"
                            value={field.value}
                            onChange={(e) => {
                              const x = e.target.value
                              field.onChange(x === '' ? 0 : Number(x))
                            }}
                            error={Boolean(fieldState.error)}
                            helperText={fieldState.error?.message ?? ' '}
                            slotProps={{
                              htmlInput: { min: 0, step: 0.01 },
                              formHelperText: { sx: { minHeight: '1.25rem', m: 0 } },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { sm: 'flex-start' },
                          gap: { xs: 1, sm: 2 },
                        }}
                      >
                        <Controller
                          name="cart_allowed_quantity_enabled"
                          control={control}
                          render={({ field }) => (
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={field.value}
                                  onChange={(_, v) => field.onChange(v)}
                                  color="primary"
                                  slotProps={{
                                    input: {
                                      'aria-label': 'Limit quantity allowed in cart',
                                    },
                                  }}
                                />
                              }
                              label=""
                              sx={{
                                mr: 0,
                                mt: { sm: 1 },
                                alignSelf: { sm: 'flex-start' },
                              }}
                            />
                          )}
                        />
                        <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                          <Controller
                            name="cart_allowed_quantity"
                            control={control}
                            rules={{
                              validate: (v) => {
                                if (!cartLimitEnabled) return true
                                return typeof v === 'number' &&
                                  !Number.isNaN(v) &&
                                  Number.isInteger(v) &&
                                  v >= 1
                                  ? true
                                  : 'Enter a whole number ≥ 1'
                              },
                            }}
                            render={({ field, fieldState }) => (
                              <TextField
                                margin="none"
                                fullWidth
                                label="Cart allowed quantity"
                                type="number"
                                required={Boolean(cartLimitEnabled)}
                                disabled={!cartLimitEnabled}
                                autoComplete="off"
                                placeholder="5"
                                value={field.value}
                                onChange={(e) => {
                                  const x = e.target.value
                                  field.onChange(x === '' ? 0 : Number.parseInt(x, 10) || 0)
                                }}
                                error={Boolean(fieldState.error)}
                                helperText={
                                  fieldState.error?.message ??
                                  (!cartLimitEnabled
                                    ? 'Toggle on to enforce a maximum units per cart.'
                                    : ' ')
                                }
                                slotProps={{
                                  htmlInput: {
                                    min: 1,
                                    step: 1,
                                  },
                                  formHelperText: {
                                    sx: {
                                      minHeight: '1.25rem',
                                      m: 0,
                                    },
                                  },
                                }}
                              />
                            )}
                          />
                        </Box>
                      </Box>
                    </Grid>
                    {showQuantityField ? (
                      <Grid size={{ xs: 12 }}>
                        <Controller
                          name="quantity"
                          control={control}
                          rules={{
                            required: 'Quantity is required',
                            validate: (v) =>
                              typeof v === 'number' &&
                                !Number.isNaN(v) &&
                                v >= 0 &&
                                Number.isFinite(v)
                                ? true
                                : 'Enter zero or a positive number',
                          }}
                          render={({ field, fieldState }) => (
                            <TextField
                              margin="none"
                              fullWidth
                              label="Quantity (stock)"
                              type="number"
                              required
                              autoComplete="off"
                              placeholder="150"
                              value={field.value}
                              onChange={(e) => {
                                const x = e.target.value
                                field.onChange(x === '' ? 0 : Number(x))
                              }}
                              error={Boolean(fieldState.error)}
                              helperText={fieldState.error?.message ?? ' '}
                              slotProps={{
                                htmlInput: { min: 0, step: 1 },
                                formHelperText: { sx: { minHeight: '1.25rem', m: 0 } },
                              }}
                            />
                          )}
                        />
                      </Grid>
                    ) : null}

                    {additionalFields}
                  </Grid>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {!loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
            mt: 3,
          }}
        >
          <Button
            component={RouterLink}
            to={cancelTo}
            variant="text"
            color="inherit"
            sx={{
              px: 2,
              py: 1,
              color: 'text.secondary',
              bgcolor: 'grey.200',
              borderRadius: 2,
              '&:hover': { bgcolor: 'grey.300' },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            variant="contained"
            color="primary"
            disabled={pending}
            sx={{ px: 3, py: 1, borderRadius: 2, boxShadow: 'none' }}
          >
            {pending ? pendingLabel : submitLabel}
          </Button>
        </Box>
      ) : null}
    </Box>
  )
}
