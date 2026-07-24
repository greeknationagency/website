import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { media } from '../../../db/schema';
import { verifySessionCookie } from '../../../lib/auth';
import { del } from '@vercel/blob';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('auth_token')?.value;
    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const user = await verifySessionCookie(token);
    if (!user || !user.isAdmin) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

    const body = await request.json();
    const { url, type, title } = body;

    if (!url || !type) {
      return new Response(JSON.stringify({ error: 'Missing url or type' }), { status: 400 });
    }

    await db.insert(media).values({
      url,
      type,
      title: title || 'Gallery Upload',
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('auth_token')?.value;
    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const user = await verifySessionCookie(token);
    if (!user || !user.isAdmin) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing media ID' }), { status: 400 });
    }

    // Fetch the media record to get the URL
    const [mediaRecord] = await db.select().from(media).where(eq(media.id, Number(id))).limit(1);
    
    if (!mediaRecord) {
      return new Response(JSON.stringify({ error: 'Media not found' }), { status: 404 });
    }

    // Delete from Vercel Blob
    if (mediaRecord.url) {
      try {
        await del(mediaRecord.url);
      } catch (blobErr) {
        console.error('Failed to delete blob', blobErr);
        // We continue even if blob deletion fails, to make sure DB is clean
      }
    }

    // Delete from database
    await db.delete(media).where(eq(media.id, Number(id)));

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
