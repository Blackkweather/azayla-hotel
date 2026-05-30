import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AdminPage from './pages/admin/AdminPage.jsx'
import BookingSuccess from './pages/BookingSuccess.jsx'
import { LanguageProvider } from './context/LanguageContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Booking confirmation page — standalone, after Stripe redirect */}
        <Route path="/booking-success" element={<BookingSuccess />} />

        {/* Admin portal — JWT protected, role verified client + server (RLS) */}
        <Route path="/admin" element={<AdminPage />} />

        {/* Main hotel website — all other paths */}
        <Route
          path="/*"
          element={
            <LanguageProvider>
              <App />
            </LanguageProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
