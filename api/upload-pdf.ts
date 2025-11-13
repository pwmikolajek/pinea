import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';

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

    const body = req.body as HandleUploadBody;

    // Generate client upload token
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        // Validate that it's a PDF in the right location
        if (!pathname.endsWith('.pdf')) {
          throw new Error('Only PDF files are allowed');
        }

        return {
          allowedContentTypes: ['application/pdf'],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB max
        };
      },
      onUploadCompleted: async () => {
        // Optional: do something after upload completes
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error: any) {
    console.error('Upload URL generation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate upload URL' });
  }
}
