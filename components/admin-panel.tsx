import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { deleteUser, delUserClerk, getUsersWithRoles, updateUserRole, getUserStats, checkAdminStatus } from '@/lib/user.actions';
import { Role } from '@prisma/client';
import { Spinner } from './ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface User {
  id: string;
  clerkId: string;
  email: string;
  username: string | null;
  image_url: string | null;
  role: Role;
  credits: number;
}

const AdminPanel: React.FC = () => {
  const { user: currentUser, isLoaded, isSignedIn } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState<{ totalUsers: number; usersByRole: Record<Role, number> } | null>(null);

  useEffect(() => {
    const initializeAdminPanel = async () => {
      if (isLoaded && isSignedIn && currentUser) {
        try {
          const adminStatus = await checkAdminStatus();
          setIsAdmin(adminStatus);
          if (adminStatus) {
            await Promise.all([fetchUsers(), fetchUserStats()]);
          }
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to initialize admin panel.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeAdminPanel();
  }, [isLoaded, isSignedIn, currentUser]);

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await getUsersWithRoles();
      setUsers(fetchedUsers);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users.',
        variant: 'destructive',
      });
    }
  };

  const fetchUserStats = async () => {
    try {
      const stats = await getUserStats();
      setUserStats(stats);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch user statistics.',
        variant: 'destructive',
      });
    }
  };

  const handleRoleChange = async (clerkId: string, newRole: Role) => {
    try {
      await updateUserRole(clerkId, newRole);
      await fetchUsers();
      toast({
        title: 'Success',
        description: 'User role updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user role.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (clerkId: string) => {
    try {
      await deleteUser(clerkId);
      await fetchUsers();
      toast({
        title: 'Success',
        description: 'User removed from the database.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user from database.',
        variant: 'destructive',
      });
    }
  };

  const handleClerkDelete = async (clerkId: string) => {
    try {
      await delUserClerk(clerkId);
      await fetchUsers();
      toast({
        title: 'Success',
        description: 'User removed from Clerk.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user from Clerk.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) return <Spinner />;
  if (!isAdmin) return <div className="p-4 text-center text-red-500">You do not have access to this page.</div>;

  const chartData = userStats ? Object.entries(userStats.usersByRole).map(([role, count]) => ({ role, count })) : [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <Tabs defaultValue="dashboard">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle>User Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Total Users: {userStats?.totalUsers}</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.username || 'N/A'}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={user.role}
                      onValueChange={(value) => handleRoleChange(user.clerkId, value as Role)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="MODERATOR">Moderator</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{user.credits}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleDelete(user.clerkId)} variant="destructive" className="mr-2">Delete from DB</Button>
                    <Button onClick={() => handleClerkDelete(user.clerkId)} variant="outline">Delete from Clerk</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;