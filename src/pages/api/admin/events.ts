import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { events } from '../../../db/schema';
import { verifySessionCookie } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('auth_token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const user = await verifySessionCookie(token);
    if (!user || !user.isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const data = await request.formData();
    const title = data.get('title')?.toString();
    const eventDateStr = data.get('eventDate')?.toString();
    const location = data.get('location')?.toString();
    const description = data.get('description')?.toString();
    const ticketLink = data.get('ticketLink')?.toString();
    const imageUrl = data.get('imageUrl')?.toString();

    if (!title || !eventDateStr) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const eventDate = new Date(eventDateStr);

    await db.insert(events).values({
      title,
      eventDate,
      location,
      description,
      ticketLink,
      imageUrl,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
