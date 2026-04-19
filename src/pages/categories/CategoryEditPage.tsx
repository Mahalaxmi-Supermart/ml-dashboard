import { Box, Breadcrumbs, Button, Link, Typography } from '@mui/material'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { ErrorAlert } from '../../components/common/ErrorAlert'
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks'
import {
  clearSelectedCategory,
  clearUpdateCategory,
  fetchCategoryRequest,
  fetchListRequest,
  updateCategoryRequest,
} from '../../redux/reducers/categoriesSlice'
import {
  categoryFormValuesToPayload,
  emptyCategoryFormValues,
  type CategoryFormValues,
} from './categoriesTypes'
import { CategoryUpsertForm } from './components/CategoryUpsertForm'

export function CategoryEditPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { categoryId } = useParams<{ categoryId: string }>()
  const id = Number(categoryId)
  const invalidId = !Number.isFinite(id) || id < 1

  const selected = useAppSelector((s) => s.categories.selectedCategory)
  const update = useAppSelector((s) => s.categories.updateCategory)

  const { control, handleSubmit, reset } = useForm<CategoryFormValues>({
    defaultValues: emptyCategoryFormValues,
  })

  useEffect(() => {
    if (invalidId) return
    dispatch(fetchCategoryRequest(id))
    return () => {
      dispatch(clearSelectedCategory())
      dispatch(clearUpdateCategory())
    }
  }, [dispatch, id, invalidId])

  useEffect(() => {
    const c = selected.data
    if (!c) return
    reset({
      name: c.name,
      description: c.description,
      display_order: String(c.display_order),
      image_url: c.image_url ?? '',
    })
  }, [selected.data, reset])

  useEffect(() => {
    if (update.data && !update.pending) {
      navigate('/categories', { replace: true })
      dispatch(clearUpdateCategory())
      dispatch(fetchListRequest())
    }
  }, [update.data, update.pending, navigate, dispatch])

  const onValid = (values: CategoryFormValues) => {
    if (invalidId) return
    dispatch(
      updateCategoryRequest({
        id,
        body: categoryFormValuesToPayload(values),
      }),
    )
  }

  if (invalidId) {
    return (
      <Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Edit category
        </Typography>
        <Typography color="error">Invalid category ID.</Typography>
        <Button component={RouterLink} to="/categories" variant="outlined" sx={{ mt: 2 }}>
          Back to list
        </Button>
      </Box>
    )
  }

  const showForm = Boolean(selected.data) && !selected.pending
  const showInitialLoad = selected.pending && !selected.data
  const showShell = showForm || showInitialLoad

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
        Edit category
      </Typography>
      <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.secondary', mb: 3 }}>
        <Link component={RouterLink} to="/products" underline="hover" color="inherit">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/categories" underline="hover" color="inherit">
          Categories
        </Link>
        <Typography color="text.primary">{categoryId}</Typography>
      </Breadcrumbs>

      <ErrorAlert error={selected.error} sx={{ mb: 2 }} />
      {selected.error && !selected.pending ? (
        <Button variant="outlined" onClick={() => dispatch(fetchCategoryRequest(id))} sx={{ mb: 2 }}>
          Retry
        </Button>
      ) : null}

      {showShell ? (
        <CategoryUpsertForm
          heroTitle="Category details"
          heroDescription="Update this category's name, description, display order, or image URL. Changes apply wherever this category is used."
          loading={showInitialLoad}
          control={control}
          onSubmit={handleSubmit(onValid)}
          pending={update.pending}
          error={update.error}
          submitLabel="Save changes"
          pendingLabel="Saving…"
        />
      ) : null}
    </Box>
  )
}
