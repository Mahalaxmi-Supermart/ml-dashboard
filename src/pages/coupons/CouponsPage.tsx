import { useState, useEffect, useMemo } from 'react'
import AddIcon from '@mui/icons-material/Add'
import MoreVert from '@mui/icons-material/MoreVert'
import { Breadcrumbs, Button, Card, IconButton, Link, Menu, MenuItem, Stack, Typography } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { DataTable, type DataTableColumn } from '../../components/common/DataTable'
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks'
import { fetchPageRequest } from '../../redux/reducers/couponsSlice'
import type { Coupon } from './couponsTypes'

export function CouponsPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { couponsList, couponsCount, lastQuery } = useAppSelector((state) => state.coupons)

  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; couponId: number } | null>(null)

  useEffect(() => {
    dispatch(fetchPageRequest(lastQuery))
  }, [dispatch, lastQuery])

  const totalLabel =
    couponsCount.pending && couponsCount.data === 0
      ? '…'
      : `${couponsCount.data.toLocaleString()} total`

  const columns = useMemo<DataTableColumn<Coupon>[]>(
    () => [
      {
        id: 'code',
        label: 'Code',
        render: (row) => (
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
            {row.code}
          </Typography>
        ),
      },
      {
        id: 'name',
        label: 'Name',
        render: (row) => row.name,
      },
      {
        id: 'discount_type',
        label: 'Type',
        render: (row) => (
          <Typography variant="body2">
            {row.discount_type === 'PERCENTAGE' ? 'Percentage' : 'Flat'}
          </Typography>
        ),
      },
      {
        id: 'discount_value',
        label: 'Value',
        render: (row) => (
          <Typography variant="body2">
            {row.discount_value} {row.discount_type === 'PERCENTAGE' ? '%' : ''}
          </Typography>
        ),
      },
      {
        id: 'validity',
        label: 'Validity',
        render: (row) => (
          <Typography variant="caption" color="text.secondary">
            {new Date(row.valid_from).toLocaleDateString()} -{' '}
            {new Date(row.valid_till).toLocaleDateString()}
          </Typography>
        ),
      },
      {
        id: 'uses',
        label: 'Uses',
        render: (row) => (
          <Typography variant="body2">
            {row.max_uses === 0 ? 'Unlimited' : row.max_uses}
          </Typography>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        render: (row) => (
          <Typography
            variant="caption"
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor: row.status === 1 ? 'success.light' : 'grey.200',
              color: row.status === 1 ? 'success.dark' : 'grey.700',
              fontWeight: 600,
            }}
          >
            {row.status === 1 ? 'Active' : 'Inactive'}
          </Typography>
        ),
      },
      {
        id: 'actions',
        label: 'Action',
        align: 'right',
        render: (row) => (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              setMenuAnchor({ el: e.currentTarget, couponId: row.id })
            }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        ),
      },
    ],
    [],
  )

  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Stack spacing={0.5}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Coupons List
          </Typography>
          <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.secondary' }}>
            <Link component={RouterLink} to="/products" underline="hover" color="inherit">
              Dashboard
            </Link>
            <Link component={RouterLink} to="/coupons" underline="hover" color="inherit">
              Coupons
            </Link>
          </Breadcrumbs>
          <Typography variant="body2" color="text.secondary">
            {totalLabel}
            {couponsCount.error ? ' — count unavailable' : null}
          </Typography>
        </Stack>
        <Button
          component={RouterLink}
          to="/coupons/new"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2, px: 2.5 }}
        >
          Add Coupon
        </Button>
      </Stack>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <DataTable
          columns={columns}
          rows={couponsList.data}
          loading={couponsList.pending || couponsCount.pending}
          totalCount={couponsCount.data}
          page={lastQuery.page_no}
          pageSize={lastQuery.page_size}
          onPageChange={(page) => dispatch(fetchPageRequest({ ...lastQuery, page_no: page }))}
          onPageSizeChange={(size) =>
            dispatch(fetchPageRequest({ ...lastQuery, page_size: size, page_no: 1 }))
          }
        />
      </Card>

      <Menu
        anchorEl={menuAnchor?.el}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            if (menuAnchor) {
              navigate(`/coupons/${menuAnchor.couponId}/edit`)
            }
            setMenuAnchor(null)
          }}
          sx={{ fontSize: '0.875rem', minWidth: 120 }}
        >
          Edit
        </MenuItem>
      </Menu>
    </Stack>
  )
}
