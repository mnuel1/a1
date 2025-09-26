import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LoadingProvider } from './context/useLoading.jsx'
import { AuthProvider } from './context/useAuth.jsx'
import { ModalProvider } from "./context/useModal";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LoadingProvider>
      <ModalProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ModalProvider>
    </LoadingProvider>
  </StrictMode>,
)
