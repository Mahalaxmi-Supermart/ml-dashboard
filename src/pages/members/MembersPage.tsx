import { useState, useEffect, useMemo } from 'react'
import MoreVert from '@mui/icons-material/MoreVert'
import { Breadcrumbs, Card, IconButton, Link, Menu, MenuItem, Stack, Typography } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { DataTable, type DataTableColumn } from '../../components/common/DataTable'
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks'
import { fetchPageRequest } from '../../redux/reducers/membersSlice'
import type { Member } from './membersTypes'

export function MembersPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { membersList, membersCount, lastQuery } = useAppSelector((state) => state.members)

  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; memberId: number } | null>(null)

  useEffect(() => {
    dispatch(fetchPageRequest(lastQuery))
  }, [dispatch])

  const totalLabel =
    membersCount.pending && membersCount.data === 0
      ? '…'
      : `${membersCount.data.toLocaleString()} total`

  const columns = useMemo<DataTableColumn<Member>[]>(
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
            {row.first_name} {row.last_name}
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
              setMenuAnchor({ el: e.currentTarget, memberId: row.id })
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
            Delivery Partners
          </Typography>
          <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.secondary' }}>
            <Link component={RouterLink} to="/" underline="hover" color="inherit">
              Dashboard
            </Link>
            <Link component={RouterLink} to="/members" underline="hover" color="inherit">
              Delivery Partners
            </Link>
          </Breadcrumbs>
          <Typography variant="body2" color="text.secondary">
            {totalLabel}
            {membersCount.error ? ' — count unavailable' : null}
          </Typography>
        </Stack>
      </Stack>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <DataTable
          columns={columns}
          rows={membersList.data}
          loading={membersList.pending || membersCount.pending}
          totalCount={membersCount.data}
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
              navigate(`/members/${menuAnchor.memberId}/edit`)
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
