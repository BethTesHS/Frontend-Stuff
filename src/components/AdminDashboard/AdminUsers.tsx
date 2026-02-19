import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, CheckCircle, UserX, Search, UserMinus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspensionType, setSuspensionType] = useState<'temp' | 'perm'>('temp');
  const [suspensionReason, setSuspensionReason] = useState('');
  const [suspensionDays, setSuspensionDays] = useState('30');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    loadUsers();
  }, [currentPage, roleFilter, statusFilter, userSearchQuery]);

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const { adminApi } = await import('@/services/adminApi');

      const response = await adminApi.getUsers({
        page: currentPage,
        limit: itemsPerPage,
        search: userSearchQuery || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });

      if (response.success && response.users) {
        setUsers(response.users);
        setTotalUsers(response.total || response.users.length);
        setTotalPages(response.pages || Math.ceil((response.total || response.users.length) / itemsPerPage));
      } else {
        toast({
          title: "Error",
          description: "Failed to load users from API.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load users from API.",
        variant: "destructive"
      });
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSuspendUser = (user: any, type: 'temp' | 'perm') => {
    setSelectedUser(user);
    setSuspensionType(type);
    setSuspendDialogOpen(true);
  };

  const confirmSuspendUser = async () => {
    if (!selectedUser) return;
    try {
      const { adminApi } = await import('@/services/adminApi');
      const newStatus = suspensionType === 'temp' ? 'suspended_temp' : 'suspended_perm';
      let suspendedUntil;

      if (suspensionType === 'temp') {
        const days = parseInt(suspensionDays) || 30;
        const date = new Date();
        date.setDate(date.getDate() + days);
        suspendedUntil = date.toISOString().split('T')[0];
      }

      const response = await adminApi.suspendUser(selectedUser.id, suspensionType, suspensionReason, suspendedUntil);

      if (response.success) {
        setUsers(prev => prev.map(u =>
          u.id === selectedUser.id ? { ...u, status: newStatus, suspendedUntil, suspensionReason } : u
        ));
        toast({
          title: suspensionType === 'temp' ? "User Temporarily Suspended" : "User Permanently Suspended",
          description: `${selectedUser.name} has been suspended ${suspensionType === 'temp' ? `for ${suspensionDays} days` : 'permanently'}.`,
          variant: "destructive"
        });
        setSuspendDialogOpen(false);
        setSuspensionReason('');
        setSuspensionDays('30');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to suspend user",
        variant: "destructive"
      });
    }
  };

  const handleUnsuspendUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    try {
      const { adminApi } = await import('@/services/adminApi');
      const response = await adminApi.unsuspendUser(userId);

      if (response.success) {
        setUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, status: 'active', suspendedUntil: undefined, suspensionReason: undefined } : u
        ));
        toast({
          title: "User Unsuspended",
          description: `${user.name} has been reactivated.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to unsuspend user",
        variant: "destructive"
      });
    }
  };

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 dark:border-gray-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  const activeUsersCount = users.filter(u => u.status === 'active').length;
  const suspendedUsersCount = users.filter(u => u.status === 'suspended_temp' || u.status === 'suspended_perm').length;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'agent': return 'default';
      case 'owner': return 'secondary';
      case 'buyer': return 'outline';
      case 'tenant': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusBadge = (user: any) => {
    if (user.status === 'active') {
      return <Badge className="bg-green-600 dark:bg-green-700">Active</Badge>;
    } else if (user.status === 'suspended_temp') {
      return <Badge variant="destructive">Suspended (Temp)</Badge>;
    } else if (user.status === 'suspended_perm') {
      return <Badge className="bg-red-900 dark:bg-red-950">Suspended (Perm)</Badge>;
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{users.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{activeUsersCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Suspended Users</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{suspendedUsersCount}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={userSearchQuery}
                  onChange={(e) => {
                    setUserSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="agent">Agent</option>
                <option value="owner">Owner</option>
                <option value="buyer">Buyer</option>
                <option value="tenant">Tenant</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {totalUsers > 0 ? (
                <>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users</>
              ) : (
                <>No users found</>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800 dark:text-gray-100">
              <Users className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No users found</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800/30 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* User Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">
                              {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-800 dark:text-gray-200">{user.name}</h3>
                              <Badge variant={getRoleBadgeColor(user.role)}>
                                {user.role.toUpperCase()}
                              </Badge>
                              {getStatusBadge(user)}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-500">Joined</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{user.joinedDate}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-500">Last Active</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{user.lastActive}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-500">Properties</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{user.properties}</p>
                          </div>
                          {user.suspendedUntil && (
                            <div>
                              <p className="text-gray-500 dark:text-gray-500">Suspended Until</p>
                              <p className="font-medium text-red-600 dark:text-red-400">{user.suspendedUntil}</p>
                            </div>
                          )}
                        </div>

                        {user.suspensionReason && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                              <p className="text-sm text-red-800 dark:text-red-300">
                                <strong>Suspension Reason:</strong> {user.suspensionReason}
                              </p>
                            </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {user.status === 'active' ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="dark:border-gray-600 dark:text-gray-300"
                              onClick={() => handleSuspendUser(user, 'temp')}
                            >
                              <UserMinus className="w-4 h-4 mr-1" />
                              Suspend Temp
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleSuspendUser(user, 'perm')}
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              Suspend Perm
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
                            onClick={() => handleUnsuspendUser(user.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Unsuspend
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="dark:border-gray-600 dark:text-gray-300"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1))
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={currentPage === page
                              ? "bg-blue-600 hover:bg-blue-700 text-white min-w-[2.5rem]"
                              : "dark:border-gray-600 dark:text-gray-300 min-w-[2.5rem]"
                            }
                          >
                            {page}
                          </Button>
                        </div>
                      ))
                    }
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="dark:border-gray-600 dark:text-gray-300"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">
              {suspensionType === 'temp' ? 'Temporarily Suspend User' : 'Permanently Suspend User'}
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">User</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedUser.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
              </div>

              {suspensionType === 'temp' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Suspension Duration (days)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={suspensionDays}
                    onChange={(e) => setSuspensionDays(e.target.value)}
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Reason for Suspension *
                </label>
                <Textarea
                  placeholder="Please provide a detailed reason for the suspension..."
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  rows={4}
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                />
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  <strong>Warning:</strong> {suspensionType === 'temp'
                    ? `This user will be suspended for ${suspensionDays} days and will not be able to access their account during this period.`
                    : 'This user will be permanently suspended and will not be able to access their account unless manually unsuspended.'}
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSuspendDialogOpen(false);
                    setSuspensionReason('');
                    setSuspensionDays('30');
                  }}
                  className="dark:border-gray-600 dark:text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmSuspendUser}
                  disabled={!suspensionReason.trim()}
                >
                  {suspensionType === 'temp' ? 'Suspend Temporarily' : 'Suspend Permanently'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};