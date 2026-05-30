import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AdminPage from './pages/admin/AdminPage.jsx'
import { LanguageProvider } from './context/LanguageContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Main hotel website — all non-admin paths */}
        <Route
          path="/*"
          element={
            <LanguageProvider>
              <App />
            </LanguageProvider>
          }
        />

        {/* Admin portal — JWT protected, role verified client + server (RLS) */}
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
