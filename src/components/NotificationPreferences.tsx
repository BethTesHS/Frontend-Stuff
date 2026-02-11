import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { notificationApi, type NotificationPreferences } from '@/services/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const NotificationPreferencesComponent = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await notificationApi.getPreferences();
      if (response.success && response.data) {
        setPreferences(response.data.preferences);
      }
    } catch (error) {
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!preferences) return;

    setSaving(true);
    try {
      const response = await notificationApi.updatePreferences(updates);
      if (response.success) {
        setPreferences({ ...preferences, ...updates });
        toast.success('Notification preferences updated');
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast.error('Failed to update notification preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !preferences) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-gray-400" />
          <p className="text-gray-500">Loading preferences...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Types</h3>
          
          <div className="flex items-center justify-between">
            <span>Booking notifications</span>
            <Switch
              checked={preferences.booking_notifications}
              onCheckedChange={(checked) => updatePreferences({ booking_notifications: checked })}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Complaint notifications</span>
            <Switch
              checked={preferences.complaint_notifications}
              onCheckedChange={(checked) => updatePreferences({ complaint_notifications: checked })}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Viewing notifications</span>
            <Switch
              checked={preferences.viewing_notifications}
              onCheckedChange={(checked) => updatePreferences({ viewing_notifications: checked })}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Inquiry notifications</span>
            <Switch
              checked={preferences.inquiry_notifications}
              onCheckedChange={(checked) => updatePreferences({ inquiry_notifications: checked })}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <span>General notifications</span>
            <Switch
              checked={preferences.general_notifications}
              onCheckedChange={(checked) => updatePreferences({ general_notifications: checked })}
              disabled={saving}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Email Settings</h3>
          
          <div className="flex items-center justify-between">
            <span>Email notifications</span>
            <Switch
              checked={preferences.email_enabled}
              onCheckedChange={(checked) => updatePreferences({ email_enabled: checked })}
              disabled={saving}
            />
          </div>

          {preferences.email_enabled && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Email frequency</label>
              <select
                value={preferences.email_frequency}
                onChange={(e) => updatePreferences({ 
                  email_frequency: e.target.value as 'instant' | 'daily' | 'weekly' 
                })}
                className="w-full p-2 border rounded-md"
                disabled={saving}
              >
                <option value="instant">Instant</option>
                <option value="daily">Daily digest</option>
                <option value="weekly">Weekly digest</option>
              </select>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Push Notifications</h3>
          
          <div className="flex items-center justify-between">
            <span>Browser push notifications</span>
            <Switch
              checked={preferences.push_enabled}
              onCheckedChange={(checked) => updatePreferences({ push_enabled: checked })}
              disabled={saving}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferencesComponent;