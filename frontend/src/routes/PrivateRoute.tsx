import { Navigate } from "react-router-dom";

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = true; // depois você troca por login real

  return isAuthenticated ? children : <Navigate to="/" />;
}