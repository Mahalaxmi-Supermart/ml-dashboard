import { Box, Breadcrumbs, Link, Typography } from '@mui/material'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks'
import {
  clearCreateCategory,
  createCategoryRequest,
  fetchListRequest,
} from '../../redux/reducers/categoriesSlice'
import {
  categoryFormValuesToPayload,
  emptyCategoryFormValues,
  type CategoryFormValues,
} from './categoriesTypes'
import { CategoryUpsertForm } from './components/CategoryUpsertForm'

export function CategoryNewPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const create = useAppSelector((s) => s.categories.createCategory)

  const { control, handleSubmit } = useForm<CategoryFormValues>({
    defaultValues: emptyCategoryFormValues,
  })

  useEffect(() => {
    dispatch(clearCreateCategory())
  }, [dispatch])

  useEffect(() => {
    if (create.data && !create.pending) {
      navigate('/categories', { replace: true })
      dispatch(clearCreateCategory())
      dispatch(fetchListRequest())
    }
  }, [create.data, create.pending, navigate, dispatch])

  const onValid = (values: CategoryFormValues) => {
    dispatch(createCategoryRequest(categoryFormValuesToPayload(values)))
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
        Add category
      </Typography>
      <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.secondary', mb: 3 }}>
        <Link component={RouterLink} to="/products" underline="hover" color="inherit">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/categories" underline="hover" color="inherit">
          Categories
        </Link>
        <Typography color="text.primary">New</Typography>
      </Breadcrumbs>

      <CategoryUpsertForm
        heroTitle="New category"
        heroDescription="Create a category with a name, description, display order, and optional image URL. Categories help shoppers browse your catalogue."
        control={control}
        onSubmit={handleSubmit(onValid)}
        pending={create.pending}
        error={create.error}
        submitLabel="Create category"
        pendingLabel="Creating…"
      />
    </Box>
  )
}
