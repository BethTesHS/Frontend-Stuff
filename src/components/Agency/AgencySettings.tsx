import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Upload, 
  Moon, 
  Sun, 
  Mail, 
  Bell, 
  Shield, 
  Users,
  Building2,
  Palette,
  Settings2,
  UserPlus,
  Trash2,
  Edit,
  LogOut,
  Save,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAgency } from '@/contexts/AgencyContext';
import { tokenStorage } from '@/utils/tokenStorage';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'manager';
  avatar?: string;
  joinDate: string;
  lastActive: string;
}

export function AgencySettings() {
  const navigate = useNavigate();
  const { agency } = useAgency();
  
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  
  // Agency settings state
  const [agencySettings, setAgencySettings] = useState({
    name: agency?.name || '',
    description: '',
    email: agency?.contact?.email || '',
    phone: agency?.contact?.phone || '',
    address: '',
    website: '',
    logo: agency?.logo || ''
  });

  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    role: 'admin' as 'admin' | 'manager'
  });

  // Mock admins data
  const [admins, setAdmins] = useState<Admin[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@agency.com',
      role: 'owner',
      avatar: '/placeholder-avatar.jpg',
      joinDate: '2023-01-01',
      lastActive: 'Online now'
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      email: 'sarah@agency.com',
      role: 'admin',
      joinDate: '2023-03-15',
      lastActive: '2 hours ago'
    }
  ]);

  const handleSaveAgencySettings = () => {
    // Mock save functionality
    toast.success('Agency settings saved successfully');
  };

  const handleLogoUpload = () => {
    // Mock logo upload
    toast.success('Logo uploaded successfully');
  };

  const handleAddAdmin = () => {
    if (!newAdmin.name || !newAdmin.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    const admin: Admin = {
      id: Date.now().toString(),
      ...newAdmin,
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: 'Just joined'
    };

    setAdmins([...admins, admin]);
    setNewAdmin({ name: '', email: '', role: 'admin' });
    setIsAddAdminOpen(false);
    toast.success('Admin added successfully');
  };

  const handleRemoveAdmin = (adminId: string) => {
    setAdmins(admins.filter(admin => admin.id !== adminId));
    toast.success('Admin removed successfully');
  };

  const handleLogout = () => {
    // Mock logout functionality
    tokenStorage.removeItem('user');
    tokenStorage.removeItem('agencyToken');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-500';
      case 'admin': return 'bg-blue-500';
      case 'manager': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const canRemoveAdmin = (admin: Admin) => {
    return admin.role !== 'owner';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your agency settings and preferences</p>
        </div>
        
        <Dialog open={isLogoutConfirmOpen} onOpenChange={setIsLogoutConfirmOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Confirm Logout
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Are you sure you want to logout? You will need to login again to access the dashboard.</p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsLogoutConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agency Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Agency Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Agency Logo</Label>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={agencySettings.logo} />
                  <AvatarFallback>
                    {agencySettings.name.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" onClick={handleLogoUpload}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Logo
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="agencyName">Agency Name</Label>
                <Input
                  id="agencyName"
                  value={agencySettings.name}
                  onChange={(e) => setAgencySettings({...agencySettings, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="agencyEmail">Email</Label>
                <Input
                  id="agencyEmail"
                  type="email"
                  value={agencySettings.email}
                  onChange={(e) => setAgencySettings({...agencySettings, email: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="agencyPhone">Phone</Label>
                <Input
                  id="agencyPhone"
                  value={agencySettings.phone}
                  onChange={(e) => setAgencySettings({...agencySettings, phone: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="agencyWebsite">Website</Label>
                <Input
                  id="agencyWebsite"
                  value={agencySettings.website}
                  onChange={(e) => setAgencySettings({...agencySettings, website: e.target.value})}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              
              <div>
                <Label htmlFor="agencyDescription">Description</Label>
                <Textarea
                  id="agencyDescription"
                  value={agencySettings.description}
                  onChange={(e) => setAgencySettings({...agencySettings, description: e.target.value})}
                  placeholder="Describe your agency..."
                  rows={3}
                />
              </div>
            </div>

            <Button onClick={handleSaveAgencySettings} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <div className="space-y-6">
          {/* Theme & Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Theme & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    Dark Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in browser
                  </p>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Edit className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Settings2 className="w-4 h-4 mr-2" />
                Two-Factor Authentication
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Admin Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Admin Management
          </CardTitle>
          
          <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Admin</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="adminName">Full Name</Label>
                  <Input
                    id="adminName"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                    placeholder="Enter admin's full name"
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail">Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="adminRole">Role</Label>
                  <select
                    id="adminRole"
                    value={newAdmin.role}
                    onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value as 'admin' | 'manager'})}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddAdminOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddAdmin}>
                    Add Admin
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={admin.avatar} />
                    <AvatarFallback>
                      {admin.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{admin.name}</h4>
                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                    <p className="text-xs text-muted-foreground">Last active: {admin.lastActive}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={getRoleColor(admin.role)}>
                    {admin.role}
                  </Badge>
                  {canRemoveAdmin(admin) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAdmin(admin.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}