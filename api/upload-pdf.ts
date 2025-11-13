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
    // Get the file from the request
    const contentType = req.headers['content-type'] || '';

    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Invalid content type' });
    }

    // Parse multipart form data manually
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) {
      return res.status(400).json({ error: 'No boundary found' });
    }

    // Read the body
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);

    // Parse the multipart data
    const parts = parseMultipart(body, boundary);
    const filePart = parts.find(p => p.filename);

    if (!filePart || !filePart.data) {
      return res.status(400).json({ error: 'No file found' });
    }

    // Get filename from the form data or generate one
    const filename = filePart.filename || `pdf-${Date.now()}.pdf`;
    const userId = parts.find(p => p.name === 'userId')?.data?.toString() || 'unknown';

    // Upload to Vercel Blob
    const blob = await put(`pdfs/${userId}/${filename}`, filePart.data, {
      access: 'public',
      contentType: 'application/pdf',
    });

    return res.status(200).json({
      url: blob.url,
      pathname: blob.pathname,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload file' });
  }
}

// Simple multipart parser
function parseMultipart(buffer: Buffer, boundary: string) {
  const parts: Array<{ name?: string; filename?: string; data?: Buffer; contentType?: string }> = [];
  const boundaryBuffer = Buffer.from(`--${boundary}`);

  let start = 0;
  while (start < buffer.length) {
    const boundaryIndex = buffer.indexOf(boundaryBuffer, start);
    if (boundaryIndex === -1) break;

    const nextBoundaryIndex = buffer.indexOf(boundaryBuffer, boundaryIndex + boundaryBuffer.length);
    if (nextBoundaryIndex === -1) break;

    const part = buffer.slice(boundaryIndex + boundaryBuffer.length, nextBoundaryIndex);

    // Find double CRLF that separates headers from body
    const doubleCRLF = Buffer.from('\r\n\r\n');
    const headerEndIndex = part.indexOf(doubleCRLF);

    if (headerEndIndex !== -1) {
      const headers = part.slice(0, headerEndIndex).toString();
      const data = part.slice(headerEndIndex + doubleCRLF.length, part.length - 2); // Remove trailing CRLF

      const nameMatch = headers.match(/name="([^"]+)"/);
      const filenameMatch = headers.match(/filename="([^"]+)"/);
      const contentTypeMatch = headers.match(/Content-Type: (.+)/i);

      parts.push({
        name: nameMatch ? nameMatch[1] : undefined,
        filename: filenameMatch ? filenameMatch[1] : undefined,
        data,
        contentType: contentTypeMatch ? contentTypeMatch[1].trim() : undefined,
      });
    }

    start = nextBoundaryIndex;
  }

  return parts;
}
