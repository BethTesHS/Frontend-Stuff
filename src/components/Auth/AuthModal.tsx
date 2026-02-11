
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import AuthModalHeader from './AuthModalHeader';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      onClose();

      const redirectPath = localStorage.getItem('login_redirect_path') || '/select-role';
      localStorage.removeItem('login_redirect_path');

      navigate(redirectPath);
    } catch (error) {
      toast.error('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (data: SignupData) => {
    setLoading(true);
    try {
      await register(data);
      toast.success('Account created successfully!');
      onClose();
      navigate('/select-role');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl border-none shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-8">
        <AuthModalHeader isLogin={isLogin} />

        {isLogin ? (
          <LoginForm onSubmit={handleLogin} loading={loading} />
        ) : (
          <SignupForm onSubmit={handleSignup} loading={loading} />
        )}

        <div className="text-center pt-6 border-t border-[#F5F6FA] mt-6">
          <p className="text-sm text-[#333333]/70 font-['Inter']">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={switchMode}
              className="text-[#1E73E8] hover:text-[#0056B3] font-semibold transition-colors duration-300"
            >
              {isLogin ? 'Sign up here' : 'Sign in here'}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
