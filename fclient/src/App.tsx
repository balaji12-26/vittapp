import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { initializeStorage } from './api/mockData';

// Pages
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import EventDetails from './pages/EventDetails';
import BookingConfirmation from './pages/BookingConfirmation';
import AttendeeDashboard from './pages/AttendeeDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import CreateEvent from './pages/CreateEvent';

// Route Guards
const RequireAuth = ({ children, role }: { children: JSX.Element, role?: 'attendee' | 'organizer' }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="event/:id" element={<EventDetails />} />
        
        {/* Attendee Routes */}
        <Route 
          path="booking-confirmation/:id" 
          element={<RequireAuth role="attendee"><BookingConfirmation /></RequireAuth>} 
        />
        <Route 
          path="attendee/dashboard" 
          element={<RequireAuth role="attendee"><AttendeeDashboard /></RequireAuth>} 
        />
        
        {/* Organizer Routes */}
        <Route 
          path="organizer/dashboard" 
          element={<RequireAuth role="organizer"><OrganizerDashboard /></RequireAuth>} 
        />
        <Route 
          path="organizer/event/new" 
          element={<RequireAuth role="organizer"><CreateEvent /></RequireAuth>} 
        />
      </Route>
    </Routes>
  );
};

function App() {
  useEffect(() => {
    initializeStorage();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
