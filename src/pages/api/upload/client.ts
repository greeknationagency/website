import type { APIRoute } from 'astro';
import { handleUpload } from '@vercel/blob/client';
import { verifySessionCookie } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: import.meta.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname) => {
        // Authenticate the user
        const token = cookies.get('auth_token')?.value;
        if (!token) {
          throw new Error('Unauthorized');
        }

        const user = await verifySessionCookie(token);
        if (!user || !user.isAdmin) {
          throw new Error('Forbidden: Only admins can upload gallery media.');
        }

        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm'],
          tokenPayload: JSON.stringify({ userId: user.userId }),
        };
      }
    });

    return new Response(JSON.stringify(jsonResponse), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
};
