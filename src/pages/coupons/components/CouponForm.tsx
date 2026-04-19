import { useMemo } from 'react'
import ConfirmationNumberOutlined from '@mui/icons-material/ConfirmationNumberOutlined'
import {
  Box,
  Button,
  Card,
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { Link as RouterLink } from 'react-router-dom'
import { type CouponFormValues, defaultCouponFormValues } from '../couponsTypes'

interface CouponFormProps {
  heroTitle: string
  heroDescription: string
  initialValues?: CouponFormValues
  onSubmit: (values: Partial<CouponFormValues>) => void
  loading?: boolean
  cancelTo?: string
}

const FORM_ID = 'coupon-upsert-form'

const formatForDateTimeLocal = (dateStr: string | null | undefined): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 16)
}

export function CouponForm({
  heroTitle,
  heroDescription,
  initialValues,
  onSubmit,
  loading,
  cancelTo = '/coupons',
}: CouponFormProps) {
  const processedInitialValues = useMemo(() => {
    if (!initialValues) return defaultCouponFormValues
    return {
      ...initialValues,
      valid_from: formatForDateTimeLocal(initialValues.valid_from),
      valid_till: formatForDateTimeLocal(initialValues.valid_till),
    }
  }, [initialValues])

  const {
    control,
    handleSubmit,
    formState: { dirtyFields },
  } = useForm<CouponFormValues>({
    defaultValues: processedInitialValues,
  })

  const onInternalSubmit = (data: CouponFormValues) => {
    if (initialValues) {
      const changedData: any = {}
      for (const key in dirtyFields) {
        if (Object.prototype.hasOwnProperty.call(dirtyFields, key)) {
          changedData[key] = (data as any)[key]
        }
      }

      onSubmit(changedData as Partial<CouponFormValues>)
    } else {
      onSubmit(data)
    }
  }

  return (
    <Box sx={{ width: '100%' }}>
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
            sx={{ fontWeight: 800, mb: 1.5, color: 'text.primary', letterSpacing: '-0.01em' }}
          >
            {heroTitle}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, lineHeight: 1.7, maxWidth: 320, fontSize: '0.9rem' }}
          >
            {heroDescription}
          </Typography>
          <ConfirmationNumberOutlined
            sx={{ fontSize: 40, color: 'action.disabled', opacity: 0.3 }}
            aria-hidden
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }} sx={{ minWidth: 0, flex: 1 }}>
          <Card
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 4,
              bgcolor: 'background.paper',
            }}
          >
            <Box component="form" id={FORM_ID} onSubmit={handleSubmit(onInternalSubmit)} noValidate>
              <Grid container spacing={3}>
                {/* Row 1: Code, Name, Description */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="code"
                    control={control}
                    rules={{ required: 'Code is required' }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Coupon Code"
                        fullWidth
                        required
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Name is required' }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Name"
                        fullWidth
                        required
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Description" fullWidth multiline rows={3} />
                    )}
                  />
                </Grid>

                {/* Row 2: Discount Rules */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="discount_type"
                    control={control}
                    rules={{ required: 'Discount type is required' }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        select
                        label="Discount Type"
                        fullWidth
                        required
                        error={!!error}
                        helperText={error?.message}
                      >
                        <MenuItem value="PERCENTAGE">Percentage</MenuItem>
                        <MenuItem value="FLAT">Flat Amount</MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="discount_value"
                    control={control}
                    rules={{
                      required: 'Discount value is required',
                      validate: (v) => Number(v) > 0 || 'Value must be greater than 0',
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Discount Value"
                        fullWidth
                        type="number"
                        required
                        error={!!error}
                        helperText={error?.message}
                        slotProps={{ htmlInput: { min: 1 } }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="min_cart_value"
                    control={control}
                    rules={{
                      required: 'Min cart value is required',
                      validate: (v) => Number(v) > 0 || 'Value must be greater than 0',
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Min Cart Value"
                        fullWidth
                        type="number"
                        required
                        error={!!error}
                        helperText={error?.message}
                        slotProps={{ htmlInput: { min: 1 } }}
                      />
                    )}
                  />
                </Grid>

                {/* Row 3: Usage Limits */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="max_discount_amount"
                    control={control}
                    rules={{
                      required: 'Max discount amount is required',
                      validate: (v) => Number(v) > 0 || 'Value must be greater than 0',
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Max Discount Amount"
                        fullWidth
                        type="number"
                        required
                        error={!!error}
                        helperText={error?.message}
                        slotProps={{ htmlInput: { min: 1 } }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="max_uses"
                    control={control}
                    rules={{
                      required: 'Max uses is required',
                      validate: (v) => Number(v) > 0 || 'Value must be greater than 0',
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        type="number"
                        label="Max Total Uses"
                        fullWidth
                        required
                        error={!!error}
                        helperText={error?.message}
                        slotProps={{ htmlInput: { min: 1 } }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="max_uses_per_customer"
                    control={control}
                    rules={{
                      required: 'Max uses per customer is required',
                      validate: (v) => Number(v) > 0 || 'Value must be greater than 0',
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        type="number"
                        label="Max Uses Per Customer"
                        fullWidth
                        required
                        error={!!error}
                        helperText={error?.message}
                        slotProps={{ htmlInput: { min: 1 } }}
                      />
                    )}
                  />
                </Grid>

                {/* Row 4: Validity & Status */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="valid_from"
                    control={control}
                    rules={{ required: 'Valid from date is required' }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        type="datetime-local"
                        label="Valid From"
                        fullWidth
                        required
                        error={!!error}
                        helperText={error?.message}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="valid_till"
                    control={control}
                    rules={{ required: 'Valid till date is required' }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        type="datetime-local"
                        label="Valid Till"
                        fullWidth
                        required
                        error={!!error}
                        helperText={error?.message}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        labelPlacement="start"
                        control={
                          <Switch
                            checked={field.value === 1}
                            onChange={(_, v) => field.onChange(v ? 1 : 0)}
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Coupon active
                          </Typography>
                        }
                        sx={{ ml: 0, gap: 1 }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
                mt: 4,
              }}
            >
              <Button
                component={RouterLink}
                to={cancelTo}
                variant="contained"
                sx={{
                  px: 3.5,
                  py: 1.25,
                  color: 'text.primary',
                  bgcolor: 'grey.200',
                  borderRadius: 6,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: 'grey.300', boxShadow: 'none' },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form={FORM_ID}
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{
                  px: 4,
                  py: 1.25,
                  borderRadius: 6,
                  boxShadow: 'none',
                  '&:hover': { boxShadow: 'none' },
                }}
              >
                {loading ? 'Saving...' : 'Save Coupon'}
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
