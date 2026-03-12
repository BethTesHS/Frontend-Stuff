// src/components/ProtectedAdminRoute.tsx

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  // Authentication check has been removed.
  // The route will now always allow access to the wrapped components.
  
  return <>{children}</>;
};
