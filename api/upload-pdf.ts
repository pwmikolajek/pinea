import { put } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if Blob token is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN is not set');
      return res.status(500).json({ error: 'Storage not configured. Please enable Vercel Blob in your project settings.' });
    }

    const filename = req.query.filename as string;
    const userId = req.query.userId as string;

    if (!filename || !userId) {
      return res.status(400).json({ error: 'Missing filename or userId' });
    }

    // Read the request body as a buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Upload to Vercel Blob
    const blob = await put(`pdfs/${userId}/${filename}`, buffer, {
      access: 'public',
      contentType: 'application/pdf',
    });

    return res.status(200).json({
      url: blob.url,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload file' });
  }
}
