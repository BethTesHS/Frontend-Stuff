
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

interface RegistrationFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

const RegistrationForm = ({ formData, setFormData, onSubmit, loading }: RegistrationFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="firstName" className="text-sm text-gray-700">First name</Label>
          <Input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
            className="mt-1 h-10 border-gray-200 focus:border-primary-500 focus:ring-primary-500"
            placeholder="John"
          />
        </div>
        <div>
          <Label htmlFor="lastName" className="text-sm text-gray-700">Last name</Label>
          <Input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
            className="mt-1 h-10 border-gray-200 focus:border-primary-500 focus:ring-primary-500"
            placeholder="Doe"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email" className="text-sm text-gray-700">Email address</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="mt-1 h-10 border-gray-200 focus:border-primary-500 focus:ring-primary-500"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <Label htmlFor="phone" className="text-sm text-gray-700">Phone number</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="mt-1 h-10 border-gray-200 focus:border-primary-500 focus:ring-primary-500"
          placeholder="+44 7700 900123"
        />
      </div>

      <div>
        <Label htmlFor="password" className="text-sm text-gray-700">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          className="mt-1 h-10 border-gray-200 focus:border-primary-500 focus:ring-primary-500"
          placeholder="Create a strong password"
        />
      </div>

      <div>
        <Label htmlFor="confirmPassword" className="text-sm text-gray-700">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          required
          className="mt-1 h-10 border-gray-200 focus:border-primary-500 focus:ring-primary-500"
          placeholder="Confirm your password"
        />
      </div>

      <Button
        type="submit"
        className="w-full h-11 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium mt-6"
        disabled={loading}
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
};

export default RegistrationForm;
