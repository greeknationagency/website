import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  import.meta.env.JWT_SECRET || 'super-secret-fallback-key-replace-in-production'
);

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionCookie(userId: number, email: string): Promise<string> {
  const jwt = await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
    
  return jwt;
}

import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function verifySessionCookie(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Fetch latest user data from DB
    const [user] = await db.select().from(users).where(eq(users.id, payload.userId as number)).limit(1);
    
    if (!user) return null;
    
    return {
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin ?? false
    };
  } catch (error) {
    return null;
  }
}
