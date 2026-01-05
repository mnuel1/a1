import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LoadingProvider } from './context/useLoading.jsx'
import { AuthProvider } from './context/useAuth.jsx'
import { ModalProvider } from "./context/useModal";
import { StatusShipmentProvider } from './context/useStatusShipment.jsx'
import { SettingsProvider } from './context/useSettings.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LoadingProvider>
      <ModalProvider>
        <AuthProvider>
          <SettingsProvider>
            <StatusShipmentProvider>
              <App />
            </StatusShipmentProvider>
          </SettingsProvider>
        </AuthProvider>
      </ModalProvider>
    </LoadingProvider>
  </StrictMode>,
)
