import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LanguageGate from './components/LanguageGate.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Splash, { splashAlreadySeen } from './components/Splash.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import ProfileEdit from './pages/ProfileEdit.jsx';
import Profile from './pages/Profile.jsx';
import Explore from './pages/Explore.jsx';
import BusinessDetail from './pages/BusinessDetail.jsx';
import NotFound from './pages/NotFound.jsx';
import Messages from './pages/Messages.jsx';
import Favorites from './pages/Favorites.jsx';
import Forbidden from './pages/Forbidden.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminQueue from './pages/admin/AdminQueue.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminCatalog from './pages/admin/AdminCatalog.jsx';
import InfoPage from './pages/InfoPage.jsx';
import Events from './pages/Events.jsx';
import EventDetail from './pages/EventDetail.jsx';
import MerchantLayout from './pages/merchant/MerchantLayout.jsx';
import MerchantDashboard from './pages/merchant/MerchantDashboard.jsx';
import MerchantForm from './pages/merchant/MerchantForm.jsx';
import MerchantEdit from './pages/merchant/MerchantEdit.jsx';
import Guide from './pages/Guide.jsx';

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
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/profile/edit" element={<PrivateRoute><ProfileEdit /></PrivateRoute>} />
          <Route path="/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
          <Route path="/messages/:id" element={<PrivateRoute><Messages /></PrivateRoute>} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />

          {/* Guide d'utilisation (public) */}
          <Route path="/guide" element={<Guide />} />

          {/* Espace commerçant : MerchantLayout affiche le menu à gauche, les pages s'affichent à droite.
              Les écrans photos, avis, statistiques, notifications seront ajoutés ici plus tard. */}
          <Route path="/merchant" element={<PrivateRoute><MerchantLayout /></PrivateRoute>}>
            <Route index element={<MerchantDashboard />} />
            <Route path="new" element={<MerchantForm />} />
            <Route path=":id/edit" element={<MerchantEdit />} />
          </Route>

          {/* Espace administrateur */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="businesses" element={<AdminQueue key="businesses" kind="businesses" />} />
            <Route path="reviews" element={<AdminQueue key="reviews" kind="reviews" />} />
            <Route path="photos" element={<AdminQueue key="photos" kind="photos" />} />
            <Route path="reports" element={<AdminQueue key="reports" kind="reports" />} />
            <Route path="claims" element={<AdminQueue key="claims" kind="claims" />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="categories" element={<AdminCatalog kind="categories" key="categories" />} />
            <Route path="countries" element={<AdminCatalog kind="countries" key="countries" />} />
            <Route path="languages" element={<AdminCatalog kind="languages" key="languages" />} />
          </Route>

          <Route path="/about" element={<InfoPage slug="about" />} />
          <Route path="/contact" element={<InfoPage slug="contact" />} />
          <Route path="/privacy" element={<InfoPage slug="privacy" />} />
          <Route path="/terms" element={<InfoPage slug="terms" />} />
          <Route path="/legal" element={<InfoPage slug="legal" />} />

          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </LanguageGate>
  );
}
