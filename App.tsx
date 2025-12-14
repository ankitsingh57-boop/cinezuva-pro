
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { MovieDetails } from './pages/MovieDetails';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { SearchPage } from './pages/SearchPage';
import { CategoryPage } from './pages/CategoryPage';
import { GenrePage } from './pages/GenrePage';
import { TagPage } from './pages/TagPage';
import { FloatingMenu } from './components/FloatingMenu';
import { SplashScreen } from './components/SplashScreen';
import { InstallPWA } from './components/InstallPWA';
import { applyTheme, getCurrentTheme } from './services/theme';
import { isAuthenticated } from './services/auth';

// Simple placeholder for static pages
const RequestPage = () => (
  <div className="container mx-auto px-4 py-12 text-center text-white min-h-[60vh]">
    <h1 className="text-3xl font-bold mb-4">Request A Movie</h1>
    <p className="text-gray-400 mb-8">Join our Telegram channel or use the floating button to request!</p>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Security Component to handle Right Click Logic
const SecurityHandler = () => {
  const location = useLocation();

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Allow context menu ONLY if the path contains 'admin'
      if (!location.pathname.includes('admin')) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [location]);

  return null;
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Apply saved theme on boot
    const savedTheme = getCurrentTheme();
    applyTheme(savedTheme);

    // Splash Screen Timer
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); // 2.5 seconds match the CSS animation

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <HashRouter>
      <SecurityHandler />
      <div className="flex flex-col min-h-screen bg-brand-dark text-brand-text font-sans selection:bg-brand-red selection:text-white transition-colors duration-500 animate-fade-in">
        <Header />
        <main className="flex-grow">
          <Routes>
            {/* Standard Routes (MUST be defined before the generic /:slug route) */}
            <Route index element={<Home />} />
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Admin Route */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } />
            
            <Route path="/search" element={<SearchPage />} />
            <Route path="/category/:name" element={<CategoryPage />} />
            <Route path="/genre/:genreName" element={<GenrePage />} />
            <Route path="/tag/:tagName" element={<TagPage />} />
            <Route path="/request" element={<RequestPage />} />

            {/* Movie Route - Catch-all for SEO friendly URLs like example.com/avengers-endgame */}
            {/* This must be near the end to avoid capturing /admin or /search as a slug */}
            <Route path="/:slug" element={<MovieDetails />} />
            
            {/* Fallback for ANY unknown route -> Redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <FloatingMenu />
        <InstallPWA />
      </div>
    </HashRouter>
  );
};

export default App;
