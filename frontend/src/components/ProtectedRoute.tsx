import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  email: string;
  sub: number;
  role: string;
}

interface Props {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin }: Props) {
  const token = localStorage.getItem('access_token');
  
  if (!token) return <Navigate to="/login" replace />;

  if (requireAdmin) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      if (decoded.role !== 'admin') {
        return <Navigate to="/" replace />;
      }
    } catch {
      localStorage.removeItem('access_token');
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}
