
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  loading: boolean;
}

const LoginForm = ({ onSubmit, loading }: LoginFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData.email, formData.password);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E8F1FD] border-t-[#1E73E8]"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 mt-6">
      <div className="space-y-2">
        <Label htmlFor="login-email" className="text-sm font-semibold text-[#333333] font-['Inter']">
          Email address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#333333]/40" />
          <Input
            id="login-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="Enter your email"
            className="pl-10 h-12 rounded-lg border-[#F5F6FA] focus:border-[#1E73E8] focus:ring-2 focus:ring-[#1E73E8]/20 transition-all duration-300"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password" className="text-sm font-semibold text-[#333333] font-['Inter']">
            Password
          </Label>
          <a href="#" className="text-xs text-[#1E73E8] hover:text-[#0056B3] font-medium transition-colors duration-300">
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#333333]/40" />
          <Input
            id="login-password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            placeholder="Enter your password"
            className="pl-10 h-12 rounded-lg border-[#F5F6FA] focus:border-[#1E73E8] focus:ring-2 focus:ring-[#1E73E8]/20 transition-all duration-300"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-12 bg-[#1E73E8] hover:bg-[#0056B3] text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 font-['Inter']"
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
};

export default LoginForm;
