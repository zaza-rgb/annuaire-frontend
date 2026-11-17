import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [splashDone, setSplashDone] = useState(splashAlreadySeen);

  return (
    <LanguageGate>
      {!splashDone && <Splash onDone={() => setSplashDone(true)} />}
      <Navbar />
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
      </Routes>
      <Footer />
    </LanguageGate>
  );
}