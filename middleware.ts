import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware((auth) => {
  auth().protect();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};