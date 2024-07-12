import type { WebhookEvent } from '@clerk/clerk-sdk-node';
import { Webhook } from 'svix';
import { prisma } from '@/lib/prisma';

export async function handleUserWebhook(request: Request): Promise<Response> {
  try {
    const { type, data } = await request.json() as WebhookEvent;
    const headers = {
      'svix-id': request.headers.get('SVIX-ID') as string,
      'svix-timestamp': request.headers.get('SVIX-TIMESTAMP') as string,
      'svix-signature': request.headers.get('SVIX-SIGNATURE') as string,
    };

    if (!headers['svix-id'] || !headers['svix-timestamp'] || !headers['svix-signature']) {
      return new Response('Missing headers', { status: 400 });
    }

    const signingSecret = process.env.SVIX_USER_HOOK_SIGNING_SECRET || 'defaultSecret';
    const webhook = new Webhook(signingSecret);
    
    try {
      webhook.verify(JSON.stringify(data), headers);
    } catch (error) {
      return new Response('Invalid signature', { status: 400 });
    }

    switch (type) {
      case 'user.created':
        await createUser(data);
        return new Response('User created', { status: 200 });
      case 'user.updated':
        await updateUser(data);
        return new Response('User updated', { status: 200 });
      case 'user.deleted':
        if (data.id === undefined) {
          return new Response('User deleted with undefined id', { status: 400 });
        }
        await deleteUser(data.id);
        return new Response('User deleted', { status: 200 });
      default:
        return new Response('Unhandled webhook event', { status: 400 });
    }
  } catch (error) {
    return new Response('Invalid request body', { status: 400 });
  }
}

async function createUser(data: WebhookEvent['data']) {
  await prisma.user.upsert({
    where: { id: data.id },
    create: {
      id: data.id,
      username: (data as { username: string }).username,
      imageUrl: (data as unknown as { profile_image_url: string | undefined }).profile_image_url ?? '',
    },
    update: {
      username: (data as { username: string }).username,
      imageUrl: (data as unknown as { profile_image_url: string | undefined }).profile_image_url ?? '',
    },
  });
}

async function updateUser(data: WebhookEvent['data']) {
  await prisma.user.update({
    where: { id: data.id },
    data: {
      username: (data as { username: string }).username,
      imageUrl: (data as unknown as { profile_image_url: string | undefined }).profile_image_url ?? '',
    },
  });
}

async function deleteUser(userId: string) {
  await prisma.user.delete({
    where: {
      id: userId,
    },
  });
}

