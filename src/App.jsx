import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LanguageGate from './components/LanguageGate.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Splash, { splashAlreadySeen } from './components/Splash.jsx';
import Home from './pages/Home.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';
import Explore from './pages/Explore.jsx';
import BusinessDetail from './pages/BusinessDetail.jsx';
import NotFound from './pages/NotFound.jsx';
import Messages from './pages/Messages.jsx';

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" replace />;
}

// Remonte en haut de la page à chaque changement de page
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const [splashDone, setSplashDone] = useState(splashAlreadySeen);
  const { pathname } = useLocation();

  return (
    <LanguageGate>
      {!splashDone && <Splash onDone={() => setSplashDone(true)} />}
      <ScrollToTop />
      <Navbar />
      {/* La clé relance une courte animation d'entrée à chaque changement de page */}
      <div key={pathname} className="route-fade">
        <Routes>
          <Route path="/" element={<Home ready={splashDone} />} />
          <Route path="/businesses" element={<Explore />} />
          <Route path="/businesses/:id" element={<BusinessDetail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
          <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
          <Route path="/messages/:id" element={<PrivateRoute><Messages /></PrivateRoute>} />
        </Routes>
      </div>
      <Footer />
    </LanguageGate>
  );
}