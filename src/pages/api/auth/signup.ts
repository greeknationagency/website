import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { users } from '../../../db/schema';
import { hashPassword, createSessionCookie } from '../../../lib/auth';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const data = await request.formData();
    const firstName = data.get('firstName')?.toString();
    const lastName = data.get('lastName')?.toString();
    const email = data.get('email')?.toString();
    const password = data.get('password')?.toString();
    const school = data.get('school')?.toString();
    const affiliation = data.get('affiliation')?.toString();

    if (!firstName || !lastName || !email || !password) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return new Response(JSON.stringify({ error: 'Email already exists' }), { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    // Insert user
    const [newUser] = await db.insert(users).values({
      name: `${firstName} ${lastName}`,
      email,
      passwordHash,
      school,
      affiliation,
    }).returning();

    // Create session cookie
    const token = await createSessionCookie(newUser.id, newUser.email);
    
    cookies.set('auth_token', token, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
