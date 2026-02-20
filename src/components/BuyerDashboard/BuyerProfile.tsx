// src/components/BuyerDashboard/BuyerProfile.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const BuyerProfile = ({ user }: { user: any }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-2">Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your account information</p>
      </div>

      <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-3xl">
                {user?.firstName?.[0] || 'B'}{user?.lastName?.[0] || 'Y'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-foreground">{user?.firstName} {user?.lastName}</h3>
            <p className="text-muted-foreground">Buyer</p>
          </div>

          <div className="space-y-4">
            <div className="border-b border-border pb-4">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{user?.email}</p>
            </div>
            <div className="border-b border-border pb-4">
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium text-foreground">{user?.phone || 'Not provided'}</p>
            </div>
            <div className="border-b border-border pb-4">
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium text-foreground">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>

          <div className="mt-8">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Edit Profile</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};