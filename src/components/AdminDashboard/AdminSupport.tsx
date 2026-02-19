import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bot, FileText } from 'lucide-react';
import { AdminProfileComponent } from '@/components/Admin/AdminProfile';

interface AdminSupportProps {
  stats: any;
}

export const AdminSupport = ({ stats }: AdminSupportProps) => {
  return (
    <div className="space-y-6">
      <AdminProfileComponent />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800 dark:text-gray-100">
              <Bot className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
              Chatbot Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Bot Status: <span className="text-gray-800 dark:text-gray-200">Active</span></p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Response Rate: <span className="text-gray-800 dark:text-gray-200">97%</span></p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg Response Time: <span className="text-gray-800 dark:text-gray-200">1.2s</span></p>
            </div>
            <div className="space-y-2">
              <Button size="sm" className="w-full bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600">Update Knowledge Base</Button>
              <Button size="sm" variant="outline" className="w-full dark:border-gray-600 dark:text-gray-300">View Chat Logs</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800 dark:text-gray-100">
              <FileText className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Server Status</span>
                <Badge className="bg-gray-700 dark:bg-gray-600">Online</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Database</span>
                <Badge className="bg-gray-700 dark:bg-gray-600">Healthy</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">File Storage</span>
                <Badge className="bg-gray-700 dark:bg-gray-600">Available</Badge>
              </div>
              {stats && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Admin Sessions</span>
                  <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">{stats.active_sessions} active</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};