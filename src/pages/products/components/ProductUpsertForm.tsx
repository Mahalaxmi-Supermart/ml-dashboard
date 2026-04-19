import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined'
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import type { ReactNode, SubmitEventHandler } from 'react'
import type { Control } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { Link as RouterLink } from 'react-router-dom'
import type { Category } from '../../categories/categoriesTypes'
import { ErrorAlert } from '../../../components/common/ErrorAlert'
import type { ProductFormValues } from '../productsTypes'

const FORM_ID = 'product-upsert-form'

export type ProductUpsertFormProps = {
  heroTitle: string
  heroDescription: string
  loading?: boolean
  categories: Category[]
  categoriesLoading?: boolean
  control: Control<ProductFormValues>
  onSubmit: SubmitEventHandler<HTMLFormElement>
  pending: boolean
  error: string | null
  submitLabel: string
  pendingLabel: string
  cancelTo?: string
  /** Extra fields rendered inside the form card (e.g. image upload). */
  additionalFields?: ReactNode
}

export function ProductUpsertForm({
  heroTitle,
  heroDescription,
  loading = false,
  categories,
  categoriesLoading = false,
  control,
  onSubmit,
  pending,
  error,
  submitLabel,
  pendingLabel,
  cancelTo = '/products',
  additionalFields,
}: ProductUpsertFormProps) {
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
          <Inventory2Outlined
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
                <ErrorAlert error={error} sx={{ mb: 2 }} />
                <Box component="form" id={FORM_ID} onSubmit={onSubmit} noValidate>
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12 }}>
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
                            autoFocus
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
                            minRows={3}
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
                        name="category_id"
                        control={control}
                        rules={{ required: 'Category is required' }}
                        render={({ field, fieldState }) => (
                          <FormControl
                            fullWidth
                            required
                            error={Boolean(fieldState.error)}
                            disabled={categoriesLoading}
                          >
                            <InputLabel id="product-category-label">Category</InputLabel>
                            <Select
                              {...field}
                              labelId="product-category-label"
                              label="Category"
                              value={field.value}
                              onChange={field.onChange}
                            >
                              {categories.map((c) => (
                                <MenuItem key={c.id} value={String(c.id)}>
                                  {c.name}
                                </MenuItem>
                              ))}
                            </Select>
                            <FormHelperText sx={{ minHeight: '1.25rem', m: 0 }}>
                              {fieldState.error?.message ?? ' '}
                            </FormHelperText>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="brand"
                        control={control}
                        rules={{ required: 'Brand is required' }}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            margin="none"
                            fullWidth
                            label="Brand"
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
                    <Grid size={{ xs: 12 }}>
                      <Controller
                        name="enabled"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Switch
                                checked={field.value}
                                onChange={(_, v) => field.onChange(v)}
                                color="primary"
                              />
                            }
                            label="Product enabled (published)"
                          />
                        )}
                      />
                    </Grid>
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
            disabled={pending || categoriesLoading}
            sx={{ px: 3, py: 1, borderRadius: 2, boxShadow: 'none' }}
          >
            {pending ? pendingLabel : submitLabel}
          </Button>
        </Box>
      ) : null}
    </Box>
  )
}
