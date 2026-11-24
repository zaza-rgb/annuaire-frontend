import { Navigate, useLocation } from 'react-router-dom';
import Forbidden from '../pages/Forbidden.jsx';

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

// Route protégée par rôle (checklist, ligne 43).
//   <ProtectedRoute>                          : il suffit d'être connecté
//   <ProtectedRoute roles={['admin']}>        : réservée aux administrateurs
//   <ProtectedRoute roles={['merchant']}>     : réservée aux commerçants
// Sans jeton : renvoi vers /login. Mauvais rôle : page « Accès refusé ».
// Ce contrôle ne sert qu'à l'affichage : c'est l'API (401 / 403) qui protège les données.
export default function ProtectedRoute({ roles, children }) {
  const location = useLocation();

  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (roles?.length && !roles.includes(readUser()?.role)) {
    return <Forbidden />;
  }
  return children;
}
