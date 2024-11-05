/* eslint-disable camelcase */
import { createUser, deleteUser, updateUser } from "@/db/user.actions";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  try {
    const eventType = evt.type;
    const { id } = evt.data;

    if (!id) {
      return new Response("No user ID provided", { status: 400 });
    }

    switch (eventType) {
      case "user.created": {
        const { email_addresses, image_url, username } = evt.data;
        
        if (!email_addresses?.[0]?.email_address) {
          console.error("No email address found for user");
          return new Response("No email address found", { status: 400 });
        }

        const user = {
          clerkId: id,
          email: email_addresses[0].email_address,
          username: username || null,
          image_url: image_url || "/default-avatar.png",
        };

        const newUser = await createUser(user);

        if (!newUser) {
          console.error("Failed to create user in database");
          try {
            await fetch(`https://api.clerk.com/v1/users/${id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
                'Content-Type': 'application/json'
              }
            });
          } catch (error) {
            console.error("Error deleting Clerk user:", error);
          }
          return new Response("Failed to create user", { status: 500 });
        }

        try {
          await fetch(`https://api.clerk.com/v1/users/${id}/metadata`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              public_metadata: {
                userId: newUser.id
              }
            })
          });
        } catch (error) {
          console.error("Error updating Clerk metadata:", error);
        }

        return NextResponse.json({ message: "User created", user: newUser });
      }

      case "user.updated": {
        const { image_url, username } = evt.data;

        const user = {
          username: username || null,
          image_url: image_url || "/default-avatar.png",
        };

        const updatedUser = await updateUser(id, user);
        return NextResponse.json({ message: "User updated", user: updatedUser });
      }

      case "user.deleted": {
        const deletedUser = await deleteUser(id);
        return NextResponse.json({ message: "User deleted", user: deletedUser });
      }

      default:
        return new Response(`Unhandled webhook event: ${eventType}`, { status: 400 });
    }
  } catch (error) {
    console.error(`Webhook error:`, error);
    return new Response("Internal server error", { status: 500 });
  }
}