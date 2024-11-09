import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { userId } = await getAuth(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the host from the request headers
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const host = request.headers.get('host') || 'localhost:3000';
  
  const response = await fetch(`${protocol}://${host}/api/userdata/${userId}`);
  const data = await response.json();
  
  const isAdmin = data.user.role === 'ADMIN';
  return NextResponse.json({ userId, isAdmin });
}