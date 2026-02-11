import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Clock, Monitor, Shield, Activity } from 'lucide-react';
import { adminApi, type AdminProfile, type AdminSession } from '@/services/adminApi';
import { useToast } from '@/hooks/use-toast';

export const AdminProfileComponent = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getProfile();
      setProfile(data.admin);
      setSessions(data.recent_sessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadAllSessions = async () => {
    try {
      const allSessions = await adminApi.getSessions();
      setSessions(allSessions);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load sessions',
        variant: 'destructive'
      });
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      await adminApi.revokeSession(sessionId);
      toast({
        title: 'Success',
        description: 'Session revoked successfully'
      });
      loadAllSessions();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to revoke session',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Admin Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Username</label>
              <p className="text-sm font-mono">{profile.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm">{profile.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-sm">{profile.first_name} {profile.last_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <Badge variant="secondary" className="ml-0">
                <Shield className="w-3 h-3 mr-1" />
                {profile.role}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Badge variant={profile.is_active ? "default" : "destructive"} className="ml-0">
                {profile.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Login Count</label>
              <p className="text-sm">{profile.login_count} times</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p className="text-sm">{new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Login</label>
              <p className="text-sm">
                {profile.last_login_at ? new Date(profile.last_login_at).toLocaleString() : 'Never'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Recent Sessions
          </CardTitle>
          <Button variant="outline" size="sm" onClick={loadAllSessions}>
            View All Sessions
          </Button>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sessions found</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm font-medium">Session {session.id}</span>
                      {session.is_current && (
                        <Badge variant="default" className="text-xs">Current</Badge>
                      )}
                      <Badge variant={session.is_active ? "default" : "secondary"} className="text-xs">
                        {session.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {!session.is_current && session.is_active && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => revokeSession(session.id)}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">IP:</span> {session.ip_address}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {new Date(session.created_at).toLocaleString()}
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium">User Agent:</span> {session.user_agent}
                    </div>
                    {session.logged_out_at && (
                      <div>
                        <span className="font-medium">Logged out:</span> {new Date(session.logged_out_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};