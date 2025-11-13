import { put } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import { readFileSync } from 'fs';

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
    // Parse the form data using formidable
    const form = formidable({ multiples: false });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Get the uploaded file
    const fileArray = files.file;
    if (!fileArray || fileArray.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;
    const userIdArray = fields.userId;
    const userId = Array.isArray(userIdArray) ? userIdArray[0] : (userIdArray || 'unknown');

    // Read file content
    const fileContent = readFileSync(file.filepath);
    const filename = file.originalFilename || `pdf-${Date.now()}.pdf`;

    // Upload to Vercel Blob
    const blob = await put(`pdfs/${userId}/${filename}`, fileContent, {
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
