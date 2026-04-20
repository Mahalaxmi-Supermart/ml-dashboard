import { useState, useEffect, useMemo } from 'react'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import MoreVert from '@mui/icons-material/MoreVert'
import { Breadcrumbs, Button, Card, IconButton, Link, Menu, MenuItem, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { DataTable, type DataTableColumn } from '../../components/common/DataTable'
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks'
import { fetchInvitesRequest, deleteInviteRequest } from '../../redux/reducers/invitesSlice'
import type { Invite } from './invitesTypes'

export function InvitesPage() {
  const dispatch = useAppDispatch()
  const { invitesList, invitesCount, lastQuery } = useAppSelector((state) => state.invites)

  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; inviteId: number } | null>(null)

  useEffect(() => {
    dispatch(fetchInvitesRequest(lastQuery))
  }, [dispatch])

  const totalLabel =
    invitesCount.pending && invitesCount.data === 0
      ? '…'
      : `${invitesCount.data.toLocaleString()} pending invites`

  const columns = useMemo<DataTableColumn<Invite>[]>(
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
        render: () => (
          <Typography
            variant="caption"
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor: 'warning.light',
              color: 'warning.dark',
              fontWeight: 600,
            }}
          >
            Pending
          </Typography>
        ),
      },
      {
        id: 'created_at',
        label: 'Invited On',
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
              setMenuAnchor({ el: e.currentTarget, inviteId: row.id })
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
            Invites
          </Typography>
          <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.secondary' }}>
            <Link component={RouterLink} to="/" underline="hover" color="inherit">
              Dashboard
            </Link>
            <Link component={RouterLink} to="/members" underline="hover" color="inherit">
              Delivery Partners
            </Link>
            <Typography color="text.primary">Invites</Typography>
          </Breadcrumbs>
          <Typography variant="body2" color="text.secondary">
            {totalLabel}
            {invitesCount.error ? ' — count unavailable' : null}
          </Typography>
        </Stack>
        <Button
          component={RouterLink}
          to="/members/new"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2, px: 2.5 }}
        >
          Invite Delivery Partner
        </Button>
      </Stack>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <DataTable
          columns={columns}
          rows={invitesList.data}
          loading={invitesList.pending || invitesCount.pending}
          totalCount={invitesCount.data}
          page={lastQuery.page_no}
          pageSize={lastQuery.page_size}
          onPageChange={(page) => dispatch(fetchInvitesRequest({ ...lastQuery, page_no: page }))}
          onPageSizeChange={(size) =>
            dispatch(fetchInvitesRequest({ ...lastQuery, page_size: size, page_no: 1 }))
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
            if (menuAnchor && window.confirm('Are you sure you want to delete this invite?')) {
              dispatch(deleteInviteRequest(menuAnchor.inviteId))
            }
            setMenuAnchor(null)
          }}
          sx={{ fontSize: '0.875rem', color: 'error.main', minWidth: 120 }}
        >
          <DeleteOutlined fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Stack>
  )
}
