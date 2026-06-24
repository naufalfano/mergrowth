import { Navigate, Route, Routes } from "react-router-dom";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import DashboardPage from "@/pages/DashboardPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProductPage from "@/pages/ProductPage";
import ProductCreatePage from "@/pages/ProductCreatePage";
import ProductEditPage from "@/pages/ProductEditPage";
import DemandForecastPage from "@/pages/DemandForecastPage";
import MarketEntryPage from "@/pages/MarketEntryPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" replace />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <ProductPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/create"
        element={
          <ProtectedRoute>
            <ProductCreatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/edit/:id"
        element={
          <ProtectedRoute>
            <ProductEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/demand-forecasting"
        element={
          <ProtectedRoute>
            <DemandForecastPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/market-entry"
        element={
          <ProtectedRoute>
            <MarketEntryPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
