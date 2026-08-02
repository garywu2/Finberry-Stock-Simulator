import { ReactElement, useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import UserContext from '@/context/user';

// Guards authenticated-only routes. `user` is seeded synchronously from
// localStorage in useAuthListener, so a signed-in user is not bounced on
// refresh. Logged-out visitors are redirected to /Login instead of rendering a
// page that dereferences `user.email` and crashes.
export default function ProtectedRoute({ children }: { children: ReactElement }) {
  const ctx = useContext(UserContext);
  const user = ctx?.user;
  const location = useLocation();

  if (!user) {
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }
  return children;
}
