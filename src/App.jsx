import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { Layout, AuthLayout } from './layout/layout'

import Login from "./pages/login";
import Manifest from "./pages/manifest";
import Report from "./pages/report";
import NotFound from "./pages/notfound";

function AppRouter() {
  return (
    <Router>      
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthLayout />} >
          <Route index element={<Login />} />
      </Route>


        <Route path="/a1" element={<Layout />} >
          <Route index element={<Navigate to="manifest" replace />} />
          <Route path="manifest" element={<Manifest />} />
          <Route path="report" element={<Report />} />
          {/* <Route path="/users" element={<Users />} />
          <Route path="/account" element={<Account />} /> */}
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

function App () {
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Define default options
          className: '',
          duration: 5000,
          removeDelay: 1000,
          style: {
            background: '#363636',
            color: '#fff',
          },

          // Default options for specific types
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
