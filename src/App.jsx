import { ToastProvider } from "./context/useToast";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { Layout, AuthLayout } from './layout/layout'

import ProtectedRoute from "./protectedRoute";

import Login from "./pages/login";
import Report from "./pages/report";


import NotFound from "./pages/notfound";
import NoPermissionPage from "./pages/nopermission";

import ManifestPage from "./pages/Manifest/manifest";
import DatabasePage from "./pages/Database/database";
import UsersPage from "./pages/Users/users";
import AccountPage from "./pages/Account/account";
function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthLayout />} >
          <Route index element={<Login />} />
        </Route>

        <Route path="/a1" element={<Layout />} >
          <Route index element={
            <ProtectedRoute page="manifest" action="view">
              <Navigate to="manifest" replace />
            </ProtectedRoute>
          } />
          <Route path="manifest" element={
            <ProtectedRoute page="manifest" action="view">
              <ManifestPage />
            </ProtectedRoute>
          } />
          <Route path="database" element={
            <ProtectedRoute page="database" action="view">
              <DatabasePage />
            </ProtectedRoute>
          } />
          <Route path="report" element={
            <ProtectedRoute page="report" action="view">
              <Report />
            </ProtectedRoute>
          } />
          <Route path="users" element={
            <ProtectedRoute page="users" action="view">
              <UsersPage />
            </ProtectedRoute>
          } />
          <Route path="account" element={
            <ProtectedRoute page="account" action="view">
              <AccountPage />
            </ProtectedRoute>
          } />
          <Route path="no-permission" element={<NoPermissionPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

function App() {
  const queryClient = new QueryClient()
  return (
    <>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <AppRouter />
        </QueryClientProvider>
      </ToastProvider>
    </>
  )
}
export default App;
