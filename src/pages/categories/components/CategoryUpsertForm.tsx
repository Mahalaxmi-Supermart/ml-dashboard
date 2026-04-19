import CategoryOutlined from '@mui/icons-material/CategoryOutlined'
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import type { FormEventHandler } from 'react'
import type { Control } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { Link as RouterLink } from 'react-router-dom'
import { ErrorAlert } from '../../../components/common/ErrorAlert'
import type { CategoryFormValues } from '../categoriesTypes'

const FORM_ID = 'category-upsert-form'

type CategoryUpsertFormProps = {
  heroTitle: string
  heroDescription: string
  /** When true, right panel shows a loader instead of fields (e.g. edit fetch). */
  loading?: boolean
  control: Control<CategoryFormValues>
  onSubmit: FormEventHandler<HTMLFormElement>
  pending: boolean
  error: string | null
  submitLabel: string
  pendingLabel: string
  cancelTo?: string
}

export function CategoryUpsertForm({
  heroTitle,
  heroDescription,
  loading = false,
  control,
  onSubmit,
  pending,
  error,
  submitLabel,
  pendingLabel,
  cancelTo = '/categories',
}: CategoryUpsertFormProps) {
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
          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
            {heroTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.65, maxWidth: 340 }}>
            {heroDescription}
          </Typography>
          <CategoryOutlined sx={{ fontSize: 44, color: 'action.disabled', opacity: 0.45 }} aria-hidden />
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
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280 }}>
                <CircularProgress color="primary" size={40} />
              </Box>
            ) : (
              <>
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
                            autoFocus
                            error={Boolean(fieldState.error)}
                            helperText={fieldState.error?.message ?? ' '}
                            slotProps={{ formHelperText: { sx: { minHeight: '1.25rem', m: 0 } } }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="display_order"
                        control={control}
                        rules={{
                          required: 'Display order is required',
                          validate: (v) => {
                            const n = Number.parseInt(v, 10)
                            return !Number.isNaN(n) && n >= 0
                              ? true
                              : 'Enter zero or a positive whole number'
                          },
                        }}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            margin="none"
                            fullWidth
                            label="Display order"
                            type="number"
                            required
                            autoComplete="off"
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
                    <Grid size={{ xs: 12 }}>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            margin="none"
                            fullWidth
                            label="Description"
                            multiline
                            minRows={3}
                            autoComplete="off"
                            error={Boolean(fieldState.error)}
                            helperText={fieldState.error?.message ?? ' '}
                            slotProps={{ formHelperText: { sx: { minHeight: '1.25rem', m: 0 } } }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Controller
                        name="image_url"
                        control={control}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            margin="none"
                            fullWidth
                            label="Image URL"
                            autoComplete="off"
                            error={Boolean(fieldState.error)}
                            helperText={fieldState.error?.message ?? ' '}
                            slotProps={{ formHelperText: { sx: { minHeight: '1.25rem', m: 0 } } }}
                          />
                        )}
                      />
                    </Grid>
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
