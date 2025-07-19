import Card from "./components/Card"
import Navbar from "./components/Navbar"
import HomePage from "./pages/HomePage"
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { inject, track } from '@vercel/analytics'
import { useEffect } from 'react'

// Initialize analytics once
inject()

// Component to track page views on route change
function AnalyticsTracker() {
  const location = useLocation()

  useEffect(() => {
    track()
  }, [location.pathname])

  return null
}

function App() {
  return (
    <>
      <Navbar />
      <BrowserRouter>
        <AnalyticsTracker />
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
