import { useEffect, useMemo, useState } from 'react'
import MoreVert from '@mui/icons-material/MoreVert'
import { Breadcrumbs, Card, Link, Stack, Typography, IconButton, Menu, MenuItem } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { DataTable, type DataTableColumn } from '../../components/common/DataTable'
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks'
import { fetchPageRequest } from '../../redux/reducers/customersSlice'
import type { Customer } from './customersTypes'

export function CustomersPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { customersList, customersCount, lastQuery } = useAppSelector((state) => state.customers)

  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; customerId: number } | null>(null)

  useEffect(() => {
    dispatch(fetchPageRequest(lastQuery))
  }, [dispatch])

  const totalLabel =
    customersCount.pending && customersCount.data === 0
      ? '…'
      : `${customersCount.data.toLocaleString()} customers`

  const columns = useMemo<DataTableColumn<Customer>[]>(
    () => [
      {
        id: 'name',
        label: 'Name',
        width: 200,
        render: (row) => (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {row.name}
          </Typography>
        ),
      },
      {
        id: 'email_id',
        label: 'Email',
        width: 250,
        render: (row) => (
          <Typography
            variant="body2"
            sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {row.email_id}
          </Typography>
        ),
      },
      {
        id: 'phone_number',
        label: 'Phone',
        width: 150,
        render: (row) => <Typography variant="body2">{row.phone_number || '-'}</Typography>,
      },
      {
        id: 'status',
        label: 'Status',
        width: 120,
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
        id: 'created_at',
        label: 'Joined',
        width: 150,
        render: (row) => (
          <Typography variant="body2">
            {row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'}
          </Typography>
        ),
      },
      {
        id: 'actions',
        label: 'Action',
        align: 'right',
        width: 80,
        render: (row) => (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              setMenuAnchor({ el: e.currentTarget, customerId: row.id })
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
            Customers
          </Typography>
          <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.secondary' }}>
            <Link component={RouterLink} to="/" underline="hover" color="inherit">
              Dashboard
            </Link>
            <Typography color="text.primary">Customers</Typography>
          </Breadcrumbs>
          <Typography variant="body2" color="text.secondary">
            {totalLabel}
            {customersCount.error ? ' — count unavailable' : null}
          </Typography>
        </Stack>
      </Stack>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <DataTable
          columns={columns}
          rows={customersList.data}
          loading={customersList.pending || customersCount.pending}
          totalCount={customersCount.data}
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
              navigate(`/customers/${menuAnchor.customerId}`)
            }
            setMenuAnchor(null)
          }}
          sx={{ fontSize: '0.875rem', minWidth: 120 }}
        >
          View
        </MenuItem>
      </Menu>
    </Stack>
  )
}
