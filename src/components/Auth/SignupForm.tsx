
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Mail, Phone, Lock } from 'lucide-react';

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

interface SignupFormProps {
  onSubmit: (data: SignupData) => Promise<void>;
  loading: boolean;
}

const SignupForm = ({ onSubmit, loading }: SignupFormProps) => {
  const [formData, setFormData] = useState<SignupData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    await onSubmit(formData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E8F1FD] border-t-[#1E73E8]"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="signup-firstName" className="text-sm font-semibold text-[#333333] font-['Inter']">
            First name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#333333]/40" />
            <Input
              id="signup-firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              placeholder="John"
              className="pl-10 h-11 rounded-lg border-[#F5F6FA] focus:border-[#1E73E8] focus:ring-2 focus:ring-[#1E73E8]/20 transition-all duration-300"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-lastName" className="text-sm font-semibold text-[#333333] font-['Inter']">
            Last name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#333333]/40" />
            <Input
              id="signup-lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              placeholder="Doe"
              className="pl-10 h-11 rounded-lg border-[#F5F6FA] focus:border-[#1E73E8] focus:ring-2 focus:ring-[#1E73E8]/20 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-sm font-semibold text-[#333333] font-['Inter']">
          Email address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#333333]/40" />
          <Input
            id="signup-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="john@example.com"
            className="pl-10 h-11 rounded-lg border-[#F5F6FA] focus:border-[#1E73E8] focus:ring-2 focus:ring-[#1E73E8]/20 transition-all duration-300"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-phone" className="text-sm font-semibold text-[#333333] font-['Inter']">
          Phone number
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#333333]/40" />
          <Input
            id="signup-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="07700 900123"
            className="pl-10 h-11 rounded-lg border-[#F5F6FA] focus:border-[#1E73E8] focus:ring-2 focus:ring-[#1E73E8]/20 transition-all duration-300"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-sm font-semibold text-[#333333] font-['Inter']">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#333333]/40" />
          <Input
            id="signup-password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            placeholder="Create a strong password"
            className="pl-10 h-11 rounded-lg border-[#F5F6FA] focus:border-[#1E73E8] focus:ring-2 focus:ring-[#1E73E8]/20 transition-all duration-300"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-confirmPassword" className="text-sm font-semibold text-[#333333] font-['Inter']">
          Confirm password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#333333]/40" />
          <Input
            id="signup-confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            placeholder="Confirm your password"
            className="pl-10 h-11 rounded-lg border-[#F5F6FA] focus:border-[#1E73E8] focus:ring-2 focus:ring-[#1E73E8]/20 transition-all duration-300"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-12 bg-[#1E73E8] hover:bg-[#0056B3] text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 font-['Inter'] mt-2"
        disabled={loading}
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
};

export default SignupForm;
