import React, { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Main from "./pages/Main";
import MyEvents from './pages/MyEvents';
import EventsPage from './pages/EventsPage';
import ConferencesPage from './pages/ConferencesPage';
import WorkShopsPage from './pages/WorkShopsPage';
import Error404 from './pages/Error404';
import TechPage from './pages/TechPage';
import ConcertsPage from './pages/ConcertsPage';
import MusicPage from './pages/MusicPage';
import HelpPage from './pages/HelpPage';
import FeedbackPage from './pages/FeedbackPage';
import ProfileA from './pages/ProfileA';
import ProfileSettings from './pages/ProfileSettings';
import AccountSettings from './pages/AccountSettings';
import { auth } from "./firebase";
import { onAuthStateChanged } from 'firebase/auth';
import EventDetails from './pages/EventDetails';

// A simple ProtectedRoute component
const ProtectedRoute = ({ user, children }) => {
  return user ? children : <Navigate to="/" />;  // Redirect to landing if not authenticated
};

// Define the routes with protection applied
const router = (user) => createBrowserRouter([
  {
    path: '/',
    element: <Landing />,  // No protection needed
  },
  {
    path: 'register',
    element: <Register />,  // No protection needed
  },
  {
    path: 'home',
    element: (
      <ProtectedRoute user={user}>
        <Main />
      </ProtectedRoute>
    ),
  },
  {
    path: 'my-events',
    element: (
      <ProtectedRoute user={user}>
        <MyEvents />
      </ProtectedRoute>
    ),
  },
  {
    path: 'events',
    element: (
      <ProtectedRoute user={user}>
        <EventsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'category/conferences',
    element: (
      <ProtectedRoute user={user}>
        <ConferencesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'category/workshops',
    element: (
      <ProtectedRoute user={user}>
        <WorkShopsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'category/tech',
    element: (
      <ProtectedRoute user={user}>
        <TechPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'category/concerts',
    element: (
      <ProtectedRoute user={user}>
        <ConcertsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'category/music',
    element: (
      <ProtectedRoute user={user}>
        <MusicPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'help-center',
    element: (
      <ProtectedRoute user={user}>
        <HelpPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'feedback',
    element: (
      <ProtectedRoute user={user}>
        <FeedbackPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'profile',
    element: (
      <ProtectedRoute user={user}>
        <ProfileA />
      </ProtectedRoute>
    ),
  },
  {
    path: 'profile-settings',
    element: (
      <ProtectedRoute user={user}>
        <ProfileSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: 'account-settings',
    element: (
      <ProtectedRoute user={user}>
        <AccountSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Error404 />  // No protection needed for 404 page
  },
  {
    path: "event/:eventID",
    element: <EventDetails />
  }
]);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (cuser) => {
      if (cuser) {
        // User signed in
        setUser(cuser);
      } else {
        // User logged out
        setUser(null);
      }
      setLoading(false); // stop loading after auth state is checked
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", width: "100vw", height: "100vh", alignItems: "center", justifyContent: "center" }}>
        <figure>
          <img src="/assets/logo.svg" alt="" />
        </figure>
        <h1 style={{ fontSize: "28px", marginLeft: "20px" }}>Loading...</h1>
      </div>
    )
  }

  return (
    <div className="app">
      <RouterProvider router={router(user)} />
    </div>
  );
}

export default App;
