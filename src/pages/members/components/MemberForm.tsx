import { useMemo } from 'react'
import PersonAddOutlined from '@mui/icons-material/PersonAddOutlined'
import {
  Box,
  Button,
  Card,
  Grid,
  TextField,
  Typography,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { Link as RouterLink } from 'react-router-dom'
import { type MemberFormValues, defaultMemberFormValues } from '../membersTypes'

interface MemberFormProps {
  heroTitle: string
  heroDescription: string
  initialValues?: MemberFormValues
  onSubmit: (values: Partial<MemberFormValues>) => void
  loading?: boolean
  cancelTo?: string
}

const FORM_ID = 'member-upsert-form'

export function MemberForm({
  heroTitle,
  heroDescription,
  initialValues,
  onSubmit,
  loading,
  cancelTo = '/invites',
}: MemberFormProps) {
  const processedInitialValues = useMemo(() => {
    return initialValues || defaultMemberFormValues
  }, [initialValues])

  const {
    control,
    handleSubmit,
    formState: { dirtyFields },
  } = useForm<MemberFormValues>({
    defaultValues: processedInitialValues,
  })

  const onInternalSubmit = (data: MemberFormValues) => {
    if (initialValues) {
      const changedData: any = {}
      for (const key in dirtyFields) {
        if (Object.prototype.hasOwnProperty.call(dirtyFields, key)) {
          changedData[key] = (data as any)[key]
        }
      }
      onSubmit(changedData as Partial<MemberFormValues>)
    } else {
      onSubmit(data)
    }
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={{ xs: 3, md: 4 }} sx={{ alignItems: 'flex-start' }}>
        <Grid size={{ xs: 12, md: 4 }} sx={{ maxWidth: { md: 360 }, flexShrink: 0 }}>
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
          <PersonAddOutlined
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
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="first_name"
                    control={control}
                    rules={{ required: 'First name is required' }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="First Name"
                        fullWidth
                        required
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="last_name"
                    control={control}
                    rules={{ required: 'Last name is required' }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Last Name"
                        fullWidth
                        required
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="email_id"
                    control={control}
                    rules={{
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Email Address"
                        fullWidth
                        required
                        error={!!error}
                        helperText={error?.message}
                        disabled={!!initialValues}
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
                {loading ? 'Processing...' : initialValues ? 'Update Delivery Partner' : 'Invite Delivery Partner'}
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
