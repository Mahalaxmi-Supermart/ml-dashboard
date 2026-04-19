import AddOutlined from '@mui/icons-material/AddOutlined'
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
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
import { fetchListRequest as fetchCategoriesListRequest } from '../../redux/reducers/categoriesSlice'
import { fetchPageRequest } from '../../redux/reducers/productsSlice'
import type { ProductListQuery, ProductRow } from './productsTypes'

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatPriceDisplay(row: ProductRow): string {
  const vs = row.variants
  if (!vs?.length) return formatPrice(row.price)
  const prices = vs.map((v) => v.price)
  const mn = Math.min(...prices)
  const mx = Math.max(...prices)
  return mn === mx ? formatPrice(mn) : `${formatPrice(mn)} – ${formatPrice(mx)}`
}

function stockRatio(row: ProductRow): number {
  if (row.stockMax <= 0) return 0
  return Math.min(1, row.stockCount / row.stockMax)
}

function stockLabel(row: ProductRow): string {
  if (row.stockCount <= 0) return 'out of stock'
  if (stockRatio(row) < 0.2) return `${row.stockCount} low stock`
  return `${row.stockCount} in stock`
}

function categoryLabelFromRow(
  row: ProductRow,
  categoryById: Map<number, string>,
): string {
  const fromMap =
    row.category_id != null ? categoryById.get(row.category_id) : undefined
  const fallback =
    row.category.trim() !== '' && row.category !== '—' ? row.category.trim() : ''
  return (fromMap ?? fallback) || '—'
}

type RowActionMenu =
  | { el: HTMLElement; kind: 'parent'; productId: string }
  | { el: HTMLElement; kind: 'variant'; productId: string; variantApiId: string }

