
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, LogOut } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface UserActionsProps {
  onLogout: () => void;
}

const UserActions = ({ onLogout }: UserActionsProps) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate('/login');
      setIsLoading(false);
    }, 300);
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <div className="hidden md:flex items-center gap-3">
        {isAuthenticated ? (
          <button
            onClick={onLogout}
            className="px-7 py-2.5 border-2 border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-600 hover:text-white transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        ) : (
          <>
            <button
              onClick={handleLoginClick}
              disabled={isLoading}
              className="px-5 py-2 border-2 border-blue-900 text-blue-900 font-semibold rounded-lg hover:bg-blue-900 hover:text-white transition"
            >
              {isLoading ? 'Loading...' : 'Login'}
            </button>
            <Link to="/register">
              <button className="px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition shadow-md">
                Sign up
              </button>
            </Link>
          </>
        )}
      </div>
    </>
  );
};

export default UserActions;
