
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AuthModalHeaderProps {
  isLogin: boolean;
}

const AuthModalHeader = ({ isLogin }: AuthModalHeaderProps) => {
  return (
    <DialogHeader className="text-center space-y-4">
      {/* Logo and Brand */}
      <div className="mx-auto flex items-center justify-center gap-3 mb-2">
        <img
          src="/logo.svg"
          alt="Homed Logo"
          className="h-12 w-auto mix-blend-darken"
          style={{ backgroundColor: 'transparent' }}
        />
        <span className="text-3xl font-bold text-[#1E73E8] font-['Poppins']">Homed</span>
      </div>

      {/* Title */}
      <DialogTitle className="text-2xl font-bold text-[#333333] font-['Poppins']">
        {isLogin ? 'Welcome back!' : 'Create your account'}
      </DialogTitle>

      {/* Subtitle */}
      <p className="text-sm text-[#333333]/70 font-['Inter']">
        {isLogin
          ? 'Sign in to continue your home search journey'
          : 'Join thousands of users finding their perfect home'
        }
      </p>
    </DialogHeader>
  );
};

export default AuthModalHeader;
