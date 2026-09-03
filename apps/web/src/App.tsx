import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom"

import LoginPage from "@/modules/auth/LoginPage"
import PostLoginPlaceholder from "@/modules/auth/PostLoginPlaceholder"

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/post-login" element={<PostLoginPlaceholder />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
