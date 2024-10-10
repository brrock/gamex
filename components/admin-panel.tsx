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
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState<{ totalUsers: number; usersByRole: Record<Role, number> } | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn && currentUser) {
      checkAdminAccess(currentUser.id);
    }
  }, [isLoaded, isSignedIn, currentUser]);

  const checkAdminAccess = async (clerkId: string) => {
    try {
      const adminStatus = await checkAdminStatus(clerkId);
      setIsAdmin(adminStatus);
      if (adminStatus) {
        fetchUsers();
        fetchUserStats();
      }
      setIsLoading(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify admin status.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

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
      fetchUsers();
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
      await deleteUser(clerkId); // Removes user from DB
      fetchUsers();
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
      await delUserClerk(clerkId); // Removes user from Clerk
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
  if (!isAdmin) return <div>You do not have access to this page.</div>;

  return (
    <div className="flex">
      <main className="flex-1">
        <header className="p-4 bg-gray-200">
          <h1>Admin Panel</h1>
        </header>
        <section>
          <Button onClick={() => setActiveSection('dashboard')}>Dashboard</Button>
          <Button onClick={() => setActiveSection('users')}>Users</Button>
        </section>
        <section>
          {activeSection === 'dashboard' && (
            <Card>
              <CardHeader>
                <CardTitle>Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <h2>User Statistics</h2>
                  <p>Total Users: {userStats?.totalUsers}</p>
                  <ul>
                    {Object.entries(userStats?.usersByRole || {}).map(([role, count]) => (
                      <li key={role}>
                        {role}: {count}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
          {activeSection === 'users' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
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
                    <TableCell>{user.id}</TableCell>
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
                      <Button onClick={() => handleDelete(user.clerkId)}>Delete from DB</Button>
                      <Button onClick={() => handleClerkDelete(user.clerkId)}>Delete from Clerk</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminPanel;
