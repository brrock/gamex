import prisma from "@/db/prisma";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { Role } from "@prisma/client";

// Create a new user in the database
export async function createUser(user: {
  clerkId: string;
  email: string;
  username: string | null;
  image_url: string;
}) {
  try {
    const newUser = await prisma.user.create({
      data: {
        clerkId: user.clerkId,
        email: user.email,
        username: user.username,
        image_url: user.image_url,
      },
    });
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

// Fetch users with their roles
export async function getUsersWithRoles() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        clerkId: true,
        email: true,
        username: true,
        role: true,
        credits: true,
        image_url: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching users with roles:", error);
    return [];
  }
}

// Update user role
export async function updateUserRole(clerkId: string, newRole: Role) {
  try {
    const updatedUser = await prisma.user.update({
      where: { clerkId },
      data: { role: newRole },
    });
    return updatedUser;
  } catch (error) {
    console.error("Error updating user role:", error);
    return null;
  }
}

// Delete a user from the database
export async function deleteUser(clerkId: string) {
  try {
    const deletedUser = await prisma.user.delete({
      where: { clerkId },
    });
    return deletedUser;
  } catch (error) {
    console.error("Error deleting user from database:", error);
    return null;
  }
}

// Delete a user from Clerk
export async function delUserClerk(clerkId: string) {
  try {
    await clerkClient.users.deleteUser(clerkId);
    return { message: `User with Clerk ID ${clerkId} deleted from Clerk.` };
  } catch (error) {
    console.error("Error deleting user from Clerk:", error);
    return null;
  }
}

// Get user statistics (counts by role)
export async function getUserStats() {
  try {
    const userCountsByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: {
        role: true,
      },
    });

    const roleCounts: Record<Role, number> = {
      USER: 0,
      ADMIN: 0,
      MODERATOR: 0,
    };

    userCountsByRole.forEach((roleData) => {
      roleCounts[roleData.role] = roleData._count.role;
    });

    const totalUsers = Object.values(roleCounts).reduce((sum, count) => sum + count, 0);

    return { totalUsers, usersByRole: roleCounts };
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    return null;
  }
}


export async function checkAdminStatus(clerkId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { role: true },
  });

  return user?.role === 'ADMIN';
}