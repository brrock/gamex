import prisma from "@/db/prisma";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { Role, User } from "@prisma/client";

// Custom error class for user operations
export class UserOperationError extends Error {
  constructor(
    message: string,
    public operation: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'UserOperationError';
  }
}

// Types
export interface CreateUserInput {
  clerkId: string;
  email: string;
  username: string | null;
  image_url: string;
}

export interface UserStats {
  totalUsers: number;
  usersByRole: Record<Role, number>;
}

// Input validation
function validateClerkId(clerkId: string): void {
  if (!clerkId?.trim()) {
    throw new UserOperationError('ClerkId is required', 'validation');
  }
}

// User operations
export async function createUser(input: CreateUserInput): Promise<User> {
  try {
    const newUser = await prisma.user.create({
      data: {
        clerkId: input.clerkId,
        email: input.email,
        username: input.username,
        image_url: input.image_url,
        role: 'USER', // Default role
      },
    });
    return newUser;
  } catch (error) {
    throw new UserOperationError(
      'Failed to create user',
      'create',
      error
    );
  }
}

export async function getUsersWithRoles(): Promise<User[]> {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return users;
  } catch (error) {
    throw new UserOperationError(
      'Failed to fetch users',
      'fetch',
      error
    );
  }
}

export async function updateUserRole(clerkId: string, newRole: Role): Promise<User> {
  try {
    validateClerkId(clerkId);
    
    const updatedUser = await prisma.user.update({
      where: { clerkId },
      data: { role: newRole },
    });
    return updatedUser;
  } catch (error) {
    throw new UserOperationError(
      'Failed to update user role',
      'update',
      error
    );
  }
}

export async function deleteUser(clerkId: string): Promise<{ database: User; clerk: boolean }> {
  try {
    validateClerkId(clerkId);

    // Delete from database first
    const deletedFromDb = await prisma.user.delete({
      where: { clerkId },
    });

    // Then delete from Clerk
    let clerkDeletionSuccessful = false;
    try {
      await clerkClient.users.deleteUser(clerkId);
      clerkDeletionSuccessful = true;
    } catch (clerkError) {
      console.error('Failed to delete user from Clerk:', clerkError);
      // Don't throw here - we still want to return the database deletion result
    }

    return {
      database: deletedFromDb,
      clerk: clerkDeletionSuccessful,
    };
  } catch (error) {
    throw new UserOperationError(
      'Failed to delete user',
      'delete',
      error
    );
  }
}

export async function getUserStats(): Promise<UserStats> {
  try {
    const userCountsByRole = await prisma.user.groupBy({
      by: ['role'],
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

    const totalUsers = Object.values(roleCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    return {
      totalUsers,
      usersByRole: roleCounts,
    };
  } catch (error) {
    throw new UserOperationError(
      'Failed to fetch user statistics',
      'stats',
      error
    );
  }
}

export async function checkAdminStatus(): Promise<boolean> {
  const userid = await fetch("/api/user")
    .then((res) => res.json())
    .then((data) => data.userId);
  console.log(userid)
  const userdata = await fetch(`/api/userdata/${userid}`)
  .then((res) => res.json())
  .then((data) => data.role);
  return userdata === 'ADMIN';
}