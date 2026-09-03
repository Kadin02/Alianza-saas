import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom"

import LoginPage from "@/modules/auth/LoginPage"
import OnboardingPage from "@/modules/organizations/OnboardingPage"
import OrgHomePlaceholder from "@/modules/organizations/OrgHomePlaceholder"
import SelectOrganizationPage from "@/modules/organizations/SelectOrganizationPage"
import PropertiesPage from "@/modules/properties/PropertiesPage"
import AppShell from "@/shared/layout/AppShell"

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/select-organization" element={<SelectOrganizationPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          <Route path="/app" element={<AppShell />}>
            <Route index element={<OrgHomePlaceholder />} />
            <Route path="properties" element={<PropertiesPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