export function ProductsPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { pending, data: rows, error } = useAppSelector((s) => s.products.productsList)
  const {
    pending: countPending,
    data: totalCount,
    error: countError,
  } = useAppSelector((s) => s.products.productsCount)
  const lastQuery = useAppSelector((s) => s.products.lastQuery)
  const categories = useAppSelector((s) => s.categories.categoriesList.data)

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [menuAnchor, setMenuAnchor] = useState<RowActionMenu | null>(null)
  const [expandedIds, setExpandedIds] = useState(() => new Set<string>())

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 400)
    return () => window.clearTimeout(t)
  }, [searchInput])

  const listQuery = useMemo((): ProductListQuery => {
    const search =
      debouncedSearch.length === 0
        ? null
        : debouncedSearch.length >= 3
          ? debouncedSearch
          : null
    return {
      page_no: page + 1,
      page_size: rowsPerPage,
      sort_by: 'created_at',
      sort_order: 'desc',
      status: null,
      search,
      ids: null,
      category_id: null,
      filters: null,
    }
  }, [page, rowsPerPage, debouncedSearch])

  useEffect(() => {
    dispatch(fetchPageRequest(listQuery))
  }, [dispatch, listQuery])

  useEffect(() => {
    dispatch(fetchCategoriesListRequest())
  }, [dispatch])

  const categoryById = useMemo(() => {
    const m = new Map<number, string>()
    for (const c of categories) {
      m.set(c.id, c.name)
    }
    return m
  }, [categories])

  useEffect(() => {
    setExpandedIds(new Set())
  }, [page, rowsPerPage, debouncedSearch])

  const searchApplied = Boolean(listQuery.search)
  const visibleRows = rows

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const totalLabel =
    countPending && totalCount === 0 ? '…' : `${totalCount.toLocaleString()} total`

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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
            Products List
          </Typography>
          <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.secondary', mb: 0.5 }}>
            <Link component={RouterLink} to="/products" underline="hover" color="inherit">
              Dashboard
            </Link>
            <Link component={RouterLink} to="/products" underline="hover" color="inherit">
              Products
            </Link>
          </Breadcrumbs>
          <Typography variant="body2" color="text.secondary">
            {totalLabel}
            {countError ? ' — count unavailable' : null}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddOutlined />}
          sx={{ px: 2.5 }}
          component={RouterLink}
          to="/products/new"
        >
          Add product
        </Button>
      </Box>

      <ErrorAlert error={error} sx={{ mb: 1 }} />
      <ErrorAlert error={countError} sx={{ mb: 2 }} />
      {error && !pending ? (
        <Button
          variant="outlined"
          onClick={() => dispatch(fetchPageRequest(lastQuery))}
          sx={{ mb: 2 }}
        >
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
                <TableCell>Product</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell>Publish</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pending && visibleRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <CircularProgress color="primary" size={36} />
                  </TableCell>
                </TableRow>
              ) : visibleRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      {searchApplied ? 'No results for this search.' : 'No products yet.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.flatMap((row) => {
                  const variantList = row.variants
                  const hasVariants = Boolean(variantList && variantList.length > 0)
                  const expanded = expandedIds.has(row.id)
                  const placeholderImg =
                    'data:image/svg+xml,' +
                    encodeURIComponent(
                      `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" rx="8" fill="#e8ebe9"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#21622A" font-size="10" font-family="sans-serif">IMG</text></svg>`,
                    )

                  const renderCells = (
                    r: ProductRow,
                    opts: { isVariant?: boolean; parentProductId?: string },
                  ) => {
                    const isVariant = Boolean(opts.isVariant)
                    const parentProductId = opts.parentProductId
                    return (
                      <>
                        <TableCell
                          sx={
                            isVariant
                              ? {
                                pl: 4,
                                borderLeft: (t) => `3px solid ${t.palette.divider}`,
                              }
                              : undefined
                          }
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {!isVariant ? (
                              <Box
                                sx={{
                                  width: 36,
                                  flexShrink: 0,
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                              >
                                {hasVariants ? (
                                  <IconButton
                                    size="small"
                                    aria-expanded={expanded}
                                    aria-label={
                                      expanded ? 'Collapse variants' : 'Expand variants'
                                    }
                                    onClick={() => toggleExpand(row.id)}
                                    sx={{ p: 0.25 }}
                                  >
                                    {expanded ? (
                                      <KeyboardArrowDown fontSize="small" />
                                    ) : (
                                      <KeyboardArrowRight fontSize="small" />
                                    )}
                                  </IconButton>
                                ) : null}
                              </Box>
                            ) : (
                              <Box sx={{ width: 36, flexShrink: 0 }} />
                            )}
                            <Box
                              component="img"
                              src={r.imageUrl ?? placeholderImg}
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
                                {isVariant ? (r.displayName?.trim() || r.name) : r.name}
                                {hasVariants && !isVariant ? (
                                  <Typography
                                    component="span"
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontWeight: 400, ml: 0.75 }}
                                  >
                                    ({variantList!.length} variants)
                                  </Typography>
                                ) : null}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {`Brand: ${r.brand.trim() || '—'} | Category: ${categoryLabelFromRow(r, categoryById)}`}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {r.sku}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ minWidth: 120 }}>
                          <Typography variant="body2" color="text.secondary">
                            {stockLabel(r)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {isVariant ? formatPrice(r.price) : formatPriceDisplay(r)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={r.publishStatus === 'published' ? 'Published' : 'Draft'}
                            sx={
                              r.publishStatus === 'published'
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
                            onClick={(e) => {
                              const el = e.currentTarget
                              if (isVariant && parentProductId) {
                                const variantApiId =
                                  r.variantApiId ??
                                  (() => {
                                    const parts = r.id.split('-')
                                    return parts.length > 1 ? parts.slice(1).join('-') : r.id
                                  })()
                                setMenuAnchor({
                                  el,
                                  kind: 'variant',
                                  productId: parentProductId,
                                  variantApiId,
                                })
                              } else {
                                setMenuAnchor({ el, kind: 'parent', productId: r.id })
                              }
                            }}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </>
                    )
                  }

                  const parentRow = (
                    <TableRow key={row.id} hover>
                      {renderCells(row, { parentProductId: row.id })}
                    </TableRow>
                  )

                  if (!hasVariants || !expanded) {
                    return [parentRow]
                  }

                  const variantRows = variantList!.map((vr) => (
                    <TableRow
                      key={vr.id}
                      hover
                      sx={{ bgcolor: 'grey.50', '& > td': { borderTop: 'none' } }}
                    >
                      {renderCells(vr, { isVariant: true, parentProductId: row.id })}
                    </TableRow>
                  ))

                  return [parentRow, ...variantRows]
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          rowsPerPageOptions={[5, 10, 25]}
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Menu
        anchorEl={menuAnchor?.el}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {menuAnchor?.kind === 'parent' ? (
          <MenuItem
            onClick={() => {
              navigate(`/products/${menuAnchor.productId}/variants/new`)
              setMenuAnchor(null)
            }}
            sx={{ fontSize: '0.875rem', minWidth: 160 }}
          >
            Add variant
          </MenuItem>
        ) : null}
        <MenuItem
          onClick={() => {
            const m = menuAnchor
            if (!m) {
              return
            }
            if (m.kind === 'parent') {
              navigate(`/products/${m.productId}/edit`)
            } else {
              navigate(`/products/${m.productId}/variants/${m.variantApiId}/edit`)
            }
            setMenuAnchor(null)
          }}
          sx={{ fontSize: '0.875rem' }}
        >
          Edit
        </MenuItem>
      </Menu>
    </Box>
  )
}
