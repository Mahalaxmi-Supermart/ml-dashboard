import AddOutlined from '@mui/icons-material/AddOutlined'
import MoreVert from '@mui/icons-material/MoreVert'
import SearchOutlined from '@mui/icons-material/SearchOutlined'
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  LinearProgress,
  Link,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import type { ChangeEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { ErrorAlert } from '../../components/common/ErrorAlert'
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks'
import { fetchListRequest } from '../../redux/reducers/categoriesSlice'
import type { Category } from './categoriesTypes'

function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}

const placeholderImg =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" rx="8" fill="#e8ebe9"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#21622A" font-size="10" font-family="sans-serif">IMG</text></svg>`,
  )

export function CategoriesPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { pending, data: rows, error } = useAppSelector((s) => s.categories.categoriesList)

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [menu, setMenu] = useState<{ el: HTMLElement; categoryId: number } | null>(null)

  useEffect(() => {
    dispatch(fetchListRequest())
  }, [dispatch])

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 400)
    return () => window.clearTimeout(t)
  }, [searchInput])

  const sortedAll: Category[] = useMemo(() => {
    return [...rows].sort((a, b) => {
      if (a.display_order !== b.display_order) return a.display_order - b.display_order
      return a.id - b.id
    })
  }, [rows])

  const searchApplied = debouncedSearch.length >= 3

  const filteredRows = useMemo(() => {
    if (debouncedSearch.length === 0) return sortedAll
    if (debouncedSearch.length < 3) return sortedAll
    const q = debouncedSearch.toLowerCase()
    return sortedAll.filter(
      (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q),
    )
  }, [sortedAll, debouncedSearch])

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage
    return filteredRows.slice(start, start + rowsPerPage)
  }, [filteredRows, page, rowsPerPage])

  const totalLabel =
    pending && rows.length === 0 ? '…' : `${filteredRows.length.toLocaleString()} total`

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredRows.length / rowsPerPage) - 1)
    if (page > maxPage) setPage(maxPage)
  }, [filteredRows.length, rowsPerPage, page])

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
            Categories List
          </Typography>
          <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.secondary', mb: 0.5 }}>
            <Link component={RouterLink} to="/products" underline="hover" color="inherit">
              Dashboard
            </Link>
            <Link component={RouterLink} to="/categories" underline="hover" color="inherit">
              Categories
            </Link>
          </Breadcrumbs>
          <Typography variant="body2" color="text.secondary">
            {totalLabel}
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/categories/new"
          variant="contained"
          color="primary"
          startIcon={<AddOutlined />}
          sx={{ px: 2.5 }}
        >
          Add category
        </Button>
      </Box>

      <ErrorAlert error={error} sx={{ mb: 1 }} />
      {error && !pending ? (
        <Button variant="outlined" onClick={() => dispatch(fetchListRequest())} sx={{ mb: 2 }}>
          Retry
        </Button>
      ) : null}

      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              setPage(0)
            }}
            placeholder="Search…"
            size="small"
            fullWidth
            helperText={
              searchInput.length > 0 && searchInput.length < 3
                ? 'Enter at least 3 characters to search the server.'
                : ' '
            }
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
              formHelperText: { sx: { minHeight: '1.25rem' } },
            }}
            sx={{ maxWidth: 420 }}
          />
        </Box>

        {pending ? <LinearProgress color="primary" sx={{ height: 3 }} /> : null}

        <TableContainer
          sx={{
            opacity: pending ? 0.55 : 1,
            transition: 'opacity 0.2s ease',
            pointerEvents: pending ? 'none' : 'auto',
          }}
        >
          <Table size="medium" sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Order</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pending && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <CircularProgress color="primary" size={36} />
                  </TableCell>
                </TableRow>
              ) : pagedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      {searchApplied ? 'No results for this search.' : 'No categories yet.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pagedRows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          component="img"
                          src={row.image_url && row.image_url !== 'string' ? row.image_url : placeholderImg}
                          alt=""
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            objectFit: 'cover',
                            bgcolor: 'grey.100',
                          }}
                        />
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {row.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 320 }}>
                      <Typography variant="body2" color="text.secondary" title={row.description}>
                        {row.description || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {row.display_order}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(row.updated_at)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.status === 1 ? 'Active' : 'Inactive'}
                        sx={
                          row.status === 1
                            ? {
                              bgcolor: 'primary.light',
                              color: '#ffffff',
                              fontWeight: 600,
                            }
                            : {
                              bgcolor: 'grey.200',
                              color: 'text.secondary',
                              fontWeight: 500,
                            }
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        aria-label="row actions"
                        size="small"
                        onClick={(e) =>
                          setMenu({ el: e.currentTarget, categoryId: row.id })
                        }
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          rowsPerPageOptions={[5, 10, 25]}
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Menu
        anchorEl={menu?.el}
        open={Boolean(menu)}
        onClose={() => setMenu(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            if (menu) navigate(`/categories/${menu.categoryId}/edit`)
            setMenu(null)
          }}
          sx={{ fontSize: '0.875rem' }}
        >
          Edit
        </MenuItem>
      </Menu>
    </Box>
  )
}
