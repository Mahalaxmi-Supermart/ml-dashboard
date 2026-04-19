import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import EditOutlined from '@mui/icons-material/EditOutlined'
import AddOutlined from '@mui/icons-material/AddOutlined'
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { ErrorAlert } from '../../../components/common/ErrorAlert'
import type { ProductVariantSummary } from '../productsTypes'

function formatPriceInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount)
}

type ProductVariantsSectionProps = {
  productId: string
  variants: ProductVariantSummary[]
  deleteError: string | null
  deletePending: boolean
  onDeleteRequest: (variantId: string) => void
}

export function ProductVariantsSection({
  productId,
  variants,
  deleteError,
  deletePending,
  onDeleteRequest,
}: ProductVariantsSectionProps) {
  return (
    <Box sx={{ mt: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
        }}
      >
        <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
          Variants
        </Typography>
        <Button
          component={RouterLink}
          to={`/products/${productId}/variants/new`}
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<AddOutlined />}
        >
          Add variant
        </Button>
      </Box>

      <ErrorAlert error={deleteError} sx={{ mb: 2 }} />

      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table size="medium" sx={{ minWidth: 560 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>Variant</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {variants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No variants yet.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                variants.map((v) => (
                  <TableRow key={v.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {v.displayName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {v.sku}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{formatPriceInr(v.price)}</TableCell>
                    <TableCell align="right">{v.stockCount}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit variant">
                        <IconButton
                          component={RouterLink}
                          to={`/products/${productId}/variants/${v.id}/edit`}
                          size="small"
                          aria-label="Edit variant"
                          disabled={deletePending}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete variant">
                        <IconButton
                          size="small"
                          aria-label="Delete variant"
                          disabled={deletePending}
                          onClick={() => onDeleteRequest(v.id)}
                          color="error"
                        >
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}
