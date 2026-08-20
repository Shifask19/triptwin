import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TripStoreProvider } from './store/useTripStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { Login }    from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard }          from './pages/Dashboard';
import { Itinerary }          from './pages/Itinerary';
import { TripSwapPage }       from './pages/TripSwapPage';
import { TravelTwin }         from './pages/TravelTwin';
import { TouristTrapDetector } from './pages/TouristTrapDetector';
import { SmartSearch }        from './pages/SmartSearch';
import { WhatNow }            from './pages/WhatNow';
import { BudgetTracker }      from './pages/BudgetTracker';
import { TravelMemory }       from './pages/TravelMemory';
import { Destinations }       from './pages/Destinations';

function AppShell() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 pl-16 lg:pl-56">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <Routes>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/itinerary"     element={<Itinerary />} />
            <Route path="/tripswap"      element={<TripSwapPage />} />
            <Route path="/travel-twin"   element={<TravelTwin />} />
            <Route path="/trap-detector" element={<TouristTrapDetector />} />
            <Route path="/search"        element={<SmartSearch />} />
            <Route path="/now"           element={<WhatNow />} />
            <Route path="/budget"        element={<BudgetTracker />} />
            <Route path="/memory"        element={<TravelMemory />} />
            <Route path="/destinations"  element={<Destinations />} />
            <Route path="*"             element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected app routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <TripStoreProvider>
                  <AppShell />
                </TripStoreProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
