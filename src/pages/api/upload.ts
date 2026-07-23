import type { APIRoute } from 'astro';
import { put } from '@vercel/blob';
import { verifySessionCookie } from '../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('auth_token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const user = await verifySessionCookie(token);
    // Only admins can upload files for now, but you could allow artists/users later
    if (!user || !user.isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    // Ensure BLOB_READ_WRITE_TOKEN is present
    if (!import.meta.env.BLOB_READ_WRITE_TOKEN) {
      return new Response(JSON.stringify({ error: 'Blob storage is not configured.' }), { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      token: import.meta.env.BLOB_READ_WRITE_TOKEN
    });

    return new Response(JSON.stringify({ url: blob.url }), { status: 200 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
