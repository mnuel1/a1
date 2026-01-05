import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { Layout, AuthLayout } from './layout/layout'

import ProtectedRoute from "./protectedRoute";

import Login from "./pages/login";
import Manifest from "./pages/manifest";
import Database from "./pages/database";
import Report from "./pages/report";
import Staffs from "./pages/users";
import Account from "./pages/account"
import Settings from "./pages/settings";
import NotFound from "./pages/notfound";
import NoPermissionPage from "./pages/nopermission";



function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthLayout />} >
          <Route index element={<Login />} />t
        </Route>

        <Route path="/a1" element={<Layout />} >
          <Route index element={
            <ProtectedRoute page="manifest" action="view">
              <Navigate to="manifest" replace />
            </ProtectedRoute>
          } />
          <Route path="manifest" element={
            <ProtectedRoute page="manifest" action="view">
              <Manifest />
            </ProtectedRoute>
          } />
          <Route path="database" element={
            <ProtectedRoute page="database" action="view">
              <Database />
            </ProtectedRoute>
          } />
          <Route path="report" element={
            <ProtectedRoute page="report" action="view">
              <Report />
            </ProtectedRoute>
          } />
          <Route path="users" element={
            <ProtectedRoute page="users" action="view">
              <Staffs />
            </ProtectedRoute>
          } />
          <Route path="account" element={
            <ProtectedRoute page="account" action="view">
              <Account />
            </ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute page="settings" action="view">
              <Settings />
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
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          className: '',
          duration: 5000,
          removeDelay: 1000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
      <AppRouter />
    </>
  )
}
export default App;
