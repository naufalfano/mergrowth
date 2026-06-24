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
import MarketEntryHubPage from "@/pages/MarketEntryHubPage";
import MarketEntryPage from "@/pages/MarketEntryPage";
import CorpusAnalysisPage from "@/pages/CorpusAnalysisPage";
import BrandAdvisorPage from "@/pages/BrandAdvisorPage";
import OnboardingPage from "@/pages/OnboardingPage";
import MarketingLayout from "@/pages/marketing/MarketingLayout";
import MarketingDashboardPage from "@/pages/marketing/MarketingDashboardPage";
import SalesPage from "@/pages/marketing/SalesPage";
import NettPage from "@/pages/marketing/NettPage";
import ProductInsightPage from "@/pages/marketing/ProductInsightPage";
import RecommendationPage from "@/pages/marketing/RecommendationPage";
import RestockRecommendationPage from "./pages/RestockRecommendationPage";
import PriceAnalysisPage from "./pages/PriceAnalysisPage";

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
        path="/marketing"
        element={
          <ProtectedRoute>
            <MarketingLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MarketingDashboardPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="nett" element={<NettPage />} />
        <Route path="product-insight" element={<ProductInsightPage />} />
        <Route path="recommendation" element={<RecommendationPage />} />
      </Route>
      <Route
        path="/market-entry"
        element={
          <ProtectedRoute>
            <MarketEntryHubPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/market-entry/gap"
        element={
          <ProtectedRoute>
            <MarketEntryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/market-entry/competitor-review"
        element={
          <ProtectedRoute>
            <CorpusAnalysisPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/market-entry/ai-advisor"
        element={
          <ProtectedRoute>
            <BrandAdvisorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/restock-recommendation"
        element={
          <ProtectedRoute>
            <RestockRecommendationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/price-analysis"
        element={
          <ProtectedRoute>
            <PriceAnalysisPage />
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
