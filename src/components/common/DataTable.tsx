import {
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'

export interface DataTableColumn<T> {
  id: string
  label: string
  align?: 'left' | 'right' | 'center'
  render?: (row: T) => ReactNode
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  loading?: boolean
  totalCount?: number
  page?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  onRowClick?: (row: T) => void
}

export function DataTable<T extends { id: string | number }>({
  columns,
  rows,
  loading,
  totalCount = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {loading && <LinearProgress sx={{ height: 3 }} />}
      <TableContainer sx={{ minHeight: 400 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  sx={{ bgcolor: 'grey.50', fontWeight: 600 }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">No data available.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => onRowClick?.(row)}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align}>
                      {column.render ? column.render(row) : (row as any)[column.id]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount}
        page={page - 1}
        rowsPerPage={pageSize}
        onPageChange={(_, newPage) => onPageChange?.(newPage + 1)}
        onRowsPerPageChange={(e) => onPageSizeChange?.(Number.parseInt(e.target.value, 10))}
      />
    </Paper>
  )
}
