import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  type SelectChangeEvent,
} from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { ErrorAlert } from '../../../components/common/ErrorAlert'
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxHooks'
import { adjustVariantInventoryRequest } from '../../../redux/reducers/productsSlice'
import type { VariantInventoryAdjustmentType } from '../productsTypes'

function formatQty(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(n)
}

export type VariantInventoryAdjustmentSectionProps = {
  productId: string
  variantId: string
}

export function VariantInventoryAdjustmentSection({
  productId,
  variantId,
}: VariantInventoryAdjustmentSectionProps) {
  const dispatch = useAppDispatch()
  const adjust = useAppSelector((s) => s.products.adjustVariantInventory)
  const availableQuantity = useAppSelector(
    (s) => s.products.selectedVariant.data?.quantity_available ?? 0,
  )

  const [direction, setDirection] = useState<VariantInventoryAdjustmentType>('ADJUSTMENT_IN')
  const [unitsRaw, setUnitsRaw] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const prevAdjustPending = useRef(false)
  useEffect(() => {
    if (prevAdjustPending.current && !adjust.pending && !adjust.error) {
      setUnitsRaw('')
      setLocalError(null)
    }
    prevAdjustPending.current = adjust.pending
  }, [adjust.pending, adjust.error])

  const onDirectionChange = (e: SelectChangeEvent<VariantInventoryAdjustmentType>) => {
    setDirection(e.target.value as VariantInventoryAdjustmentType)
  }

  const apply = () => {
    setLocalError(null)
    const n = Number.parseInt(unitsRaw.trim(), 10)
    if (Number.isNaN(n) || n < 1) {
      setLocalError('Enter a whole number of units (1 or more).')
      return
    }
    if (direction === 'ADJUSTMENT_OUT' && n > availableQuantity) {
      setLocalError(
        `You cannot remove more than available stock (${formatQty(availableQuantity)} units).`,
      )
      return
    }
    dispatch(
      adjustVariantInventoryRequest({
        productId,
        variantId,
        body: { type: direction, quantity: n },
      }),
    )
  }

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
        Stock adjustment
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Available quantity:{' '}
        <Typography component="span" variant="body1" sx={{ fontWeight: 700 }}>
          {formatQty(availableQuantity)} units
        </Typography>
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ lineHeight: 1.65 }}>
          Choose whether you are adding or removing units, enter how many, then apply.
        </Typography>
      </Alert>

      <ErrorAlert error={adjust.error} sx={{ mb: 2 }} />
      <ErrorAlert error={localError} sx={{ mb: 2 }} />

      <Stack direction="column" spacing={3} sx={{ width: '100%' }}>
        <Stack direction="row" spacing={3} sx={{ width: '100%' }}>
          <FormControl sx={{ width: 260 }} disabled={adjust.pending}>
            <InputLabel id="stock-adjust-type-label">Operation</InputLabel>
            <Select<VariantInventoryAdjustmentType>
              labelId="stock-adjust-type-label"
              id="stock-adjust-type"
              value={direction}
              label="Operation"
              onChange={onDirectionChange}
            >
              <MenuItem value="ADJUSTMENT_IN">Add stock</MenuItem>
              <MenuItem value="ADJUSTMENT_OUT">Remove stock</MenuItem>
            </Select>
          </FormControl>

          <TextField
            margin="none"
            fullWidth
            label="Quantity"
            type="number"
            autoComplete="off"
            placeholder={direction === 'ADJUSTMENT_IN' ? '100' : '10'}
            value={unitsRaw}
            onChange={(e) => setUnitsRaw(e.target.value)}
            disabled={adjust.pending}
            slotProps={{
              htmlInput: { min: 1, step: 1 },
            }}
          />

        </Stack>
        <Box>
          <Button
            variant="contained"
            color="primary"
            disabled={adjust.pending}
            onClick={apply}
            sx={{ px: 3, py: 1, borderRadius: 2, boxShadow: 'none', textTransform: 'none' }}
          >
            {adjust.pending ? 'Applying…' : 'Apply adjustment'}
          </Button>
        </Box>
      </Stack>
    </Paper>
  )
}
