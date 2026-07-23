import { defineMiddleware } from 'astro:middleware';
import { verifySessionCookie } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const token = context.cookies.get('auth_token')?.value;
  const isDashboard = context.url.pathname.startsWith('/dashboard');
  const isAdminRoute = context.url.pathname.startsWith('/admin');

  if (isDashboard || isAdminRoute) {
    if (!token) {
      return context.redirect('/login');
    }
    
    const user = await verifySessionCookie(token);
    if (!user) {
      context.cookies.delete('auth_token', { path: '/' });
      return context.redirect('/login');
    }
    
    if (isAdminRoute && !user.isAdmin) {
      return context.redirect('/dashboard/profile');
    }
    
    context.locals.user = user;
  } else if (token) {
    // If they have a token on a public page, populate locals anyway
    const user = await verifySessionCookie(token);
    if (user) {
      context.locals.user = user;
    }
  }

  return next();
});
