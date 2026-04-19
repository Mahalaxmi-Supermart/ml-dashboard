import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { CategoriesPage } from '../pages/categories/CategoriesPage'
import { CategoryEditPage } from '../pages/categories/CategoryEditPage'
import { CategoryNewPage } from '../pages/categories/CategoryNewPage'
import { OrdersPage } from '../pages/orders/OrdersPage'
import { CouponsPage } from '../pages/coupons/CouponsPage'
import { CouponNewPage } from '../pages/coupons/CouponNewPage'
import { CouponEditPage } from '../pages/coupons/CouponEditPage'
import { ProductEditPage } from '../pages/products/ProductEditPage'
import { ProductNewPage } from '../pages/products/ProductNewPage'
import { ProductVariantEditPage } from '../pages/products/ProductVariantEditPage'
import { ProductVariantNewPage } from '../pages/products/ProductVariantNewPage'
import { ProductsPage } from '../pages/products/ProductsPage'
import { LoginPage } from '../pages/login/LoginPage'
import { PrivateRoute } from './PrivateRoute'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="products" replace />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductNewPage />} />
        <Route path="products/:productId/edit" element={<ProductEditPage />} />
        <Route path="products/:productId/variants/new" element={<ProductVariantNewPage />} />
        <Route
          path="products/:productId/variants/:variantId/edit"
          element={<ProductVariantEditPage />}
        />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="categories/new" element={<CategoryNewPage />} />
        <Route path="categories/:categoryId/edit" element={<CategoryEditPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="coupons" element={<CouponsPage />} />
        <Route path="coupons/new" element={<CouponNewPage />} />
        <Route path="coupons/:id/edit" element={<CouponEditPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
